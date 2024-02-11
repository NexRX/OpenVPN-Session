import * as post from '../src/post.js'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import fs from 'fs';

const spy = vi.spyOn(fs, 'existsSync').mockImplementation(() => true);

let mockGetInput = vi.spyOn(core, 'getInput')
let mockInfo = vi.spyOn(core, 'info')
let mockWarning = vi.spyOn(core, 'warning')
let mockSetFailed = vi.spyOn(core, 'setFailed')

let mockExec = vi.spyOn(exec, 'exec')

function reset() {
  mockGetInput.mockReset()
  mockInfo.mockReset()
  mockSetFailed.mockReset()

  mockExec.mockReset()
}

describe('post run', () => {
  beforeEach(reset)

  it('succeeds typically', async () => {
    mockExec.mockImplementation(vi.fn())
    mockGetInput.mockImplementation((name, option) => {
      if (name === 'ovpn-client') return 'path'
      if (name === 'timeout-address' && option?.required) return 'example.com'
      if (name === 'log-filepath' && option?.required) return 'test'
      return ''
    })

    await expect(post.run).not.toThrow()
    expect(mockInfo).toHaveBeenCalled()
    expect(mockExec).toHaveBeenCalledWith('sudo killall', ['openvpn'])
    expect(mockExec).not.toHaveBeenCalledWith('sudo chmod', ['777', 'test'])
    expect(mockWarning).not.toHaveBeenCalled()
  })
})
