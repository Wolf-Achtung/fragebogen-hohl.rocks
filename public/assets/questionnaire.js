(function () {
  function q(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return "";
    if (el.type === "radio") {
      const checked = form.querySelector(`[name="${name}"]:checked`);
      return checked ? checked.value : "";
    }
    return el.value || "";
  }
  function getRadio(form, name) {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }
  function getAll(form, name) {
    return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map(el => el.value);
  }
  function text(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? (el.value || "").trim() : "";
  }
  function setHidden(form, name, value) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = value || "";
  }
  function colorLabel(color) {
    if (color === "green") return "Passt gut";
    if (color === "yellow") return "Kurz klären";
    if (color === "red") return "Vor Start klären";
    return "Noch offen";
  }
  function colorClass(color) {
    if (color === "green") return "ok";
    if (color === "yellow") return "warn";
    if (color === "red") return "bad";
    return "neutral";
  }
  function unknown(v) {
    return !v || /unbekannt|unklar|offen|noch offen/i.test(String(v));
  }
  function yes(v) {
    return /ja|aktiv|standardisiert|vollständig|überwiegend|vorhanden|erlaubt/i.test(String(v));
  }
  function updateConditionalRequired(form) {
    const type = form.dataset.formType;
    if (type !== "copilot") return;
    const mode = getRadio(form, "target_mode");
    const integrated = /integriert|gestuft/i.test(mode);
    ["exchange_online", "m365_apps"].forEach(name => {
      const nodes = form.querySelectorAll(`[name="${name}"]`);
      nodes.forEach(n => n.required = integrated);
    });
    const hint = form.querySelector("#integrationRequirementHint");
    if (hint) hint.classList.toggle("hidden", !integrated);
  }
  function listOrDash(arr) {
    return arr && arr.length ? arr.join(", ") : "—";
  }
  function cleanLines(lines) {
    return lines.filter(Boolean).join("\n");
  }

  function evaluateCopilot(form) {
    const individualNotes = collectIndividualNotes(form);
    const mode = getRadio(form, "target_mode");
    const groups = getAll(form, "pilot_groups");
    const pilotSize = getRadio(form, "pilot_size");
    const fullSize = text(form, "full_size");
    const goals = text(form, "success_90_days");
    const license = getRadio(form, "license_family");
    const entra = getRadio(form, "entra_id");
    const exchange = getRadio(form, "exchange_online");
    const apps = getRadio(form, "m365_apps");
    const teams = getRadio(form, "teams_usage");
    const transcript = getRadio(form, "meeting_transcription");
    const dataLocations = getAll(form, "data_locations");
    const allowedData = getAll(form, "allowed_data");
    const sensitive = getAll(form, "sensitive_content");
    const external = getRadio(form, "external_sharing");
    const labels = getRadio(form, "sensitivity_labels");
    const dlp = getRadio(form, "dlp");
    const mfa = getRadio(form, "mfa_ca");
    const compliance = text(form, "compliance_notes");
    const localOfflineNotes = text(form, "local_offline_notes");
    const sponsor = text(form, "executive_sponsor");
    const itOwner = text(form, "it_owner");
    const champions = text(form, "champions");
    const training = getAll(form, "training_formats");
    const support = text(form, "support_owner");
    const metrics = getAll(form, "success_metrics");
    const scaleDecision = getRadio(form, "scale_decision");

    const integrated = /integriert|gestuft/i.test(mode);
    let blockers = [];
    let unknowns = [];
    let next = [];

    if (unknown(mode)) unknowns.push("Zielbild noch offen.");
    if (!groups.length) unknowns.push("Pilotgruppen fehlen.");
    if (unknown(license)) unknowns.push("Microsoft-365-Lizenzbasis unklar.");
    if (!yes(entra)) blockers.push("Zentrale Microsoft-Anmeldung sollte kurz bestätigt werden.");
    if (integrated && !yes(exchange)) blockers.push("Exchange Online für die primären Postfächer sollte kurz bestätigt werden.");
    if (integrated && !yes(apps)) blockers.push("Aktuelle Microsoft-365-Apps der Pilotgruppe sollten kurz bestätigt werden.");
    if (/regelmäßig/i.test(teams) && !yes(transcript)) unknowns.push("Teams-Transkription/Aufzeichnung für Meeting-Use-Cases klären.");

    let readiness = "green";
    if (blockers.length) readiness = "red";
    else if (unknown(mode) || unknown(license) || unknown(pilotSize) || (integrated && (unknown(exchange) || unknown(apps)))) readiness = "yellow";

    const sensitiveHigh = sensitive.length >= 3 || sensitive.some(v => /kundenverträge|drehbücher|finanz|hr|nda|personen/i.test(v));
    let governance = "green";
    if (sensitiveHigh && (unknown(labels) || unknown(dlp) || unknown(mfa) || /häufig|unklar/i.test(external))) governance = "red";
    else if (sensitive.length || /punktuell|häufig|unklar/i.test(external) || unknown(labels) || unknown(dlp) || unknown(mfa)) governance = "yellow";

    const m365Count = dataLocations.filter(v => /Outlook|Teams|SharePoint|OneDrive/i.test(v)).length;
    const externalCount = dataLocations.filter(v => /Fileserver|Dropbox|Google|Avid|Produktionsspeicher|andere/i.test(v)).length;
    let dataFoundation = "green";
    if (externalCount > m365Count) dataFoundation = "red";
    else if (externalCount > 0 || !dataLocations.length) dataFoundation = "yellow";

    let adoption = "green";
    const missingAdoption = [sponsor, itOwner, champions, support, goals].filter(v => !v).length + (!metrics.length ? 1 : 0);
    if (missingAdoption >= 4) adoption = "red";
    else if (missingAdoption >= 1) adoption = "yellow";

    let route = "Gestuft starten – erst KI-Chat, danach Microsoft-365-Integration";
    if (readiness === "green" && governance !== "red" && dataFoundation !== "red" && /integriert/i.test(mode)) route = "Office-KI mit Microsoft 365 Copilot als kleine Pilotgruppe starten";
    else if (readiness !== "red" && /chat/i.test(mode)) route = "Office-KI zuerst mit Copilot Chat starten";
    else if (readiness === "red" || governance === "red") route = "Erst die wichtigsten Office-KI-Grundlagen klären";
    else if (/gestuft/i.test(mode)) route = "Gestuft starten – erst KI-Chat, danach Microsoft-365-Integration";

    if (!blockers.length) blockers.push("Aus den bisherigen Angaben ergibt sich kein Punkt, der den Start grundsätzlich aufhält.");
    if (!unknowns.length) unknowns.push("Keine wesentlichen offenen Punkte aus den Basisangaben erkennbar.");
    if (readiness !== "green") next.push("Technische Basis der Pilotgruppe kurz prüfen.");
    if (governance !== "green") next.push("Gemeinsame Spielregeln für sensible Inhalte und Freigaben klären.");
    if (dataFoundation !== "green") next.push("Wichtigste Datenorte priorisieren und Microsoft-365-Ablage prüfen.");
    if (adoption !== "green") next.push("Entscheider, Testpersonen, Support und Erfolgskriterien festlegen.");
    if (!next.length) next.push("Pilotgruppe festlegen und daraus einen einfachen 30/60/90-Tage-Plan erstellen.");

    const summary = cleanLines([
      "PROJEKT",
      "Teilprojekt Office-KI mit Microsoft Copilot",
      "Formular: copilot-integration-v1",
      "Version: copilot-integration-v2",
      "",
      "AUTOMATISCHE VOREINSCHÄTZUNG",
      `Empfohlener Startpfad: ${route}`,
      `Sofort-Readiness: ${colorLabel(readiness)}`,
      `Governance-Risiko: ${colorLabel(governance)}`,
      `Datenbasis: ${colorLabel(dataFoundation)}`,
      `Adoption: ${colorLabel(adoption)}`,
      "",
      "KURZ ZU KLÄREN",
      blockers.map(x => `- ${x}`).join("\n"),
      "",
      "NOCH OFFEN",
      unknowns.map(x => `- ${x}`).join("\n"),
      "",
      "NÄCHSTE SINNVOLLE SCHRITTE",
      next.map(x => `- ${x}`).join("\n"),
      "",
      "ZIELBILD",
      `Zielbild: ${mode || "—"}`,
      `Pilotgruppen: ${listOrDash(groups)}`,
      `Pilotgröße: ${pilotSize || "—"}`,
      `Vollausbau: ${fullSize || "—"}`,
      `90-Tage-Ziele: ${goals || "—"}`,
      "",
      "MICROSOFT-365-BASIS",
      `Lizenz: ${license || "—"}`,
      `Zentrale Anmeldung / Entra ID: ${entra || "—"}`,
      `Exchange Online: ${exchange || "—"}`,
      `M365 Apps: ${apps || "—"}`,
      `Teams: ${teams || "—"}`,
      `Meeting-Transkription: ${transcript || "—"}`,
      "",
      "DATEN & SPIELREGELN",
      `Datenorte: ${listOrDash(dataLocations)}`,
      `Nutzbare Daten: ${listOrDash(allowedData)}`,
      `Sensible / ausgeschlossene Inhalte: ${listOrDash(sensitive)}`,
      `Externe Freigaben: ${external || "—"}`,
      `Vertraulichkeitskennzeichnungen / Labels: ${labels || "—"}`,
      `DLP: ${dlp || "—"}`,
      `MFA / Conditional Access: ${mfa || "—"}`,
      `Compliance: ${compliance || "—"}`,
      `Eher lokal/offline zu lösen: ${localOfflineNotes || "—"}`,
      "",
      "PILOT & ALLTAG",
      `Sponsor: ${sponsor || "—"}`,
      `IT-Owner: ${itOwner || "—"}`,
      `Champions: ${champions || "—"}`,
      `Schulung: ${listOrDash(training)}`,
      `Support: ${support || "—"}`,
      `Erfolgsmessung: ${listOrDash(metrics)}`,
      `Skalierungsentscheidung: ${scaleDecision || "—"}`,
      "",
      "ERGÄNZENDE HINWEISE ZU EINZELNEN FRAGEN",
      individualNotes || "—",
      "",
      "AUFTRAG AN CHATGPT",
      "Bitte erstelle daraus:",
      "1. eine priorisierte Implementierungsstrategie,",
      "2. einen 30/60/90-Tage-Plan,",
      "3. eine technische Checkliste,",
      "4. eine Governance-/Risikoliste,",
      "5. einen Pilot- und Schulungsplan."
    ]);

    return { route, readiness, governance, dataFoundation, adoption, blockers, unknowns, next, individualNotes, summary };
  }

  function evaluatePost(form) {
    const individualNotes = collectIndividualNotes(form);
    const useCases = getAll(form, "top_use_cases");
    const mainOutput = getRadio(form, "main_output");
    const materialTypes = getAll(form, "material_types");
    const projectSize = text(form, "project_size");
    const hardwarePlan = getRadio(form, "hardware_plan");
    const offlineModel = getRadio(form, "offline_model");
    const reviewProcess = getAll(form, "review_process");
    const evaluator = text(form, "success_owner");
    const refProjects = text(form, "reference_projects");
    const successCriteria = text(form, "success_criteria");

    const nleTools = getAll(form, "nle_tools");
    const avidVersions = text(form, "avid_versions");
    const proxyWorkflow = getRadio(form, "proxy_workflow");
    const timecodeBasis = getRadio(form, "timecode_basis");
    const clipHandles = getRadio(form, "clip_handles");
    const exchangePhase1 = getAll(form, "exchange_formats_phase1");
    const exchangeLater = getAll(form, "exchange_formats_later");
    const postTools = text(form, "post_tools");
    const reviewToday = text(form, "review_today");

    const onlineWithData = getRadio(form, "online_with_customer_data");
    const localAccessModel = getRadio(form, "local_access_model");
    const localAiInterface = getAll(form, "local_ai_interface");
    const ragSources = getAll(form, "rag_sources");
    const networkBoundary = getRadio(form, "network_boundary");
    const importProcess = getAll(form, "import_process");
    const exportProcess = getAll(form, "export_process");
    const filevault = getRadio(form, "filevault");
    const userRoles = getAll(form, "user_roles");
    const deletionPolicy = getRadio(form, "deletion_policy");
    const backupPolicy = getRadio(form, "backup_policy");
    const updateStaging = getRadio(form, "update_staging");
    const modelSource = getRadio(form, "model_source");
    const forbiddenData = getAll(form, "forbidden_data");
    const voicePolicy = getRadio(form, "voice_policy");

    const trailersRaw = getRadio(form, "trailers_raw");
    const scripts = getRadio(form, "scripts_available");
    const transcripts = getRadio(form, "transcripts_available");
    const socialVersions = getRadio(form, "social_versions");
    const clientFeedback = getRadio(form, "client_feedback");
    const goodSelection = text(form, "good_selection");
    const badSelection = text(form, "bad_selection");
    const specialRules = text(form, "special_rules");
    const calibrationApproval = getRadio(form, "calibration_approval");

    let blockers = [];
    let unknowns = [];
    let next = [];

    if (useCases.length < 1) blockers.push("Bitte noch die wichtigsten Aufgaben auswählen.");
    if (unknown(mainOutput)) blockers.push("Bitte noch das wichtigste Ergebnis auswählen.");
    if (!refProjects) unknowns.push("Referenzprojekte fehlen oder sind nicht beschrieben.");
    if (!successCriteria) unknowns.push("Erfolgskriterien fehlen.");
    if (unknown(offlineModel)) unknowns.push("Offline-Modell ist unklar.");

    let pilotClarity = "green";
    const missingPilot = (useCases.length ? 0 : 1) + (mainOutput ? 0 : 1) + (refProjects ? 0 : 1) + (successCriteria ? 0 : 1) + (evaluator ? 0 : 1);
    if (missingPilot >= 3) pilotClarity = "red";
    else if (missingPilot >= 1) pilotClarity = "yellow";

    let workflowFit = "green";
    const missingWorkflow = (!nleTools.length ? 1 : 0) + (unknown(proxyWorkflow) ? 1 : 0) + (unknown(timecodeBasis) ? 1 : 0) + (!exchangePhase1.length ? 1 : 0);
    if (missingWorkflow >= 3) workflowFit = "red";
    else if (missingWorkflow >= 1) workflowFit = "yellow";

    let operations = "green";
    if (/ja/i.test(onlineWithData)) blockers.push("Bitte klären, ob echtes Projektmaterial wirklich offline bleiben soll.");
    if (/KI-Server/i.test(localAccessModel) && unknown(networkBoundary)) unknowns.push("Bei lokaler KI-Server-Nutzung bitte die Netzwerkgrenze kurz klären.");
    if (/KI-Server/i.test(localAccessModel) && /Noch offen/i.test(modelSource)) unknowns.push("Bei lokaler KI-Server-Nutzung bitte den Modell-/Updateweg kurz klären.");
    const missingOps = (unknown(onlineWithData) ? 1 : 0) + (!importProcess.length ? 1 : 0) + (!exportProcess.length ? 1 : 0) + (unknown(filevault) ? 1 : 0) + (!userRoles.length ? 1 : 0) + (unknown(deletionPolicy) ? 1 : 0) + (unknown(updateStaging) ? 1 : 0);
    if (/ja/i.test(onlineWithData) || missingOps >= 4) operations = "red";
    else if (missingOps >= 1) operations = "yellow";

    let calibration = "green";
    const missingCalibration = [trailersRaw, scripts, transcripts, socialVersions, clientFeedback, calibrationApproval].filter(unknown).length + (!goodSelection ? 1 : 0);
    if (missingCalibration >= 5 || /nein/i.test(calibrationApproval)) calibration = "red";
    else if (missingCalibration >= 2) calibration = "yellow";

    let route = "Lokale Postproduktions-KI als Output-Pilot starten";
    if (operations === "red") route = "Erst die praktische Arbeitsweise im Büro klären";
    else if (pilotClarity === "red") route = "Erst Ziel und wichtigste Ergebnisse des Pilots schärfen";
    else if (workflowFit === "red") route = "Erst Anschluss an Schnitt, Timecode und Übergabe klären";
    else if (calibration === "red") route = "Erst Referenzen und Kriterien für gute Auswahl vorbereiten";
    else if (pilotClarity === "green" && workflowFit !== "red" && operations !== "red") route = "Lokale Postproduktions-KI als klaren Output-Pilot starten";

    if (!blockers.length) blockers.push("Aus den bisherigen Angaben ergibt sich kein Punkt, der den Start grundsätzlich aufhält.");
    if (!unknowns.length) unknowns.push("Keine wesentlichen offenen Punkte aus den Basisangaben erkennbar.");
    if (pilotClarity !== "green") next.push("Top-Aufgaben, wichtigstes Ergebnis, Referenzen und Erfolgskriterien finalisieren.");
    if (workflowFit !== "green") next.push("Schnitt-, Proxy-, Timecode- und Übergabefragen mit der Postproduktion klären.");
    if (operations !== "green") next.push("Offline-, Import-/Export-, FileVault-, Rechte- und Löschprozess einfach festlegen.");
    if (/KI-Server/i.test(localAccessModel)) next.push("Für die lokale KI-Server-Idee: LAN-Zugriff, Bedienoberfläche und Modell-/Updateweg vor Kundendatenphase festlegen.");
    if (calibration !== "green") next.push("Referenzmaterial und Kriterien für gute Auswahl vorbereiten.");
    if (!next.length) next.push("Lokalen Pilot vorbereiten: Hardware, Staging, Dummy-Test; echte Projektmaterialien danach nur offline.");

    const summary = cleanLines([
      "PROJEKT",
      "Teilprojekt Lokale Postproduktions-KI im Büro",
      "Formular: postproduktion-ki-v1",
      "Version: postproduktion-ki-v1",
      "",
      "AUTOMATISCHE VOREINSCHÄTZUNG",
      `Empfohlener Startpfad: ${route}`,
      `Pilotklarheit: ${colorLabel(pilotClarity)}`,
      `Workflow-Fit: ${colorLabel(workflowFit)}`,
      `Betriebsreife: ${colorLabel(operations)}`,
      `Kalibrierbarkeit: ${colorLabel(calibration)}`,
      "",
      "KURZ ZU KLÄREN",
      blockers.map(x => `- ${x}`).join("\n"),
      "",
      "NOCH OFFEN",
      unknowns.map(x => `- ${x}`).join("\n"),
      "",
      "NÄCHSTE SINNVOLLE SCHRITTE",
      next.map(x => `- ${x}`).join("\n"),
      "",
      "PILOTZIEL",
      `Top-Use-Cases: ${listOrDash(useCases)}`,
      `Hauptoutput: ${mainOutput || "—"}`,
      `Erfolgskriterien: ${successCriteria || "—"}`,
      `Bewertung durch: ${evaluator || "—"}`,
      "",
      "MATERIAL",
      `Materialarten: ${listOrDash(materialTypes)}`,
      `Projektgrößen: ${projectSize || "—"}`,
      `Geplante Hardware: ${hardwarePlan || "—"}`,
      `Referenzprojekte: ${refProjects || "—"}`,
      "",
      "WORKFLOW",
      `NLE-/Post-Tools: ${listOrDash(nleTools)}`,
      `Avid-Versionen: ${avidVersions || "—"}`,
      `Proxy-Workflow: ${proxyWorkflow || "—"}`,
      `Timecode-Basis: ${timecodeBasis || "—"}`,
      `Clip-Handles: ${clipHandles || "—"}`,
      `Austauschformate Phase 1: ${listOrDash(exchangePhase1)}`,
      `Austauschformate später: ${listOrDash(exchangeLater)}`,
      `Weitere Post-Tools: ${postTools || "—"}`,
      `Review heute: ${reviewToday || "—"}`,
      "",
      "BETRIEB & UMGANG MIT MATERIAL",
      `Offlinegrad: ${offlineModel || "—"}`,
      `Online mit Kundendaten: ${onlineWithData || "—"}`,
      `Nutzungsmodell lokal: ${localAccessModel || "—"}`,
      `Lokale Oberfläche / Serveridee: ${listOrDash(localAiInterface)}`,
      `Lokale Wissensdatenbank / RAG-Quellen: ${listOrDash(ragSources)}`,
      `Netzwerkgrenze: ${networkBoundary || "—"}`,
      `Import: ${listOrDash(importProcess)}`,
      `Export: ${listOrDash(exportProcess)}`,
      `FileVault: ${filevault || "—"}`,
      `Benutzerrollen: ${listOrDash(userRoles)}`,
      `Löschfrist: ${deletionPolicy || "—"}`,
      `Backup: ${backupPolicy || "—"}`,
      `Update-Staging: ${updateStaging || "—"}`,
      `Modellquelle / Modell-Updates: ${modelSource || "—"}`,
      `Nicht vorgesehene Daten: ${listOrDash(forbiddenData)}`,
      `Layout-VO-Regel: ${voicePolicy || "—"}`,
      "",
      "REFERENZEN & AUSWAHLGEFÜHL",
      `Trailer + Rohmaterial: ${trailersRaw || "—"}`,
      `Skripte: ${scripts || "—"}`,
      `Transkripte / Untertitel: ${transcripts || "—"}`,
      `Social-Versionen: ${socialVersions || "—"}`,
      `Kundenfeedback: ${clientFeedback || "—"}`,
      `Gute Auswahl: ${goodSelection || "—"}`,
      `Schlechte Auswahl: ${badSelection || "—"}`,
      `Sonderregeln: ${specialRules || "—"}`,
      `Freigabe Kalibrierung: ${calibrationApproval || "—"}`,
      "",
      "ERGÄNZENDE HINWEISE ZU EINZELNEN FRAGEN",
      individualNotes || "—",
      "",
      "AUFTRAG AN CHATGPT",
      "Bitte erstelle daraus:",
      "1. eine Pilot-Roadmap,",
      "2. eine Hardwareempfehlung,",
      "3. eine Installationsreihenfolge,",
      "4. ein Offline-/Staging-Konzept inklusive lokaler KI-Server-Variante,",
      "5. einen Toolstack-Vorschlag inklusive Modell-/Interface-Auswahl,",
      "6. Output-Spezifikationen,",
      "7. KPIs,",
      "8. Governance-Regeln,",
      "9. spätere Avid-/Windows-Integrationsoptionen."
    ]);

    return { route, pilotClarity, workflowFit, operations, calibration, blockers, unknowns, next, individualNotes, summary };
  }

  function render(form, result) {
    const box = form.querySelector(".assessment");
    const summaryField = form.querySelector(".summary-box");
    if (!box) return;
    setHidden(form, "individual_notes", result.individualNotes || collectIndividualNotes(form));

    let badges = "";
    if (form.dataset.formType === "copilot") {
      badges = [
        ["Readiness", result.readiness],
        ["Governance", result.governance],
        ["Datenbasis", result.dataFoundation],
        ["Adoption", result.adoption]
      ].map(([label, color]) => `<span class="badge ${colorClass(color)}">${label}: ${colorLabel(color)}</span>`).join("");
      setHidden(form, "auto_route", result.route);
      setHidden(form, "auto_readiness", colorLabel(result.readiness));
      setHidden(form, "auto_governance", colorLabel(result.governance));
      setHidden(form, "auto_data_foundation", colorLabel(result.dataFoundation));
      setHidden(form, "auto_adoption", colorLabel(result.adoption));
    } else {
      badges = [
        ["Pilotklarheit", result.pilotClarity],
        ["Workflow-Fit", result.workflowFit],
        ["Betriebsreife", result.operations],
        ["Kalibrierbarkeit", result.calibration]
      ].map(([label, color]) => `<span class="badge ${colorClass(color)}">${label}: ${colorLabel(color)}</span>`).join("");
      setHidden(form, "auto_route", result.route);
      setHidden(form, "auto_pilot_clarity", colorLabel(result.pilotClarity));
      setHidden(form, "auto_workflow_fit", colorLabel(result.workflowFit));
      setHidden(form, "auto_operations", colorLabel(result.operations));
      setHidden(form, "auto_calibration", colorLabel(result.calibration));
    }
    setHidden(form, "auto_to_clarify", result.blockers.join("\n"));
    setHidden(form, "auto_unknowns", result.unknowns.join("\n"));
    setHidden(form, "auto_next_steps", result.next.join("\n"));
    setHidden(form, "chatgpt_summary", result.summary);
    if (summaryField) summaryField.value = result.summary;

    box.innerHTML = `
      <h2>Kurzer Zwischenstand</h2>
      <p><strong>Empfohlene Einordnung:</strong> ${result.route}</p>
      <div class="badges">${badges}</div>
      <p><strong>Nächster sinnvoller Schritt:</strong> ${result.next[0] || "—"}</p>
    `;
  }



  function normalizeQuestionText(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .replace(" öffnen", "")
      .replace(" schließen", "")
      .trim();
  }

  function slugify(text) {
    return normalizeQuestionText(text)
      .toLowerCase()
      .replace(/[ä]/g, "ae").replace(/[ö]/g, "oe").replace(/[ü]/g, "ue").replace(/[ß]/g, "ss")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "frage";
  }

  function helpTextForQuestion(question, formType) {
    const q = normalizeQuestionText(question).toLowerCase();

    const shared = [
      [/ziel|einstieg|start|pilot/i, "Hilft, aus den Antworten einen realistischen Startplan zu machen: Was kann sofort beginnen, was braucht vorher noch Klärung?"],
      [/bereiche|gruppen|nutzer|personen/i, "Hilft, den Pilot nicht zu groß und nicht zu abstrakt zu planen. Eine kleine, passende Startgruppe liefert schneller brauchbares Feedback."],
      [/erfolg|90|4–6|messen|kriterien/i, "Hilft, später nicht nur Technik zu bewerten, sondern echten Nutzen: Zeitgewinn, bessere Ergebnisse, weniger Suchaufwand oder bessere Übergaben."],
      [/lizenz|microsoft|entra|exchange|apps|teams|transkription/i, "Hilft, die technischen Mindestvoraussetzungen früh zu erkennen, ohne daraus einen IT-Fragebogen zu machen."],
      [/daten|inhalte|freigabe|sensible|labels|dlp|mfa|compliance/i, "Hilft, Nutzen und Sicherheit zusammen zu denken: Die KI soll auf hilfreiche Informationen zugreifen, aber nicht unkontrolliert auf alles."],
      [/sponsor|owner|champion|schulung|support|skalierung/i, "Hilft, den Pilot im Alltag tragfähig zu machen: Wer entscheidet, wer unterstützt, wer sammelt Feedback?"],
      [/material|prores|proxy|timecode|avid|schnitt|austausch|review/i, "Hilft, die KI-Ergebnisse so zu planen, dass sie wirklich in Schnitt, Review und Postproduktion weiterverwendet werden können."],
      [/offline|filevault|import|export|rollen|lösch|backup|update|netzwerk/i, "Hilft, den lokalen Betrieb sauber aufzusetzen: Daten hinein, Ergebnisse heraus, Updates, Rechte und Löschung."],
      [/hardware|server|lm studio|webui|anything|wissensdatenbank|rag|modelle/i, "Hilft, zu entscheiden, ob der Rechner nur als Einzelplatz dient oder auch als lokaler KI-Server beziehungsweise Wissenssystem im Büro."],
      [/referenz|trailer|skript|transkript|social|feedback|auswahl|kalibrierung/i, "Hilft, die Ergebnisse später fachlich zu bewerten: Was gilt bei euch als gute Auswahl, was wäre unbrauchbar?"]
    ];

    for (const [pattern, text] of shared) {
      if (pattern.test(q)) return text;
    }
    return formType === "postproduktion"
      ? "Hilft, aus dem späteren Ergebnis eine konkrete Pilot-Roadmap für lokale Postproduktions-KI abzuleiten."
      : "Hilft, aus dem späteren Ergebnis eine konkrete Copilot-Roadmap abzuleiten.";
  }

  function addHelpAndNote(afterElement, questionText, form, index) {
    if (!afterElement || afterElement.dataset.enhancedQuestion === "true") return;
    afterElement.dataset.enhancedQuestion = "true";

    const formType = form.dataset.formType || "fragebogen";
    const base = `${formType}_${index}_${slugify(questionText)}`;

    const help = document.createElement("details");
    help.className = "question-help";
    help.innerHTML = `<summary>Warum fragen wir das?</summary><div class="details-body"><p>${helpTextForQuestion(questionText, formType)}</p></div>`;

    const extra = document.createElement("details");
    extra.className = "question-extra";
    extra.innerHTML = `<summary>Weitere Angaben oder Besonderheiten</summary>
      <div class="details-body">
        <textarea name="note_${base}" data-individual-note data-question="${questionText.replace(/"/g, "&quot;")}" placeholder="Optional: Ergänzungen, Besonderheiten, Unsicherheiten oder Beispiele zu dieser Frage."></textarea>
      </div>`;

    afterElement.insertAdjacentElement("afterend", extra);
    afterElement.insertAdjacentElement("afterend", help);
  }

  function enhanceQuestions(form) {
    let index = 1;

    form.querySelectorAll("fieldset").forEach(fieldset => {
      if (fieldset.closest(".question-extra") || fieldset.closest(".question-help")) return;
      const legend = fieldset.querySelector("legend");
      const questionText = legend ? normalizeQuestionText(legend.textContent) : `Frage ${index}`;
      addHelpAndNote(fieldset, questionText, form, index++);
    });

    form.querySelectorAll("label.field-label").forEach(label => {
      const forId = label.getAttribute("for");
      let target = forId ? form.querySelector(`#${CSS.escape(forId)}`) : null;
      if (!target) target = label.nextElementSibling;
      if (!target || target.closest(".question-extra") || target.closest(".question-help")) return;
      const questionText = normalizeQuestionText(label.textContent);
      addHelpAndNote(target, questionText, form, index++);
    });
  }

  function collectIndividualNotes(form) {
    const notes = [];
    form.querySelectorAll("[data-individual-note]").forEach(el => {
      const value = (el.value || "").trim();
      if (!value) return;
      const question = el.getAttribute("data-question") || el.name || "Frage";
      notes.push(`- ${question}: ${value}`);
    });
    return notes.join("\n");
  }

  function getDraftKey(form) {
    const formName = form.querySelector('[name="form-name"]')?.value || form.getAttribute("name") || "fragebogen";
    const version = form.querySelector('[name="form_version"]')?.value || "v1";
    return `fragebogen_draft_${formName}_${version}_${location.pathname}`;
  }

  function getDraftFields(form) {
    return Array.from(form.elements).filter(el => {
      if (!el.name || el.disabled) return false;
      if (["hidden", "submit", "button"].includes(el.type)) return false;
      if (el.name === "bot-field") return false;
      if (el.classList.contains("summary-box")) return false;
      return true;
    });
  }

  function readDraftData(form) {
    const data = {};
    getDraftFields(form).forEach(el => {
      if (el.type === "checkbox" || el.type === "radio") {
        data[el.name] = data[el.name] || {};
        data[el.name][el.value] = el.checked;
      } else {
        data[el.name] = el.value || "";
      }
    });
    return data;
  }

  function applyDraftData(form, data) {
    if (!data || typeof data !== "object") return;
    getDraftFields(form).forEach(el => {
      const saved = data[el.name];
      if (saved === undefined) return;
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = !!(saved && saved[el.value]);
      } else {
        el.value = saved;
      }
    });
  }

  function saveDraft(form) {
    try {
      const payload = { savedAt: new Date().toISOString(), data: readDraftData(form) };
      localStorage.setItem(getDraftKey(form), JSON.stringify(payload));
      const status = form.querySelector("[data-draft-status]");
      if (status) {
        const time = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        status.textContent = `Zwischenstand automatisch gespeichert (${time}).`;
      }
    } catch (e) {
      const status = form.querySelector("[data-draft-status]");
      if (status) status.textContent = "Automatisches Speichern ist in diesem Browser nicht verfügbar.";
    }
  }

  function restoreDraft(form) {
    try {
      const raw = localStorage.getItem(getDraftKey(form));
      if (!raw) return;
      const payload = JSON.parse(raw);
      applyDraftData(form, payload.data);
      const status = form.querySelector("[data-draft-status]");
      if (status && payload.savedAt) {
        const date = new Date(payload.savedAt);
        const label = date.toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
        status.textContent = `Zwischenstand von ${label} wiederhergestellt.`;
      }
    } catch (e) {
      // Ignore broken drafts gracefully.
    }
  }

  function clearDraft(form) {
    try {
      localStorage.removeItem(getDraftKey(form));
      getDraftFields(form).forEach(el => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });
      const status = form.querySelector("[data-draft-status]");
      if (status) status.textContent = "Zwischenstand gelöscht.";
      updateForm(form);
    } catch (e) {
      alert("Der Zwischenstand konnte nicht gelöscht werden.");
    }
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, arguments), wait);
    };
  }

  function validateRequiredGroups(form) {
    const type = form.dataset.formType;
    const groups = type === "copilot"
      ? [
          ["pilot_groups", "Bitte mindestens eine Pilotgruppe auswählen."],
          ["data_locations", "Bitte mindestens einen Hauptdatenort auswählen."],
          ["sensitive_content", "Bitte sensible/ausgeschlossene Inhalte bewerten – auch „Keine“ oder „Unklar“ ist möglich."]
        ]
      : [
          ["top_use_cases", "Bitte mindestens einen Top-Use-Case auswählen."],
          ["material_types", "Bitte mindestens eine Materialart auswählen."],
          ["nle_tools", "Bitte mindestens ein Schnitt-/Post-Tool auswählen."],
          ["exchange_formats_phase1", "Bitte mindestens ein Austauschformat für Phase 1 auswählen."],
          ["import_process", "Bitte mindestens einen Importweg auswählen."],
          ["export_process", "Bitte mindestens einen Exportweg auswählen."],
          ["user_roles", "Bitte mindestens eine Benutzerrolle auswählen."]
        ];
    for (const [name, message] of groups) {
      if (!form.querySelector(`[name="${name}"]:checked`)) {
        alert(message);
        const first = form.querySelector(`[name="${name}"]`);
        if (first) {
          const details = first.closest("details");
          if (details) details.open = true;
          first.focus();
        }
        return false;
      }
    }
    return true;
  }

  function updateForm(form) {
    updateConditionalRequired(form);
    const result = form.dataset.formType === "copilot" ? evaluateCopilot(form) : evaluatePost(form);
    render(form, result);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("form[data-questionnaire='true']").forEach(form => {
      enhanceQuestions(form);
      restoreDraft(form);

      const debouncedSave = debounce(() => saveDraft(form), 500);

      updateForm(form);
      form.addEventListener("input", () => { updateForm(form); debouncedSave(); });
      form.addEventListener("change", () => { updateForm(form); debouncedSave(); });
      form.addEventListener("submit", (event) => {
        updateForm(form);
        saveDraft(form);
        if (!validateRequiredGroups(form)) event.preventDefault();
      });

      const clearBtn = form.querySelector("[data-clear-draft]");
      if (clearBtn) {
        clearBtn.addEventListener("click", (event) => {
          event.preventDefault();
          if (confirm("Zwischenstand in diesem Browser wirklich löschen?")) clearDraft(form);
        });
      }

      const copyBtn = form.querySelector("[data-copy-summary]");
      if (copyBtn) {
        copyBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          updateForm(form);
          const val = form.querySelector(".summary-box")?.value || "";
          try {
            await navigator.clipboard.writeText(val);
            copyBtn.textContent = "Zusammenfassung kopiert";
            setTimeout(() => copyBtn.textContent = "Zusammenfassung kopieren", 1800);
          } catch {
            alert("Kopieren nicht möglich. Bitte Text manuell markieren.");
          }
        });
      }
    });
  });
})();