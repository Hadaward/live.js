import { Live, live } from "./live.js";
import { LiveState, useState } from "./state.js";
export { useState, live };

const parser = new DOMParser();

export function html(htmlList: TemplateStringsArray, ...args: any[]): HTMLElement {
    let commonHTML = "";
    const tmpArgs = [...args];

    const states = new Map<string, LiveState<any>>();
    const callbacks = new Map<string, (event: Event) => void>();
    const renderElements = new Map<string, Live>();

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
            } else if (arg instanceof Live) {
                const uuid = crypto.randomUUID();
                renderElements.set(uuid, arg);

                commonHTML += `:´render@${uuid}´:`
            } else {
                commonHTML += String(arg);
            }
        }
    }

    const doc = parser.parseFromString(commonHTML, "text/html").body;

    for (const [id, state] of states.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const attrs = new Map(Array.from(element.attributes).filter(attribute => attribute.value.includes(`:´state@${id}´:`)).map(attr => [attr.name, attr.value]));
            const textNodes = Array.from(element.childNodes).filter(node => node instanceof Text && node.nodeValue?.includes(`:´state@${id}´:`)).map(node => ({ node, original: node.nodeValue }));

            attrs.forEach((_, key: string) => element.removeAttribute(key));
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

    for (const [id, render] of renderElements.entries()) {
        const elements = Array.from(doc.querySelectorAll('*')).map(element => {
            const textNodes = Array.from(element.childNodes).filter(node => node instanceof Text && node.nodeValue?.includes(`:´render@${id}´:`)).map(node => ({ node, original: node.nodeValue, parent: node.parentElement }));

            return {element, textNodes, ignore: textNodes.length === 0};
        }).filter(e => !e.ignore);

        const update = () => {
            for (const element of elements) {
                if (element.textNodes.length > 0) {
                    for (const node of element.textNodes) {
                        let toRender = render.callback();

                        if (node.parent === null)
                            continue;

                        node.parent.innerHTML = "";

                        if (Array.isArray(toRender)) {
                            for (const child of toRender) {
                                node.parent.append(...child.children);
                            }
                        } else {
                            node.parent.append(...toRender.children);
                        }
                    }
                }
            }
        }

        for (const state of render.usingStates) {
            state.addUpdateListener(update);
        }

        update();
    }

    return doc;
}