export default class StringOrError {
  private isString: boolean
  private isError: boolean
  private stringVal: string
  private errorVal: Error

  constructor(maybeObj: string | Error) {
    this.isString = false

    if (typeof(maybeObj) === 'string') {
      this.isString = true
      this.stringVal = maybeObj as string
    } else {
      this.errorVal = maybeObj as Error
    }
    this.isError = !this.isString
  }

  hasString(): boolean {
    return this.isString
  }

  hasError(): boolean {
    return this.isError
  }

  getString(): string {
    if (this.isError) {
      throw new Error('string is not contained by StringOrError instance')
    }
    return this.stringVal
  }

  getError(): Error {
    if (this.isString) {
      throw new Error('Error is not contained by StringOrError instance')
    }
    return this.errorVal
  }
}