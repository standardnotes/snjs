export interface TokenEncoderInterface<T> {
  encodeToken(data: T): string
}
