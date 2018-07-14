import { commands, ExtensionContext } from 'vscode';
import * as theme from './theme';
import { extensionName } from './constants';

export async function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(
            `${extensionName}.generateThemes`,
            async () => await theme.generateFromTemplates()),
    );
}
