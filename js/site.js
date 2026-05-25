window.MitraanshSite = (function () {
  var HERO_PAGES = [
    "home",
    "kota",
    "jaipur",
    "navi-mumbai",
    "about",
    "contact",
    "riyasat-royalcrest",
    "riyasat-bliss",
    "riyasat-sankalp",
    "sankalp-meadows",
  ];

  function renderHeader(active) {
    var el = document.getElementById("site-header");
    if (!el) return;

    var navActive = active;
    if (
      active === "riyasat-royalcrest" ||
      active === "riyasat-bliss" ||
      active === "riyasat-sankalp" ||
      active === "sankalp-meadows"
    ) {
      navActive = "navi-mumbai";
    }
    if (active && active.indexOf("jaipur-") === 0) {
      navActive = "rajasthan";
    }
    if (active && active.indexOf("kota-") === 0) {
      navActive = "rajasthan";
    }

    var onDark =
      HERO_PAGES.indexOf(active) !== -1 ||
      (active && active.indexOf("jaipur-") === 0) ||
      (active && active.indexOf("kota-") === 0);
    var headerClass = "header" + (onDark ? " header--on-dark" : "");

    function activeClass(key) {
      return navActive === key ? " is-active" : "";
    }

    function rajasthanActive() {
      return navActive === "rajasthan" || active === "jaipur" || active === "kota" ? " is-active" : "";
    }

    function subActive(key) {
      if (active === key) return " is-active";
      if (key === "kota" && active && active.indexOf("kota-") === 0) return " is-active";
      if (key === "jaipur" && active && active.indexOf("jaipur-") === 0) return " is-active";
      return "";
    }

    el.outerHTML =
      '<div class="site-header">' +
      '<header class="' + headerClass + '">' +
      '  <div class="container header__bar">' +
      '    <div class="header__inner">' +
      '      <a href="index.html" class="logo">' +
      '        <div class="logo__icon">M</div>' +
      '        <div class="logo__text">' +
      '          <span class="logo__name">Mitraansh <span>Realty</span></span>' +
      '          <span class="logo__tagline">Premium Real Estate</span>' +
      '        </div>' +
      '      </a>' +
      '<nav class="nav" id="main-nav" aria-label="Main navigation">' +
      '        <div class="nav__links">' +
      '          <a href="index.html" class="nav__link" data-nav="home"' + activeClass("home") + '>Home</a>' +
      '          <a href="index.html#projects" class="nav__link" data-nav="projects"' + activeClass("projects") + '>Our Projects</a>' +
      '          <div class="nav__item--dropdown">' +
      '            <a href="navi-mumbai.html#projects" class="nav__link" data-nav="navi-mumbai"' + activeClass("navi-mumbai") + '>Navi Mumbai <span class="nav__caret">▾</span></a>' +
      '            <div class="nav__dropdown-menu">' +
      '              <span class="nav__dropdown-label">Navi Mumbai</span>' +
      '              <a href="navi-mumbai.html#projects">All Projects</a>' +
      '              <a href="riyasat-royalcrest.html"' + subActive("riyasat-royalcrest") + '>Riyasat Royalcrest</a>' +
      '              <a href="riyasat-bliss.html"' + subActive("riyasat-bliss") + '>Riyasat Bliss</a>' +
      '              <a href="riyasat-sankalp.html"' + subActive("riyasat-sankalp") + '>Riyasat Sankalp</a>' +
      '              <a href="sankalp-meadows.html"' + subActive("sankalp-meadows") + '>Sankalp Meadows</a>' +
      '            </div>' +
      '          </div>' +
      '          <div class="nav__item--dropdown">' +
      '            <a href="jaipur.html#projects" class="nav__link" data-nav="rajasthan"' + rajasthanActive() + '>Rajasthan <span class="nav__caret">▾</span></a>' +
      '            <div class="nav__dropdown-menu">' +
      '              <span class="nav__dropdown-label">Rajasthan</span>' +
      '              <a href="jaipur.html#projects"' + subActive("jaipur") + '>Jaipur</a>' +
      '              <a href="kota.html#projects"' + subActive("kota") + '>Kota</a>' +
      '            </div>' +
      '          </div>' +
      '          <a href="about.html" class="nav__link" data-nav="about"' + activeClass("about") + '>About</a>' +
      '        </div>' +
      '        <a href="contact.html" class="header__cta" data-nav="contact"' + activeClass("contact") + '>' +
      '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>' +
      '          Contact Us' +
      '        </a>' +
      '</nav>' +
      '      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span></button>' +
      '    </div>' +
      '  </div>' +
      '</header>' +
      '<div class="nav-backdrop" id="nav-backdrop" aria-hidden="true"></div>' +
      '</div>';
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;

    el.outerHTML =
      '<footer class="footer">' +
      '  <div class="container">' +
      '    <div class="footer__grid">' +
      '      <div><a href="index.html" class="logo"><div class="logo__icon">M</div><div class="logo__text"><span class="logo__name">Mitraansh <span>Realty</span></span></div></a>' +
      '        <p class="footer__desc">Your trusted partner for residential plots, villas, and commercial properties across Navi Mumbai, Jaipur & Kota.</p></div>' +
      '      <div><h4>Locations</h4><div class="footer__links">' +
      '        <a href="navi-mumbai.html#projects">Navi Mumbai</a><a href="jaipur.html#projects">Jaipur</a><a href="kota.html#projects">Kota</a></div></div>' +
      '      <div><h4>Contact</h4><div class="footer__links">' +
      '        <a href="tel:+918618265104">+91 86182 65104</a>' +
      '        <a href="mailto:info@mitraanshrealty.com">info@mitraanshrealty.com</a></div></div>' +
      '      <div><h4>Quick Links</h4><div class="footer__links">' +
      '        <a href="index.html#projects">Our Projects</a><a href="about.html">About Us</a><a href="contact.html">Contact</a></div></div>' +
      '    </div>' +
      '    <div class="footer__bottom"><p>&copy; 2026 Mitraansh Realty. All rights reserved.</p></div>' +
      '  </div>' +
      '</footer>' +
      '<a href="https://wa.me/918618265104" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
      '  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>';
  }

  function ensureWebManifest() {
    if (location.protocol !== "http:" && location.protocol !== "https:") return;
    if (document.querySelector('link[rel="manifest"]')) return;
    var link = document.createElement("link");
    link.rel = "manifest";
    link.href = "site.webmanifest";
    document.head.appendChild(link);
  }

  function init() {
    ensureWebManifest();
    var page = document.body.dataset.page || "home";
    renderHeader(page);
    renderFooter();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { renderHeader: renderHeader, renderFooter: renderFooter };
})();
