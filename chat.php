<?php
// chat.php — ultra-simple JSON-file chat API
// Endpoints:
//   GET  /chat.php[?since=TIMESTAMP]   -> returns array of messages [{name,text,ts}...]
//   POST /chat.php {name, text}        -> appends a message

// ====== CONFIG ======
$file = __DIR__ . '/chat_messages.json'; // writable by PHP
$max_messages = 500;                     // keep last N messages
$allow_origin = '*';                     // tighten to want: 'https://your-site.tld'
// ====================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $allow_origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function load_messages($file) {
  if (!file_exists($file)) return [];
  $raw = file_get_contents($file);
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function atomically_save($file, $msgs) {
  $tmp = $file . '.tmp';
  $fp = fopen($tmp, 'wb');
  if (!$fp) throw new Exception('Cannot write tmp file');
  fwrite($fp, json_encode($msgs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  fclose($fp);
  rename($tmp, $file);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $since = isset($_GET['since']) ? (int)$_GET['since'] : 0;
  $msgs = load_messages($file);
  if ($since > 0) {
    $msgs = array_values(array_filter($msgs, function($m) use($since) {
      return isset($m['ts']) && $m['ts'] > $since;
    }));
  }
  echo json_encode($msgs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = json_decode(file_get_contents('php://input'), true);
  $name = trim((string)($body['name'] ?? 'anon'));
  $text = trim((string)($body['text'] ?? ''));

  if ($text === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Empty message']);
    exit;
  }
  // sanitize/limit
  $name = mb_substr($name, 0, 40);
  $text = mb_substr($text, 0, 2000);
  if ($name === '') $name = 'anon';

  // file lock to avoid races
  $fp = fopen($file, 'c+');
  if ($fp) {
    if (flock($fp, LOCK_EX)) {
      $raw = stream_get_contents($fp);
      $msgs = json_decode($raw ?: '[]', true);
      if (!is_array($msgs)) $msgs = [];
      $msgs[] = ['name' => $name, 'text' => $text, 'ts' => (int)round(microtime(true) * 1000)];
      if (count($msgs) > $max_messages) $msgs = array_slice($msgs, -$max_messages);
      ftruncate($fp, 0);
      rewind($fp);
      fwrite($fp, json_encode($msgs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
      fflush($fp);
      flock($fp, LOCK_UN);
    } else {
      // fallback (rare)
      $msgs = load_messages($file);
      $msgs[] = ['name' => $name, 'text' => $text, 'ts' => (int)round(microtime(true) * 1000)];
      if (count($msgs) > $max_messages) $msgs = array_slice($msgs, -$max_messages);
      atomically_save($file, $msgs);
    }
    fclose($fp);
  } else {
    // fallback if open fails
    $msgs = load_messages($file);
    $msgs[] = ['name' => $name, 'text' => $text, 'ts' => (int)round(microtime(true) * 1000)];
    if (count($msgs) > $max_messages) $msgs = array_slice($msgs, -$max_messages);
    atomically_save($file, $msgs);
  }

  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
