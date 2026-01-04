import { rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import esbuild from "esbuild";

const release = process.argv.includes("--release");

/** @type {esbuild.Plugin} */
const esbuildProblemMatcherOutput = {
  name: "esbuild-problem-matcher",
  setup(build) {
    /** @type {(severity: string, m: esbuild.Message) => string} */
    const format = (severity, m) =>
      `  ${m.location?.file}:${m.location?.line}:${m.location?.column}: ${severity}: ${m.text}`;
    let buildStart = 0;
    build.onStart(() => {
      buildStart = Date.now();
      console.info(`esbuild starting build`);
    });
    build.onEnd((result) => {
      for (const error of result.errors) {
        console.error("\x1b[31m" + format("ERROR", error) + "\x1b[0m");
      }
      for (const warning of result.warnings) {
        console.warn("\x1b[33m" + format("WARN", warning) + "\x1b[0m");
      }
      console.info(`esbuild built in ${Date.now() - buildStart} ms\n`);
    });
  },
};

/** @type {esbuild.BuildOptions} */
const config = {
  bundle: true,
  define: {
    DEV_ONLY: JSON.stringify(!release),
  },
  entryPoints: {
    "extension.desktop": "src/extension.desktop.ts",
    "extension.web": "src/extension.web.ts",
  },
  external: ["vscode"],
  format: "cjs",
  logLevel: "silent",
  outdir: "dist",
  platform: "node",
  plugins: [esbuildProblemMatcherOutput],
};

try {
  if (release) {
    console.warn("removing dist directory to prepare for release build\n");
    await rm("dist", { force: true, recursive: true });
  }
  await esbuild.build({
    ...config,
    ...(release && {
      entryPoints: { ...config.entryPoints, scripts: "src/scripts.ts" },
    }),
    minify: release,
    sourcemap: !release,
  });
  if (release) {
    console.info("creating compressed template for distribution\n");
    const template = await readFile(
      path.resolve(import.meta.dirname, "src", "template.json"),
      "utf8",
    );
    const compressedTemplate = JSON.stringify(JSON.parse(template));
    await writeFile(
      path.resolve(import.meta.dirname, "dist", "template.json"),
      compressedTemplate,
      "utf8",
    );

    const scripts = await import(
      pathToFileURL(path.resolve(import.meta.dirname, "dist", "scripts.js"))
        .href
    );
    await scripts.postbuild();
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
