/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('mapping performance', () => {

  it('shouldnt take a long time', async () => {
    /*
    There was an issue with mapping where we were using arrays for everything instead of hashes (like items, missedReferences),
    which caused searching to be really expensive and caused a huge slowdown.
    */
    const application = await Factory.createInitAppWithRandNamespace();
    const modelManager = application.modelManager;

    // create a bunch of notes and tags, and make sure mapping doesn't take a long time
    const noteCount = 1500;
    const tagCount = 10;
    const tags = [];
    const notes = [];
    for (let i = 0; i < tagCount; i++) {
      var tag = {
        uuid: Uuid.GenerateUuidSynchronously(),
        content_type: 'Tag',
        content: {
          title: `${Math.random()}`,
          references: []
        }
      };
      tags.push(tag);
    }
    for (let i = 0; i < noteCount; i++) {
      const note = {
        uuid: Uuid.GenerateUuidSynchronously(),
        content_type: 'Note',
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      };
      const randomTag = Factory.randomArrayValue(tags);
      randomTag.content.references.push(
        {
          content_type: 'Note',
          uuid: note.uuid
        }
      );
      notes.push(note);
    }

    const payloads = Factory.shuffleArray(tags.concat(notes)).map((item) => {
      return CreateMaxPayloadFromAnyObject({ object: item });
    });

    const t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    let currentIndex = 0;
    const batchSize = 100;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const subArray = payloads.slice(currentIndex, currentIndex + batchSize);
      await modelManager.mapPayloadsToLocalItems({
        payloads: subArray,
        source: PayloadSources.LocalChanged
      });
      currentIndex += batchSize;
    }

    const t1 = performance.now();
    const seconds = (t1 - t0) / 1000;
    const expectedRunTime = 3; // seconds
    expect(seconds).to.be.at.most(expectedRunTime);

    for (const note of modelManager.validItemsForContentType('Note')) {
      expect(note.referencingItemsCount).to.be.above(0);
    }
    await application.deinit();
  }).timeout(20000);

  it('mapping a tag with thousands of notes should be quick', async () => {
    /*
      There was an issue where if you have a tag with thousands of notes, it will take minutes to resolve.
      Fixed now. The issue was that we were looping around too much. I've consolidated some of the loops
      so that things require less loops in modelManager, regarding missedReferences.
    */
    const application = await Factory.createInitAppWithRandNamespace();
    const modelManager = application.modelManager;

    const noteCount = 10000;
    const notes = [];

    const tag = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: 'Tag',
      content: {
        title: `${Math.random()}`,
        references: []
      }
    };

    for (let i = 0; i < noteCount; i++) {
      const note = {
        uuid: Uuid.GenerateUuidSynchronously(),
        content_type: 'Note',
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      };

      tag.content.references.push({
        content_type: 'Note',
        uuid: note.uuid
      });
      notes.push(note);
    }

    const payloads = [tag].concat(notes).map((item) => CreateMaxPayloadFromAnyObject({
      object: item
    }));

    const t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    let currentIndex = 0;
    const batchSize = 100;
    for (let i = 0; i < payloads.length; i += batchSize) {
      var subArray = payloads.slice(currentIndex, currentIndex + batchSize);
      await modelManager.mapPayloadsToLocalItems({
        payloads: subArray,
        source: PayloadSources.LocalChanged
      });
      currentIndex += batchSize;
    }

    const t1 = performance.now();
    const seconds = (t1 - t0) / 1000;
    /** Expected run time depends on many different factors, 
     * like how many other tests you're running and overall system capacity.
     * Best case should be around 3.3s and worst case should be 5s.
    */
    const EXPECTED_RUN_TIME = 8.0; // seconds
    expect(seconds).to.be.at.most(EXPECTED_RUN_TIME);

    const mappedTag = modelManager.validItemsForContentType('Tag')[0];
    for (const note of modelManager.validItemsForContentType('Note')) {
      expect(note.referencingItemsCount).to.equal(1);
      expect(note.allReferencingItems[0]).to.equal(mappedTag);
    }
    await application.deinit();
  }).timeout(20000);
});
