const EMBEDDING_DIMENSION = 1536;

export const policyMapping = {
    settings: {
        index: {
            knn: true,
            'knn.algo_param.ef_search': 100,
        },
    },
    mappings: {
        properties: {
            policy_id: { type: 'keyword' },
            category: { type: 'keyword' },
            title: {
                type: 'keyword',
                fields: {
                    text: { type: 'text' },
                },
            },
            rule: { type: 'text' },
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
