const body = document.body;
const revealItems = [...document.querySelectorAll(".reveal")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = [...document.querySelectorAll("main section[id], main section")];
const trackedSections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.querySelector(".scroll-progress-bar");
const parallaxLayers = [...document.querySelectorAll(".parallax-layer")];
const interactiveCards = [
  ...document.querySelectorAll(
    ".hero-facts li, .content-card, .metric-card, .timeline-item, .project-card, .education-card, .skill-panel, .contact-card"
  ),
];
const tiltCard = document.querySelector(".tilt-card");

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-order", `${index}`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -24px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const setActiveNav = () => {
  let currentSection = null;

  trackedSections.forEach((section) => {
    const top = section.getBoundingClientRect().top;
    if (top <= 160) {
      currentSection = section;
    }
  });

  navLinks.forEach((link) => {
    const isActive = currentSection && link.getAttribute("href") === `#${currentSection.id}`;
    link.classList.toggle("is-active", Boolean(isActive));
  });
};

const setScrollProgress = () => {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  progressBar.style.width = `${progress}%`;
};

const updateParallax = () => {
  const viewportCenter = window.innerHeight / 2;

  parallaxLayers.forEach((layer) => {
    const speed = Number(layer.dataset.parallaxSpeed || 0.1);
    const rect = layer.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - viewportCenter) * speed * -0.16;
    layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });
};

const updateOnScroll = () => {
  setActiveNav();
  setScrollProgress();
  updateParallax();
};

let ticking = false;

const requestTick = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateOnScroll();
      ticking = false;
    });
    ticking = true;
  }
};

interactiveCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
  });
});

if (tiltCard) {
  const resetTilt = () => {
    tiltCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 10;

    tiltCard.style.setProperty("--mouse-x", `${px * 100}%`);
    tiltCard.style.setProperty("--mouse-y", `${py * 100}%`);
    tiltCard.style.transform =
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.01)`;
  });

  tiltCard.addEventListener("pointerleave", resetTilt);
}

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);

window.addEventListener("load", () => {
  body.classList.remove("is-loading");
  updateOnScroll();
});
