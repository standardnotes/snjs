import { ItemManager } from '@Lib/services';
import { Migration3_0_0 } from './3_0_0';

const itemManagerMock = (tagTitles: string[]) => {
  const mockTag = (title: string) => ({
    title,
    uuid: title,
    parentId: undefined,
  });

  const mock = {
    getItems: jest.fn().mockReturnValue(tagTitles.map(mockTag)),
    findOrCreateTagParentChain: jest.fn(),
    changeItem: jest.fn(),
  };

  return mock;
};

describe('migration 3.0.0: folders component to hierarchy', () => {

  // TODO: what about testing cases where the user trigger a migration AFTER we already migrated the data.
  // For example they have a tag with parents, but the tag is name 'a.b.c'
  
  it('should produce a valid hierarchy in the simple case', async () => {
    const titles = ['a', 'a.b', 'a.b.c'];

    const itemManager = itemManagerMock(titles);
    await Migration3_0_0.upgradeTagFoldersToHierarchy(
      (itemManager as unknown) as ItemManager
    );

    const findOrCreateTagParentChainCalls =
      itemManager.findOrCreateTagParentChain.mock.calls;
    const changeItemCalls = itemManager.changeItem.mock.calls;

    expect(findOrCreateTagParentChainCalls.length).toEqual(2);
    expect(findOrCreateTagParentChainCalls[0][0]).toEqual(['a']);
    expect(findOrCreateTagParentChainCalls[1][0]).toEqual(['a', 'b']);

    expect(changeItemCalls.length).toEqual(2);
    expect(changeItemCalls[0][0]).toEqual('a.b');
    expect(changeItemCalls[1][0]).toEqual('a.b.c');
  });

  it('should not touch flat hierarchies', async () => {
    const titles = ['a', 'x', 'y', 'z'];

    const itemManager = itemManagerMock(titles);
    await Migration3_0_0.upgradeTagFoldersToHierarchy(
      (itemManager as unknown) as ItemManager
    );

    const findOrCreateTagParentChainCalls =
      itemManager.findOrCreateTagParentChain.mock.calls;
    const changeItemCalls = itemManager.changeItem.mock.calls;

    expect(findOrCreateTagParentChainCalls.length).toEqual(0);

    expect(changeItemCalls.length).toEqual(0);
  });

  it('should work despite cloned tags', async () => {
    const titles = ['a.b', 'c', 'a.b'];

    const itemManager = itemManagerMock(titles);
    await Migration3_0_0.upgradeTagFoldersToHierarchy(
      (itemManager as unknown) as ItemManager
    );

    const findOrCreateTagParentChainCalls =
      itemManager.findOrCreateTagParentChain.mock.calls;
    const changeItemCalls = itemManager.changeItem.mock.calls;

    expect(findOrCreateTagParentChainCalls.length).toEqual(2);
    expect(findOrCreateTagParentChainCalls[0][0]).toEqual(['a']);
    expect(findOrCreateTagParentChainCalls[1][0]).toEqual(['a']);

    expect(changeItemCalls.length).toEqual(2);
    expect(changeItemCalls[0][0]).toEqual('a.b');
    expect(changeItemCalls[0][0]).toEqual('a.b');
  });

  it('should produce a valid hierarchy cases with  missing intermediate tags or unordered', async () => {
    const titles = ['y.2', 'w.3', 'y'];

    const itemManager = itemManagerMock(titles);
    await Migration3_0_0.upgradeTagFoldersToHierarchy(
      (itemManager as unknown) as ItemManager
    );

    const findOrCreateTagParentChainCalls =
      itemManager.findOrCreateTagParentChain.mock.calls;
    const changeItemCalls = itemManager.changeItem.mock.calls;

    expect(findOrCreateTagParentChainCalls.length).toEqual(2);
    expect(findOrCreateTagParentChainCalls[0][0]).toEqual(['w']);
    expect(findOrCreateTagParentChainCalls[1][0]).toEqual(['y']);

    expect(changeItemCalls.length).toEqual(2);
    expect(changeItemCalls[0][0]).toEqual('w.3');
    expect(changeItemCalls[1][0]).toEqual('y.2');
  });

  it('skip prefixed names', async () => {
    const titles = ['.something', '.something...something'];

    const itemManager = itemManagerMock(titles);
    await Migration3_0_0.upgradeTagFoldersToHierarchy(
      (itemManager as unknown) as ItemManager
    );

    const findOrCreateTagParentChainCalls =
      itemManager.findOrCreateTagParentChain.mock.calls;
    const changeItemCalls = itemManager.changeItem.mock.calls;

    expect(findOrCreateTagParentChainCalls.length).toEqual(0);
    expect(changeItemCalls.length).toEqual(0);
  });
});
