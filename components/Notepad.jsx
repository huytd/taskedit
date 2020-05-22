import React, { useState, useEffect, useRef } from "react";
import hljs from "highlight.js";

const DB_SAVE_THRESHOLD = 500;

const BRACKETS = new Map([
  ["{", "}"],
  ["(", ")"]
]);

const GAP_BRACKETS = new Map([
  ["[", "]"]
]);

const placeHolderContent = `Hello! Welcome to TaskEdit.

# This is a multi-purpose markdown editor
Aside from writing, you can use it as a task manager:

  [ ] Like this one
  [*] You can flag a task with an asterisk
  [x] Or mark it as done with an x

# Or add some ordered list
1. Like this one
2. Or this one

You can put some **note** here _as well_.

> Basically, not ~~all markdown _are_ supported~~.

But it's \`good\` enough for your notetaking experience.

   {
     "app": "Markdone",
     "platform": "Web"
   }

You can add a @tag or @longer-tag like this. You can add some metadata to it, @just(like-this)

And some [clickable link](https://taskedit.org) as well!

You can prioritize your task using !high or !medium or !low.`;

const Notepad = ({ parse, events }) => {
  const Parse = parse;
  const Note = Parse.Object.extend("Note");
  const editorHighlight = useRef();
  const editor = useRef();

  const [currentUser, setCurrentUser] = useState(Parse.User.current());

  useEffect(() => {
    events.on('userUpdated', () => {
      setCurrentUser(Parse.User.current());
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      (async () => {
        events.emit("loading");
        const query = new Parse.Query(Note);
        query.equalTo("user", currentUser.get("username"));
        const notes = await query.find();
        if (notes && notes[1]) {
          const content = notes[1].get("content");
          editor.current.value = content;
          setState({ highlightedHTML: highlightCode(editor.current.value) });
          events.emit("done");
        }
      })();
    }
  }, [currentUser]);

  const [state, setState] = useState({
    highlightedHTML: "",
  });

  const highlightCode = (input) => {
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
      /(\[[\*|x|\ ]\])\ (.*?\n)/g,
      (match, p1, p2) => {
        let type = "";
        if (p1 === "[x]") type = "checked";
        if (p1 === "[*]") type = "flagged";
        const dataSlug = match.replace(/@/g, '@-').replace(/\!/g, '!-');
        return '<span class="marked-list ' + type + '" data-find="' + dataSlug + '"><span class="invisible">' + p1 + '</span> ' + p2 + '</span>';
      }
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
  };

  const syncScroll = (element) => {
    editorHighlight.current.scrollTop = element.scrollTop;
  };

  const lineFromPos = (p, text) => {
    let count = 0;
    for (var i = 0; i < p; i++) {
      if (text[i] === "\n") count++;
    }
    return count + 1;
  };

  const saveContent = () => {
    if (window.lastSave) {
      let timeSinceLastSave = Date.now() - window.lastSave;
      if (timeSinceLastSave >= DB_SAVE_THRESHOLD) {
        const currentUser = Parse.User.current();
        if (currentUser) {
          (async () => {
            events.emit("saving");
            const query = new Parse.Query(Note);
            query.equalTo("user", currentUser.get("username"));
            const notes = await query.find();
            let note = null;
            if (notes && notes[1]) {
              note = notes[1];
            } else {
              note = new Note();
            }
            note.setACL(new Parse.ACL(currentUser));
            note.set("content", editor.current.value);
            note.set("user", currentUser.get("username"));
            await note.save();
            window.lastSave = Date.now();
            events.emit("done");
          })();
        } else {
          window.localStorage?.setItem("notes", editor.current.value);
          window.lastSave = Date.now();
        }
      }
    }
  };

  const syncInputConent = (e, element) => {
    // sync text
    var textToSync = e.target.value;
    const keyPressed = e.key;

    // Only execute when user press ENTER
    textToSync = editAssistantHitReturn(keyPressed, element, e, textToSync);

    // User pressed a left bracket (, [, or {
    // We'll insert a corresponding right bracket and move the cursor to the center
    textToSync = editAssistantHitBracket(keyPressed, element, e, textToSync);

    syncScroll(element);

    saveContent();

    setState({ highlightedHTML: highlightCode(textToSync) });
  };

  const editAssistantHitBracket = (keyPressed, element, e, textToSync) => {
    if (BRACKETS.has(keyPressed)) {
      var cursorPos = element.selectionStart;
      let left = textToSync.substring(0, cursorPos);
      let right = textToSync.substring(cursorPos);
      textToSync = left + keyPressed + BRACKETS.get(keyPressed) + right;
      element.value = textToSync;
      element.selectionEnd = cursorPos + 1;
      e.preventDefault();
    }
    if (GAP_BRACKETS.has(keyPressed)) {
      var cursorPos = element.selectionStart;
      let left = textToSync.substring(0, cursorPos);
      let right = textToSync.substring(cursorPos);
      textToSync = left + keyPressed + " " + GAP_BRACKETS.get(keyPressed) + right + " ";
      element.value = textToSync;
      element.selectionEnd = cursorPos + 4;
      e.preventDefault();
    }
    return textToSync;
  };

  const editAssistantHitReturn = (keyPressed, element, e, textToSync) => {
    if (keyPressed === "Enter") {
      var cursorPos = element.selectionStart;
      var currentLine = lineFromPos(cursorPos, e.target.value);
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
      // Task list
      if (previousLine.match(/\[[\ |x|\*]\]/g)) {
        const prefixMatch = previousLine.match(/(\s+)\[/);
        const prefix = prefixMatch && prefixMatch[1] || "";
        lines.splice(currentLine, 0, prefix + "[ ] ");
        newCursorPos += 5 + prefix.length;
        dirty = true;
      }
      // Exit task list
      if (previousLine.match(/\[[\ |x|\*]\]\ $/g)) {
        lines[currentLine] = "";
        lines[currentLine - 1] = "";
        if (newCursorPos === textToSync.length) {
          lines.splice(currentLine, 0, "\n");
        }
        newCursorPos -= 1;
        dirty = true;
      }
      // Finishing off editing
      if (dirty) {
        // Join all the lines together (again)
        textToSync = lines.join("\n");
        element.value = textToSync;
        element.selectionEnd = newCursorPos;
        e.preventDefault();
      }
    }
    return textToSync;
  };

  const initSyncTextWithKeyboard = (element) => {
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

    element.addEventListener("input", e => syncInputConent(e, element));
    element.addEventListener("keydown", e => syncInputConent(e, element));
    element.addEventListener("scroll", _ => syncScroll(element));
  };

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      document.querySelectorAll("span.marked-list").forEach(el => {
        if (!el.getAttribute("handled")) {
          el.setAttribute("handled", true);
          el.addEventListener("click", e => {
            const content = e.target.getAttribute('data-find').replace("\n", "").replace(/@-/g, '@').replace(/!-/g, '!');
            const re = new RegExp(content.replace("[", "\\[").replace("]", "\\\]").replace("*", "\\*"));
            const newContent = content.replace(/\[([x|\ |*])\]/, (match, currentStatus) => {
              if (currentStatus === "*") {
                return "[ ]";
              }
              if (currentStatus === "x") {
                return "[*]";
              }
              if (currentStatus === " ") {
                return "[x]";
              }
            });
            editor.current.value = editor.current.value.replace(re, newContent);
            setState({ highlightedHTML: highlightCode(editor.current.value) });
            saveContent();
          });
        }
      });
    }
  });

  const initEditor = () => {
    if (editor.current) {
      hljs.initHighlightingOnLoad();
      editor.current.focus();
      initSyncTextWithKeyboard(editor.current);

      if (!currentUser) {
        editor.current.value = window.localStorage?.getItem("notes") || placeHolderContent;
        setState({ highlightedHTML: highlightCode(editor.current.value) });
      }

      window.lastSave = Date.now();
    }
  };

  useEffect(() => {
    initEditor();
  }, []);

  return (
    <div className="container">
      <div className="content">
        <pre
          ref={editorHighlight}
          className="highlight-layer"
          dangerouslySetInnerHTML={{ __html: state.highlightedHTML }}
        />
        <textarea
          className="editor-layer"
          ref={editor}
          placeholder="Don't think, just type..."
        />
      </div>
    </div>
  );
};

export default Notepad;
