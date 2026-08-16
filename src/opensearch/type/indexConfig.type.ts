import { ZodTypeAny } from 'zod';

export type IndexConfig = {
    mapping: Record<string, unknown>;
    // validates a document before it is indexed, must produce a "content" field to embed
    schema: ZodTypeAny;
    // the field reported back after indexing, so the caller sees what landed
    labelField: string;
};

// every indexed document carries the text we build the embedding from
export type IndexableDocument = Record<string, unknown> & { content: string };
