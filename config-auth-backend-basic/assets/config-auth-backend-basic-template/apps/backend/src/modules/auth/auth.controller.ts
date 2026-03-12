import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  FindUserByEmailUseCase,
  FindUserByIdUseCase,
  LoginUseCase,
  PasswordErrors,
  UserErrors,
} from '__AUTH_PACKAGE_NAME__';
import type {
  ChangePasswordIn,
  CreateUserIn,
  LoginIn,
  UserDTO,
} from '__AUTH_PACKAGE_NAME__';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { BcryptProvider } from './providers/bcrypt.provider';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordPrisma } from './password.prisma';
import { RequireAdmin } from './require-admin.decorator';
import { RequireAdminGuard } from './require-admin.guard';
import { UserPrisma } from './user.prisma';

type UpdateUserPayload = Partial<
  Pick<CreateUserIn, 'name' | 'email' | 'avatarUrl'>
>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userPrisma: UserPrisma,
    private readonly passPrisma: PasswordPrisma,
    private readonly jwtService: JwtService,
    private readonly bcryptProvider: BcryptProvider,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dados: LoginIn): Promise<{ token: string }> {
    const uc = new LoginUseCase(
      this.userPrisma,
      this.passPrisma.findPasswordHashQuery,
      this.bcryptProvider,
    );

    const res = await uc.execute(dados);
    if (res.isFailure) {
      throw new UnauthorizedException({ errors: res.errors });
    }

    const payload = {
      sub: res.instance.id,
      name: res.instance.name,
      email: res.instance.email,
      admin: res.instance.admin ?? false,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() dados: CreateUserIn & { confirmPassword: string }) {
    if (dados.password !== dados.confirmPassword) {
      throw new BadRequestException({ errors: [PasswordErrors.MISMATCH] });
    }

    const uc = new CreateUserUseCase(
      this.userPrisma,
      this.passPrisma,
      this.userPrisma.userExistsQuery,
      this.bcryptProvider,
    );

    const result = await uc.execute({
      name: dados.name,
      email: dados.email,
      password: dados.password,
      avatarUrl: dados.avatarUrl?.trim() || undefined,
    });

    if (result.isFailure) {
      throw new BadRequestException({ errors: result.errors });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: UserDTO) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin()
  @Get('users')
  async getUsers(
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    const page = this.parsePositiveInteger(pageRaw, 1);
    const pageSize = this.parsePositiveInteger(pageSizeRaw, 10);

    const result = await this.userPrisma.findAllUsers({ page, pageSize });
    if (result.isFailure) {
      throw new InternalServerErrorException({ errors: result.errors });
    }

    return result.instance;
  }

  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin()
  @Get('users/by-email')
  async getUserByEmail(@Query('email') email?: string) {
    if (!email) {
      throw new BadRequestException({ errors: ['EMAIL_IS_REQUIRED'] });
    }

    const uc = new FindUserByEmailUseCase(this.userPrisma.findUserByEmailQuery);
    const result = await uc.execute(email);

    if (result.isFailure) {
      throw new NotFoundException({ errors: result.errors });
    }

    return result.instance;
  }

  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin()
  @Patch('users/:id')
  @HttpCode(204)
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserPayload,
  ): Promise<void> {
    const hasName =
      typeof data.name === 'string' && data.name.trim().length > 0;
    const hasEmail =
      typeof data.email === 'string' && data.email.trim().length > 0;
    const hasAvatar =
      typeof data.avatarUrl === 'string' && data.avatarUrl.trim().length > 0;

    if (!hasName && !hasEmail && !hasAvatar) {
      throw new BadRequestException({ errors: ['USER_UPDATE_EMPTY_PAYLOAD'] });
    }

    const existingUser = await this.userPrisma.findById(id);
    if (existingUser.isFailure) {
      if (existingUser.errors?.includes(UserErrors.NOT_FOUND)) {
        throw new NotFoundException({ errors: existingUser.errors });
      }

      throw new InternalServerErrorException({ errors: existingUser.errors });
    }

    const userToUpdate = existingUser.instance.clone({
      name: hasName ? data.name!.trim() : existingUser.instance.name,
      email: hasEmail
        ? data.email!.trim().toLowerCase()
        : existingUser.instance.email,
      avatarUrl: hasAvatar
        ? data.avatarUrl!.trim()
        : existingUser.instance.avatarUrl,
      updatedAt: new Date(),
    });

    if (userToUpdate.isFailure) {
      throw new BadRequestException({ errors: userToUpdate.errors });
    }

    const result = await this.userPrisma.update(userToUpdate.instance);
    if (result.isFailure) {
      if (result.errors?.includes(UserErrors.NOT_FOUND)) {
        throw new NotFoundException({ errors: result.errors });
      }

      if (result.errors?.includes(UserErrors.EMAIL_ALREADY_EXISTS)) {
        throw new BadRequestException({ errors: result.errors });
      }

      throw new InternalServerErrorException({ errors: result.errors });
    }
  }

  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin({ allowSelfByParam: 'id' })
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const uc = new FindUserByIdUseCase(this.userPrisma.findUserByIdQuery);
    const result = await uc.execute(id);

    if (result.isFailure) {
      throw new NotFoundException({ errors: result.errors });
    }

    return result.instance;
  }

  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin()
  @Delete('users/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const uc = new DeleteUserUseCase(this.userPrisma);
    const result = await uc.execute({ id });

    if (result.isFailure) {
      if (result.errors?.includes(UserErrors.NOT_FOUND)) {
        throw new NotFoundException({ errors: result.errors });
      }

      throw new InternalServerErrorException({ errors: result.errors });
    }
  }

  @Post('user/create')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RequireAdminGuard)
  @RequireAdmin()
  async create(@Body() dados: CreateUserIn): Promise<void> {
    const uc = new CreateUserUseCase(
      this.userPrisma,
      this.passPrisma,
      this.userPrisma.userExistsQuery,
      this.bcryptProvider,
    );

    const result = await uc.execute(dados);

    if (result.isFailure) {
      throw new BadRequestException({ errors: result.errors });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password/change')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: UserDTO,
    @Body() data: Omit<ChangePasswordIn, 'userId'>,
  ): Promise<void> {
    const uc = new ChangePasswordUseCase(
      this.passPrisma,
      this.userPrisma.userExistsQuery,
      this.bcryptProvider,
    );

    const result = await uc.execute({ ...data, userId: user.id! });

    if (result.isFailure) {
      if (result.errors?.includes(UserErrors.NOT_FOUND)) {
        throw new NotFoundException({ errors: result.errors });
      }

      throw new BadRequestException({ errors: result.errors });
    }
  }

  private parsePositiveInteger(
    value: string | undefined,
    fallback: number,
  ): number {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return fallback;
    }

    return Math.floor(parsedValue);
  }
}
