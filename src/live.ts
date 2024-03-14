const parser = new DOMParser();

class LiveState<T> {
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

export function state<T>(initial: T): Readonly<Omit<LiveState<T>, 'addUpdateListener'>> {
    return new LiveState(initial);
}

export function html(htmlList: TemplateStringsArray, ...args: any[]) {
    let commonHTML = "";
    const tmpArgs = [...args];

    const states = new Map<string, LiveState<any>>();
    const callbacks = new Map<string, (event: Event) => void>();

    for (const html of htmlList) {
        const arg = tmpArgs.shift();

        commonHTML += html ?? "";

        if (arg !== undefined) {
            if (arg instanceof LiveState) {
                const uuid = crypto.randomUUID();
                states.set(uuid, arg);

                commonHTML += `:´state@${uuid}´:`
            } else if (arg instanceof Function) {
                const uuid = crypto.randomUUID();
                callbacks.set(uuid, arg);

                commonHTML += `:´callback@${uuid}´:`
            }
        }
    }

    const doc = parser.parseFromString(commonHTML, "text/html").body;

    for (const [id, state] of states.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const attrs = new Map(Array.from(element.attributes).filter(attribute => attribute.value.includes(`:´state@${id}´:`)).map(attr => [attr.name, attr.value]));
            const textNodes = Array.from(element.childNodes).filter(node => node instanceof Text && node.nodeValue?.includes(`:´state@${id}´:`)).map(node => ({ node, original: node.nodeValue }));

            return {element, attrs, textNodes, ignore: textNodes.length === 0 && attrs.size === 0};
        }).filter(e => !e.ignore);

        const update = () => {
            for (const element of elements) {
                if (element.attrs.size > 0) {
                    for (const [attr, original] of element.attrs.entries()) {
                        // @ts-ignore
                        element.element[attr] = original.replaceAll(`:´state@${id}´:`, state.get());
                    }
                }

                if (element.textNodes.length > 0) {
                    for (const node of element.textNodes) {
                        node.node.nodeValue = node.original?.replaceAll(`:´state@${id}´:`, state.get()) ?? "";
                    }
                }
            }
        }

        update();

        if (elements.length > 0) {
            state.addUpdateListener(update);
        }
    }

    for (const [id, callback] of callbacks.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const attrs = new Set(Array.from(element.attributes).filter(attribute => attribute.value.includes(`:´callback@${id}´:`)).map(attr => attr.name));

            return {element, attrs, ignore: attrs.size === 0};
        }).filter(e => !e.ignore);

        for (const element of elements) {
            for (const attr of element.attrs.values()) {
                element.element.removeAttribute(attr);
                // @ts-ignore
                element.element[attr] = callback;
            }
        }
    }

    return doc;
}