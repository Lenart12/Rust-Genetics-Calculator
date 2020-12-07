// B=============D ~~~~

// Array to store all the entered crops
let crops = {}
let cid = -1;
let y_priority;
let g_priority;
let h_priority;

let worker;

// Onload
$(() => {
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

    // addCropByGene('WHHXGG');
    // addCropByGene('HHGHHH');
    // addCropByGene('HYHWHH');
    // addCropByGene('YHHHGH');
    // addCropByGene('YGGXHH');
    // addCropByGene('WHHXGG');
    // addCropByGene('HHGHHH');
    // addCropByGene('HYHWHH');
    // addCropByGene('YHHHGH');
    // addCropByGene('YGGXHH');
    // addCropByGene('WHHXGG');
    // addCropByGene('HHGHHH');
    // addCropByGene('YGGXHH');
    // addCropByGene('HYHWHH');
    // addCropByGene('YHHHGH');
    // addCropByGene('YGGXHH');
    // addCropByGene('WHHXGG');
    // addCropByGene('HHGHHH');
    // addCropByGene('HYHHHH');
    // addCropByGene('YHHHGH');
    // addCropByGene('YGGXHH', true);
    // 2318 ms
    // 1844 ms
})

// Helper function to dynamicaly create elements
function createElement(parent, type, text, classList){
    let el = document.createElement(type);
    el.innerText = text;
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
    $('#feedbackCollapse').collapse('hide')
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
    del_btn.addEventListener('click', ()=>{ deleteCrop(del_id); li.remove(); });
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

function processWorkerMessage(e){
    // Stop loading animation
    document.getElementById('calc-loading').hidden = true;
    document.getElementById('calculation').innerHTML = '';
    
    // If any good crossbreeding is found
    if(e.data.max_crop_parents.length > 0){
        let calculation_div = document.getElementById('calculation');
        
        // Display parents
        createElement(calculation_div, 'h3', 'Crossbreed these', '');
        e.data.max_crop_parents.forEach((crop) =>  {
            for(let i = 0; i < 6; i++){
                let c = crop.charAt(i);
                createElement(calculation_div, 'span', c, ( (c == 'X' || c == 'W') ? 'bad' : 'good' ) + ' gene mt-1'  )
            }
            createElement(calculation_div, 'br', '', '');
        })
        
        // And the result
        createElement(calculation_div, 'br', '', '');
        createElement(calculation_div, 'h3', 'to get', '');
        for(let i = 0; i < 6; i++){
            let c = e.data.max_crop.charAt(i);
            createElement(calculation_div, 'span', c, ( (c == 'X' || c == 'W') ? 'bad' : 'good' ) + ' gene mt-1'  )
        }
        createElement(calculation_div, 'br', '', '');
    }
}

// Function to calculate and display the best crop combination
function calculateBest(){
    // Stop any running calculations
    worker.postMessage('reject')

    // Show calculation loading animation loading and delete old result
    document.getElementById('calc-loading').hidden = false;
    document.getElementById('calculation').innerHTML = '';

    // Pack data for web worker
    let workData = {
        genes : Object.values(crops),
        y_priority : y_priority,
        g_priority : g_priority,
        h_priority : h_priority
    }

    // Start calculation
    worker.postMessage(workData);
}