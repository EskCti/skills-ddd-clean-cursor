export interface PasswordCryptoProvider {
  hash(password: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
