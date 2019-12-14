export interface MappedConfig {
    [key: string]: any | string | undefined | MappedConfig;
}
export interface TransformFn {
    (envValue: string): any;
}
export declare type TransformTuple = [string, TransformFn];
export interface ConfigWithEnvKeys {
    [key: string]: string | InsertValue | TransformTuple | ConfigWithEnvKeys;
}
export interface VerifiedConfig {
    [key: string]: any | string | VerifiedConfig;
}
declare class InsertValue {
    value: any;
    constructor(value: any);
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
export declare function insert(value: any): InsertValue;
export {};
