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
    if (page && page.indexOf("jaipur-") === 0) {
      setActiveNav("rajasthan");
      return;
    }
    if (page && page.indexOf("kota-") === 0) {
      setActiveNav("rajasthan");
      return;
    }
    if (
      page === "riyasat-royalcrest" ||
      page === "riyasat-bliss" ||
      page === "riyasat-sankalp" ||
      page === "sankalp-meadows"
    ) {
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

  initProjectGalleries();

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

function initProjectGalleries() {
  var galleries = document.querySelectorAll(".project-gallery");
  if (!galleries.length) return;

  var lightbox = document.getElementById("gallery-lightbox");
  if (lightbox && !lightbox.querySelector(".gallery-lightbox__stage .gallery-lightbox__prev")) {
    lightbox.remove();
    lightbox = null;
  }
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "gallery-lightbox";
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Project photo gallery");
    lightbox.innerHTML =
      '<div class="gallery-lightbox__backdrop" data-gallery-close></div>' +
      '<button type="button" class="gallery-lightbox__close" aria-label="Close gallery">&times;</button>' +
      '<div class="gallery-lightbox__dialog">' +
      '  <div class="gallery-lightbox__stage">' +
      '    <button type="button" class="gallery-lightbox__prev" aria-label="Previous photo">&#8249;</button>' +
      '    <img class="gallery-lightbox__img" src="" alt="">' +
      '    <button type="button" class="gallery-lightbox__next" aria-label="Next photo">&#8250;</button>' +
      "  </div>" +
      '  <div class="gallery-lightbox__meta">' +
      '    <span class="gallery-lightbox__counter"></span>' +
      '    <span class="gallery-lightbox__caption"></span>' +
      "  </div>" +
      '  <div class="gallery-lightbox__thumbs" role="tablist" aria-label="Gallery thumbnails"></div>' +
      "</div>";
    document.body.appendChild(lightbox);
  }

  var lbImg = lightbox.querySelector(".gallery-lightbox__img");
  var lbCounter = lightbox.querySelector(".gallery-lightbox__counter");
  var lbCaption = lightbox.querySelector(".gallery-lightbox__caption");
  var lbThumbs = lightbox.querySelector(".gallery-lightbox__thumbs");
  var btnPrev = lightbox.querySelector(".gallery-lightbox__prev");
  var btnNext = lightbox.querySelector(".gallery-lightbox__next");
  var btnClose = lightbox.querySelector(".gallery-lightbox__close");
  var slides = [];
  var index = 0;
  var touchStartX = 0;

  function wrapGalleryItem(img) {
    if (img.closest(".project-gallery__item")) return img.closest(".project-gallery__item");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-gallery__item";
    btn.setAttribute("aria-label", "View " + (img.alt || "photo") + " in fullscreen");
    img.parentNode.insertBefore(btn, img);
    btn.appendChild(img);
    return btn;
  }

  galleries.forEach(function (gallery) {
    if (gallery.dataset.galleryReady) return;
    gallery.dataset.galleryReady = "1";

    var heading = gallery.previousElementSibling;
    if (heading && heading.classList.contains("section__title")) {
      var hint = document.createElement("p");
      hint.className = "project-gallery__hint";
      hint.textContent = "Click any photo to open the slideshow";
      gallery.parentNode.insertBefore(hint, gallery);
    }

    gallery.querySelectorAll("img").forEach(function (img) {
      var item = wrapGalleryItem(img);
      item.addEventListener("click", function () {
        openLightbox(collectSlides(gallery), slideIndex(gallery, img));
      });
    });
  });

  function collectSlides(gallery) {
    return Array.prototype.map.call(gallery.querySelectorAll("img"), function (img) {
      return { src: img.src, alt: img.alt || "" };
    });
  }

  function slideIndex(gallery, img) {
    var imgs = gallery.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i] === img) return i;
    }
    return 0;
  }

  function renderThumbs() {
    lbThumbs.innerHTML = "";
    slides.forEach(function (slide, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-lightbox__thumb" + (i === index ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
      btn.setAttribute("aria-label", "Photo " + (i + 1));
      btn.innerHTML = '<img src="' + slide.src + '" alt="">';
      btn.addEventListener("click", function () {
        goTo(i);
      });
      lbThumbs.appendChild(btn);
    });
  }

  function updateSlide() {
    var slide = slides[index];
    if (!slide) return;

    lbImg.classList.add("is-changing");
    lbImg.onload = function () {
      lbImg.classList.remove("is-changing");
    };
    lbImg.src = slide.src;
    lbImg.alt = slide.alt;
    lbCounter.textContent = index + 1 + " / " + slides.length;
    lbCaption.textContent = slide.alt;
    btnPrev.disabled = index <= 0;
    btnNext.disabled = index >= slides.length - 1;

    lbThumbs.querySelectorAll(".gallery-lightbox__thumb").forEach(function (thumb, i) {
      thumb.classList.toggle("is-active", i === index);
      thumb.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    var activeThumb = lbThumbs.children[index];
    if (activeThumb && activeThumb.scrollIntoView) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function goTo(i) {
    if (!slides.length) return;
    index = Math.max(0, Math.min(slides.length - 1, i));
    updateSlide();
  }

  function openLightbox(newSlides, startIndex) {
    slides = newSlides;
    if (!slides.length) return;
    index = startIndex || 0;
    renderThumbs();
    updateSlide();
    lightbox.classList.add("is-open");
    document.body.classList.add("gallery-open");
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("gallery-open");
    lbImg.src = "";
  }

  btnClose.addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-gallery-close]").addEventListener("click", closeLightbox);
  btnPrev.addEventListener("click", function () {
    goTo(index - 1);
  });
  btnNext.addEventListener("click", function () {
    goTo(index + 1);
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  lightbox.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  }, { passive: true });
}

document.addEventListener("DOMContentLoaded", mitraanshAppInit);
