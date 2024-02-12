import {
  resetAllMocks,
  setupArtifactMocks,
  setupCoreMock,
  setupExecMock,
  setupFsMock,
  setupPingMock
} from './mocking.test'
import * as post from '../src/post'
import { existsSync } from 'fs'

describe('Action Pre', () => {
  let fs: ReturnType<typeof setupFsMock>
  let exec: ReturnType<typeof setupExecMock>['exec']
  let core: ReturnType<typeof setupCoreMock>
  let ping: ReturnType<typeof setupPingMock>['probe']
  let artifact: ReturnType<typeof setupArtifactMocks>['DefaultArtifactClient']

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

  it('Should succeed without log file', async () => {
    await post.run()
    expect(core.info).toBeCalledTimes(1)
    expect(core.setFailed).not.toBeCalled()
    expect(exec).toBeCalledWith('sudo killall', ['openvpn'])
  })

  it('Should succeed with log file', async () => {
    fs.existsSync.mockResolvedValueOnce(true)
    await post.run()
    expect(core.info).toBeCalledTimes(1)
    expect(core.setFailed).not.toBeCalled()
  })

  it('Should succeed with log file & artifact name', async () => {
    fs.existsSync.mockResolvedValueOnce(true)
    core.getInput.mockImplementation((name: string) => {
      if (name === 'log-save-as') return 'artifact-name'
      return ''
    })
    await post.run()
    expect(core.info).toBeCalledTimes(1)
    expect(core.setFailed).not.toBeCalled()
  })

  it('Should warn without log file & artifact name', async () => {
    fs.existsSync.mockResolvedValueOnce(false)
    core.getInput.mockImplementation((name: string) => {
      if (name === 'log-save-as') return 'artifact-name'
      return ''
    })
    await post.run()
    expect(core.info).toBeCalledTimes(1)
    expect(core.setFailed).not.toBeCalled()
    expect(core.warning).toHaveBeenCalledOnce()
  })

  it('Should handle errors', async () => {
    exec.mockRejectedValue('killall failed')
    await post.run()
    expect(core.setFailed).toBeCalledTimes(1)
  })
})
