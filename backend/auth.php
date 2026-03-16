<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

require_once dirname(__FILE__) . "/db.php";

function makeToken($userId) {
    $data = array(
        "user_id" => (int)$userId,
        "exp" => time() + 60 * 60 * 24
    );

    return base64_encode(json_encode($data));
}

$action = "";
if (isset($_GET["action"])) {
    $action = $_GET["action"];
}

$method = "";
if (isset($_SERVER["REQUEST_METHOD"])) {
    $method = $_SERVER["REQUEST_METHOD"];
}

$data = getData();

if ($method !== "POST") {
    sendJson(array(
        "message" => "Spatna metoda",
        "token" => null,
        "user" => null
    ), 405);
}

if ($action === "register") {
    $username = "";
    $email = "";
    $password = "";

    if (isset($data["username"])) $username = trim($data["username"]);
    if (isset($data["email"])) $email = trim($data["email"]);
    if (isset($data["password"])) $password = trim($data["password"]);

    if ($username === "" || $email === "" || $password === "") {
        sendJson(array(
            "message" => "Vypln vsechna pole",
            "token" => null,
            "user" => null
        ), 400);
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute(array($username, $email));
    $user = $stmt->fetch();

    if ($user) {
        sendJson(array(
            "message" => "Uzivatel uz existuje",
            "token" => null,
            "user" => null
        ), 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute(array($username, $email, $hash));

    $newId = $pdo->lastInsertId();
    $token = makeToken($newId);

    sendJson(array(
        "message" => "Registrace probehla",
        "token" => $token,
        "user" => array(
            "id" => (int)$newId,
            "username" => $username,
            "email" => $email
        )
    ), 201);
}

if ($action === "login") {
    $email = "";
    $password = "";

    if (isset($data["email"])) $email = trim($data["email"]);
    if (isset($data["password"])) $password = trim($data["password"]);

    if ($email === "" || $password === "") {
        sendJson(array(
            "message" => "Vypln email a heslo",
            "token" => null,
            "user" => null
        ), 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute(array($email));
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(array(
            "message" => "Uzivatel neexistuje",
            "token" => null,
            "user" => null
        ), 401);
    }

    if (!password_verify($password, $user["password_hash"])) {
        sendJson(array(
            "message" => "Spatne heslo",
            "token" => null,
            "user" => null
        ), 401);
    }

    $token = makeToken($user["id"]);

    sendJson(array(
        "message" => "Prihlaseni probehlo",
        "token" => $token,
        "user" => array(
            "id" => (int)$user["id"],
            "username" => $user["username"],
            "email" => $user["email"]
        )
    ), 200);
}

sendJson(array(
    "message" => "Neplatna akce",
    "token" => null,
    "user" => null
), 400);