"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('env-verify', () => {
    describe('verify', () => {
        it('matches flat objects values to provided source keys', () => {
            const env = {
                DB_HOST: 'localhost:3000',
                DB_NAME: 'postgres'
            };
            const flatConfig = {
                dbHost: 'DB_HOST',
                dbName: 'DB_NAME'
            };
            const expected = {
                dbHost: 'localhost:3000',
                dbName: 'postgres'
            };
            const results = index_1.verify(flatConfig, env);
            expect(results.config).toEqual(expected);
        });
        it("matches nested object's values to provided env keys", () => {
            const env = {
                c: 'C',
                d: 'D',
                e: 'E'
            };
            const nestedConfig = {
                1: {
                    2: {
                        3: 'c'
                    },
                    4: 'd'
                },
                5: 'e'
            };
            const expected = {
                1: {
                    2: {
                        3: 'C'
                    },
                    4: 'D'
                },
                5: 'E'
            };
            const results = index_1.verify(nestedConfig, env);
            expect(results.config).toEqual(expected);
        });
        describe('with missing values', () => {
            it('should return an error string', () => {
                const env = {
                    PRESENT: 'present'
                };
                const config = {
                    1: 'PRESENT',
                    2: 'MISSING',
                    3: {
                        6: {
                            7: 'MISSING'
                        },
                        4: 'MISSING',
                        5: 'MISSING'
                    }
                };
                const result = index_1.verify(config, env).errors;
                expect(result.length).toEqual(4);
            });
        });
    });
    describe('with transform functions', () => {
        const env = {
            PRESENT: 'present'
        };
        it('allows a tuple with a string and transform function', () => {
            const configObj = {
                present: ['PRESENT', (envVal) => envVal]
            };
            expect(() => index_1.verify(configObj, env)).not.toThrow();
        });
        it('allows the same tuple in a nested object', () => {
            const configObj = {
                nested: {
                    present: ['PRESENT', (envVal) => envVal]
                }
            };
            const result = index_1.verify(configObj, env).config;
            expect(result.nested.present).toEqual(env.PRESENT);
        });
        it('runs the transform function and inserts the transformed value', () => {
            const transformed = ['hi', { there: ['this'] }, 'is', 'transformed'];
            const expected = expect.objectContaining(transformed);
            const configObj = {
                present: ['PRESENT', (_envVal) => transformed]
            };
            const { present: result } = index_1.verify(configObj, env).config;
            expect(result).toEqual(expected);
        });
        it('still returns an error if the env value is missing', () => {
            const configObj = {
                missing: ['MISSING', (envValue) => envValue]
            };
            const { errors } = index_1.verify(configObj, env);
            expect(errors.length).toEqual(1);
        });
        it('does not call the transform function if the env value is missing', () => {
            const transformFn = jest.fn();
            const configObj = {
                missing: ['MISSING', transformFn]
            };
            index_1.verify(configObj, env);
            expect(transformFn).not.toHaveBeenCalled();
        });
    });
    describe('strictVerfiy', () => {
        it('should throw an error on missing .env value', () => {
            const env = {
                a: 'A'
            };
            const config = {
                1: 'a',
                2: 'zz-top',
                3: {
                    6: {
                        7: 'IM_ALSO_MISSING'
                    },
                    4: 'IM_MISSING',
                    5: 'ME_TOO'
                }
            };
            expect(() => index_1.strictVerify(config, env)).toThrowError();
        });
        it('should not throw an error when all .env values are present', () => {
            const env = {
                a: 'A',
                'zz-top': 'ZZ_TOP'
            };
            const config = {
                1: 'a',
                2: 'zz-top'
            };
            const expected = {
                1: 'A',
                2: 'ZZ_TOP'
            };
            expect(index_1.strictVerify(config, env)).toEqual(expected);
        });
    });
    describe('with insert()', () => {
        const env = {
            PRESENT: 'present'
        };
        it('does not error out when called with insert()', () => {
            const configObj = {
                nonEnvValue: index_1.insert('nonEnvValue')
            };
            expect(() => index_1.verify(configObj, env)).not.toThrow();
        });
        it('inserts the given value into config object', () => {
            const configObj = {
                nonEnvValue: index_1.insert('nonEnvValue')
            };
            const { nonEnvValue } = index_1.verify(configObj, env).config;
            expect(nonEnvValue).toEqual('nonEnvValue');
        });
        it('inserts given value in nested config object', () => {
            const configObj = {
                a: {
                    nonEnvValue: index_1.insert('nonEnvValue')
                }
            };
            const { config } = index_1.verify(configObj, env);
            expect(config.a.nonEnvValue).toEqual('nonEnvValue');
        });
    });
    describe('integration of all features', () => {
        const env = {
            PRESENT: 'present'
        };
        it('mixes and matches features across nested config object', () => {
            const mixed = {
                present: 'PRESENT',
                transformed: ['PRESENT', (_value) => 'transformed'],
                inserted: index_1.insert('inserted')
            };
            const configObj = {
                mixed,
                ...mixed
            };
            const expected = expect.objectContaining({
                present: 'present',
                transformed: 'transformed',
                inserted: 'inserted',
                mixed: {
                    present: 'present',
                    transformed: 'transformed',
                    inserted: 'inserted'
                }
            });
            const { config } = index_1.verify(configObj, env);
            expect(config).toEqual(expected);
        });
    });
});
//# sourceMappingURL=index.spec.js.map