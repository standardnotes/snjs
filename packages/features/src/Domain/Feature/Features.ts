import { FeatureDescription } from './FeatureDescription'
import { FeatureIdentifier } from './FeatureIdentifier'
import { editors } from './Lists/Editors'
import { themes } from './Lists/Themes'
import { serverFeatures } from './Lists/ServerFeatures'
import { clientFeatures } from './Lists/ClientFeatures'
import { GetDeprecatedFeatures } from './Lists/DeprecatedFeatures'
import { experimentalFeatures } from './Lists/ExperimentalFeatures'

export function GetFeatures(): FeatureDescription[] {
  return [...themes(), ...editors(), ...serverFeatures(), ...clientFeatures(), ...experimentalFeatures()]
}

export function FindNativeFeature(identifier: FeatureIdentifier): FeatureDescription | undefined {
  return GetFeatures()
    .concat(GetDeprecatedFeatures())
    .find((f) => f.identifier === identifier)
}
