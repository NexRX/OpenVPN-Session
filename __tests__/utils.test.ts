import { match, P } from 'ts-pattern'
import { fail } from 'assert'
import { errorToMessage, getInput } from 'src/util'

describe('Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

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

  it('should handle all default inputs', () => {
    const inputs = [
      'ovpn-client',
      'ovpn-client-b64',
      'log-save-as',
      'log-filepath',
      'timeout-seconds'
    ]
    inputs.forEach(input => {
      return match(input)
        .with(P.union('ovpn-client', 'ovpn-client-b64', 'log-save-as'), n =>
          expect(getInput(n)).toBeUndefined()
        )
        .with('log-filepath', n => expect(getInput(n)).toBe('/tmp/openvpn.log'))
        .with('timeout-seconds', n => expect(getInput(n)).toBe(180))
        .otherwise(() => fail("Shouldn't be possible"))
    })
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
