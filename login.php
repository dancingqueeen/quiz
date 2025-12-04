<?php
require 'connect.php';
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $email = $_POST['username'];
    $password = $_POST['password'];

    $sql = "SELECT User_Data, CompleteName, Username, Password 
            FROM User_Data 
            WHERE Username = ?";
    $params = array($email);
    $stmt = sqlsrv_query($dbConnection, $sql, $params);

    if (sqlsrv_has_rows($stmt)) {
        $user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

        if ($password === $user['Password']) {
      
            header("Location: welcome.php?username=" . $user['Username']);
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
