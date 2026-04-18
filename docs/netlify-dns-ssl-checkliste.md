# DNS-/SSL-Checkliste für fragebogen.hohl.rocks

## Aktueller Befund aus dem Screenshot

Chrome meldet `NET::ERR_CERT_COMMON_NAME_INVALID` und HSTS. Das heißt: Der Browser bekommt ein Zertifikat, das nicht zu `fragebogen.hohl.rocks` passt. Produktiv darf das Formular so nicht verwendet werden.

Wahrscheinliche Ursache: Die Subdomain zeigt noch auf das Standard-Webspace-Ziel des Domainanbieters oder ist nicht als Custom Domain im richtigen Netlify-Projekt provisioniert.

## Sollzustand

- `fragebogen.hohl.rocks` ist im richtigen Netlify-Projekt als Custom Domain eingetragen.
- DNS `fragebogen` zeigt per CNAME auf die Netlify-Site, z. B. `chipper-granita-97957b.netlify.app`.
- Es gibt keine konkurrierenden A-/AAAA-/CNAME-Einträge für dieselbe Subdomain.
- Netlify HTTPS zeigt ein aktives Zertifikat für `fragebogen.hohl.rocks`.
- Chrome zeigt keine Warnung mehr.

## Prüfungen

```bash
nslookup fragebogen.hohl.rocks
# oder
 dig fragebogen.hohl.rocks CNAME
```

Erwartung: CNAME zu Netlify, nicht Standard-Webspace.
