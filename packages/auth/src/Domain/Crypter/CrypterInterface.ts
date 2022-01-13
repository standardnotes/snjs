export interface CrypterInterface {
  encrypt(plaintext: string, secretKey: string): Promise<string>
  decrypt(encryptedString: string, secretKey: string): Promise<string>
}
