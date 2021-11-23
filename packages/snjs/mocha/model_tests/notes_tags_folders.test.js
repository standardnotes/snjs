/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('tags as folders', () => {
    const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

    const syncOptions = {
        checkIntegrity: true,
        awaitAll: true,
    };

    beforeEach(async function () {
        this.expectedItemCount = BASE_ITEM_COUNT;
        this.application = await Factory.createInitAppWithRandNamespace();
    });

    afterEach(async function () {
        await Factory.safeDeinit(this.application);
    });

    it('lets me create a tag, add relationships, move a note to a children, and query data all along', async function () {
        // ## The user creates four tags
        let tagParent = await Factory.createMappedTag(this.application, { title: 'parent' });
        let tagGrandParent = await Factory.createMappedTag(this.application, { title: 'grandparent' });
        let tagGrandParent2 = await Factory.createMappedTag(this.application, { title: 'grandparent2' });
        let tagChildren = await Factory.createMappedTag(this.application, { title: 'children' });

        expect(tagParent.content.title).to.equal('parent')
        expect(tagParent.content.references.length).to.equal(0)

        expect(tagGrandParent.content.title).to.equal('grandparent')
        expect(tagGrandParent.content.references.length).to.equal(0)

        expect(tagGrandParent.content.title).to.equal('grandparent2')
        expect(tagGrandParent.content.references.length).to.equal(0)

        expect(tagChildren.content.title).to.equal('children')
        expect(tagChildren.content.references.length).to.equal(0)

        // ## Now the users moves the tag children into the parent
        tagChildren = await this.application.changeAndSaveItem/*<TagMutator>*/(
            tagChildren.uuid,
            (mutator) => {
              // DISCUSS: case1: we insert the relationship using a mutator (separation of concerns)
              // DISCUSS: I am stuck here because I can't access the tag mutator, or I don't know how to access it yet.
              // I want to use a TagMutator but I don't know how to make sure the correct mutator is used.
              TagMutator.makeChildOf(tagParent);
            },
            undefined, // DIG: what is this? (isUserModified)
            undefined, // DIG: what is this? (PayloadSource)
            syncOptions // DIG: what is this? (SyncOptions)
          );

          expect(tagChildren.content.references.length).to.equal(1)

          // ## Now the user moves the tag parent into the grand parent
          tagParent = await this.application.changeAndSaveItem/*<TagMutator>*/(
            tagParent.uuid,
            (mutator) => {
              // DISCUSS: case1: we insert the relationship using a mutator (separation of concerns)
              // DISCUSS: I am stuck here because I can't access the tag mutator, or I don't know how to access it yet.
              // I want to use a TagMutator but I don't know how to make sure the correct mutator is used.
              TagMutator.makeChildOf(tagGrandParent);
            },
            undefined,
            undefined,
            syncOptions
          );

          expect(tagParent.content.references.length).to.equal(1)
      
          // ## Now the user moves the tag parent into another grand parent
          tagParent = await this.application.changeAndSaveItem/*<TagMutator>*/(
            tagParent.uuid,
            (mutator) => {
              // DISCUSS: case1: we insert the relationship using a mutator (separation of concerns)
              // DISCUSS: I am stuck here because I can't access the tag mutator, or I don't know how to access it yet.
              // I want to use a TagMutator but I don't know how to make sure the correct mutator is used.
              TagMutator.makeChildOf(tagGrandParent2);
            },
            undefined,
            undefined,
            syncOptions
          );

          expect(tagParent.content.references.length).to.equal(1)

    })
})