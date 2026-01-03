import fs from "node:fs/promises";
import path from "node:path";

import { ColorKeysConfig, getColorThemePath, hideColorKey } from "./package";
import { ColorTheme, Infer, ColorThemeTemplate } from "./types";

export async function loadTemplate() {
  let template: Infer<typeof ColorThemeTemplate>;
  try {
    const templateText = await fs.readFile(getTemplatePath(), "utf8");
    const parsedJson = JSON.parse(templateText);
    template = await ColorThemeTemplate.parseAsync(parsedJson);
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      template = {
        colors: {},
        semanticTokenColors: {},
        tokenColors: [],
      };
    } else {
      console.log(err);
      throw err;
    }
  }
  return template;
}

export async function writeColorTheme(config: ColorKeysConfig) {
  const template = await loadTemplate();

  const colorMap = { ...config, [hideColorKey]: "#0000" };
  type ColorMapValue = keyof typeof colorMap;

  const mapColors = (input: Record<string, string | null>) =>
    Object.entries(input).reduce(
      (mappings, [token, colorKey]) => {
        if (colorKey) {
          mappings[token] = colorMap[colorKey as ColorMapValue];
        }
        return mappings;
      },
      {} as Record<string, string>,
    );

  const colorTheme: Infer<typeof ColorTheme> = {
    $schema: "vscode://schemas/color-theme",
    colors: mapColors(template.colors),
    tokenColors: template.tokenColors.map((entry) => {
      const { settings } = entry;
      if (settings.background) {
        settings.background = colorMap[settings.background as ColorMapValue];
      }
      if (settings.foreground) {
        settings.foreground = colorMap[settings.foreground as ColorMapValue];
      }
      return entry;
    }),
    name: "Core",
    semanticHighlighting: true,
    semanticTokenColors: mapColors(template.semanticTokenColors),
  };

  fs.writeFile(getColorThemePath(), JSON.stringify(colorTheme), "utf8");
}

export async function writeTemplate(json: Infer<typeof ColorThemeTemplate>) {
  await fs.writeFile(
    getTemplatePath(),
    JSON.stringify(json, undefined, 2) + "\n",
    "utf8",
  );
}

function getTemplatePath() {
  // Expect build script to copy the template over for release
  return path.resolve(
    __dirname,
    "..",
    DEV_ONLY ? "src" : "dist",
    "template.json",
  );
}
