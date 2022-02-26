/* eslint-disable @typescript-eslint/no-explicit-any */
import { SNItem } from '@Models/core/item';
import { ContentType } from '@standardnotes/common';
import {
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
} from '@standardnotes/payloads';
import { CreateItemFromPayload } from '@Models/generator';
import { nonSecureRandomIdentifier, SNTag } from '@Lib/index';
import { SNNote } from './../app/note';
import { PredicateOperator, SNPredicate } from './predicate';
import { NoteWithTags } from '@Lib/protocol/collection/note_with_tags';

const randUuid = () => String(nonSecureRandomIdentifier());

function createItem<T extends SNItem>(
  content: Record<string, unknown>,
  contentType: ContentType,
  updatedAt?: Date
): T {
  return CreateItemFromPayload<T>(
    CreateMaxPayloadFromAnyObject({
      uuid: randUuid(),
      content_type: contentType,
      content: FillItemContent({ ...content }),
      updated_at: updatedAt,
    })
  );
}

function createNoteWithTags(
  content: Record<string, unknown>,
  tags: SNTag[]
): NoteWithTags {
  const payload = CreateMaxPayloadFromAnyObject({
    uuid: randUuid(),
    content_type: ContentType.Note,
    content: FillItemContent({ ...content }),
  });
  return new NoteWithTags(payload, tags);
}

function createNote(content: Record<string, unknown>): SNNote {
  return createItem(content, ContentType.Note);
}

function createArbitraryItem(
  content: Record<string, unknown>,
  updatedAt?: Date
): SNItem {
  return createItem(content, ContentType.Any, updatedAt);
}

const createTagContent = (title: string) => {
  const params = {
    title: title,
  };
  return params;
};

const createNoteContent = (title = 'Hello', desc = 'World') => {
  const params = {
    title: title,
    text: desc,
  };
  return params;
};

