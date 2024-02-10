import * as core from '@actions/core'
import { exec } from '@actions/exec'
// import { getInput } from './util'

const autoYes = ['--yes', '--force-yes']

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.info('Starting Pre-OpenVPN setup')
    await exec('sudo apt-get', ['update', ...autoYes])
    await exec('sudo apt-get', [
      'install',
      'openvpn',
      '--no-install-recommends',
      ...autoYes
    ])
    core.info('Pre-OpenVPN setup complete')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
