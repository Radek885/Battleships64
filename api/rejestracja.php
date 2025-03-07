<?php

//require 'session.php';

header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'battleships64';

$obj = json_decode($_POST['json'],false);
$link = new mysqli($host, $user, $pass, $dbname);

if(empty($obj->username) || empty($obj->password))
{
    errorExit("Pola nie mogą być puste");
};

if ($link->connect_error)
{
    errorExit("Błąd połączenia z bazą");
};

$stmt = $link->prepare("SELECT * FROM `users` WHERE `username` = ?");
$stmt->bind_param("s", $obj->username);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0)
{
    errorExit("Taki użytkownik istnieje");
};

$hash = password_hash($obj->password, PASSWORD_DEFAULT);

$stmt = $link->prepare("INSERT INTO `users`(`username`, `user_password`) VALUES (?, ?)");
$stmt->bind_param("ss", $obj->username, $hash);

if (!$stmt->execute())
    errorExit("Błąd podczas rejestracji");

$stmt = $link->prepare("SELECT id FROM `users` WHERE `username` = ?");
$stmt->bind_param("s", $obj->username);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$user_id = $row['id'];

$stmt = $link->prepare("INSERT INTO `user_statistics`(`user_id`) VALUES (?)");
$stmt->bind_param("i", $user_id);
$stmt->execute();

echo json_encode(['message' => 'Rejestracja Udana']);
//login($obj->username);
$link->close();
exit;

function errorExit($errormessage)
{
    echo json_encode(['message' => 'error', 'error' => $errormessage]);
    global $link;
    $link->close();
    exit;
}

?>