const tags = [
  createItem<SNTag>(createTagContent('foo'), ContentType.Tag),
  createItem<SNTag>(createTagContent('bar'), ContentType.Tag),
  createItem<SNTag>(createTagContent('far'), ContentType.Tag),
];

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

  describe('includes operator', () => {
    let item: NoteWithTags;
    beforeEach(() => {
      item = createNoteWithTags(createNoteContent(), tags);
    });

    it('includes string', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<SNNote>('title', PredicateOperator.Includes, 'ello')
        )
      ).toEqual(true);
    });

    it('includes raw array subpredicate', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('tags', PredicateOperator.Includes, [
            'title',
            PredicateOperator.Equals,
            'bar',
          ])
        )
      ).toEqual(true);
    });

    it('includes matching instantiated subpredicate', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>(
            'tags',
            PredicateOperator.Includes,
            new SNPredicate('title', PredicateOperator.Equals, 'bar')
          )
        )
      ).toEqual(true);
    });

    it('includes nonmatching instantiated subpredicate', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>(
            'tags',
            PredicateOperator.Includes,
            new SNPredicate('title', PredicateOperator.Equals, 'foobar')
          )
        )
      ).toEqual(false);
    });
  });

  describe('or operator', () => {
    let item: SNNote;
    const title = 'Hello';
    beforeEach(() => {
      item = createNote(createNoteContent(title));
    });

    it('both matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.Or, [
            ['content.title', PredicateOperator.Equals, 'Hello'],
            ['content_type', PredicateOperator.Equals, ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('first matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.Or, [
            ['content.title', PredicateOperator.Equals, 'Hello'],
            ['content_type', PredicateOperator.Equals, 'Wrong'],
          ])
        )
      ).toEqual(true);
    });

    it('second matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.Or, [
            ['content.title', PredicateOperator.Equals, 'Wrong'],
            ['content_type', PredicateOperator.Equals, ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('both nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.Or, [
            ['content.title', PredicateOperator.Equals, 'Wrong'],
            ['content_type', PredicateOperator.Equals, 'Wrong'],
          ])
        )
      ).toEqual(false);
    });
  });

  describe('in operator', () => {
    let item: NoteWithTags;
    const title = 'Foo';
    beforeEach(() => {
      item = createNoteWithTags(createNoteContent(title), tags);
    });

    it('all matching', () => {
      const predicate = new SNPredicate<NoteWithTags>(
        'tags',
        PredicateOperator.Includes,
        ['title', PredicateOperator.In, ['sobar', 'foo']] as never
      );

      expect(item.satisfiesPredicate(predicate)).toEqual(true);
    });
  });

  describe('and operator', () => {
    let item: SNNote;
    const title = 'Foo';
    beforeEach(() => {
      item = createNote(createNoteContent(title));
    });

    it('all matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.And, [
            ['content.title', PredicateOperator.Equals, title],
            ['content_type', PredicateOperator.Equals, ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('one matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.And, [
            ['content.title', PredicateOperator.Equals, 'Wrong'],
            ['content_type', PredicateOperator.Equals, ContentType.Note],
          ])
        )
      ).toEqual(false);
    });

    it('none matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.And, [
            ['content.title', PredicateOperator.Equals, '123'],
            ['content_type', PredicateOperator.Equals, '456'],
          ])
        )
      ).toEqual(false);
    });

    it('explicit compound syntax', () => {
      const compoundProd = SNPredicate.CompoundPredicate([
        new SNPredicate<SNNote>('title', PredicateOperator.Equals, title),
        new SNPredicate(
          'content_type',
          PredicateOperator.Equals,
          ContentType.Note
        ),
      ]);
      expect(item.satisfiesPredicate(compoundProd)).toEqual(true);
    });
  });

  describe('not operator', function () {
    let item: NoteWithTags;
    beforeEach(() => {
      item = createNoteWithTags(createNoteContent(), tags);
    });

    it('basic not predicate', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            'tags',
            PredicateOperator.Includes,
            ['title', PredicateOperator.Equals, 'far'] as never,
          ])
        )
      ).toEqual(false);
    });

    it('recursive compound predicate', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.And, [
            [
              '',
              PredicateOperator.Not,
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'far'],
              ],
            ] as never,
            [
              'tags',
              PredicateOperator.Includes,
              ['title', PredicateOperator.Equals, 'foo'],
            ] as never,
          ])
        )
      ).toEqual(false);
    });

    it('', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            'title',
            PredicateOperator.Equals,
            'Not This Title',
          ])
        )
      ).toEqual(true);
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            'title',
            PredicateOperator.Equals,
            'Hello',
          ])
        )
      ).toEqual(false);

      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.And, [
            [
              '',
              PredicateOperator.Not,
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'far'],
              ],
            ],
            [
              'tags',
              PredicateOperator.Includes,
              ['title', PredicateOperator.Equals, 'foo'],
            ],
          ] as never)
        )
      ).toEqual(false);

      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.And, [
            [
              '',
              PredicateOperator.Not,
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'boo'],
              ],
            ],
            [
              'tags',
              PredicateOperator.Includes,
              ['title', PredicateOperator.Equals, 'foo'],
            ],
          ] as never)
        )
      ).toEqual(true);

      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            '',
            PredicateOperator.And,
            [
              ['title', 'startsWith', 'H'],
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'falsify'],
              ],
            ],
          ] as never)
        )
      ).toEqual(true);
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            '',
            PredicateOperator.And,
            [
              ['title', 'startsWith', 'H'],
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'foo'],
              ],
            ],
          ] as never)
        )
      ).toEqual(false);

      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            '',
            PredicateOperator.Or,
            [
              ['title', 'startsWith', 'H'],
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'falsify'],
              ],
            ],
          ] as never)
        )
      ).toEqual(false);
      expect(
        item.satisfiesPredicate(
          new SNPredicate<NoteWithTags>('' as never, PredicateOperator.Not, [
            '',
            PredicateOperator.Or,
            [
              ['title', 'startsWith', 'Z'],
              [
                'tags',
                PredicateOperator.Includes,
                ['title', PredicateOperator.Equals, 'falsify'],
              ],
            ],
          ] as never)
        )
      ).toEqual(true);
    });
  });

  describe('regex', () => {
    it('matching', () => {
      const item = createNote(createNoteContent('abc'));
      const onlyLetters = new SNPredicate<SNNote>(
        'title',
        PredicateOperator.Matches,
        '^[a-zA-Z]+$'
      );
      expect(item.satisfiesPredicate(onlyLetters)).toEqual(true);
    });

    it('nonmatching', () => {
      const item = createNote(createNoteContent('123'));
      const onlyLetters = new SNPredicate<SNNote>(
        'title',
        PredicateOperator.Matches,
        '^[a-zA-Z]+$'
      );
      expect(item.satisfiesPredicate(onlyLetters)).toEqual(false);
    });
  });

  describe('deep recursion', () => {
    let item: SNNote;
    const title = 'Hello';
    beforeEach(() => {
      item = createNote(createNoteContent(title));
    });

    it('matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.And, [
            ['content.title', PredicateOperator.Equals, 'Hello'],
            [
              'this_field_ignored',
              PredicateOperator.Or,
              [
                ['content.title', PredicateOperator.Equals, 'Wrong'],
                ['content.title', PredicateOperator.Equals, 'Wrong again'],
                ['content.title', PredicateOperator.Equals, 'Hello'],
              ],
            ],
          ] as never)
        )
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate('' as never, PredicateOperator.And, [
            ['content.title', PredicateOperator.Equals, 'Hello'],
            [
              'this_field_ignored',
              PredicateOperator.Or,
              [
                ['content.title', PredicateOperator.Equals, 'Wrong'],
                ['content.title', PredicateOperator.Equals, 'Wrong again'],
                ['content.title', PredicateOperator.Equals, 'All wrong'],
              ],
            ],
          ] as never)
        )
      ).toEqual(false);
    });
  });

  describe('inequality operator', () => {
    let item: SNItem;
    const body = 'Hello';
    const numbers = ['1', '2', '3'];

    beforeEach(() => {
      item = createArbitraryItem({ body, numbers });
    });

    it('matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>(
            'content.body',
            PredicateOperator.NotEqual,
            'NotBody'
          )
        )
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.body', PredicateOperator.NotEqual, body)
        )
      ).toEqual(false);
    });

    it('matching array', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.numbers', PredicateOperator.NotEqual, [
            '1',
          ])
        )
      ).toEqual(true);
    });

    it('nonmatching array', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.numbers', PredicateOperator.NotEqual, [
            '1',
            '2',
            '3',
          ])
        )
      ).toEqual(false);
    });
  });

  describe('equals operator', () => {
    let item: SNItem;
    const body = 'Hello';
    const numbers = ['1', '2', '3'];

    beforeEach(() => {
      item = createArbitraryItem({ body, numbers });
    });

    it('matching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.body', PredicateOperator.Equals, body)
        )
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>(
            'content.body',
            PredicateOperator.Equals,
            'NotBody'
          )
        )
      ).toEqual(false);
    });

    it('false and undefined should be equivalent', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>(
            'content.undefinedProperty',
            PredicateOperator.Equals,
            false
          )
        )
      ).toEqual(true);
    });

    it('nonmatching array', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.numbers', PredicateOperator.Equals, [
            '1',
          ])
        )
      ).toEqual(false);
    });

    it('matching array', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('content.numbers', PredicateOperator.Equals, [
            '1',
            '2',
            '3',
          ])
        )
      ).toEqual(true);
    });

    it('nested keypath', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>(
            'content.numbers.length',
            PredicateOperator.Equals,
            numbers.length
          )
        )
      ).toEqual(true);
    });
  });

  describe('date comparison', () => {
    let item: SNItem;
    const date = new Date();

    beforeEach(() => {
      item = createArbitraryItem({}, date);
    });

    it('nonmatching date value', () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 1);
      const predicate = new SNPredicate(
        'updated_at',
        PredicateOperator.GreaterThan,
        date
      );
      expect(item.satisfiesPredicate(predicate)).toEqual(false);
    });

    it('matching date value', () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 1);
      const predicate = new SNPredicate(
        'updated_at',
        PredicateOperator.LessThan,
        date
      );
      expect(item.satisfiesPredicate(predicate)).toEqual(true);
    });

    it('matching days ago value', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate(
            'updated_at',
            PredicateOperator.GreaterThan,
            '30.days.ago'
          )
        )
      ).toEqual(true);
    });

    it('nonmatching days ago value', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate(
            'updated_at',
            PredicateOperator.LessThan,
            '30.days.ago'
          )
        )
      ).toEqual(false);
    });

    it('hours ago value', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate(
            'updated_at',
            PredicateOperator.GreaterThan,
            '1.hours.ago'
          )
        )
      ).toEqual(true);
    });
  });

  describe('nonexistent properties', () => {
    let item: SNItem;

    beforeEach(() => {
      item = createArbitraryItem({});
    });

    it('nested keypath', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>(
            'content.foobar.length',
            PredicateOperator.Equals,
            0
          )
        )
      ).toEqual(false);
    });

    it('inequality operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.NotEqual, 'NotFoo')
        )
      ).toEqual(true);
    });

    it('equals operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.Equals, 'NotFoo')
        )
      ).toEqual(false);
    });

    it('less than operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.LessThan, 3)
        )
      ).toEqual(false);
    });

    it('greater than operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.GreaterThan, 3)
        )
      ).toEqual(false);
    });

    it('less than or equal to operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.LessThanOrEqualTo, 3)
        )
      ).toEqual(false);
    });

    it('includes operator', () => {
      expect(
        item.satisfiesPredicate(
          new SNPredicate<any>('foobar', PredicateOperator.Includes, 3)
        )
      ).toEqual(false);
    });
  });
});
