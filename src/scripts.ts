import { writeColorTheme } from "./io";
import { getDefaultColorKeysConfig } from "./package";

export async function postbuild() {
  console.info(
    "generating default colour theme configuration for published package\n",
  );
  await writeColorTheme(getDefaultColorKeysConfig());
}
