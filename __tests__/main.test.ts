import * as main from '../src/main.js'
import * as core from '@actions/core'
import * as b64 from 'js-base64'
import { promises as fs } from 'fs'

let mockGetInput = vi.spyOn(core, 'getInput')
let mockMkDir = vi.spyOn(fs, 'mkdir')
let mockWriteFile = vi.spyOn(fs, 'writeFile')
function reset() {
  mockGetInput.mockReset()
  mockMkDir.mockReset()
  mockWriteFile.mockReset()
}

describe('getClientPath', () => {
  beforeEach(reset)
  afterEach(reset)

  it('returns input path', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'ovpn-client') return 'path'
      return ''
    })
    const path = await main.getClientPath()
    expect(path).toBe('path')
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client')
    expect(mockWriteFile).toHaveBeenCalledTimes(0)
  })

  it('creates client from base64', async () => {
    const decoded = 'base64'
    const encoded = b64.encode(decoded)
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'ovpn-client-b64') return encoded
      return ''
    })
    const path = await main.getClientPath()
    expect(path).toBe('/tmp/client.ovpn')
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client-b64')
    expect(mockWriteFile).toHaveBeenCalledWith('/tmp/client.ovpn', decoded, {
      flag: 'w+',
      encoding: 'utf8'
    })
  })
})

const failIp = '0.255.4.99'
const failMessage = `Timeout reached without a successful connection to ${failIp}`

describe('pingUntilSuccessful', () => {
  beforeEach(reset)
  afterEach(reset)

  it('Succeed to example.com', async () => {
    const ping = await main.pingUntilSuccessful('example.com', 6) // 6 because jest 5s timeout
    expect(ping.alive).toBe(true)
  })

  it('Fail to expected ip', async () => {
    const ping = main.pingUntilSuccessful(failIp, 3)
    await expect(ping).rejects.toThrow(`${failMessage} after ${3} seconds`)
  })
})
