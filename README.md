# Hohl Fragebogen-Webpaket

Ziel: `fragebogen.hohl.rocks` als geschützte Sammelstelle für interaktive Fragebögen.

## Enthalten

- `index.html` – Startseite mit Link zum Copilot-Fragebogen
- `forms/copilot/index.html` – interaktiver Copilot-Integrationsfragebogen
- `api/submit.php` – Backend für Einsendungen
- `api/config.example.php` – Mail- und Formular-Konfiguration
- `api/config.php` – Arbeitskopie, vor Upload mit SMTP-Daten füllen
- `.htaccess` und `robots.txt` – Basisschutz

## Deployment

1. Webspace der Subdomain `fragebogen.hohl.rocks` öffnen.
2. Inhalt dieses Pakets in das Document Root der Subdomain hochladen.
3. `api/config.php` bearbeiten:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
4. Sicherstellen, dass die Mailbox `fragebogen@hohl.rocks` existiert.
5. `https://fragebogen.hohl.rocks/forms/copilot/` öffnen.
6. Testeinsendung machen.
7. Wenn Versand fehlschlägt:
   - SMTP-Daten prüfen
   - Port 587/465 prüfen
   - SPF/DKIM/DMARC prüfen
   - alternativ `MAIL_TRANSPORT` kurz auf `phpmail` stellen, falls der Hoster lokalen Mailversand sauber signiert.

## Mail-Empfehlung

Empfohlen ist SMTP über `fragebogen@hohl.rocks`, nicht unkonfiguriertes PHP `mail()`.

Für gute Zustellbarkeit prüfen:

- MX-Records für `hohl.rocks`
- SPF: der sendende Webserver oder das SMTP-Relay muss autorisiert sein
- DKIM: idealerweise für `hohl.rocks` aktiv
- DMARC: mindestens `p=none` zum Start, später schrittweise `quarantine`/`reject`
- Absender: `fragebogen@hohl.rocks`
- Reply-To: optionale E-Mail des Antwortgebers

## Weitere Fragebögen hinzufügen

1. Neues Verzeichnis anlegen, z. B. `forms/postproduktion/`.
2. Neue HTML-Datei dort ablegen.
3. Im HTML setzen:
   - `FORM_ID = "postproduktion-ki-v1"`
   - `FORM_TITLE = "Lokale Postproduktions-KI"`
4. In `api/config.php` unter `FORMS` ergänzen:
   ```php
   'postproduktion-ki-v1' => [
       'title' => 'Lokale Postproduktions-KI',
       'recipient' => 'fragebogen@hohl.rocks',
   ],
   ```
5. Landingpage `index.html` um den neuen Link erweitern.

## Datenschutz / Betrieb

- Es werden keine Passwörter oder Tokens abgefragt.
- Standardmäßig werden Einsendungen nicht auf dem Server gespeichert.
- Die Übermittlung läuft per HTTPS an `/api/submit.php`.
- Der Fragebogen enthält einen Honeypot und einfaches Rate Limiting.
- Für einen nicht öffentlichen Einsatz zusätzlich Subdomain per Hosting-Panel oder `.htpasswd` schützen.

## Passwortschutz

Bei klassischem Apache-Webhosting kann ein Verzeichnisschutz im Kundenmenü des Hosters gesetzt werden. Das ist besser als eine einfache JavaScript-Passwortabfrage.

