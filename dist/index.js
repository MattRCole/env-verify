"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recursiveVerify = ({ config, env, errors = [], path = '' }) => {
    const mapConf = (key) => {
        const value = config[key];
        const subPath = path.length === 0 ? key : `${path}.${key}`;
        if (typeof value === 'string') {
            const envValue = env[value];
            if (envValue === undefined || envValue.length === 0) {
                errors.push(new Error(`environment value ${value} is missing from config object at ${subPath}`));
            }
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
//# sourceMappingURL=index.js.map