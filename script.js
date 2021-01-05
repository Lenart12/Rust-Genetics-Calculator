// Array to store all the entered crops
let crops = {};

// Current crop id
let cid = -1;

let y_priority;
let g_priority;
let h_priority;

// Web worker (genetics-worker.js)
let worker;

// Onload
$(function(){
    y_priority = parseFloat(document.getElementById('y-priority').value);
    g_priority = parseFloat(document.getElementById('g-priority').value);
    h_priority = parseFloat(document.getElementById('h-priority').value);

    // Make sure browser has support for web workers
    if(!window.Worker){
        alert("This browser doesn't support this website");
        return;
    }

    worker = new Worker('genetics-worker.js');
    worker.onmessage = processWorkerMessage;
});

// Helper function to dynamicaly create elements
function createElement(parent, type, text, classList){
    let el = document.createElement(type);
    el.innerHTML = text;
    el.classList = classList;
    parent.appendChild(el);
    return el;
}

// Feedback form callback
function feedback() {
    let text = document.getElementById('text').value;
    let contact = document.getElementById('contact').value;
    
    let http = new XMLHttpRequest()
    let url = 'feedback.php?text=' + encodeURIComponent(text) + '&contact=' + encodeURIComponent(contact);
    http.open('GET', url);
    http.send();

    document.getElementById('feedback-form').reset();
    $('#feedbackCollapse').collapse('hide');
    let btn = document.getElementById('btn-feedback');
    btn.textContent = 'Thank you';
    btn.classList = 'btn btn-success';
}

// Form callback function which handles adding of a new crop
function addCrop(updateCalc = true){
    let add_crop = document.getElementById('add-crop');
    
    // Validate input
    let crop = add_crop.value.toUpperCase();
    if(crop.search(/^[YGHWXyghwx]{6}$/) > -1){

        // Store and display crop
        crops[++cid] = crop;
        add_crop.value = '';
        displayCrop(crop);
        
        // Then update calculation
        if(updateCalc)
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

function importCrops(input){
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
        let inp = reader.result.split('\n');
        if(inp[0] == 'genes'){
            clearCrops();
            for(let i = 1; i < inp.length; i++){
                if(i < inp.length - 1){
                    addCropByGene(inp[i]);
                }
                else{
                    addCropByGene(inp[i], true);
                }
            }
        }
        else{
            alert("File has wrong format");
        }
    };
}

function exportCrops(){
    let file = new Blob(["genes\n" + Object.values(crops).join('\n')], {type: 'text/csv'});
    let filename = 'genes.txt';

    // IE10+
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, filename);
    }
    // Others
    else {
        let a = document.createElement("a");
        let url = URL.createObjectURL(file);

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

// Button callback to delete added crop
function deleteCrop(crop_id){
    delete crops[crop_id];
    calculateBest();
}

// Helper function for debugging
function addCropByGene(gene, updateCalc = false) {
    let add_crop = document.getElementById('add-crop');
    add_crop.value = gene;
    addCrop(updateCalc);
}

// Function to display added crop in 'my crops'
function displayCrop(crop){
    document.getElementById('my-crops').hidden = false;
    let list = document.getElementById('crop-list');
    let li = createElement(list, 'li', '', 'mt-1');
    let del_btn = createElement(li, 'button', 'X', 'btn btn-del');
    let del_id = cid;
    del_btn.addEventListener('click', function (){ deleteCrop(del_id); li.remove(); });
    for(let i = 0; i < 6; i++){
        let c = crop.charAt(i);
        createElement(li, 'span', c, (c == 'X' || c == 'W' ? 'bad' : 'good') + ' gene');
    }
}


// Function to reset the calculator
function clearCrops(){
    crops = {};
    document.getElementById('crop-list').innerHTML = '';
    document.getElementById('my-crops').hidden = true;
    document.getElementById('calculation').innerHTML = '';
}

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

function processWorkerMessage(e){
    // Stop loading animation
    document.getElementById('calc-loading').hidden = true;
    document.getElementById('calculation').innerHTML = '';
    
    // If any good crossbreeding is found
    let calculation_div = document.getElementById('calculation');
    if(e.data.max_crop_parents.length > 0){

        // Display parents
        createElement(calculation_div, 'h3', 'Crossbreed these', '');
        e.data.max_crop_parents.forEach(function (crop) {
            for(let i = 0; i < 6; i++){
                let c = crop.charAt(i);
                createElement(calculation_div, 'span', c, (c == 'X' || c == 'W' ? 'bad' : 'good') + ' gene mt-1');
            }
            createElement(calculation_div, 'br', '', '');
        });
        
        // And the result
        createElement(calculation_div, 'br', '', '');
        createElement(calculation_div, 'h3', 'to get', '');
        for(let i = 0; i < 6; i++){
            let g = e.data.max_crop[i];
            let bad = [];
            let good = [];
            if((g & W) > 0) bad.push('W');
            if((g & X) > 0) bad.push('X');
            if((g & Y) > 0) good.push('Y');
            if((g & G) > 0) good.push('G');
            if((g & H) > 0) good.push('H');
            if(g == U) good.push('?');

            let gene_div = createElement(calculation_div, 'div', '', 'multi-gene mt-1');

            if(bad.length > 0){
                createElement(gene_div, 'span', bad.join('<br>'), 'bad gene' + (good.length > 0 ? ' gene-border-nb' : ''));
            }
            if(good.length > 0){
                createElement(gene_div, 'span', good.join('<br>'), 'good gene' + (bad.length > 0 ? ' gene-border-nt' : ''));
            }
        }
        createElement(calculation_div, 'br', '', '');
    }
    else if(e.data.max_crop != undefined){
        createElement(calculation_div, 'h3', 'Best crop is', '');
        for(let i = 0; i < 6; i++){
            let g = e.data.max_crop[i];
            let bad = [];
            let good = [];
            if((g & W) > 0) bad.push('W');
            if((g & X) > 0) bad.push('X');
            if((g & Y) > 0) good.push('Y');
            if((g & G) > 0) good.push('G');
            if((g & H) > 0) good.push('H');
            if(g == U) good.push('?');

            let gene_div = createElement(calculation_div, 'div', '', 'multi-gene mt-1');

            if(bad.length > 0){
                createElement(gene_div, 'span', bad.join('<br>'), 'bad gene' + (good.length > 0 ? ' gene-border-nb' : ''));
            }
            if(good.length > 0){
                createElement(gene_div, 'span', good.join('<br>'), 'good gene' + (bad.length > 0 ? ' gene-border-nt' : ''));
            }
        }
    }
}

// Function to calculate and display the best crop combination
function calculateBest(){
    // Stop any running calculations
    worker.postMessage('reject');
    
    // Show calculation loading animation loading and delete old result
    document.getElementById('calc-loading').hidden = false;
    document.getElementById('calculation').innerHTML = '';
    
    // Pack data for web worker
    let workData = {
        genes : Object.values(crops),
        y_priority : y_priority,
        g_priority : g_priority,
        h_priority : h_priority
    };

    // Start calculation
    worker.postMessage(workData);
}