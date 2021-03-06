/** Declared in webpack config */
declare const __VERSION__: string;
export const SnjsVersion = __VERSION__;

/**
 * Legacy architecture (pre-3.5 clients)
 */
export const PreviousSnjsVersion1_0_0 = '1.0.0';

/**
 * First release of new architecture, did not automatically store version
 */
export const PreviousSnjsVersion2_0_0 = '2.0.0';

/**
 * Returns true if the version string on the right is greater than the one
 * on the left. Accepts any format version number, like 2, 2.0, 2.0.0, or even 2.0.0.01
 */
export function isRightVersionGreaterThanLeft(
  left: string,
  right: string
): boolean {
  return compareSemVersions(left, right) === -1;
}

/**
 *  -1 if a < b
 *  0 if a == b
 *  1 if a > b
 */
export function compareSemVersions(left: string, right: string): 1 | -1 | 0 {
  const leftParts = left.split('.');
  const rightParts = right.split('.');
  for (let i = 0; i < rightParts.length; i++) {
    /**
     * ~~ parses int
     * Convert to number so that 001 becomes 1
     */
    const rightComp = Number(~~rightParts[i]);
    const leftComp = Number(~~leftParts[i]);
    if (rightComp > leftComp) return -1;
    if (rightComp < leftComp) return 1;
  }

  return 0;
}
