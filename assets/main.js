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

  // Touch screens have no hover: play the color sweep once the photo is on screen.
  const photo = document.querySelector(".photo");
  if (photo && !matchMedia("(hover: hover)").matches) {
    const po = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => photo.classList.add("color-on"), reduce ? 0 : 700);
      po.disconnect();
    }), { threshold: 0.5 });
    po.observe(photo);
  }

  // Solid header once the page scrolls.
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Footer name: rises into place as the bottom of the page comes into view.
  const mark = document.querySelector(".foot-mark");
  if (mark && !reduce) {
    let raf = 0;
    const place = () => {
      raf = 0;
      // measure the row above the name (it does not move), so the motion never feeds back on itself
      const above = document.querySelector(".foot-row").getBoundingClientRect().bottom;
      const p = Math.min(1, Math.max(0, (innerHeight - above) / (mark.offsetHeight + 48)));
      mark.style.setProperty("--p", p.toFixed(3));
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(place); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    place();
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

})();
