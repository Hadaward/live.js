export class LiveState<T> {
    #value: T;
    #updateListeners = new Set<(newValue: T) => void>()

    constructor(initial: T) {
        this.#value = initial;
    }

    set(value: T|((current: T) => T)) {
        if (value instanceof Function) {
            this.#value = value(this.#value);
        } else {
            this.#value = value;
        }

        this.#updateListeners.forEach(callback => callback(this.#value));
    }

    get(): T {
        return this.#value;
    }

    addUpdateListener(callback: (newValue: T) => void) {
        this.#updateListeners.add(callback);
    }
}

export function useState<T>(initial: T): Readonly<Omit<LiveState<T>, 'addUpdateListener'>> {
    return new LiveState(initial);
}