# Fragebogen-MVP v3 – freundlichere Fassung

Dieses Paket enthält die entschärfte, freundlichere Version der zwei KI-Fragebögen.

## Zwei klar getrennte Wege

- **Weg A: Office-KI mit Microsoft Copilot**  
  Für E-Mail, Teams, Meetings, Texte, Präsentationen, Briefings, Suche und Organisation.

- **Weg B: Lokale Postproduktions-KI im Büro**  
  Für Videoanalyse, Timecode-Clips, Transkription, Selects, Quote-Findung, Social-Cutdowns und lokale Tests.

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
form_version = copilot-integration-v2-soft
```

Postproduktion:

```text
postproduktion-ki-v1
```

## Netlify-Check nach Deploy

1. Netlify → Forms → prüfen, ob beide Formulare erkannt wurden.
2. Falls nicht: Forms → Enable form detection.
3. Deploys → Trigger deploy → Clear cache and deploy site.
4. Project configuration → Notifications → Form submission notifications.
5. Empfänger direkt: `wolf@hohl.rocks`.
6. Nicht über die Weiterleitung `fragebogen@hohl.rocks`.

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
- `auto_to_clarify`, `auto_unknowns`, `auto_next_steps` sind enthalten

## Stiländerung in v3

- wärmere Optik
- weichere Zwischenbewertung
- keine harte Audit-Sprache
- klare Trennung in Weg A und Weg B
- weniger Alarmton bei Sicherheitsthemen
- weiterhin keine Uploadfelder und keine vertraulichen Inhalte im Formular
