// Logic Statement Parser and Tree Manager
class LogicTree {
  constructor() {
    this.axioms = [];
  }

  addAxiom(axiom) {
    for (let i = 0; i < this.axioms.length; i++) {
      if (this.axioms[i] === axiom) return;
    }
    this.axioms.push(axiom);
  }

  addSentence(sentence) {
    let parsed = parseSentence(sentence);

    parsed = this.reformatLiterals(parsed);
    let statement = unparse(parsed);

    if (this.axioms.length === 0) {
      this.axioms.push(statement);
      return undefined;
    }

    let result = reasonTF(statement, this.axioms);

    if (result === true) {
      this.addAxiom(statement);
      return true;
    } else if (result === false) {
      return false;
    } else if (result === undefined) {
      this.addAxiom(statement);
      return undefined;
    } else {
      throw new Error("Unexpected result: " + result);
    }
  }

  reformatLiterals(parsed) {
    function format(expr) {
      if (expr.type == "is") {
        return expr.subject + "." + expr.preposition + "." + expr.predicate;
      } else if (expr.type == "is not") {
        return { type: "not", expr: expr.subject + "." + expr.preposition + "." + expr.predicate };
      } else if (expr.type == "and") {
        return { type: "and", left: format(expr.left), right: format(expr.right) };
      } else if (expr.type == "or") {
        return { type: "or", left: format(expr.left), right: format(expr.right) };
      } else if (expr.type == "not") {
        return { type: "not", expr: format(expr.expr) };
      } else if (expr.type == "implication") {
        return { type: "implication", condition: format(expr.condition), conclusion: format(expr.conclusion) };
      } else {
        return expr;
      }
    }

    return format(parsed);
  }

  reset() {
    this.axioms = [];
  }
}

function parseSentence(sentence) {
  let pos = 0;
  const keywords = Array.from(syntaxHighlighter.keywords).map(s => s.split(" ")).sort((a, b) => b.length - a.length);
  const tokens = tokenize(sentence, keywords);

  function peek(offset = 0) {
    return pos < tokens.length - offset ? tokens[pos + offset] : null;
  }

  function consume() {
    return tokens[pos++];
  }

  function expect(token, message) {
    if (peek() != token) {
      if (message) {
        throw new Error(message);
      } else {
        throw new Error("Expected '" + token + "' but found '" + peek() + "'");
      }
    }
    consume();
  }

  function isKeyword(token) {
    return keywords.some(k => k.join(" ") === token);
  }

  function isVariable(token) {
    return /^[a-zA-Z]$/.test(token);
  }

  function parseAtom() {
    const token = peek();
    
    if (!token) throw new Error("Unexpected end of input");

    if (token === "(") {
      consume(); // (
      const expr = parseExpression();
      expect(")", "Expected closing parenthesis"); // )
      return expr;
    } else if (token === "not") {
      consume(); // not
      return { type: "not", expr: parseAtom() };
    } else if (token === "true") {
      consume(); // true
      return true;
    } else if (token === "false") {
      consume(); // false
      return false;
    } else if (/^[a-zA-Z_]+$/.test(token)) {
      // Proposition
      let propositon = "_";

      while (peek() && /^[a-zA-Z_]+$/.test(peek()) && !isKeyword(peek())) {
        propositon += peek() + "_";
        consume(); // token
      }

      return propositon;
    } else {
      throw new Error("Unexpected token '" + token + "'");
    }
  }

  function parseLiteral() {
    let subject = parseAtom();

    while (peek() == "is" || peek() == "is not") {
      let type = peek();
      consume(); // is or is not
      let predicate = peek();
      consume(); // predicate or first part of the preposition

      // Preposition
      let preposition = "";
      while (peek() && /^[a-zA-Z_]+$/.test(peek()) && !isKeyword(peek())) {
        preposition += predicate + "_";
        predicate = peek();
        consume();
      }

      // Remove trailing underscore
      preposition = preposition.slice(0, -1);
      
      if (preposition) {
        subject = { type, preposition, subject, predicate };
      } else {
        subject = { type, preposition: "is", subject, predicate };
      }
    }

    return subject;
  }

  function parseAnd() {
    let left = parseAtom();

    while (peek() == "and") {
      consume();
      let right = parseAtom();
      left = { type: "and", left, right };
    }

    return left;
  }

  function parseXor() {
    let left = parseAnd();
    let terms = [left];

    while (peek() == "xor") {
      consume();
      let right = parseAnd();
      terms.push(right);
    }

    if (terms.length > 1) {
      let ors = { type: "ors", list: [] };
      
      for (let i = 0; i < terms.length; i++) {
        let ands = {
          type: "ands",
          list: terms.slice().map(t => ({ type: "not", expr: t }))
        };

        ands.list[i] = ands.list[i].expr;
        ors.list.push(exprAndsToAnd(ands));
      }

      left = exprOrsToOr(ors);
    }

    return left;
  }

  function parseOr() {
    let left = parseXor();

    while (peek() == "or") {
      consume();
      let right = parseXor();
      left = { type: "or", left, right };
    }

    return left;
  }

  function parseImplication() {
    if (peek() == "if") {
      consume();
      let condition = parseOr();
      expect("then");
      let conclusion = parseOr();
      return { type: "implication", condition, conclusion };
    } else {
      return parseOr();
    }
  }

  function parseExpression() {
    return parseImplication();
  }

  function tokenize(str, keywords) {
    let toks = str.split(/([()|&~=>]|\s+)/) // Split by operators, parentheses, or spaces
      .filter(token => token.trim().length > 0); // Remove empty tokens or those with only spaces

    let tokens = [];

    for (let i = 0; i < toks.length; i++) {
      let token = toks[i];
      let found = false;

      for (let j = 0; j < keywords.length; j++) {
        let keywordTokens = keywords[j];
        let len = keywordTokens.length;
      
        // Check if the keyword fits
        if (i + len > toks.length) continue;

        let match = true;
        for (let k = 0; k < len; k++) {
          if (keywordTokens[k] != toks[i + k]) {
            match = false;
            break;
          }
        }

        if (match) {
          tokens.push(keywordTokens.join(" "));
          i += len - 1;
          found = true;
          break;
        }
      }

      if (!found) {
        tokens.push(token);
      }
    }

    return tokens.map(removeSyntaxSugar);
  }

  function removeSyntaxSugar(token) {
    switch (token) {
      case "is a":
      case "is an":
        return "is";
      case "is not a":
      case "is not an":
        return "is not";
      case "every":
        return "all";
      default:
        return token;
    }
  }

  let parsed = parseExpression();

  // print(prettyTable(unparse(parsed)));
  // print(JSON.stringify(parsed, null, 2));
  // print(unparse(parsed));


  return parsed;
}

/*





















*/
