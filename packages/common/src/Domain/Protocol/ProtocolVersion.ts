export enum ProtocolVersion {
  V001 = '001',
  V002 = '002',
  V003 = '003',
  V004 = '004',
}

export const ProtocolExpirationDates: Partial<Record<ProtocolVersion, number>> = Object.freeze({
  [ProtocolVersion.V001]: Date.parse('2018-01-01'),
  [ProtocolVersion.V002]: Date.parse('2020-01-01'),
})

export function isProtocolVersionExpired(version: ProtocolVersion) {
  const expireDate = ProtocolExpirationDates[version]
  if (!expireDate) {
    return false
  }

  const expired = new Date().getTime() > expireDate
  return expired
}
