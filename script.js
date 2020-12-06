// B=============D ~~~~

// Array to store all the entered crops
let crops = {}
let cid = 0;
let y_priority;
let g_priority;
let h_priority;

// Onload
$(() => {
    y_priority = parseFloat(document.getElementById('y-priority').value);
    g_priority = parseFloat(document.getElementById('g-priority').value);
    h_priority = parseFloat(document.getElementById('h-priority').value);
})

// Helper function to dynamicaly create elements
function createElement(parent, type, text, classList){
    let el = document.createElement(type);
    el.innerText = text;
    el.classList = classList;
    parent.appendChild(el);
    return el;
}

// Form callback function which handles adding of a new crop
function addCrop(){
    let add_crop = document.getElementById('add-crop');
    let crop = add_crop.value.toUpperCase();
    if(crop.search(/^[YGHWXyghwx]{6}$/) > -1){
        crops[cid++] = crop;
        console.log(crop);
        add_crop.value = '';
        displayCrop(crop);
        calculateBest();

        // I am interested if this is even being used and what is the statistics of plants being calculated, hope
        // you don't mind if I store these crops in a database. DM me if you are interested getting the data.
        // I am doing this for free so I would ask you kindly not to abuse this endpoint by sending bullshit data. Thanks
        let http = new XMLHttpRequest()
        http.open('GET', 'statistics.php?genes=' + crop);
        http.send();
    }
    else{
        return false;
    }
}

// Button callback to delete added crop
function deleteCrop(crop_id){
    delete crops[crop_id];
    calculateBest();
}

function addCropByGene(gene) {
    let add_crop = document.getElementById('add-crop');
    add_crop.value = gene;
    addCrop();
}

// Function to display added crop in 'my crops'
function displayCrop(crop){
    document.getElementById('my-crops').hidden = false;
    let list = document.getElementById('crop-list');
    let li = createElement(list, 'li', '', 'mt-1');
    let del_btn = createElement(li, 'button', 'X', 'btn btn-del');
    let del_id = cid - 1;
    del_btn.addEventListener('click', ()=>{ console.log(del_id); deleteCrop(del_id); li.remove(); });
    for(let i = 0; i < 6; i++){
        let c = crop.charAt(i);
        createElement(li, 'span', c, ( (c == 'X' || c == 'W') ? 'bad' : 'good' ) + ' gene'  )
    }
}


// Function to reset the calculator
function clearCrops(){
    crops = {}
    document.getElementById('crop-list').innerHTML = ''
    document.getElementById('my-crops').hidden = true;
    document.getElementById('calculation').innerHTML = '';
};


// Function to calculate the worth of the crop depending on its genes - simple one for now could be improved
function evaluateCrop(crop, use_cache = true){
    
    // Use caching to speed up the function
    let key = crop + 'Y' + y_priority + 'G' + g_priority + 'H' + h_priority;
    if(use_cache && evaluateCrop.cache[key] != null){
        return evaluateCrop.cache[key];
    }
    
    let value = 0;

    // For each of the 6 genes
    for(let i = 0; i < 6; i++){
        // Evaluate each gene
        switch(crop.charAt(i)){
            case 'W':
            case 'X': value -= 1; break;
            case 'Y': value += y_priority; break;
            case 'G': value += g_priority; break;
            case 'H': value += h_priority; break;
            case '?': value += 0; break;
        }        
    }
    evaluateCrop.cache[key] = value;
    return value;
}
evaluateCrop.cache = {}

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
    
    // Use caching to speed up the function
    let key = parents.join('');
    if(crossbreed.cache[key] != null){
        return crossbreed.cache[key];
    }

    let child = ''
    // For each of the 6 genes
    for(let i = 0; i < 6; i++){
        let gene_table = {
            'W' : 0,
            'X' : 0,
            'Y' : 0,
            'G' : 0,
            'H' : 0
        }

        // Add up all the parent genes at i-th gene
        parents.forEach((parent) => {
            let c = parent.charAt(i);
            gene_table[c] += (c == 'X' || c == 'W') ? 1 : 0.6;
        })

        // Find the dominant one
        let max_gene = '?'
        let max_crop_value = 0.6;
        Object.keys(gene_table).forEach((gene) => {
            // Set new dominant gene if it is stronger or if it is equal in strength and is randomly better
            if(gene_table[gene] > max_crop_value || (gene_table[gene] == max_crop_value && gene_table[gene] > 0.6 && Math.random() < 0.5)  ){
                max_gene = gene;
                max_crop_value = gene_table[gene];
            }
        });

        // Set it for the child
        child += max_gene;
    }
    crossbreed.cache[key] = child;
    return child;
}
crossbreed.cache = {};

// Function to calculate and display the best crop combination
function calculateBest(){

    // Find the best combination
    let max_crop_parents;
    let max_crop_value = -7;
    let max_crop;
    let min_crop_parents_length = undefined;

    // For every possible combination
    for(parents of bwPowerSet(Object.values(crops), 8)){
        let crop = crossbreed(parents);
        let value = evaluateCrop(crop);

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


    // Display it
    let calculation_div = document.getElementById('calculation');
    calculation_div.innerHTML = '';
    if(min_crop_parents_length != undefined && max_crop_parents.length > 1){
        createElement(calculation_div, 'h2', 'Crossbreed these', '');
        createElement(calculation_div, 'br', '', '');
    
        max_crop_parents.forEach((crop) =>  {
            for(let i = 0; i < 6; i++){
                let c = crop.charAt(i);
                createElement(calculation_div, 'span', c, ( (c == 'X' || c == 'W') ? 'bad' : 'good' ) + ' gene'  )
            }
            createElement(calculation_div, 'br', '', '');
        })
        createElement(calculation_div, 'h2', 'to get', '');
        createElement(calculation_div, 'br', '', '');
        for(let i = 0; i < 6; i++){
            let c = max_crop.charAt(i);
            createElement(calculation_div, 'span', c, ( (c == 'X' || c == 'W') ? 'bad' : 'good' ) + ' gene'  )
        }
        createElement(calculation_div, 'br', '', '');
    }
}