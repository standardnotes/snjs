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
  };
  return map[string];
}

export function isEnvironmentWebOrDesktop(environment) {
  return environment === Environments.Web ||
    environment === Environments.Desktop;
}

export function isEnvironmentMobile(environment) {
  return environment === Environments.Mobile;
}