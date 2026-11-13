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

})();
