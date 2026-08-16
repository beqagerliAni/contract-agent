import { ZodTypeAny } from 'zod';
import { companyMapping } from './company.mapping';
import { policyMapping } from './policy.mapping';
import { CompanySchema } from '../../agents/contract-agent/schema/company.schema';
import { PolicySchema } from '../../agents/contract-agent/schema/policy.schema';
import { IndexConfig } from '../type/indexConfig.type';

// everything an index needs, in one place. adding a new index means adding one entry here
// and createIndex / createDocument both work with it, no service changes
export const indexRegistry: Record<string, IndexConfig> = {
    companies: {
        mapping: companyMapping,
        schema: CompanySchema as ZodTypeAny,
        // which field to report back so you can see what went in
        labelField: 'company_name',
    },
    policies: {
        mapping: policyMapping,
        schema: PolicySchema as ZodTypeAny,
        labelField: 'title',
    },
};

export const getIndexConfig = (indexName: string): IndexConfig => {
    const config = indexRegistry[indexName];
    if (!config) {
        throw new Error(
            `No config registered for index "${indexName}". Add it to src/opensearch/mapping/index.ts`,
        );
    }
    return config;
};
