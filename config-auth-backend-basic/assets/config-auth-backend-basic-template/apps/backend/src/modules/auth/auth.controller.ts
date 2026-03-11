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
import type { ChangePasswordIn, CreateUserIn, LoginIn, UserDTO } from '__AUTH_PACKAGE_NAME__';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { BcryptProvider } from './providers/bcrypt.provider';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordPrisma } from './password.prisma';
import { UserPrisma } from './user.prisma';

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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const uc = new FindUserByIdUseCase(this.userPrisma.findUserByIdQuery);
    const result = await uc.execute(id);

    if (result.isFailure) {
      throw new NotFoundException({ errors: result.errors });
    }

    return result.instance;
  }

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
}
