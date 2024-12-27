// The Quine-McCluskey Algorithm
function getMinterms(expr, literals) {
  const end = 1 << literals.length;
  const minterms = [];

  for (let i = 0; i < end; i++) {
    let vals = {};

    for (let j = 0; j < literals.length; j++) {
      vals[literals[j]] = i & (1 << j) ? true : false;
    }

    let res = evaluateExpr(expr, vals);

    if (res) {
      minterms.push(i);
    }
  }

  return minterms;
}

function getMaxterms(expr, literals) {
  const end = 1 << literals.length;
  const minterms = [];

  for (let i = 0; i < end; i++) {
    let vals = {};

    for (let j = 0; j < literals.length; j++) {
      vals[literals[j]] = i & (1 << j) ? true : false;
    }

    let res = evaluateExpr(expr, vals);

    if (!res) {
      minterms.push(i);
    }
  }

  return minterms;
}

function getExpressionMultAddForm(table, literals) {
  let result = [];

  for (let row of table) {
    // Check if the output (last element of the row) is true
    if (row[row.length - 1]) {
      let term = [];

      // Loop through literals and their corresponding row values
      for (let i = 0; i < literals.length; i++) {
        if (row[i]) {
          term.push(literals[i]); // Add the literal if true
        } else {
          term.push(literals[i] + "*"); // Add the complement if false
        }
      }

      // Join the terms into a product and add to the result
      result.push(term.join(""));
    }
  }

  // Join all product terms with '+'
  return result.join(" + ");
}

function getExpressionMultAddFormMaxterms(table, literals) {
  let result = [];

  for (let row of table) {
    // Check if the output (last element of the row) is true
    if (!row[row.length - 1]) {
      let term = [];

      // Loop through literals and their corresponding row values
      for (let i = 0; i < literals.length; i++) {
        if (row[i]) {
          term.push(literals[i]); // Add the literal if true
        } else {
          term.push(literals[i] + "*"); // Add the complement if false
        }
      }

      // Join the terms into a product and add to the result
      result.push(term.join(""));
    }
  }

  // Join all product terms with '+'
  return result.join(" + ");
}

// Credit QM Library:
// https://github.com/LarryBattle/quine-mccluskeyjs/tree/master
function getReducedCNF(expr) {
  // First negate the expression
  const negExpr = negate(expr);

  const literals = Array.from(getLiterals(negExpr));
  const table = getTruthTable(negExpr, literals);
  const expr2 = getExpressionMultAddForm(table, literals);

  try {
    const reduced = qm.simplify(literals, expr2);

    // Input expression was a contradiction
    if (reduced === "true") return false;

    // Now un-negate
    const reducedExpr = parse(reduced);
    const unNegated = negate(reducedExpr);

    return unNegated;
  } catch (err) {
    // Input expression was a tautology
    return true;
  }
}

function getReducedDNF(expr) {
  const literals = Array.from(getLiterals(expr));
  const table = getTruthTable(expr, literals);
  const expr2 = getExpressionMultAddForm(table, literals);

  try {
    const reduced = qm.simplify(literals, expr2);

    // Input expression was a tautology
    if (reduced === "true") return true;

    let reducedExpr = parse(reduced);

    return reducedExpr;
  } catch (err) {
    // Input expression was a contradiction
    if (!err.message.startsWith('Unable to find prime implicants')) {
      throw err;
    }
    return false;
  }
}

function testQM() {
  const testCases = [
    "x & y", // Simple conjunction
    "x | y", // Simple disjunction
    "x => y", // Implication
    "~x & y", // Negation and conjunction
    "~(x & y)", // Negation applied to conjunction
    "x & ~y => z | w", // Conjunction with implication and disjunction
    "x | ~y => z & w", // Disjunction with implication and conjunction
    "x => y | z", // Implication leading to disjunction
    "x | (y & z)", // Disjunction with a conjunction inside
    "(x & y) | z", // Conjunction inside a disjunction
    "~x | ~(y & z)", // Negation applied to a conjunction inside disjunction
    "(x | y) & (z | w)", // Conjunction of disjunctions
    "~(x | y)", // Negation applied to disjunction
    "(x => y) & (z => w)", // Multiple implications combined with conjunction
    "(x => (y & z)) | w", // Implication with conjunction inside disjunction
    "(x & y) | (z & w) & (p | q)", // Conjunction and disjunction mix with nested operations
    "(x | y) & ~(z | w) => (p & q)", // Implication with nested negations and disjunctions
    "(x | y & (z | w)) => ((p & q) | r)", // Nested disjunction inside implication with conjunctions
    "(x => y) & (z => ~w) | (t => (x & y))", // Implication with negations and conjunctions
    "~(x & (y | z)) => (w | (p & q))", // Negation, conjunction, disjunction, and implication
    "x & ~(y => (z & w))", // Conjunction with negation and implication inside
    "(~x | (y & z)) & (w => (x | y))", // Disjunction with negation and implication combined
    "(x => y) & (z | (x => w)) => (p & q)", // Multiple implications inside conjunction and disjunction
    "(x | y) & (z => (w | ~q)) => (p & q)", // Implication with nested disjunction and negation
    "~(x & (y | z) & (w | q)) => (r | p)", // Nested conjunctions and disjunctions with negation and implication
    "(x => (y | z)) & (~(a & b) | (c => d))", // Nested implications and conjunctions with negation
    "~(x | y | z) & ((a => b) | (c & d))", // Triple disjunction and conjunction inside negation with implication
    "(x => ~(y & z)) | (w => (x | y)) & (p => q)", // Implication and negation with conjunction and disjunction
    "(~x & y) => (z & (w | p)) | (q & r)", // Nested conjunctions and disjunctions inside implication
    "(x & ~y) => (z | (w & q)) & (~(a | b) | c)", // Complex conjunctions and disjunctions inside implications and negations
    "((x & y) | (z & w)) & ~(a => (b | c))", // Nested conjunctions, disjunctions, and implication with negation
    "(x | (y => z)) & (a & b) => (w | q)", // Implication with disjunction and conjunction inside
    "(x => (y & z)) & (w | (x => (y | z)))", // Complex nested implications and conjunctions
    "(x | ~y & (z => w)) & (~(a & b) | (c & d))", // Negation inside disjunction, conjunction, and implication
    "(x & y & z) => (w | (p & q)) | (r => t)", // Multiple conjunctions, disjunctions, and implications
    "(x => y) & ((~z | w) => (p & q)) & (r => t)", // Implication combined with negations and conjunctions
  ];

  testCases.forEach((statement) => {
    const parsed = parse(statement);
    const cnf = getReducedCNF(parsed);
    const dnf = getReducedDNF(parsed);
    const eqCNF = isLogicalEq(parsed, cnf);
    const eqDNF = isLogicalEq(parsed, dnf);
    const parsedStr = unparse(parsed);

    if (!eqDNF) {
      // print(parsed, dnf);
      print(statement, unparse(cnf), unparse(dnf));
    }

    console.log(
      `${parsedStr}\n%cCNF (${eqCNF ? "passed" : "failed"
      }) %cDNF (${eqDNF ? "passed" : "failed"
      })`,
      `color:${eqCNF ? "lime" : "red"}`,
      `color:${eqDNF ? "lime" : "red"}`
    );
  });
}

/*
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
*/
