import * as pre from '../src/pre.js'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

let mockInfo = vi.spyOn(core, 'info')
let mockSetFailed = vi.spyOn(core, 'setFailed')

let mockExec = vi.spyOn(exec, 'exec')

function reset() {
  mockInfo.mockReset()
  mockSetFailed.mockReset()

  mockExec.mockReset()
}

describe('pre run', () => {
  beforeEach(reset)

  it('succeeds typically', async () => {
    await expect(pre.run).not.toThrow()
    expect(mockInfo).toHaveBeenCalled()
    expect(mockExec).toBeCalledTimes(2)
    expect(mockSetFailed).toBeCalledTimes(0)
  })

  it('handles failures (error)', async () => {
    mockExec.mockRejectedValue(new Error('message'))

    await expect(pre.run).not.toThrow()
  })
})
