export interface MappedConfig {
    [key: string]: string | undefined | MappedConfig;
}
interface ConfigWithEnvKeys {
    [key: string]: string | ConfigWithEnvKeys;
}
export interface VerifiedConfig {
    [key: string]: string | VerifiedConfig;
}
export declare function verify(config: ConfigWithEnvKeys, env?: {
    [key: string]: string | undefined;
}): {
    config: MappedConfig;
    errors: string[];
};
export declare function strictVerify(config: ConfigWithEnvKeys, env?: {
    [key: string]: string | undefined;
}): VerifiedConfig;
export {};
