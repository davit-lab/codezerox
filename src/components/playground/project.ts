// Project model, preview bundler and export helpers for the Playground.

export interface ProjectFile {
  name: string;
  content: string;
}

export interface LanguageMode {
  id: string;
  name: string;
  tag: string; // short monogram used in UI
  runtime: string;
  file: string; // main file name for single-file languages
  hue: string;
}

export const LANGUAGES: LanguageMode[] = [
  { id: "web", name: "Web", tag: "WEB", runtime: "HTML · CSS · JS", file: "index.html", hue: "#ff8a5b" },
  { id: "python", name: "Python", tag: "PY", runtime: "Python 3", file: "main.py", hue: "#7fb6e8" },
  { id: "javascript", name: "JavaScript", tag: "JS", runtime: "Node.js", file: "main.js", hue: "#f0d264" },
  { id: "typescript", name: "TypeScript", tag: "TS", runtime: "Deno / tsc", file: "main.ts", hue: "#6ea4f0" },
  { id: "java", name: "Java", tag: "JV", runtime: "OpenJDK", file: "Main.java", hue: "#f2a35e" },
  { id: "csharp", name: "C#", tag: "C#", runtime: ".NET", file: "Program.cs", hue: "#b493e6" },
  { id: "cpp", name: "C++", tag: "C++", runtime: "g++", file: "main.cpp", hue: "#6fa8dc" },
  { id: "go", name: "Go", tag: "GO", runtime: "Go", file: "main.go", hue: "#6fd3e3" },
  { id: "rust", name: "Rust", tag: "RS", runtime: "rustc", file: "main.rs", hue: "#e3a77c" },
  { id: "ruby", name: "Ruby", tag: "RB", runtime: "Ruby", file: "main.rb", hue: "#e66b62" },
  { id: "php", name: "PHP", tag: "PHP", runtime: "PHP 8", file: "index.php", hue: "#a3a6db" },
  { id: "swift", name: "Swift", tag: "SW", runtime: "Swift", file: "main.swift", hue: "#f58a5c" },
  { id: "kotlin", name: "Kotlin", tag: "KT", runtime: "Kotlin/JVM", file: "Main.kt", hue: "#a98bff" },
  { id: "sql", name: "SQL", tag: "SQL", runtime: "SQLite", file: "query.sql", hue: "#8fc7a8" },
];

export const getLanguage = (id: string) => LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];

/** Visual identity of a file, derived from its extension. */
export const FILE_KINDS: Record<string, { label: string; hue: string; prism: string }> = {
  html: { label: "html", hue: "#ff8a5b", prism: "markup" },
  htm: { label: "html", hue: "#ff8a5b", prism: "markup" },
  css: { label: "css", hue: "#6ea4f0", prism: "css" },
  js: { label: "js", hue: "#f0d264", prism: "javascript" },
  mjs: { label: "js", hue: "#f0d264", prism: "javascript" },
  ts: { label: "ts", hue: "#6ea4f0", prism: "typescript" },
  json: { label: "json", hue: "#8fc7a8", prism: "json" },
  md: { label: "md", hue: "#c9c1b2", prism: "markdown" },
  svg: { label: "svg", hue: "#e88bc4", prism: "markup" },
  txt: { label: "txt", hue: "#8a8478", prism: "plain" },
  py: { label: "py", hue: "#7fb6e8", prism: "python" },
  java: { label: "java", hue: "#f2a35e", prism: "java" },
  cs: { label: "cs", hue: "#b493e6", prism: "csharp" },
  cpp: { label: "cpp", hue: "#6fa8dc", prism: "cpp" },
  go: { label: "go", hue: "#6fd3e3", prism: "go" },
  rs: { label: "rs", hue: "#e3a77c", prism: "rust" },
  rb: { label: "rb", hue: "#e66b62", prism: "ruby" },
  php: { label: "php", hue: "#a3a6db", prism: "php" },
  swift: { label: "swift", hue: "#f58a5c", prism: "swift" },
  kt: { label: "kt", hue: "#a98bff", prism: "kotlin" },
  sql: { label: "sql", hue: "#8fc7a8", prism: "sql" },
};

export const extOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
};

export const fileKind = (name: string) =>
  FILE_KINDS[extOf(name)] ?? { label: extOf(name) || "file", hue: "#8a8478", prism: "plain" };

/** Extensions a user may create inside a web project. */
export const WEB_EXTENSIONS = ["html", "css", "js", "json", "svg", "md", "txt"];

export const isValidFileName = (name: string) =>
  /^[\w\-. ]+\.[a-z0-9]+$/i.test(name) && !name.includes("..") && name.length <= 60;

