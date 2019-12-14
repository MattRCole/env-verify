import { verify, strictVerify, Config } from './index'

describe('env-verify', () => {
  describe('verify', () => {
    it('matches flat objects values to provided source keys', () => {
      const env = {
        DB_HOST: 'localhost:3000',
        DB_NAME: 'postgres'
      }
      const flatConfig = {
        dbHost: 'DB_HOST',
        dbName: 'DB_NAME'
      }
      const expected = {
        dbHost: 'localhost:3000',
        dbName: 'postgres'
      }
      const results = verify(flatConfig, env)

      expect(results.config).toEqual(expected)
    })

    it("matches nested object's values to provided env keys", () => {
      const env = {
        c: 'C',
        d: 'D',
        e: 'E'
      }
      const nestedConfig = {
        1: {
          2: {
            3: 'c'
          },
          4: 'd'
        },
        5: 'e'
      }
      const expected = {
        1: {
          2: {
            3: 'C'
          },
          4: 'D'
        },
        5: 'E'
      }
      const results = verify(nestedConfig, env)

      expect(results.config).toEqual(expected)
    })
    describe('with missing values', () => {
      it('should return an error string', () => {
        const env = {
          PRESENT: 'present'
        }
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
        }
        const result = verify(config, env).errors

        expect(result.length).toEqual(4)
      })
    })
  })

  describe('with transform functions', () => {
    const env = {
      PRESENT: 'present'
    }
    it('allows a tuple with a string and transform function', () => {
      const configObj: Config = {
        present: ['PRESENT', (envVal: string): any => envVal]
      }

      expect(() => verify(configObj, env)).not.toThrow()
    })

    it('allows the same tuple in a nested object', () => {
      const configObj: Config = {
        nested: {
          present: ['PRESENT', (envVal: string) => envVal]
        }
      }
      const result = verify(configObj, env).config

      expect(result.nested.present).toEqual(env.PRESENT)
    })

    it('runs the transform function and inserts the transformed value', () => {
      const transformed = ['hi', { there: ['this'] }, 'is', 'transformed']
      const expected = expect.objectContaining(transformed)

      const configObj: Config = {
        present: ['PRESENT', (_envVal: string) => transformed]
      }

      const { present: result } = verify(configObj, env).config

      expect(result).toEqual(expected)
    })

    it('still returns an error if the env value is missing', () => {
      const configObj: Config = {
        missing: ['MISSING', (envValue: string) => envValue]
      }

      const { errors } = verify(configObj, env)

      expect(errors.length).toEqual(1)
    })

    it('does not call the transform function if the env value is missing', () => {
      const transformFn = jest.fn()

      const configObj: any = {
        missing: ['MISSING', transformFn]
      }

      verify(configObj, env)

      expect(transformFn).not.toHaveBeenCalled()
    })
  })

  describe('strictVerfiy', () => {
    it('should throw an error on missing .env value', () => {
      const env = {
        a: 'A'
      }
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
      }
      expect(() => strictVerify(config, env)).toThrowError()
    })

    it('should not throw an error when all .env values are present', () => {
      const env = {
        a: 'A',
        'zz-top': 'ZZ_TOP'
      }
      const config = {
        1: 'a',
        2: 'zz-top'
      }
      const expected = {
        1: 'A',
        2: 'ZZ_TOP'
      }

      expect(strictVerify(config, env)).toEqual(expected)
    })
  })
})
