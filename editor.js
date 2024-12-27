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
    
    // this.highlighter.addPhrase("is", "linking-verb");
    // this.highlighter.addPhrase("is not", "linking-verb");
    // this.highlighter.addPhrase("is a", "linking-verb");
    // this.highlighter.addPhrase("is an", "linking-verb");
    // this.highlighter.addPhrase("is not a", "linking-verb");
    // this.highlighter.addPhrase("is not an", "linking-verb");
    
    this.highlighter.addPhrase("not", "linking-verb");
    this.highlighter.addPhrase("if", "implication");
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

    // Update on edits
    editor.addEventListener("input", (e) => {
      this.highlighter.highlight(editor.value, syntax);
    });

    this.highlighter.highlight(editor.value, syntax);
    
    // Synchronize scrollTop between textarea1 and textarea2
    editor.addEventListener("scroll", () => {
      syntax.scrollTop = editor.scrollTop;
      syntax.scrollLeft = editor.scrollLeft;
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
}

class Highlighter {
  constructor() {
    this.phrases = [];
    this.defaultStyle = {
      textColor: 'lightgray', // lightgray black
      backColor: 'transparent',
      fontStyle: 'italic'
    };
  }

  // Adds a phrase and its corresponding class for highlighting
  addPhrase(phrase, className) {
    this.phrases.push({ phrase, className });
  }

  // Escapes special characters for use in a regular expression
  escapeRegExp(string) {
    return string.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
  }

  // Highlights the content by wrapping matching phrases in <span> elements with class names
  highlight(text, targetElement) {
    targetElement.innerHTML = ""; // Clear the target element before adding new content

    let highlightedText = ""; // To accumulate the final highlighted text

    // Sort phrases by length in descending order to avoid partial matches
    this.phrases.sort((a, b) => b.phrase.length - a.phrase.length);

    // Create a combined regex to match all phrases as whole words
    const combinedRegex = new RegExp(
      this.phrases
        .map(({ phrase }) => `\\b${this.escapeRegExp(phrase)}\\b`)
        .join('|'),
      'g'
    );

    highlightedText = text.replace(combinedRegex, (match) => {
      const { className } = this.phrases.find(({ phrase }) => phrase === match);
      return `<span class="${className}">${match}</span>`;
    });

    // Set the accumulated highlighted text into the target element
    targetElement.innerHTML = highlightedText + "<br>";
  }
}
