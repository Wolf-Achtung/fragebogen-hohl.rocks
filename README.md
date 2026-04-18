# Hohl Fragebogen-Portal für Netlify

Ziel: `fragebogen.hohl.rocks` als zentrale, erweiterbare Sammelstelle für interaktive Fragebögen.

Dieses Paket ist die Netlify-Variante. Das frühere PHP-Backend wird hier durch eine Netlify Function ersetzt, weil Netlify kein klassischer PHP-Webspace ist.

## Enthalten

- `public/index.html` – Startseite
- `public/forms/copilot/index.html` – Copilot-Integrationsfragebogen
- `public/_headers` – Basissicherheitsheader
- `netlify/functions/submit.js` – Serverless Function für SMTP-Mailversand
- `netlify.toml` – Netlify-Konfiguration und API-Redirects
- `package.json` – Node-Abhängigkeiten, insbesondere Nodemailer
- `.env.example` – Vorlage für Netlify Environment Variables

## Wichtige Netlify-Einstellungen

### 1. Custom Domain

In Netlify beim Site-Projekt `fragebogen.hohl.rocks` als Custom Domain hinzufügen.

Beim DNS-Provider von `hohl.rocks` die Subdomain `fragebogen` als CNAME auf die Netlify-Site setzen, z. B.:

```txt
fragebogen.hohl.rocks  CNAME  chipper-granita-97957b.netlify.app
```

Der genaue Netlify-Name ist im Netlify-Projekt sichtbar. Keine DNS-Weiterleitung und kein Webspace-Standardziel verwenden.

### 2. HTTPS

Nach korrekter DNS-Konfiguration in Netlify unter Domain management > HTTPS das Netlify-managed certificate provisionieren oder erneuern lassen.

Die Seite erst produktiv nutzen, wenn `https://fragebogen.hohl.rocks` ohne Zertifikatswarnung erreichbar ist.

### 3. Environment Variables

In Netlify unter Site configuration > Environment variables diese Werte eintragen. Scope: mindestens Functions.

```txt
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=fragebogen@hohl.rocks
SMTP_PASS=***
MAIL_TO=fragebogen@hohl.rocks
MAIL_FROM=fragebogen@hohl.rocks
MAIL_FROM_NAME=Hohl Fragebogen
ALLOWED_ORIGINS=https://fragebogen.hohl.rocks,http://localhost:8888
ALLOWED_FORM_IDS=copilot-integration-v1
SEND_COPY_ENABLED=true
```

## Deployment

Empfohlen: GitHub-Repo mit Netlify verbinden. Alternativ Netlify CLI verwenden.

### GitHub-Variante

1. Paket in ein GitHub-Repository legen.
2. Netlify-Projekt mit dem Repository verbinden.
3. Build command: `npm run build`
4. Publish directory: `public`
5. Functions directory: `netlify/functions`
6. Environment Variables setzen.
7. Deploy auslösen.

### Netlify CLI

```bash
npm install
npx netlify login
npx netlify link
npx netlify deploy --prod
```

## Test

1. `https://fragebogen.hohl.rocks/forms/copilot/` öffnen.
2. Pflichtfelder ausfüllen.
3. Einwilligung aktivieren.
4. Antworten absenden.
5. Eingang bei `fragebogen@hohl.rocks` prüfen.
6. In Netlify unter Functions die Logs kontrollieren.

## Weitere Fragebögen hinzufügen

1. Neues Verzeichnis unter `public/forms/` anlegen, z. B. `public/forms/postproduktion/`.
2. HTML-Datei dort ablegen.
3. Im HTML eindeutige `FORM_ID` setzen.
4. `ALLOWED_FORM_IDS` in Netlify um diese ID erweitern.
5. Startseite `public/index.html` ergänzen.

Der gemeinsame Endpunkt bleibt `/api/submit`.

## Datenschutz/Betrieb

- Keine dauerhafte Speicherung auf Netlify vorgesehen.
- Einsendungen werden per SMTP an `fragebogen@hohl.rocks` gesendet.
- SMTP-Passwörter nur als Netlify Environment Variables speichern, nie im Repository.
- Keine Passwörter, Tokens oder Geschäftsgeheimnisse im Fragebogen abfragen.
- HTTPS vor produktiver Nutzung erzwingen.
