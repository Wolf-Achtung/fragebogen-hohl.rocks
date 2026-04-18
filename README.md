# Fragebogen-MVP v4 – Auswahlseite + keine Rückfrage-E-Mail-Felder

Diese Fassung setzt die gewünschte Weiche vor die beiden Fragebögen und entfernt die Rückmeldemail-/Rückfragen-E-Mail-Felder aus beiden Formularen.

## Einstieg / Weiche

Die Ausfüllenden sollen zuerst diese Seite öffnen:

```text
https://fragebogen.hohl.rocks/
```

Dort werden beide Wege klar getrennt erklärt:

- **Weg A: Office-KI mit Microsoft Copilot**  
  Ziel: Klären, ob und wie Copilot sinnvoll in Office, Outlook, Teams, Meetings, Textarbeit und Organisation starten kann.  
  Direktlink: `https://fragebogen.hohl.rocks/forms/copilot/`

- **Weg B: Lokale Postproduktions-KI im Büro**  
  Ziel: Klären, welche lokalen KI-Hilfen für Videoanalyse, Timecode-Clips, Transkription, Selects und Social-Cutdowns im Pilot gebraucht werden.  
  Direktlink: `https://fragebogen.hohl.rocks/forms/postproduktion/`

## Enthaltene Struktur

```text
public/index.html
public/forms/copilot/index.html
public/forms/postproduktion/index.html
public/danke/index.html
public/assets/forms.css
public/assets/questionnaire.js
Berlin-Muenchen-Arbeitsweise.md
Versandtext_freundlich.md
```

## Formularnamen

Copilot bleibt stabil:

```text
copilot-integration-v1
form_version = copilot-integration-v2-weiche
```

Postproduktion bleibt stabil:

```text
postproduktion-ki-v1
form_version = postproduktion-ki-v1-weiche
```

## Wichtig

- Keine E-Mail-Felder für Rückfragen mehr in den Formularen.
- Keine Uploadfelder.
- Keine Kundennamen, unveröffentlichten Titel, Drehbuchinhalte, Rohmaterialdaten oder personenbezogenen Details eintragen lassen.
- Benachrichtigung weiterhin direkt an `wolf@hohl.rocks`, nicht über Weiterleitung.

## Netlify-Check nach Deploy

1. Netlify → Forms → prüfen, ob beide Formulare erkannt wurden.
2. Falls nicht: Forms → Enable form detection.
3. Deploys → Trigger deploy → Clear cache and deploy site.
4. Project configuration → Notifications → Form submission notifications.
5. Empfänger direkt: `wolf@hohl.rocks`.

## Test

Je einmal Testsubmission für:

```text
/forms/copilot/
/forms/postproduktion/
```

Prüfen:

- Submission im Netlify Dashboard vorhanden
- Mail kommt bei `wolf@hohl.rocks` an
- `chatgpt_summary` ist enthalten
- `auto_route` ist enthalten
- jeweilige Ampeln sind enthalten
- kein `email`-Feld wird im Formular angezeigt oder übermittelt
