/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('utils', () => {
  it('findInArray', async () => {
    expect(findInArray).to.not.be.null;
    const array = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    expect(findInArray(array, 'id', 1)).to.be.ok;
    expect(findInArray(array, 'id', 'foo')).to.not.be.ok;
  });

  it('isNullOrUndefined', () => {
    expect(isNullOrUndefined(null)).to.equal(true);
    expect(isNullOrUndefined(undefined)).to.equal(true);
    expect(isNullOrUndefined(1)).to.equal(false);
    expect(isNullOrUndefined('foo')).to.equal(false);
    expect(isNullOrUndefined({})).to.equal(false);
    expect(isNullOrUndefined([null])).to.equal(false);
  });

  it('extendArray', () => {
    const array = [1, 2, 3];
    const original = array.slice();
    const extended = [4, 5, 6];
    extendArray(array, extended);
    expect(array).to.eql(original.concat(extended));
  });

  it('top level compare', () => {
    const left = { a: 1, b: 2 };
    const right = { a: 1, b: 2 };
    const middle = { a: 2, b: 1 };
    expect(topLevelCompare(left, right)).to.equal(true);
    expect(topLevelCompare(right, left)).to.equal(true);
    expect(topLevelCompare(left, middle)).to.equal(false);
    expect(topLevelCompare(middle, right)).to.equal(false);
  });

  it('jsonParseEmbeddedKeys', () => {
    const object = {
      a: { foo: 'bar' },
      b: JSON.stringify({ foo: 'bar' })
    };
    const parsed = jsonParseEmbeddedKeys(object);
    expect(typeof parsed.a).to.equal('object');
    expect(typeof parsed.b).to.equal('object');
  });

  describe('subtractFromArray', () => {
    it('Removes all items appearing in the array', () => {
      const array = [1, 2, 3, 4, 5];
      subtractFromArray(array, [1, 3, 5]);
      expect(array).to.eql([2, 4]);
    });

    it('Ignores items not appearing in the array', () => {
      const array = [1, 2, 3, 4, 5];
      subtractFromArray(array, [0, 1, 3, 5]);
      expect(array).to.eql([2, 4]);
    });
  });

  describe('removeFromArray', () => {
    it('Removes the first item appearing in the array', () => {
      const array = [1, 1, 2, 3];
      removeFromArray(array, 1);
      expect(array).to.eql([1, 2, 3]);
      removeFromArray(array, 2);
      expect(array).to.eql([1, 3]);
    });

    it('Ignores items not appearing in the array', () => {
      const array = [1, 2, 3];
      removeFromArray(array, 0);
      expect(array).to.eql([1, 2, 3]);
      removeFromArray(array, {});
    });
  });

  it('removeFromIndex', () => {
    const array = [1, 2, 3];
    removeFromIndex(array, 1);
    expect(array).to.eql([1, 3]);
  });

  it('arrayByDifference', () => {
    const array = [1, 2, 3, 4];
    const array2 = [2, 3];
    const result = arrayByDifference(array, array2);
    expect(result).to.eql([1, 4]);
  });

  it('uniqCombineObjArrays', () => {
    const arrayA = [
      { a: 'a', b: 'a' }
    ];
    const arrayB = [
      { a: 'a', b: 'a' },
      { a: '2', b: '2' }
    ];

    const result = uniqCombineObjArrays(arrayA, arrayB, ['a', 'b']);
    expect(result.length).to.equal(2);
  });

  it('lodash merge should behave as expected', () => {
    const a = {
      content: {
        references: [{ a: 'a' }]
      }
    };
    const b = {
      content: {
        references: []
      }
    };
    // merging a with b should replace total content
    deepMerge(a, b);
    expect(a.content.references).to.eql([]);
  });

  it('truncates hex string', () => {
    const hex256 = 'f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b';
    const desiredBits = 128;
    const expectedLength = 32;
    const result = truncateHexString(hex256, desiredBits);
    expect(result.length).to.equal(expectedLength);
  });
});
