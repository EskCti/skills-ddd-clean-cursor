import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordCryptoProvider } from '__AUTH_PACKAGE_NAME__';

@Injectable()
export class BcryptProvider implements PasswordCryptoProvider {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
