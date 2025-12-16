<?php
$serverName = "Daniel\\SQLEXPRESS";
$connectionOptions = [
    "Database" => "Website",
    "TrustServerCertificate" => true,
    "Authentication" => "ActiveDirectoryIntegrated"
];

$dbConnection = sqlsrv_connect($serverName, $connectionOptions);

if ($dbConnection === false) {
    die("❌ Connection Failed: " . print_r(sqlsrv_errors(), true));
}
?>
