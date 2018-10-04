import fs from 'fs';
import path from 'path';
import './polyfills';
import { Rgba, mix, fadeOut, brightness } from './color';

// Obtain the extension path by relative resolution rather than accessing the
// VS Code API to avoid a dependency on the latter so that exposed functions
// can be invoked from other scripts
const extensionPath = path.resolve(__dirname, '..');

const packageJsonPath = path.resolve(extensionPath, 'package.json');
const templatesPath = path.resolve(extensionPath, 'templates');
const themesPath = path.resolve(extensionPath, 'themes');

const readDir = promisify<string[]>(fs.readdir);
const readFile = (filePath: string) => promisify<string>(fs.readFile)(filePath, 'utf8');
const removeFile = promisify(fs.unlink);
const writeDir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

interface Metadata {
    filePath: string;
}

/**
 * Represents the contents of a theme generated from a template.
 */
export interface Theme {
    name: string;
    type: ThemeType;
    metadata: Metadata;
}

/**
 * Represents the contents of a theme template.
 */
export interface ThemeTemplate {
    name: string;
    default?: boolean;
    backgroundColor: Rgba;
    foregroundColor: Rgba;
    metadata: Metadata;
}

/**
 * Represents the possible values of the VS Code theme metadata property named `type`.
 */
export type ThemeType = 'light' | 'dark' | 'hc';

/**
 * Creates a new theme template file with the given name.
 *
 * @param name Theme name.
 * @return Created template file path.
 */
export async function createTemplate(name: string): Promise<string> {
    const fileName = name
        .toLowerCase()
        .replace(/\W+/g, '-')
        .replace(/-$/, '') + '.json';
    const filePath = path.resolve(templatesPath, fileName);
    const template: ThemeTemplate = {
        name: name,
        backgroundColor: Rgba.parse('#000000'),
        foregroundColor: Rgba.parse('#ffffff'),
        metadata: { filePath },
    };
    try {
        await writeJsonFile(filePath, template, { flag: 'wx' });
    } catch (e) {
        if (e.code === 'EEXIST') {
            throw 'Template with a similar name already exists.';
        }
        throw e;
    }
    return filePath;
}

/**
 * Generates VS Code theme files based on the settings of templates.
 */
export async function generateFromTemplates() {
    await clearThemes();
    let themes: Theme[] = [];
    for await (const theme of readTemplates()) {
        const generatedTheme = await generateTheme(theme);
        themes.push(generatedTheme);
    }
    await updateManifest(themes);
}

/**
 * Indicates there are changes requiring themes to be regenerated.
 *
 * @return Whether themes should be regenerated.
 */
