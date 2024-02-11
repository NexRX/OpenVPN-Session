import * as main from '../src/main'

const failIp = '0.255.4.99'
const failMessage = `Timeout reached without a successful connection to ${failIp}`

describe('pingUntilSuccessful', () => {
  it('Succeed to example.com', async () => {
    const ping = await main.pingUntilSuccessful('example.com', 6) // 6 because jest 5s timeout
    expect(ping.alive).toBe(true)
  })

  it('Fail to expected ip', async () => {
    const ping = main.pingUntilSuccessful(failIp, 3)
    await expect(ping).rejects.toThrow(`${failMessage} after ${3} seconds`)
  })
})
