import { Feature } from './Feature'
import { DockIconType } from './DockIconType'
import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { Flag } from './Flag'
import { PermissionName } from '../Permission/PermissionName'
import { FeatureIdentifier } from './FeatureIdentifier'
import featuresFromJson from './features.json'

type TFeatureItemFromJson = typeof featuresFromJson[0]

const features: Feature[] = []

const validateFeatureItem = (featureItem: TFeatureItemFromJson) => {
  const { identifier, permissionName, contentType, area, flags, dockIcon } = featureItem
  const permissionNames = Object.values(PermissionName)
  const featureIdentifiers = Object.values(FeatureIdentifier)
  const contentTypes = Object.values(ContentType)
  const componentArea = Object.values(ComponentArea)
  const flagTypes = Object.values(Flag)
  const dockIconTypes = Object.values(DockIconType)

  if (!featureIdentifiers.includes(identifier as FeatureIdentifier)) {
    throw Error('Invalid feature identifier')
  }
  if (!permissionNames.includes(permissionName as PermissionName)) {
    throw Error('Invalid permission name')
  }
  if (!contentTypes.includes(contentType as ContentType)) {
    throw Error('Invalid feature content type')
  }
  if (area && !componentArea.includes(area as ComponentArea)) {
    throw Error('Invalid feature area')
  }
  if (flags && flags.some((flag) => !flagTypes.includes(flag as Flag))) {
    throw Error('Invalid feature flag')
  }
  if (dockIcon && !dockIconTypes.includes(dockIcon.type as DockIconType)) {
    throw Error('Invalid dock icon type')
  }
}

for (const featureItem of featuresFromJson) {
  validateFeatureItem(featureItem)
  features.push(featureItem as Feature)
}

export const Features: Feature[] = features
