import { errorToMessage } from 'src/util'

describe('Utils', () => {
  it('errorToMessage should return for `Error`', () => {
    const error = new Error('Test Error')
    expect(errorToMessage(error)).toBe(error.message)
  })

  it('errorToMessage should return for `string`', () => {
    const error = 'Test Error'
    expect(errorToMessage(error)).toBe(error)
  })

  it('errorToMessage should return for `unknown`', () => {
    const error = 123
    expect(errorToMessage(error)).toBe('Unknown Error')
  })
})

export function defaultInputs(input: string) {
  switch (input) {
    case 'ovpn-client':
      return 'client.ovpn'
    case 'log-filepath':
      return '/tmp/log.txt'
    case 'timeout-address':
      return 'example.com'
  }
}
