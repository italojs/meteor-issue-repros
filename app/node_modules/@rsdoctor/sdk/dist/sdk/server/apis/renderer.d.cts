import { SDK } from '@rsdoctor/types';
import { BaseAPI } from './base';
export declare class RendererAPI extends BaseAPI {
    /** sdk manifest api */
    entryHtml(): Promise<SDK.ServerAPI.InferResponseType<SDK.ServerAPI.API.EntryHtml>>;
}
