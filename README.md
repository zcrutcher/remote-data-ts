# remote-data-ts

[![CI](https://github.com/zcrutcher/remote-data-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/zcrutcher/remote-data-ts/actions/workflows/ci.yml)

Elm's `RemoteData` pattern in TypeScript, paired with a retry/backoff engine whose time and network dependencies are injected, so every behavior is testable without waiting or touching the network.

## Quick start

```bash
npm install
npm run typecheck
npm test
npm run demo
```

Requires Node 22.18+ (runs `.ts` files directly, no build step).

## Usage

```ts
import {
  ExponentialBackoff,
  FetchHttpClient,
  SystemClock,
  fetchWithRetry,
  renderSummary,
} from "./src/index.ts";

const result = await fetchWithRetry<{ name: string }>(
  { url: "https://api.example.com/users/1" },
  {
    client: new FetchHttpClient(),
    clock: new SystemClock(),
    policy: new ExponentialBackoff({ maxAttempts: 4, baseDelayMs: 200, maxDelayMs: 5000 }),
  },
);

console.log(renderSummary(result));
```

## The state type

```ts
type AsyncState<T, E = Error> =
  | { status: "not-asked" }
  | { status: "loading"; attempt: number }
  | { status: "failure"; error: E; attempt: number }
  | { status: "success"; data: T };
```

A discriminated union tagged by `status`. TypeScript only exposes `data` after you've checked for `"success"`, and `error` after `"failure"`. `renderSummary` uses an exhaustive `switch` with an `assertNever` check, so adding a variant (say `Stale` or `RateLimited`) makes every handler fail to compile until it's updated.

## Design notes

- **Pure transitions.** `startLoading`, `succeed`, `failure`, and `retry` take values and return new values. Nothing is mutated, and `retry` only accepts a `Failure`, so retrying from the wrong state is a compile error.
- **Ports for the outside world.** `HttpClient` and `Clock` are interfaces. `fetchWithRetry` never calls `fetch` or `setTimeout` directly.
- **Fake time.** Tests use a `FakeClock` whose `sleep` returns instantly and records the requested delay, so backoff behavior can be asserted exactly and the suite runs in milliseconds.
- **Retry as a pure decision.** `RetryPolicy.decide(attempt, error)` returns either `retry` with a delay or `give-up`. It does no waiting and no I/O, so it's tested with plain number checks.
- **Runtime-agnostic core.** Only `SystemClock` and `FetchHttpClient` touch the runtime. The rest uses nothing Node-specific.

## Project layout

```
src/        types, transitions, policy, fetchWithRetry, real + fake adapters
test/       node:test suites
examples/   runnable demo
```

## Known limitations and future work

- `FetchHttpClient` casts the parsed JSON to `T` without validating it. A schema library would close that gap.
- The policy receives the error but the built-in backoff ignores it. A status-aware policy could skip retries for a 404 and keep retrying a 503 (`HttpError` already carries the status).
- No jitter yet. It would need an injected random source to stay testable.
- `fetchWithRetry` returns only the final state. An `onStateChange` callback would let a UI show each `loading` attempt.

## License

MIT