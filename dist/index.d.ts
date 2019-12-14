export interface MappedConfig {
    [key: string]: any | string | undefined | MappedConfig;
}
export interface TransformFn {
    (envValue: string): any;
}
export declare type TransformTuple = [string, TransformFn];
interface ConfigWithEnvKeys {
    [key: string]: string | TransformTuple | ConfigWithEnvKeys;
}
export interface Config {
    [key: string]: string | TransformTuple | ConfigWithEnvKeys;
}
export interface VerifiedConfig {
    [key: string]: any | string | VerifiedConfig;
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
