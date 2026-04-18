# Hohl Fragebogen – Netlify Forms Version

Diese Version nutzt ausschließlich Netlify Forms. Kein PHP, keine SMTP-Secrets, keine Netlify Functions.

## Deployment

1. Inhalt dieses Ordners in das Netlify-Projekt hochladen oder per Git verbinden.
2. Publish directory: `public`.
3. Nach dem Deploy in Netlify prüfen: Forms -> Active forms.
4. Der Formularname lautet: `copilot-integration-v1`.
5. Unter Project configuration -> Notifications -> Emails and webhooks -> Form submission notifications die bestehende Benachrichtigung verwenden:
   - entweder für alle verifizierten Formulare,
   - oder zusätzlich für `copilot-integration-v1`.

## Subdomain

Die Subdomain `fragebogen.hohl.rocks` muss im Netlify-Projekt als Custom Domain hinterlegt sein. Erst danach kann Netlify ein passendes HTTPS-Zertifikat bereitstellen.

## Datenschutz

Der Fragebogen sendet alle Antworten als Netlify-Form-Submission. Es werden ein Markdown-Export und ein JSON-Export als Felder mitgesendet. Die Einsendungen sind zusätzlich im Netlify-Forms-Dashboard sichtbar.

## Weitere Fragebögen

Neue Fragebögen können unter `public/forms/<name>/index.html` ergänzt werden. Jeder Fragebogen braucht einen eigenen Form-Namen.
