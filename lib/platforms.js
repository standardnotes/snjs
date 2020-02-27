export const Environments = {
  Web: 1,
  Desktop: 2,
  Mobile: 3
};

export const Platforms = {
  Ios: 1,
  Android: 2,
  MacWeb: 3,
  MacDesktop: 4,
  WindowsWeb: 5,
  WindowsDesktop: 6,
  LinuxWeb: 7,
  LinuxDesktop: 8
};

export function platformFromString(string) {
  const map = {
    'mac-web': Platforms.MacWeb,
    'mac-desktop': Platforms.MacDesktop,
    'linux-web': Platforms.LinuxWeb,
    'linux-desktop': Platforms.LinuxDesktop,
    'windows-web': Platforms.WindowsWeb,
    'windows-desktop': Platforms.WindowsDesktop,
    'ios': Platforms.Ios,
    'android': Platforms.Android,
  };
  return map[string];
}

export function platformToString(platform) {
  const map = {
    [Platforms.MacWeb]: 'mac-web',
    [Platforms.MacDesktop]: 'mac-desktop',
    [Platforms.LinuxWeb]: 'linux-web',
    [Platforms.LinuxDesktop]: 'linux-desktop',
    [Platforms.WindowsWeb]: 'windows-web',
    [Platforms.WindowsDesktop]: 'windows-desktop',
    [Platforms.Ios]: 'ios',
    [Platforms.Android]: 'android',
  };
  return map[platform];
}

export function environmentToString(environment) {
  const map = {
    [Environments.Web]: 'web',
    [Environments.Desktop]: 'desktop',
    [Environments.Mobile]: 'mobile',
  };
  return map[environment];
}

export function isEnvironmentWebOrDesktop(environment) {
  return environment === Environments.Web ||
    environment === Environments.Desktop;
}

export function isEnvironmentMobile(environment) {
  return environment === Environments.Mobile;
}