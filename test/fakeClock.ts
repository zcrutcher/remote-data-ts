import type { Clock } from "../src/ports.ts";

export class FakeClock implements Clock {
    private current = 0;
    readonly sleeps: number[] = [];

    now(): number {
        return this.current;
    }

    sleep(ms: number): Promise<void> {
        this.sleeps.push(ms);
        this.current += ms;
        return Promise.resolve();
    }
}