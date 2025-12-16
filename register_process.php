<?php
require 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $completeName = $_POST['completeName'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    // Check password match
    if ($password !== $confirmPassword) {
        die("Passwords do not match.");
    }

    // Check if username exists
    $check = sqlsrv_query($dbConnection, "SELECT UserID FROM User_Data WHERE Username = ?", [$username]);
    if ($check === false) die(print_r(sqlsrv_errors(), true));

    if (sqlsrv_has_rows($check)) {
        die("Username already exists.");
    }

    // Insert user
    $insertUser = sqlsrv_query(
        $dbConnection,
        "INSERT INTO User_Data (CompleteName, Username, Password) VALUES (?, ?, ?)",
        [$completeName, $username, $password]
    );

    if ($insertUser === false) die(print_r(sqlsrv_errors(), true));

    // Get the last inserted UserID
    $result = sqlsrv_query($dbConnection, "SELECT MAX(UserID) AS user_id FROM User_Data");
    $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
    $userId = $row['user_id'] ?? 0;

    // Optional profile picture
    if (!empty($_FILES['profilePicture']['name']) && $_FILES['profilePicture']['error'] == 0) {
        $fileName = $_FILES['profilePicture']['name'];
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (in_array($fileExt, ['jpg','jpeg','png'])) {
            if (!file_exists('uploads')) mkdir('uploads', 0777, true);

            // Clean filename
            $safeName = preg_replace("/[^a-zA-Z0-9_-]/", "_", pathinfo($fileName, PATHINFO_FILENAME));
            $newFileName = uniqid() . '_' . $safeName . '.' . $fileExt;
            $filePath = 'uploads/' . $newFileName;

            if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $filePath)) {
                $imgInsert = sqlsrv_query(
                    $dbConnection,
                    "INSERT INTO Images (Image_Name, File_Path, [Date_Time], [User]) VALUES (?, ?, GETDATE(), ?)",
                    [$newFileName, $filePath, $userId]
                );

                if ($imgInsert === false) {
                    echo "Image insert failed: ";
                    print_r(sqlsrv_errors());
                }
            } else {
                echo "Failed to upload image file.";
            }
        } else {
            echo "Invalid image type. Only JPG, JPEG, PNG allowed.";
        }
    }

    // Redirect to login or home page
    header("Location: login.html");
    exit();
}
?>
