// Gate A, check 5: key parity across locales.
// Fails if a non-reference locale lacks a key that the reference locale has.
// Note: if plural-suffix keys (_one/_other/_many) ever cause false positives, refine the comparison here.
import { readFileSync } from "node:fs";

const LOCALES = ["pt-BR", "en", "es", "fr", "de"];
const REFERENCE = "pt-BR";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const load = (locale) =>
  new Set(
    flatten(
      JSON.parse(readFileSync(`locales/${locale}/translation.json`, "utf8")),
    ),
  );

const reference = load(REFERENCE);
let failed = false;

for (const locale of LOCALES.filter((l) => l !== REFERENCE)) {
  const keys = load(locale);
  const missing = [...reference].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !reference.has(k));
  if (missing.length > 0) {
    failed = true;
    console.error(
      `[${locale}] missing ${missing.length} key(s):\n  ${missing.join("\n  ")}`,
    );
  }
  if (extra.length > 0) {
    console.warn(
      `[${locale}] ${extra.length} key(s) not present in ${REFERENCE}:\n  ${extra.join("\n  ")}`,
    );
  }
}

if (failed) process.exit(1);
console.log("i18n parity OK");
