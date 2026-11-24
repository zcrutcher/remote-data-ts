import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fetchWithRetry } from "../src/fetchWithRetry.ts";
import { ExponentialBackoff } from "../src/exponentialBackoff.ts";
import { FakeClock } from "./fakeClock.ts";
import { FakeHttpClient } from "./fakeHttpClient.ts";

describe("fetchWithRetry", () => {
    const request = { url: "/anything" }

    function makePolicy(maxAttempts: number) {
        return new ExponentialBackoff({ maxAttempts, baseDelayMs: 100, maxDelayMs: 1000 });
    }

    it("succeeds immediately without waiting", async () => {
        const client = new FakeHttpClient(0);
        const clock = new FakeClock();

        const result = await fetchWithRetry(request, { client, clock, policy: makePolicy(3) });

        assert.equal(result.status, "success");
        assert.equal(client.attempts, 1);
        assert.deepEqual(clock.sleeps, []);
    });

    it("retries with growing delays until it succeeds", async () => {
        const client = new FakeHttpClient(2);
        const clock = new FakeClock();

        const result = await fetchWithRetry(request, { client, clock, policy: makePolicy(5) });

        assert.equal(result.status, "success");
        assert.equal(client.attempts, 3)
        assert.deepEqual(clock.sleeps, [100, 200]);
    });

    it("gives up when the policy runs out of attempts", async () => {
        const client = new FakeHttpClient(5);
        const clock = new FakeClock();

        const result = await fetchWithRetry(request, { client, clock, policy: makePolicy(3) });

        assert.deepEqual(result, {
            status: "failure",
            error: new Error("Failed to fetch data"),
            attempt: 3,
        });
        assert.equal(client.attempts, 3);
        assert.deepEqual(clock.sleeps, [100, 200]);
    });
})