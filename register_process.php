<?php
require 'connect.php';

$completeName = $_POST['completeName'];
$username = $_POST['username'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];

if ($password != $confirmPassword) {
    echo "Passwords don't match";
    exit();
}

$check = sqlsrv_query($dbConnection, "SELECT User_Data 
        FROM User_Data 
        WHERE Username = '$username'");
        
if (sqlsrv_has_rows($check)) {
    echo "Username exists";
    exit();
}

sqlsrv_query($dbConnection, "INSERT INTO User_Data (CompleteName, Username, Password, CreatedAt) 
VALUES ('$completeName', '$username', '$password', GETDATE())");

$result = sqlsrv_query($dbConnection, "SELECT MAX(User_Data) AS user_id FROM User_Data");
$row = sqlsrv_fetch_array($result);
$userId = $row['user_id'];


if (isset($_FILES['profilePicture'])) {
    $fileName = $_FILES['profilePicture']['name'];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    if ($fileExt == 'jpg') {
        $filePath = 'uploads/' . $fileName;
        move_uploaded_file($_FILES['profilePicture']['tmp_name'], $filePath);
        
        sqlsrv_query($dbConnection, "INSERT INTO Images 
        (Image_Name, File_Path, Date_Time, [User]) 
        VALUES ('$fileName', '$filePath', GETDATE(), '$userId')");
    }
}

header("Location: home.html");
exit();