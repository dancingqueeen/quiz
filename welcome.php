<?php
require 'connect.php';

$username = $_GET['username']; 

$sql = "SELECT ud.CompleteName, img.File_Path 
        FROM User_Data ud 
        LEFT JOIN Images img ON ud.User_Data = img.[User] 
        WHERE ud.Username = ?";

$params = array($username);
$stmt = sqlsrv_query($dbConnection, $sql, $params);
$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

$name = $user['CompleteName'];
$photo = $user['File_Path'] ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f5f5f5; 
            font-family: Arial;
        }
        .box { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 { 
            font-size: 24px; 
            margin-bottom: 20px; 
        }
        .photo { 
            width: 150px; 
            height: 150px; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 3px solid #4a6fa5; 
            margin-bottom: 20px;
        }
        .btn { 
            background: #dc3545; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block;
        }
        .btn:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>Welcome, <?php echo ($name); ?>!</h1>     
        <?php if ($photo): ?>
            <img src="<?php echo ($photo); ?>" class="photo">
        <?php endif; ?>
        <div class="logout-btn">
            <a href="home.html" class="btn">Logout</a>
        </div>
    </div>
</body>
</html>

