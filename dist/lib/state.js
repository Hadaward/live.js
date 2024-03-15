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
export class LiveState {
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
export function useState(initial) {
    return new LiveState(initial);
}