/* -------------------------------------------------------------------------- */
/*                                  Defaults                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_WEB_FILES: ProjectFile[] = [
  {
    name: "index.html",
    content: `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <title>ჩემი გვერდი</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>გამარჯობა! 👋</h1>
    <p>შეცვალე კოდი მარცხნივ და შედეგს აქ დაინახავ.</p>
    <button id="btn">დამაჭირე</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  },
  {
    name: "style.css",
    content: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f2f8;
  font-family: system-ui, sans-serif;
  color: #1e1b24;
}

.card {
  background: white;
  padding: 32px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  color: #5f13ca;
}

button {
  margin-top: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #5f13ca;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

button:hover {
  background: #4a0fa0;
}`,
  },
  {
    name: "script.js",
    content: `const btn = document.querySelector('#btn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = 'დააჭირე ' + count + '-ჯერ';
  console.log('დაჭერა:', count);
});

console.log('გვერდი ჩაიტვირთა ✔');`,
  },
];

export const DEFAULT_CODE: Record<string, string> = {
  python: `def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

squares = [n ** 2 for n in range(1, 6)]
print("Squares:", squares)`,
  javascript: `const greet = (name) => \`Hello, \${name}!\`;

console.log(greet('World'));
console.log('Squares:', [1, 2, 3, 4, 5].map((n) => n * n));`,
  typescript: `interface User {
  id: number;
  name: string;
}

const greet = (user: User): string => \`Hello, \${user.name}!\`;

console.log(greet({ id: 1, name: "World" }));`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int n = 1; n <= 5; n++) {
            System.out.print(n * n + " ");
        }
    }
}`,
  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        var squares = Enumerable.Range(1, 5).Select(n => n * n);
        Console.WriteLine(string.Join(", ", squares));
    }
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    for (int n = 1; n <= 5; n++) {
        std::cout << n * n << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    for n := 1; n <= 5; n++ {
        fmt.Printf("%d ", n*n)
    }
    fmt.Println()
}`,
  rust: `fn main() {
    println!("Hello, World!");
    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("Squares: {:?}", squares);
}`,
  ruby: `def greet(name)
  "Hello, #{name}!"
end

puts greet("World")
puts "Squares: #{(1..5).map { |n| n**2 }}"`,
  php: `<?php
echo "Hello, World!\\n";
$squares = array_map(fn($n) => $n ** 2, range(1, 5));
echo "Squares: " . implode(", ", $squares) . "\\n";`,
  swift: `func greet(_ name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet("World"))
print("Squares: \\((1...5).map { $0 * $0 })")`,
  kotlin: `fun main() {
    println("Hello, World!")
    val squares = (1..5).map { it * it }
    println("Squares: $squares")
}`,
  sql: `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
);

INSERT INTO users VALUES (1, 'Nino', 'nino@example.com');
INSERT INTO users VALUES (2, 'Luka', 'luka@example.com');

SELECT * FROM users;`,
};

export const defaultFiles = (language: string): ProjectFile[] => {
  if (language === "web") return DEFAULT_WEB_FILES.map((f) => ({ ...f }));
  const lang = getLanguage(language);
  return [{ name: lang.file, content: DEFAULT_CODE[language] ?? "" }];
};

export const NEW_FILE_TEMPLATES: Record<string, string> = {
  html: `<section>\n  \n</section>\n`,
  css: `/* styles */\n`,
  js: `// script\n`,
  json: `{\n  \n}\n`,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#5f13ca"/>\n</svg>\n`,
  md: `# შენიშვნები\n`,
  txt: ``,
};

/* -------------------------------------------------------------------------- */
/*                       Persistence <-> legacy columns                       */
/* -------------------------------------------------------------------------- */

export interface SnippetRow {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  user_id: string | null;
  is_public: boolean;
  hide_code?: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  files?: ProjectFile[] | null;
}

/** Reconstruct a file list from a DB row (supports rows saved before multi-file). */
export const filesFromRow = (row: SnippetRow): ProjectFile[] => {
  if (Array.isArray(row.files) && row.files.length > 0) {
    return row.files
      .filter((f) => f && typeof f.name === "string")
      .map((f) => ({ name: f.name, content: String(f.content ?? "") }));
  }
  if (row.language === "web") {
    const files: ProjectFile[] = [{ name: "index.html", content: row.html_code ?? "" }];
    if (row.css_code) files.push({ name: "style.css", content: row.css_code });
    if (row.js_code) files.push({ name: "script.js", content: row.js_code });
    return files;
  }
  return [{ name: getLanguage(row.language).file, content: row.js_code ?? "" }];
};

/** Flatten files into the legacy html/css/js columns so older views keep working. */
export const legacyColumns = (language: string, files: ProjectFile[]) => {
  if (language !== "web") {
    return { html_code: "", css_code: "", js_code: files[0]?.content ?? "" };
  }
  const html = files.find((f) => f.name === "index.html") ?? files.find((f) => extOf(f.name) === "html");
  return {
    html_code: html?.content ?? "",
    css_code: files.filter((f) => extOf(f.name) === "css").map((f) => f.content).join("\n\n"),
    js_code: files.filter((f) => ["js", "mjs"].includes(extOf(f.name))).map((f) => f.content).join("\n\n"),
  };
};

/* -------------------------------------------------------------------------- */
/*                               Preview bundler                              */
/* -------------------------------------------------------------------------- */

