const version = require('../package.json').version;
export const SnjsVersion = version;

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
export function isRightVersionGreaterThanLeft(left: string, right: string) {
  const oldParts = left.split('.');
  const newParts = right.split('.');
  for (var i = 0; i < newParts.length; i++) {
    /** ~~ parses int */
    const a = ~~newParts[i];
    const b = ~~oldParts[i];
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}