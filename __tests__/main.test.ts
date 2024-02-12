import {
  setupFsMock,
  resetAllMocks,
  setupExecMock,
  setupCoreMock,
  probeRes,
  setupPingMock
} from './mocking.test'
import * as main from '../src/main'
import * as b64 from 'js-base64'
import { defaultInputs } from './utils.test'

describe('Action Main', () => {
  let fs: ReturnType<typeof setupFsMock>
  let exec: ReturnType<typeof setupExecMock>['exec']
  let core: ReturnType<typeof setupCoreMock>
  let ping: ReturnType<typeof setupPingMock>['probe']

  beforeAll(() => {
    fs = setupFsMock()
    exec = setupExecMock().exec
    core = setupCoreMock()
    ping = setupPingMock().probe
  })

  beforeEach(resetAllMocks)

  afterAll(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('should finish for inputs default', async () => {
    core.getInput.mockImplementation(defaultInputs)

    ping.mockResolvedValueOnce({
      ...probeRes,
      alive: true
    })

    await main.run()
    expect(core.info).toBeCalledWith('Stating OpenVPN connection process')
    expect(exec).toBeCalledWith('sudo openvpn', [
      '--config',
      'client.ovpn',
      '--log',
      '/tmp/log.txt',
      '--daemon'
    ])
    expect(core.getInput).toBeCalledWith('timeout-address', { required: true })
    expect(core.getInput).toBeCalledWith('timeout-seconds')
    expect(core.setFailed).not.toBeCalled()
  })

  it('should finish with defaults and no log file', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'log-filepath') return ''
      return defaultInputs(name)
    })

    ping.mockResolvedValueOnce({
      ...probeRes,
      alive: true
    })

    await main.run()
    expect(core.info).toBeCalledWith('Stating OpenVPN connection process')
    expect(exec).toBeCalledWith('sudo openvpn', [
      '--config',
      'client.ovpn',
      '--log',
      '/tmp/openvpn.log',
      '--daemon'
    ])
    expect(core.getInput).toBeCalledWith('timeout-address', { required: true })
    expect(core.getInput).toBeCalledWith('timeout-seconds')
    expect(core.setFailed).not.toBeCalled()
  })

  it('should create client from base64', async () => {
    const decoded = 'client file contents \n with new lines'
    const encoded = b64.encode(decoded)
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'ovpn-client-b64':
          return encoded
        case 'ovpn-client':
          return ''
        default:
          return defaultInputs(name)
      }
    })
    fs.promises.mkdir.mockResolvedValue(true)
    fs.promises.writeFile.mockResolvedValue(true)

    expect(await main.getClientPath()).toBe('/tmp/client.ovpn')
    expect(core.getInput).toBeCalledWith('ovpn-client-b64')
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      '/tmp/client.ovpn',
      decoded,
      { flag: 'w+', encoding: 'utf8' }
    )
  })

  it('should create client from base64', async () => {
    const decoded = 'client file contents \n with new lines'
    const encoded = b64.encode(decoded)
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'ovpn-client-b64':
          return encoded
        case 'ovpn-client':
          return ''
        default:
          return defaultInputs(name)
      }
    })
    fs.promises.mkdir.mockRejectedValueOnce(new Error('MkDir error'))

    await expect(main.getClientPath()).rejects.toThrowError(
      'Error during write for OpenVPN client from Base64: MkDir error'
    )
  })

  it('should create client from base64', async () => {
    core.getInput.mockReturnValue('')
    fs.promises.mkdir.mockRejectedValueOnce(new Error('MkDir error'))

    await expect(main.getClientPath()).rejects.toThrowError(
      "No clients were given, must specify either `ovpn-client` or `ovpn-client-b64` in action's inputs"
    )
  })

  it('should handle ping error', async () => {
    core.getInput.mockImplementation(defaultInputs)

    ping
      .mockResolvedValueOnce({
        ...probeRes,
        alive: false
      })
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce({
        ...probeRes,
        alive: false
      })
      .mockResolvedValueOnce({
        ...probeRes,
        alive: true
      })

    await expect(main.run()).resolves.toBeFalsy()
    expect(core.info).toBeCalled()
    expect(exec).toBeCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
    expect(ping).toBeCalledTimes(4)
  })

  it('should handle ping error + timeout', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'timeout-seconds') return 4
      return defaultInputs(name)
    })
    ping.mockRejectedValueOnce(new Error('Timeout'))
    exec.mockReturnValue(0)

    await expect(main.run()).resolves.toBeFalsy()
    expect(core.info).toBeCalled()
    expect(exec).toBeCalled()
    expect(core.setFailed).toHaveBeenCalledOnce()
  })
})
