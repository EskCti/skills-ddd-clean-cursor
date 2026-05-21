import path from 'node:path';

const BASE_TEMPLATE_RELATIVE_DIR = path.join('templates', 'base');
const BASE_RUNTIME_DEPENDENCIES = [];
const BASE_DEV_DEPENDENCIES = ['tailwindcss', '@tailwindcss/vite'];
const BASE_REQUIRED_TEMPLATE_FILES = [
  'src/assets/main.css',
  'src/layouts/AdminShell.vue',
  'src/components/SidebarMenu.vue',
  'src/components/AppFooter.vue',
  'src/composables/useShell.ts',
  'src/views/DashboardView.vue',
  'src/views/ExampleOverviewView.vue',
  'src/router/shell.routes.ts',
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
