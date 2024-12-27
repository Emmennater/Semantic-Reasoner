class SyntaxHighlighter {
  constructor() {
    this.highlighter = new Highlighter();
    this.keywords = new Set();
    this.initKeywords();
    this.initEditor();
  }

  initKeywords() {
    // Replace 1 with <span class=2>1</span>
    this.highlighter.addPhrase("for all", "quantifier");
    this.highlighter.addPhrase("all", "quantifier");
    this.highlighter.addPhrase("every", "quantifier");
    this.highlighter.addPhrase("exists", "quantifier");
    this.highlighter.addPhrase("some", "quantifier");
    this.highlighter.addPhrase("unique", "quantifier");
    this.highlighter.addPhrase("such that", "quantifier");
    this.highlighter.addPhrase("that", "linking-verb");
    this.highlighter.addRegex(/#.*/, "comment");
    
    // this.highlighter.addPhrase("is", "linking-verb");
    // this.highlighter.addPhrase("is not", "linking-verb");
    // this.highlighter.addPhrase("is a", "linking-verb");
    // this.highlighter.addPhrase("is an", "linking-verb");
    // this.highlighter.addPhrase("is not a", "linking-verb");
    // this.highlighter.addPhrase("is not an", "linking-verb");
    
    this.highlighter.addPhrase("not", "linking-verb");
    this.highlighter.addPhrase("if", "implication");
    this.highlighter.addPhrase("iff", "implication");
    this.highlighter.addPhrase("then", "implication");
    this.highlighter.addPhrase("and", "junction");
    this.highlighter.addPhrase("or", "junction");
    this.highlighter.addPhrase("xor", "junction");

    // Save keywords
    for (let i = 0; i < this.highlighter.phrases.length; i++) {
      this.keywords.add(this.highlighter.phrases[i].phrase);
    }
  }

  isKeyword(word) {
    return this.keywords.has(word);
  }

  initEditor() {
    const editor = document.getElementById("editor");
    const syntax = document.getElementById("syntax");
    const lineNumbersContainer = document.getElementById("line-numbers-container");
    const textareaContainer = document.getElementById("textarea-container");

    // Update on edits
    editor.addEventListener("input", (e) => {
      this.updateEditor();
    });

    this.updateEditor();
    
    // Synchronize scrollTop between textarea1 and textarea2
    editor.addEventListener("scroll", () => {
      syntax.scrollTop = editor.scrollTop;
      syntax.scrollLeft = editor.scrollLeft;
      lineNumbersContainer.scrollTop = editor.scrollTop;
    });
    
    // Fix indenting with tabs
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault(); // Prevent focus change
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
  
        // Insert a tab character at the cursor position
        const value = editor.value;
        editor.value = value.substring(0, start) + '  ' + value.substring(end);
  
        // Move the cursor after the inserted tab
        editor.selectionStart = editor.selectionEnd = start + 2;

        this.highlighter.highlight(editor.value, syntax);
      }
    });
  }

  updateEditor(lineHints = []) {
    this.updateHighlighter(lineHints);
    this.updateLineNumbers();
  }

  updateHighlighter(lineHints) {
    const editor = document.getElementById("editor");
    const syntax = document.getElementById("syntax");
    this.highlighter.highlight(editor.value, syntax, lineHints);
  }

  updateLineNumbers() {
    const lineNumbers = document.getElementById("line-numbers");
    const editor = document.getElementById("editor");
    const numberOfLines = editor.value.split("\n").length;

    lineNumbers.innerHTML = "";

    for (let i = 0; i < numberOfLines; i++) {
      const line = document.createElement("div");
      line.textContent = i + 1;
      lineNumbers.appendChild(line);
    }
  }
}

class Highlighter {
  constructor() {
    this.phrases = [];
    this.regexes = [];
    this.defaultStyle = {
      textColor: 'lightgray',
      backColor: 'transparent',
      fontStyle: 'italic'
    };
  }

  addPhrase(phrase, className) {
    this.phrases.push({ phrase, className });
  }

  addRegex(regex, className) {
    this.regexes.push({ regex: new RegExp(regex, 'g'), className });
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
  }

  highlight(text, targetElement, lineHints = []) {
    targetElement.innerHTML = "";
    let highlightedText = text;

    // Sort phrases by length in descending order
    this.phrases.sort((a, b) => b.phrase.length - a.phrase.length);

    // Process phrases
    const combinedRegex = new RegExp(
      this.phrases
        .map(({ phrase }) => `\\b${this.escapeRegExp(phrase)}\\b`)
        .join('|'),
      'g'
    );

    if (this.phrases.length > 0) {
      highlightedText = highlightedText.replace(combinedRegex, (match) => {
        const { className } = this.phrases.find(({ phrase }) => phrase === match);
        return `<span class="${className}">${match}</span>`;
      });
    }

    // Process regexes
    this.regexes.forEach(({ regex, className }) => {
      highlightedText = highlightedText.replace(regex, (match) => {
        return `<span class="${className}">${match}</span>`;
      });
    });

    const endLines = [0, ...findAllOccurrences(highlightedText, '\n'), highlightedText.length];
    
    for (let i = lineHints.length - 1; i >= 0; i--) {
      const msg = lineHints[i];
      const { line, style, text, textStyle } = msg;
      const start = endLines[line];
      const end = endLines[line + 1];
      
      highlightedText = highlightedText.slice(0, start) +
      `<span style="${style}">${highlightedText.slice(start, end)}</span>` +
      `<span style="${textStyle}"> ${text}</span>` +
      highlightedText.slice(end);
    }

    targetElement.innerHTML = highlightedText + "<br>";
  }
}
