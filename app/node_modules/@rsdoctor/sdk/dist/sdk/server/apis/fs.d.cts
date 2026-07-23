import { SDK } from '@rsdoctor/types';
import { BaseAPI } from './base';
export declare class FileSystemAPI extends BaseAPI {
    applyErrorFix(): Promise<SDK.ServerAPI.InferResponseType<SDK.ServerAPI.API.ApplyErrorFix>>;
}
