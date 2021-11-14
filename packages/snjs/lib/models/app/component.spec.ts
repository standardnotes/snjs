import { FillItemContent } from '@Models/functions';
import { ContentType } from './../../../../common/src/Domain/Content/ContentType';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { SNComponent } from '@Models/app/component';
describe('component model', () => {
  beforeEach(() => {
    const dateToLocalizedString = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SNComponent.prototype as any,
      'dateToLocalizedString'
    );
    dateToLocalizedString.mockImplementation(() => {
      return undefined;
    });
  });

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
