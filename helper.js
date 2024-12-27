
function combinations(arr, n) {
  const result = [];
  
  function generateCombinations(current, start) {
    if (current.length === n) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      generateCombinations(current, i + 1);
      current.pop();
    }
  }

  generateCombinations([], 0);
  return result;
}

function permute(arr) {
  const result = [];
  
  function generatePermutations(current, remaining) {
    if (remaining.length === 0) {
      result.push(current);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      generatePermutations(
        [...current, remaining[i]], 
        [...remaining.slice(0, i), ...remaining.slice(i + 1)]
      );
    }
  }

  generatePermutations([], arr);
  return result;
}

function findAllOccurrences(str, substr) {
  const indices = [];
  let index = str.indexOf(substr);

  while (index !== -1) {
    indices.push(index);
    index = str.indexOf(substr, index + 1);
  }

  return indices;
}
