const nodemailer = require("nodemailer");

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function jsonResponse(statusCode, body, origin = "") {
  const allowedOrigins = parseList(env("ALLOWED_ORIGINS", "https://fragebogen.hohl.rocks,http://localhost:8888"));
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "https://fragebogen.hohl.rocks";
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function sanitize(value, max = 500) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function buildReference(formId) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${sanitize(formId || "formular", 40).replace(/[^a-zA-Z0-9_-]/g, "-")}-${stamp}-${rand}`;
}

function requireEnv(names) {
  const missing = names.filter((name) => !env(name));
  if (missing.length) {
    throw new Error(`Fehlende Netlify Environment Variables: ${missing.join(", ")}`);
  }
}

exports.handler = async function handler(event) {
  const origin = event.headers.origin || event.headers.Origin || "";

  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {}, origin);
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, message: "Nur POST ist erlaubt." }, origin);
  }

  try {
    requireEnv(["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_TO", "MAIL_FROM"]);

    const payload = JSON.parse(event.body || "{}");
    const formId = sanitize(payload.formId, 80);
    const allowedFormIds = parseList(env("ALLOWED_FORM_IDS", "copilot-integration-v1"));

    if (!formId || !allowedFormIds.includes(formId)) {
      return jsonResponse(400, { ok: false, message: "Unbekannte oder nicht freigegebene Formular-ID." }, origin);
    }

    if (payload.honeypot) {
      return jsonResponse(200, { ok: true, reference: "ignored" }, origin);
    }

    if (!payload.consent) {
      return jsonResponse(400, { ok: false, message: "Einwilligung fehlt." }, origin);
    }

    const markdown = String(payload.markdown || "").trim();
    if (markdown.length < 100) {
      return jsonResponse(400, { ok: false, message: "Die Einsendung ist unvollständig." }, origin);
    }

    const reference = buildReference(formId);
    const formTitle = sanitize(payload.formTitle || "Fragebogen", 160);
    const organization = sanitize(payload.organization, 160);
    const respondentName = sanitize(payload.respondentName, 160);
    const respondentEmail = sanitize(payload.respondentEmail, 250);
    const sourceUrl = sanitize(payload.sourceUrl, 500);
    const submittedAt = sanitize(payload.submittedAt || new Date().toISOString(), 80);

    const subjectParts = ["Fragebogen", formTitle];
    if (organization) subjectParts.push(organization);
    if (respondentName) subjectParts.push(respondentName);
    subjectParts.push(reference);
    const subject = subjectParts.join(" – ");

    const summaryText = [
      `Neue Fragebogen-Einsendung`,
      ``,
      `Referenz: ${reference}`,
      `Formular: ${formTitle} (${formId})`,
      `Organisation: ${organization || "-"}`,
      `Ansprechpartner: ${respondentName || "-"}`,
      `E-Mail: ${respondentEmail || "-"}`,
      `Quelle: ${sourceUrl || "-"}`,
      `Zeitpunkt: ${submittedAt}`,
      ``,
      `--- MARKDOWN-EXPORT ---`,
      ``,
      markdown
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.45;color:#1d2733">
        <h2>Neue Fragebogen-Einsendung</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
          <tr><td><strong>Referenz</strong></td><td>${htmlEscape(reference)}</td></tr>
          <tr><td><strong>Formular</strong></td><td>${htmlEscape(formTitle)} (${htmlEscape(formId)})</td></tr>
          <tr><td><strong>Organisation</strong></td><td>${htmlEscape(organization || "-")}</td></tr>
          <tr><td><strong>Ansprechpartner</strong></td><td>${htmlEscape(respondentName || "-")}</td></tr>
          <tr><td><strong>E-Mail</strong></td><td>${htmlEscape(respondentEmail || "-")}</td></tr>
          <tr><td><strong>Quelle</strong></td><td>${htmlEscape(sourceUrl || "-")}</td></tr>
          <tr><td><strong>Zeitpunkt</strong></td><td>${htmlEscape(submittedAt)}</td></tr>
        </table>
        <p>Der vollständige Markdown-Export steht im Mailtext und als Anhang bereit. Zusätzlich ist der JSON-Rohdatensatz angehängt.</p>
        <hr>
        <pre style="white-space:pre-wrap;background:#f6f7f8;padding:12px;border-radius:8px">${htmlEscape(markdown)}</pre>
      </div>`;

    const smtpPort = Number(env("SMTP_PORT", "587"));
    const smtpSecureRaw = env("SMTP_SECURE", "false").toLowerCase();
    const smtpSecure = smtpSecureRaw === "true" || smtpSecureRaw === "ssl" || smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: env("SMTP_HOST"),
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: env("SMTP_USER"),
        pass: env("SMTP_PASS")
      }
    });

    const mailFromName = env("MAIL_FROM_NAME", "Hohl Fragebogen");
    const from = `"${mailFromName.replace(/\"/g, "'")}" <${env("MAIL_FROM")}>`;
    const attachments = [
      {
        filename: `${reference}.md`,
        content: markdown,
        contentType: "text/markdown; charset=utf-8"
      },
      {
        filename: `${reference}.json`,
        content: JSON.stringify(payload.data || payload, null, 2),
        contentType: "application/json; charset=utf-8"
      }
    ];

    await transporter.sendMail({
      from,
      to: env("MAIL_TO"),
      replyTo: isEmail(respondentEmail) ? respondentEmail : undefined,
      subject,
      text: summaryText,
      html,
      attachments
    });

    const copyEnabled = env("SEND_COPY_ENABLED", "true").toLowerCase() !== "false";
    if (copyEnabled && payload.sendCopy && isEmail(respondentEmail)) {
      await transporter.sendMail({
        from,
        to: respondentEmail,
        subject: `Kopie Ihrer Einsendung – ${formTitle}`,
        text: [
          `Hier ist eine Kopie Ihrer Fragebogen-Einsendung.`,
          ``,
          `Referenz: ${reference}`,
          `Formular: ${formTitle}`,
          `Zeitpunkt: ${submittedAt}`,
          ``,
          markdown
        ].join("\n"),
        attachments: [
          {
            filename: `${reference}.md`,
            content: markdown,
            contentType: "text/markdown; charset=utf-8"
          }
        ]
      });
    }

    return jsonResponse(200, { ok: true, reference }, origin);
  } catch (error) {
    console.error("submit error", error);
    return jsonResponse(500, {
      ok: false,
      message: "Serverfehler beim Versand. Bitte SMTP-/Netlify-Logs prüfen oder Markdown/JSON exportieren."
    }, origin);
  }
};
