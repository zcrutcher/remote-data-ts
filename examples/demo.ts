import { ExponentialBackoff, SystemClock, fetchWithRetry, renderSummary } from "../src/index.ts";
import { FakeHttpClient } from "../test/fakeHttpClient.ts";

const clock = new SystemClock();
const policy = new ExponentialBackoff({ maxAttempts: 3, baseDelayMs: 200, maxDelayMs: 2000 });

async function run(label: string, failures: number) {
    const client = new FakeHttpClient(failures);
    const started = clock.now();

    const result = await fetchWithRetry({ url: "/solaire" }, { client, clock, policy });

    console.log(`${label}: ${renderSummary(result)}`);
    console.log(`  calls: ${client.attempts}, elapsed: ${clock.now() - started} ms`);
}

await run("Flaky server (fails twice)", 2);
await run("Dead server (always fails)", 10)