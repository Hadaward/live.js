import { LiveNode } from "./node";
import { LiveState } from "./state";

export class Live {
    public callback: () => LiveNode;
    public usingStates: Readonly<LiveState<any>[]>;

    constructor(callback: () => LiveNode, usingStates: LiveState<any>[] = []) {
        this.callback = callback;
        this.usingStates = Object.freeze([...usingStates]);
    }
}

export function live(callback: () => LiveNode, usingStates: Readonly<Omit<LiveState<any>, "addUpdateListener">>[] = []) {
    return new Live(callback, usingStates as LiveState<any>[]);
}