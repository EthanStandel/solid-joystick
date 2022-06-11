const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");

execSync("git branch -D gh-pages")
execSync("git pull")
execSync("git checkout gh-pages")

const iframeDotHtml = readFileSync("./iframe.html", { encoding: "utf8" });

iframeDotHtml.replace("<script type=\"module\" crossorigin src=\"/assets/", "<script type=\"module\" crossorigin src=\"/solid-joystick/assets/");