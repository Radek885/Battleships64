<?php

//require 'session.php';

header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'battleships64';

$obj = json_decode($_POST['json'],false);
$link = new mysqli($host, $user, $pass, $dbname);

if ($link->connect_error)
{
    errorExit("Błąd połączenia z bazą");
};

$stmt = $link->prepare("SELECT * FROM `users` WHERE `username` = ?");
if (!$stmt) {
    errorExit("Błąd przygotowania zapytania: " . $link->error);
}
$stmt->bind_param("s", $obj->username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($obj->password, $row['user_password'])) {
        echo json_encode(['message' => 'Logowanie udane']);
        //login($obj->username);
    } else {
        errorExit("Nieprawidłowe hasło lub użytkownik");
    }
} else {
    errorExit("Nieprawidłowe hasło lub użytkownik");
}

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