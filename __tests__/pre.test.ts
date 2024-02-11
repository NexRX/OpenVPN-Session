import * as pre from '../src/pre'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

let mockInfo = vi.spyOn(core, 'info')
let mockSetFailed = vi.spyOn(core, 'setFailed')
let mockExec = vi.spyOn(exec, 'exec')

describe('Action Pre', () => {
  beforeEach(() => {
    mockInfo.mockReset()
    mockSetFailed.mockReset()
    mockExec.mockReset()
  })

  it('Should succeed typically', async () => {
    await pre.run()
    expect(mockInfo).toBeCalledTimes(2)
    expect(mockExec).toBeCalledTimes(2)
    expect(mockSetFailed).not.toBeCalled()
  })

  it('Should handle error', async () => {
    mockExec.mockRejectedValue(new Error('Mock Error'))
    await pre.run()
    expect(mockInfo).toHaveBeenCalledOnce()
    expect(mockExec).toHaveBeenCalledOnce()
    expect(mockSetFailed).toBeCalledWith('Mock Error')
  })
})
