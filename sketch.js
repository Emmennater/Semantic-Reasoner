
function setup() {
  noCanvas();
  syntaxHighlighter = new SyntaxHighlighter();
  logicTree = new LogicTree();
}

function executeStatements() {
  // Reset logic tree
  logicTree.reset();

  // Build logic tree
  const editor = document.getElementById("editor");
  const sentences = editor.value.split("\n");
  sentences.forEach(statement => statement.trim());
  
  let lNum = 0;
  for (let sentence of sentences) {
    lNum++;
    if (sentence == "") continue;
    let result = logicTree.addSentence(sentence);
    
    switch (result) {
      case true:
        console.log("%cTrue statement", "color: lime");
        break;
      case false:
        print("%cFalse statement", "color: red");
        break;
      case undefined:
        print("%cNot enough information", "color: lightgray");
    }

    // try {
      // let result = logicTree.addStatement(statement);
      // print(result);
    // } catch (err) {
    //   console.log("%cSyntax error on line " + lNum, "color:#DF3925;background:#1F0000;padding:2px 6px;");
    //   console.log("%c" + err.message, "color:#DF3925;background:#1F0000;padding:2px 6px;");
    // }
  }
}

/*






















*/
