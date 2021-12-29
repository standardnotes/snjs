import { PayloadContent } from './generator';
import { PurePayload } from './pure_payload';
/** A payload but guaranteed not to be errorDecrypting, and thus has objectified content */
export declare type SurePayload = PurePayload & {
    content: PayloadContent;
};
