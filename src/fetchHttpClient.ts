import type { HttpClient, HttpRequest } from "./ports.ts";

export class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

export class FetchHttpClient implements HttpClient {
    async request<T>(req: HttpRequest): Promise<T> {
        const init: RequestInit = { method: req.method ?? "GET" };
        if (req.headers) init.headers = { ...req.headers };
        if (req.body !== undefined) init.body = JSON.stringify(req.body);

        const response = await fetch(req.url, init);

        if (!response.ok) {
            throw new HttpError(response.status, `HTTP ${response.status} ${response.statusText}`);
        }
        return (await response.json()) as T;
    }
}