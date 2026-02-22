import { readFileSync } from "fs";
import { execSync } from "child_process";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Render JSON Resume to HTML
execSync("npx resumed render resume.json --theme jsonresume-theme-elegant -o resume.html", {
  cwd: root,
  stdio: "inherit",
});

// Convert HTML to PDF
const html = readFileSync(resolve(root, "resume.html"), "utf-8");
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: resolve(root, "resume", "resume.pdf"),
  format: "A4",
  margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
  printBackground: true,
});
await browser.close();

// Cleanup
execSync("rm -f resume.html", { cwd: root });

console.log("Resume PDF built successfully at resume/resume.pdf");
