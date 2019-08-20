import { verify, strictVerify } from './index'

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
        expect(verify(config, env).errors.length).toEqual(4)
      })
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
