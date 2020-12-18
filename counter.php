<?php
/*
-- Create Table
CREATE TABLE `genetics`.`pageviews` (
    `id` INT NOT NULL AUTO_INCREMENT ,
    `ip` VARBINARY(16) NOT NULL ,
    `useragent` VARCHAR(500) NOT NULL ,
    `request` VARCHAR(50) NOT NULL ,
    `time` DATETIME NOT NULL ,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB; 
*/

session_start();

// Only track on session start
if(!isset($_SESSION['user_session'])){
    require_once("secret.php");
    
    // Save IP, user-agent and request uri
    $ip = inet_pton( $_SERVER["REMOTE_ADDR"] );
    $ua = substr( htmlspecialchars( $_SERVER["HTTP_USER_AGENT"]  ), 0, 500);
    $rq = substr( htmlspecialchars( (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"  ), 0, 50);
    
    $conn = new mysqli(...$cred);
    
    $insert = $conn->prepare('INSERT INTO `pageviews` (`id`, `ip`, `useragent`, `request`, `time`) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP)');
    $insert->bind_param('sss', $ip, $ua, $rq);
    $insert->execute();
    
    // Set session id
    $_SESSION['user_session'] = $insert->insert_id;
}