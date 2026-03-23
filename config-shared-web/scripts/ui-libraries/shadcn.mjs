import path from 'node:path';

const SHADCN_TEMPLATE_RELATIVE_DIR = path.join('templates', 'ui-libraries', 'shadcn');

const SHADCN_RUNTIME_DEPENDENCIES = [
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
  'sonner',
  '@radix-ui/react-slot',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-label',
  '@radix-ui/react-popover',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-separator',
  '@radix-ui/react-tabs',
];

const SHADCN_DEV_DEPENDENCIES = ['shadcn'];
const SHADCN_REQUIRED_TEMPLATE_FILES = [
  'components.json',
  'src/shared/lib/class-name.util.ts',
  'src/shared/components/ui/button.tsx',
  'src/shared/components/ui/input.tsx',
  'src/shared/components/ui/dialog.tsx',
  'src/shared/components/ui/toaster.tsx',
];

export function createShadcnUiLibrary({ skillRoot }) {
  return {
    name: 'shadcn',
    label: 'Shadcn UI',
    templateDirs: [path.join(skillRoot, SHADCN_TEMPLATE_RELATIVE_DIR)],
    requiredTemplateFiles: SHADCN_REQUIRED_TEMPLATE_FILES,
    replacements: {},
    runtimeDependencies: SHADCN_RUNTIME_DEPENDENCIES,
    devDependencies: SHADCN_DEV_DEPENDENCIES,
    legacyFiles: [],
  };
}
