import * as core from '@actions/core'
import * as b64 from 'js-base64'
import { promises as fs } from 'fs';
import * as ping from 'ping'
import { getInput } from './util.js'
import { match } from 'ts-pattern'
import { exec } from '@actions/exec'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('Stating OpenVPN connection process')
  try {
    const path = getClientPath()

    await exec('sudo openvpn', [
      '--config',
      await path,
      '--log',
      getInput('log-filepath'),
      '--daemon'
    ])

    await pingUntilSuccessful(
      getInput('timeout-address'),
      getInput('timeout-seconds')
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * Returns the path to the OpenVPN client file (created too if base64).
 * Returning an error if inputs are invalid (or file can't be created).
 * @returns {string} The path to the OpenVPN client file.
 */
export async function getClientPath(): Promise<string> {
  let client = getInput('ovpn-client')
  if (client) {
    return client
  }

  client = getInput('ovpn-client-b64')
  if (client) {
    const path = '/tmp'
    const filename = 'client.ovpn'
    const filepath = `${path}/${filename}`
    client = b64.decode(client)

    try {
      await fs.mkdir(path, { recursive: true })
      await fs.writeFile(filepath, client, { flag: 'w+', encoding: 'utf8' })
    } catch (error) {
      const msg = match(typeof error)
        .with('string', () => error)
        .with('object', () => {
          const err = error as Record<string, string>
          return 'message' in err ? err.message : 'Unknown error'
        })
        .otherwise(v => `Unknown error (${v})`)

      throw new Error(
        `Error during write for OpenVPN client from Base64: ${msg}`
      )
    }

    return filepath
  }

  throw new Error(
    "No clients were given, must specify either `ovpn-client` or `ovpn-client-b64` in action's inputs"
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
      console.error(`Connection/Ping to ${addr} failed:`, error)
    }

    // Wait for a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error(
    `Timeout reached without a successful connection to ${addr} after ${timeoutSeconds} seconds.`
  )
}
