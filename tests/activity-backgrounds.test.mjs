import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTsModule(relativePath) {
  const filename = path.join(__dirname, "..", relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const mod = new Module(filename);

  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(outputText, filename);

  return mod.exports;
}

const backgrounds = loadTsModule("src/lib/activity-backgrounds.ts");

test("new activities resolve to dedicated activity image paths", () => {
  assert.equal(backgrounds.activityBackgrounds["皮划艇"].image, "/activity/kayaking.jpg");
  assert.equal(backgrounds.activityBackgrounds["攀岩"].image, "/activity/climbing.jpg");
  assert.equal(backgrounds.activityBackgrounds["单板滑雪"].image, "/activity/snowboarding.jpg");
  assert.equal(backgrounds.activityBackgrounds["沙漠徒步"].image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.activityBackgrounds["冬季露营"].image, "/activity/winter-camping.jpg");
});

test("activity slugs share the same source as activity names", () => {
  assert.equal(backgrounds.getActivityBackgroundBySlug("trail-running").image, "/activity/trail-running.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("backpacking").image, "/activity/backpacking.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("climbing").image, "/activity/climbing.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("kayaking").image, "/activity/kayaking.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("snowboarding").image, "/activity/snowboarding.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("desert-hiking").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("winter-camping").image, "/activity/winter-camping.jpg");
  assert.equal(backgrounds.getActivityBackgroundBySlug("beach-camping").image, "/activity/beach-camping.jpg");
});

test("share card backgrounds do not fall back for configured new activities", () => {
  assert.equal(backgrounds.getShareCardBackgroundImage("皮划艇"), "/activity/kayaking.jpg");
  assert.equal(backgrounds.getShareCardBackgroundImage("攀岩"), "/activity/climbing.jpg");
  assert.equal(backgrounds.getShareCardBackgroundImage("单板滑雪"), "/activity/snowboarding.jpg");
  assert.equal(backgrounds.getShareCardBackgroundImage("沙漠徒步"), "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getShareCardBackgroundImage("冬季露营"), "/activity/winter-camping.jpg");
});

test("desert hiking aliases resolve to the dedicated desert image", () => {
  assert.equal(backgrounds.getActivityBackground("沙漠徒步").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("Desert Hiking").image, "/activity/desert-hiking.jpg");
  assert.equal(backgrounds.getActivityBackground("desert-hiking").image, "/activity/desert-hiking.jpg");
});
