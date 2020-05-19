import React from "react";
import hljs from "highlight.js";

const DB_SAVE_THRESHOLD = 500;

const BRACKETS = new Map([
  ["{", "}"],
  ["[", "]"],
  ["(", ")"]
]);

const placeHolderContent = `# You can add some checklist
- [ ] Like this one
- [x] And mark it as finished

# Or some ordered list
1. Like this one
2. Or this one

You can put some **note** here _as well_.

> Basically, not ~~all markdown _are_ supported~~.

But it's \`good\` enough for your notetaking experience.

   {
     "app": "Markdone",
     "platform": "Web"
   }

You can add a @tag or @longer-tag like this.

And some [clickable link](https://markdone.now.sh) as well!

You can prioritize your task using !high or !medium or !low.`;

class Notepad extends React.Component {
  constructor() {
    super();
    this.state = {
      highlightedHTML: "",
      user: false,
      needLogin: false
    };
  }

  highlightCode(input) {
    // at the end of the textarea, there will always be an extra space, so
    // we add an extra space here to match it.
    var codeHighlight = hljs.highlight("markdown", input).value + "\n\n";
    // clickable link
    codeHighlight = codeHighlight.replace(
      /(\[.*?\]\((.*?)\))/g,
      (match, all, link) => {
        let m = link.match(/\>(.*?)\</);
        if (m && m.length > 1) {
          return `<a target="_blank" rel="noopener noreferrer" class="inline-url" href="${
            m[1]
          }">${all}</a>`;
        } else return match;
      }
    );
    // strikethrough
    codeHighlight = codeHighlight.replace(
      /~~(.*?)~~/g,
      '<span class="strikethrough">~~$1~~</span>'
    );
    // checkable todo list
    codeHighlight = codeHighlight.replace(
      /(\[ \])\ (.*?\n)/g,
      '<span class="marked-list"><span class="invisible">$1</span> $2</span>'
    );
    codeHighlight = codeHighlight.replace(
      /(\[x\])\ (.*?\n)/g,
      '<span class="marked-list checked"><span class="invisible">$1</span> $2</span>'
    );
    // tagging
    codeHighlight = codeHighlight.replace(
      /@(?=\S*['-]?)([0-9a-zA-Z\(\)'"-=]+)/g,
      '<span class="inline-tag">@$1</span>'
    );
    // priority
    codeHighlight = codeHighlight.replace(
      /!(high|medium|low)/gi,
      (_, priority) =>
        `<span class="inline-priority ${priority.toLowerCase()}">!${priority}</span>`
    );
    return codeHighlight;
  }

  syncScroll(element) {
    this.editorHighlight.scrollTop = element.scrollTop;
  }

  lineFromPos(p, text) {
    let count = 0;
    for (var i = 0; i < p; i++) {
      if (text[i] === "\n") count++;
    }
    return count + 1;
  }

  syncInputConent(e, element) {
    // sync text
    var textToSync = e.target.value;
    const keyPressed = e.key;

    // Only execute when user press ENTER
    textToSync = this.editAssistantHitReturn(keyPressed, element, e, textToSync);

    // User pressed a left bracket (, [, or {
    // We'll insert a corresponding right bracket and move the cursor to the center
    textToSync = this.editAssistantHitBracket(keyPressed, element, e, textToSync);

    this.syncScroll(element);

    if (window.lastSave && window.localStorage) {
      let timeSinceLastSave = Date.now() - window.lastSave;
      if (timeSinceLastSave >= DB_SAVE_THRESHOLD) {
        window.localStorage.setItem('note', element.value);
        window.lastSave = Date.now();
      }
    }

    this.setState({ highlightedHTML: this.highlightCode(textToSync) });
  }

  editAssistantHitBracket(keyPressed, element, e, textToSync) {
    if (BRACKETS.has(keyPressed)) {
      var cursorPos = element.selectionStart;
      let left = textToSync.substring(0, cursorPos);
      let right = textToSync.substring(cursorPos);
      textToSync = left + keyPressed + BRACKETS.get(keyPressed) + right;
      element.value = textToSync;
      element.selectionEnd = cursorPos + 1;
      e.preventDefault();
    }
    return textToSync;
  }

  editAssistantHitReturn(keyPressed, element, e, textToSync) {
    if (keyPressed === "Enter") {
      var cursorPos = element.selectionStart;
      var currentLine = this.lineFromPos(cursorPos, e.target.value);
      var newCursorPos = cursorPos;
      var lines = textToSync.split("\n");
      let dirty = false;
      var previousLine = lines[currentLine - 1] || "";
      // Numbered list
      var previousNumber = parseInt(previousLine.match(/(\d+)\. [\[|\w|\!]+/g));
      if (!isNaN(previousNumber)) {
        lines.splice(currentLine, 0, previousNumber + 1 + ". ");
        newCursorPos += 4;
        dirty = true;
      }
      // Exit the bullet list
      if (previousLine.match(/(\d+)\. $/g)) {
        lines[currentLine - 1] = "";
        if (newCursorPos === textToSync.length) {
          lines.splice(currentLine, 0, "\n");
        }
        newCursorPos -= 2;
        dirty = true;
      }
      // Un-ordered list
      if (previousLine.match(/- [\[|\w|\!]+/g)) {
        lines.splice(currentLine, 0, "- ");
        newCursorPos += 3;
        dirty = true;
      }
      // Exit the bullet list
      if (previousLine.match(/- $/g)) {
        lines[currentLine - 1] = "";
        if (newCursorPos === textToSync.length) {
          lines.splice(currentLine, 0, "\n");
        }
        newCursorPos -= 1;
        dirty = true;
      }
      if (dirty) {
        // Join all the lines together (again)
        textToSync = lines.join("\n");
        element.value = textToSync;
        element.selectionEnd = newCursorPos;
        e.preventDefault();
      }
    }
    return textToSync;
  }

  syncText(element) {
    element.onkeydown = e => {
      // get caret position/selection
      var val = element.value,
        start = element.selectionStart,
        end = element.selectionEnd;

      if (e.keyCode === 9) {
        // tab was pressed
        // set textarea value to: text before caret + tab + text after caret
        element.value = val.substring(0, start) + "\t" + val.substring(end);

        // put caret at right position again
        element.selectionStart = element.selectionEnd = start + 1;

        // prevent the focus lose
        return false;
      }
    };

    element.addEventListener("input", e => this.syncInputConent(e, element));
    element.addEventListener("keydown", e => this.syncInputConent(e, element));
    element.addEventListener("scroll", _ => this.syncScroll(element));
  }

  componentDidMount() {
    this.initEditor();
  }

  initEditor() {
    if (this.editor != null) {
      hljs.initHighlightingOnLoad();
      this.editor.focus();
      this.syncText(this.editor);

      this.editor.value = window.localStorage && window.localStorage.getItem('note') || placeHolderContent;
      this.setState({ highlightedHTML: this.highlightCode(this.editor.value) });

      window.lastSave = Date.now();
    }
  }

  render() {
    return (
      <div className="container">
        <div className="content">
          <pre
            ref={ref => (this.editorHighlight = ref)}
            className="highlight-layer"
            dangerouslySetInnerHTML={{ __html: this.state.highlightedHTML }}
          />
          <textarea
            className="editor-layer"
            ref={ref => (this.editor = ref)}
            placeholder="Don't think, just type..."
          />
        </div>
      </div>
    );
  }
}

export default Notepad;
