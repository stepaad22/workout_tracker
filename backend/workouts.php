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

    if ($auth === "") {
        return null;
    }

    if (strpos($auth, "Bearer ") !== 0) {
        return null;
    }

    $token = substr($auth, 7);
    $decoded = base64_decode($token);
    $data = json_decode($decoded, true);

    if (!$data) {
        return null;
    }

    if (!isset($data["user_id"])) {
        return null;
    }

    if (!isset($data["exp"])) {
        return null;
    }

    if ($data["exp"] < time()) {
        return null;
    }

    return $data;
}

$userData = getTokenData();

if (!$userData) {
    sendJson(array("message" => "Neplatny token"), 401);
}

$userId = (int)$userData["user_id"];

$action = "";
if (isset($_GET["action"])) {
    $action = $_GET["action"];
}

$method = "";
if (isset($_SERVER["REQUEST_METHOD"])) {
    $method = $_SERVER["REQUEST_METHOD"];
}

$data = getData();

if ($method === "GET" && $action === "list") {
    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute(array($userId));
    $workouts = $stmt->fetchAll();

    for ($i = 0; $i < count($workouts); $i++) {
        $stmt2 = $pdo->prepare("SELECT COUNT(*) as pocet FROM exercises WHERE workout_id = ?");
        $stmt2->execute(array($workouts[$i]["id"]));
        $row = $stmt2->fetch();
        $workouts[$i]["exerciseCount"] = (int)$row["pocet"];
    }

    sendJson($workouts, 200);
}

if ($method === "GET" && $action === "detail") {
    $id = 0;
    if (isset($_GET["id"])) {
        $id = (int)$_GET["id"];
    }

    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($id, $userId));
    $workout = $stmt->fetch();

    if (!$workout) {
        sendJson(array("message" => "Trenink nenalezen"), 404);
    }

    $stmt2 = $pdo->prepare("SELECT * FROM exercises WHERE workout_id = ? ORDER BY id ASC");
    $stmt2->execute(array($id));
    $exercises = $stmt2->fetchAll();

    $workout["exercises"] = $exercises;

    sendJson($workout, 200);
}

if ($method === "POST" && $action === "create") {
    $date = "";
    $type = "";
    $note = "";

    if (isset($data["date"])) {
        $date = trim($data["date"]);
    }
    if (isset($data["type"])) {
        $type = trim($data["type"]);
    }
    if (isset($data["note"])) {
        $note = trim($data["note"]);
    }

    if ($date === "" || $type === "") {
        sendJson(array("message" => "Chybi datum nebo typ"), 400);
    }

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
}

if ($method === "POST" && $action === "update") {
    $id = 0;
    if (isset($_GET["id"])) {
        $id = (int)$_GET["id"];
    }

    $date = "";
    $type = "";
    $note = "";

    if (isset($data["date"])) {
        $date = trim($data["date"]);
    }
    if (isset($data["type"])) {
        $type = trim($data["type"]);
    }
    if (isset($data["note"])) {
        $note = trim($data["note"]);
    }

    if ($date === "" || $type === "") {
        sendJson(array("message" => "Chybi datum nebo typ"), 400);
    }

    $stmt = $pdo->prepare("UPDATE workouts SET date = ?, type = ?, note = ? WHERE id = ? AND user_id = ?");
    $stmt->execute(array($date, $type, $note, $id, $userId));

    sendJson(array("message" => "Trenink upraven"), 200);
}

if ($method === "POST" && $action === "delete") {
    $id = 0;
    if (isset($_GET["id"])) {
        $id = (int)$_GET["id"];
    }

    $stmt = $pdo->prepare("DELETE FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($id, $userId));

    sendJson(array("message" => "Trenink smazan"), 200);
}

if ($method === "POST" && $action === "add-exercise") {
    $workoutId = 0;
    if (isset($_GET["workout_id"])) {
        $workoutId = (int)$_GET["workout_id"];
    }

    $stmt = $pdo->prepare("SELECT * FROM workouts WHERE id = ? AND user_id = ?");
    $stmt->execute(array($workoutId, $userId));
    $workout = $stmt->fetch();

    if (!$workout) {
        sendJson(array("message" => "Trenink nenalezen"), 404);
    }

    $name = "";
    $sets = 0;
    $reps = 0;
    $weight = 0;

    if (isset($data["name"])) {
        $name = trim($data["name"]);
    }
    if (isset($data["sets"])) {
        $sets = (int)$data["sets"];
    }
    if (isset($data["reps"])) {
        $reps = (int)$data["reps"];
    }
    if (isset($data["weight"])) {
        $weight = (float)$data["weight"];
    }

    if ($name === "" || $sets <= 0 || $reps <= 0) {
        sendJson(array("message" => "Spatna data cviku"), 400);
    }

    $stmt = $pdo->prepare("INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(array($workoutId, $name, $sets, $reps, $weight));

    sendJson(array("message" => "Cvik pridan"), 201);
}

if ($method === "POST" && $action === "delete-exercise") {
    $exerciseId = 0;
    if (isset($_GET["exercise_id"])) {
        $exerciseId = (int)$_GET["exercise_id"];
    }

    $stmt = $pdo->prepare("
        DELETE e FROM exercises e
        INNER JOIN workouts w ON e.workout_id = w.id
        WHERE e.id = ? AND w.user_id = ?
    ");
    $stmt->execute(array($exerciseId, $userId));

    sendJson(array("message" => "Cvik smazan"), 200);
}

sendJson(array("message" => "Neplatna akce"), 400);