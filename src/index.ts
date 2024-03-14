import { html, state } from "./live.js";

export function app() {
    const count = state(0);

    return html`
    <div>
        <span>You clicked ${count} times</span>
        <button type="button" onclick=${() => {count.set(c => c + 1)}}>Click me</button>
    </div>
    `
}

document.body.append(app());