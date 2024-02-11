import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { errorToMessage } from './util'
// import { getInput } from './util'

const autoYes = ['--yes', '--force-yes']

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Starting Pre-OpenVPN setup')
  try {
    await exec('sudo apt-get', ['update', ...autoYes])
    await exec('sudo apt-get', [
      'install',
      'openvpn',
      '--no-install-recommends',
      ...autoYes
    ])
    return core.info('Pre-OpenVPN setup complete')
  } catch (error) {
    return core.setFailed(errorToMessage(error))
  }
}
