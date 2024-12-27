function negate(expr) {
  if (expr.type == "and") {
    let left = expr.left;
    let right = expr.right;
    return { type: "or", left: negate(left), right: negate(right) };
  } else if (expr.type == "or") {
    let left = expr.left;
    let right = expr.right;
    return { type: "and", left: negate(left), right: negate(right) };
  } else if (expr.type == "implication") {
    let condition = expr.condition;
    let conclusion = expr.conclusion;
    return { type: "and", left: condition, right: negate(conclusion) };
  } else if (typeof expr === "boolean") {
    return expr
  } else if (typeof expr === "boolean") {
    return expr
  } else if (typeof expr === "string") {
    return { type: "not", expr: expr };
  } else if (expr.type == "not") {
    return expr.expr;
  }
}

function getLiterals(expr) {
  function getLiteralsHelper(expr, literals) {
    if (expr.type == "and") {
      getLiteralsHelper(expr.left, literals);
      getLiteralsHelper(expr.right, literals);
    } else if (expr.type == "or") {
      getLiteralsHelper(expr.left, literals);
      getLiteralsHelper(expr.right, literals);
    } else if (expr.type == "not") {
      getLiteralsHelper(expr.expr, literals);
    } else if (expr.type == "implication") {
      getLiteralsHelper(expr.condition, literals);
      getLiteralsHelper(expr.conclusion, literals);
    } else if (typeof expr === "string") {
      literals.add(expr);
    }

    return literals;
  }

  return getLiteralsHelper(expr, new Set());
}

function evaluateExpr(expr, vals) {
  if (expr.type == "and") {
    return evaluateExpr(expr.left, vals) && evaluateExpr(expr.right, vals);
  } else if (expr.type == "or") {
    return evaluateExpr(expr.left, vals) || evaluateExpr(expr.right, vals);
  } else if (expr.type == "not") {
    return !evaluateExpr(expr.expr, vals);
  } else if (expr.type == "implication") {
    return !evaluateExpr(expr.condition, vals) ||
      evaluateExpr(expr.conclusion, vals);
  } else if (typeof expr === "string") {
    return vals[expr];
  } else if (typeof expr === "boolean") {
    return expr;
  }
}

function getTruthTable(expr, literals) {
  const end = 1 << literals.length;
  const table = Array(end);

  for (let i = 0; i < end; i++) {
    let vals = {};

    for (let j = 0; j < literals.length; j++) {
      vals[literals[j]] = i & (1 << j) ? true : false;
    }

    let res = evaluateExpr(expr, vals);

    table[i] = [...Object.values(vals), res];
  }

  return table;
}

function isContradiction(expr, literals) {
  const end = 1 << literals.length;
  
  for (let i = 0; i < end; i++) {
    let vals = {};

    for (let j = 0; j < literals.length; j++) {
      vals[literals[j]] = i & (1 << j) ? true : false;
    }

    let res = evaluateExpr(expr, vals);

    if (res) return false;
  }

  return true;
}

function prettyTable(statement, mode = 1) {
  const expr = parse(statement);
  const literals = Array.from(getLiterals(expr));
  const table = getTruthTable(expr, literals);
  let out = '';
  
  if (mode == 1) {
    for (let i = 0; i < table.length; i++) {
      out += table[i][table[i].length - 1] ? '1' : '0';
    }
    out += '\n' + '-'.repeat(table.length);
    for (let j = 0; j < table[0].length - 1; j++) {
      out += '\n';
      for (let i = 0; i < table.length; i++) {
        out += table[i][j] ? '1' : '0';
      }
      out += ' ' + literals[j];
    }
  } else if (mode == 2) {
    out = literals.join('') + '=\n';

    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < table[i].length; j++) {
        out += (table[i][j] ? '1' : '0');
      }
      out += "\n";
    }

    out = out.substring(0, out.length - 1);
  }
  
  print(out);
}

function isLogicalEq(exprA, exprB) {
  const literalsA = getLiterals(exprA);
  const literalsB = getLiterals(exprB);
  const literals = Array.from(literalsA.union(literalsB));

  const end = 1 << literals.length;

  for (let i = 0; i < end; i++) {
    let vals = {};

    for (let j = 0; j < literals.length; j++) {
      vals[literals[j]] = i & (1 << j) ? true : false;
    }

    let resA = evaluateExpr(exprA, vals);
    let resB = evaluateExpr(exprB, vals);

    if (resA != resB) return false;
  }

  return true;
}

function isLogEq(statementA, statementB) {
  return isLogicalEq(parse(statementA), parse(statementB));
}

function getPairsFromCNF(expr) {
  let pairs = [];

  function collectLiterals(expr, literals) {
    if (expr.type === 'or') {
      collectLiterals(expr.left, literals);
      collectLiterals(expr.right, literals);
    } else if (expr.type === 'not') {
      literals.push('~' + expr.expr);
    } else {
      literals.push(expr);
    }
  }

  (function collectOrs(expr) {
    if (expr.type === 'and') {
      collectOrs(expr.left);
      collectOrs(expr.right);
    } else {
      let literals = [];
      collectLiterals(expr, literals);
      pairs.push(literals);
    }
  })(expr);

  return pairs;
}

function exprAndsToAnd(expr) {
  if (typeof expr !== 'object') return expr;
  if (expr.type !== 'ands') {
    throw Error(`Expected condition of type ands but found ${expr.condition.type}$`);
  }

  let literals = expr.list;

  if (literals.length === 1) {
    return expr;
  }

  const newExpr = {};
  let current = newExpr, i = 0;
  while (true) {
    current.type = 'and';
    current.left = literals[i];
    if (++i == literals.length - 1) {
      current.right = literals[i];
      break;
    }
    current.right = {};
    current = current.right;
  }

  return newExpr;
}

function exprOrsToOr(expr) {
  if (typeof expr !== 'object') return expr;
  if (expr.type !== 'ors') {
    throw Error(`Expected condition of type ors but found ${expr.condition.type}$`);
  }

  let literals = expr.list;

  if (literals.length === 1) {
    return expr;
  }

  const newExpr = {};
  let current = newExpr, i = 0;
  while (true) {
    current.type = 'or';
    current.left = literals[i];
    if (++i == literals.length - 1) {
      current.right = literals[i];
      break;
    }
    current.right = {};
    current = current.right;
  }

  return newExpr;
}