import path from 'node:path';

const BASE_TEMPLATE_RELATIVE_DIR = path.join('templates', 'base');
const BASE_RUNTIME_DEPENDENCIES = ['react-hook-form'];
const BASE_REQUIRED_TEMPLATE_FILES = [
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/app/(private)/layout.tsx',
  'src/app/(private)/dashboard/page.tsx',
  'src/app/(public)/layout.tsx',
  'src/shared/template/admin-shell.component.tsx',
  'src/shared/components/form/validator/validator.ts',
  'src/shared/components/form/validator/validators.ts',
  'src/modules/examples/index.ts',
  'public/illustrations/empty-dashboard.svg',
  'public/illustrations/empty-dashboard-dark.svg',
];

const BASE_LEGACY_FILES = [
  'src/shared/context/shell-context.tsx',
  'src/shared/hooks/use-shell.ts',
  'src/shared/lib/utils.ts',
  'src/shared/template/admin-shell.tsx',
  'src/shared/template/public-boxed-layout.tsx',
  'src/app/(private)/private/page.tsx',
  'src/modules/examples/pages/example-overview.page.tsx',
];

export function getBaseScaffoldConfig({ skillRoot, primaryColor, mode }) {
  return {
    name: 'base',
    templateDirs: [path.join(skillRoot, BASE_TEMPLATE_RELATIVE_DIR)],
    requiredTemplateFiles: BASE_REQUIRED_TEMPLATE_FILES,
    replacements: {
      __PRIMARY_COLOR__: primaryColor,
      __BODY_MODE_CLASS__: mode === 'dark' ? 'dark' : '',
    },
    runtimeDependencies: BASE_RUNTIME_DEPENDENCIES,
    devDependencies: [],
    legacyFiles: BASE_LEGACY_FILES,
  };
}
