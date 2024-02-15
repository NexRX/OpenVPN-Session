import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { errorToMessage } from './util'

const autoYes = ['--yes', '--force-yes']

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Starting Pre-WireGuard setup')
  try {
    await exec('sudo apt-get', ['update', ...autoYes])
    await exec('sudo apt-get', [
      'install',
      'wireguard',
      '--no-install-recommends',
      ...autoYes
    ])
    await exec('sudo apt-get', [
      'install',
      'resolvconf',
      '--no-install-recommends',
      ...autoYes
    ])
    return core.info('Pre-WireGuard setup complete')
  } catch (error) {
    return core.setFailed(errorToMessage(error))
  }
}
