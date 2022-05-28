import { AppContext } from './lib/AppContext.js'
chai.use(chaiAsPromised)

const expect = chai.expect

describe.only('navigation', function () {
  const createContext = async (navigationHandler) => {
    const filledHandler = {
      onNotes() {},
      onFolders() {},
      onFiles() {},
      onSelectedNotes() {},
      onSelectedFolders() {},
      onSelectedFiles() {},
      ...navigationHandler,
    }

    const context = new AppContext({ navigationHandler: filledHandler })
    await context.initialize()
    await context.launch()

    return context
  }

  beforeEach(async function () {
    localStorage.clear()
  })

  afterEach(async function () {
    localStorage.clear()
  })

  it('application should have navigation controller', async function () {
    const context = await createContext()
    const controller = context.application.navigationController

    expect(controller).to.be.ok
  })

  it('navigation handler should notify of new items', async function () {
    const deferred = Deferred()

    const context = await createContext({
      onNotes: (notes) => {
        deferred.resolve(notes)
      },
    })

    await context.createSyncedNote()

    const notes = await deferred.promise

    expect(notes.length).to.equal(1)
  })

  it('deleting item should only notify selection once', async function () {
    let notifyCount = 0
    const context = await createContext({
      onSelectedNotes: (notes) => {
        if (notes.length === 0) {
          notifyCount++
        }
      },
    })

    const controller = context.application.navigationController
    const note = await context.createSyncedNote()
    controller.selectItems([note])
    await context.deleteItemAndSync(note)
    await context.sleep(0.1)

    expect(notifyCount).to.equal(1)
  })

  it('deleted item should be deselected', async function () {
    const deferred = Deferred()
    const context = await createContext({
      onSelectedNotes: (notes) => {
        if (notes.length === 0) {
          deferred.resolve(notes)
        }
      },
    })
    const controller = context.application.navigationController
    const note = await context.createSyncedNote()

    controller.selectItems([note])

    await context.deleteItemAndSync(note)

    const selectedNotes = await deferred.promise

    expect(selectedNotes.length).to.equal(0)
  })
})
