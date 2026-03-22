import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  applyExtends,
  esm_default,
  hideBin,
  lib_default
} from "./chunk-ULZB4ED6.js";
import "./chunk-C3C6F2UY.js";

// ../../node_modules/.pnpm/yargs@17.7.2/node_modules/yargs/helpers/helpers.mjs
var applyExtends2 = (config, cwd, mergeExtends) => {
  return applyExtends(config, cwd, mergeExtends, esm_default);
};
export {
  lib_default as Parser,
  applyExtends2 as applyExtends,
  hideBin
};
