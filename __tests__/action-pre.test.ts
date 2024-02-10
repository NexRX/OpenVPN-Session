/**
 * Unit tests for the action's entrypoint, src/index.ts
 */
import * as pre from '../src/pre'

// Mock the action's entrypoint
const runMock = jest.spyOn(pre, 'run').mockImplementation()

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/action/pre')

    expect(runMock).toHaveBeenCalled()
  })
})
