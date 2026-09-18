(() => {
  const dataEl = document.getElementById("case-data");
  const CASES = dataEl ? JSON.parse(dataEl.textContent) : [];

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const fmt = (sec) => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const esc = (s) => String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const decorate = (text) => esc(text)
    .replace(/&lt;char(\d+)&gt;/g, '<span class="char-ref" data-n="$1">&lt;char$1&gt;</span>');

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroEl = $(".hero");
  const heroVideos = $$(".hero-bg video");
  const heroInView = () => {
    if (!heroEl) return false;
    const r = heroEl.getBoundingClientRect();
    return r.bottom > 80 && r.top < innerHeight;
  };
  const pauseHero = () => heroVideos.forEach((v) => v.pause());
  const playHero = () => {
    if (reduceMotion || !heroInView()) return;
    heroVideos.forEach((v) => { v.play().catch(() => {}); });
  };
  if (reduceMotion) {
    pauseHero();
    heroVideos.forEach((v) => v.removeAttribute("autoplay"));
  } else {
    playHero();
    if (heroEl && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        const on = entries.some((e) => e.isIntersecting);
        if (on) playHero();
        else pauseHero();
      }, { threshold: 0.12 });
      io.observe(heroEl);
    }
  }

  const demoStat = $("#demo-stat");
  if (demoStat && CASES.length) {
    const avg = CASES.reduce((s, c) => s + c.duration, 0) / CASES.length;
    demoStat.textContent = `${CASES.length} clips · ~${Math.round(avg)}s each`;
  }

  const gallery = $("#gallery-grid");
  if (gallery) {
    gallery.innerHTML = CASES.map((c) => `
      <a class="g-card" href="#case-${c.out}">
        <img src="${c.poster}" alt="${esc(c.title)}" />
        <div class="g-meta">
          <div class="g-no">${c.out}</div>
          <div class="g-title">${esc(c.title)}</div>
        </div>
      </a>
    `).join("");
  }

  const casesRoot = $("#cases");
  if (casesRoot) {
    casesRoot.innerHTML = CASES.map((c, idx) => {
      const n = String(idx + 1).padStart(2, "0");
      const chips = c.characters.map((ch) =>
        `<span class="pill c${ch.n}">&lt;char${ch.n}&gt; ${esc(ch.label)}</span>`
      ).join("");
      const tags = [
        `${c.n_shots} shots`,
        `${c.n_chars} characters`,
        c.language,
        c.setting,
        `${fmt(c.duration)}`,
        c.resolution,
      ].map((t) => `<span class="tag">${esc(t)}</span>`).join("");

      const chars = c.characters.map((ch) => `
        <article class="char c${ch.n}">
          <div class="who"><span class="pill">&lt;char${ch.n}&gt;</span></div>
          <p>${decorate(ch.text)}</p>
        </article>
      `).join("");

      const shots = c.shots.map((sh) => {
        const quotes = (sh.quotes || []).map((q) => `<q>${esc(q)}</q>`).join("");
        return `
          <article class="shot collapsed" data-start="${sh.start}" data-end="${sh.end}" data-shot="${sh.n}">
            <div class="shot-h">
              <b>Shot ${sh.n}</b>
              <span>${fmt(sh.start)} – ${fmt(sh.end)}</span>
            </div>
            <p>${decorate(sh.text)}</p>
            ${quotes ? `<div class="quotes">${quotes}</div>` : ""}
            <button class="more" type="button">Show full shot</button>
          </article>
        `;
      }).join("");

      const dlg = c.shots.flatMap((sh) => (sh.quotes || []).map((q) => ({
        start: sh.start, n: sh.n, q,
      }))).map((d) => `
        <div class="dlg-item">
          <time>${fmt(d.start)} · S${d.n}</time>
          <div class="line"><q>${esc(d.q)}</q><span class="from">Shot ${d.n}</span></div>
        </div>
      `).join("") || `<p class="logline">No quoted lines parsed for this case.</p>`;

      const ruler = c.shots.map((sh) =>
        `<button type="button" data-start="${sh.start}" data-end="${sh.end}" data-shot="${sh.n}" style="flex:${(sh.end - sh.start).toFixed(2)} 1 0" title="Shot ${sh.n}">S${sh.n}</button>`
      ).join("");

      return `
        <section class="case" id="case-${c.out}">
          <div class="wrap">
            <div class="case-top">
              <div>
                <div class="case-kicker">Case ${c.out} · ${n} / ${String(CASES.length).padStart(2, "0")}</div>
                <h3>${esc(c.title)}</h3>
                <p class="logline">${esc(c.logline)}</p>
                <div class="char-pills">${chips}</div>
              </div>
              <div class="case-tags">${tags}</div>
            </div>
            <div class="stage">
              <div class="player-col">
                <div class="film">
                  <video
                    id="vid-${c.out}"
                    poster="${c.poster}"
                    controls
                    preload="metadata"
                    playsinline
                    controlslist="nodownload"
                  >
                    <source src="${c.video}" type="video/mp4" />
                  </video>
                  <div class="ruler" data-case="${c.out}">${ruler}</div>
                  <div class="player-hint">
                    <span>Click a shot — or the filmstrip — to jump the cut.</span>
                    <span>Audio on · 24 fps</span>
                  </div>
                </div>
              </div>
              <div class="prompt-col" data-case="${c.out}">
                <div class="prompt-label">Structured prompt</div>
                <div class="tabs">
                  <button class="tab on" data-tab="shots">Shots</button>
                  <button class="tab" data-tab="chars">Characters</button>
                  <button class="tab" data-tab="dlg">Dialogue</button>
                  <button class="tab" data-tab="raw">Raw prompt</button>
                </div>
                <div class="pane on" data-pane="shots">
                  <div class="pane-tools"><button type="button" class="expand-all">Expand all shots</button></div>
                  ${shots}
                </div>
                <div class="pane" data-pane="chars">${chars}</div>
                <div class="pane dlg" data-pane="dlg">${dlg}</div>
                <div class="pane" data-pane="raw">
                  <div class="copy-row"><button type="button" class="copy-prompt">Copy prompt</button></div>
                  <pre class="raw">${esc(c.prompt)}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }).join("");
  }

  $$(".prompt-col").forEach((col) => {
    col.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      $$(".tab", col).forEach((t) => t.classList.toggle("on", t === tab));
      $$(".pane", col).forEach((p) => p.classList.toggle("on", p.dataset.pane === tab.dataset.tab));
    });
  });

  const flashCopied = (btn, label) => {
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = label; }, 1200);
  };

  $$(".copy-prompt").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pre = btn.closest(".pane").querySelector(".raw");
      try {
        await navigator.clipboard.writeText(pre.textContent);
        flashCopied(btn, "Copy prompt");
      } catch {
        btn.textContent = "Select to copy";
      }
    });
  });

  const copyBib = $("#copy-bib");
  if (copyBib) {
    copyBib.addEventListener("click", async () => {
      const pre = $("#bibtex-block");
      try {
        await navigator.clipboard.writeText(pre.textContent);
        flashCopied(copyBib, "Copy BibTeX");
      } catch {
        copyBib.textContent = "Select to copy";
      }
    });
  }

  const setActiveShot = (caseId, t) => {
    const caseEl = document.getElementById(`case-${caseId}`);
    if (!caseEl) return;
    $$(".shot", caseEl).forEach((sh) => {
      const on = t >= +sh.dataset.start && t < +sh.dataset.end - 0.01;
      sh.classList.toggle("on", on);
    });
    $$(".ruler button", caseEl).forEach((b) => {
      const on = t >= +b.dataset.start && t < +b.dataset.end - 0.01;
      b.classList.toggle("on", on);
    });
  };

  const seek = (caseId, t) => {
    const v = document.getElementById(`vid-${caseId}`);
    if (!v) return;
    v.currentTime = t;
    setActiveShot(caseId, t + 0.05);
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  CASES.forEach((c) => {
    const v = document.getElementById(`vid-${c.out}`);
    if (!v) return;
    v.addEventListener("play", () => {
      $$(".film video").forEach((other) => { if (other !== v) other.pause(); });
      pauseHero();
    });
    v.addEventListener("pause", () => {
      const anyPlaying = $$(".film video").some((x) => !x.paused && !x.ended);
      if (!anyPlaying) playHero();
    });
    v.addEventListener("timeupdate", () => setActiveShot(c.out, v.currentTime));
  });

  document.addEventListener("click", (e) => {
    const more = e.target.closest(".shot .more");
    if (more) {
      e.stopPropagation();
      const shot = more.closest(".shot");
      const open = shot.classList.toggle("collapsed") === false;
      more.textContent = open ? "Collapse" : "Show full shot";
      return;
    }
    const exp = e.target.closest(".expand-all");
    if (exp) {
      const pane = exp.closest(".pane");
      const shots = $$(".shot", pane);
      const opening = shots.some((s) => s.classList.contains("collapsed"));
      shots.forEach((s) => {
        s.classList.toggle("collapsed", !opening);
        const b = $(".more", s);
        if (b) b.textContent = opening ? "Collapse" : "Show full shot";
      });
      exp.textContent = opening ? "Collapse all shots" : "Expand all shots";
      return;
    }
    const shot = e.target.closest(".shot");
    const mark = e.target.closest(".ruler button");
    const el = shot || mark;
    if (!el) return;
    const caseEl = el.closest(".case");
    const id = caseEl.id.replace("case-", "");
    seek(id, +el.dataset.start);
  });

  const header = $("header.nav");
  const toggle = $(".nav-toggle");
  if (toggle && header) {
    const setMenu = (open) => {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => {
      setMenu(!header.classList.contains("is-open"));
    });
    $$(".nav-links a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
  }

  const navLinks = $$(".nav-links a[data-section]");
  const watched = navLinks
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);
  if (watched.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((a) => {
        a.classList.toggle("is-active", a.dataset.section === visible.target.id);
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] });
    watched.forEach((el) => io.observe(el));
  }
})();
