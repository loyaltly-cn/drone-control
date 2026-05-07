export interface IPipelineStage<TInput = any, TOutput = any> {
    name: string;
    process: (data: TInput) => Promise<TOutput> | TOutput;
    can_process?: (data: TInput) => boolean;
}

export interface PipelineConfig {
    name: string;
    stages: IPipelineStage[];
    error_handler?: (error: Error, stage: IPipelineStage, data: any) => void;
}

export interface ParseResult {
    packets: any[];
    remaining: Uint8Array;
}