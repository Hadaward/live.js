export class Live {
    constructor(callback, usingStates = []) {
        this.callback = callback;
        this.usingStates = Object.freeze([...usingStates]);
    }
}
export function live(callback, usingStates = []) {
    return new Live(callback, usingStates);
}
