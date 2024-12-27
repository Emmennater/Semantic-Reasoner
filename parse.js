function parse(statement) {
  let pos = 0;
  const tokens = tokenize(statement);

  function peek() {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function consume() {
    return tokens[pos++];
  }

  function parseAtom() {
    const token = peek();
    if (!token) throw new Error("Unexpected end of input");

    if (token === "(") {
      consume(); // (
      const expr = parseExpression();
      if (peek() !== ")") throw new Error("Expected closing parenthesis");
      consume(); // )
      return expr;
    } else if (token === "~") {
      consume(); // ~
      const nextToken = peek();
      // If next token is a parenthesis, we want to negate the entire expression
      if (nextToken === "(") {
        return {
          type: "not",
          expr: parseAtom() // This will handle the parenthesized expression
        };
      }
      return {
        type: "not",
        expr: parseAtom()
      };
    } else if (token === "1") {
      consume(); // Boolean
      return true;
    } else if (token === "0") {
      consume(); // Boolean
      return false;
    } else if (/^[a-zA-Z._]+$/.test(token)) {
      consume(); // Variable
      return token;
    } else {
      throw new Error(`Unexpected token: ${token}`);
    }
  }

  function parseAnd() {
    let left = parseAtom();

    while (peek() === "&") {
      consume(); // &
      const right = parseAtom();
      left = {
        type: "and",
        left,
        right
      };
    }

    return left;
  }

  function parseOr() {
    let left = parseAnd();

    while (peek() === "|") {
      consume(); // |
      const right = parseAnd();
      left = {
        type: "or",
        left,
        right
      };
    }

    return left;
  }

  function parseImplication() {
    const condition = parseOr();

    if (peek() === "=" && tokens[pos + 1] === ">") {
      consume(); // =
      consume(); // >
      const conclusion = parseOr();
      return {
        type: "implication",
        condition,
        conclusion
      };
    }

    return condition;
  }

  function parseExpression() {
    return parseImplication();
  }

  function tokenize(str) {
    return str.replace(/\s+/g, '')
      .split(/([()|&~=>])/)
      .filter(token => token.length > 0);
  }

  return parseExpression();
}

function unparse(expr) {
  if (typeof expr === 'string') {
    return expr;
  }

  if (typeof expr === 'boolean') {
    return expr ? '1' : '0';
  }

  switch (expr.type) {
    case 'not':
      // Preserve original parentheses for compound expressions under not
      if (typeof expr.expr === 'string') {
        return `~${expr.expr}`;
      }
      return `~(${unparse(expr.expr)})`;

    case 'and':
      return formatBinaryOp(expr, '&');

    case 'or':
      return formatBinaryOp(expr, '|');

    case 'implication':
      return `${needsParens(expr.condition, 'implication') ? `(${unparse(expr.condition)})` : unparse(expr.condition)} => ${needsParens(expr.conclusion, 'implication') ? `(${unparse(expr.conclusion)})` : unparse(expr.conclusion)}`;

    default:
      return `Unknown type: ${expr.type}`;
  }
}

function needsParens(expr, parentOp) {
  if (typeof expr === 'string' || typeof expr === 'boolean') return false;

  // Precedence: ~ > & > | > =>
  switch (expr.type) {
    case 'implication':
      return true; // Always need parens around implications when nested
    case 'or':
      return parentOp === 'implication' || parentOp === 'and'; // Need parens if parent is higher precedence
    case 'and':
      return parentOp === 'implication'; // Only need parens if parent is implication
    case 'not':
      return false; // not has highest precedence
    default:
      return false;
  }
}

function formatBinaryOp(expr, operator) {
  const left = unparse(expr.left);
  const right = unparse(expr.right);
  const leftNeedsParens = needsParens(expr.left, expr.type);
  const rightNeedsParens = needsParens(expr.right, expr.type);

  return `${leftNeedsParens ? `(${left})` : left} ${operator} ${rightNeedsParens ? `(${right})` : right}`;
}