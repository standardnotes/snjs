export const Environments = {
  Web: 1,
  Desktop: 2,
  Mobile: 3
}

export const Platforms = {
  Ios: 1,
  Android: 2,
  MacWeb: 3,
  MacDesktop: 4,
  WindowsWeb: 5,
  WindowsDesktop: 6,
  LinuxWeb: 7,
  LinuxDesktop: 8
}

export function isEnvironmentWebOrDesktop(environment) {
  return environment === Environments.Web || 
         environment === Environments.Desktop;
}

export function isEnvironmentMobile(environment) {
  return environment === Environments.Mobile;
}
