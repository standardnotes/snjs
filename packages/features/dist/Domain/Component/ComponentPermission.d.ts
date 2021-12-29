import { ContentType } from '@standardnotes/common';
import { ComponentAction } from './ComponentAction';
export declare type ComponentPermission = {
    name: ComponentAction;
    content_types?: ContentType[];
};
