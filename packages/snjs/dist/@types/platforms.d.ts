export declare enum Environment {
    Web = 1,
    Desktop = 2,
    Mobile = 3
}
export declare enum Platform {
    Ios = 1,
    Android = 2,
    MacWeb = 3,
    MacDesktop = 4,
    WindowsWeb = 5,
    WindowsDesktop = 6,
    LinuxWeb = 7,
    LinuxDesktop = 8
}
export declare function platformFromString(string: string): Platform;
export declare function platformToString(platform: Platform): string;
export declare function environmentFromString(string: string): Environment;
export declare function environmentToString(environment: Environment): string;
export declare function isEnvironmentWebOrDesktop(environment: Environment): boolean;
export declare function isEnvironmentMobile(environment: Environment): boolean;
