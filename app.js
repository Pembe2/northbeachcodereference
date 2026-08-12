(() => {
  const entries = Array.isArray(window.CODE_ENTRIES) ? window.CODE_ENTRIES : [];
  const jobs = Array.isArray(window.CODE_JOBS) ? window.CODE_JOBS : [];
  const baseline = window.CODE_BASELINE || {};

  const state = {
    query: "",
    category: "All",
    favoritesOnly: false,
    jobRuleIds: null,
    jobContext: null,
    jobReasons: {},
    pendingJob: null,
    favorites: new Set(JSON.parse(localStorage.getItem("codeFavorites") || "[]"))
  };

  const els = {
    search: document.getElementById("searchInput"), clear: document.getElementById("clearSearch"),
    chips: document.getElementById("categoryChips"), results: document.getElementById("results"),
    count: document.getElementById("resultCount"), filterLabel: document.getElementById("filterLabel"),
    favoritesOnly: document.getElementById("favoritesOnly"), empty: document.getElementById("emptyState"),
    template: document.getElementById("codeCardTemplate"), installBtn: document.getElementById("installBtn"),
    baselineCodes: document.getElementById("baselineCodes"), baselineDate: document.getElementById("baselineDate"),
    transitionNote: document.getElementById("transitionNote"), stateCodeLink: document.getElementById("stateCodeLink"),
    statuteLink: document.getElementById("statuteLink"), jobForm: document.getElementById("jobForm"),
    jobInput: document.getElementById("jobInput"), jobMessage: document.getElementById("jobMessage"),
    jobResult: document.getElementById("jobResult"), jobResultTitle: document.getElementById("jobResultTitle"),
    jobResultSummary: document.getElementById("jobResultSummary"), jobContext: document.getElementById("jobContext"),
    clearJob: document.getElementById("clearJob"), followupPanel: document.getElementById("followupPanel"),
    followupQuestion: document.getElementById("followupQuestion"), followupOptions: document.getElementById("followupOptions")
  };

  const categories = ["All", ...new Set(entries.map(e => e.category))];
  const normalize = value => String(value || "").toLowerCase().trim();

  function searchableText(entry) {
    return normalize([entry.category, entry.title, entry.summary, entry.codeRef, entry.edition,
      entry.verificationStatus, entry.nhStatus, entry.notes, ...(entry.keyPoints || []), ...(entry.keywords || [])].join(" "));
  }

  function filteredEntries() {
    const q = normalize(state.query);
    return entries.filter(entry => {
      const categoryMatch = state.category === "All" || entry.category === state.category;
      const favoriteMatch = !state.favoritesOnly || state.favorites.has(entry.id);
      const searchMatch = !q || q.split(/\s+/).every(term => searchableText(entry).includes(term));
      const jobMatch = !state.jobRuleIds || state.jobRuleIds.has(entry.id);
      return categoryMatch && favoriteMatch && searchMatch && jobMatch;
    });
  }

  function renderBaseline() {
    els.baselineCodes.textContent = [baseline.building, baseline.plumbing, baseline.electrical].filter(Boolean).join(" · ");
    els.baselineDate.textContent = baseline.effectiveDate ? `Effective ${baseline.effectiveDate}` : "";
    els.transitionNote.textContent = baseline.transition || "";
    if (baseline.stateSource) els.stateCodeLink.href = baseline.stateSource;
    if (baseline.statuteSource) els.statuteLink.href = baseline.statuteSource;
  }

  function renderChips() {
    els.chips.innerHTML = "";
    categories.forEach(category => {
      const button = document.createElement("button");
      button.className = "chip" + (state.category === category ? " active" : "");
      button.textContent = category;
      button.addEventListener("click", () => { state.category = category; renderChips(); renderResults(); });
      els.chips.appendChild(button);
    });
  }

  function makeFlag(text, cls) {
    const span = document.createElement("span"); span.className = `flag ${cls}`; span.textContent = text; return span;
  }

  function diagramMarkup(entry) {
    const diagrams = {
      "struct-joist-holes": `<figure class="diagram-card"><svg viewBox="0 0 320 150"><rect x="30" y="30" width="260" height="90" rx="6" class="d-stroke d-fill-light"></rect><circle cx="160" cy="75" r="24" class="d-stroke d-fill-accent"></circle><text x="160" y="15" text-anchor="middle" class="d-text">Keep hole edge ≥ 2 in. from top</text><text x="160" y="145" text-anchor="middle" class="d-text">Keep hole edge ≥ 2 in. from bottom</text><text x="160" y="80" text-anchor="middle" class="d-text-strong">Hole Ø ≤ 1/3 depth</text></svg><figcaption>Center bored holes and keep the required clearance above and below.</figcaption></figure>`,
      "struct-joist-notches": `<figure class="diagram-card"><svg viewBox="0 0 320 150"><rect x="20" y="55" width="280" height="40" rx="5" class="d-stroke d-fill-light"></rect><line x1="113" y1="40" x2="113" y2="110" class="d-guide"></line><line x1="207" y1="40" x2="207" y2="110" class="d-guide"></line><text x="160" y="28" text-anchor="middle" class="d-text-strong">No notches in middle 1/3</text><text x="160" y="128" text-anchor="middle" class="d-text">Field notch depth ≤ 1/6; end notch ≤ 1/4</text></svg><figcaption>Keep field notches shallow and out of the middle third.</figcaption></figure>`,
      "plumb-fixture-clearance": `<figure class="diagram-card"><svg viewBox="0 0 320 170"><rect x="45" y="18" width="230" height="130" rx="6" class="d-stroke d-fill-light"></rect><rect x="120" y="52" width="80" height="60" rx="26" class="d-stroke d-fill-accent"></rect><text x="103" y="40" text-anchor="middle" class="d-text">15 in. min</text><text x="217" y="40" text-anchor="middle" class="d-text">15 in. min</text><text x="225" y="162" text-anchor="middle" class="d-text-strong">21 in. clear in front</text></svg><figcaption>15 in. from centerline to each side obstruction and 21 in. clear in front.</figcaption></figure>`,
      "stairs-riser": `<figure class="diagram-card"><svg viewBox="0 0 320 170"><polyline points="40,130 110,130 110,95 180,95 180,60 250,60" class="d-stair"></polyline><text x="82" y="110" text-anchor="middle" class="d-text-strong">≤ 7-3/4 in.</text><text x="160" y="152" text-anchor="middle" class="d-text">Max variation: 3/8 in.</text></svg><figcaption>Check maximum riser height and keep the flight uniform.</figcaption></figure>`,
      "guards-height-openings": `<figure class="diagram-card"><svg viewBox="0 0 320 170"><line x1="45" y1="140" x2="275" y2="140" class="d-stroke"></line><line x1="90" y1="40" x2="90" y2="140" class="d-stroke"></line><line x1="140" y1="40" x2="140" y2="140" class="d-stroke"></line><line x1="190" y1="40" x2="190" y2="140" class="d-stroke"></line><line x1="240" y1="40" x2="240" y2="140" class="d-stroke"></line><line x1="70" y1="40" x2="260" y2="40" class="d-stroke"></line><text x="38" y="98" transform="rotate(-90 38 98)" class="d-text-strong">36 in. min</text><circle cx="164" cy="111" r="16" class="d-stroke d-fill-accent"></circle><text x="164" y="115" text-anchor="middle" class="d-text">4 in.</text></svg><figcaption>Typical residential guard height and opening check.</figcaption></figure>`
    };
    return diagrams[entry.id] || "";
  }

  function jobMatches(job, text) {
    const groups = Array.isArray(job.matchGroups) ? job.matchGroups : [];
    return groups.length && groups.every(group => (group || []).some(term => text.includes(normalize(term))));
  }

  function findJob(rawText) {
    const text = normalize(rawText); if (!text) return null;
    const matches = jobs.filter(job => jobMatches(job, text));
    if (!matches.length) return null;
    const priority = { referral: 3, incidental: 2, core: 1 };
    matches.sort((a,b) => (priority[b.scope] || 0) - (priority[a.scope] || 0));
    return matches[0];
  }

  function scopeClass(scope) {
    return scope === "core" ? "scope-core" : scope === "incidental" ? "scope-incidental" : "scope-referral";
  }

  function showFollowup(job, questionIndex = 0) {
    const question = (job.questions || [])[questionIndex];
    if (!question) return finalizeJob(job, job.ruleIds || [], job.ruleReasons || {}, []);
    state.pendingJob = { job, questionIndex, answers: [] };
    els.jobResult.hidden = true; els.jobMessage.hidden = true;
    els.followupPanel.hidden = false; els.followupQuestion.textContent = question.question;
    els.followupOptions.innerHTML = "";
    question.options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "followup-option"; button.textContent = option.label;
      button.addEventListener("click", () => chooseFollowup(option));
      els.followupOptions.appendChild(button);
    });
  }

  function chooseFollowup(option) {
    const pending = state.pendingJob; if (!pending) return;
    pending.answers.push(option.label);
    const reasons = { ...(pending.job.ruleReasons || {}), ...(option.reasons || {}) };
    const nextIndex = pending.questionIndex + 1;
    const next = (pending.job.questions || [])[nextIndex];
    if (next) {
      pending.questionIndex = nextIndex;
      showFollowup(pending.job, nextIndex);
    } else {
      finalizeJob(pending.job, option.ruleIds || pending.job.ruleIds || [], reasons, pending.answers);
    }
  }

  function finalizeJob(job, ruleIds, reasons = {}, answers = []) {
    const ids = new Set((ruleIds || []).filter(id => entries.some(e => e.id === id)));
    state.jobRuleIds = ids; state.jobContext = { job, answers }; state.jobReasons = reasons; state.pendingJob = null;
    state.category = "All"; state.query = ""; els.search.value = "";
    els.followupPanel.hidden = true; els.jobResult.hidden = false;
    els.jobResultTitle.textContent = job.name;
    els.jobResultSummary.textContent = `${ids.size} pertinent code checks selected from the reviewed database.`;
    els.jobContext.innerHTML = "";

    const scope = document.createElement("span"); scope.className = `context-tag ${scopeClass(job.scope)}`; scope.textContent = job.scopeLabel || "Scope check"; els.jobContext.appendChild(scope);
    answers.forEach(answer => { const tag = document.createElement("span"); tag.className = "context-tag"; tag.textContent = answer; els.jobContext.appendChild(tag); });
    if (job.scopeNote) { const note = document.createElement("div"); note.className = `scope-note ${scopeClass(job.scope)}`; note.textContent = job.scopeNote; els.jobContext.appendChild(note); }

    renderChips(); renderResults();
  }

  function activateJob(rawText) {
    const job = findJob(rawText); els.jobMessage.hidden = true;
    if (!job) {
      state.jobRuleIds = null; state.jobContext = null; state.jobReasons = {}; els.jobResult.hidden = true; els.followupPanel.hidden = true;
      els.jobMessage.hidden = false; els.jobMessage.textContent = "I don't recognize that job yet. Try ‘repair deck,’ ‘repair stairs,’ ‘drill a floor joist,’ or ‘replace a toilet.’";
      renderResults(); return;
    }
    if ((job.questions || []).length) showFollowup(job, 0);
    else finalizeJob(job, job.ruleIds || [], job.ruleReasons || {}, []);
  }

  function clearJob() {
    state.jobRuleIds = null; state.jobContext = null; state.jobReasons = {}; state.pendingJob = null;
    els.jobResult.hidden = true; els.followupPanel.hidden = true; els.jobMessage.hidden = true; els.jobInput.value = ""; renderResults();
  }

  function renderResults() {
    const list = filteredEntries(); els.results.innerHTML = "";
    els.count.textContent = `${list.length} ${list.length === 1 ? "rule" : "rules"}`;
    const labels = [];
    if (state.jobRuleIds) labels.push("job checklist"); if (state.category !== "All") labels.push(state.category); if (state.query) labels.push(`“${state.query}”`); if (state.favoritesOnly) labels.push("favorites");
    els.filterLabel.textContent = labels.length ? ` · ${labels.join(" · ")}` : ""; els.empty.hidden = list.length !== 0;

    list.forEach(entry => {
      const node = els.template.content.cloneNode(true); const card = node.querySelector(".code-card");
      node.querySelector(".category-badge").textContent = entry.category; node.querySelector(".rule-title").textContent = entry.title; node.querySelector(".rule-summary").textContent = entry.summary;
      node.querySelector(".code-ref").textContent = entry.codeRef; node.querySelector(".edition").textContent = entry.edition; node.querySelector(".verification-status").textContent = entry.verificationStatus || "Review source"; node.querySelector(".nh-status").textContent = entry.nhStatus || "Check NH overlay"; node.querySelector(".verified").textContent = entry.verifiedDate || "—"; node.querySelector(".notes").textContent = entry.notes || "No additional field notes."; node.querySelector(".keywords").textContent = (entry.keywords || []).join(", ");

      const reason = state.jobRuleIds ? (state.jobReasons[entry.id] || `This rule is part of the reviewed checklist for ${state.jobContext?.job?.name || "this job"}.`) : "";
      const why = node.querySelector(".why-applies"); if (reason) { why.hidden = false; node.querySelector(".why-text").textContent = reason; }

      const keyPoints = node.querySelector(".key-points"); (entry.keyPoints || []).forEach(point => { const div = document.createElement("div"); div.className = "key-point"; div.textContent = point; keyPoints.appendChild(div); });
      const diagramSlot = node.querySelector(".diagram-slot"); const diagram = diagramMarkup(entry); if (diagram) { diagramSlot.hidden = false; diagramSlot.innerHTML = diagram; }

      const flags = node.querySelector(".flags");
      if ((entry.nhStatus || "").toLowerCase().includes("verified")) flags.appendChild(makeFlag("NH-specific overlay verified", "verified")); else flags.appendChild(makeFlag("Check NH overlay", "nh"));
      if (entry.localCheck) flags.appendChild(makeFlag("Permit / AHJ check", "local")); if (entry.licenseCheck) flags.appendChild(makeFlag("Licensing may apply", "license"));

      node.querySelector(".source-link").href = entry.sourceUrl;
      const nhSource = node.querySelector(".nh-source-link"); if (entry.nhSourceUrl && entry.nhSourceUrl !== entry.sourceUrl) nhSource.href = entry.nhSourceUrl; else nhSource.remove();

      const favorite = node.querySelector(".favorite-btn");
      const syncFavorite = () => { const active = state.favorites.has(entry.id); favorite.textContent = active ? "★" : "☆"; favorite.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites"); };
      syncFavorite(); favorite.addEventListener("click", () => { state.favorites.has(entry.id) ? state.favorites.delete(entry.id) : state.favorites.add(entry.id); localStorage.setItem("codeFavorites", JSON.stringify([...state.favorites])); syncFavorite(); if (state.favoritesOnly) renderResults(); });
      card.dataset.id = entry.id; els.results.appendChild(node);
    });
  }

  els.jobForm.addEventListener("submit", e => { e.preventDefault(); activateJob(els.jobInput.value); });
  document.querySelectorAll(".example-job").forEach(button => button.addEventListener("click", () => { els.jobInput.value = button.dataset.jobExample || ""; activateJob(els.jobInput.value); }));
  els.clearJob.addEventListener("click", clearJob);
  els.search.addEventListener("input", e => { state.query = e.target.value; renderResults(); });
  els.clear.addEventListener("click", () => { els.search.value = ""; state.query = ""; els.search.focus(); renderResults(); });
  els.favoritesOnly.addEventListener("change", e => { state.favoritesOnly = e.target.checked; renderResults(); });

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); deferredPrompt = event; els.installBtn.hidden = false; });
  els.installBtn.addEventListener("click", async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; els.installBtn.hidden = true; });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

  renderBaseline(); renderChips(); renderResults();
})();