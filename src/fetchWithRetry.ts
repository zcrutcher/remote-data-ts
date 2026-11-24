import type { Clock, HttpClient, HttpRequest } from "./ports.ts";
import type { RetryPolicy } from "./retryPolicy.ts";
import { failure, retry, startLoading, succeed } from "./asyncState.ts";
import type { Failure, Loading, Success } from "./asyncState.ts";

export type FetchDeps = {
    readonly client: HttpClient;
    readonly clock: Clock;
    readonly policy: RetryPolicy;
}

export async function fetchWithRetry<T>(
    request: HttpRequest,
    deps: FetchDeps,
): Promise<Success<T> | Failure<unknown>> {
    let state: Loading = startLoading();

    while (true) {
        try {
            const data = await deps.client.request<T>(request);
            return succeed(data);
        }
        catch (error) {
            const failed = failure(error, state.attempt);
            const decision = deps.policy.decide(failed.attempt, error);

            if (decision.action === "give-up") {
                return failed;
            }

            await deps.clock.sleep(decision.delayMs);
            state = retry(failed)
        }
    }
}