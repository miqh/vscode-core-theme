import * as z from "zod";

import { colorKeys, hideColorKey } from "./package";

const ColorKey = z.enum(
  (colorKeys as string[]).concat(hideColorKey),
  "Invalid colour key.",
);

export const ColorLiteral = z
  .string()
  .regex(
    /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i,
    "Invalid colour value. Must be #RGB, #RGBA, #RRGGBB or #RRGGBBAA.",
  );

/**
 * Simplified colour theme definition structure as required by this extension.
 *
 * The nullability and optionality of some members is applied to help the
 * generated colour theme command output validate.
 *
 * @see https://github.com/microsoft/vscode/blob/74c4ecddf7eabe656235ad6be1d0d862a68cdeb7/src/vs/workbench/services/themes/common/colorThemeSchema.ts#L234
 */
export const ColorTheme = z.object({
  $schema: z.literal("vscode://schemas/color-theme"),
  colors: z.record(z.string(), ColorLiteral.nullable()),
  name: z.string().optional(),
  semanticHighlighting: z.boolean().optional(),
  semanticTokenColors: z.record(z.string(), ColorLiteral).optional(),
  tokenColors: z.array(
    z.object({
      name: z.string().optional(),
      scope: z.string().or(z.array(z.string())).optional(),
      settings: z.object({
        background: ColorLiteral.optional(),
        fontStyle: z.string().optional(),
        foreground: ColorLiteral.optional(),
      }),
    }),
  ),
  type: z.string().optional(),
});

/**
 * Template used to build a colour theme definition.
 */
export const ColorThemeTemplate = z.object({
  colors: z.record(z.string(), ColorKey.nullable()),
  semanticTokenColors: z.record(z.string(), ColorKey),
  tokenColors: z.array(
    z.object({
      scope: z.array(z.string()),
      settings: z.object({
        background: ColorKey.optional(),
        fontStyle: z.string().optional(),
        foreground: ColorKey.optional(),
      }),
    }),
  ),
});

/**
 * Convenience helper type to extract a static type from a Zod schema
 * definition to avoid directly importing Zod throughout the extension.
 */
export type Infer<T extends z.ZodType> = z.infer<T>;