const CONSOLE_BRIDGE = `<script>(function(){
  var send = function(level, args){
    try {
      parent.postMessage({ __cz: 1, level: level, args: Array.prototype.map.call(args, fmt) }, '*');
    } catch (e) {}
  };
  var fmt = function(v){
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'string') return v;
    if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous') + '()';
    if (v instanceof Element) return '<' + v.tagName.toLowerCase() + (v.id ? '#' + v.id : '') + '>';
    try { return JSON.stringify(v, null, 2) ?? String(v); } catch (e) { return String(v); }
  };
  ['log','info','warn','error','debug'].forEach(function(level){
    var original = console[level];
    console[level] = function(){ send(level, arguments); original && original.apply(console, arguments); };
  });
  var clear = console.clear;
  console.clear = function(){ send('clear', []); clear && clear.call(console); };
  window.addEventListener('message', function(e){
    if (e.source !== parent || !e.data || !e.data.__czEval) return;
    var out = function(level, v){ parent.postMessage({ __cz: 1, level: level, args: [fmt(v)] }, '*'); };
    try {
      var r = (0, eval)(e.data.code);
      if (r && typeof r.then === 'function') r.then(function(v){ out('result', v); }, function(err){ out('error', err); });
      else out('result', r === undefined ? 'undefined' : r);
    } catch (err) { out('error', err); }
  });
  window.addEventListener('error', function(e){ send('error', [e.message + (e.lineno ? '  (line ' + e.lineno + ')' : '')]); });
  window.addEventListener('unhandledrejection', function(e){ send('error', ['Unhandled promise: ' + fmt(e.reason)]); });
})();</script>`;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const safeScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");

const toDataUrl = (file: ProjectFile) => {
  const mime =
    extOf(file.name) === "svg" ? "image/svg+xml" : extOf(file.name) === "json" ? "application/json" : "text/plain";
  return `data:${mime};charset=utf-8,${encodeURIComponent(file.content)}`;
};

/**
 * Turn a multi-file web project into a single self-contained HTML document.
 * - <link href="x.css"> / <script src="x.js"> pointing at project files are inlined
 * - CSS / JS files that are never referenced are injected automatically
 * - other assets (svg, json…) referenced by name become data URLs
 */
export const buildWebDocument = (files: ProjectFile[], opts: { console?: boolean } = {}) => {
  const byName = new Map(files.map((f) => [f.name, f]));
  const entry = byName.get("index.html") ?? files.find((f) => extOf(f.name) === "html");
  let html = entry?.content ?? "";
  const used = new Set<string>();

  html = html.replace(/<link\b[^>]*?href=["']\.?\/?([^"']+)["'][^>]*>/gi, (tag, href: string) => {
    const file = byName.get(href);
    if (file && extOf(href) === "css" && /stylesheet/i.test(tag)) {
      used.add(href);
      return `<style data-file="${href}">\n${file.content}\n</style>`;
    }
    return tag;
  });

  html = html.replace(
    /<script\b([^>]*?)src=["']\.?\/?([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (tag, pre: string, src: string, post: string) => {
      const file = byName.get(src);
      if (!file) return tag;
      used.add(src);
      const isModule = /type=["']module["']/i.test(pre + post);
      return `<script${isModule ? ' type="module"' : ""} data-file="${src}">\n${safeScript(file.content)}\n</script>`;
    }
  );

  const looseCss = files.filter((f) => extOf(f.name) === "css" && !used.has(f.name));
  const looseJs = files.filter((f) => ["js", "mjs"].includes(extOf(f.name)) && !used.has(f.name));

  // Inline remaining assets referenced by file name.
  const assets = files.filter((f) => ["svg", "json", "txt", "md"].includes(extOf(f.name)));
  const inlineAssets = (text: string) =>
    assets.reduce(
      (acc, a) => acc.replace(new RegExp(`(["'(])\\.?/?${escapeRegExp(a.name)}(["')])`, "g"), `$1${toDataUrl(a)}$2`),
      text
    );

  const headInject =
    (opts.console !== false ? CONSOLE_BRIDGE : "") +
    looseCss.map((f) => `<style data-file="${f.name}">\n${f.content}\n</style>`).join("");
  const bodyInject = looseJs
    .map((f) => `<script data-file="${f.name}">\n${safeScript(f.content)}\n</script>`)
    .join("");

  html = /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, (m) => m + headInject)
    : `<!DOCTYPE html><html><head><meta charset="utf-8">${headInject}</head><body>${html}`;

  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, bodyInject + "</body>") : html + bodyInject;

  return inlineAssets(html);
};

/* -------------------------------------------------------------------------- */
/*                         ZIP export (store, no deps)                        */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

export const buildZip = (files: ProjectFile[], folder: string): Blob => {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const file of files) {
    const name = enc.encode(`${folder}/${file.name}`);
    const data = enc.encode(file.content);
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // store
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true);
    cen.setUint16(12, dosTime, true);
    cen.setUint16(14, dosDate, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, data.length, true);
    cen.setUint32(24, data.length, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);

    chunks.push(new Uint8Array(local.buffer), name, data);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + data.length;
  }

  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/zip" });
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "project";

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
