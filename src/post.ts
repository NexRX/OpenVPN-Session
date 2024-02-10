import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { getInput } from './util'
import { DefaultArtifactClient } from '@actions/artifact'

/**
 * The post function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.info('Beginning post OpenVPN cleanup')
    exec('sudo killall', ['openvpn'])
    exec('sudo chmod', ['777', getInput('log-filepath')])

    const artifactName = getInput('log-save-as')
    if (artifactName) {
      const split = getInput('log-filepath').split('/')
      const filename = split[split.length - 1]
      const path = getInput('log-filepath').replace(filename, '')

      const client = new DefaultArtifactClient()
      await client.uploadArtifact(artifactName, [filename], path)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
