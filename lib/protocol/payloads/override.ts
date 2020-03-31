import { PurePayload } from '@Payloads/pure_payload';
import { PayloadFields } from '@Payloads/fields';

export type PayloadOverride = {
    [key in PayloadFields]?: any;
} | PurePayload