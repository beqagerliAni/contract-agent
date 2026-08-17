export type SearchParamType = {
    text: string,
    // both are optional, leave them out to search across every company
    companyName?: string,
    type?: "client" | "vendor"
    // how many neighbours to retrieve, defaults to DEFAULT_KNN_K
    k?: number
}