export async function hasPendingChanges(): Promise<boolean> {
    let themesPathFiles: string[] = [];
    try {
        themesPathFiles = await readDir(themesPath);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
    const templatesPathFiles = await readDir(templatesPath);
    const isJsonFile = (f: string) => f.endsWith('.json');
    const themeFiles = themesPathFiles.filter(isJsonFile);
    const templateFiles = templatesPathFiles.filter(isJsonFile);
    if (themeFiles.length !== templateFiles.length) {
        return true;
    }
    themeFiles.sort();
    templateFiles.sort();
    return themeFiles.some((f, i) => f !== templateFiles[i]);
}

/**
 * Gets all available theme templates.
 *
 * @return Iterator across theme templates.
 */
export async function* readTemplates(): AsyncIterableIterator<ThemeTemplate> {
    const files = await readDir(templatesPath);
    for (const file of files) {
        const filePath = path.resolve(templatesPath, file);
        const fileData = await readFile(filePath);
        let template = JSON.parse(fileData);
        yield {
            name: template.name,
            default: template.default,
            backgroundColor: Rgba.parse(template.backgroundColor),
            foregroundColor: Rgba.parse(template.foregroundColor),
            metadata: { filePath },
        };
    }
}

/**
 * Removes the given theme template.
 *
 * @param template Theme template to remove.
 */
export async function removeTemplate(template: ThemeTemplate) {
    await removeFile(template.metadata.filePath);
}

/**
 * Deletes all theme files (i.e. with `.json` extension).
 */
async function clearThemes() {
    let files: string[];
    try {
        files = await readDir(themesPath);
    } catch (e) {
        // Themes directory will not exist until themes have been generated before
        if (e.code !== 'ENOENT') {
            throw e;
        }
        return;
    }
    for (const file of files) {
        if (!file.endsWith('.json')) {
            continue;
        }
        const filepath = path.resolve(themesPath, file);
        await removeFile(filepath);
    }
}

/**
 * Generates a VS Code theme file from a given template.
 *
 * @param template Theme template.
 * @return Generated theme details.
 */
async function generateTheme(template: ThemeTemplate): Promise<Theme> {
    const bg = template.backgroundColor;
    const fg = template.foregroundColor;
    const b1 = bg.toHex();
    const b2 = mix(fg, bg, .07).toHex();
    const f1 = fg.toHex();
    const f2 = mix(fg, bg, .8).toHex();
    const f3 = mix(fg, bg, .6).toHex();
    const f4 = mix(fg, bg, .23).toHex();
    const s1 = fadeOut(fg, .18).toHex();
    const s2 = fadeOut(fg, .50).toHex();
    const s3 = fadeOut(fg, .75).toHex();
    const s4 = fadeOut(fg, .92).toHex();
    const s5 = fadeOut(fg, .96).toHex();
    const none = '#0000';
    const theme = {
        'name': template.name,
        'type': (brightness(bg) > brightness(fg) ? 'light' : 'dark') as ThemeType,
        'colors': {
            'activityBar.background': b1,
            'activityBar.border': none,
            'activityBar.dropBackground': s4,
            'activityBar.foreground': f3,
            'activityBarBadge.background': f1,
            'activityBarBadge.foreground': b1,
            'badge.background': f1,
            'badge.foreground': b1,
            'button.background': f1,
            'button.foreground': b1,
            'button.hoverBackground': f1,
            'diffEditor.insertedTextBackground': none,
            'diffEditor.removedTextBackground': none,
            'dropdown.background': b2,
            'dropdown.foreground': f1,
            'dropdown.listBackground': b2,
            'editor.background': b1,
            'editor.findMatchBackground': s4,
            'editor.findMatchBorder': f1,
            'editor.findMatchHighlightBackground': s4,
            'editor.findMatchHighlightBorder': f1,
            'editor.findRangeHighlightBackground': s5,
            'editor.foreground': f1,
            'editor.hoverHighlightBackground': s5,
            'editor.inactiveSelectionBackground': s4,
            'editor.lineHighlightBackground': s5,
            'editor.lineHighlightBorder': none,
            'editor.rangeHighlightBackground': none,
            'editor.selectionBackground': s4,
            'editor.selectionHighlightBackground': s4,
            'editor.wordHighlightBackground': s3,
            'editor.wordHighlightStrongBackground': s3,
            'editorBracketMatch.background': s3,
            'editorBracketMatch.border': none,
            'editorCodeLens.foreground': f4,
            'editorCursor.background': b2,
            'editorCursor.foreground': f1,
            'editorError.foreground': f1,
            'editorGroup.background': b1,
            'editorGroup.border': none,
            'editorGroup.dropBackground': s4,
            'editorGroupHeader.noTabsBackground': b1,
            'editorGroupHeader.tabsBackground': b1,
            'editorGutter.addedBackground': f2,
            'editorGutter.deletedBackground': f2,
            'editorGutter.modifiedBackground': f4,
            'editorHint.foreground': f4,
            'editorHoverWidget.background': b2,
            'editorIndentGuide.background': b2,
            'editorInfo.foreground': f4,
            'editorLineNumber.activeForeground': f3,
            'editorLineNumber.foreground': f4,
            'editorLink.activeForeground': f2,
            'editorOverviewRuler.addedForeground': s3,
            'editorOverviewRuler.border': none,
            'editorOverviewRuler.bracketMatchForeground': s1,
            'editorOverviewRuler.commonContentForeground': none,
            'editorOverviewRuler.currentContentForeground': s3,
            'editorOverviewRuler.deletedForeground': s3,
            'editorOverviewRuler.errorForeground': s2,
            'editorOverviewRuler.findMatchForeground': s1,
            'editorOverviewRuler.incomingContentForeground': s3,
            'editorOverviewRuler.infoForeground': s2,
            'editorOverviewRuler.modifiedForeground': s3,
            'editorOverviewRuler.rangeHighlightForeground': s1,
            'editorOverviewRuler.selectionHighlightForeground': s1,
            'editorOverviewRuler.warningForeground': s2,
            'editorOverviewRuler.wordHighlightForeground': s1,
            'editorOverviewRuler.wordHighlightStrongForeground': s1,
            'editorRuler.foreground': b2,
            'editorSuggestWidget.background': b2,
            'editorSuggestWidget.foreground': f1,
            'editorSuggestWidget.highlightForeground': f1,
            'editorSuggestWidget.selectedBackground': s4,
            'editorUnnecessary.foreground': f4,
            'editorWarning.foreground': f3,
            'editorWhitespace.foreground': b2,
            'editorWidget.background': b2,
            'editorWidget.resizeBorder': f3,
            'errorForeground': f3,
            'focusBorder': f1,
            'foreground': f1,
            'gitDecoration.addedResourceForeground': f1,
            'gitDecoration.conflictingResourceForeground': f1,
            'gitDecoration.deletedResourceForeground': f1,
            'gitDecoration.ignoredResourceForeground': f4,
            'gitDecoration.modifiedResourceForeground': f1,
            'gitDecoration.submoduleResourceForeground': f1,
            'gitDecoration.untrackedResourceForeground': f1,
            'input.background': b2,
            'input.foreground': f1,
            'input.placeholderForeground': f4,
            'inputOption.activeBorder': f2,
            'inputValidation.errorBackground': f4,
            'inputValidation.errorBorder': none,
            'inputValidation.infoBackground': f4,
            'inputValidation.infoBorder': none,
            'inputValidation.warningBackground': f4,
            'inputValidation.warningBorder': none,
            'list.activeSelectionBackground': s4,
            'list.activeSelectionForeground': f1,
            'list.dropBackground': s4,
            'list.errorForeground': f3,
            'list.focusBackground': s4,
            'list.hoverBackground': none,
            'list.inactiveSelectionBackground': s4,
            'list.invalidItemForeground': f3,
            'list.warningForeground': f3,
            'merge.border': b2,
            'merge.commonContentBackground': none,
            'merge.commonHeaderBackground': none,
            'merge.currentContentBackground': none,
            'merge.currentHeaderBackground': none,
            'merge.incomingContentBackground': none,
            'merge.incomingHeaderBackground': none,
            'panel.border': none,
            'panel.dropBackground': s4,
            'panelTitle.activeBorder': none,
            'panelTitle.activeForeground': f1,
            'panelTitle.inactiveForeground': f4,
            'peekView.border': b2,
            'peekViewEditor.background': b2,
            'peekViewEditor.matchHighlightBackground': none,
            'peekViewEditor.matchHighlightBorder': f1,
            'peekViewEditorGutter.background': b2,
            'peekViewResult.background': b2,
            'peekViewResult.lineForeground': f2,
            'peekViewResult.matchHighlightBackground': none,
            'peekViewResult.selectionBackground': s4,
            'peekViewResult.selectionForeground': f2,
            'peekViewTitle.background': b2,
            'peekViewTitleDescription.foreground': f2,
            'peekViewTitleLabel.foreground': f1,
            'progressBar.background': f1,
            'scrollbar.shadow': none,
            'scrollbarSlider.activeBackground': s4,
            'scrollbarSlider.background': s4,
            'scrollbarSlider.hoverBackground': s4,
            'sideBar.background': b1,
            'sideBar.border': none,
            'sideBar.dropBackground': s4,
            'sideBar.foreground': f1,
            'sideBarSectionHeader.background': none,
            'sideBarSectionHeader.foreground': f1,
            'sideBarTitle.foreground': f3,
            'statusBar.background': b1,
            'statusBar.debuggingBackground': f4,
            'statusBar.debuggingForeground': f1,
            'statusBar.foreground': f2,
            'statusBar.noFolderBackground': b1,
            'statusBar.noFolderForeground': f2,
            'statusBarItem.activeBackground': b2,
            'statusBarItem.hoverBackground': b2,
            'statusBarItem.prominentBackground': b2,
            'statusBarItem.prominentHoverBackground': b2,
            'tab.activeBackground': none,
            'tab.activeForeground': f1,
            'tab.border': none,
            'tab.inactiveBackground': none,
            'tab.inactiveForeground': s3,
            'tab.unfocusedActiveForeground': f2,
            'tab.unfocusedInactiveForeground': s3,
            'terminal.background': b1,
            'terminal.border': b2,
            'terminal.foreground': f1,
            'titleBar.activeBackground': b1,
            'titleBar.activeForeground': f1,
            'titleBar.border': none,
            'titleBar.inactiveBackground': b1,
            'titleBar.inactiveForeground': f2,
            'welcomePage.buttonBackground': b2,
            'welcomePage.buttonHoverBackground': b2,
            'widget.shadow': none,
        },
        'tokenColors': [
            {
                'name': 'lang-doc',
                'scope': [
                    'comment',
                    'comment keyword.other',
                    'comment storage.type',
                    'comment string.quoted',
                    'comment markup.heading',
                    'comment markup.inline.raw',
                    'comment markup.raw.block',
                ],
                'settings': {
                    'foreground': f4,
                },
            },
            {
                'name': 'lang-resets',
                'scope': [
                    'entity.name.tag.yaml',
                    'keyword.control.ternary.java',
                    'source.java storage.type.generic',
                    'source.yaml keyword.control',
                    'storage.modifier.import.java',
                    'storage.modifier.lifetime.rust',
                    'storage.modifier.package.java',
                    'storage.type.cs',
                    'storage.type.function.arrow',
                    'storage.type.java',
                    'storage.type.object.array.java',
                    'storage.type.annotation.java',
                    'storage.type.variable.ruby',
                ],
                'settings': {
                    'foreground': f1,
                },
            },
            {
                'name': 'lang-core',
                'scope': [
                    'keyword.control',
                    'keyword.operator.cast',
                    'keyword.operator.expression',
                    'keyword.operator.instanceof',
                    'keyword.operator.logical.python',
                    'keyword.operator.new',
                    'keyword.other',
                    'keyword.reserved.java',
                    'keyword.type',
                    'keyword.channel.go',
                    'keyword.const.go',
                    'keyword.function.go',
                    'keyword.import.go',
                    'keyword.interface.go',
                    'keyword.map.go',
                    'keyword.package.go',
                    'keyword.struct.go',
                    'keyword.type.go',
                    'keyword.var.go',
                    'storage.modifier',
                    'storage.type',
                    'support.type.primitive',
                    'variable.language',
                ],
                'settings': {
                    'foreground': f3,
                },
            },
            {
                'name': 'lang-literals',
                'scope': [
                    'constant.language',
                    'constant.language.boolean',
                    'constant.numeric',
                    'constant.numeric keyword.other',
                    'constant.other.color',
                    'source.yaml string.unquoted',
                    'storage.type.tag-handle.yaml',
                    'string.quoted',
                    'support.constant',
                ],
                'settings': {
                    'foreground': f2,
                },
            },
            {
                'name': 'doc-source',
                'scope': [
                    'markup.inline.raw',
                    'markup.raw.block',
                ],
                'settings': {
                    'foreground': f2,
                },
            },
            {
                'name': 'doc-sections',
                'scope': [
                    'markup.heading',
                    'meta.separator.markdown',
                ],
                'settings': {
                    'foreground': f2,
                },
            },
            {
                'name': 'style-bold',
                'scope': [
                    'markup.bold',
                    'markup.heading',
                    'meta.separator.markdown',
                ],
                'settings': {
                    'fontStyle': 'bold',
                },
            },
            {
                'name': 'style-italic',
                'scope': [
                    'markup.italic',
                ],
                'settings': {
                    'fontStyle': 'italic',
                },
            },
        ],
    };
    try {
        await writeDir(themesPath);
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
    const themeFilename = path.basename(template.metadata.filePath);
    const outPath = path.resolve(themesPath, themeFilename);
    await writeJsonFile(outPath, theme);
    return {
        name: `Core (${theme.name})`,
        type: theme.type,
        metadata: { filePath: outPath },
    };
}

/**
 * Rewrites the `package.json` file to include the specified themes.
 *
 * Necessary because VS Code does not pick up themes from theme file existence alone.
 *
 * @param themes Themes to be contributed.
 */
async function updateManifest(themes: Theme[]) {
    let themeContributions = themes.map(theme => ({
        label: theme.name,
        uiTheme: theme.type === 'dark' ? 'vs-dark' : 'vs',
        path: path.relative(extensionPath, theme.metadata.filePath),
    }));
    // Sort by theme name to assist visual grepping
    themeContributions.sort((a: any, b: any) => a.label.localeCompare(b));
    // Do not use the parsed copy of package.json from the extensions
    // namespace as it contains extra properties which should not be written
    const packageJsonData = await readFile(packageJsonPath);
    let packageJson = JSON.parse(packageJsonData);
    packageJson.contributes.themes = themeContributions;
    await writeJsonFile(packageJsonPath, packageJson);
}

/**
 * Writes JSON-like data to a file.
 *
 * Ensures the output file ends with a newline and strips any metadata properties.
 *
 * @param filePath Target file.
 * @param data JSON-like data to write.
 * @param options Write options.
 */
async function writeJsonFile(filePath: string, data: object, options: any = undefined) {
    const filter = (key: string, value: any) => key !== 'metadata' ? value : undefined;
    const fileData = JSON.stringify(data, filter, 4) + '\n';
    await writeFile(filePath, fileData, options);
}

/**
 * Crudely wraps a function using a callback for results to produce a promise.
 *
 * @param fn Function with a callback as the last parameter.
 * @return Wrapped version of the input function.
 * @todo Should use `util.promisify()`, but VS Code does not come with Node v8
 *       at the time of writing this.
 */
function promisify<T = void>(fn: Function) {
    return function (...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            fn.apply(null, args.concat((err: any, res: T) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }));
        });
    };
}
