function mitraanshAppInit() {
  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.querySelector(".form-success");

  function setActiveNav(name) {
    if (!nav) return;
    nav.querySelectorAll(".nav__link[data-nav], .header__cta[data-nav]").forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.nav === name);
    });
  }

  function initNavHighlight() {
    const page = document.body.dataset.page;
    if (!page || !nav) return;

    if (page === "about") {
      setActiveNav("about");
      return;
    }
    if (page === "contact") {
      setActiveNav("contact");
      return;
    }
    if (page === "kota" || page === "jaipur" || page === "navi-mumbai") {
      setActiveNav(page === "navi-mumbai" ? "navi-mumbai" : "rajasthan");
      return;
    }
    if (page === "riyasat-bliss" || page === "riyasat-sankalp" || page === "sankalp-meadows") {
      setActiveNav("navi-mumbai");
      return;
    }
    if (page !== "home") return;

    const sections = document.querySelectorAll("[data-section]");
    const hashToNav = {
      "#projects": "projects",
      "#about": "home",
      "#why-us": "home",
      "#services": "home",
      "#home": "home",
    };

    function updateFromHash() {
      const navName = hashToNav[window.location.hash];
      if (navName) setActiveNav(navName);
    }

    if (window.location.hash) {
      updateFromHash();
    } else {
      setActiveNav("home");
    }

    window.addEventListener("hashchange", updateFromHash);

    nav.querySelectorAll('.nav__link[href*="#"]').forEach(function (link) {
      link.addEventListener("click", function () {
        const hash = new URL(link.href, window.location.href).hash;
        const navName = hashToNav[hash] || (hash === "#projects" ? "projects" : null);
        if (navName) setActiveNav(navName);
      });
    });

    if (sections.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          if (window.location.hash && hashToNav[window.location.hash]) return;

          const visible = entries
            .filter(function (e) { return e.isIntersecting; })
            .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

          if (visible[0]) {
            setActiveNav(visible[0].target.dataset.section);
          }
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

  initNavHighlight();

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function bindNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    const backdrop = document.getElementById("nav-backdrop");
    if (!navToggle || !nav) return;

    function setMenuOpen(open) {
      navToggle.classList.toggle("is-active", open);
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
      if (backdrop) {
        backdrop.classList.toggle("is-visible", open);
        backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      }
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    navToggle.addEventListener("click", function () {
      setMenuOpen(!nav.classList.contains("is-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeMenu);
    }

    nav.querySelectorAll(".nav__link, .nav__dropdown-menu a, .header__cta").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    nav.querySelectorAll(".nav__item--dropdown > .nav__link").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        if (window.innerWidth <= 768 && nav.classList.contains("is-open")) {
          var submenu = trigger.parentElement.querySelector(".nav__dropdown-menu");
          if (submenu && !submenu.contains(e.target)) {
            trigger.parentElement.classList.toggle("is-open");
          }
        }
      });
    });

    if (window.matchMedia("(min-width: 769px)").matches) {
      nav.querySelectorAll(".nav__item--dropdown").forEach(function (item) {
        var closeTimer;

        item.addEventListener("mouseenter", function () {
          clearTimeout(closeTimer);
          item.classList.add("is-open");
        });

        item.addEventListener("mouseleave", function () {
          closeTimer = setTimeout(function () {
            item.classList.remove("is-open");
          }, 250);
        });
      });
    }
  }

  bindNav();

  function scrollToProjects() {
    var hash = window.location.hash;
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;

    var scroll = function () {
      var header = document.querySelector(".header");
      var offset = header ? header.offsetHeight + 20 : 92;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    };

    requestAnimationFrame(function () {
      requestAnimationFrame(scroll);
    });
  }

  scrollToProjects();
  window.addEventListener("hashchange", scrollToProjects);

  const urlProject = new URLSearchParams(window.location.search).get("project");
  if (urlProject && contactForm) {
    const interest = contactForm.querySelector('[name="interest"]');
    const decoded = decodeURIComponent(urlProject.replace(/\+/g, " "));
    if (interest) {
      const opts = interest.querySelectorAll("option");
      for (let i = 0; i < opts.length; i++) {
        if (opts[i].value === decoded) {
          interest.value = decoded;
          break;
        }
      }
      if (!interest.value) {
        const opt = document.createElement("option");
        opt.value = decoded;
        opt.textContent = decoded;
        opt.selected = true;
        interest.insertBefore(opt, interest.firstChild.nextSibling);
        interest.value = decoded;
      }
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const first = contactForm.querySelector('[name="first_name"]').value.trim();
      const last = contactForm.querySelector('[name="last_name"]').value.trim();
      const phone = contactForm.querySelector('[name="phone"]').value.trim();
      const email = contactForm.querySelector('[name="email"]')?.value.trim() || "";
      const interest = contactForm.querySelector('[name="interest"]')?.value.trim() || "";
      const message = contactForm.querySelector('[name="message"]')?.value.trim() || "";

      const text = encodeURIComponent(
        "Hello Mitraansh Realty,\n\n" +
          "Name: " + first + " " + last + "\n" +
          "Phone: " + phone +
          (email ? "\nEmail: " + email : "") +
          (interest ? "\nInterest: " + interest : "") +
          (message ? "\n\nMessage: " + message : "")
      );

      const waNumber = contactForm.dataset.whatsapp || "918618265104";
      window.open("https://wa.me/" + waNumber + "?text=" + text, "_blank");

      contactForm.classList.add("is-hidden");
      if (formSuccess) formSuccess.classList.add("is-visible");
    });
  }
}

document.addEventListener("DOMContentLoaded", mitraanshAppInit);
