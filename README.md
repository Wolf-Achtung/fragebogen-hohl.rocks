# Fragebogen-MVP v6 – Projektübersicht + zwei gleichberechtigte Teilprojekte

Dieses Paket enthält eine freundliche Startseite und zwei gleichberechtigte Fragebögen:

- **Teilprojekt Office-KI mit Microsoft Copilot**  
  Pfad: `/forms/copilot/`  
  Formularname: `copilot-integration-v1`

- **Teilprojekt Lokale Postproduktions-KI im Büro**  
  Pfad: `/forms/postproduktion/`  
  Formularname: `postproduktion-ki-v1`

Die Startseite unter `/` ist keine Wahl im Sinne von Entweder-oder. Beide Teilprojekte sind vorgesehen. Die Seite dient nur als klare Orientierung und als Einstieg zu den beiden Fragebögen.

## Struktur

```text
public/index.html
public/forms/copilot/index.html
public/forms/postproduktion/index.html
public/danke/index.html
public/assets/forms.css
public/assets/questionnaire.js
README.md
Muenchen-Remote-Runbook.md
Berlin-Muenchen-Arbeitsweise.md
Versandtext_freundlich.md
```

## Netlify Forms

Die Formularnamen bleiben stabil:

```text
copilot-integration-v1
postproduktion-ki-v1
```

Beim Copilot-Fragebogen wird die inhaltliche Version über ein Hidden Field geführt:

```text
form_version = copilot-integration-v2-lokalabgrenzung
```

## Nach dem Deploy prüfen

1. Netlify → Forms → prüfen, ob beide Formulare erkannt wurden.
2. Falls nötig: Forms → Enable form detection.
3. Deploys → Trigger deploy → Clear cache and deploy site.
4. Project configuration → Notifications → Form submission notifications.
5. Empfänger direkt: `wolf@hohl.rocks`.

## Test

1. Startseite öffnen: `/`
2. Office-Fragebogen testweise absenden.
3. Postproduktions-Fragebogen testweise absenden.
4. Prüfen:
   - Submission im Netlify Forms Dashboard vorhanden
   - Mail kommt bei `wolf@hohl.rocks` an
   - `chatgpt_summary` ist enthalten
   - `auto_route` und Ampeln sind enthalten
   - offene Punkte und nächste Schritte sind enthalten

## Inhaltliche Ergänzung

Der Postproduktions-Fragebogen berücksichtigt zusätzlich die mögliche Nutzung als lokaler KI-Server im internen Büro-Netz, zum Beispiel mit lokaler Oberfläche, LM-Studio-/Server-Idee, Open-WebUI-/AnythingLLM-ähnlichen Oberflächen oder lokaler Wissensdatenbank. Die konkrete Tool- und Modellwahl soll später aus den Antworten abgeleitet werden.


## v7-Ergänzungen

Diese Fassung ergänzt:

- automatisches Zwischenspeichern im Browser per `localStorage`
- Wiederherstellung des Zwischenstands beim erneuten Öffnen derselben Formularseite
- Button „Zwischenstand löschen“
- aufklappbare Erläuterung „Warum fragen wir das?“ an den Fragen
- optionale Freitextfelder „Weitere Angaben oder Besonderheiten“ an den Fragen
- Aggregation aller individuellen Hinweise in das statische Hidden Field `individual_notes`
- Aufnahme dieser Hinweise in `chatgpt_summary`

Hinweis zur Netlify-Robustheit:
Die sichtbaren Freitextfelder werden clientseitig ergänzt. Damit die Inhalte zuverlässig in der Netlify-Mail landen, werden sie zusätzlich gesammelt in `individual_notes` und `chatgpt_summary` geschrieben.