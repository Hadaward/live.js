import { html } from "./lib/html.js";
import { useState } from "./lib/state.js";

export function app() {
    const count = useState(0);

    console.log(html`<div>${() => console.log('Hello')}${2 + 2}${count}</div>`)
}

app()