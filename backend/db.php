<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

require_once dirname(__FILE__) . "/config.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=" . $host . ";dbname=" . $dbname . ";charset=utf8mb4",
        $dbuser,
        $dbpass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header("Content-Type: application/json; charset=utf-8");
    http_response_code(500);
    echo json_encode(array(
        "message" => "Chyba databaze",
        "error" => $e->getMessage()
    ));
    exit;
}

function getData() {
    $text = file_get_contents("php://input");
    $data = json_decode($text, true);

    if (!is_array($data)) {
        $data = array();
    }

    return $data;
}

function sendJson($data, $code) {
    header("Content-Type: application/json; charset=utf-8");
    http_response_code($code);
    echo json_encode($data);
    exit;
}