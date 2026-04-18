# Fragebogen-MVP für Netlify Forms

Dieses Paket enthält eine sofort nutzbare MVP-Struktur für:

- `public/forms/copilot/index.html`
- `public/forms/postproduktion/index.html`
- `public/danke/index.html`
- `public/assets/forms.css`
- `public/assets/questionnaire.js`

## Formularnamen

Copilot:
`copilot-integration-v1`

Postproduktion:
`postproduktion-ki-v1`

Beim Copilot-Fragebogen bleibt der bestehende Formularname bewusst erhalten. Die neue Version wird über ein Hidden Field abgebildet:

`form_version = copilot-integration-v2`

Das reduziert das Risiko, dass Netlify ein neues Formular ohne Benachrichtigungskonfiguration erzeugt.

## Netlify-Check nach Deploy

1. Netlify → Forms → prüfen, ob beide Formulare erkannt wurden.
2. Falls nicht: Forms → Enable form detection.
3. Deploys → Trigger deploy → Clear cache and deploy site.
4. Project configuration → Notifications → Form submission notifications.
5. Empfänger direkt: `wolf@hohl.rocks`
6. Nicht über Weiterleitung `fragebogen@hohl.rocks`.

## Test

1. Beide Formulare mit Testdaten absenden.
2. Prüfen:
   - Submission im Netlify Forms Dashboard vorhanden
   - Mail kommt bei `wolf@hohl.rocks` an
   - `chatgpt_summary` ist enthalten
   - `auto_route`, Ampeln, Blocker und nächste Schritte sind enthalten

## Datenschutz

Keine Uploadfelder verwenden. Keine Kundennamen, unveröffentlichten Titel, Drehbuchinhalte, Rohdaten oder personenbezogenen Details eintragen lassen.

## Ergänzungen in dieser MVP-Fassung

- Honeypot-Feld für Netlify-Spamfilter ist in beiden Formularen enthalten.
- Custom Subject ist versioniert im HTML gesetzt.
- Optionale E-Mail-Adresse setzt Netlify Reply-to.
- Pflicht-Checkboxgruppen werden per JavaScript vor dem Submit geprüft.
