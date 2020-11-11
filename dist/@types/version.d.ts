export declare const SnjsVersion: any;
/**
 * Legacy architecture (pre-3.5 clients)
 */
export declare const PreviousSnjsVersion1_0_0 = "1.0.0";
/**
 * First release of new architecture, did not automatically store version
 */
export declare const PreviousSnjsVersion2_0_0 = "2.0.0";
/**
 * Returns true if the version string on the right is greater than the one
 * on the left. Accepts any format version number, like 2, 2.0, 2.0.0, or even 2.0.0.01
 */
export declare function isRightVersionGreaterThanLeft(left: string, right: string): boolean;
