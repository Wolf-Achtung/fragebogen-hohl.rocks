<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function cfg(string $name, $default = null) {
    return defined($name) ? constant($name) : $default;
}

function clean_header(string $value): string {
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function sanitize_text($value) {
    if (is_array($value)) return array_map('sanitize_text', $value);
    if (is_object($value)) return sanitize_text((array)$value);
    if (!is_string($value)) return $value;
    $value = str_replace("\0", '', $value);
    return mb_substr($value, 0, 20000);
}

function smtp_read($fp): string {
    $data = '';
    while (($line = fgets($fp, 515)) !== false) {
        $data .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') break;
    }
    return $data;
}

function smtp_cmd($fp, string $cmd, array $expect): string {
    fwrite($fp, $cmd . "\r\n");
    $reply = smtp_read($fp);
    $code = (int)substr($reply, 0, 3);
    if (!in_array($code, $expect, true)) {
        throw new RuntimeException("SMTP-Fehler nach {$cmd}: {$reply}");
    }
    return $reply;
}

function smtp_send_mail(string $to, string $subject, string $textBody, string $from, string $fromName, string $replyTo = ''): void {
    $host = cfg('SMTP_HOST', '');
    $port = (int)cfg('SMTP_PORT', 587);
    $secure = cfg('SMTP_SECURE', 'tls'); // tls=starttls, ssl=implicit TLS, none=plain
    $user = cfg('SMTP_USER', '');
    $pass = cfg('SMTP_PASS', '');

    if (!$host || !$user || !$pass) {
        throw new RuntimeException('SMTP ist ausgewählt, aber Host/User/Pass fehlen in config.php.');
    }

    $remote = ($secure === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
    $fp = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
    if (!$fp) throw new RuntimeException("SMTP-Verbindung fehlgeschlagen: {$errstr} ({$errno})");
    stream_set_timeout($fp, 20);

    $greeting = smtp_read($fp);
    if ((int)substr($greeting, 0, 3) !== 220) throw new RuntimeException("SMTP-Greeting ungültig: {$greeting}");

    smtp_cmd($fp, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
    if ($secure === 'tls') {
        smtp_cmd($fp, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('STARTTLS konnte nicht aktiviert werden.');
        }
        smtp_cmd($fp, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
    }

    smtp_cmd($fp, 'AUTH LOGIN', [334]);
    smtp_cmd($fp, base64_encode($user), [334]);
    smtp_cmd($fp, base64_encode($pass), [235]);

    smtp_cmd($fp, 'MAIL FROM:<' . clean_header($from) . '>', [250]);
    foreach (array_map('trim', explode(',', $to)) as $recipient) {
        if ($recipient !== '') smtp_cmd($fp, 'RCPT TO:<' . clean_header($recipient) . '>', [250, 251]);
    }
    smtp_cmd($fp, 'DATA', [354]);

    $headers = [];
    $headers[] = 'From: ' . clean_header($fromName) . ' <' . clean_header($from) . '>';
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . clean_header($replyTo);
    }
    $headers[] = 'To: ' . clean_header($to);
    $headers[] = 'Subject: ' . mb_encode_mimeheader($subject, 'UTF-8');
    $headers[] = 'Date: ' . date(DATE_RFC2822);
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';

    $message = implode("\r\n", $headers) . "\r\n\r\n" . $textBody;
    $message = preg_replace("/\r\n\.\r\n/", "\r\n..\r\n", $message);
    fwrite($fp, $message . "\r\n.\r\n");
    $reply = smtp_read($fp);
    if ((int)substr($reply, 0, 3) !== 250) throw new RuntimeException("SMTP DATA fehlgeschlagen: {$reply}");

    @smtp_cmd($fp, 'QUIT', [221]);
    fclose($fp);
}

function php_mail_send(string $to, string $subject, string $textBody, string $from, string $fromName, string $replyTo = ''): void {
    $headers = [];
    $headers[] = 'From: ' . clean_header($fromName) . ' <' . clean_header($from) . '>';
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . clean_header($replyTo);
    }
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    $ok = @mail($to, $subject, $textBody, implode("\r\n", $headers), '-f' . clean_header($from));
    if (!$ok) throw new RuntimeException('PHP mail() konnte die Nachricht nicht übergeben.');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Nur POST erlaubt.']);
}

$allowedOrigin = cfg('ALLOWED_ORIGIN', '');
if ($allowedOrigin && isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] !== $allowedOrigin) {
    respond(403, ['ok' => false, 'message' => 'Origin nicht erlaubt.']);
}

$maxBytes = (int)cfg('MAX_PAYLOAD_BYTES', 1024 * 1024);
if (isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > $maxBytes) {
    respond(413, ['ok' => false, 'message' => 'Payload zu groß.']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateKey = sys_get_temp_dir() . '/hohl_fragebogen_rate_' . sha1($ip);
$now = time();
$rate = ['time' => $now, 'count' => 0];
if (is_file($rateKey)) {
    $existing = json_decode((string)file_get_contents($rateKey), true);
    if (is_array($existing)) $rate = $existing;
}
if ($now - (int)$rate['time'] > 600) $rate = ['time' => $now, 'count' => 0];
$rate['count'] = (int)$rate['count'] + 1;
file_put_contents($rateKey, json_encode($rate), LOCK_EX);
if ($rate['count'] > (int)cfg('RATE_LIMIT_PER_10_MIN', 8)) {
    respond(429, ['ok' => false, 'message' => 'Zu viele Einsendungen. Bitte später erneut versuchen.']);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    respond(400, ['ok' => false, 'message' => 'Ungültiges JSON.']);
}

if (!empty($payload['honeypot'])) {
    respond(400, ['ok' => false, 'message' => 'Ungültige Einsendung.']);
}

if (empty($payload['consent'])) {
    respond(400, ['ok' => false, 'message' => 'Einwilligung fehlt.']);
}

$formId = sanitize_text($payload['formId'] ?? '');
$forms = cfg('FORMS', []);
if (!$formId || !isset($forms[$formId])) {
    respond(400, ['ok' => false, 'message' => 'Unbekannter Fragebogen.']);
}

$organization = sanitize_text($payload['organization'] ?? '');
$respondentName = sanitize_text($payload['respondentName'] ?? '');
$respondentEmail = sanitize_text($payload['respondentEmail'] ?? '');
$markdown = sanitize_text($payload['markdown'] ?? '');
$data = sanitize_text($payload['data'] ?? []);
$submittedAt = sanitize_text($payload['submittedAt'] ?? date(DATE_ATOM));
$sourceUrl = sanitize_text($payload['sourceUrl'] ?? '');

if (!$markdown || strlen($markdown) < 50) {
    respond(400, ['ok' => false, 'message' => 'Antwortdaten fehlen.']);
}

$ref = strtoupper(substr(hash('sha256', $formId . $submittedAt . $organization . random_bytes(8)), 0, 10));
$formTitle = $forms[$formId]['title'] ?? 'Fragebogen';
$recipient = $forms[$formId]['recipient'] ?? cfg('MAIL_TO', '');
if (!$recipient || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    respond(500, ['ok' => false, 'message' => 'Empfängeradresse ist nicht korrekt konfiguriert.']);
}

$subjectOrg = $organization ? ' – ' . mb_substr((string)$organization, 0, 80) : '';
$subject = '[' . $formTitle . '] Einsendung' . $subjectOrg . ' #' . $ref;

$jsonPretty = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

$body = "Neue Fragebogen-Einsendung\n";
$body .= "Referenz: {$ref}\n";
$body .= "Formular: {$formTitle} ({$formId})\n";
$body .= "Organisation: " . ($organization ?: '—') . "\n";
$body .= "Ansprechpartner: " . ($respondentName ?: '—') . "\n";
$body .= "E-Mail Antwortgeber: " . ($respondentEmail ?: '—') . "\n";
$body .= "Quelle: " . ($sourceUrl ?: '—') . "\n";
$body .= "Zeitpunkt: {$submittedAt}\n\n";
$body .= "==================== MARKDOWN ====================\n\n";
$body .= $markdown . "\n\n";
$body .= "==================== JSON ====================\n\n";
$body .= $jsonPretty ?: '{}';

if (cfg('SAVE_SUBMISSIONS', false)) {
    $dir = __DIR__ . '/submissions';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    @file_put_contents($dir . '/' . date('Ymd_His') . '_' . $ref . '.json', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
}

try {
    $from = cfg('MAIL_FROM', 'fragebogen@hohl.rocks');
    $fromName = cfg('MAIL_FROM_NAME', 'Hohl Fragebogen');
    if (cfg('MAIL_TRANSPORT', 'smtp') === 'smtp') {
        smtp_send_mail($recipient, $subject, $body, $from, $fromName, $respondentEmail);
        if (!empty($payload['sendCopy']) && $respondentEmail && filter_var($respondentEmail, FILTER_VALIDATE_EMAIL)) {
            smtp_send_mail($respondentEmail, 'Kopie: ' . $subject, $body, $from, $fromName, $recipient);
        }
    } else {
        php_mail_send($recipient, $subject, $body, $from, $fromName, $respondentEmail);
        if (!empty($payload['sendCopy']) && $respondentEmail && filter_var($respondentEmail, FILTER_VALIDATE_EMAIL)) {
            php_mail_send($respondentEmail, 'Kopie: ' . $subject, $body, $from, $fromName, $recipient);
        }
    }
} catch (Throwable $e) {
    respond(500, ['ok' => false, 'message' => 'Mailversand fehlgeschlagen: ' . $e->getMessage()]);
}

respond(200, ['ok' => true, 'reference' => $ref]);
