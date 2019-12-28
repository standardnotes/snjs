import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("mapping performance", () => {
  const createModelManager = async () => {
    const isolatedApplication = await Factory.createInitAppWithRandNamespace();
    return isolatedApplication.modelManager;
  }

  it("shouldn't take a long time", async () => {
    /*
      There was an issue with mapping where we were using arrays for everything instead of hashes (like items, missedReferences),
      which caused searching to be really expensive and caused a huge slowdown.
    */
    let modelManager = await createModelManager();

    // create a bunch of notes and tags, and make sure mapping doesn't take a long time
    const noteCount = 1500;
    const tagCount = 10;
    var tags = [], notes = [];
    for(var i = 0; i < tagCount; i++) {
      var tag = {
        uuid: SFItem.GenerateUuidSynchronously(),
        content_type: "Tag",
        content: {
          title: `${Math.random()}`,
          references: []
        }
      }
      tags.push(tag);
    }

    for(var i = 0; i < noteCount; i++) {
      var note = {
        uuid: SFItem.GenerateUuidSynchronously(),
        content_type: "Note",
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      }

      var randomTag = Factory.randomArrayValue(tags);

      randomTag.content.references.push(
        {
          content_type: "Note",
          uuid: note.uuid
        }
      )
      notes.push(note);
    }

    var items = Factory.shuffleArray(tags.concat(notes));

    var t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    var currentIndex = 0;
    var batchSize = 100;
    for(var i = 0; i < items.length; i += batchSize) {
      var subArray = items.slice(currentIndex, currentIndex + batchSize);
      await modelManager.mapPayloadsToLocalModels({payloads: subArray});
      currentIndex += batchSize;
    }

    var t1 = performance.now();
    var seconds = (t1 - t0) / 1000;
    const expectedRunTime = 3; // seconds
    expect(seconds).to.be.at.most(expectedRunTime);

    for(let note of modelManager.validItemsForContentType("Note")) {
      expect(note.referencingObjects.length).to.be.above(0);
    }
  }).timeout(20000);

  it("mapping a tag with thousands of notes should be quick", async () => {
    /*
      There was an issue where if you have a tag with thousands of notes, it will take minutes to resolve.
      Fixed now. The issue was that we were looping around too much. I've consolidated some of the loops
      so that things require less loops in modelManager, regarding missedReferences.
    */
    let modelManager = await createModelManager();

    const noteCount = 10000;
    var notes = [];

    var tag = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: "Tag",
      content: {
        title: `${Math.random()}`,
        references: []
      }
    }

    for(var i = 0; i < noteCount; i++) {
      var note = {
        uuid: SFItem.GenerateUuidSynchronously(),
        content_type: "Note",
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      }

      tag.content.references.push({
        content_type: "Note",
        uuid: note.uuid
      })
      notes.push(note);
    }

    var items = [tag].concat(notes);

    var t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    var currentIndex = 0;
    var batchSize = 100;
    for(var i = 0; i < items.length; i += batchSize) {
      var subArray = items.slice(currentIndex, currentIndex + batchSize);
      await modelManager.mapPayloadsToLocalModels({payloads: subArray});
      currentIndex += batchSize;
    }

    var t1 = performance.now();
    var seconds = (t1 - t0) / 1000;
    const expectedRunTime = 3; // seconds
    expect(seconds).to.be.at.most(expectedRunTime);

    let mappedTag = modelManager.validItemsForContentType("Tag")[0];
    for(let note of modelManager.validItemsForContentType("Note")) {
      expect(note.referencingObjects.length).to.equal(1);
      expect(note.referencingObjects[0]).to.equal(mappedTag);
    }

  }).timeout(20000);
})
