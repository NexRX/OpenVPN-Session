import {
  resetAllMocks,
  setupCoreMock,
  setupExecMock,
  setupFsMock,
  setupPingMock
} from './mocking.test'
import * as pre from '../src/pre'

describe('Action Pre', () => {
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

  it('Should succeed typically', async () => {
    await pre.run()
    expect(core.info).toBeCalledTimes(2)
    expect(exec).toBeCalledTimes(2)
    expect(core.setFailed).not.toBeCalled()
  })

  it('Should handle error', async () => {
    exec.mockRejectedValue(new Error('Mock Error'))
    await pre.run()
    expect(core.info).toHaveBeenCalledOnce()
    expect(exec).toHaveBeenCalledOnce()
    expect(core.setFailed).toBeCalledWith('Mock Error')
  })
})
