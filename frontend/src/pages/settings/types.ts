export type ApiKeyType = {
    api_key: string;
    label: string;
    masked_key: string;
    created_at: number;
    status: string;
    id: string;

}

export type APIKeysType = {
    api_keys: ApiKeyType[];
}