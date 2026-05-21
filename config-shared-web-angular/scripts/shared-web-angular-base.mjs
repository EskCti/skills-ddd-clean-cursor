import path from 'node:path';

const BASE_TEMPLATE_RELATIVE_DIR = path.join('templates', 'base');
const BASE_RUNTIME_DEPENDENCIES = [];
const BASE_DEV_DEPENDENCIES = ['tailwindcss', '@tailwindcss/postcss', 'postcss'];
const BASE_REQUIRED_TEMPLATE_FILES = [
  'src/styles.scss',
  'postcss.config.json',
  'src/app/layout/admin-shell/admin-shell.component.ts',
  'src/app/layout/sidebar-menu/sidebar-menu.component.ts',
  'src/app/layout/shell-navigation.config.ts',
  'src/app/layout/app-footer/app-footer.component.ts',
  'src/app/shared/services/shell.service.ts',
  'src/app/features/dashboard/dashboard.component.ts',
  'src/app/features/examples/example-overview.component.ts',
  'src/app/app.routes.shell.ts',
];

export function getBaseScaffoldConfig({ skillRoot, primaryColor, mode }) {
  return {
    name: 'base',
    templateDirs: [path.join(skillRoot, BASE_TEMPLATE_RELATIVE_DIR)],
    requiredTemplateFiles: BASE_REQUIRED_TEMPLATE_FILES,
    replacements: {
      __PRIMARY_COLOR__: primaryColor,
      __BODY_MODE_CLASS__: mode === 'dark' ? 'dark' : '',
      __APP_NAME__: 'Application',
    },
    runtimeDependencies: BASE_RUNTIME_DEPENDENCIES,
    devDependencies: BASE_DEV_DEPENDENCIES,
    legacyFiles: [],
  };
}
