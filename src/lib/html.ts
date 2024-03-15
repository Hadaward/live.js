import { LiveComponent } from "./live.js";
import { LiveState } from "./state.js";

type LiveNode = HTMLElement|HTMLElement[]|HTMLCollection;
type ArgType = 'element' | 'function' | 'state' | 'live';

function argFormat(type: ArgType): { uuid: string, format: string } {
    const uuid = `${type}-${crypto.randomUUID()}`;
    return {
        uuid,
        format: `$live[${uuid}]`
    }
}

const domParser = new DOMParser();

export function html(template: TemplateStringsArray, ...args: any[]) {
    let parsedHTML = "";

    const argsRef = new Map<string, any>();

    for (const html of template) {
        const arg = args.shift();

        parsedHTML += html ?? "";

        if (arg !== undefined) {
            const type = ((Array.isArray(arg) && arg[0] instanceof HTMLElement)||arg instanceof HTMLElement||arg instanceof HTMLCollection)
                            ? 'element'
                            : (arg instanceof Function)
                            ? 'function'
                            : (arg instanceof LiveState)
                            ? 'state'
                            : (arg instanceof LiveComponent)
                            ? 'live'
                            : 'unknown';

            if (type === 'unknown') {
                parsedHTML += String(arg);
                continue;
            }

            const { uuid, format } = argFormat(type);
            
            parsedHTML += format;
            argsRef.set(uuid, arg);
        }
    }

    const element = domParser.parseFromString(parsedHTML, "text/html").body;

    for (const child of element.querySelectorAll("*")) {
        for (const [uuid, arg] of argsRef.entries()) {
            const attributes = new Map(Array.from(child.attributes).filter(attribute => attribute.value.includes(`$live[${uuid}]`)).map(attr => [attr.name, attr.value]));
            const textNodes = Array.from(child.childNodes).filter(node => node instanceof Text && node.nodeValue?.includes(`$live[${uuid}]`)).map(node => ({ node, original: node.nodeValue }));

            if (attributes.size > 0) {
                // parseAttributes(child, attributes, uuid, arg);
            }

            if (textNodes.length > 0) {
                // parseNodes(child, textNodes, uuid, arg);
            }
        }
    }

    return element;
}