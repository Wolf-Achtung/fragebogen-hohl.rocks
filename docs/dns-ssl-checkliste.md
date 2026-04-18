# DNS-/SSL-Checkliste für fragebogen.hohl.rocks

1. `fragebogen.hohl.rocks` im Netlify-Projekt als Custom Domain hinzufügen.
2. DNS beim Domainanbieter auf die Netlify-Site zeigen lassen.
3. Wenn möglich CNAME verwenden: `fragebogen.hohl.rocks -> <site-name>.netlify.app`.
4. In Netlify HTTPS-Zertifikat provisionieren lassen.
5. Browserwarnung `NET::ERR_CERT_COMMON_NAME_INVALID` muss vollständig verschwunden sein.
6. Erst danach Fragebogen produktiv verwenden.
