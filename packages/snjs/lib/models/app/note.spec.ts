import { SNNote } from '@Lib/index';
import { FillItemContent } from '@Models/functions';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { ContentType } from '@standardnotes/common';

const randUuid = () => String(Math.random());

const create = (payload?: Record<string, unknown>): SNNote => (new SNNote(
  CreateMaxPayloadFromAnyObject({
    uuid: randUuid(),
    content_type: ContentType.Note,
    content: FillItemContent({ ...payload }),
  })
));

describe('SNNote Tests', () => {
  it('should safely type required fields of Note when creating from PayloadContent', () => {
    const note = create({
      title: 'Expected string',
      text: ['unexpected array'],
      preview_plain: 'Expected preview',
      preview_html: {},
      hidePreview: 'string',
    });

    expect([
      typeof note.title,
      typeof note.text,
      typeof note.preview_html,
      typeof note.preview_plain,
      typeof note.hidePreview
    ]).toStrictEqual([
      'string',
      'string',
      'string',
      'string',
      'boolean'
    ])
  });

  it('should preserve falsy values when casting from PayloadContent', () => {
    const note = create({
      preview_plain: null,
      preview_html: undefined
    })
    
    expect(note.preview_plain).toBeFalsy()
    expect(note.preview_html).toBeFalsy()
  })

  it('should set mobilePrefersPlainEditor when given a valid choice', () => {
    const selected = create({
      mobilePrefersPlainEditor: true
    })

    const unselected = create()

    expect(selected.mobilePrefersPlainEditor).toBeTruthy()
    expect(unselected.mobilePrefersPlainEditor).toBe(undefined)
  })
});
