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
import { Predicate } from './predicate';
import { NoteWithTags } from '@Lib/protocol/collection/note_with_tags';
import {
  compoundPredicateFromArguments,
  includesPredicateFromArguments,
  notPredicateFromArguments,
  predicateFromArguments,
  predicateFromDSLString,
} from './generators';
import { CompoundPredicate } from './compound_predicate';
import { NotPredicate } from './not_predicate';
import { IncludesPredicate } from './includes_predicate';

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
    const predicate = predicateFromDSLString(string);

    const matchingItem1 = {
      title: 'foo',
    } as jest.Mocked<SNNote>;

    expect(predicate.matchesItem(matchingItem1)).toEqual(true);

    const matchingItem2 = {
      title: 'Foo',
    } as jest.Mocked<SNNote>;

    expect(predicate.matchesItem(matchingItem2)).toEqual(true);
  });

  describe('includes operator', () => {
    let item: NoteWithTags;
    beforeEach(() => {
      item = createNoteWithTags(createNoteContent(), tags);
    });

    it('includes string', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<SNNote>('title', 'includes', 'ello')
        )
      ).toEqual(true);
    });

    it('includes raw array subpredicate', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<NoteWithTags>('tags', 'includes', ['title', '=', 'bar'])
        )
      ).toEqual(true);
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
          compoundPredicateFromArguments<SNNote>('or', [
            ['content.title', '=', 'Hello'],
            ['content_type', '=', ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('first matching', () => {
      expect(
        item.satisfiesPredicate(
          compoundPredicateFromArguments<SNNote>('or', [
            ['content.title', '=', 'Hello'],
            ['content_type', '=', 'Wrong'],
          ])
        )
      ).toEqual(true);
    });

    it('second matching', () => {
      expect(
        item.satisfiesPredicate(
          compoundPredicateFromArguments<SNNote>('or', [
            ['content.title', '=', 'Wrong'],
            ['content_type', '=', ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('both nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          compoundPredicateFromArguments<SNNote>('or', [
            ['content.title', '=', 'Wrong'],
            ['content_type', '=', 'Wrong'],
          ])
        )
      ).toEqual(false);
    });
  });

  describe('includes operator', () => {
    let item: NoteWithTags;
    const title = 'Foo';
    beforeEach(() => {
      item = createNoteWithTags(createNoteContent(title), tags);
    });

    it('all matching', () => {
      const predicate = new IncludesPredicate<NoteWithTags>(
        'tags',
        new Predicate<NoteWithTags>('title', 'in', ['sobar', 'foo'])
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
          compoundPredicateFromArguments<SNNote>('and', [
            ['content.title', '=', title],
            ['content_type', '=', ContentType.Note],
          ])
        )
      ).toEqual(true);
    });

    it('one matching', () => {
      expect(
        item.satisfiesPredicate(
          compoundPredicateFromArguments<SNNote>('and', [
            ['content.title', '=', 'Wrong'],
            ['content_type', '=', ContentType.Note],
          ])
        )
      ).toEqual(false);
    });

    it('none matching', () => {
      expect(
        item.satisfiesPredicate(
          compoundPredicateFromArguments<SNNote>('and', [
            ['content.title', '=', '123'],
            ['content_type', '=', '456'],
          ])
        )
      ).toEqual(false);
    });

    it('explicit compound syntax', () => {
      const compoundProd = new CompoundPredicate('and', [
        new Predicate<SNNote>('title', '=', title),
        new Predicate('content_type', '=', ContentType.Note),
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
          new NotPredicate<NoteWithTags>(
            new IncludesPredicate<NoteWithTags>(
              'tags',
              new Predicate<SNTag>('title', '=', 'far')
            )
          )
        )
      ).toEqual(false);
    });

    it('recursive compound predicate', () => {
      expect(
        item.satisfiesPredicate(
          new CompoundPredicate<NoteWithTags>('and', [
            new NotPredicate<NoteWithTags>(
              new IncludesPredicate<NoteWithTags>(
                'tags',
                new Predicate<SNTag>('title', '=', 'far')
              )
            ),
            new IncludesPredicate<NoteWithTags>(
              'tags',
              new Predicate<SNTag>('title', '=', 'foo')
            ),
          ])
        )
      ).toEqual(false);
    });

    it('matching basic operator', () => {
      expect(
        item.satisfiesPredicate(
          notPredicateFromArguments<NoteWithTags>([
            'title',
            '=',
            'Not This Title',
          ])
        )
      ).toEqual(true);
    });

    it('nonmatching basic operator', () => {
      expect(
        item.satisfiesPredicate(
          notPredicateFromArguments<NoteWithTags>(['title', '=', 'Hello'])
        )
      ).toEqual(false);
    });

    it('matching compound', () => {
      expect(
        item.satisfiesPredicate(
          new CompoundPredicate<NoteWithTags>('and', [
            new NotPredicate<NoteWithTags>(
              new IncludesPredicate<NoteWithTags>(
                'tags',
                new Predicate<SNTag>('title', '=', 'boo')
              )
            ),
            new IncludesPredicate<NoteWithTags>(
              'tags',
              new Predicate<SNTag>('title', '=', 'foo')
            ),
          ])
        )
      ).toEqual(true);
    });

    it('matching compound includes', () => {
      const andPredicate = new CompoundPredicate<NoteWithTags>('and', [
        predicateFromArguments('title', 'startsWith', 'H'),
        includesPredicateFromArguments<NoteWithTags>('tags', [
          'title',
          '=',
          'falsify',
        ]),
      ]);
      expect(
        item.satisfiesPredicate(new NotPredicate<NoteWithTags>(andPredicate))
      ).toEqual(true);
    });

    it('nonmatching compound includes', () => {
      expect(
        item.satisfiesPredicate(
          new NotPredicate<NoteWithTags>(
            new CompoundPredicate<NoteWithTags>('and', [
              new Predicate<NoteWithTags>('title', 'startsWith', 'H'),
              new IncludesPredicate<NoteWithTags>(
                'tags',
                new Predicate<SNTag>('title', '=', 'foo')
              ),
            ])
          )
        )
      ).toEqual(false);
    });

    it('nonmatching compound or', () => {
      expect(
        item.satisfiesPredicate(
          new NotPredicate<NoteWithTags>(
            new CompoundPredicate<NoteWithTags>('or', [
              new Predicate<NoteWithTags>('title', 'startsWith', 'H'),
              new IncludesPredicate<NoteWithTags>(
                'tags',
                new Predicate<SNTag>('title', '=', 'falsify')
              ),
            ])
          )
        )
      ).toEqual(false);
    });

    it('matching compound or', () => {
      expect(
        item.satisfiesPredicate(
          new NotPredicate<NoteWithTags>(
            new CompoundPredicate<NoteWithTags>('or', [
              new Predicate<NoteWithTags>('title', 'startsWith', 'Z'),
              new IncludesPredicate<NoteWithTags>(
                'tags',
                new Predicate<SNTag>('title', '=', 'falsify')
              ),
            ])
          )
        )
      ).toEqual(true);
    });
  });

  describe('regex', () => {
    it('matching', () => {
      const item = createNote(createNoteContent('abc'));
      const onlyLetters = new Predicate<SNNote>(
        'title',
        'matches',
        '^[a-zA-Z]+$'
      );
      expect(item.satisfiesPredicate(onlyLetters)).toEqual(true);
    });

    it('nonmatching', () => {
      const item = createNote(createNoteContent('123'));
      const onlyLetters = new Predicate<SNNote>(
        'title',
        'matches',
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
          new CompoundPredicate<SNNote>('and', [
            new Predicate<SNNote>('title', '=', 'Hello'),
            new CompoundPredicate<SNNote>('or', [
              new Predicate<SNNote>('title', '=', 'Wrong'),
              new Predicate<SNNote>('title', '=', 'Wrong again'),
              new Predicate<SNNote>('title', '=', 'Hello'),
            ]),
          ])
        )
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new CompoundPredicate<SNNote>('and', [
            new Predicate<SNNote>('title', '=', 'Hello'),
            new CompoundPredicate<SNNote>('or', [
              new Predicate<SNNote>('title', '=', 'Wrong'),
              new Predicate<SNNote>('title', '=', 'Wrong again'),
              new Predicate<SNNote>('title', '=', 'All wrong'),
            ]),
          ])
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
          new Predicate<any>('content.body', '!=', 'NotBody')
        )
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('content.body', '!=', body))
      ).toEqual(false);
    });

    it('matching array', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.numbers', '!=', ['1'])
        )
      ).toEqual(true);
    });

    it('nonmatching array', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.numbers', '!=', ['1', '2', '3'])
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
        item.satisfiesPredicate(new Predicate<any>('content.body', '=', body))
      ).toEqual(true);
    });

    it('nonmatching', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.body', '=', 'NotBody')
        )
      ).toEqual(false);
    });

    it('false and undefined should be equivalent', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.undefinedProperty', '=', false)
        )
      ).toEqual(true);
    });

    it('nonmatching array', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.numbers', '=', ['1'])
        )
      ).toEqual(false);
    });

    it('matching array', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.numbers', '=', ['1', '2', '3'])
        )
      ).toEqual(true);
    });

    it('nested keypath', () => {
      expect(
        item.satisfiesPredicate(
          new Predicate<any>('content.numbers.length', '=', numbers.length)
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
      const predicate = new Predicate('updated_at', '>', date);
      expect(item.satisfiesPredicate(predicate)).toEqual(false);
    });

    it('matching date value', () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 1);
      const predicate = new Predicate('updated_at', '<', date);
      expect(item.satisfiesPredicate(predicate)).toEqual(true);
    });

    it('matching days ago value', () => {
      expect(
        item.satisfiesPredicate(new Predicate('updated_at', '>', '30.days.ago'))
      ).toEqual(true);
    });

    it('nonmatching days ago value', () => {
      expect(
        item.satisfiesPredicate(new Predicate('updated_at', '<', '30.days.ago'))
      ).toEqual(false);
    });

    it('hours ago value', () => {
      expect(
        item.satisfiesPredicate(new Predicate('updated_at', '>', '1.hours.ago'))
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
          new Predicate<any>('content.foobar.length', '=', 0)
        )
      ).toEqual(false);
    });

    it('inequality operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', '!=', 'NotFoo'))
      ).toEqual(true);
    });

    it('equals operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', '=', 'NotFoo'))
      ).toEqual(false);
    });

    it('less than operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', '<', 3))
      ).toEqual(false);
    });

    it('greater than operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', '>', 3))
      ).toEqual(false);
    });

    it('less than or equal to operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', '<=', 3))
      ).toEqual(false);
    });

    it('includes operator', () => {
      expect(
        item.satisfiesPredicate(new Predicate<any>('foobar', 'includes', 3))
      ).toEqual(false);
    });
  });
});
