export type SearchParamType = {
    text: string,
    // both are optional, leave them out to search across every company
    companyName?: string,
    type?: "client" | "vendor"
}
