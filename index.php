<?php require_once("counter.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="author" content="LKokos">
    <meta name="description" content="A simple genetics calculator for the plants of Rust">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@_LKoos">
    <meta name="twitter:title" content="Rust Genetics Calculator">
    <meta name="twitter:description" content="A simple genetics calculator for the plants of Rust">
    <meta name="twitter:image" content="http://wigaun.eu.org/genetics/rust.jpg">

    <title>Rust Genetics Calculator</title>

    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"
        integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
        integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
        crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
        integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
        crossorigin="anonymous"></script>
        
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body class="bg-dark">
    <div class="container-fluid">
        <div class="row mt-5">
            <div class="col-md-10 offset-md-1 text-center">
                <h1>
                    <a href="#calculator">
                        <span class="rust p-2">Rust Genetics Calculator</span>
                    </a>
                </h1>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <h2>
                    <p>
                        How to use
                    <button class="btn btn-secondary d-inline-block" type="button" data-toggle="collapse" data-target="#howtouse" aria-expanded="false"
                            aria-controls="howtouse">
                        Show
                    </button>
                </p>
                </h2>
                <div class="collapse" id="howtouse">
                    Using the calculator is easy. Enter your crop genes in the text box below as a string of letters
                    (eg. if your crops has <span class="good gene">Y</span>
                                           <span class="good gene">G</span>
                                           <span class="good gene">H</span>
                                           <span class="bad gene">W</span>
                                           <span class="bad gene">X</span>
                                           <span class="good gene">G</span> genes, you would enter YGHWXG) and press enter.
                    The calculator will automatically find the best possible combination of the current entered crops. <br><br>
                    If you want you could also change the preference of what genes you would like to get. Default priorities
                    are set for temperate biomes, so if you live in a cold biome, make sure to increase <span class="good gene">H</span> priority.
                    Click here if you would like to learn more about <a href="#genes">genes</a> or <a href="#crossbreeding">crossbreeding</a>. <br><br>
                    The result of the calculation will apear next to where you entered your crops. It will display what crops you need to crossbreed
                    and what you will get. If you see results with <span class="good gene">?</span> genes, it means that no crossbreeding will occur for
                    that gene. Results with multiple genes in one column means there is multiple options of mutating a gene. <br><br>
                    You can also load your genes from file or save your current genes by clicking the two buttons next to adding the crop.
                </div>
                <hr>
            </div>
        </div>
        <div class="row" id="calculator">
            <div class="col-md-5 offset-md-1 bg-panel p-3">
                <form id="add-form" onsubmit="addCrop(); return false;">
                    <input class="bg-panel" type="text" id="add-crop" pattern="^[YGHWXyghwx]{6}$" placeholder="Enter a new crop (eg. YGHWXG)">
                    <button type="submit" class="btn btn-success good">Add crop</button>
                    <button type="button" class="btn btn-secondary" onclick="exportCrops()">💾</button>
                    <input type="file" id="import-file" onchange="importCrops(this)" accept="text/plain,.rgc,text/csv" hidden>
                    <label class="btn btn-secondary" for="import-file" style="vertical-align: top">📄</label>
                </form>
                <hr>
                <h3>Gene priority</h3>
                <p>Used when evaluating each cross-breeding outcome</p>
                <form>
                    <label for="y-priority"><span class="good gene">Y</span> priority</label>
                    <input type="range" id="y-priority" min="0.01" max="1" step="0.01" onchange="y_priority = parseFloat(document.getElementById('y-priority').value); calculateBest()" value="0.5"><br>

                    <label for="g-priority"><span class="good gene">G</span> priority</label>
                    <input type="range" id="g-priority" min="0.01" max="1" step="0.01" onchange="g_priority = parseFloat(document.getElementById('g-priority').value); calculateBest()" value="0.5"><br>

                    <label for="h-priority"><span class="good gene">H</span> priority</label>
                    <input type="range" id="h-priority" min="0.01" max="1" step="0.01" onchange="h_priority = parseFloat(document.getElementById('h-priority').value); calculateBest()" value="0.01"><br>

                </form>
                <div id="my-crops" hidden>
                    <hr>
                    <h3 class="d-inline-block">My crops</h3>
                    <button type="button" class="btn btn-del mb-2 ml-3" onclick="if(confirm('Are you sure you want to clear all current crops'))clearCrops()">Clear</button>
                    <ul id="crop-list" class="mt-2">
    
                    </ul>
                </div>
            </div>
            <div class="col-md-5 bg-panel p-3">
                <div class="text-center pt-5" id="calc-loading" hidden>
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                       width="60px" height="75px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">
                      <rect x="0" y="13" width="4" height="5" fill="#333">
                        <animate attributeName="height" attributeType="XML"
                          values="5;21;5" 
                          begin="0s" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" attributeType="XML"
                          values="13; 5; 13"
                          begin="0s" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                      <rect x="10" y="13" width="4" height="5" fill="#333">
                        <animate attributeName="height" attributeType="XML"
                          values="5;21;5" 
                          begin="0.15s" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" attributeType="XML"
                          values="13; 5; 13"
                          begin="0.15s" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                      <rect x="20" y="13" width="4" height="5" fill="#333">
                        <animate attributeName="height" attributeType="XML"
                          values="5;21;5" 
                          begin="0.3s" dur="0.6s" repeatCount="indefinite" />
                        <animate attributeName="y" attributeType="XML"
                          values="13; 5; 13"
                          begin="0.3s" dur="0.6s" repeatCount="indefinite" />
                      </rect>
                    </svg>
                </div>
                <div id="calculation">

                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <hr>
                <h2 id="genes">Genes</h2>
                <p class="lead">
                    Every plant has 6 genes. Currently there are 5 different gene types that a plant can have.
                    Genes alter the plant behaviour depending on the type and amount. The type of the 6 genes can be
                    changed with cross-breeding. The best gene if you are not in the winter biome is any combination of 3
                    <span class="good gene">G</span> and 3 <span class="good gene">Y</span> genes.
                </p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-5 offset-md-1 bg-panel p-3">
                <span class="good gene">Y</span> Increases crop <span class="good">production amount</span> <span class="small">(yield)</span> <br>
                <span class="good gene">G</span> Increases crop <span class="good">growth rate</span>  <br>
                <span class="good gene">H</span> Increases crop <span class="good">cold resistance</span>  <br>
            </div>
            <div class="col-md-5 bg-panel p-3">
                <span class="bad gene">W</span> Increases <span class="bad">water usage</span>  <br>
                <span class="bad gene">X</span> Is bad
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <hr>
                <h2 id="crossbreeding">Crossbreeding</h2>
                <p>
                    About 20 minutes after planting every crop will enter a crossbreading stage. When it enteres this stage, the plant will look
                    at its <strong>neighbour plants in the planter</strong> (not including itself) for any genes that it can recive.
                    The crossbreading stage will also be indicated when looking at the plant under the stage category.
                </p>
                <p>
                    If you are interesed in a detailed explanation of crossbreeding I sugest watching <a href="https://www.youtube.com/watch?v=WQ0ixceBZwA">this video</a>
                    (or look at the source code on <a href="https://github.com/Lenart12/Rust-Genetics-Calculator">Github</a>),
                    but in short when crossbreeding occurs, the crop will go looking for each of the six genes of neighbours and
                    select the one that was found the most times for that position (with negative ones taking priority). If all genes
                    had the same amount of occurances, no crossbreading will occur for that gene.
                </p>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1 text-center">
                <p>
                    <a class="btn btn-primary" id="btn-feedback" data-toggle="collapse" href="#feedbackCollapse" aria-expanded="false" aria-controls="feedbackCollapse">
                        Leave feedback
                    </a>
                </p>
                <div class="collapse" id="feedbackCollapse">
                    <form id="feedback-form" onsubmit="feedback(); return false;">
                        <div class="form-group">
                          <label for="text">Feedback</label>
                          <textarea class="form-control" name="text" id="text" rows="6" placeholder="Your feedback content" required></textarea>
                        </div>
                        <div class="form-group">
                          <label for="contact">Your contact</label>
                          <input type="email" class="form-control" name="contact" id="contact" aria-describedby="emailHelpId" placeholder="Contact email (optional)">
                          <small id="emailHelpId" class="form-text text-muted">If you prefer other method of communicaton mention it in the feedback content</small>
                        </div>
                        <button type="submit" class="btn btn-primary">Send</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1 text-center mb-3 ">
                <hr>
                <form action="https://www.paypal.com/donate" method="post" target="_top">
                    <input type="hidden" name="hosted_button_id" value="7ZLM6BKXDEG5A" />
                    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                    <img alt="" border="0" src="https://www.paypal.com/en_SI/i/scr/pixel.gif" width="1" height="1" />
                </form>
                <small class="text-muted">Special thanks to Clark for his support!</small><br>
                Made by <a href="https://steamcommunity.com/id/LKokos/">LKokos</a> © 2020 - <a href="/">Homepage</a> - <a href="https://github.com/Lenart12/Rust-Genetics-Calculator">Github</a><br>
                <small class="text-muted">By using this website you consent to using cookies on this site. The site also tracks parts of your http request and the seeds you enter.</small>
            </div>
        </div>
    </div>
</body>
</html>