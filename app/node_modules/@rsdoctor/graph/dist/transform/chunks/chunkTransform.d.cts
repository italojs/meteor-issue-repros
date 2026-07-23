import { ChunkGraph } from '../../graph';
import { Plugin } from '@rsdoctor/types';
export declare function chunkTransform(assetMap: Map<string, {
    content: string;
}>, bundleStats: Plugin.StatsCompilation): ChunkGraph;
