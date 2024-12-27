
function getLiteralDependencies(expr) {
  const pairs = getPairsFromCNF(expr);
  const dependencies = [];

  function negateLiteral(literal) {
    if (literal[0] === '~') return literal.substring(1);
    else return '~' + literal;
  }

  for (const pair of pairs) {
    for (let i = 0; i < pair.length; i++) {
      const literal = pair[i];
      const andList = Array(pair.length - 1);

      for (let j = 1; j < pair.length; j++) {
        andList[j - 1] = negateLiteral(pair[(j + i) % pair.length]);
      }

      const expr = {
        type: 'implication',
        condition: {
          type: 'ands',
          list: andList
        },
        conclusion: literal
      };

      if (andList.length === 0) {
        expr.condition = true;
      }

      dependencies.push(expr);
    }
  }

  return dependencies;
}

function reduceDependencies(dependencies) {
  let grouped = new Map();

  // Group dependencies
  for (let dep of dependencies) {
    const literal = dep.conclusion;
    if (!grouped.has(literal)) grouped.set(literal, []);
    const grouping = grouped.get(literal);
    grouping.push(dep);
  }

  grouped.forEach((expr, literal) => {

  });
}

function prove(expr, dependencies) {
  // Simplify expr down to CNF form and prove all the pairs
  let reducedExpr = getReducedCNF(expr);

  print(reducedExpr);

  // Pick the literal from each pair that has a dependency.
  // If there is more than one, explore the one that has
  // most of the dependency conditions met by the dependent literals.

}

function reason(statement, axioms) {
  let allDependencies = [];

  // Instead of adding dependencies like this I could just
  // extend all of the axioms into one combined expr in CNF
  // but simplifying that expression might be expensive.
  // A better idea is just to eliminate contradictions and
  // tautologies that all relate to one literal (use reduce function)
  function addDependency(dependency) {
    allDependencies.push(dependency);
  }

  axioms.forEach(axiom => {
    const parsedAxiom = parse(axiom);
    const parsedCNF = getReducedCNF(parsedAxiom);
    const dependencies = getLiteralDependencies(parsedCNF);

    for (let i = 0; i < dependencies.length; i++) {
      addDependency(dependencies[i]);
    }
  });

  const reducedDeps = reduceDependencies(allDependencies);
  // const expr = parse(statement);

  // return prove(expr, reducedDeps);
}

function getVars(statement) {
  const match = "xyzw";
  const statementVars = [];

  for (let i = 0; i < match.length; i++) {
    if (statement.includes(`_${match[i]}_`)) {
      statementVars.push(match[i]);
    }
  }

  return statementVars;
}

function getAllPermutations(statement, vars) {
  const statementVars = getVars(statement);

  function remap(statement, from, to) {
    for (let i = 0; i < from.length; i++) {
      statement = statement.replaceAll(`_${from[i]}_`, `_${to[i].toUpperCase()}_`);
    }

    // Uncapitalize
    for (let i = 0; i < from.length; i++) {
      statement = statement.replaceAll(`_${to[i].toUpperCase()}_`, `_${to[i].toLowerCase()}_`);
    }

    return statement;
  }

  // Ex:
  // f(x) = [f(x)]
  // f(x,y) = [f(x,y), f(y,x)]
  // f(x,y,z) = [f(x,y,z), f(x,z,y), f(y,x,z), f(y,z,x), f(z,x,y), f(z,y,x)]
  let statements = [];
  
  // If the number of statement variables is greater than the number of variables
  // then there won't be any statements.
  const mappings = combinations(vars, statementVars.length);

  for (let i = 0; i < mappings.length; i++) {
    const mapping = mappings[i];
    const perms = permute(mapping);
    for (let j = 0; j < perms.length; j++) {
      statements.push(remap(statement, statementVars, perms[j]));
    }
  }

  return statements;
}

function reasonTF(statement, axioms) {
  const vars = getVars(statement);
  const allPerms = axioms.flatMap(axiom => getAllPermutations(axiom, vars));
  const known = allPerms.map(axiom => `(${axiom})`).join(' & ');
  const unkown = statement; // statement.replaceAll("=>", "&")
  const check = known + " & (" + unkown + ")";
  const expr = parse(check);
  const literals = Array.from(getLiterals(expr));

  // Contradiction
  if (isContradiction(expr, literals)) return false;

  const negatedUnknown = `~(${unkown})`;
  const checkNegated = known + " & (" + negatedUnknown + ")";
  const negatedExpr = parse(checkNegated);

  // Proven to be true
  if (isContradiction(negatedExpr, literals)) return true;

  // Not enough information
  return undefined;
}

function testReasoner() {
  const axioms = [
    'p => ~q',
    'r => p | q',
    '~s => q | ~r'
  ];
  const statement = 'p & ~s => ~r';

  const res = reasonTF(statement, axioms);
  // reason(statement, axioms);

  print('Result:', res);
}

/*
Example:
for all x x is hot xor x is warm xor x is cold
for all x, y, z if x is hot and y is cold and z is x mixed with y then z is warm
for all x, y if x is cold and x mixed with y is not warm then y is not hot

Propositions:
p(x)   = x is hot
q(x)   = x is warm
r(x)   = x is cold
s(x,y) = x mixed with y

Axioms:
t(x,y) = p(x) & r(y) => q(s(x,y))
       = ~p(x) | ~r(y) | q(s(x,y))

Prove:
u(x,y) = r(x) & ~q(s(x,y)) => ~p(y)
       = ~r(x) | q(s(x,y)) | ~p(y)

Evaluate truth table for:
t(x,y) & u(x,y) or
t(y,x) & u(x,y)

For multiple variables, not only do you need to compute
each combination of 1s and 0s, you also need to do it
for every combination of xs, ys, and so on...

You can stop when you find one that works.
That goes for truth table finding 1s and the variable combinations.

No... it's not that.

Evaluate truth table for:
t(x,y) & t(y,x) & u(x,y)

*/