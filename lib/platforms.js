export const PLATFORM_WEB      = 1;
export const PLATFORM_DESKTOP  = 2;
export const PLATFORM_MOBILE   = 3;

export function isPlatformWebOrDesktop(platform) {
  return platform === PLATFORM_WEB || platform === PLATFORM_DESKTOP;
}

export function isPlatformMobile(platform) {
  return platform === PLATFORM_MOBILE;
}
