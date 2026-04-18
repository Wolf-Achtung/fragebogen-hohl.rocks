# Mail-Checkliste für fragebogen@hohl.rocks

## Benötigte Angaben

- SMTP_HOST
- SMTP_PORT, meistens 587/TLS oder 465/SSL
- SMTP_USER = fragebogen@hohl.rocks
- SMTP_PASS
- MAIL_TO = fragebogen@hohl.rocks
- MAIL_FROM = fragebogen@hohl.rocks

## Zustellbarkeit

Für sauberen Versand sollten SPF, DKIM und DMARC für `hohl.rocks` korrekt gesetzt sein.

## Funktionstest

1. Netlify Environment Variables setzen.
2. Deploy auslösen.
3. Fragebogen absenden.
4. Eingang bei `fragebogen@hohl.rocks` prüfen.
5. Spam-Ordner prüfen.
6. Mail-Header auf SPF/DKIM/DMARC prüfen.
7. Bei Fehlern Netlify Function Logs öffnen.

## Keine Secrets im Code

SMTP-Passwörter gehören nur in Netlify Environment Variables und niemals in das Repository oder in Chat-Verläufe.
