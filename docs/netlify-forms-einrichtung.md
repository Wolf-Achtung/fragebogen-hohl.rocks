# Netlify Forms – Einrichtung

## Benötigte Schritte

1. In Netlify Form Detection aktivieren.
2. Site redeployen.
3. Prüfen, ob unter Forms das Formular `copilot-integration-v1` erscheint.
4. Bestehende Formularbenachrichtigung vom Kontaktformular wiederverwenden:
   - Wenn sie auf „all verified submissions to any form“ steht, ist nichts weiter nötig.
   - Wenn sie nur auf das Kontaktformular beschränkt ist, eine zweite Benachrichtigung für `copilot-integration-v1` anlegen oder auf alle Formulare umstellen.
5. Testeinsendung durchführen.
6. Unter Forms -> Verified submissions prüfen, ob die Einsendung sichtbar ist.
7. Mail-Zustellung an `fragebogen@hohl.rocks` prüfen.

## Wichtig

Netlify sendet Benachrichtigungen standardmäßig von `formresponses@netlify.com`. Das E-Mail-Feld im Formular wird als Reply-to verwendet.
