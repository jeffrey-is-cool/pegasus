import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "src");
const tokenFile = "src/styles/tokens.css";
const primitiveComponentFile = "src/components/ui/primitives.tsx";

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const absolutePath = resolve(directory, name);
    if (statSync(absolutePath).isDirectory()) return sourceFiles(absolutePath);
    return /\.(css|ts|tsx)$/.test(name) ? [absolutePath] : [];
  });
}

function lineNumber(source, offset) {
  return source.slice(0, offset).split("\n").length;
}

const failures = [];

function report(file, source, match, message) {
  failures.push(`${file}:${lineNumber(source, match.index)} ${message}: ${match[0].trim()}`);
}

for (const absolutePath of sourceFiles(sourceRoot)) {
  const file = relative(projectRoot, absolutePath);
  const source = readFileSync(absolutePath, "utf8");

  if (file !== tokenFile) {
    const rawColor = /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/gi;
    for (const match of source.matchAll(rawColor)) {
      const line = source.split("\n")[lineNumber(source, match.index) - 1];
      const isViewportThemeException = file === "src/app/layout.tsx" && line.includes("themeColor:");
      if (!isViewportThemeException) report(file, source, match, "raw color must be a semantic token");
    }
  }

  if (file.endsWith(".css") && file !== tokenFile) {
    const systemProperties = /(border-radius|box-shadow|font-family)\s*:\s*([^;\n]+)/gi;
    for (const match of source.matchAll(systemProperties)) {
      const property = match[1].toLowerCase();
      const value = match[2].trim();
      const valid =
        property === "border-radius"
          ? /^(?:var|calc)\(|^inherit$/.test(value)
          : property === "box-shadow"
            ? /^var\(|^none$/.test(value)
            : /^var\(/.test(value);
      if (!valid) report(file, source, match, `${property} must use a token`);
    }

    const systemTokenDeclaration = /--(?:color|font|radius|shadow|space|button|container|duration|ease|gradient|focus)-[\w-]+\s*:/g;
    for (const match of source.matchAll(systemTokenDeclaration)) {
      report(file, source, match, "system tokens may only be declared in tokens.css");
    }
  }

  if (file.endsWith(".tsx") && file !== primitiveComponentFile) {
    for (const match of source.matchAll(/<button\b/g)) {
      report(file, source, match, "use the shared Button component");
    }
    const manualButtonClasses = /className=(?:"[^"]*\bds-button\b[^"]*"|\{`[^`]*\bds-button\b[^`]*`\})/g;
    for (const match of source.matchAll(manualButtonClasses)) {
      report(file, source, match, "use ButtonLink or BookingLink instead of manual button classes");
    }
  }
}

if (failures.length > 0) {
  console.error("Design-system contract failed:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Design-system contract passed.");
