export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpRequest = {
    readonly url: string;
    readonly method?: HttpMethod;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
};

export interface HttpClient {
    request<T>(req: HttpRequest): Promise<T>;
}

export interface Clock {
    now(): number;
    sleep(ms: number): Promise<void>;
}