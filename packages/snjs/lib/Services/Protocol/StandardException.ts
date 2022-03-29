export class StandardException {
  constructor(public readonly message: string) {
    console.error('StandardException raised: ', message)
  }
}
