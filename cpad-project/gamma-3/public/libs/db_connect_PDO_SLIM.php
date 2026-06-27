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

// Get database URL: prioritize system env (Render Dashboard) over .env file.
$dbUrl = getenv('DATABASE_URL') ?: ($_ENV['DATABASE_URL'] ?? '');

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

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
} catch (PDOException $e) {
    // Log the real error so it shows up in Render logs.
    error_log('[DB CONNECTION ERROR] ' . $e->getMessage());
    error_log('[DB CONNECTION INFO] host=' . $host . ' port=' . $port . ' db=' . $database . ' user=' . $username);
    error_log('[DB CONNECTION INFO] DATABASE_URL from env: ' . (empty($dbUrl) ? '(NOT SET)' : '(SET, length=' . strlen($dbUrl) . ')'));

    // Return a JSON error response instead of letting Apache show a 404.
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed. Check server logs for details.'
    ]);
    exit;
}
?>
