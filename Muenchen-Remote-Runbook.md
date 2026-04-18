# München-Remote-Runbook für den lokalen Mac-mini-Pilot

## Ziel

Wolf arbeitet aus Berlin. Das Büro und der spätere Mac mini stehen in München. Der Workaround ist ein zweigleisiges Modell:

1. Remote-first für Planung, Fragebögen, Copilot und Dummy-Setup.
2. Local Operator in München für alles, was physische Hardware, Kundendaten, Offlinebetrieb und Datenträger betrifft.

## Rollen

### Wolf / Berlin
- Product Owner
- fachliche Bewertung
- Roadmap-Entscheidung
- Fragebogen-Auswertung
- Remote-Anleitung bei Setup und Tests ohne Kundendaten

### Local Operator / München
- physischer Zugriff auf Mac mini
- Ein-/Ausstecken von Netzwerk, SSD, Monitor
- Ausführen der Checkliste
- Dokumentation per Fotos/Screenshots ohne Kundendaten
- Import/Export nach Freigabe

### IT/Admin
- Accounts
- FileVault
- lokale Benutzerrechte
- Update-/Staging-Konzept
- Netzwerkfreigaben nur vor Kundendatenphase

### Postproduktion / Key User
- Referenzprojekte auswählen
- Ergebnisqualität bewerten
- Timecode-/Avid-/Proxy-Fragen beantworten

## Grundsatz

Sobald Kundendaten auf dem Mac mini liegen:

- Internet aus
- WLAN aus
- kein Remote-Zugriff
- kein Teams-/Zoom-Screensharing von Kundendaten
- kein ungeprüfter Export
- Ergebnisse nur nach definiertem Exportprozess

## Phase 1: Remote vorbereiten, ohne Kundendaten

- Mac mini aufstellen
- macOS aktualisieren
- Admin- und Operator-Konto anlegen
- FileVault aktivieren
- Tools installieren
- Dummy-/Testmaterial verwenden
- Remote-Support ist erlaubt, solange keine Kundendaten auf dem Gerät liegen

## Phase 2: Offline-Pilot mit Kundendaten

- Kundendaten nur per freigegebenem Datenträger importieren
- Netzwerk physisch trennen oder WLAN deaktivieren
- Analyse lokal durchführen
- Ergebnisse lokal prüfen oder kontrolliert exportieren
- keine Remote-Bildschirmfreigabe mit Kundendaten

## Phase 3: Auswertung

- Ergebnisse in anonymisierter Form zusammenfassen
- KPI-Bogen ausfüllen
- Wolf erhält:
  - Ergebnisliste ohne Rohmaterial, falls erlaubt
  - anonymisierte Scores
  - technische Logs ohne Kundennamen
  - offene Fragen
- Kundendaten nach Löschregel entfernen

## Minimaler Kommunikationsrhythmus

- Kurzer Startcall für Rollen und Checkliste
- Remote-Setup-Call ohne Kundendaten
- Lokale Testsession in München
- Ergebnis-Review mit anonymisierten Outputs
- Entscheidung: weiter, anpassen, stoppen