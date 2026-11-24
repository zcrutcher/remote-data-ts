import type { RetryDecision, RetryPolicy } from "./retryPolicy.ts";

export type BackoffConfig = {
    readonly maxAttempts: number;
    readonly baseDelayMs: number;
    readonly maxDelayMs: number;
};

export class ExponentialBackoff implements RetryPolicy {
    private readonly config: BackoffConfig;

    constructor(config: BackoffConfig) {
        this.config = config;
    }

    decide(attempt: number, _error: unknown): RetryDecision {
        if (attempt >= this.config.maxAttempts) {
            return { action: "give-up" }
        }
        const delay = this.config.baseDelayMs * 2 ** (attempt - 1);
        return { action: "retry", delayMs: Math.min(delay, this.config.maxDelayMs) };
    }
}