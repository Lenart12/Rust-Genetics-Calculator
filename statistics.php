<?php
/* MySql
-- Create database
CREATE DATABASE `genetics`;
USE `genetics`;

-- Create table
CREATE TABLE `genes` (
  `GeneID` int(11) NOT NULL AUTO_INCREMENT,
  `Gene` varchar(6) NOT NULL,
  `session` INT NULL,
  `time` TIMESTAMP NOT NULL
  PRIMARY KEY (`GeneID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `genes` ADD FOREIGN KEY (`session`) REFERENCES `pageviews`(`id`); 
*/

session_start();

// Save added gene in database
if(count($_GET) == 1 && isset($_GET['genes']) && preg_match('/^[YGHWX]{6}$/', $_GET['genes'])){
    // Prevent logging of crops in staging branch
    if(strpos($_SERVER['REQUEST_URI'], "gensta") !== false){
        http_response_code(202); // HTTP: Accepted
        die();
    }
  
    require_once("secret.php");
    $conn = new mysqli(...$cred);
    
    $user_session = $_SESSION['user_session'] ?? NULL;
    
    // If no user session try to guess it
    if($user_session == NULL){
        $select = $conn->prepare("SELECT `id` FROM `pageviews` WHERE `time` > NOW() - INTERVAL 3 HOUR AND `ip` = ? AND `useragent` = ? ORDER BY `time` DESC LIMIT 1");
        $ip = inet_pton( $_SERVER["REMOTE_ADDR"] );
        $ua = substr( htmlspecialchars( $_SERVER["HTTP_USER_AGENT"]  ), 0, 500);
        $select->bind_param('is', $ip, $ua);
        $select->execute();
        $select->bind_result($user_session);
        if($select->fetch()){
            $_SESSION['user_session'] = $user_session;
        }
        $select->close();
    }
    
    $insert = $conn->prepare('INSERT INTO `genes` (`GeneID`, `Gene`, `session`, `time`) VALUES (NULL, ?, ?, CURRENT_TIMESTAMP())');
    $insert->bind_param('si', $_GET['genes'], $user_session);
    $insert->execute();

    http_response_code(200); // HTTP: Success
}
else{
    http_response_code(400); // HTTP: Bad request
}
die();
?>