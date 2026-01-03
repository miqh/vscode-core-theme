import vscode from "vscode";

import { updateColorTheme, updateTemplate } from "./commands";
import {
  extensionPrefix,
  extensionVersion,
  extensionVersionKey,
} from "./package";

export async function activate(context: vscode.ExtensionContext) {
  const version = context.globalState.get<string>(extensionVersionKey);
  if (!version) {
    await context.globalState.update(extensionVersionKey, extensionVersion);
  }

  await updateColorTheme();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration(extensionPrefix)) {
        await updateColorTheme();
      }
    }),
  );

  if (DEV_ONLY) {
    vscode.commands.executeCommand(
      "setContext",
      `${extensionPrefix}.devOnly`,
      true,
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        `${extensionPrefix}.updateTemplate`,
        updateTemplate,
      ),
    );
  }
}

export function deactivate() {}
