var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LiveState_value, _LiveState_updateListeners;
const parser = new DOMParser();
class LiveState {
    constructor(initial) {
        _LiveState_value.set(this, void 0);
        _LiveState_updateListeners.set(this, new Set());
        __classPrivateFieldSet(this, _LiveState_value, initial, "f");
    }
    set(value) {
        if (value instanceof Function) {
            __classPrivateFieldSet(this, _LiveState_value, value(__classPrivateFieldGet(this, _LiveState_value, "f")), "f");
        }
        else {
            __classPrivateFieldSet(this, _LiveState_value, value, "f");
        }
        __classPrivateFieldGet(this, _LiveState_updateListeners, "f").forEach(callback => callback(__classPrivateFieldGet(this, _LiveState_value, "f")));
    }
    get() {
        return __classPrivateFieldGet(this, _LiveState_value, "f");
    }
    addUpdateListener(callback) {
        __classPrivateFieldGet(this, _LiveState_updateListeners, "f").add(callback);
    }
}
_LiveState_value = new WeakMap(), _LiveState_updateListeners = new WeakMap();
export function state(initial) {
    return new LiveState(initial);
}
export function html(htmlList, ...args) {
    let commonHTML = "";
    const tmpArgs = [...args];
    const states = new Map();
    const callbacks = new Map();
    for (const html of htmlList) {
        const arg = tmpArgs.shift();
        commonHTML += html !== null && html !== void 0 ? html : "";
        if (arg !== undefined) {
            if (arg instanceof LiveState) {
                const uuid = crypto.randomUUID();
                states.set(uuid, arg);
                commonHTML += `:´state@${uuid}´:`;
            }
            else if (arg instanceof Function) {
                const uuid = crypto.randomUUID();
                callbacks.set(uuid, arg);
                commonHTML += `:´callback@${uuid}´:`;
            }
        }
    }
    const doc = parser.parseFromString(commonHTML, "text/html").body;
    for (const [id, state] of states.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const attrs = new Map(Array.from(element.attributes).filter(attribute => attribute.value.includes(`:´state@${id}´:`)).map(attr => [attr.name, attr.value]));
            const textNodes = Array.from(element.childNodes).filter(node => { var _a; return node instanceof Text && ((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.includes(`:´state@${id}´:`)); }).map(node => ({ node, original: node.nodeValue }));
            return { element, attrs, textNodes, ignore: textNodes.length === 0 && attrs.size === 0 };
        }).filter(e => !e.ignore);
        const update = () => {
            var _a, _b;
            for (const element of elements) {
                if (element.attrs.size > 0) {
                    for (const [attr, original] of element.attrs.entries()) {
                        // @ts-ignore
                        element.element[attr] = original.replaceAll(`:´state@${id}´:`, state.get());
                    }
                }
                if (element.textNodes.length > 0) {
                    for (const node of element.textNodes) {
                        node.node.nodeValue = (_b = (_a = node.original) === null || _a === void 0 ? void 0 : _a.replaceAll(`:´state@${id}´:`, state.get())) !== null && _b !== void 0 ? _b : "";
                    }
                }
            }
        };
        update();
        if (elements.length > 0) {
            state.addUpdateListener(update);
        }
    }
    for (const [id, callback] of callbacks.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const attrs = new Set(Array.from(element.attributes).filter(attribute => attribute.value.includes(`:´callback@${id}´:`)).map(attr => attr.name));
            return { element, attrs, ignore: attrs.size === 0 };
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
