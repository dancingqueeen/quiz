<?php
require 'connect.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Get input
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Query User_Data table
    $sql = "SELECT UserID, CompleteName, Username, Password 
            FROM User_Data 
            WHERE Username = ?";
    $params = [$username];
    $stmt = sqlsrv_query($dbConnection, $sql, $params);

    if ($stmt === false) {
        die(print_r(sqlsrv_errors(), true));
    }

    if (sqlsrv_has_rows($stmt)) {
        $user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

        // Check password
        if ($password === $user['Password']) {
            // Successful login
            header("Location: ../home/index.html");
            exit();
        } else {
            echo "<p style='color:red;'>Invalid password</p>";
        }

    } else {
        echo "<p style='color:red;'>User not found</p>";
    }

    sqlsrv_free_stmt($stmt);

} else {
    echo "<p>Please submit the form.</p>";
}

sqlsrv_close($dbConnection);
?>
