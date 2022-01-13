export interface TokenEncoderInterface {
  encodeToken<T>(data: T): string
}
