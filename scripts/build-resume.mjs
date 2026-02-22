import { readFileSync } from "fs";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const resume = JSON.parse(readFileSync(resolve(root, "resume.json"), "utf-8"));

function formatDate(dateStr) {
  if (!dateStr) return "Present";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const { basics, work, education, skills, languages, publications, awards } = resume;

const contactParts = [
  basics.location ? `${basics.location.city}, ${basics.location.countryCode}` : "",
  basics.email,
  basics.phone,
  basics.url,
].filter(Boolean);

const profileLinks = (basics.profiles || [])
  .map((p) => `<a href="${escapeHtml(p.url)}">${escapeHtml(p.network)}</a>`)
  .join("  |  ");

const skillsLine = skills
  .map((s) => `<strong>${escapeHtml(s.name)}:</strong> ${s.keywords.map(escapeHtml).join(", ")}`)
  .join("&nbsp;&nbsp;&bull;&nbsp;&nbsp;");

const workHtml = work
  .map((w) => {
    const dates = `${formatDate(w.startDate)} – ${formatDate(w.endDate)}`;
    const highlights = (w.highlights || [])
      .map((h) => `<li>${escapeHtml(h)}</li>`)
      .join("");
    return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">
            <strong>${escapeHtml(w.position)}</strong>${w.name ? ` · ${escapeHtml(w.name)}` : ""}
          </div>
          <div class="entry-date">${dates}</div>
        </div>
        ${w.summary ? `<div class="entry-summary">${escapeHtml(w.summary)}</div>` : ""}
        ${highlights ? `<ul>${highlights}</ul>` : ""}
      </div>`;
  })
  .join("");

const educationHtml = education
  .map((e) => {
    const dates = `${formatDate(e.startDate)} – ${formatDate(e.endDate)}`;
    const degree = [e.studyType, e.area].filter(Boolean).join(" in ");
    return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title"><strong>${escapeHtml(e.institution)}</strong>${degree ? ` · ${escapeHtml(degree)}` : ""}</div>
          <div class="entry-date">${dates}</div>
        </div>
      </div>`;
  })
  .join("");

const langLine = (languages || []).map((l) => `${l.language} (${l.fluency})`).join(", ");

const pubsHtml = (publications || [])
  .map((p) => `<li>${escapeHtml(p.name)}</li>`)
  .join("");

const awardsHtml = (awards || [])
  .map((a) => `<li>${escapeHtml(a.title)}</li>`)
  .join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    font-size: 9.5pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: "Charter", "Georgia", "Cambria", "Times New Roman", serif;
    color: #1a1a1a;
    line-height: 1.4;
    padding: 36pt 40pt;
  }
  a {
    color: #1a1a1a;
    text-decoration: none;
  }
  h1 {
    font-family: "Helvetica Neue", "Arial", "Segoe UI", sans-serif;
    font-size: 20pt;
    font-weight: 700;
    letter-spacing: -0.3pt;
    margin: 0;
  }
  .subtitle {
    font-family: "Helvetica Neue", "Arial", "Segoe UI", sans-serif;
    font-size: 10.5pt;
    color: #444;
    margin-top: 2pt;
  }
  .contact {
    font-size: 8.5pt;
    color: #555;
    margin-top: 6pt;
    line-height: 1.5;
  }
  .contact a { color: #555; }
  .divider {
    border: none;
    border-top: 1.5pt solid #1a1a1a;
    margin: 10pt 0 8pt;
  }
  .section-title {
    font-family: "Helvetica Neue", "Arial", "Segoe UI", sans-serif;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2pt;
    color: #1a1a1a;
    margin-bottom: 6pt;
    padding-bottom: 3pt;
    border-bottom: 0.5pt solid #ccc;
  }
  .section {
    margin-bottom: 10pt;
  }
  .summary {
    font-size: 9.5pt;
    line-height: 1.45;
    margin-bottom: 10pt;
  }
  .skills-block {
    font-size: 8.5pt;
    line-height: 1.6;
  }
  .entry {
    margin-bottom: 7pt;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-size: 9.5pt;
  }
  .entry-date {
    font-size: 8.5pt;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: 8pt;
  }
  .entry-summary {
    font-size: 8.5pt;
    font-style: italic;
    color: #555;
    margin-top: 1pt;
  }
  ul {
    margin: 2pt 0 0 14pt;
    padding: 0;
  }
  li {
    font-size: 8.5pt;
    line-height: 1.4;
    margin-bottom: 1pt;
  }
  li::marker {
    color: #999;
  }
  .extras {
    font-size: 8.5pt;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <h1>${escapeHtml(basics.name)}</h1>
  <div class="subtitle">${escapeHtml(basics.label)}</div>
  <div class="contact">
    ${contactParts.join("&nbsp;&nbsp;·&nbsp;&nbsp;")}
    ${profileLinks ? `<br>${profileLinks}` : ""}
  </div>

  <hr class="divider">

  <div class="summary">${escapeHtml(basics.summary)}</div>

  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-block">${skillsLine}</div>
  </div>

  <div class="section">
    <div class="section-title">Experience</div>
    ${workHtml}
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    ${educationHtml}
  </div>

  ${langLine ? `<div class="section"><div class="section-title">Languages</div><div class="extras">${escapeHtml(langLine)}</div></div>` : ""}

  ${pubsHtml || awardsHtml ? `<div class="section"><div class="section-title">Other</div><ul class="extras">${pubsHtml}${awardsHtml}</ul></div>` : ""}
</body>
</html>`;

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: resolve(root, "resume", "resume.pdf"),
  format: "A4",
  printBackground: true,
});
await browser.close();

console.log("Resume PDF built successfully at resume/resume.pdf");
