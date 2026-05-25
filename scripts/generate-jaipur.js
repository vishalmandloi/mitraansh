const fs = require("fs");
const https = require("https");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, "_jaipur-projects.json"), "utf8"));
const DEFAULT_IMG =
  "https://cdn.prod.website-files.com/67b6bb5106e0b321737746fb/69463c24328ab81a5464cb10_banner.jpg";
const JAIPUR_HERO =
  "https://cdn.prod.website-files.com/67b6bb5106e0b321737746fb/6a1164513a2d9d72aab4d5dc_banner.jpg";

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "MitraanshRealty/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetch(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractDetail(html) {
  const gallery = [
    ...new Set([...html.matchAll(/data-fancybox="gallery"[^>]*href="([^"]+)"/g)].map((m) => m[1])),
  ].slice(0, 12);
  const layout = html.match(/data-fancybox="layoutplan"[^>]*href="([^"]+)"/);
  const connectivity = [];
  const re = /connectivity-txt"[^>]*>([^<]+)<br\/><span class="time">([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(html))) {
    connectivity.push({ place: m[1].trim(), time: m[2].trim() });
  }
  const re2 = /connectivity-txt"[^>]*>([^<]+)<br\/><\/h3>/g;
  while ((m = re2.exec(html))) connectivity.push({ place: m[1].trim(), time: "" });
  const amenities = [...html.matchAll(/class="heading-22"[^>]*>([^<]+)</g)]
    .map((x) => x[1].trim())
    .filter((t) => t.length > 2 && t.length < 60);
  const rera =
    html.match(/RERA No[:\-\s]*([A-Z0-9/]+)/i) ||
    html.match(/RAJ\/P\/\d+\/\d+/);
  const paras = [...html.matchAll(/class="para-pro"[^>]*>([\s\S]*?)<\/p>/g)].map((x) =>
    x[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  );
  const banner = html.match(/class="img-pro"[^>]*src="([^"]+)"/);
  return {
    gallery,
    layout: layout ? layout[1] : null,
    connectivity: connectivity.slice(0, 12),
    amenities: amenities.slice(0, 16),
    rera: rera ? (rera[1] || rera[0]).replace(/Rera.*/i, "").trim() : null,
    banner: banner ? banner[1] : null,
    extraParas: paras.slice(0, 4),
  };
}

function cardHtml(p) {
  const img = p.img || DEFAULT_IMG;
  const file = `jaipur-${p.slug}.html`;
  const tag = p.status === "ongoing" ? "Ongoing" : "Completed";
  const short = p.desc.length > 160 ? p.desc.slice(0, 157) + "…" : p.desc;
  return `        <article class="project-card">
          <img class="project-card__img" src="${img}" alt="${esc(p.name)}" loading="lazy">
          <div class="project-card__body">
            <span class="project-card__tag">${tag}</span>
            <h3>${esc(p.name)}</h3>
            <p class="project-card__location">Jaipur, Rajasthan</p>
            <p>${esc(short)}</p>
            <a href="${file}" class="btn btn--primary">View Project</a>
          </div>
        </article>`;
}

function detailHtml(p, detail) {
  const img = detail.banner || p.img || DEFAULT_IMG;
  const file = `jaipur-${p.slug}.html`;
  const statusLabel = p.status === "ongoing" ? "Ongoing Project" : "Completed Project";
  const rera = detail.rera || p.rera || "";
  const reraLine = rera ? ` · ${esc(rera)}` : "";
  const paras = detail.extraParas.length ? detail.extraParas : [p.desc, p.descFull].filter(Boolean);
  const uniqueParas = [...new Set(paras)].slice(0, 3);

  let bodyParas = uniqueParas
    .map((t) => `          <p>${esc(t)}</p>`)
    .join("\n");

  const amenities =
    detail.amenities.length > 0
      ? detail.amenities
      : ["Temple", "Community Hall", "Parks", "Wide Internal Roads", "Retail Shops", "Residential Plots"];

  const amenGrid = amenities
    .map((a) => `        <div class="amenity-item">${esc(a)}</div>`)
    .join("\n");

  const connGrid =
    detail.connectivity.length > 0
      ? detail.connectivity
          .map(
            (c) =>
              `        <li><strong>${esc(c.place)}</strong>${c.time ? esc(c.time) : ""}</li>`
          )
          .join("\n")
      : `        <li><strong>Jaipur International Airport</strong>Nearby</li>
        <li><strong>Ring Road</strong>Well connected</li>
        <li><strong>Tonk Road</strong>Easy access</li>`;

  const gallery =
    detail.gallery.length > 0
      ? detail.gallery
      : img
        ? [img]
        : [];

  const galleryHtml = gallery
    .map(
      (u, i) =>
        `        <img src="${u}" alt="${esc(p.name)} gallery ${i + 1}" loading="lazy">`
    )
    .join("\n");

  const layoutSection = detail.layout
    ? `
      <h3 class="section__title" style="margin-top:3rem">Layout Plan</h3>
      <div class="project-layout">
        <img src="${detail.layout}" alt="${esc(p.name)} layout plan" loading="lazy">
      </div>`
    : "";

  const contactName = encodeURIComponent(p.name.replace(/\s+/g, "+"));

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.name)} Jaipur | JDA RERA Township | Mitraansh Realty</title>
  <meta name="description" content="${esc((p.descFull || p.desc).slice(0, 155))}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f2744">
  <link rel="canonical" href="https://mitraanshrealty.com/${file}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${esc(p.name)} | Jaipur">
  <meta property="og:image" content="${img}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="jaipur-${p.slug}">
  <div id="site-header"></div>

  <section class="project-hero project-hero--img">
    <div class="project-hero__bg" style="background-image:url('${img}')"></div>
    <div class="project-hero__overlay"></div>
    <div class="container project-hero__content">
      <p class="project-hero__tag">Jaipur · ${statusLabel}</p>
      <h1>${esc(p.name)}</h1>
      <p class="project-hero__meta">Jaipur, Rajasthan${reraLine}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <p><a href="jaipur.html#projects">← All Jaipur Projects</a></p>
      <div class="project-detail-grid">
        <img src="${img}" alt="${esc(p.name)}" loading="lazy">
        <div>
          <h2 class="section__title">About Project</h2>
