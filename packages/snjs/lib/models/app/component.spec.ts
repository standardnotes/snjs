import { FillItemContent, CreateMaxPayloadFromAnyObject } from '@standardnotes/payloads';
import { ContentType } from '@standardnotes/common';
import { SNComponent } from '@Models/app/component';

describe('component model', () => {

  it('valid hosted url should ignore url', () => {
    const component = new SNComponent(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Component,
        content: FillItemContent({
          url: 'http://foo.com',
          hosted_url: 'http://bar.com',
        }),
      })
    );

    expect(component.hasValidHostedUrl()).toBe(true);
    expect(component.hosted_url).toBe('http://bar.com');
  });

  it('invalid hosted url should fallback to url', () => {
    const component = new SNComponent(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Component,
        content: FillItemContent({
          url: 'http://foo.com',
          hosted_url: '#{foo.zoo}',
        }),
      })
    );

    expect(component.hasValidHostedUrl()).toBe(true);
    expect(component.hosted_url).toBe('http://foo.com');
  });
});
