# Netlify Forms 404 Fix

Dieses Paket behebt den HTTP-404 beim Testmail-Button.

Änderungen:
- Kein AJAX-POST mehr auf `/`.
- Der Button nutzt jetzt eine normale HTML-Formularübermittlung an `/danke/`.
- `public/index.html` enthält zusätzlich ein verstecktes Netlify-Detection-Formular für `copilot-integration-v1`.

Einbau:
1. `public/forms/copilot/index.html` ersetzen.
2. `public/index.html` übernehmen oder mit vorhandenem Startseiten-Code zusammenführen.
3. `public/danke/index.html` übernehmen.
4. Deploy auslösen.
5. In Netlify: Forms → Active forms prüfen.
6. `copilot-integration-v1` muss dort erscheinen.
7. Notification an `fragebogen@hohl.rocks` setzen.
8. Testmail senden.

Wenn weiterhin 404 kommt:
- Netlify → Forms → Enable form detection aktivieren.
- Danach „Clear cache and deploy site“ ausführen.
