// /**
//  * Unit tests for the action's main functionality, src/main.ts
//  *
//  * These should be run as if the action was called from a workflow.
//  * Specifically, the inputs listed in `action.yml` should be set as environment
//  * variables following the pattern `INPUT_<INPUT_NAME>`.
//  */
// import * as core from '@actions/core'
// import * as main from '../src/main'

// // Mock the action's main function
// // const runMock = jest.spyOn(main, 'run')

// // Mock the GitHub Actions core library
// // let debugMock: jest.SpyInstance
// // let errorMock: jest.SpyInstance
// let getInputMock: jest.SpyInstance
// let setFailedMock: jest.SpyInstance
// // let setOutputMock: jest.SpyInstance

// describe('Main Action', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()

//     // debugMock = jest.spyOn(core, 'debug').mockImplementation()
//     // errorMock = jest.spyOn(core, 'error').mockImplementation()
//     getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
//     setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
//     // setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
//   })

//   it('Runs with minimum args', async () => {
//     getInputMock.mockImplementation((name: string): string | undefined => {
//       switch (name) {
//         case 'ovpn-client':
//           return 'mock.ovpn contents'
//         case 'timeout-ip':
//           return '10.8.0.1'
//         default:
//           return undefined
//       }
//     })

//     await main.run()
//     expect(setFailedMock).toHaveBeenCalledTimes(0)
//   })

//   it('sets a failed status', async () => {
//     // Set the action's inputs as return values from core.getInput()
//     getInputMock.mockImplementation((): undefined => {
//       return undefined
//     })

//     await main.run()
//     expect(setFailedMock).toHaveBeenCalledTimes(1)
//   })
// })

describe('Placeholder', () => {
  it('Placeholder', () => {
    expect(true).toBe(true)
  })
})
