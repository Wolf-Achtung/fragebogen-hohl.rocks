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
    if (color === "green") return "Grün – startklar";
    if (color === "yellow") return "Gelb – prüfen";
    if (color === "red") return "Rot – blockiert";
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
    const contactEmail = text(form, "email");
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
    if (!yes(entra)) blockers.push("Zentrale Microsoft-Anmeldung / Entra ID ist nicht bestätigt.");
    if (integrated && !yes(exchange)) blockers.push("Exchange Online für primäre Postfächer ist für integrierten Copilot nicht bestätigt.");
    if (integrated && !yes(apps)) blockers.push("Aktuelle Microsoft-365-Apps der Pilotgruppe sind nicht bestätigt.");
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

    let route = "Gestuft starten: Chat zuerst, Integration nach Daten-/IT-Klärung";
    if (readiness === "green" && governance !== "red" && dataFoundation !== "red" && /integriert/i.test(mode)) route = "Jetzt mit Microsoft 365 Copilot als Pilot starten";
    else if (readiness !== "red" && /chat/i.test(mode)) route = "Jetzt mit Copilot Chat starten";
    else if (readiness === "red" || governance === "red") route = "Foundation zuerst: technische / Governance-Grundlagen klären";
    else if (/gestuft/i.test(mode)) route = "Gestuft starten: Chat zuerst, Integration nach Foundations";

    if (!blockers.length) blockers.push("Keine harten Blocker aus den Pflichtangaben erkennbar.");
    if (!unknowns.length) unknowns.push("Keine wesentlichen offenen Punkte aus den Pflichtangaben erkennbar.");
    if (readiness !== "green") next.push("Technische Mindestvoraussetzungen der Pilotgruppe verifizieren.");
    if (governance !== "green") next.push("Sensible Inhalte, externe Freigaben und Schutzmechanismen klären.");
    if (dataFoundation !== "green") next.push("Relevante Datenorte priorisieren und Microsoft-365-Datenbasis prüfen.");
    if (adoption !== "green") next.push("Sponsor, Champions, Support und Erfolgsmessung festlegen.");
    if (!next.length) next.push("Pilotgruppe festlegen, Lizenzen prüfen und 30/60/90-Tage-Pilotplan erstellen.");

    const summary = cleanLines([
      "PROJEKT",
      "Copilot-Integration",
      `Kontakt: ${contactEmail || "—"}`,
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
      "WICHTIGSTE BLOCKER",
      blockers.map(x => `- ${x}`).join("\n"),
      "",
      "OFFENE PUNKTE",
      unknowns.map(x => `- ${x}`).join("\n"),
      "",
      "NÄCHSTE SCHRITTE",
      next.map(x => `- ${x}`).join("\n"),
      "",
      "ZIELBILD",
      `Zielbild: ${mode || "—"}`,
      `Pilotgruppen: ${listOrDash(groups)}`,
      `Pilotgröße: ${pilotSize || "—"}`,
      `Vollausbau: ${fullSize || "—"}`,
      `90-Tage-Ziele: ${goals || "—"}`,
      "",
      "TECHNISCHE BASIS",
      `Lizenz: ${license || "—"}`,
      `Zentrale Anmeldung / Entra ID: ${entra || "—"}`,
      `Exchange Online: ${exchange || "—"}`,
      `M365 Apps: ${apps || "—"}`,
      `Teams: ${teams || "—"}`,
      `Meeting-Transkription: ${transcript || "—"}`,
      "",
      "DATEN & GOVERNANCE",
      `Datenorte: ${listOrDash(dataLocations)}`,
      `Nutzbare Daten: ${listOrDash(allowedData)}`,
      `Sensible / ausgeschlossene Inhalte: ${listOrDash(sensitive)}`,
      `Externe Freigaben: ${external || "—"}`,
      `Vertraulichkeitskennzeichnungen / Labels: ${labels || "—"}`,
      `DLP: ${dlp || "—"}`,
      `MFA / Conditional Access: ${mfa || "—"}`,
      `Compliance: ${compliance || "—"}`,
      "",
      "ROLLOUT",
      `Sponsor: ${sponsor || "—"}`,
      `IT-Owner: ${itOwner || "—"}`,
      `Champions: ${champions || "—"}`,
      `Schulung: ${listOrDash(training)}`,
      `Support: ${support || "—"}`,
      `Erfolgsmessung: ${listOrDash(metrics)}`,
      `Skalierungsentscheidung: ${scaleDecision || "—"}`,
      "",
      "AUFTRAG AN CHATGPT",
      "Bitte erstelle daraus:",
      "1. eine priorisierte Implementierungsstrategie,",
      "2. einen 30/60/90-Tage-Plan,",
      "3. eine technische Checkliste,",
      "4. eine Governance-/Risikoliste,",
      "5. einen Pilot- und Schulungsplan."
    ]);

    return { route, readiness, governance, dataFoundation, adoption, blockers, unknowns, next, summary };
  }

  function evaluatePost(form) {
    const contactEmail = text(form, "email");
    const useCases = getAll(form, "top_use_cases");
    const mainOutput = getRadio(form, "main_output");
    const materialTypes = getAll(form, "material_types");
    const projectSize = text(form, "project_size");
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
    const importProcess = getAll(form, "import_process");
    const exportProcess = getAll(form, "export_process");
    const filevault = getRadio(form, "filevault");
    const userRoles = getAll(form, "user_roles");
    const deletionPolicy = getRadio(form, "deletion_policy");
    const backupPolicy = getRadio(form, "backup_policy");
    const updateStaging = getRadio(form, "update_staging");
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

    if (useCases.length < 1) blockers.push("Keine Top-Use-Cases gewählt.");
    if (unknown(mainOutput)) blockers.push("Hauptoutput ist nicht geklärt.");
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
    if (/ja/i.test(onlineWithData)) blockers.push("System wäre mit Kundendaten online – das widerspricht dem geplanten Offline-Pilot.");
    const missingOps = (unknown(onlineWithData) ? 1 : 0) + (!importProcess.length ? 1 : 0) + (!exportProcess.length ? 1 : 0) + (unknown(filevault) ? 1 : 0) + (!userRoles.length ? 1 : 0) + (unknown(deletionPolicy) ? 1 : 0) + (unknown(updateStaging) ? 1 : 0);
    if (/ja/i.test(onlineWithData) || missingOps >= 4) operations = "red";
    else if (missingOps >= 1) operations = "yellow";

    let calibration = "green";
    const missingCalibration = [trailersRaw, scripts, transcripts, socialVersions, clientFeedback, calibrationApproval].filter(unknown).length + (!goodSelection ? 1 : 0);
    if (missingCalibration >= 5 || /nein/i.test(calibrationApproval)) calibration = "red";
    else if (missingCalibration >= 2) calibration = "yellow";

    let route = "Output-first Pilot mit Review-Reel/Listen starten";
    if (operations === "red") route = "Betriebskonzept zuerst: Offline, Import/Export, Rechte und Löschung klären";
    else if (pilotClarity === "red") route = "Pilotziel zuerst schärfen: Use Cases, Hauptoutput, Referenzprojekte";
    else if (workflowFit === "red") route = "Workflow-Grundlagen zuerst klären: Timecode, Proxy, Austauschformate";
    else if (calibration === "red") route = "Kalibrierungspaket zuerst vorbereiten";
    else if (pilotClarity === "green" && workflowFit !== "red" && operations !== "red") route = "Pilot starten: lokales Offline-System mit klaren Outputs vorbereiten";

    if (!blockers.length) blockers.push("Keine harten Blocker aus den Pflichtangaben erkennbar.");
    if (!unknowns.length) unknowns.push("Keine wesentlichen offenen Punkte aus den Pflichtangaben erkennbar.");
    if (pilotClarity !== "green") next.push("Top-Use-Cases, Hauptoutput, Referenzprojekte und Erfolgskriterien finalisieren.");
    if (workflowFit !== "green") next.push("Avid-/Proxy-/Timecode-/Austauschformat-Details mit Postproduktion klären.");
    if (operations !== "green") next.push("Offline-, Import-/Export-, FileVault-, Rechte- und Löschprozess verbindlich festlegen.");
    if (calibration !== "green") next.push("Referenzmaterial und Kriterien für gute/schlechte Auswahl vorbereiten.");
    if (!next.length) next.push("Mac-mini-Pilot vorbereiten: Hardware, Staging, Dummy-Test, danach Kundendaten nur offline.");

    const summary = cleanLines([
      "PROJEKT",
      "Lokales Postproduktions-KI-System",
      `Kontakt: ${contactEmail || "—"}`,
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
      "WICHTIGSTE BLOCKER",
      blockers.map(x => `- ${x}`).join("\n"),
      "",
      "OFFENE PUNKTE",
      unknowns.map(x => `- ${x}`).join("\n"),
      "",
      "NÄCHSTE SCHRITTE",
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
      "BETRIEB & SICHERHEIT",
      `Offlinegrad: ${offlineModel || "—"}`,
      `Online mit Kundendaten: ${onlineWithData || "—"}`,
      `Import: ${listOrDash(importProcess)}`,
      `Export: ${listOrDash(exportProcess)}`,
      `FileVault: ${filevault || "—"}`,
      `Benutzerrollen: ${listOrDash(userRoles)}`,
      `Löschfrist: ${deletionPolicy || "—"}`,
      `Backup: ${backupPolicy || "—"}`,
      `Update-Staging: ${updateStaging || "—"}`,
      `Verbotene Daten: ${listOrDash(forbiddenData)}`,
      `Layout-VO-Regel: ${voicePolicy || "—"}`,
      "",
      "KALIBRIERUNG",
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
      "AUFTRAG AN CHATGPT",
      "Bitte erstelle daraus:",
      "1. eine Pilot-Roadmap,",
      "2. eine Hardwareempfehlung,",
      "3. eine Installationsreihenfolge,",
      "4. ein Offline-/Staging-Konzept,",
      "5. einen Toolstack-Vorschlag,",
      "6. Output-Spezifikationen,",
      "7. KPIs,",
      "8. Governance-Regeln,",
      "9. spätere Avid-/Windows-Integrationsoptionen."
    ]);

    return { route, pilotClarity, workflowFit, operations, calibration, blockers, unknowns, next, summary };
  }

  function render(form, result) {
    const box = form.querySelector(".assessment");
    const summaryField = form.querySelector(".summary-box");
    if (!box) return;

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
    setHidden(form, "auto_blockers", result.blockers.join("\n"));
    setHidden(form, "auto_unknowns", result.unknowns.join("\n"));
    setHidden(form, "auto_next_steps", result.next.join("\n"));
    setHidden(form, "chatgpt_summary", result.summary);
    if (summaryField) summaryField.value = result.summary;

    box.innerHTML = `
      <h2>Vorläufige Einschätzung</h2>
      <p><strong>Empfohlener Startpfad:</strong> ${result.route}</p>
      <div class="badges">${badges}</div>
      <p><strong>Wichtigster nächster Schritt:</strong> ${result.next[0] || "—"}</p>
    `;
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
      updateForm(form);
      form.addEventListener("input", () => updateForm(form));
      form.addEventListener("change", () => updateForm(form));
      form.addEventListener("submit", (event) => { updateForm(form); if (!validateRequiredGroups(form)) event.preventDefault(); });
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