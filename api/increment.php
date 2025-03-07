<?php

//require 'session.php';

header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'battleships64';

$obj = json_decode($_POST['json'],false);
$link = new mysqli($host, $user, $pass, $dbname);
$link->autocommit(false);

if ($link->connect_error)
{
    errorExit("Błąd połączenia z bazą");
};

$username = $obj->username;
$statColumn = $obj->increment;

$allowedColumns = ['games_played', 'games_won', 'sinked_sub', 'sinked_dest', 'sinked_crui', 'sinked_carr'];
if (!in_array($statColumn, $allowedColumns)) {
    errorExit("Nieprawidłowa kolumna!");
}

$sql = "UPDATE 
            user_statistics us
        JOIN 
            users u
        ON 
            u.id = us.user_id
        SET 
            us.$statColumn = us.$statColumn + 1
        WHERE 
            u.username = ?";

$stmt = $link->prepare($sql);

if (!$stmt) {
    errorExit("Błąd przygotowania zapytania: " . $link->error);
}
$stmt->bind_param("s", $username);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Zaktualizowano statystykę!']);
} else {
    echo "Błąd podczas aktualizacji: " . $stmt->error;
}

$link->commit();
$stmt->close();
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