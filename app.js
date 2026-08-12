(() => {
  const entries = Array.isArray(window.CODE_ENTRIES) ? window.CODE_ENTRIES : [];
  const baseline = window.CODE_BASELINE || {};
  const state = {
    query: "",
    category: "All",
    favoritesOnly: false,
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
    statuteLink: document.getElementById("statuteLink")
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
      return categoryMatch && favoriteMatch && searchMatch;
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

  function renderResults() {
    const list = filteredEntries();
    els.results.innerHTML = "";
    els.count.textContent = `${list.length} ${list.length === 1 ? "rule" : "rules"}`;

    const labels = [];
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

      const detailsBtn = node.querySelector(".details-btn");
      const details = node.querySelector(".details");
      detailsBtn.addEventListener("click", () => {
        details.hidden = !details.hidden;
        detailsBtn.textContent = details.hidden ? "Details" : "Hide details";
      });

      card.dataset.id = entry.id;
      els.results.appendChild(node);
    });
  }

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
