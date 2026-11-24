import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { startLoading, succeed, failure, retry, renderSummary } from "../src/asyncState.ts";

describe('asyncState utilities', () => {
    it("startLoading sets status to 'loading' and attempt to 1", () => {
        const result = startLoading();
        assert.deepEqual(result, { status: "loading", attempt: 1 })
    })

    it("succeed sets status to 'success' and returns payload", () => {
        const result = succeed({ answerToLife: 42 })
        assert.deepEqual(result, {
            status: "success",
            data: {
                answerToLife: 42
            }
        });
    });

    it("failure sets status to 'failure' and returns error", () => {
        const error = new DOMException('Request timed out', 'TimeoutError')
        const result = failure(error, 3)
        assert.deepEqual(result, {
            status: "failure",
            error: error,
            attempt: 3
        });
    });

    it("a failed first attempt retries at attempt 2", () => {
        const loading = startLoading();
        const failed = failure(new DOMException('Request timed out', 'TimeoutError'), loading.attempt)
        const result = retry(failed);

        assert.deepEqual(result, {
            status: "loading",
            attempt: 2
        });
    });

    it("a successful renderSummary returns success message and its data", () => {
        const data = { color: "red" };
        const success = succeed(data)
        const result = renderSummary(success)
        assert.strictEqual(result, `Succeeded: ${JSON.stringify(data)}`)
    })

    it("a failed renderSummary returns failure message and its error", () => {
        const error = new Error("Boom");
        const failed = failure(error, 1);
        const result = renderSummary(failed)
        assert.strictEqual(result, "Failed on attempt 1: Boom")
    });

    it("a loading renderSummary returns loading message with current attempt", () => {
        const loading = startLoading();
        const result = renderSummary(loading);
        assert.strictEqual(result, `Loading (attempt 1)`)
    });

    it("a not-asked renderSummary returns a NotAsked message", () => {
        const result = renderSummary({ status: "not-asked" })
        assert.strictEqual(result, "Not Asked");
    });

    it("throws on an unknown at runtime", () => {
        assert.throws(() => {
            // @ts-expect-error: deliberately passing an invalid state
            renderSummary({ status: "fake" })
        });
    });
})


