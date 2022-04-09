
https://mathsanew.com/articles/algorithm_generating_combinations.pdf
function* generateAll_recursive(input_arr) {
    const a = input_arr;
    const n = a.length;
    const c = [];

    function* generate(s, r, k) {
        if (r == 0) {
            yield c.slice(0, k);
            return;
        }
        for (let i = s; i < n - r + 1; i++) {
            c[k - r] = a[i];
            yield* generate(i + 1, r - 1, k);
        }
    }

    for (let i = 1; i <= 8; i++) {
        yield* generate(0, i, i);
    }
}

https://mathsanew.com/articles/algorithm_generating_combinations.pdf
function* generateAll_iterative(input_arr) {
    const a = input_arr;
    const n = a.length;
    const c = [];

    function* generate(k) {
        let I = []
        let r;
        I[0] = 0;
        r = k;
        while (r <= k) {
            if (r == 0) {
                yield c.slice(0, k);
                r = r + 1;
                continue;
            }

            if (I[k - r] < n - r + 1) {
                c[k - r] = a[I[k - r]];
                if (r > 1)
                    I[k - (r - 1)] = I[k - r] + 1;
                I[k - r]++;
                r = r - 1;
            }
            else {
                r = r + 1;
            }
        }
    }

    for (let i = 1; i <= 8; i++) {
        yield* generate(i);
    }
}

function* generateAll_bwPowerSet(originalSet, maxDepth = -1) {
    if(maxDepth == -1) maxDepth = originalSet.length;

    // We will have 2^n possible combinations (where n is a length of original set).
    // It is because for every element of original set we will decide whether to include
    // it or not (2 options for each set element).
    const numberOfCombinations = 2 ** originalSet.length;

    // Each number in binary representation in a range from 0 to 2^n does exactly what we need:
    // it shows by its bits (0 or 1) whether to include related element from the set or not.
    // For example, for the set {1, 2, 3} the binary number of 0b010 would mean that we need to
    // include only "2" to the current set.
    for (let combinationIndex = 1; combinationIndex < numberOfCombinations; combinationIndex += 1) {
        const subSet = [];

        // Get the depth by counting the number of set bits
        let depth = 0;
        let depth_c = combinationIndex;
        while(depth_c != 0){
            depth_c = depth_c & (depth_c - 1);
            depth++;
            if(depth > maxDepth) break;
        }

        if(depth <= maxDepth){
            for (let setElementIndex = 0; setElementIndex < originalSet.length; setElementIndex += 1) {
                // Decide whether we need to include current element into the subset or not.
                if (combinationIndex & (1 << setElementIndex)) {
                    subSet.push(originalSet[setElementIndex]);
                }
            }
    
            // Add current subset to the list of all subsets.
            yield subSet;
            // subSets.push(subSet);
        }        
    }

    return;
}


function main() {
    const input_size = 32;
    const input = []
    for (let i = 0; i < input_size; i++) {
        input[i] = i;
    }


    let i = 0;
    console.time('Generate all recursive')
    for (const comb of generateAll_recursive(input)) {
        i++;
    }
    console.timeEnd('Generate all recursive');
    console.log('Generated', i, 'elements');

    // Generate all recursive: 14053.541015625ms
    // Generated 15033172 elements

    i = 0;
    console.time('Generate all iterative')
    for (const comb of generateAll_iterative(input)) {
        i++;
    }
    console.timeEnd('Generate all iterative');
    console.log('Generated', i, 'elements');

    // Generate all iterative: 3521.072021484375ms
    // Generated 15033172 elements

    i = 0;
    console.time('Generate all bitwise')
    for (const comb of generateAll_bwPowerSet(input, 8)) {
        i++;
    }
    console.timeEnd('Generate all bitwise');
    console.log('Generated', i, 'elements');

    // Generate all bitwise: 2:46.466 (m:ss.mmm)
    // Generated 15033172 elements
}

main()