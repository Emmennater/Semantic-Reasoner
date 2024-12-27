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
  
  // print(`Performing ${end} computations...`);

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

function exprAndToAnds(expr) {
  // If not an object (i.e. a literal), return as is
  if (typeof expr !== 'object') return expr;
  
  // If not an 'and' type, throw error
  if (expr.type !== 'and') {
    throw Error(`Expected condition of type and but found ${expr.type}`);
  }

  // Initialize list to store literals
  const literals = [];
  
  // Helper function to flatten nested 'and' expressions
  function collectLiterals(expr) {
    if (typeof expr !== 'object') {
      literals.push(expr);
      return;
    }
    
    if (expr.type !== 'and') {
      literals.push(expr);
      return;
    }

    if (expr.type === 'not') {
      literals.push(`~${expr.expr}`);
    }
    
    // Recursively collect literals from left and right branches
    collectLiterals(expr.left);
    collectLiterals(expr.right);
  }
  
  // Start collecting literals
  collectLiterals(expr);
  
  // Return new 'ands' expression with collected literals
  return {
    type: 'ands',
    list: literals
  };
}

function exprOrsToOr(expr) {
  if (typeof expr !== 'object') return expr;
  if (expr.type !== 'ors') {
    throw Error(`Expected condition of type ors but found ${expr.type}`);
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

function exprOrToOrs(expr) {
  if (typeof expr !== 'object') return expr;
  if (expr.type !== 'or') {
    throw Error(`Expected condition of type or but found ${expr.type}`);
  }

  const literals = [];
  
  function collectLiterals(expr) {
    if (typeof expr !== 'object') {
      literals.push(expr);
      return;
    }
    
    if (expr.type === 'not') {
      literals.push(`~${expr.expr}`);
      return;
    }
    
    if (expr.type !== 'or') {
      literals.push(expr);
      return;
    }
    
    collectLiterals(expr.left);
    collectLiterals(expr.right);
  }
  
  collectLiterals(expr);
  
  return {
    type: 'ors',
    list: literals
  };
}

function simplify(expr) {
  if (expr.type === 'not') {
    if (typeof expr.expr === 'string') return expr;

    if (expr.expr.type === 'not') {
      return simplify(expr.expr.expr);
    }

    return simplify(negate(expr.expr));
  }
  else if (expr.type === 'or') {
    // Distribute OR over AND
    if (expr.left.type === 'and') {
      return simplify({
        type: 'and',
        left: { type: 'or', left: expr.left.left, right: expr.right },
        right: { type: 'or', left: expr.left.right, right: expr.right },
      });
    }
    if (expr.right.type === 'and') {
      return simplify({
        type: 'and',
        left: { type: 'or', left: expr.left, right: expr.right.left },
        right: { type: 'or', left: expr.left, right: expr.right.right },
      });
    }

    const left = simplify(expr.left);
    const right = simplify(expr.right);

    return { ...expr, left, right };
  }
  else if (expr.type === 'and') {
    const left = simplify(expr.left);
    const right = simplify(expr.right);
    
    return { ...expr, left, right };
  }
  else if (expr.type === 'implication') {
    // A ⇒ B is equivalent to ¬A ∨ B
    return simplify({
      type: 'or',
      left: negate(expr.condition),
      right: expr.conclusion,
    });
  }

  return expr; // No simplification needed
}

function packageCNF(expr) {
  // If not an object, return as is (handles literals)
  if (typeof expr !== 'object') return expr;
  
  // Handle single literals or terms that are already processed
  if (expr.type !== 'ands' && expr.type !== 'and' && expr.type !== 'ors' && expr.type !== 'or') {
    return expr;
  }

  // Convert to ors if it's a nested or structure
  if (expr.type === 'or') {
    expr = { type: 'ands', list: [exprOrToOrs(expr)] };
  }

  // Convert to ors if it's a nested ors structure
  if (expr.type === 'ors') {
    expr = { type: 'ands', list: [expr.list] };
  }
  
  // Convert to ands if it's a nested and structure
  if (expr.type === 'and') {
    expr = exprAndToAnds(expr);
  }
  
  // Process each clause in the CNF
  const processedList = expr.list.map(clause => {
    // If it's a literal, wrap it in an ors structure
    if (typeof clause === 'string') {
      return {
        type: 'ors',
        list: [clause]
      };
    }
    
    // If it's an or, convert to ors and validate
    if (clause.type === 'or') {
      const orsExpr = exprOrToOrs(clause);
      validateOrsLiterals(orsExpr);
      return orsExpr;
    }
    
    // If it's already an ors structure, validate it
    if (clause.type === 'ors') {
      validateOrsLiterals(clause);
      return clause;
    }
    
    throw Error('Invalid CNF: AND clauses can only contain literals or OR expressions');
  });
  
  // Return the final ands of ors structure
  return {
    type: 'ands',
    list: processedList
  };
}

// Validation helper function
function validateOrsLiterals(orsExpr) {
  if (!orsExpr.list || !Array.isArray(orsExpr.list)) {
    throw Error('Invalid ors expression: missing or invalid list property');
  }
  
  for (const literal of orsExpr.list) {
    if (typeof literal !== 'string') {
      throw Error('Invalid CNF: OR clauses can only contain string literals');
    }
  }
}

function simplifyPackagedCNF(expr) {
  if (typeof expr !== 'object' || expr.type !== 'ands' || !Array.isArray(expr.list)) {
    throw Error('Invalid input: expected packaged CNF expression');
  }

  // Helper function to get a canonical string representation of an ors clause
  function getOrsKey(orsClause) {
    if (!orsClause.list || !Array.isArray(orsClause.list)) {
      throw Error('Invalid ors clause: missing or invalid list property');
    }
    // Sort the literals to ensure consistent comparison regardless of order
    return [...orsClause.list].sort().join('|');
  }

  // Use a Map to keep track of unique ors clauses
  const uniqueOrs = new Map();
  
  // Process each ors clause
  for (const clause of expr.list) {
    if (clause.type !== 'ors') {
      throw Error('Invalid CNF: expected ors clause');
    }
    
    const key = getOrsKey(clause);
    if (!uniqueOrs.has(key)) {
      uniqueOrs.set(key, clause);
    }
  }

  // Return new expression with only unique clauses
  return {
    type: 'ands',
    list: Array.from(uniqueOrs.values())
  };
}

function getCNF(expr) {
  return simplifyPackagedCNF(packageCNF(simplify(expr)));
}
