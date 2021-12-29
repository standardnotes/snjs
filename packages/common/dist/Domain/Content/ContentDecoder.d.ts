import { ContentDecoderInterface } from './ContentDecoderInterface';
export declare class ContentDecoder implements ContentDecoderInterface {
    decode(content: string, leftPaddingLength?: number): Record<string, unknown>;
    encode(content: Record<string, unknown>, leftPaddingLength?: number): string | undefined;
}
