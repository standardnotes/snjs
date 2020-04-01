export enum Environment {
  Web = 1,
  Desktop = 2,
  Mobile = 3
};

export enum Platform {
  Ios = 1,
  Android = 2,
  MacWeb = 3,
  MacDesktop = 4,
  WindowsWeb = 5,
  WindowsDesktop = 6,
  LinuxWeb = 7,
  LinuxDesktop = 8
};

export function platformFromString(string: string) {
  const map = {
    'mac-web': Platform.MacWeb,
    'mac-desktop': Platform.MacDesktop,
    'linux-web': Platform.LinuxWeb,
    'linux-desktop': Platform.LinuxDesktop,
    'windows-web': Platform.WindowsWeb,
    'windows-desktop': Platform.WindowsDesktop,
    'ios': Platform.Ios,
    'android': Platform.Android,
  };
  return (map as any)[string];
}

export function platformToString(platform: Platform) {
  const map = {
    [Platform.MacWeb]: 'mac-web',
    [Platform.MacDesktop]: 'mac-desktop',
    [Platform.LinuxWeb]: 'linux-web',
    [Platform.LinuxDesktop]: 'linux-desktop',
    [Platform.WindowsWeb]: 'windows-web',
    [Platform.WindowsDesktop]: 'windows-desktop',
    [Platform.Ios]: 'ios',
    [Platform.Android]: 'android',
  };
  return map[platform];
}

export function environmentToString(environment: Environment) {
  const map = {
    [Environment.Web]: 'web',
    [Environment.Desktop]: 'desktop',
    [Environment.Mobile]: 'mobile',
  };
  return map[environment];
}

export function isEnvironmentWebOrDesktop(environment: Environment) {
  return environment === Environment.Web ||
    environment === Environment.Desktop;
}

export function isEnvironmentMobile(environment: Environment) {
  return environment === Environment.Mobile;
}