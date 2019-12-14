"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InsertValue {
    constructor(value) {
        this.value = value;
    }
}
const recursiveVerify = ({ config, env, errors = [], path = '' }) => {
    const mapConf = (key) => {
        const value = config[key];
        const subPath = path.length === 0 ? key : `${path}.${key}`;
        const getValueFromEnv = (key) => {
            const envValue = env[key];
            if (envValue === undefined || envValue.length === 0) {
                errors.push(new Error(`environment value ${key} is missing from config object at ${subPath}`));
                return undefined;
            }
            return envValue;
        };
        if (value instanceof InsertValue) {
            return { [key]: value.value };
        }
        else if (Array.isArray(value)) {
            const [envKey, transformFn] = value;
            const envValue = getValueFromEnv(envKey);
            const transforedValue = envValue && transformFn(envValue);
            return { [key]: transforedValue };
        }
        else if (typeof value === 'string') {
            const envValue = getValueFromEnv(value);
            return { [key]: envValue };
        }
        else {
            const { errors: subErrors, config: subConfig } = recursiveVerify({
                config: value,
                env,
                path: subPath
            });
            errors = errors.concat(subErrors);
            return { [key]: subConfig };
        }
    };
    const reduceConf = (acc, obj) => ({
        ...acc,
        ...obj
    });
    const mappedConf = Object.keys(config).map(mapConf);
    const newConfig = mappedConf.reduce(reduceConf, {});
    return { config: newConfig, env, errors, path };
};
function verify(config, env = process.env) {
    const { config: builtConfig, errors } = recursiveVerify({ config, env });
    const errorMessages = errors.map(({ message }) => message);
    return { config: builtConfig, errors: errorMessages };
}
exports.verify = verify;
function strictVerify(config, env = process.env) {
    const { config: builtConfig, errors } = verify(config, env);
    if (errors.length > 0) {
        throw new Error(`Missing configuration values: ${errors.join('\n')}`);
    }
    return builtConfig;
}
exports.strictVerify = strictVerify;
function insert(value) {
    return new InsertValue(value);
}
exports.insert = insert;
//# sourceMappingURL=index.js.map