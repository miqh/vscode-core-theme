import fs from 'fs';
import path from 'path';
import { extensions } from 'vscode';
import { Rgba, mix, fadeOut } from './color';
import { extensionId } from './constants';

const extensionPath = extensions.getExtension(extensionId)!.extensionPath;

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

interface ThemeOptions {
    name: string;
    filename: string;
    backgroundColor: string;
    foregroundColor: string;
}

/**
 * Generates VS Code theme files based on the settings of templates.
 */
export async function generateFromTemplates() {
    const templatesPath = path.resolve(extensionPath, 'templates');
    const files = await readDir(templatesPath);
    await Promise.all(files.map((file: string) => {
        const filePath = path.resolve(templatesPath, file);
        return readFile(filePath, 'utf8')
            .then(data => {
                let theme: ThemeOptions = JSON.parse(data);
                theme.filename = file;
                return theme;
            })
            .then(theme => generate(theme));
    }));
}

async function generate(options: ThemeOptions) {
    const bg = Rgba.parse(options.backgroundColor);
    const fg = Rgba.parse(options.foregroundColor);
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
        name: options.name,
        colors: {
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
    const outPath = path.resolve(extensionPath, 'themes', options.filename);
    const outData = JSON.stringify(theme, null, 4);
    await writeFile(outPath, outData);
}

/**
 * Crudely wraps a function using a callback for results to produce a promise.
 *
 * @param fn Function with a callback as the last parameter.
 * @return Wrapped version of the input function.
 * @todo Should use `util.promisify()`, but VS Code does not come with Node v8
 *       at the time of writing this.
 */
function promisify(fn: Function) {
    return function (...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            fn.apply(null, args.concat((err: any, res: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }));
        });
    };
}
