<?php
/* MySql
-- Create database
CREATE DATABASE `genetics`;
USE `genetics`;

-- Create table
CREATE TABLE `genes` (
  `GeneID` int(11) NOT NULL AUTO_INCREMENT,
  `Gene` varchar(6) NOT NULL,
  `time` TIMESTAMP NOT NULL
  PRIMARY KEY (`GeneID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

// Save added gene in database
if(count($_GET) == 1 && isset($_GET['genes']) && preg_match('/^[YGHWX]{6}$/', $_GET['genes'])){
    // Prevent logging of crops in staging branch
    if(strpos($_SERVER['REQUEST_URI'], "staging") !== false){
        http_response_code(202); // HTTP: Accepted
        die();
    }
    require_once("secret.php");
    $conn = new mysqli(...$cred);
    $insert = $conn->prepare('INSERT INTO genes VALUES(NULL, ?, CURRENT_TIMESTAMP)');
    $insert->bind_param('s', $_GET['genes']);
    $insert->execute();
    http_response_code(200); // HTTP: Success
}
else{
    http_response_code(400); // HTTP: Bad request
}
die();
?>