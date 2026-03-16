<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

require_once dirname(__FILE__) . "/db.php";
require_once dirname(__FILE__) . "/config.php";

function getTokenData($secret_key) {
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
    $parts = explode(".", $token);

    if (count($parts) !== 2) {
        return null;
    }

    $base = $parts[0];
    $hash = $parts[1];

    $checkHash = hash_hmac("sha256", $base, $secret_key);

    if ($checkHash !== $hash) {
        return null;
    }

    $data = json_decode(base64_decode($base), true);

    if (!$data) {
        return null;
    }

    if (!isset($data["exp"]) || $data["exp"] < time()) {
        return null;
    }

    return $data;
}

$userData = getTokenData($secret_key);

if (!$userData) {
    sendJson(array("message" => "Neplatny token"), 401);
}

$userId = (int)$userData["user_id"];

$stmt = $pdo->prepare("
    SELECT COUNT(*) as pocet
    FROM workouts
    WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
");
$stmt->execute(array($userId));
$row1 = $stmt->fetch();
$workoutsThisWeek = (int)$row1["pocet"];

$stmt = $pdo->prepare("
    SELECT COUNT(*) as pocet
    FROM workouts
    WHERE user_id = ?
");
$stmt->execute(array($userId));
$row2 = $stmt->fetch();
$totalWorkouts = (int)$row2["pocet"];

$stmt = $pdo->prepare("
    SELECT COUNT(*) as pocet
    FROM workouts
    WHERE user_id = ?
    AND MONTH(date) = MONTH(CURDATE())
    AND YEAR(date) = YEAR(CURDATE())
");
$stmt->execute(array($userId));
$row3 = $stmt->fetch();
$workoutsThisMonth = (int)$row3["pocet"];

$stmt = $pdo->prepare("
    SELECT e.name, COUNT(*) as pocet
    FROM exercises e
    INNER JOIN workouts w ON e.workout_id = w.id
    WHERE w.user_id = ?
    GROUP BY e.name
    ORDER BY pocet DESC
    LIMIT 1
");
$stmt->execute(array($userId));
$row4 = $stmt->fetch();

$mostFrequentExercise = "-";
if ($row4) {
    $mostFrequentExercise = $row4["name"];
}

sendJson(array(
    "workoutsThisWeek" => $workoutsThisWeek,
    "totalWorkouts" => $totalWorkouts,
    "workoutsThisMonth" => $workoutsThisMonth,
    "mostFrequentExercise" => $mostFrequentExercise
), 200);