import * as core from '@actions/core'
import { match, P } from 'ts-pattern'

/**
 * All input types of the action.
 */
type Input = {
  'ovpn-client': string | undefined
  'ovpn-client-b64': string | undefined
  'log-save-as': string | undefined
  'log-filepath': string
  'timeout-ip': string
  'timeout-seconds': number
}

/** Returns a parsed (If needed) value of the types with the correct type */
export function getInput<K extends keyof Input>(name: K): Input[K] {
  // Use the `name` parameter directly to fetch the corresponding input
  return match<keyof Input>(name)
    .with(
      P.union('ovpn-client', 'ovpn-client-b64', 'log-save-as'),
      n => core.getInput(n) || (undefined as Input[typeof n])
    )
    .with(
      'log-filepath',
      n => core.getInput(n) || ('/tmp/openvpn.log' as Input[typeof n])
    )
    .with('timeout-ip', n => core.getInput(n, { required: true }))
    .with('timeout-seconds', n => parseInt(core.getInput(n) || '180'))
    .exhaustive() as Input[K]
}
