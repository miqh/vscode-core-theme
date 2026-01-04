# Changelog

All notable changes to this project will be documented in this file.

## [0.6.1][] - 2026-01-04

- Fix web extension distribution.
- Add missed colour key assignments covering editor peek view and popups that
  contain Git history information.

## 0.6.0 - 2026-01-03

This is a completely experimental rewrite of the extension, primarily motivated
by a long list of overdue issues built-up from personal use. It is published as
a pre-release version for field testing.

- Add automatic colour theme regeneration whenever colour keys are modified
  via extension settings.
- Add support for a limited version of the theme to be used as a web extension.

## [0.5.0][] - 2019-11-17

### Adds
- Theme generation parameters to cover stylable icons and minimap highlighting.

## [0.4.1][] - 2019-05-09

### Changes
- Activation of the extension to check whether generated themes are up to date.
- Extension distribution to no longer pre-package generated themes. 
  Consequently, new installations of the extension will require users to
  generate themes explicitly before being able to use them.

## [0.3.0][] - 2019-04-27

### Adds
- Theme generation parameters to cover the list filter widget and suppress
  styling of more items inside comments.

### Fixes
- Critical issue with the extension failing to activate which made theme
  generation unavailable.

## [0.2.0][] - 2018-10-04

### Adds
- Theme generation parameters to cover sidebar decorations applied to files
  added to Git and to suppress styling some items inside comments.

### Changes
- Rust lifetime items to be styled like literals.

## 0.1.0 - 2018-07-30

First extension release.

[0.6.1]: https://github.com/miqh/vscode-core-theme/compare/0.6.0...0.6.1
[0.5.0]: https://github.com/miqh/vscode-core-theme/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/miqh/vscode-core-theme/compare/0.3.0...0.4.1
[0.3.0]: https://github.com/miqh/vscode-core-theme/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/miqh/vscode-core-theme/compare/0.1.0...0.2.0
