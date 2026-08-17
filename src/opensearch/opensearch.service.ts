import { Injectable } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
import OpenAI from "openai";
import { SearchParamType } from "./type/searchParam.type";
import { getIndexConfig } from "./mapping";
import { IndexableDocument } from "./type/indexConfig.type";

// small corpora here, returning a few extra rows costs nothing and stops a
// relevant policy or company being crowded out
const DEFAULT_KNN_K = 10

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

        // k is how many neighbours the knn walk keeps. our filters are applied AFTER that
        // (opensearch 1.3 has no filtered knn), so k has to be comfortably bigger than the
        // number of results we actually want or the filter can leave us with nothing
        const k = searchParam.k ?? DEFAULT_KNN_K

        const result = await this.client.search({
            index: indexName,
            body: {
                size: k,
                _source: { excludes: ['embedding'] },
                query: {
                    bool: {
                        must: [
                            {
                                knn: {
                                    embedding: { vector: queryEmbedding, k }
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