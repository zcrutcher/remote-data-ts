import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FakeHttpClient } from "./fakeHttpClient.ts";

describe("FakeHttpClient", () => {
    it("succeeds on the first call when no failures are configured", async () => {
        const client = new FakeHttpClient();
        const result = await client.request<{ name: string }>({ url: "/anything" });
        assert.equal(result.name, "Solaire of Astora");
        assert.equal(client.attempts, 1);
    });

    it("fails the first 2 calls, then succeeds on the 3rd", async () => {
        const client = new FakeHttpClient(2);
        await assert.rejects(client.request({ url: "/anything" }))
        await assert.rejects(client.request({ url: "/anything" }))
        const result = await client.request<{ name: string }>({ url: "/anything" });
        assert.equal(result.name, "Solaire of Astora");
        assert.equal(client.attempts, 3);
    });
});