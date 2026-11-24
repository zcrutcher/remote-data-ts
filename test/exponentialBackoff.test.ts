import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExponentialBackoff } from "../src/exponentialBackoff.ts";

describe("ExponentialBackoff", () => {
    const policy = new ExponentialBackoff({
        maxAttempts: 4,
        baseDelayMs: 100,
        maxDelayMs: 300
    });

    it("doubles the delay after each failed attempt", () => {
        assert.deepEqual(policy.decide(1, new Error("boom")), { action: "retry", delayMs: 100 });
        assert.deepEqual(policy.decide(2, new Error("boom")), { action: "retry", delayMs: 200 });
    });

    it("caps the delay at maxDelaysMs", () => {
        assert.deepEqual(policy.decide(3, new Error("boom")), { action: "retry", delayMs: 300 });
    });

    it("gives up once maxAttempts is reached", () => {
        assert.deepEqual(policy.decide(4, new Error("boom")), { action: "give-up" });
    });
})