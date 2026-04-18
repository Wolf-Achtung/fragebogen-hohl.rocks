# Mail- und DNS-Checkliste für fragebogen@hohl.rocks

## Muss vor Livegang geprüft werden

1. Existiert die Mailbox `fragebogen@hohl.rocks`?
2. Sind SMTP-Server, Port, Verschlüsselung und Passwort bekannt?
3. Darf der Webserver per SMTP über diese Mailbox senden?
4. Ist HTTPS für `fragebogen.hohl.rocks` aktiv?
5. Gibt es SPF für `hohl.rocks`?
6. Gibt es DKIM für `hohl.rocks`?
7. Gibt es DMARC für `_dmarc.hohl.rocks`?
8. Werden Mails an externe Adressen zugestellt oder landen sie im Spam?
9. Ist die Subdomain nicht öffentlich indexierbar?
10. Gibt es einen kurzen Datenschutzhinweis auf der Seite?

## Empfehlung für die ersten Tests

- Test 1: Absenden an `fragebogen@hohl.rocks`.
- Test 2: Absenden mit Kopie an eine externe Adresse.
- Test 3: Antwort auf die empfangene Mail prüfen – Reply-To sollte auf den Antwortgeber zeigen.
- Test 4: Mail-Header prüfen: SPF, DKIM, DMARC sollten bestehen.
- Test 5: Formular ohne Einwilligung absenden – muss blockieren.
- Test 6: Honeypot füllen – muss blockieren.
