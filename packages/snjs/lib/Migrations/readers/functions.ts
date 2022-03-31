import * as readerClasses from '@Lib/Migrations/readers'
import { compareSemVersions, isRightVersionGreaterThanLeft } from '@Lib/version'
import { ApplicationIdentifier } from '@standardnotes/common'
import { Environment } from '@Lib/Application/platforms'
import { DeviceInterface } from '@standardnotes/services'
import { StorageReader } from './reader'

function ReaderClassForVersion(version: string): any {
  /** Sort readers by newest first */
  const allReaders = Object.values(readerClasses).sort((a, b) => {
    return compareSemVersions(a.version(), b.version()) * -1
  })
  for (const reader of allReaders) {
    if (reader.version() === version) {
      return reader
    }
    if (isRightVersionGreaterThanLeft(reader.version(), version)) {
      return reader
    }
  }

  throw Error(`Cannot find reader for version ${version}`)
}

export function CreateReader(
  version: string,
  deviceInterface: DeviceInterface,
  identifier: ApplicationIdentifier,
  environment: Environment,
): StorageReader {
  const readerClass = ReaderClassForVersion(version)
  return new readerClass(deviceInterface, identifier, environment)
}
