(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmtDate = (d) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Name: letters rise one after another.
  const name = $(".name");
  if (name) {
    let i = 0;
    name.querySelectorAll("[data-split]").forEach((line) => {
      const caret = line.querySelector(".caret");
      const text = line.firstChild.textContent;
      line.firstChild.remove();
      const frag = document.createDocumentFragment();
      for (const c of text) {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        s.style.transitionDelay = `${120 + i++ * 38}ms`;
        frag.append(s);
      }
      line.insertBefore(frag, caret || null);
      line.setAttribute("aria-hidden", "true");
    });
    requestAnimationFrame(() => requestAnimationFrame(() => name.classList.add("go")));
  }

  // Fade blocks in as they enter the viewport.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );
  const watch = (root = document) => root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  watch();
  setTimeout(() => document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("in")), reduce ? 0 : 650);

  // Solid header once the page scrolls.
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Posts list (home page). Posts are declared in /posts/index.json.
  const list = document.getElementById("post-list");
  if (list) {
    fetch("/posts/index.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .then((posts) => {
        posts = posts.filter((p) => p && p.slug && p.title).sort((a, b) => String(b.date).localeCompare(String(a.date)));
        if (!posts.length) return;
        list.textContent = "";
        for (const p of posts) {
          const li = document.createElement("li");
          li.className = "reveal";
          const a = document.createElement("a");
          a.href = `/post.html?p=${encodeURIComponent(p.slug)}`;
          const date = document.createElement("span");
          date.className = "when";
          date.textContent = p.date ? fmtDate(p.date) : "";
          const title = document.createElement("span");
          title.className = "post-title";
          title.textContent = p.title;
          a.append(date, title);
          if (p.summary) {
            const sum = document.createElement("span");
            sum.className = "post-sum";
            sum.textContent = p.summary;
            a.append(sum);
          }
          li.append(a);
          list.append(li);
        }
        watch(list);
      })
      .catch(() => {});
  }

  // Single post page: /post.html?p=<slug> renders /posts/<slug>.md
  const article = document.getElementById("article");
  if (article) {
    const slug = new URLSearchParams(location.search).get("p") || "";
    const titleEl = document.getElementById("post-title");
    const notFound = () => {
      titleEl.textContent = "Post not found";
      document.title = "Post not found | Toscani MODJOU TENEKEU";
    };
    if (!/^[a-z0-9-]+$/.test(slug)) return notFound();
    Promise.all([
      fetch("/posts/index.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/posts/${slug}.md`, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : null)),
    ])
      .then(([posts, md]) => {
        const meta = posts.find((p) => p.slug === slug);
        if (!meta || md == null) return notFound();
        titleEl.textContent = meta.title;
        document.title = `${meta.title} | Toscani MODJOU TENEKEU`;
        document.getElementById("post-date").textContent = meta.date ? fmtDate(meta.date) : "";
        const body = document.getElementById("post-body");
        body.innerHTML = window.marked ? window.marked.parse(md) : md.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
        body.querySelectorAll('a[href^="http"]').forEach((a) => {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        });
      })
      .catch(notFound);
  }
})();
