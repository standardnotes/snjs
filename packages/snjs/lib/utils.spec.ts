import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as never);

describe('utils', () => {
  it('sanitizeHtmlString', () => {
    const dirty = '<svg><animate onbegin=alert(1) attributeName=x dur=1s>';
    const cleaned = DOMPurify.sanitize(dirty);
    expect(cleaned).toEqual('<svg></svg>');
  });
});
