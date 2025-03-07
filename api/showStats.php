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

$stmt = $link->prepare("SELECT 
    us.games_played,
    us.games_won,
    us.sinked_sub,
    us.sinked_dest,
    us.sinked_crui,
    us.sinked_carr
FROM 
    users u
JOIN 
    user_statistics us
ON 
    u.id = us.user_id
WHERE 
    u.username = ?");

if (!$stmt) {
    errorExit("Błąd przygotowania zapytania: " . $link->error);
}
$stmt->bind_param("s", $obj->username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    echo json_encode(['message' => $row]);
} else {
    errorExit("Nieprawidłowy użytkoiwnik");
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