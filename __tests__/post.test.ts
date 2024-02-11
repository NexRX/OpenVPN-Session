import * as post from '../src/post'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { resetAllMocks, setupArtifactMocks } from './mocking.test'

let mockInfo = vi.spyOn(core, 'info')
let mockGetInput = vi.spyOn(core, 'getInput')
let mockSetFailed = vi.spyOn(core, 'setFailed')
let mockExec = vi.spyOn(exec, 'exec')

describe('Action Pre', () => {
  beforeEach(() => {
    mockInfo.mockReset()
    mockGetInput.mockReset()
    mockSetFailed.mockReset()
    mockExec.mockReset()
    resetAllMocks()
  })

  it('Should succeed typically', async () => {
    await post.run()
    expect(mockInfo).toBeCalledTimes(1)
    expect(mockSetFailed).not.toBeCalled()
  })
})
