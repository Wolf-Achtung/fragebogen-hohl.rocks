<?php
declare(strict_types=1);

/*
 * Konfiguration für fragebogen.hohl.rocks
 * Diese Datei nach dem Upload als api/config.php ablegen und die SMTP-Daten eintragen.
 * config.php niemals öffentlich verlinken oder in Repositories mit Passwörtern hochladen.
 */

define('ALLOWED_ORIGIN', 'https://fragebogen.hohl.rocks');
define('MAX_PAYLOAD_BYTES', 1024 * 1024);
define('RATE_LIMIT_PER_10_MIN', 8);

// Empfänger und Absender
define('MAIL_TO', 'fragebogen@hohl.rocks');
define('MAIL_FROM', 'fragebogen@hohl.rocks');
define('MAIL_FROM_NAME', 'Hohl Fragebogen');

// Empfehlung: smtp. Fallback: phpmail.
define('MAIL_TRANSPORT', 'smtp');

// SMTP-Daten der Mailbox fragebogen@hohl.rocks oder eines autorisierten Mail-Relays.
define('SMTP_HOST', 'BITTE_EINTRAGEN');     // z. B. smtp.example-hoster.de
define('SMTP_PORT', 587);                   // meist 587 mit STARTTLS oder 465 mit SSL
define('SMTP_SECURE', 'tls');               // tls, ssl oder none
define('SMTP_USER', 'fragebogen@hohl.rocks');
define('SMTP_PASS', 'BITTE_EINTRAGEN');

// Standard: keine dauerhafte Speicherung auf dem Webserver. Bei true werden Kopien in api/submissions/ abgelegt.
define('SAVE_SUBMISSIONS', false);

// Mehrere Fragebögen können hier ergänzt und separat geroutet werden.
define('FORMS', [
    'copilot-integration-v1' => [
        'title' => 'Copilot-Integrationsfragebogen',
        'recipient' => 'fragebogen@hohl.rocks',
    ],
    // Beispiel für spätere Erweiterung:
    // 'postproduktion-ki-v1' => [
    //     'title' => 'Lokale Postproduktions-KI',
    //     'recipient' => 'fragebogen@hohl.rocks',
    // ],
]);
