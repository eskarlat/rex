import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  ChromeReleaseChannel
} from "./chunk-LOYEZFXG.js";

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/LaunchOptions.js
function convertPuppeteerChannelToBrowsersChannel(channel) {
  switch (channel) {
    case "chrome":
      return ChromeReleaseChannel.STABLE;
    case "chrome-dev":
      return ChromeReleaseChannel.DEV;
    case "chrome-beta":
      return ChromeReleaseChannel.BETA;
    case "chrome-canary":
      return ChromeReleaseChannel.CANARY;
  }
}

export {
  convertPuppeteerChannelToBrowsersChannel
};
/*! Bundled license information:

puppeteer-core/lib/esm/puppeteer/node/LaunchOptions.js:
  (**
   * @license
   * Copyright 2020 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
