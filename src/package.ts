import path from "node:path";

import packageJson from "../package.json";

const configSchemaProps = packageJson.contributes.configuration.properties;

/**
 * Configuration key containing colour key settings.
 */
export const colorKeysConfigKey = "colorKeys";

/**
 * Common namespace prefix used by the extension across areas such as settings.
 */
export const extensionPrefix = "coreTheme";

/**
 * Current extension version.
 */
export const extensionVersion = packageJson.version;

/**
 * Key used for keeping the current extension version in global storage.
 */
export const extensionVersionKey = "version";

/**
 * Special (non-configurable) colour key which visual tokens can target to
 * have themselves explicitly hidden.
 */
export const hideColorKey = "hide";

type ColorKeyProps =
  (typeof configSchemaProps)[`${typeof extensionPrefix}.${typeof colorKeysConfigKey}`]["properties"];

/**
 * All available colour keys for mapping visual tokens.
 */
export const colorKeys = Object.keys(
  configSchemaProps[`${extensionPrefix}.${colorKeysConfigKey}`].properties,
) as readonly (keyof ColorKeyProps)[];

/**
 * Describes the colour keys setting value.
 */
export type ColorKeysConfig = {
  [K in keyof ColorKeyProps]: ColorKeyProps[K] extends { type: infer T }
    ? T
    : unknown;
};

export function getColorThemePath() {
  const [theme] = packageJson.contributes.themes;
  if (!theme) {
    throw new Error("Expected theme contribution entry in package.json.");
  }
  return path.resolve(__dirname, "..", theme.path);
}

export function getDefaultColorKeysConfig() {
  return configSchemaProps[`${extensionPrefix}.${colorKeysConfigKey}`]
    .default as ColorKeysConfig;
}
