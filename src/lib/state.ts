export type LiveStateUpdateCallback<T> = (newValue: T) => void;

export class LiveState<T> {
    #value: T;

    constructor(initial: T) {
        this.#value = initial;
    }

    get(): T {
        return this.#value;
    }

    set(value: T|((current: T) => T)) {
        if (value instanceof Function) {
            this.#value = value(this.#value);
        } else {
            this.#value = value;
        }
    }
}

export function useState<T>(initial: T): LiveState<T> {
    return new LiveState(initial);
}