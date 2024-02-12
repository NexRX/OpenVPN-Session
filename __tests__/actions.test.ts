import { setupCoreMock, setupExecMock, setupFsMock } from './mocking.test'

describe('Action Main', () => {
  setupCoreMock()
  setupExecMock()
  setupFsMock()

  afterAll(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('should run main when imported', async () => {
    require('../src/action/main')
  })

  it('should run pre when imported', async () => {
    require('./src/action/pre')
  })

  it('should run post when imported', async () => {
    require('../src/action/post')
  })
})
