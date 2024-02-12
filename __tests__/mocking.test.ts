///////////////// COMMON /////////////////

export function resetAllMocks() {
  vi.resetAllMocks()
}

/////////////////// FS ///////////////////

import * as fsimport from 'fs'

describe('fs promises mock', () => {
  const fs = setupFsMock()
  beforeEach(resetAllMocks)

  it('should read file using mocked readFile', async () => {
    fs.promises.readFile.mockResolvedValue('yo')
    await expect(fs.promises.readFile()).resolves.toBe('yo')
    await expect(fs.promises.readFile()).not.resolves.toBe('something else')
  })

  it('should have unmocked function(s) be undefined', async () => {
    expect(fs.stat).toBe(undefined)
  })
})

/**
 * Mocks the entire fs package but the return is only the promises section
 * @returns The promises section of the fs package
 */
export function setupFsMock() {
  vi.mock('fs', FsMocks)

  return fsimport as unknown as ReturnType<typeof FsMocks>
}

function FsMocks() {
  return {
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn()
    },
    existsSync: vi.fn(),
    mkdir: vi.fn(),
    stat: undefined
  }
}

////////////////// EXEC //////////////////

import * as execimport from '@actions/exec'
const exec = setupExecMock().exec

describe('exec mock', () => {
  beforeEach(resetAllMocks)

  it('should register calls to exec', async () => {
    exec.mockResolvedValue(123)
    await exec()
    expect(exec).toHaveBeenCalled()
    expect(exec).lastReturnedWith(123)
  })
})

export function setupExecMock() {
  vi.mock('@actions/exec', ExecMocks)
  return execimport as unknown as ReturnType<typeof ExecMocks>
}

function ExecMocks() {
  return {
    exec: vi.fn()
  }
}

////////////////// CORE //////////////////

import * as coreimport from '@actions/core'

describe('core mock', () => {
  const core = setupCoreMock()
  beforeEach(resetAllMocks)

  it('should register calls to info', async () => {
    core.info.mockResolvedValue(1)
    await core.info()
    expect(core.info).toHaveBeenCalled()
    expect(core.info).lastReturnedWith(1)
  })
})

export function setupCoreMock() {
  vi.mock('@actions/core', CoreMocks)
  return coreimport as unknown as ReturnType<typeof CoreMocks>
}

function CoreMocks() {
  return {
    info: vi.fn(),
    exportVariable: vi.fn(),
    setSecret: vi.fn(),
    addPath: vi.fn(),
    getInput: vi.fn(),
    setOutput: vi.fn(),
    setFailed: vi.fn(),
    warning: vi.fn(),
    debug: vi.fn()
  }
}

////////////////// Artifact //////////////////

import * as artifactimport from '@actions/artifact'

describe('artifact mock', () => {
  const artifact = setupArtifactMocks()
  beforeEach(resetAllMocks)

  it('should register calls to info', async () => {
    const inst = new artifact.DefaultArtifactClient()
    expect(artifactInstances(artifact)).toHaveLength(1)
    inst.uploadArtifact('some', 'value')
    expect(artifactInstances(artifact, 0).uploadArtifact).toBeCalledWith(
      'some',
      'value'
    )
    expect(inst.uploadArtifact).toBeCalledWith('some', 'value')
  })
})

export function artifactInstances<
  T extends ReturnType<typeof setupArtifactMocks>,
  K extends number | undefined
>(
  mock: T,
  index?: K
): K extends number
  ? T['DefaultArtifactClient']['mock']['instances'][number]
  : T['DefaultArtifactClient']['mock']['instances'] {
  if (typeof index === 'number') {
    return mock.DefaultArtifactClient.mock.instances[index] as K extends number
      ? T['DefaultArtifactClient']['mock']['instances'][number]
      : T['DefaultArtifactClient']['mock']['instances']
  } else {
    return mock.DefaultArtifactClient.mock.instances as K extends number
      ? T['DefaultArtifactClient']['mock']['instances'][number]
      : T['DefaultArtifactClient']['mock']['instances']
  }
}

export function setupArtifactMocks() {
  vi.mock('@actions/artifact', ArtifactMocks)
  return artifactimport as unknown as ReturnType<typeof ArtifactMocks>
}

function ArtifactMocks() {
  const DefaultArtifactClient = vi.fn()
  DefaultArtifactClient.prototype.uploadArtifact = vi.fn()

  return {
    DefaultArtifactClient
  }
}

////////////////// PING //////////////////

import { promise } from 'ping'

describe('ping mock', () => {
  const ping = setupPingMock()
  beforeEach(resetAllMocks)

  it('should register calls to probe', async () => {
    ping.probe.mockResolvedValue(1)
    await ping.probe()
    expect(ping.probe).toHaveBeenCalled()
    expect(ping.probe).lastReturnedWith(1)
  })
})

export function setupPingMock() {
  vi.mock('ping', PingMocks)
  return promise as unknown as ReturnType<typeof PingMocks>['promise']
}

export const probeRes = {
  alive: true,
  inputHost: '',
  host: '',
  output: '',
  time: 0,
  times: [],
  min: '',
  max: '',
  avg: '',
  stddev: '',
  packetLoss: ''
}
function PingMocks() {
  return {
    promise: {
      probe: vi.fn().mockImplementation(() => probeRes)
    }
  }
}
