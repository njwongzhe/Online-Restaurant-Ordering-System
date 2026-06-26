<?php
// Load .env from gamma-3 root (two levels up from public/libs/).
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if (strpos($line, '#') !== 0 && strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim(trim($val), '"\'');
            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }
}

// Get database URL or fallback to local connection.
$dbUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');

if ($dbUrl && strpos($dbUrl, 'mysql://') === 0) {
    $url = parse_url($dbUrl);
    $host = $url['host'] ?? 'localhost';
    $port = $url['port'] ?? 3306;
    $username = $url['user'] ?? '';
    $password = $url['pass'] ?? '';
    $database = ltrim($url['path'] ?? '', '/');
} else {
    // Local DB Connection fallback.
    $host = 'localhost';
    $port = 3306;
    $username = 'cpad';
    $password = 'cpadPassword';
    $database = 'cpad_03_gamma';
}

$pdo = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4", $username, $password);
?>
