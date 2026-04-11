import fs from "node:fs";
import path from "node:path";

const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const currentVersion = packageJson.version || "0.0.0";
const [major, minor, patch] = currentVersion.split(".").map(Number);

packageJson.version = `${major}.${minor}.${patch + 1}`;

fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + "\n",
  "utf8"
);

console.log(`Version bumped to ${packageJson.version}`);