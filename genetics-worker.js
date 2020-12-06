// Gene value enum
const W = 0;
const X = 1;
const Y = 2;
const G = 3;
const H = 4;
const U = 5;

// Function to calculate the worth of the crop depending on its genes - simple one for now could be improved
function evaluateCrop(crop, y_priority, g_priority, h_priority){
    let value = 0;

    // For each of the 6 genes
    for(let i = 0; i < 6; i++){
        // Evaluate each gene
        switch(crop[i]){
            case W:
            case X: value -= 1; break;
            case Y: value += y_priority; break;
            case G: value += g_priority; break;
            case H: value += h_priority; break;
            case U: value += 0; break;
        }        
    }
    return value;
}

// Taken from https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/sets/power-set
// and turned into a generator and modified to include max depth - cant crosbreed more than 8 at a time.
function* bwPowerSet(originalSet, maxDepth = -1) {
    if(maxDepth == -1) maxDepth = originalSet.length;

    // We will have 2^n possible combinations (where n is a length of original set).
    // It is because for every element of original set we will decide whether to include
    // it or not (2 options for each set element).
    const numberOfCombinations = 2 ** originalSet.length;

    // Each number in binary representation in a range from 0 to 2^n does exactly what we need:
    // it shows by its bits (0 or 1) whether to include related element from the set or not.
    // For example, for the set {1, 2, 3} the binary number of 0b010 would mean that we need to
    // include only "2" to the current set.
    for (let combinationIndex = 0; combinationIndex < numberOfCombinations; combinationIndex += 1) {
        const subSet = [];

        // Get the depth by counting the number of set bits
        depth = 0;
        depth_c = combinationIndex;
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

// Crossbreeding function that takes an array of parent crops and calculates the child
function crossbreed(parents){
    let child = new Uint8Array(6);
    // For each of the 6 genes
    for(let i = 0; i < 6; i++){
        let gene_table = [0, 0, 0, 0, 0];

        // Add up all the parent genes at i-th gene
        for(let p = 0; p < parents.length; p++){
            let c = parents[p][i];
            gene_table[c] += 0.6 + (c <= X) * 0.4;
        }

        // Find the dominant one
        let max_gene = U
        let max_crop_value = 0.6;
        for(let gene = 0; gene < 5; gene++){
            // Set new dominant gene if it is stronger or if it is equal in strength and is randomly better
            if(gene_table[gene] > max_crop_value || (gene_table[gene] == max_crop_value && gene_table[gene] > 0.6 && Math.random() < 0.5)  ){
                max_gene = gene;
                max_crop_value = gene_table[gene];
            }
        }

        // Set it for the child
        child[i] = max_gene;
    }
    return child;
}

// Function to convert a gene as a string to gene as Uint8Array
function geneStringToArray(str){
    let arr = new Uint8Array(6);
    for(i = 0; i < 6; i++){
        switch(str.charAt(i)){
            case 'W': arr[i] = W; break;
            case 'X': arr[i] = X; break;
            case 'Y': arr[i] = Y; break;
            case 'G': arr[i] = G; break;
            case 'H': arr[i] = H; break;
            case 'U': arr[i] = U; break;
        }
    }
    return arr;
}

// Function to convert a gene as a Uint8Array to gene as string
function arrayToGeneString(arr){
    let str = '';
    for(i = 0; i < 6; i++){
        switch(arr[i]){
            case W: str += 'W'; break;
            case X: str += 'X'; break;
            case Y: str += 'Y'; break;
            case G: str += 'G'; break;
            case H: str += 'H'; break;
            case U: str += '?'; break;
        }
    }
    return str;
}

// Main calculation function
async function calculate(workData) {
    // Find the best combination
    let t1 = new Date().getTime();
    let max_crop_parents;
    let max_crop_value = -7;
    let max_crop;
    let min_crop_parents_length = undefined;

    for(let i = 0; i < workData.genes.length; i++){
        workData.genes[i] = geneStringToArray(workData.genes[i]);
    }
    
    // For every possible combination
    for(parents of bwPowerSet(workData.genes, 8)){
        let crop = crossbreed(parents);
        let value = evaluateCrop(crop, workData.y_priority, workData.g_priority, workData.h_priority);
    
        // console.log(parents);
        // console.log(crop);
        // console.log(value);
    
        // Set better crop if it is better or if it is equal and has less parents
        if(value > max_crop_value || (min_crop_parents_length !== undefined && value == max_crop_value && parents.length < min_crop_parents_length) ){
            max_crop_value = value;
            max_crop_parents = parents;
            max_crop = crop;
            min_crop_parents_length = parents.length;
        }
    }

    // Pack return value as strings
    max_crop = arrayToGeneString(max_crop);
    for(let i = 0; i < max_crop_parents.length; i++){
        max_crop_parents[i] = arrayToGeneString(max_crop_parents[i]);
    }

    return {
        max_crop : max_crop,
        max_crop_parents : max_crop_parents
    }
}

let calcPromise = null;

// Worker entry point
onmessage = function (e){
    // Handle new work request
    if(typeof e.data === 'object'){
        // Start new calculation promise
        calcPromise = calculate(e.data);
        calcPromise.then( (value) => {
            postMessage(value);
            calcPromise = null;
        });
    }
    else{
        // Handle worker commands
        switch(e.data){
            case 'reject':
                // Reject calculation promise if exists
                if(calcPromise != null){
                    calcPromise.reject()
                    calcPromise = null;
                }
                break;

            default:
                break;
        }
    }
}