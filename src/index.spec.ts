import verifier from './index'

describe('env-verifier', () => {
  describe('matching values to keys', () => {
    it('matches flat objects values to provided source keys', () => {
      const env = {
        DB_HOST: 'localhost:3000',
        DB_NAME: 'postgres',
      }
      const flatConfig = {
        dbHost: 'DB_HOST',
        dbName: 'DB_NAME',
      }
      const expected = {
        dbHost: 'localhost:3000',
        dbName: 'postgres'
      }
      const results = verifier(flatConfig, {env})

      expect(results.config).toEqual(expected)
    })

    it('matches nested object\'s values to provided env keys', () => {
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
      const results = verifier(nestedConfig, {env})

      expect(results.config).toEqual(expected)
    })
    describe('with missing values', () => {
      it('should exit early', () => {
        const env = {
          a: 'A'
        }
        const config = {
          1: 'a',
          2: 'zz-top'
        }
        expect(verifier(config, {env}))
      })
    })
  })
})


//config.js

// const config = {
//   db: {
//     name: 'DB_NAME',
//     host: 'DB_HOST',
//   }
// }

// module.exports(verifier(config))

// const verifier = (config, options) => {
//   const { env, exitOnError } = options

//   if(errors) {
//     if (exitOnError) {
//       process.exit(1)
//     }
    
//   }
// }