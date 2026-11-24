export type RetryDecision =
    | { readonly action: "retry"; readonly delayMs: number }
    | { readonly action: "give-up" };

export interface RetryPolicy {
    decide(attempt: number, error: unknown): RetryDecision;
}