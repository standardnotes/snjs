import { ContentType } from '@standardnotes/common'
import { CreateMaxPayloadFromAnyObject } from '../../Abstract/Payload/Utilities/Functions'
import { FillItemContent } from '../../Abstract/Item/ItemContent'
import { SNComponent } from './Component'
import { ComponentContent } from './ComponentContent'

describe('component model', () => {
  it('valid hosted url should ignore url', () => {
    const component = new SNComponent(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Component,
        content: FillItemContent<ComponentContent>({
          url: 'http://foo.com',
          hosted_url: 'http://bar.com',
        } as ComponentContent),
      }),
    )

    expect(component.hasValidHostedUrl()).toBe(true)
    expect(component.hosted_url).toBe('http://bar.com')
  })

  it('invalid hosted url should fallback to url', () => {
    const component = new SNComponent(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Component,
        content: FillItemContent({
          url: 'http://foo.com',
          hosted_url: '#{foo.zoo}',
        } as ComponentContent),
      }),
    )

    expect(component.hasValidHostedUrl()).toBe(true)
    expect(component.hosted_url).toBe('http://foo.com')
  })
})
