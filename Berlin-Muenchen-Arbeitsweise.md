# Berlin–München-Arbeitsweise für den lokalen Pilot

## Idee

Wolf steuert fachlich aus Berlin. In München gibt es eine Person, die am Gerät nach einer einfachen Checkliste arbeitet. So kann der Pilot schnell vorbereitet werden, ohne dass echtes Projektmaterial unnötig über Remote-Strecken läuft.

## Rollen

### Wolf / Berlin

- fachliche Steuerung
- Auswertung der Fragebögen
- Entscheidung über Startweg und nächste Schritte
- Remote-Begleitung beim Setup ohne echtes Projektmaterial

### Local Operator / München

- Mac mini einschalten und bedienen
- SSD/Stick anschließen
- Netzwerkstatus prüfen
- Testläufe nach Checkliste starten
- Ergebnisse lokal prüfen oder nach Vorgabe exportieren
- kurze Rückmeldung geben, was funktioniert hat und was nicht

### IT/Admin

- lokale Nutzerkonten
- FileVault
- Updates
- Rechte
- Import-/Export-Regel
- Löschprozess

## Praktische Trennung

### Phase 1: Vorbereitung ohne echtes Projektmaterial

Hier sind Remote-Hilfe, Screensharing und Setup-Begleitung möglich.

- Mac einrichten
- Tools installieren
- Dummy-Material testen
- Ergebnisformate prüfen
- lokale Arbeitsweise üben

### Phase 2: Pilot mit echtem Projektmaterial

Ab hier bleibt das Material im Büro und der Mac arbeitet lokal/offline nach gemeinsam beschlossener Regel.

- Projektmaterial lokal importieren
- Internet/WLAN/LAN nach Regel deaktivieren
- Analyse lokal durchführen
- Ergebnis lokal prüfen
- nur freigegebene Ergebnisse exportieren
- Material nach vereinbarter Frist löschen

## Rückmeldung nach München-Test

Wolf braucht nicht zwingend Rohmaterial, sondern entscheidbare Informationen:

- Was wurde getestet?
- Welche Outputs kamen heraus?
- Waren Timecodes plausibel?
- Waren die Selects brauchbar?
- Wie lange dauerte der Lauf?
- Was war unklar?
- Was müsste für den nächsten Test besser werden?

## Grundregel

Remote ist gut für Planung, Setup und Dummy-Tests.  
Echtes Projektmaterial bleibt lokal in München und wird dort geprüft.


## Ergänzung: lokaler KI-Server im Büro

Falls der Mac mini nicht nur als Einzelplatz, sondern als lokaler KI-Server im Büro genutzt werden soll, gilt:

- Server-/LAN-Zugriff zuerst nur mit Dummy-Material testen.
- Keine iCloud-/Cloud-Synchronisierung für Kundendaten einrichten.
- Modelle und Tools möglichst in einer Setup-/Staging-Phase laden.
- Danach Kundendatenphase getrennt halten: offline oder klar begrenztes internes Netz ohne externe Erreichbarkeit.
- Vor Kundendatenphase dokumentieren: IP/Port, zugelassene Geräte, Bedienoberfläche, Import/Export, Löschung.

Die lokale Serveridee ist interessant, darf aber nicht dazu führen, dass der Offline-Vorteil durch eine falsche Netzwerkeinstellung verloren geht.
