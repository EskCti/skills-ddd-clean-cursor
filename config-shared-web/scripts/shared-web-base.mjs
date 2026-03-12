import path from "node:path";

const BASE_TEMPLATE_RELATIVE_DIR = path.join("templates", "base");

const BASE_LEGACY_FILES = [
  "src/shared/context/shell-context.tsx",
  "src/shared/hooks/use-shell.ts",
  "src/shared/lib/utils.ts",
  "src/shared/template/admin-shell.tsx",
  "src/shared/template/public-boxed-layout.tsx",
  "src/app/(private)/private/page.tsx",
  "src/modules/examples/pages/example-overview.page.tsx",
];

export function getBaseScaffoldConfig({ skillRoot, primaryColor, mode }) {
  return {
    name: "base",
    templateDirs: [path.join(skillRoot, BASE_TEMPLATE_RELATIVE_DIR)],
    replacements: {
      __PRIMARY_COLOR__: primaryColor,
      __BODY_MODE_CLASS__: mode === "dark" ? "dark" : "",
    },
    legacyFiles: BASE_LEGACY_FILES,
  };
}
