import { Injectable } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
import OpenAI from "openai";
import { SearchParamType } from "./type/searchParam.type";
import { getIndexConfig } from "./mapping";
import { IndexableDocument } from "./type/indexConfig.type";

@Injectable()
export class OpenSearchService {
    constructor() { }
    client = new Client({
        node: process.env.OPENSEARCH_NODE,
        ssl: { rejectUnauthorized: false }
    })

    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    private async createEmbedding(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: process.env.OPENAI_EMBEDDINGS_MODEL ?? 'text-embedding-3-small',
            input: text,
        })
        return response.data[0].embedding
    }

    async createIndex(indexName: string = 'companies') {
        const exists = await this.client.indices.exists({ index: indexName })
        if (exists.body) {
            return { created: false, index: indexName }
        }

        await this.client.indices.create({
            index: indexName,
            body: getIndexConfig(indexName).mapping,
        })
        return { created: true, index: indexName }
    }

    async createDocument(indexName: string = 'companies', documents: unknown[]) {
        await this.createIndex(indexName)

        const { schema, labelField } = getIndexConfig(indexName)
        const created: string[] = []

        for (const item of documents) {
            const document = schema.parse(item) as IndexableDocument
            const embedding = await this.createEmbedding(document.content)

            await this.client.index({
                index: indexName,
                body: { ...document, embedding },
                refresh: true,
            })

            created.push(String(document[labelField]))
        }

        return { created: created.length, documents: created }
    }

    async retriveInformation(indexName: string = 'companies', searchParam: SearchParamType) {
        const queryEmbedding = await this.createEmbedding(searchParam.text)

        const filter: Record<string, unknown>[] = []
        if (searchParam.companyName) {
            filter.push({ term: { company_name: searchParam.companyName } })
        }
        if (searchParam.type) {
            filter.push({ term: { type: searchParam.type } })
        }

        const result = await this.client.search({
            index: indexName,
            body: {
                _source: { excludes: ['embedding'] },
                query: {
                    bool: {
                        must: [
                            {
                                knn: {
                                    embedding: { vector: queryEmbedding, k: 3 }
                                }
                            }
                        ],
                        filter
                    }
                }
            }
        })
        return result
    }
}