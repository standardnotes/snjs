import { FillItemContent } from '@Models/functions';
import { ContentType } from '@standardnotes/common';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { SNComponent } from '@Models/app/component';
import { trimEnd, truncate, zip } from 'lodash';
import { tsExpressionWithTypeArguments } from '@babel/types';

describe('migration 3.0.0: folders component to hierarchy', () => {
  it('should produce a valid hierarchy in the simple case', () => {
    const titles = ['a', 'a.b', 'a.b.c'];
    // run migration
    const result = {
      a: {
        b: {
          c: true,
        },
      },
    };
  });

  it('should not touch flat hierarchies', () => {
    const titles = ['a', 'x', 'y', 'z'];
    // run migration
    const result = {
      a: true,
      x: true,
      y: true,
      z: true,
    };
  });

  it('should work despite cloned tags', () => {
    const titles = ['a.b', 'c', 'a.b'];
    // run migration
    const result = {
      a: {
        b: true,
      },
      c: true,
    };
  });

  it('should produce a valid hierarchy cases with  missing intermediate tags or unordered', () => {
    const titles = ['y.2', 'w.3', 'y'];
    // run migration
    const result = {
      y: {
        2: true,
      },
      w: {
        3: true,
      },
    };
  });

  it('deal with unmanaged names correctly', () => {
    const titles = ['.something'];
    // run migration
    const result = {
      '.something': true,
    };
  });
});
