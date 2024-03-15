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
    `
}

document.body.append(app());