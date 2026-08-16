const EMBEDDING_DIMENSION = 1536;

export const companyMapping = {
    settings: {
        index: {
            knn: true,
            'knn.algo_param.ef_search': 100,
        },
    },
    mappings: {
        properties: {
            company_name: {
                type: 'keyword',
                fields: {
                    text: { type: 'text' },
                },
            },
            type: { type: 'keyword' },
            status: { type: 'keyword' },
            industry: { type: 'keyword' },
            primary_contact: { type: 'keyword' },
            relationship_since: {
                type: 'date',
                format: 'yyyy-MM',
            },
            risk_level: { type: 'keyword' },
            notes: { type: 'text' },
            content: { type: 'text' },
            embedding: {
                type: 'knn_vector',
                dimension: EMBEDDING_DIMENSION,
                method: {
                    name: 'hnsw',
                    space_type: 'l2',
                    engine: 'faiss',
                },
            },
        },
    },
};
