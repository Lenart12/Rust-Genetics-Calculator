<?php
/* 
-- Create table
CREATE TABLE `genetics`.`feedback` (
    `id` INT NOT NULL AUTO_INCREMENT ,
    `time` DATETIME NOT NULL ,
    `text` TEXT NOT NULL ,
    `contact` VARCHAR(200) NOT NULL ,
    PRIMARY KEY (`id`))
ENGINE = InnoDB; 
*/

// Save feedback in database
if(isset($_GET['text']) and (count($_GET) == 1 or (count($_GET) == 2 && isset($_GET['contact'])))){
    require_once("secret.php");
    $conn = new mysqli(...$cred);
    $insert = $conn->prepare('INSERT INTO feedback VALUES(NULL, CURRENT_TIMESTAMP(), ?, ?)');
    $_GET['text'] = htmlspecialchars($_GET['text']);
    $_GET['contact'] = htmlspecialchars($_GET['contact'] ?? '');
    $insert->bind_param('ss', $_GET['text'], $_GET['contact']);
    $insert->execute();
    http_response_code(200); // HTTP: Success
}
else{
    http_response_code(400); // HTTP: Bad request
}
die();
?>