/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

function asUuids(xs) {
    return (xs || []).map(x=> x.uuid)
}

describe('tags as folders', () => {
    beforeEach(async function () {
        this.application = await Factory.createInitAppWithRandNamespace();
    });

    afterEach(async function () {
        await Factory.safeDeinit(this.application);
    });

    it('lets me create a tag, add relationships, move a note to a children, and query data all along', async function () {
        // ## The user creates four tags
        let tagChildren = await Factory.createMappedTag(this.application, { title: 'children' });
        let tagParent = await Factory.createMappedTag(this.application, { title: 'parent' });
        let tagGrandParent = await Factory.createMappedTag(this.application, { title: 'grandparent' });
        let tagGrandParent2 = await Factory.createMappedTag(this.application, { title: 'grandparent2' });

        // ## Now the users moves the tag children into the parent
        await this.application.setTagRelationship(tagParent, tagChildren)

        expect(this.application.getTagParent(tagChildren)).to.equal(tagParent)
        expect(asUuids(this.application.getTagChildren(tagParent))).deep.to.equal(asUuids([tagChildren]))

        // ## Now the user moves the tag parent into the grand parent
        await this.application.setTagRelationship(tagGrandParent, tagParent)

        expect(this.application.getTagParent(tagParent)).to.equal(tagGrandParent)
        expect(asUuids(this.application.getTagChildren(tagGrandParent))).deep.to.equal(asUuids([tagParent]))

        // ## Now the user moves the tag parent into another grand parent
        await this.application.setTagRelationship(tagGrandParent2, tagParent)

        expect(this.application.getTagParent(tagParent)).to.equal(tagGrandParent2)
        expect(this.application.getTagChildren(tagGrandParent)).deep.to.equal([])
        expect(asUuids(this.application.getTagChildren(tagGrandParent2))).deep.to.equal(asUuids([tagParent]))

        // ## Now the user move the tag outside any hierarchy
        await this.application.unsetTagRelationship(tagGrandParent2, tagParent)

        expect(this.application.getTagParent(tagParent)).to.equal(undefined)
        expect(this.application.getTagChildren(tagGrandParent2)).deep.to.equals([])
    })
})