(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Name: split each line into letters that rise one after another.
  const name = document.querySelector(".name");
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

  // Fade sections in as they enter the viewport.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el, n) => {
    if (el.closest(".projects")) el.style.transitionDelay = `${(n % 5) * 70}ms`;
    io.observe(el);
  });
  // hero copy comes in after the name
  setTimeout(() => document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("in")), reduce ? 0 : 650);

  // Solid header once the page scrolls.
  const top = document.querySelector(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Live time in Yaoundé.
  const clock = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Douala", hour: "2-digit", minute: "2-digit" });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);

  document.getElementById("year").textContent = new Date().getFullYear();

  // The call-to-action leans gently toward the pointer.
  const cta = document.querySelector(".cta");
  if (cta && !reduce && matchMedia("(pointer: fine)").matches) {
    cta.addEventListener("pointermove", (e) => {
      const r = cta.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      cta.style.transform = `translate(${x}px, ${y}px)`;
    });
    cta.addEventListener("pointerleave", () => (cta.style.transform = ""));
  }
})();
