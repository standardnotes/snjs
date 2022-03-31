import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { ProtocolVersion, ProtocolVersionLatest } from '@standardnotes/common'
import { createOperatorForVersion } from './Functions'
import { AnyOperator } from './AnyOperator'

export class OperatorManager {
  private operators: Record<string, AnyOperator> = {}

  constructor(private crypto: SNPureCrypto) {
    this.crypto = crypto
  }

  public deinit(): void {
    ;(this.crypto as unknown) = undefined
    this.operators = {}
  }

  public operatorForVersion(version: ProtocolVersion) {
    const operatorKey = version
    let operator = this.operators[operatorKey]
    if (!operator) {
      operator = createOperatorForVersion(version, this.crypto)
      this.operators[operatorKey] = operator
    }
    return operator
  }

  /**
   * Returns the operator corresponding to the latest protocol version
   */
  public defaultOperator() {
    return this.operatorForVersion(ProtocolVersionLatest)
  }
}
