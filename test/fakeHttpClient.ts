import type { HttpRequest, HttpClient } from "../src/ports.ts";

export class FakeHttpClient implements HttpClient {
    attempts: number;
    failureCount: number;

    constructor(failureCount: number = 0) {
        this.attempts = 0;
        this.failureCount = failureCount;
    }
    request<T>(request: HttpRequest): Promise<T> {
        this.attempts++;
        return new Promise<T>((resolve, reject) => {
            if (this.failureCount >= this.attempts) {
                return reject(new Error("Failed to fetch data"));
            }

            return resolve(getSolaireData() as T)
        })
    }
}
function getSolaireData(): object {
    return {
        "name": "Solaire of Astora",
        "game": "Dark Souls",
        "voiceActor": "Daniel Flynn",
        "covenant": "Warrior of Sunlight",
        "humanity": 5
    }

}
