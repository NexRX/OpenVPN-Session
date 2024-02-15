import * as core from '@actions/core'
import * as b64 from 'js-base64'
import * as ping from 'ping'
import { promises as fs } from 'fs'
import { errorToMessage, getInput } from './util'
import { exec } from '@actions/exec'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Stating WireGuard connection process')
  try {
    const path = getClientPath()

    await exec('sudo wg-quick', ["up", await path])

    const addr = getInput('timeout-address')
    const timeout = getInput('timeout-seconds')
    await pingUntilSuccessful(addr, timeout)
  } catch (error) {
    core.setFailed(errorToMessage(error))
  }
}

/**
 * Returns the path to the WireGuard client file (created too if base64).
 * Returning an error if inputs are invalid (or file can't be created).
 * @returns {string} The path to the WireGuard client file.
 */
export async function getClientPath(): Promise<string> {
  let client = getInput('wg-client')
  if (client) {
    return client
  }

  const encodedClient = getInput('wg-client-b64')
  console.log('encodedClient:', encodedClient)
  if (encodedClient) {
    const path = '/tmp'
    const filepath = `${path}/wg.conf`
    const decoded = b64.decode(encodedClient)

    try {
      await fs.mkdir(path, { recursive: true })
      await fs.writeFile(filepath, decoded, { flag: 'w+', encoding: 'utf8' })
    } catch (error) {
      const msg = errorToMessage(error)

      throw new Error(
        `Error during write for WireGuard client from Base64: ${msg}`
      )
    }

    return filepath
  }

  throw new Error(
    "No clients were given, must specify either `wg-client` or `wg-client-b64` in action's inputs"
  )
}

/**
 * Tries to connect to the given address and port until successful or until the timeout is reached.
 * @param {string} ip - The IP address to connect to.
 * @param {number} timeoutSeconds - The timeout in seconds.
 * @returns {Promise<ping.PingResponse>} A promise that resolves if the connection is successful within the timeout, and rejects otherwise.
 */
export async function pingUntilSuccessful(
  addr: string,
  timeoutSeconds: number
): Promise<ping.PingResponse> {
  const timeoutMillis = timeoutSeconds * 1000
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMillis) {
    try {
      const res = await ping.promise.probe(addr)
      if (res.alive) {
        console.log(`Connection/Ping to ${addr} confirmed as successful:`, res)
        return res
      }
    } catch (error) {
      console.error(`Connection/Ping to ${addr} failed but retrying:`, error)
    }

    // Wait for a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 250))
  }

  throw new Error(
    `Timeout reached without a successful connection to ${addr} after ${timeoutSeconds} seconds.`
  )
}
