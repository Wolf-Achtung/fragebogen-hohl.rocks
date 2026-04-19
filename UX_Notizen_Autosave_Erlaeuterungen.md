# UX-Notizen: Autosave, Freitext, Erläuterungen

## Automatisches Speichern

Der Zwischenstand wird lokal im Browser gespeichert. Dadurch können Ausfüllende später auf demselben Gerät und im selben Browser fortfahren.

Vorteile:
- kein Account nötig
- kein Server-Speichern unfertiger Antworten
- sofort nutzbar auf statischer Netlify-Seite

Grenzen:
- funktioniert nicht geräteübergreifend
- Browserdaten-Löschung entfernt den Entwurf
- private/incognito Fenster speichern unter Umständen nicht dauerhaft

## Freitextfelder

Zu den Fragen werden optionale Felder „Weitere Angaben oder Besonderheiten“ angeboten. Sie sind bewusst eingeklappt, damit das Formular nicht länger wirkt.

Alle Einträge werden zusätzlich gesammelt in:
- `individual_notes`
- `chatgpt_summary`

## Erläuterungen

Zu den Fragen wird eingeklappt „Warum fragen wir das?“ angeboten. Die Erläuterungen sind kurz und nutzen Kategorien statt lange technische Hilfetexte.

## Empfehlung

Für die ersten 2–3 Personen ist diese Lösung pragmatisch: Sie bleibt schnell, gibt aber Raum für Sonderfälle.
