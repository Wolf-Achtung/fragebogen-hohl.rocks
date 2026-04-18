# Mail-only Copilot-Fragebogen

Dieses Paket ersetzt die alte Copilot-Fragebogenseite.

Zieldatei:
`public/forms/copilot/index.html`

Wichtig:
- Keine Browser-Speicherung
- Keine sichtbaren JSON-/Markdown-Exportbuttons
- Netlify Forms Formularname: `copilot-integration-v1`
- Testbutton: `Testmail senden`
- Mailinhalt enthält `chatgpt_zusammenfassung`

Nach Upload:
1. Netlify Deploy abwarten.
2. URL öffnen: `/forms/copilot/?v=mailonly-final`
3. Prüfen, ob oben `Mail-only-Version` steht.
4. `Testmail senden` klicken.
5. Netlify Forms und Postfach prüfen.
