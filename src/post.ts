import * as core from '@actions/core'
import { existsSync } from 'fs'
import { exec } from '@actions/exec'
import { DefaultArtifactClient } from '@actions/artifact'
import { getClientPath } from './main'
import { errorToMessage, getInput } from './util'

/**
 * The post function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Beginning post WireGuard cleanup')
  try {
    const path = getClientPath()
    await exec('sudo wg-quick', ["down", await path])

    const artifactName = getInput('log-save-as')
    if (await logExists()) {
      exec('sudo chmod', ['777', getInput('log-filepath')])

      if (artifactName !== undefined) {
        const split = getInput('log-filepath').split('/')
        const filename = split[split.length - 1]
        const path = getInput('log-filepath').replace(filename, '')

        const client = new DefaultArtifactClient()
        await client.uploadArtifact(artifactName, [filename], path)
      }
    } else if (artifactName) {
      core.warning(
        `Can't artifact logs because missing file ${getInput('log-filepath')}`
      )
    }
  } catch (error) {
    core.setFailed(errorToMessage(error))
  }
}

export async function logExists(): Promise<boolean> {
  const filepath = getInput('log-filepath')
  return existsSync(filepath)
}
