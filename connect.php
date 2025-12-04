<?php
$serverName = "Daniel\\SQLEXPRESS";
$connectionOptions = [
    "Database" => "DLSU",
    "TrustServerCertificate" => true,
    "Authentication" => "ActiveDirectoryIntegrated"
];
$dbConnection = sqlsrv_connect($serverName, $connectionOptions);
if ($dbConnection === false){
    die(print_r(sqlsrv_errors(), true));
} 
?>
