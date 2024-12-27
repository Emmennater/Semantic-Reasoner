
function setup() {
  noCanvas();
  syntaxHighlighter = new SyntaxHighlighter();
  logicTree = new LogicTree();
}

function executeStatements(all = false) {
  // Reset logic tree
  logicTree.reset();
  logicTree.assumeTrueButLast = !all;

  // Build logic tree
  const editor = document.getElementById("editor");
  const sentences = editor.value.split("\n");
  sentences.forEach(statement => statement.trim());
  
  let lastLine = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i] == "") continue;
    lastLine = i;
  }

  let results = [];
  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i];
    if (sentence == "") continue;
    const isLast = i == lastLine;

    try {
      let result = logicTree.addSentence(sentence, isLast);
      results.push(result);
    } catch (err) {
      results.push(err);
    }
  }

  let lineHints = results.map((r, i) => {
    let style = "";
    let text = "";
    let textStyle = "";

    switch (r) {
      case true:
        style = 'background-color: #040';
        break;
      case false:
        style = 'background-color: #400';
        break;
      case undefined:
        style = 'background-color: #222';
        break;
      case "assumed":
        style = 'background-color: #222';
        break;
      default:
        style = 'text-decoration: wavy underline; text-decoration-color: red';
        text = r.message;
        textStyle = 'color: red';
        console.error(r);
        break;
    }

    return {
      line: i,
      style,
      text,
      textStyle
    };
  });

  syntaxHighlighter.updateHighlighter(lineHints);
}

function resetStatements() {
  logicTree.reset();
  syntaxHighlighter.updateHighlighter([]);
}

/*






















*/
