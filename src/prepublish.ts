/**
 * This standalone script should execute as part of the `vscode:prepublish`
 * step to ensure the extension comes already bundled with the default
 * theme templates generated and available for selection.
 */

import * as themeManager from './themeManager';

async function main() {
    await themeManager.generateFromTemplates();
}

main();
