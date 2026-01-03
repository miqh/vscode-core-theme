import vscode from "vscode";

const SUPPRESS_RESTRICTION_MESSAGE_KEY = "suppressRestrictionMessage";

export async function activate(context: vscode.ExtensionContext) {
  const suppressed = context.globalState.get<boolean>(
    SUPPRESS_RESTRICTION_MESSAGE_KEY,
  );
  if (!suppressed) {
    const action = await vscode.window.showInformationMessage(
      "Colour theme configuration is unavailable in the web version.",
      "Don't Show Again",
    );
    if (action === "Don't Show Again") {
      await context.globalState.update(SUPPRESS_RESTRICTION_MESSAGE_KEY, true);
    }
  }
}

export function deactivate() {}
