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
    favorites: new Set(JSON.parse(localStorage.getItem("codeFavorites") || "[]"))
  };

  const els = {
    search: document.getElementById("searchInput"),
    clear: document.getElementById("clearSearch"),
    chips: document.getElementById("categoryChips"),
    results: document.getElementById("results"),
    count: document.getElementById("resultCount"),
    filterLabel: document.getElementById("filterLabel"),
    favoritesOnly: document.getElementById("favoritesOnly"),
    empty: document.getElementById("emptyState"),
    template: document.getElementById("codeCardTemplate"),
    installBtn: document.getElementById("installBtn"),
    baselineCodes: document.getElementById("baselineCodes"),
    baselineDate: document.getElementById("baselineDate"),
    transitionNote: document.getElementById("transitionNote"),
    stateCodeLink: document.getElementById("stateCodeLink"),
    statuteLink: document.getElementById("statuteLink"),
    jobForm: document.getElementById("jobForm"),
    jobInput: document.getElementById("jobInput"),
    jobMessage: document.getElementById("jobMessage"),
    jobResult: document.getElementById("jobResult"),
    jobResultTitle: document.getElementById("jobResultTitle"),
    jobResultSummary: document.getElementById("jobResultSummary"),
    jobContext: document.getElementById("jobContext"),
    clearJob: document.getElementById("clearJob")
  };

  const categories = ["All", ...new Set(entries.map(e => e.category))];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function searchableText(entry) {
    return normalize([
      entry.category,
      entry.title,
      entry.summary,
      entry.codeRef,
      entry.edition,
      entry.verificationStatus,
      entry.nhStatus,
      entry.notes,
      ...(entry.keyPoints || []),
      ...(entry.keywords || [])
    ].join(" "));
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

  function saveFavorites() {
    localStorage.setItem("codeFavorites", JSON.stringify([...state.favorites]));
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
      button.addEventListener("click", () => {
        state.category = category;
        renderChips();
        renderResults();
      });
      els.chips.appendChild(button);
    });
  }

  function makeFlag(text, cls) {
    const span = document.createElement("span");
    span.className = `flag ${cls}`;
    span.textContent = text;
    return span;
  }

  function diagramMarkup(entry) {
    const diagrams = {
      "struct-joist-holes": `
        <figure class="diagram-card" role="img" aria-label="Bored hole limits in a floor joist">
          <svg viewBox="0 0 320 150" aria-hidden="true">
            <rect x="30" y="30" width="260" height="90" rx="6" class="d-stroke d-fill-light"></rect>
            <circle cx="160" cy="75" r="24" class="d-stroke d-fill-accent"></circle>
            <line x1="160" y1="51" x2="160" y2="99" class="d-guide"></line>
            <text x="160" y="15" text-anchor="middle" class="d-text">Keep hole edge ≥ 2 in. from top</text>
            <text x="160" y="145" text-anchor="middle" class="d-text">Keep hole edge ≥ 2 in. from bottom</text>
            <text x="160" y="80" text-anchor="middle" class="d-text-strong">Hole Ø ≤ 1/3 depth</text>
          </svg>
          <figcaption>Center bored holes and keep the required clearance above and below.</figcaption>
        </figure>`,
      "struct-joist-notches": `
        <figure class="diagram-card" role="img" aria-label="Floor joist notch limits">
          <svg viewBox="0 0 320 150" aria-hidden="true">
            <rect x="20" y="55" width="280" height="40" rx="5" class="d-stroke d-fill-light"></rect>
            <rect x="20" y="55" width="22" height="10" class="d-fill-accent"></rect>
            <rect x="73" y="55" width="18" height="8" class="d-fill-accent"></rect>
            <rect x="230" y="55" width="18" height="8" class="d-fill-accent"></rect>
            <rect x="278" y="55" width="22" height="10" class="d-fill-accent"></rect>
            <line x1="113" y1="40" x2="113" y2="110" class="d-guide"></line>
            <line x1="207" y1="40" x2="207" y2="110" class="d-guide"></line>
            <text x="160" y="28" text-anchor="middle" class="d-text-strong">No notches in middle 1/3</text>
            <text x="160" y="128" text-anchor="middle" class="d-text">Field notch depth ≤ 1/6; end notch ≤ 1/4</text>
          </svg>
          <figcaption>Keep field notches shallow and out of the middle third of the span.</figcaption>
        </figure>`,
      "plumb-fixture-clearance": `
        <figure class="diagram-card" role="img" aria-label="Toilet clearance diagram">
          <svg viewBox="0 0 320 170" aria-hidden="true">
            <rect x="45" y="18" width="230" height="130" rx="6" class="d-stroke d-fill-light"></rect>
            <rect x="120" y="52" width="80" height="60" rx="26" class="d-stroke d-fill-accent"></rect>
            <line x1="160" y1="34" x2="160" y2="130" class="d-guide"></line>
            <text x="103" y="40" text-anchor="middle" class="d-text">15 in. min</text>
            <text x="217" y="40" text-anchor="middle" class="d-text">15 in. min</text>
            <text x="225" y="162" text-anchor="middle" class="d-text-strong">21 in. clear in front</text>
          </svg>
          <figcaption>Fast visual: 15 in. from centerline to each side obstruction and 21 in. clear in front.</figcaption>
        </figure>`,
      "stairs-riser": `
        <figure class="diagram-card" role="img" aria-label="Stair riser diagram">
          <svg viewBox="0 0 320 170" aria-hidden="true">
            <polyline points="40,130 110,130 110,95 180,95 180,60 250,60" class="d-stair"></polyline>
            <line x1="110" y1="130" x2="110" y2="95" class="d-guide"></line>
            <text x="82" y="110" text-anchor="middle" class="d-text-strong">≤ 7-3/4 in.</text>
            <text x="160" y="152" text-anchor="middle" class="d-text">Max variation within flight: 3/8 in.</text>
          </svg>
          <figcaption>Check maximum riser height and keep the flight uniform.</figcaption>
        </figure>`,
      "guards-height-openings": `
        <figure class="diagram-card" role="img" aria-label="Guard height and opening diagram">
          <svg viewBox="0 0 320 170" aria-hidden="true">
            <line x1="45" y1="140" x2="275" y2="140" class="d-stroke"></line>
            <line x1="90" y1="40" x2="90" y2="140" class="d-stroke"></line>
            <line x1="140" y1="40" x2="140" y2="140" class="d-stroke"></line>
            <line x1="190" y1="40" x2="190" y2="140" class="d-stroke"></line>
            <line x1="240" y1="40" x2="240" y2="140" class="d-stroke"></line>
            <line x1="70" y1="40" x2="260" y2="40" class="d-stroke"></line>
            <text x="38" y="98" transform="rotate(-90 38 98)" class="d-text-strong">36 in. min</text>
            <circle cx="164" cy="111" r="16" class="d-stroke d-fill-accent"></circle>
            <text x="164" y="115" text-anchor="middle" class="d-text">4 in.</text>
          </svg>
          <figcaption>Typical residential guard height and opening check.</figcaption>
        </figure>`,
      "elec-receptacle-spacing": `
        <figure class="diagram-card" role="img" aria-label="General receptacle spacing diagram">
          <svg viewBox="0 0 320 150" aria-hidden="true">
            <line x1="30" y1="90" x2="290" y2="90" class="d-stroke"></line>
            <rect x="80" y="66" width="20" height="24" rx="4" class="d-stroke d-fill-accent"></rect>
            <rect x="220" y="66" width="20" height="24" rx="4" class="d-stroke d-fill-accent"></rect>
            <text x="160" y="30" text-anchor="middle" class="d-text-strong">No point along wall line > 6 ft from a receptacle</text>
            <text x="160" y="135" text-anchor="middle" class="d-text">Often means up to ~12 ft between receptacles</text>
          </svg>
          <figcaption>Use the 6-ft reach rule when laying out ordinary dwelling wall receptacles.</figcaption>
        </figure>`
    };
    return diagrams[entry.id] || "";
  }

  function findJobIntent(rawText) {
    const text = normalize(rawText);
    if (!text) return null;

    for (const job of jobs) {
      const mentionsReceptacle = ["outlet", "receptacle", "plug"].some(word => text.includes(word));
      const jobAliasMatch = (job.aliases || []).some(alias => text.includes(normalize(alias)));
      if (!mentionsReceptacle && !jobAliasMatch) continue;

      let location = null;
      for (const [locationId, aliases] of Object.entries(job.locations || {})) {
        if ((aliases || []).some(alias => text.includes(normalize(alias)))) {
          location = locationId;
          break;
        }
      }

      let variant = null;
      for (const [variantId, aliases] of Object.entries(job.variants || {})) {
        if ((aliases || []).some(alias => text.includes(normalize(alias)))) {
          variant = variantId;
          break;
        }
      }

      return { job, location, variant };
    }
    return null;
  }

  function activateJob(rawText) {
    const intent = findJobIntent(rawText);
    els.jobMessage.hidden = true;

    if (!intent) {
      state.jobRuleIds = null;
      state.jobContext = null;
      els.jobResult.hidden = true;
      els.jobMessage.hidden = false;
      els.jobMessage.textContent = "I don't recognize that job yet. The first supported workflow is installing or replacing a bathroom outlet/receptacle.";
      renderResults();
      return;
    }

    if (!intent.location) {
      state.jobRuleIds = null;
      state.jobContext = null;
      els.jobResult.hidden = true;
      els.jobMessage.hidden = false;
      els.jobMessage.textContent = "I recognized a receptacle job. Add the room/location for now — for example: ‘install an outlet in the bathroom.’";
      renderResults();
      return;
    }

    const ruleSet = intent.job.rules?.[intent.location];
    if (!ruleSet) {
      state.jobRuleIds = null;
      state.jobContext = null;
      els.jobResult.hidden = true;
      els.jobMessage.hidden = false;
      els.jobMessage.textContent = `I recognized the job and location, but ${intent.location} is not wired into the checklist yet.`;
      renderResults();
      return;
    }

    const ids = new Set(ruleSet.always || []);
    if (intent.variant && ruleSet.conditional?.[intent.variant]) {
      ruleSet.conditional[intent.variant].forEach(id => ids.add(id));
    }

    state.jobRuleIds = ids;
    state.jobContext = intent;
    state.category = "All";
    state.query = "";
    els.search.value = "";

    const variantLabel = intent.variant === "replace" ? "Replace" : "Install";
    const locationLabel = intent.location.charAt(0).toUpperCase() + intent.location.slice(1);
    els.jobResultTitle.textContent = `${variantLabel} receptacle · ${locationLabel}`;
    els.jobResultSummary.textContent = `${ids.size} code checks selected from the reviewed database.`;
    els.jobContext.innerHTML = "";

    const tags = [
      `Work: ${variantLabel.toLowerCase()} receptacle`,
      `Location: ${locationLabel}`,
      "Occupancy: dwelling"
    ];
    tags.forEach(text => {
      const span = document.createElement("span");
      span.className = "context-tag";
      span.textContent = text;
      els.jobContext.appendChild(span);
    });

    els.jobResult.hidden = false;
    renderChips();
    renderResults();
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearJob() {
    state.jobRuleIds = null;
    state.jobContext = null;
    els.jobResult.hidden = true;
    els.jobMessage.hidden = true;
    els.jobInput.value = "";
    renderResults();
  }

  function renderResults() {
    const list = filteredEntries();
    els.results.innerHTML = "";
    els.count.textContent = `${list.length} ${list.length === 1 ? "rule" : "rules"}`;

    const labels = [];
    if (state.jobRuleIds) labels.push("job checklist");
    if (state.category !== "All") labels.push(state.category);
    if (state.query) labels.push(`“${state.query}”`);
    if (state.favoritesOnly) labels.push("favorites");
    els.filterLabel.textContent = labels.length ? ` · ${labels.join(" · ")}` : "";
    els.empty.hidden = list.length !== 0;

    list.forEach(entry => {
      const node = els.template.content.cloneNode(true);
      const card = node.querySelector(".code-card");
      node.querySelector(".category-badge").textContent = entry.category;
      node.querySelector(".rule-title").textContent = entry.title;
      node.querySelector(".rule-summary").textContent = entry.summary;
      node.querySelector(".code-ref").textContent = entry.codeRef;
      node.querySelector(".edition").textContent = entry.edition;
      node.querySelector(".verification-status").textContent = entry.verificationStatus || "Review source";
      node.querySelector(".nh-status").textContent = entry.nhStatus || "Check NH overlay";
      node.querySelector(".verified").textContent = entry.verifiedDate || "—";
      node.querySelector(".notes").textContent = entry.notes || "No additional field notes.";
      node.querySelector(".keywords").textContent = (entry.keywords || []).join(", ");

      const keyPoints = node.querySelector(".key-points");
      (entry.keyPoints || []).forEach(point => {
        const div = document.createElement("div");
        div.className = "key-point";
        div.textContent = point;
        keyPoints.appendChild(div);
      });

      const diagramSlot = node.querySelector(".diagram-slot");
      const diagram = diagramMarkup(entry);
      if (diagram) {
        diagramSlot.hidden = false;
        diagramSlot.innerHTML = diagram;
      }

      const flags = node.querySelector(".flags");
      if ((entry.nhStatus || "").toLowerCase().includes("verified")) {
        flags.appendChild(makeFlag("NH-specific overlay verified", "verified"));
      } else {
        flags.appendChild(makeFlag("Check NH overlay", "nh"));
      }
      if (entry.localCheck) flags.appendChild(makeFlag("Permit / AHJ check", "local"));
      if (entry.licenseCheck) flags.appendChild(makeFlag("Licensing may apply", "license"));

      const source = node.querySelector(".source-link");
      source.href = entry.sourceUrl;

      const nhSource = node.querySelector(".nh-source-link");
      if (entry.nhSourceUrl && entry.nhSourceUrl !== entry.sourceUrl) {
        nhSource.href = entry.nhSourceUrl;
      } else {
        nhSource.remove();
      }

      const favorite = node.querySelector(".favorite-btn");
      const syncFavorite = () => {
        const active = state.favorites.has(entry.id);
        favorite.textContent = active ? "★" : "☆";
        favorite.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites");
      };
      syncFavorite();
      favorite.addEventListener("click", () => {
        if (state.favorites.has(entry.id)) state.favorites.delete(entry.id);
        else state.favorites.add(entry.id);
        saveFavorites();
        syncFavorite();
        if (state.favoritesOnly) renderResults();
      });

      card.dataset.id = entry.id;
      els.results.appendChild(node);
    });
  }

  els.jobForm.addEventListener("submit", event => {
    event.preventDefault();
    activateJob(els.jobInput.value);
  });

  document.querySelectorAll(".example-job").forEach(button => {
    button.addEventListener("click", () => {
      els.jobInput.value = button.dataset.jobExample || "";
      activateJob(els.jobInput.value);
    });
  });

  els.clearJob.addEventListener("click", clearJob);

  els.search.addEventListener("input", e => {
    state.query = e.target.value;
    renderResults();
  });

  els.clear.addEventListener("click", () => {
    els.search.value = "";
    state.query = "";
    els.search.focus();
    renderResults();
  });

  els.favoritesOnly.addEventListener("change", e => {
    state.favoritesOnly = e.target.checked;
    renderResults();
  });

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    els.installBtn.hidden = false;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    els.installBtn.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  renderBaseline();
  renderChips();
  renderResults();
})();
