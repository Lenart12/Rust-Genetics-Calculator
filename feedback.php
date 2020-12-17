<?php
/* 
-- Create table
CREATE TABLE `genetics`.`feedback` (
    `id` INT NOT NULL AUTO_INCREMENT ,
    `time` DATETIME NOT NULL ,
    `text` TEXT NOT NULL ,
    `session` INT NULL,
    `contact` VARCHAR(200) NOT NULL ,
    PRIMARY KEY (`id`))
ENGINE = InnoDB; 

ALTER TABLE `feedback` ADD FOREIGN KEY (`session`) REFERENCES `pageviews`(`id`); 
*/

session_start();

// Save feedback in database
if(isset($_GET['text']) and (count($_GET) == 1 or (count($_GET) == 2 && isset($_GET['contact'])))){
    require_once("secret.php");
    $conn = new mysqli(...$cred);
    $insert = $conn->prepare('INSERT INTO `feedback` (`id`, `time`, `text`, `session`, `contact`) VALUES (NULL, CURRENT_TIMESTAMP(), ?, ?, ?) ');

    $_GET['text'] = htmlspecialchars($_GET['text']);
    $_GET['contact'] = htmlspecialchars($_GET['contact'] ?? '');
    $user_session = $_SESSION['user_session'] ?? NULL;

    $insert->bind_param('sis', $_GET['text'], $user_session, $_GET['contact']);
    $insert->execute();
    http_response_code(200); // HTTP: Success
}
else{
    http_response_code(400); // HTTP: Bad request
}
die();
?>