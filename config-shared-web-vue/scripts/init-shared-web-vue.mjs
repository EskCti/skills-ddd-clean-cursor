#!/usr/bin/env node

import { createInitFrontendShellScript } from '../../utils/init-frontend-shell.mjs';
import { getBaseScaffoldConfig } from './shared-web-vue-base.mjs';

const main = createInitFrontendShellScript({
  skillName: 'config-shared-web-vue',
  defaultFrontendPath: 'apps/web-vue',
  getBaseScaffoldConfig,
});

main();
