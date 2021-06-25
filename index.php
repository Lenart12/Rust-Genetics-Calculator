<?php require_once("counter.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="author" content="LKokos">
    <meta name="description" content="A simple genetics calculator for the plants of Rust">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@_LKokos">
    <meta name="twitter:title" content="Rust Genetics Calculator">
    <meta name="twitter:description" content="A simple genetics calculator for the plants of Rust">
    <meta name="twitter:image" content="http://wigaun.eu.org/genetics/rust.jpg">

    <title>Rust Genetics Calculator</title>

    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">

    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
    <script src="script.js"></script>
</head>

<body class="bg-dark">
    <div class="container-fluid">
        <div class="row mt-5">
            <div class="col-md-10 offset-md-1 text-center">
                <h1>
                    <a class="text-decoration-none" href="#calculator">
                        <span class="rust p-2">Rust Genetics Calculator</span>
                    </a>
                </h1>
                <h3><a href="discord" class="link-danger">Join the new Discord server of this app</a></h3>
                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">

                <!-- How to use collapse control -->
                <h2>
                    <p>
                        How to use
                        <button class="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#howtouse" aria-expanded="false" aria-controls="howtouse">
                            Show
                        </button>
                    </p>
                </h2>

                <!-- Collapse body for how to use -->
                <div class="collapse" id="howtouse">
                    Using the calculator is easy. Enter your crop genes in the text box below as a string of letters
                    (eg. if your crops has <span class="good gene">Y</span> <span class="good gene">G</span>
                    <span class="good gene">H</span> <span class="bad gene">W</span> <span class="bad gene">X</span>
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

            <!-- Left column -->
            <div class="col-md-5 offset-md-1 bg-panel p-3">
                <!-- Input controls -->
                <form id="add-form" onsubmit="addCrop(); return false;">
                    <input class="bg-panel input-dark" type="text" id="add-crop" pattern="^[YGHWXyghwx]{6}$" placeholder="Enter a new crop (eg. YGHWXG)">
                    <button type="submit" class="btn btn-success good">Add crop</button>
                    <button type="button" class="btn btn-secondary" onclick="exportCrops()" title="Save current genes to a file">💾</button>
                    <input type="file" id="import-file" onchange="importCrops(this)" accept="text/plain,.rgc,text/csv" hidden>
                    <label class="btn btn-secondary" for="import-file" style="vertical-align: top" title="Load genes from a file">📄</label>
                </form>

                <hr>

                <!-- Search type tab control -->
                <div class="form-group">
                    <h4>Search type</h4>
                    <ul class="nav nav-tabs" id="search-type-tablist" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link btn-secondary active" onclick="search_settings.settings_type = 0; settingsChanged();" id="desired-gene-tab" data-bs-toggle="tab" data-bs-target="#desired-gene" type="button" role="tab" aria-controls="desired-gene" aria-selected="true">Desired gene</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link btn-secondary" onclick="search_settings.settings_type = 1; settingsChanged();"  id="priority-sliders-tab" data-bs-toggle="tab" data-bs-target="#priority-sliders" type="button" role="tab" aria-controls="priority-sliders" aria-selected="false">Priority sliders</button>
                        </li>
                    </ul>
                </div>

                <!-- Search type tab content -->
                <div class="tab-content" id="search-type-content">
                    <!-- Desired gene settings -->
                    <div class="tab-pane fade show active" id="desired-gene" role="tabpanel" aria-labelledby="desired-gene-tab">
                        <h3 class="mt-2">Desired genes</h3>
                        <small class="text-muted">Tries to find an exact match or returns the closest one.</small><br>
                        <form class="mt-2">
                            <label for="y-priority"><span class="good gene">Y</span> count</label>
                            <input class="bg-panel input-dark" type="number" id="y-count" min="0" max="6" step="1" onchange="settingsChanged()" value="2"><br>

                            <label for="g-priority"><span class="good gene">G</span> count</label>
                            <input class="bg-panel input-dark" type="number" id="g-count" min="0" max="6" step="1" onchange="settingsChanged()" value="4"><br>

                            <label for="h-priority"><span class="good gene">H</span> count</label>
                            <input class="bg-panel input-dark" type="number" id="h-count" min="0" max="6" step="1" onchange="settingsChanged()" value="0"><br>
                        </form>
                    </div>

                    <!-- Priority sliders settings -->
                    <div class="tab-pane fade" id="priority-sliders" role="tabpanel" aria-labelledby="priority-sliders-tab">
                        <h3 class="mt-2">Gene priority</h3>
                        <small class="text-muted">Finds the best combination depending on the priority.</small><br>
                        <form class="mt-2">
                            <label for="y-priority"><span class="good gene">Y</span> priority</label>
                            <input type="range" id="y-priority" min="0.01" max="1" step="0.01" onchange="settingsChanged()" value="0.5"><br>

                            <label for="g-priority"><span class="good gene">G</span> priority</label>
                            <input type="range" id="g-priority" min="0.01" max="1" step="0.01" onchange="settingsChanged()" value="0.5"><br>

                            <label for="h-priority"><span class="good gene">H</span> priority</label>
                            <input type="range" id="h-priority" min="0.01" max="1" step="0.01" onchange="settingsChanged()" value="0.01"><br>
                        </form>
                    </div>
                </div>

                <!-- Planned feature -->
                <!-- 
                <hr>

                <h4>Multi-level search</h4>
                <form>
                    <label for="search-depth">Depth</label>
                    <input type="number" class="bg-panel input-dark" name="search-depth" id="search-depth" aria-describedby="search-help" min="0" max="5" value="0"><br>
                    <small id="search-help" class="form-text text-muted">Might find better results but takes longer to calculate.</small>
                </form>
                -->

                <!-- List of crops - hidden on default -->
                <div id="my-crops" hidden>
                    <hr>
                    <h3 class="d-inline-block">My crops</h3>
                    <button type="button" class="btn btn-del mb-2 ml-3" onclick="if(confirm('Are you sure you want to clear all current crops'))clearCrops()">Clear</button>
                    <ul id="crop-list" class="mt-2">
    
                    </ul>
                </div>
            </div>

            <!-- Right column -->
            <div class="col-md-5 bg-panel p-3">

                <!-- Loading animation - hidden on default -->
                <div class="text-center pt-5" id="calc-loading" hidden>
                    <svg version="1.1" id="loading_animation" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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

                <!-- Container for calculation results -->
                <div id="calculation"></div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">

                <hr>

                <!-- Genome explination -->
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
            <!-- Good genomes -->
            <div class="col-md-5 offset-md-1 bg-panel p-3">
                <span class="good gene">Y</span> Increases crop <span class="good">production amount</span> <span class="small">(yield)</span> <br>
                <span class="good gene">G</span> Increases crop <span class="good">growth rate</span>  <br>
                <span class="good gene">H</span> Increases crop <span class="good">hardiness</span>  <br>
            </div>

            <!-- Bad genomes -->
            <div class="col-md-5 bg-panel p-3">
                <span class="bad gene">W</span> Increases <span class="bad">water usage</span>  <br>
                <span class="bad gene">X</span> Is bad
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1">
                <hr>

                <!-- How to crossbreed -->
                <h2 id="crossbreeding">Crossbreeding</h2>
                <p>
                    About 20 minutes after planting every crop will enter a crossbreeding stage. When it enters this stage, the plant will look
                    at its <strong>neighbour plants in the planter</strong> (not including itself) for any genes that it can receive.
                    The crossbreeding stage will also be indicated when looking at the plant under the stage category.
                </p>
                <p>
                    If you are interesed in a detailed explanation of crossbreeding I suggest watching <a href="https://www.youtube.com/watch?v=WQ0ixceBZwA">this video</a>
                    (or look at the source code on <a href="https://github.com/Lenart12/Rust-Genetics-Calculator/blob/afaec022224cf14aaa96af494ba84429df418f61/genetics-worker.js#L86">GitHub</a>),
                    but in short when crossbreeding occurs, the crop will go looking for each of the six genes of neighbours and
                    select the one that was found the most times for that position (with negative ones taking priority). If all genes
                    had the same amount of occurances, no crossbreeding will occur for that gene.
                </p>

                <hr>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 offset-md-1 text-center">
                <!-- Feedback collapse control -->
                <p>
                    <a class="btn btn-primary" id="btn-feedback" role="button" data-bs-toggle="collapse" href="#feedbackCollapse" aria-expanded="false" aria-controls="feedbackCollapse">
                        Leave feedback
                    </a>
                </p>

                <!-- Feedback collapse body -->
                <div class="collapse" id="feedbackCollapse">
                    <form id="feedback-form" onsubmit="feedback(); return false;">
                        <!-- Text area -->
                        <div class="form-group">
                          <label for="text">Feedback</label>
                          <textarea class="form-control" name="text" id="text" rows="6" placeholder="Leave your feedback here or send it in the Discord server - link below" required></textarea>
                        </div>

                        <!-- Contact -->
                        <div class="form-group">
                          <label for="contact">Your contact</label>
                          <input type="email" class="form-control" name="contact" id="contact" aria-describedby="emailHelpId" placeholder="Contact email (optional)">
                          <small id="emailHelpId" class="form-text text-muted">If you prefer other method of communicaton mention it in the feedback content</small>
                        </div>

                        <!-- Submit -->
                        <button type="submit" class="btn btn-primary">Send</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <!-- Footer -->
            <div class="col-md-10 offset-md-1 text-center mb-3 ">
                <hr>
                <!-- Paypal donation link -->
                <form action="https://www.paypal.com/donate" method="post" target="_top">
                    <input type="hidden" name="hosted_button_id" value="7ZLM6BKXDEG5A" />
                    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                    <img alt="" border="0" src="https://www.paypal.com/en_SI/i/scr/pixel.gif" width="1" height="1" />
                </form>

                <!-- Special thanks -->
                <small class="text-muted">Special thanks to IIvIIiIIvIIiC and Clark for his support!</small><br>

                <!-- Copyright & Contact -->
                Made by <a href="https://steamcommunity.com/id/LKokos/">LKokos</a> © 2021 - <a href="/">Homepage</a> - <a href="https://github.com/Lenart12/Rust-Genetics-Calculator">GitHub</a> - <a href="discord">Discord</a><br>

                <!-- Disclamer -->
                <small class="text-muted">By using this website you consent to using cookies on this site. The site also tracks parts of your http request and the seeds you enter.</small>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 javascript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>

</body>
</html>