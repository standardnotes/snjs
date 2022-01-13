export interface TokenDecoderInterface {
  decodeToken<T>(token: string): T | undefined
}
