import * as main from '../src/main.js'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as b64 from 'js-base64'
import { promise as ping } from 'ping'
import { promises as fs } from 'fs'

let mockGetInput = vi.spyOn(core, 'getInput')
let mockSetFailed = vi.spyOn(core, 'setFailed')

let mockExec = vi.spyOn(exec, 'exec')

let mockMkDir = vi.spyOn(fs, 'mkdir')
let mockWriteFile = vi.spyOn(fs, 'writeFile')

function reset() {
  mockGetInput.mockReset()
  mockSetFailed.mockReset()

  mockExec.mockReset()

  mockMkDir.mockReset()
  mockWriteFile.mockReset()
}

describe('main run', () => {
  beforeEach(reset)

  it('succeeds with client path & defaults', async () => {
    mockGetInput.mockImplementation((name, option) => {
      if (name === 'ovpn-client') return 'path'
      if (name === 'timeout-address' && option?.required) return 'example.com'
      return ''
    })

    await expect(main.run).not.toThrow()
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client')
    expect(mockGetInput).toHaveBeenCalledWith('log-filepath')
    expect(mockExec).toHaveBeenCalledWith('sudo openvpn', [
      '--config',
      'path',
      '--log',
      '/tmp/openvpn.log',
      '--daemon'
    ])
  })

  it('handles failures (error)', async () => {
    mockGetInput.mockImplementation((name, option) => {
      if (name === 'ovpn-client-b64') return b64.encode('client')
      if (name === 'timeout-address' && option?.required) return 'example.com'
      return ''
    })
    mockExec.mockRejectedValue(new Error('message'))

    await expect(main.run).not.toThrow()
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client-b64')
  })

  it('handles failures (error string)', async () => {
    mockGetInput.mockImplementation((name, option) => {
      if (name === 'ovpn-client-b64') return b64.encode('client')
      if (name === 'timeout-address' && option?.required) return 'example.com'
      return ''
    })
    mockExec.mockRejectedValue('error')

    await expect(main.run).not.toThrow()
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client-b64')
  })

  it('handles failures (error unknown)', async () => {
    mockGetInput.mockImplementation((name, option) => {
      if (name === 'ovpn-client-b64') return b64.encode('client')
      if (name === 'timeout-address' && option?.required) return 'example.com'
      return ''
    })
    mockExec.mockRejectedValue({})

    await expect(main.run).not.toThrow()
    expect(mockGetInput).toHaveBeenCalledWith('ovpn-client-b64')
  })
})

describe('getClientPath', () => {
  beforeEach(reset)

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

  it('handles base 64 error', async () => {
    const decoded = 'base64'
    const encoded = b64.encode(decoded)
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'ovpn-client-b64') return encoded
      return ''
    })
    mockWriteFile.mockRejectedValue('error')

    expect(main.getClientPath).rejects.toThrow('error')
  })

  it('handles no input', async () => {
    mockGetInput.mockImplementation((name: string) => {
      return ''
    })

    await expect(main.getClientPath).rejects.toThrow(
      "No clients were given, must specify either `ovpn-client` or `ovpn-client-b64` in action's inputs"
    )
  })
})

const failIp = '0.255.4.99'
const failMessage = `Timeout reached without a successful connection to ${failIp}`

describe('pingUntilSuccessful', () => {
  beforeEach(reset)

  it('Succeed to example.com', async () => {
    const ping = await main.pingUntilSuccessful('example.com', 6) // 6 because jest 5s timeout
    expect(ping.alive).toBe(true)
  })

  it('Fail to expected ip', async () => {
    const ping = main.pingUntilSuccessful(failIp, 3)
    await expect(ping).rejects.toThrow(`${failMessage} after ${3} seconds`)
  })

  it('Handles probe error', async () => {
    let mockProbe = vi.spyOn(ping, 'probe')
    mockProbe.mockRejectedValueOnce(new Error('error'))
    const doPing = main.pingUntilSuccessful(failIp, 1)
    await expect(doPing).rejects.toThrow(`${failMessage} after ${1} seconds`)
    mockProbe.mockRestore() // THis will cause more problems if this test fails
  })
})
