const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");

try {
  execSync("git branch -D gh-pages")
} catch {}
try {
execSync("git pull")
} catch {}
execSync("git checkout gh-pages")

const iframeDotHtml = readFileSync("./iframe.html", { encoding: "utf8" });

writeFileSync("./iframe.html", iframeDotHtml.replace("<script type=\"module\" crossorigin src=\"/assets/", "<script type=\"module\" crossorigin src=\"/solid-joystick/assets/"));