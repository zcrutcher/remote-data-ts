import { assertNever } from "./assertNever.ts";

export type NotAsked = { readonly status: "not-asked" };

export type Loading = {
    readonly status: "loading";
    readonly attempt: number;
};

export type Failure<E> = {
    readonly status: "failure";
    readonly error: E;
    readonly attempt: number;
}

export type Success<T> = {
    readonly status: "success";
    readonly data: T;
}

export type AsyncState<T, E = Error> =
    | NotAsked
    | Loading
    | Failure<E>
    | Success<T>;


export function startLoading(): Loading {
    return { status: "loading", attempt: 1 };
}

export function succeed<T>(data: T): Success<T> {
    return { status: "success", data }
}

export function retry<E>(failed: Failure<E>): Loading {
    return { status: "loading", attempt: failed.attempt + 1 };
}

export function failure<E>(error: E, attempt: number): Failure<E> {
    return { status: "failure", error, attempt }
}

export function renderSummary<T, E>(state: AsyncState<T, E>): string {
    switch (state.status) {
        case "success":
            return `Succeeded: ${JSON.stringify(state.data)}`
        case "failure":
            return `Failed on attempt ${state.attempt}: ${describeError(state.error)}`
        case "loading":
            return `Loading (attempt ${state.attempt})`;
        case "not-asked":
            return "Not Asked";
        default:
            return assertNever(state);
    }
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : JSON.stringify(error)
}