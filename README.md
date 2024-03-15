# live.js
A lightweight pure javascript framework made just for learn and fun.

- :warning: Reasons to not use it in production or web dev:
  - Not performant.
  - Made just for learning and fun purposes.
  - Will not be mantained.
  - May have bugs.
  - Doesn't react properly to state changes while already rendering something.
  - Its just a proof of concept.
 
- Features:
    - It's capable of rendering html out of template literals using [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
    - It's capable of creating states with the help of template literals to integrate it into the dom.
    - It's capable to react to state changes using the ``live`` method.
    - Can't render custom components, unless you use it like:
        ```ts
        function myComp(message: string) {
          return html`<span>Custom component ${message}</span>`;
        }

        function app() {
          return html`<div className="app">${app("Hello world")}</div>`
        }
        ```
        ⚠️It will work in the next commit, so it doesn't work yet. But this would be the way to use custom components.

## Example of a notes app
- Features:
    - Add notes
    - Show/hide notes
      
```ts
import { html, useState, live } from "./lib/index.js";

export function app() {
    const todoList = useState<string[]>([]);
    const textInput = useState("");
    const showNotes = useState(false);

    const handleAddNote = function() {
        const value = textInput.get();
        todoList.set(todoList => [...todoList, value]);
        textInput.set("");
    }

    return html`
    <div className="app">
        <div>
            <label>Type your notes:</label>
            <input type="text" onchange=${(e: any) => textInput.set(e.target.value)} value=${textInput} />
            <button type="button" onclick=${handleAddNote}>Add</button>
            <button type="button" onclick=${(e: any) => showNotes.set(show => !show)}>${live(() => html`<span>${showNotes.get() ? "Hide notes" : "Show notes"}</span>`, [showNotes])}</button>
        </div>
        <div>
            <ul>
                ${
                    live(
                        () => (showNotes.get() ? todoList.get() : []).map(note => html`<li>${note}</li>`),
                        [todoList, showNotes]
                    )
                }
            </ul>
        </div>
    </div>
    `;
}

document.body.append(app());
```
