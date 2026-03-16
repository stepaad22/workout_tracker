<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

require_once dirname(__FILE__) . "/db.php";

function getTokenData() {
    $headers = getallheaders();
    $auth = "";

    if (isset($headers["Authorization"])) {
        $auth = $headers["Authorization"];
    } else if (isset($headers["authorization"])) {
        $auth = $headers["authorization"];
    }

    if ($auth === "") return null;
    if (strpos($auth, "Bearer ") !== 0) return null;

    $token = substr($auth, 7);
    $decoded = base64_decode($token);
    $data = json_decode($decoded, true);

    if (!$data) return null;
    if (!isset($data["user_id"])) return null;
    if (!isset($data["exp"])) return null;
    if ($data["exp"] < time()) return null;

    return $data;
}

$userData = getTokenData();

if (!$userData) {
    sendJson(array("message" => "Neplatny token"), 401);
}

$userId = (int)$userData["user_id"];

$action = isset($_GET["action"]) ? $_GET["action"] : "";
$method = isset($_SERVER["REQUEST_METHOD"]) ? $_SERVER["REQUEST_METHOD"] : "";
$data = getData();

if ($method === "GET" && $action === "list") {
    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute(array($userId));
    $workouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    for ($i = 0; $i < count($workouts); $i++) {
        $stmt2 = $pdo->prepare("SELECT COUNT(*) as pocet FROM exercises WHERE workout_id = ?");
        $stmt2->execute(array($workouts[$i]["id"]));
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);
        $workouts[$i]["exerciseCount"] = (int)$row["pocet"];
    }

    sendJson($workouts, 200);
}

if ($method === "GET" && $action === "detail") {
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($id, $userId));
    $workout = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$workout) {
        sendJson(array("message" => "Trenink nenalezen"), 404);
    }

    $stmt2 = $pdo->prepare("SELECT * FROM exercises WHERE workout_id = ? ORDER BY id ASC");
    $stmt2->execute(array($id));
    $exercises = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    $workout["exercises"] = $exercises;

    sendJson($workout, 200);
}

if ($method === "POST" && $action === "create") {
    $date = isset($data["date"]) ? trim($data["date"]) : "";
    $type = isset($data["type"]) ? trim($data["type"]) : "";
    $note = isset($data["note"]) ? trim($data["note"]) : "";

    if ($date === "" || $type === "") {
        sendJson(array("message" => "Chybi datum nebo typ"), 400);
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO workouts (user_id, date, type, note) VALUES (?, ?, ?, ?)");
        $stmt->execute(array($userId, $date, $type, $note));

        $newId = (int)$pdo->lastInsertId();

        sendJson(array(
            "message" => "Trenink vytvoren",
            "id" => $newId,
            "date" => $date,
            "type" => $type,
            "note" => $note
        ), 201);
    } catch (Exception $e) {
        sendJson(array(
            "message" => "INSERT CHYBA",
            "error" => $e->getMessage()
        ), 500);
    }
}

if ($method === "POST" && $action === "delete") {
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

    $stmt = $pdo->prepare("DELETE FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($id, $userId));

    sendJson(array("message" => "Trenink smazan"), 200);
}

if ($method === "POST" && $action === "add-exercise") {
    $workoutId = isset($_GET["workout_id"]) ? (int)$_GET["workout_id"] : 0;

    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($workoutId, $userId));
    $workout = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$workout) {
        sendJson(array("message" => "Trenink nenalezen"), 404);
    }

    $name = isset($data["name"]) ? trim($data["name"]) : "";
    $sets = isset($data["sets"]) ? (int)$data["sets"] : 0;
    $reps = isset($data["reps"]) ? (int)$data["reps"] : 0;
    $weight = isset($data["weight"]) ? (float)$data["weight"] : 0;

    if ($name === "" || $sets <= 0 || $reps <= 0) {
        sendJson(array("message" => "Spatna data cviku"), 400);
    }

    $stmt = $pdo->prepare("INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(array($workoutId, $name, $sets, $reps, $weight));

    sendJson(array("message" => "Cvik pridan"), 201);
}

sendJson(array("message" => "Neplatna akce"), 400);