/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import WebDeviceInterface from './lib/web_device_interface.js'
import * as Factory from './lib/factory.js'
chai.use(chaiAsPromised)
const expect = chai.expect

describe('application group', function () {
  const deviceInterface = new WebDeviceInterface(setTimeout.bind(window), setInterval.bind(window))

  beforeEach(async function () {
    localStorage.clear()
  })

  afterEach(async function () {
    localStorage.clear()
  })

  it('initializing a group should result with primary application', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    await group.initialize({
      applicationCreator: (descriptor, deviceInterface) => {
        return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
      },
    })
    expect(group.primaryApplication).to.be.ok
    expect(group.primaryApplication.identifier).to.be.ok
  })

  it('initializing a group should result with proper descriptor setup', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    await group.initialize({
      applicationCreator: (descriptor, deviceInterface) => {
        return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
      },
    })
    const identifier = group.primaryApplication.identifier
    expect(group.descriptorRecord[identifier].identifier).to.equal(identifier)
  })

  it('should persist descriptor record after changes', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    await group.initialize({
      applicationCreator: (descriptor, deviceInterface) => {
        return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
      },
    })
    const identifier = group.primaryApplication.identifier

    const descriptorRecord = await group.deviceInterface.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord,
    )
    expect(descriptorRecord[identifier].identifier).to.equal(identifier)
    expect(descriptorRecord[identifier].primary).to.equal(true)

    await group.addNewApplication()
    const descriptorRecord2 = await group.deviceInterface.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord,
    )
    expect(Object.keys(descriptorRecord2).length).to.equal(2)

    expect(descriptorRecord2[identifier].primary).to.equal(false)
    expect(descriptorRecord2[group.primaryApplication.identifier].primary).to.equal(true)
  })

  it('adding new application should incrememnt total descriptor count', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    await group.initialize({
      applicationCreator: (descriptor, deviceInterface) => {
        return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
      },
    })
    const currentIdentifier = group.primaryApplication.identifier
    await group.addNewApplication()

    expect(group.getDescriptors().length).to.equal(2)
    expect(group.primaryApplication.identifier).to.not.equal(currentIdentifier)
  })

  it('signing out of application should remove from group and create new', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    await group.initialize({
      applicationCreator: (descriptor, deviceInterface) => {
        return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
      },
    })
    const application = group.primaryApplication
    const identifier = application.identifier
    await Factory.safeDeinit(application)

    /**
     * On Safari 14.0.1 the new app instance will only be created on the
     * next tick
     */
    await Factory.sleep(0)
    expect(group.applications.length).to.equal(1)

    /** Expect a new application to have been created */
    expect(group.applications[0].identifier).to.not.equal(identifier)
  })

  it('should be notified when application changes', async function () {
    const group = new SNApplicationGroup(deviceInterface)
    let notifyCount = 0
    const expectedCount = 2
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      group.addApplicationChangeObserver(() => {
        notifyCount++
        if (notifyCount === expectedCount) {
          resolve()
        }
      })
      await group.initialize({
        applicationCreator: (descriptor, deviceInterface) => {
          return Factory.createApplicationWithFakeCrypto(descriptor.identifier, deviceInterface)
        },
      })
      await group.addNewApplication()
    }).then(() => {
      expect(notifyCount).to.equal(expectedCount)
    })
  }).timeout(1000)
})
