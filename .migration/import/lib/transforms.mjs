// The transforms: one module per source component, components/<component name>.mjs.
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { IMPORT } from './config.mjs';

/** Map(component name -> transform) of every module in components/. */
export async function loadTransforms() {
  const dir = join(IMPORT, 'components');
  const files = readdirSync(dir).filter((f) => f.endsWith('.mjs'));
  const modules = await Promise.all(files.map((f) => import(join(dir, f))));
  return new Map(files.map((f, i) => [basename(f, '.mjs'), modules[i].default]));
}
