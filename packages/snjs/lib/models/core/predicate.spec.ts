import { SNNote } from './../app/note';
import { SNPredicate } from './predicate';

describe('predicates', () => {
  it('string comparisons should be case insensitive', () => {
    const string = '!["Not notes", "title", "startsWith", "foo"]';
    const predicate = SNPredicate.FromDSLString(string);

    const matchingItem1 = {
      title: 'foo',
    } as jest.Mocked<SNNote>;

    expect(
      SNPredicate.ItemSatisfiesPredicate(matchingItem1, predicate)
    ).toEqual(true);

    const matchingItem2 = {
      title: 'Foo',
    } as jest.Mocked<SNNote>;

    expect(
      SNPredicate.ItemSatisfiesPredicate(matchingItem2, predicate)
    ).toEqual(true);
  });
});
