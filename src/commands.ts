import vscode from "vscode";

import { loadTemplate, writeColorTheme, writeTemplate } from "./io";
import {
  ColorKeysConfig,
  colorKeysConfigKey,
  extensionPrefix,
  getDefaultColorKeysConfig,
} from "./package";
import { ColorTheme } from "./types";

export async function updateColorTheme() {
  const config = getColorKeysConfig();
  await writeColorTheme(config);
}

export async function updateTemplate() {
  const currentColorTheme = await generateCurrentColorTheme();

  const template = await loadTemplate();

  const compareKey = (k1: string, k2: string) => k1.localeCompare(k2);

  const updatedTemplate: Awaited<ReturnType<typeof loadTemplate>> = {
    colors: Object.keys(currentColorTheme.colors)
      .sort(compareKey)
      .reduce(
        (colors, token) => {
          colors[token] = template.colors[token] ?? null;
          return colors;
        },
        {} as Record<string, string | null>,
      ),
    tokenColors: template.tokenColors.map((entry) => {
      entry.scope = entry.scope.sort(compareKey);
      return entry;
    }),
    semanticTokenColors: Object.keys(template.semanticTokenColors)
      .sort(compareKey)
      .reduce(
        (colors, token) => {
          const colorKey = template.semanticTokenColors[token];
          if (colorKey) {
            colors[token] = colorKey;
          }
          return colors;
        },
        {} as Record<string, string>,
      ),
  };

  await writeTemplate(updatedTemplate);
}

/**
 * Uses a built-in developer command that dumps out a colour theme payload
 * based on current settings to establish a list of visual tokens to map.
 */
async function generateCurrentColorTheme() {
  const referenceUri = vscode.window.activeTextEditor?.document.uri;

  const capture = new Promise<string>((resolve, reject) => {
    const listener = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;

      if (editor.document.uri.toString() === referenceUri?.toString()) return;

      const text = editor.document.getText().trim();
      if (!text) return;

      listener.dispose();
      clearTimeout(listenerTimeout);

      vscode.commands.executeCommand(
        "workbench.action.revertAndCloseActiveEditor",
      );

      resolve(text);
    });

    // Chosen timeout duration is arbitrary and is intended to prevent the
    // command from hanging the extension host in case something odd happens
    const listenerTimeout = setTimeout(() => {
      listener.dispose();
      reject(
        new Error("Timeout waiting for comparison colour theme generation."),
      );
    }, 1000);
  });

  await vscode.commands.executeCommand("workbench.action.generateColorTheme");

  try {
    // Generated output may prepend leading "//" to some visual token mappings
    // which would make the output unparsable as well-formed JSON. It may also
    // contain mappings where assigned colour is null.
    const parsedJson = JSON.parse((await capture).replace(/^\s*\/\//gm, ""));
    return await ColorTheme.parseAsync(parsedJson);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getColorKeysConfig() {
  return {
    ...getDefaultColorKeysConfig(),
    ...vscode.workspace
      .getConfiguration(extensionPrefix)
      .get<Partial<ColorKeysConfig>>(colorKeysConfigKey),
  } as ColorKeysConfig;
}
