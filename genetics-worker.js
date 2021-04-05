/*jshint esversion: 6 */ 

// Gene value enum
const U = 0 << 0;
const W = 1 << 0;
const X = 1 << 1;
const Y = 1 << 2;
const G = 1 << 3;
const H = 1 << 4;

// Good an bad gene bitmasks
//             HGYXW
const GOOD = 0b11100;
const BAD  = 0b00011;

// Function to calculate the worth of the crop depending on its genes - simple one for now could be improved
function evaluateCrop(crop, search_settings){
    let value = 0;
    // Desired gene
    if (search_settings.settings_type == 0){
        let y_count = 0;
        let g_count = 0;
        let h_count = 0;
        let gy_count = 0;
        let gh_count = 0;
        let yh_count = 0;
        let ygh_count = 0;
        let multi_choice = 0;

        // For each of the 6 genes
        for(let i = 0; i < 6; i++){
            let g = crop[i];

            if((g & W) > 0) value -= 50;
            if((g & X) > 0) value -= 45;

            switch(g){
                case Y: y_count += 1; break;
                case G: g_count += 1; break;
                case H: h_count += 1; break;
                case G | Y: gy_count += 1; multi_choice += 1; break;
                case G | H: gh_count += 1; multi_choice += 1; break;
                case Y | H: yh_count += 1; multi_choice += 1; break;
                case Y | G | H: ygh_count += 1; multi_choice += 2; break;
            }
        }
        
        let dy = y_count - search_settings.y_count;
        let dg = g_count - search_settings.g_count;
        let dh = h_count - search_settings.h_count;

        value += 20 * ( 6 - Math.abs( dy ) );
        value += 20 * ( 6 - Math.abs( dg ) );
        value += 20 * ( 6 - Math.abs( dh ) );

        if(dy < 0 && dy + yh_count + gy_count + ygh_count > 0) value += 15;
        if(dg < 0 && dg + gh_count + gy_count + ygh_count > 0) value += 15;
        if(dh < 0 && dh + yh_count + gh_count + ygh_count > 0) value += 15;
        value -= multi_choice * 2;
    }
    // Priority sliders
    else if(search_settings.settings_type == 1){
        // For each of the 6 genes
        for(let i = 0; i < 6; i++){
            // Evaluate each gene
            let g = crop[i];

            if(g & W) value -= 1;
            if(g & X) value -= 0.9;

            value += Math.max(
                (g & Y) > 0 ? search_settings.y_priority : 0,
                (g & G) > 0 ? search_settings.g_priority : 0,
                (g & H) > 0 ? search_settings.h_priority : 0
            );
    
            // Add a penalty for multi-choice genes
            if ( g & (g - 1) != 0) {
                value -= 0.1;
            }
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

// Crossbreeding function that takes an array of parent crops and calculates the child
function crossbreed(parents){
    let child = new Uint8Array(6);
    // For each of the 6 genes
    for(let i = 0; i < 6; i++){
        let gene_table = [0, 0, 0, 0, 0];
        let genes = [W, X, Y, G, H];

        // Add up all the parent genes at i-th gene
        for(let p = 0; p < parents.length; p++){
            switch(parents[p][i]){
                case W: gene_table[0] += 1; break;
                case X: gene_table[1] += 1; break;
                case Y: gene_table[2] += 0.6; break;
                case G: gene_table[3] += 0.6; break;
                case H: gene_table[4] += 0.6; break;
                case U: break;
            }  
        }

        // Find the dominant one
        let max_gene = U;
        let max_crop_value = 0.6;
        for(let gene = 0; gene < 5; gene++){
            // Set new dominant gene if it is stronger
            if(gene_table[gene] > max_crop_value){
                max_gene = genes[gene];
                max_crop_value = gene_table[gene];
            }
            // or add it if its equaly strong
            else if( gene_table[gene] == max_crop_value){
                max_gene |= genes[gene];
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
async function calculate(work_data) {
    // Find the best combination
    let max_crop_parents;
    let max_crop_value = -7;
    let max_crop;

    // Change the gene as a string to a Uint8Array,
    // then use it to find the best seed in the input
    for(let i = 0; i < work_data.genes.length; i++){
        let crop = work_data.genes[i] = geneStringToArray(work_data.genes[i]);
        let value = evaluateCrop(crop, work_data.search_settings);
        if(value > max_crop_value){
            max_crop_value = value;
            max_crop_parents = [];
            max_crop = crop;
        }
    }
    
    // For every possible combination
    for(let parents of bwPowerSet(work_data.genes, 8)){
        let crop = crossbreed(parents);
        let value = evaluateCrop(crop, work_data.search_settings);
    
        // console.log(parents);
        // console.log(crop);
        // console.log(value);
    
        // Set better crop if it is better or if it is equal and has less parents
        if(value > max_crop_value || (value == max_crop_value && parents.length < max_crop_parents.length) ){
            max_crop_value = value;
            max_crop_parents = parents;
            max_crop = crop;
        }
    }

    // Pack return value as strings
    for(let i = 0; i < max_crop_parents.length; i++){
        max_crop_parents[i] = arrayToGeneString(max_crop_parents[i]);
    }

    return {
        max_crop : max_crop,
        max_crop_parents : max_crop_parents
    };
}

let calcPromise = null;

// Worker entry point
onmessage = function (e){
    // Handle new work request
    if(typeof e.data === 'object'){
        // Start new calculation promise
        calcPromise = calculate(e.data);
        calcPromise.then( function(value) {
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
                    calcPromise.reject();
                    calcPromise = null;
                }
                break;

            default:
                break;
        }
    }
};