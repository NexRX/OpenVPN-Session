/**
 * Unit tests for the action's entrypoint, src/index.ts
 */
import * as post from '../src/post'

// Mock the action's entrypoint
const runMock = jest.spyOn(post, 'run').mockImplementation()

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/action/post')

    expect(runMock).toHaveBeenCalled()
  })
})
