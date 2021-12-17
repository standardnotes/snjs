/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('tags as folders', () => {
  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await Factory.safeDeinit(this.application);
  });

  it('lets me create a tag, add relationships, move a note to a children, and query data all along', async function () {
    // ## The user creates four tags
    let tagChildren = await Factory.createMappedTag(this.application, {
      title: 'children',
    });
    let tagParent = await Factory.createMappedTag(this.application, {
      title: 'parent',
    });
    let tagGrandParent = await Factory.createMappedTag(this.application, {
      title: 'grandparent',
    });
    let tagGrandParent2 = await Factory.createMappedTag(this.application, {
      title: 'grandparent2',
    });

    // ## Now the users moves the tag children into the parent
    await this.application.setTagParent(tagParent, tagChildren);

    expect(this.application.getTagParent(tagChildren)).to.equal(tagParent);
    expect(Uuids(this.application.getTagChildren(tagParent))).deep.to.equal(
      Uuids([tagChildren])
    );

    // ## Now the user moves the tag parent into the grand parent
    await this.application.setTagParent(tagGrandParent, tagParent);

    expect(this.application.getTagParent(tagParent)).to.equal(tagGrandParent);
    expect(
      Uuids(this.application.getTagChildren(tagGrandParent))
    ).deep.to.equal(Uuids([tagParent]));

    // ## Now the user moves the tag parent into another grand parent
    await this.application.setTagParent(tagGrandParent2, tagParent);

    expect(this.application.getTagParent(tagParent)).to.equal(tagGrandParent2);
    expect(this.application.getTagChildren(tagGrandParent)).deep.to.equal([]);
    expect(
      Uuids(this.application.getTagChildren(tagGrandParent2))
    ).deep.to.equal(Uuids([tagParent]));

    // ## Now the user tries to move the tag into one of its children
    await expect(this.application.setTagParent(tagChildren, tagParent)).to
      .eventually.be.rejected;

    expect(this.application.getTagParent(tagParent)).to.equal(tagGrandParent2);
    expect(this.application.getTagChildren(tagGrandParent)).deep.to.equal([]);
    expect(
      Uuids(this.application.getTagChildren(tagGrandParent2))
    ).deep.to.equal(Uuids([tagParent]));

    // ## Now the user move the tag outside any hierarchy
    await this.application.unsetTagParent(tagParent);

    expect(this.application.getTagParent(tagParent)).to.equal(undefined);
    expect(this.application.getTagChildren(tagGrandParent2)).deep.to.equals([]);
  });

  it('lets me add a note to a tag hierarchy', async function () {
    // ## The user creates four tags hierarchy
    const tags = await Factory.createTags(this.application, {
      grandparent: { parent: { child: true } },
      another: true,
    });

    const note1 = await Factory.createNote(this.application, 'my first note');
    const note2 = await Factory.createNote(this.application, 'my second note');

    // ## The user add a note to the child tag
    await this.application.addTagHierarchyToNote(note1, tags.child);
    await this.application.addTagHierarchyToNote(note2, tags.another);

    // ## The note has been added to other tags
    const note1Tags = await this.application.getSortedTagsForNote(note1);
    const note2Tags = await this.application.getSortedTagsForNote(note2);

    expect(note1Tags.length).to.equal(3);
    expect(note2Tags.length).to.equal(1);
  });
});
