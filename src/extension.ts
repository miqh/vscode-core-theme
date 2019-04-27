import {
    commands,
    ExtensionContext,
    QuickPickItem,
    window,
    workspace,
    TextDocument,
} from 'vscode';
import './polyfills';
import * as themeManager from './themeManager';
import { extensionName } from './constants';

let extensionPath: string;

interface ThemeTemplate extends QuickPickItem {
    data: themeManager.ThemeTemplate;
}

export async function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(
        commands.registerCommand(`${extensionName}.create`, create),
        commands.registerCommand(`${extensionName}.edit`, edit),
        commands.registerCommand(`${extensionName}.generate`, generate),
        commands.registerCommand(`${extensionName}.remove`, remove),
        workspace.onDidSaveTextDocument(checkTemplates),
    );
}

async function checkTemplates(savedFile: TextDocument) {
    // Use case-insensitive comparison to account for discrepancies when
    // handling the dummy `TextDocument` generated from removing a template
    if (!savedFile.uri.fsPath.toLowerCase().startsWith(extensionPath.toLowerCase())) {
        return;
    }
    const selection = await window.showInformationMessage(
        'Core Theme template change detected.',
        { title: 'Update Generated Themes' },
        { title: 'Dismiss' });
    if (selection == null || selection.title === 'Dismiss') {
        return;
    }
    await generate();
}

async function create() {
    let themeName = await window.showInputBox({
        placeHolder: 'Custom theme name',
    });
    if (!themeName) {
        return;
    }
    let templateFilePath: string;
    try {
        templateFilePath = await themeManager.createTemplate(themeName);
    } catch (e) {
        if (typeof e === 'string') {
            await window.showErrorMessage(e);
            return;
        }
        throw e;
    }
    const document = await workspace.openTextDocument(templateFilePath);
    await window.showTextDocument(document);
}

async function edit() {
    const template = await getSelectedTemplate();
    if (template == null) {
        return;
    }
    const document = await workspace.openTextDocument(template.data.metadata.filePath);
    await window.showTextDocument(document);
}

async function generate() {
    await themeManager.generateFromTemplates();
    // Reload VS Code so that the newly generated themes are picked up
    await commands.executeCommand('workbench.action.reloadWindow');
}

async function getSelectedTemplate(): Promise<ThemeTemplate | undefined> {
    let templates: ThemeTemplate[] = [];
    for await (const template of themeManager.readTemplates()) {
        // Theme management commands should only apply to custom templates
        if (template.default != null) {
            continue;
        }
        templates.push({
            label: template.name,
            data: template,
            description: '',
        });
    }
    if (templates.length === 0) {
        await window.showInformationMessage('No custom theme templates exist.');
        return;
    }
    return await window.showQuickPick(templates);
}

async function remove() {
    const template = await getSelectedTemplate();
    if (template == null) {
        return;
    }
    await themeManager.removeTemplate(template.data);
    // Create dummy `TextDocument` to trigger the template check handler
    const doc = { uri: { fsPath: template.data.metadata.filePath } } as TextDocument;
    await checkTemplates(doc);
}
