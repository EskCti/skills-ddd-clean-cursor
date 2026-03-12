import { createShadcnUiLibrary } from './shadcn.mjs';

const UI_LIBRARY_FACTORIES = {
  shadcn: createShadcnUiLibrary,
};

export function listUiLibraries() {
  return Object.keys(UI_LIBRARY_FACTORIES);
}

export function resolveUiLibrary(name, context) {
  const normalized = String(name || '')
    .trim()
    .toLowerCase();

  const factory = UI_LIBRARY_FACTORIES[normalized];
  if (!factory) {
    return null;
  }

  return factory(context);
}