${bodyParas}
          <ul class="feature-list">
            <li>Residential & commercial NA plots</li>
            <li>JDA / RERA approved development</li>
            <li>Best-in-class township infrastructure</li>
          </ul>
          <a href="contact.html?project=${contactName}" class="btn btn--primary">Enquire Now</a>
        </div>
      </div>

      <h3 class="section__title" style="margin-top:3rem">Amenities</h3>
      <div class="amenities-grid">
${amenGrid}
      </div>

      <h3 class="section__title" style="margin-top:3rem">Connectivity</h3>
      <ul class="connectivity-grid">
${connGrid}
      </ul>
${layoutSection}

      <h3 class="section__title" style="margin-top:3rem">Gallery</h3>
      <div class="project-gallery">
${galleryHtml}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="cta-banner">
      <h2>Interested in ${esc(p.name)}?</h2>
      <a href="contact.html?project=${contactName}" class="btn btn--primary">Contact Us</a>
    </div>
  </section>

  <div id="site-footer"></div>
  <script src="js/site.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

async function main() {
  const ongoing = projects.filter((p) => p.status === "ongoing");
  const completed = projects.filter((p) => p.status === "completed");

  console.log("Generating detail pages...");
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    let detail = { gallery: [], layout: null, connectivity: [], amenities: [], rera: null, banner: null, extraParas: [] };
    if (p.link) {
      try {
        const url = "https://www.riyasatinfra.com" + p.link;
        const html = await fetch(url);
        detail = extractDetail(html);
        process.stdout.write(`\r  ${i + 1}/${projects.length} ${p.slug}          `);
      } catch (e) {
        process.stdout.write(`\r  ${i + 1}/${projects.length} ${p.slug} (skip fetch)`);
      }
    }
    const out = path.join(ROOT, `jaipur-${p.slug}.html`);
    fs.writeFileSync(out, detailHtml(p, detail));
  }
  console.log("\n");

  const listing = `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jaipur Plotted Township Projects | ${ongoing.length} Ongoing | Mitraansh Realty</title>
  <meta name="description" content="Jaipur projects by Riyasat Group — ${ongoing.length} ongoing and ${completed.length} completed JDA & RERA approved townships. Plots, villas & commercial spaces.">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f2744">
  <link rel="canonical" href="https://mitraanshrealty.com/jaipur.html">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="Jaipur Projects | Mitraansh Realty">
  <meta property="og:image" content="${JAIPUR_HERO}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-page="jaipur">
  <div id="site-header"></div>

  <section class="city-hero">
    <div class="city-hero__bg" style="background-image:url('${JAIPUR_HERO}')"></div>
    <div class="city-hero__overlay"></div>
    <div class="container city-hero__content">
      <h1 class="city-hero__title">Jaipur</h1>
      <p class="city-hero__text">Our legacy in every Jaipur project — ${ongoing.length} ongoing and ${completed.length} completed townships by Riyasat Group with JDA & RERA approvals.</p>
    </div>
  </section>

  <section class="section" id="projects" style="padding-top:0">
    <div class="container">
      <span class="section__label">Rajasthan</span>
      <h2 class="section__title">Ongoing Projects</h2>
      <p class="section__subtitle">${ongoing.length} premium plotted townships — content & images from Riyasat Infra.</p>
      <div class="projects-grid projects-grid--nm city-grid">
${ongoing.map(cardHtml).join("\n")}
      </div>

      <h2 class="section__title" style="margin-top:3.5rem">Completed Projects</h2>
      <p class="section__subtitle">${completed.length} successfully delivered townships in Jaipur.</p>
      <div class="projects-grid projects-grid--nm city-grid">
${completed.map(cardHtml).join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="cta-banner">
      <h2>Looking to Buy, Sell or Invest?</h2>
      <p>Let our experts help you make the right decision.</p>
      <a href="contact.html" class="btn btn--primary">Contact Us</a>
    </div>
  </section>

  <div id="site-footer"></div>
  <script src="js/site.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, "jaipur.html"), listing);

  const sitemapEntries = projects
    .map(
      (p) => `  <url>
    <loc>https://mitraanshrealty.com/jaipur-${p.slug}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  fs.writeFileSync(
    path.join(ROOT, "_jaipur-sitemap-snippet.xml"),
    sitemapEntries
  );

  console.log("Done:", projects.length, "detail pages + jaipur.html");
}

main().catch(console.error);
