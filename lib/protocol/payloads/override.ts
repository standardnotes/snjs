import { PayloadFields } from '@Payloads/fields';

export type PayloadOverride = {
    [key in PayloadFields]?: any;
}