#!/usr/bin/env node

import { createInitFrontendShellScript } from '../../utils/init-frontend-shell.mjs';
import { getBaseScaffoldConfig } from './shared-web-angular-base.mjs';

const main = createInitFrontendShellScript({
  skillName: 'config-shared-web-angular',
  defaultFrontendPath: 'apps/web-angular',
  getBaseScaffoldConfig,
});

main();
