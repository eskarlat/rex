import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import {
  require_typescript
} from "./chunk-YGOXEHOS.js";
import {
  ARIAQueryHandler,
  Accessibility,
  AsyncDisposableStack,
  AsyncIterableUtil,
  Browser,
  BrowserContext,
  CDPSession,
  CDPSessionEvent,
  CallbackRegistry,
  ConnectionClosedError,
  ConsoleMessage,
  Coverage,
  DEFAULT_VIEWPORT,
  Deferred,
  DeviceRequestPrompt,
  Dialog,
  DisposableStack,
  ElementHandle,
  EmulationManager,
  EventEmitter,
  FileChooser,
  Frame,
  FrameEvent,
  HTTPRequest,
  HTTPResponse,
  JSHandle,
  Keyboard,
  LazyArg,
  Mouse,
  MouseButton,
  Mutex,
  Page,
  ProtocolError,
  PuppeteerURL,
  Realm,
  SOURCE_URL_REGEX,
  STATUS_TEXTS,
  SecurityDetails,
  Target,
  TargetCloseError,
  TargetType,
  TimeoutError,
  TimeoutSettings,
  TouchError,
  Touchscreen,
  Tracing,
  UTILITY_WORLD_NAME,
  UnsupportedOperation,
  WEB_PERMISSION_TO_PROTOCOL_PERMISSION,
  WebWorker,
  assert,
  asyncDisposeSymbol,
  bindIsolatedHandle,
  bufferCount,
  concatMap,
  createIncrementalIdGenerator,
  createProtocolErrorMessage,
  customQueryHandlers,
  debug,
  debugError,
  disposeSymbol,
  environment,
  evaluationString,
  filter,
  firstValueFrom,
  from,
  fromEmitterEvent,
  fromEvent,
  getReadableAsTypedArray,
  getReadableFromProtocolStream,
  getSourcePuppeteerURLIfAvailable,
  getSourceUrlComment,
  guarded,
  handleError,
  headersArray,
  isErrorLike,
  isNode,
  isString,
  lastValueFrom,
  map,
  mergeUint8Arrays,
  parsePDFOptions,
  race,
  raceWith,
  scriptInjector,
  stringToBase64,
  stringToTypedArray,
  stringifyFunction,
  takeUntil,
  tap,
  throwIfDetached,
  throwIfDisposed,
  timeout,
  timer,
  validateDialogType,
  withSourcePuppeteerURLIfNone
} from "./chunk-A7XEC37O.js";
import {
  NodeWebSocketTransport
} from "./chunk-ICGADTKU.js";
import {
  convertPuppeteerChannelToBrowsersChannel
} from "./chunk-FOU2EXQ2.js";
import {
  Browser as Browser2,
  CDP_WEBSOCKET_ENDPOINT_REGEX,
  TimeoutError as TimeoutError2,
  WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX,
  computeExecutablePath,
  computeSystemExecutablePath,
  createProfile,
  detectBrowserPlatform,
  getInstalledBrowsers,
  launch,
  resolveBuildId,
  uninstall
} from "./chunk-LOYEZFXG.js";
import {
  require_src
} from "./chunk-AWU4Q6CL.js";
import {
  __commonJS,
  __require,
  __toESM
} from "./chunk-C3C6F2UY.js";

// ../../node_modules/.pnpm/resolve-from@4.0.0/node_modules/resolve-from/index.js
var require_resolve_from = __commonJS({
  "../../node_modules/.pnpm/resolve-from@4.0.0/node_modules/resolve-from/index.js"(exports, module) {
    "use strict";
    var path4 = __require("path");
    var Module = __require("module");
    var fs5 = __require("fs");
    var resolveFrom = (fromDir, moduleId, silent) => {
      if (typeof fromDir !== "string") {
        throw new TypeError(`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDir}\``);
      }
      if (typeof moduleId !== "string") {
        throw new TypeError(`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``);
      }
      try {
        fromDir = fs5.realpathSync(fromDir);
      } catch (err) {
        if (err.code === "ENOENT") {
          fromDir = path4.resolve(fromDir);
        } else if (silent) {
          return null;
        } else {
          throw err;
        }
      }
      const fromFile = path4.join(fromDir, "noop.js");
      const resolveFileName = () => Module._resolveFilename(moduleId, {
        id: fromFile,
        filename: fromFile,
        paths: Module._nodeModulePaths(fromDir)
      });
      if (silent) {
        try {
          return resolveFileName();
        } catch (err) {
          return null;
        }
      }
      return resolveFileName();
    };
    module.exports = (fromDir, moduleId) => resolveFrom(fromDir, moduleId);
    module.exports.silent = (fromDir, moduleId) => resolveFrom(fromDir, moduleId, true);
  }
});

// ../../node_modules/.pnpm/callsites@3.1.0/node_modules/callsites/index.js
var require_callsites = __commonJS({
  "../../node_modules/.pnpm/callsites@3.1.0/node_modules/callsites/index.js"(exports, module) {
    "use strict";
    var callsites = () => {
      const _prepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack2) => stack2;
      const stack = new Error().stack.slice(1);
      Error.prepareStackTrace = _prepareStackTrace;
      return stack;
    };
    module.exports = callsites;
    module.exports.default = callsites;
  }
});

// ../../node_modules/.pnpm/parent-module@1.0.1/node_modules/parent-module/index.js
var require_parent_module = __commonJS({
  "../../node_modules/.pnpm/parent-module@1.0.1/node_modules/parent-module/index.js"(exports, module) {
    "use strict";
    var callsites = require_callsites();
    module.exports = (filepath) => {
      const stacks = callsites();
      if (!filepath) {
        return stacks[2].getFileName();
      }
      let seenVal = false;
      stacks.shift();
      for (const stack of stacks) {
        const parentFilepath = stack.getFileName();
        if (typeof parentFilepath !== "string") {
          continue;
        }
        if (parentFilepath === filepath) {
          seenVal = true;
          continue;
        }
        if (parentFilepath === "module.js") {
          continue;
        }
        if (seenVal && parentFilepath !== filepath) {
          return parentFilepath;
        }
      }
    };
  }
});

// ../../node_modules/.pnpm/import-fresh@3.3.1/node_modules/import-fresh/index.js
var require_import_fresh = __commonJS({
  "../../node_modules/.pnpm/import-fresh@3.3.1/node_modules/import-fresh/index.js"(exports, module) {
    "use strict";
    var path4 = __require("path");
    var resolveFrom = require_resolve_from();
    var parentModule = require_parent_module();
    module.exports = (moduleId) => {
      if (typeof moduleId !== "string") {
        throw new TypeError("Expected a string");
      }
      const parentPath = parentModule(__filename);
      const cwd = parentPath ? path4.dirname(parentPath) : __dirname;
      const filePath = resolveFrom(cwd, moduleId);
      const oldModule = __require.cache[filePath];
      if (oldModule && oldModule.parent) {
        let i = oldModule.parent.children.length;
        while (i--) {
          if (oldModule.parent.children[i].id === filePath) {
            oldModule.parent.children.splice(i, 1);
          }
        }
      }
      delete __require.cache[filePath];
      const parent = __require.cache[parentPath];
      return parent === void 0 || parent.require === void 0 ? __require(filePath) : parent.require(filePath);
    };
  }
});

// ../../node_modules/.pnpm/is-arrayish@0.2.1/node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS({
  "../../node_modules/.pnpm/is-arrayish@0.2.1/node_modules/is-arrayish/index.js"(exports, module) {
    "use strict";
    module.exports = function isArrayish(obj) {
      if (!obj) {
        return false;
      }
      return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && obj.splice instanceof Function;
    };
  }
});

// ../../node_modules/.pnpm/error-ex@1.3.4/node_modules/error-ex/index.js
var require_error_ex = __commonJS({
  "../../node_modules/.pnpm/error-ex@1.3.4/node_modules/error-ex/index.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var isArrayish = require_is_arrayish();
    var errorEx = function errorEx2(name, properties) {
      if (!name || name.constructor !== String) {
        properties = name || {};
        name = Error.name;
      }
      var errorExError = function ErrorEXError(message) {
        if (!this) {
          return new ErrorEXError(message);
        }
        message = message instanceof Error ? message.message : message || this.message;
        Error.call(this, message);
        Error.captureStackTrace(this, errorExError);
        this.name = name;
        Object.defineProperty(this, "message", {
          configurable: true,
          enumerable: false,
          get: function() {
            var newMessage = message.split(/\r?\n/g);
            for (var key in properties) {
              if (!properties.hasOwnProperty(key)) {
                continue;
              }
              var modifier = properties[key];
              if ("message" in modifier) {
                newMessage = modifier.message(this[key], newMessage) || newMessage;
                if (!isArrayish(newMessage)) {
                  newMessage = [newMessage];
                }
              }
            }
            return newMessage.join("\n");
          },
          set: function(v) {
            message = v;
          }
        });
        var overwrittenStack = null;
        var stackDescriptor = Object.getOwnPropertyDescriptor(this, "stack");
        var stackGetter = stackDescriptor.get;
        var stackValue = stackDescriptor.value;
        delete stackDescriptor.value;
        delete stackDescriptor.writable;
        stackDescriptor.set = function(newstack) {
          overwrittenStack = newstack;
        };
        stackDescriptor.get = function() {
          var stack = (overwrittenStack || (stackGetter ? stackGetter.call(this) : stackValue)).split(/\r?\n+/g);
          if (!overwrittenStack) {
            stack[0] = this.name + ": " + this.message;
          }
          var lineCount = 1;
          for (var key in properties) {
            if (!properties.hasOwnProperty(key)) {
              continue;
            }
            var modifier = properties[key];
            if ("line" in modifier) {
              var line = modifier.line(this[key]);
              if (line) {
                stack.splice(lineCount++, 0, "    " + line);
              }
            }
            if ("stack" in modifier) {
              modifier.stack(this[key], stack);
            }
          }
          return stack.join("\n");
        };
        Object.defineProperty(this, "stack", stackDescriptor);
      };
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(errorExError.prototype, Error.prototype);
        Object.setPrototypeOf(errorExError, Error);
      } else {
        util.inherits(errorExError, Error);
      }
      return errorExError;
    };
    errorEx.append = function(str, def) {
      return {
        message: function(v, message) {
          v = v || def;
          if (v) {
            message[0] += " " + str.replace("%s", v.toString());
          }
          return message;
        }
      };
    };
    errorEx.line = function(str, def) {
      return {
        line: function(v) {
          v = v || def;
          if (v) {
            return str.replace("%s", v.toString());
          }
          return null;
        }
      };
    };
    module.exports = errorEx;
  }
});

// ../../node_modules/.pnpm/json-parse-even-better-errors@2.3.1/node_modules/json-parse-even-better-errors/index.js
var require_json_parse_even_better_errors = __commonJS({
  "../../node_modules/.pnpm/json-parse-even-better-errors@2.3.1/node_modules/json-parse-even-better-errors/index.js"(exports, module) {
    "use strict";
    var hexify = (char) => {
      const h = char.charCodeAt(0).toString(16).toUpperCase();
      return "0x" + (h.length % 2 ? "0" : "") + h;
    };
    var parseError = (e, txt, context) => {
      if (!txt) {
        return {
          message: e.message + " while parsing empty string",
          position: 0
        };
      }
      const badToken = e.message.match(/^Unexpected token (.) .*position\s+(\d+)/i);
      const errIdx = badToken ? +badToken[2] : e.message.match(/^Unexpected end of JSON.*/i) ? txt.length - 1 : null;
      const msg = badToken ? e.message.replace(/^Unexpected token ./, `Unexpected token ${JSON.stringify(badToken[1])} (${hexify(badToken[1])})`) : e.message;
      if (errIdx !== null && errIdx !== void 0) {
        const start = errIdx <= context ? 0 : errIdx - context;
        const end = errIdx + context >= txt.length ? txt.length : errIdx + context;
        const slice = (start === 0 ? "" : "...") + txt.slice(start, end) + (end === txt.length ? "" : "...");
        const near = txt === slice ? "" : "near ";
        return {
          message: msg + ` while parsing ${near}${JSON.stringify(slice)}`,
          position: errIdx
        };
      } else {
        return {
          message: msg + ` while parsing '${txt.slice(0, context * 2)}'`,
          position: 0
        };
      }
    };
    var JSONParseError = class extends SyntaxError {
      constructor(er, txt, context, caller) {
        context = context || 20;
        const metadata = parseError(er, txt, context);
        super(metadata.message);
        Object.assign(this, metadata);
        this.code = "EJSONPARSE";
        this.systemError = er;
        Error.captureStackTrace(this, caller || this.constructor);
      }
      get name() {
        return this.constructor.name;
      }
      set name(n) {
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    var kIndent = /* @__PURE__ */ Symbol.for("indent");
    var kNewline = /* @__PURE__ */ Symbol.for("newline");
    var formatRE = /^\s*[{\[]((?:\r?\n)+)([\s\t]*)/;
    var emptyRE = /^(?:\{\}|\[\])((?:\r?\n)+)?$/;
    var parseJson = (txt, reviver, context) => {
      const parseText = stripBOM(txt);
      context = context || 20;
      try {
        const [, newline = "\n", indent = "  "] = parseText.match(emptyRE) || parseText.match(formatRE) || [, "", ""];
        const result = JSON.parse(parseText, reviver);
        if (result && typeof result === "object") {
          result[kNewline] = newline;
          result[kIndent] = indent;
        }
        return result;
      } catch (e) {
        if (typeof txt !== "string" && !Buffer.isBuffer(txt)) {
          const isEmptyArray = Array.isArray(txt) && txt.length === 0;
          throw Object.assign(new TypeError(
            `Cannot parse ${isEmptyArray ? "an empty array" : String(txt)}`
          ), {
            code: "EJSONPARSE",
            systemError: e
          });
        }
        throw new JSONParseError(e, parseText, context, parseJson);
      }
    };
    var stripBOM = (txt) => String(txt).replace(/^\uFEFF/, "");
    module.exports = parseJson;
    parseJson.JSONParseError = JSONParseError;
    parseJson.noExceptions = (txt, reviver) => {
      try {
        return JSON.parse(stripBOM(txt), reviver);
      } catch (e) {
      }
    };
  }
});

// ../../node_modules/.pnpm/lines-and-columns@1.2.4/node_modules/lines-and-columns/build/index.js
var require_build = __commonJS({
  "../../node_modules/.pnpm/lines-and-columns@1.2.4/node_modules/lines-and-columns/build/index.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.LinesAndColumns = void 0;
    var LF = "\n";
    var CR = "\r";
    var LinesAndColumns = (
      /** @class */
      (function() {
        function LinesAndColumns2(string) {
          this.string = string;
          var offsets = [0];
          for (var offset = 0; offset < string.length; ) {
            switch (string[offset]) {
              case LF:
                offset += LF.length;
                offsets.push(offset);
                break;
              case CR:
                offset += CR.length;
                if (string[offset] === LF) {
                  offset += LF.length;
                }
                offsets.push(offset);
                break;
              default:
                offset++;
                break;
            }
          }
          this.offsets = offsets;
        }
        LinesAndColumns2.prototype.locationForIndex = function(index) {
          if (index < 0 || index > this.string.length) {
            return null;
          }
          var line = 0;
          var offsets = this.offsets;
          while (offsets[line + 1] <= index) {
            line++;
          }
          var column = index - offsets[line];
          return { line, column };
        };
        LinesAndColumns2.prototype.indexForLocation = function(location) {
          var line = location.line, column = location.column;
          if (line < 0 || line >= this.offsets.length) {
            return null;
          }
          if (column < 0 || column > this.lengthOfLine(line)) {
            return null;
          }
          return this.offsets[line] + column;
        };
        LinesAndColumns2.prototype.lengthOfLine = function(line) {
          var offset = this.offsets[line];
          var nextOffset = line === this.offsets.length - 1 ? this.string.length : this.offsets[line + 1];
          return nextOffset - offset;
        };
        return LinesAndColumns2;
      })()
    );
    exports.LinesAndColumns = LinesAndColumns;
    exports["default"] = LinesAndColumns;
  }
});

// ../../node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "../../node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js"(exports, module) {
    var p = process || {};
    var argv = p.argv || [];
    var env = p.env || {};
    var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let f = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f("\x1B[0m", "\x1B[0m"),
        bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f("\x1B[3m", "\x1B[23m"),
        underline: f("\x1B[4m", "\x1B[24m"),
        inverse: f("\x1B[7m", "\x1B[27m"),
        hidden: f("\x1B[8m", "\x1B[28m"),
        strikethrough: f("\x1B[9m", "\x1B[29m"),
        black: f("\x1B[30m", "\x1B[39m"),
        red: f("\x1B[31m", "\x1B[39m"),
        green: f("\x1B[32m", "\x1B[39m"),
        yellow: f("\x1B[33m", "\x1B[39m"),
        blue: f("\x1B[34m", "\x1B[39m"),
        magenta: f("\x1B[35m", "\x1B[39m"),
        cyan: f("\x1B[36m", "\x1B[39m"),
        white: f("\x1B[37m", "\x1B[39m"),
        gray: f("\x1B[90m", "\x1B[39m"),
        bgBlack: f("\x1B[40m", "\x1B[49m"),
        bgRed: f("\x1B[41m", "\x1B[49m"),
        bgGreen: f("\x1B[42m", "\x1B[49m"),
        bgYellow: f("\x1B[43m", "\x1B[49m"),
        bgBlue: f("\x1B[44m", "\x1B[49m"),
        bgMagenta: f("\x1B[45m", "\x1B[49m"),
        bgCyan: f("\x1B[46m", "\x1B[49m"),
        bgWhite: f("\x1B[47m", "\x1B[49m"),
        blackBright: f("\x1B[90m", "\x1B[39m"),
        redBright: f("\x1B[91m", "\x1B[39m"),
        greenBright: f("\x1B[92m", "\x1B[39m"),
        yellowBright: f("\x1B[93m", "\x1B[39m"),
        blueBright: f("\x1B[94m", "\x1B[39m"),
        magentaBright: f("\x1B[95m", "\x1B[39m"),
        cyanBright: f("\x1B[96m", "\x1B[39m"),
        whiteBright: f("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f("\x1B[100m", "\x1B[49m"),
        bgRedBright: f("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f("\x1B[107m", "\x1B[49m")
      };
    };
    module.exports = createColors();
    module.exports.createColors = createColors;
  }
});

// ../../node_modules/.pnpm/js-tokens@4.0.0/node_modules/js-tokens/index.js
var require_js_tokens = __commonJS({
  "../../node_modules/.pnpm/js-tokens@4.0.0/node_modules/js-tokens/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyus]{1,6}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;
    exports.matchToToken = function(match) {
      var token = { type: "invalid", value: match[0], closed: void 0 };
      if (match[1]) token.type = "string", token.closed = !!(match[3] || match[4]);
      else if (match[5]) token.type = "comment";
      else if (match[6]) token.type = "comment", token.closed = !!match[7];
      else if (match[8]) token.type = "regex";
      else if (match[9]) token.type = "number";
      else if (match[10]) token.type = "name";
      else if (match[11]) token.type = "punctuator";
      else if (match[12]) token.type = "whitespace";
      return token;
    };
  }
});

// ../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/identifier.js
var require_identifier = __commonJS({
  "../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/identifier.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isIdentifierChar = isIdentifierChar;
    exports.isIdentifierName = isIdentifierName;
    exports.isIdentifierStart = isIdentifierStart;
    var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
    var nonASCIIidentifierChars = "\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
    nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
    var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
    var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
    function isInAstralSet(code, set) {
      let pos = 65536;
      for (let i = 0, length = set.length; i < length; i += 2) {
        pos += set[i];
        if (pos > code) return false;
        pos += set[i + 1];
        if (pos >= code) return true;
      }
      return false;
    }
    function isIdentifierStart(code) {
      if (code < 65) return code === 36;
      if (code <= 90) return true;
      if (code < 97) return code === 95;
      if (code <= 122) return true;
      if (code <= 65535) {
        return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
      }
      return isInAstralSet(code, astralIdentifierStartCodes);
    }
    function isIdentifierChar(code) {
      if (code < 48) return code === 36;
      if (code < 58) return true;
      if (code < 65) return false;
      if (code <= 90) return true;
      if (code < 97) return code === 95;
      if (code <= 122) return true;
      if (code <= 65535) {
        return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
      }
      return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
    }
    function isIdentifierName(name) {
      let isFirst = true;
      for (let i = 0; i < name.length; i++) {
        let cp = name.charCodeAt(i);
        if ((cp & 64512) === 55296 && i + 1 < name.length) {
          const trail = name.charCodeAt(++i);
          if ((trail & 64512) === 56320) {
            cp = 65536 + ((cp & 1023) << 10) + (trail & 1023);
          }
        }
        if (isFirst) {
          isFirst = false;
          if (!isIdentifierStart(cp)) {
            return false;
          }
        } else if (!isIdentifierChar(cp)) {
          return false;
        }
      }
      return !isFirst;
    }
  }
});

// ../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/keyword.js
var require_keyword = __commonJS({
  "../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isKeyword = isKeyword;
    exports.isReservedWord = isReservedWord;
    exports.isStrictBindOnlyReservedWord = isStrictBindOnlyReservedWord;
    exports.isStrictBindReservedWord = isStrictBindReservedWord;
    exports.isStrictReservedWord = isStrictReservedWord;
    var reservedWords = {
      keyword: ["break", "case", "catch", "continue", "debugger", "default", "do", "else", "finally", "for", "function", "if", "return", "switch", "throw", "try", "var", "const", "while", "with", "new", "this", "super", "class", "extends", "export", "import", "null", "true", "false", "in", "instanceof", "typeof", "void", "delete"],
      strict: ["implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"],
      strictBind: ["eval", "arguments"]
    };
    var keywords = new Set(reservedWords.keyword);
    var reservedWordsStrictSet = new Set(reservedWords.strict);
    var reservedWordsStrictBindSet = new Set(reservedWords.strictBind);
    function isReservedWord(word, inModule) {
      return inModule && word === "await" || word === "enum";
    }
    function isStrictReservedWord(word, inModule) {
      return isReservedWord(word, inModule) || reservedWordsStrictSet.has(word);
    }
    function isStrictBindOnlyReservedWord(word) {
      return reservedWordsStrictBindSet.has(word);
    }
    function isStrictBindReservedWord(word, inModule) {
      return isStrictReservedWord(word, inModule) || isStrictBindOnlyReservedWord(word);
    }
    function isKeyword(word) {
      return keywords.has(word);
    }
  }
});

// ../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/.pnpm/@babel+helper-validator-identifier@7.28.5/node_modules/@babel/helper-validator-identifier/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "isIdentifierChar", {
      enumerable: true,
      get: function() {
        return _identifier.isIdentifierChar;
      }
    });
    Object.defineProperty(exports, "isIdentifierName", {
      enumerable: true,
      get: function() {
        return _identifier.isIdentifierName;
      }
    });
    Object.defineProperty(exports, "isIdentifierStart", {
      enumerable: true,
      get: function() {
        return _identifier.isIdentifierStart;
      }
    });
    Object.defineProperty(exports, "isKeyword", {
      enumerable: true,
      get: function() {
        return _keyword.isKeyword;
      }
    });
    Object.defineProperty(exports, "isReservedWord", {
      enumerable: true,
      get: function() {
        return _keyword.isReservedWord;
      }
    });
    Object.defineProperty(exports, "isStrictBindOnlyReservedWord", {
      enumerable: true,
      get: function() {
        return _keyword.isStrictBindOnlyReservedWord;
      }
    });
    Object.defineProperty(exports, "isStrictBindReservedWord", {
      enumerable: true,
      get: function() {
        return _keyword.isStrictBindReservedWord;
      }
    });
    Object.defineProperty(exports, "isStrictReservedWord", {
      enumerable: true,
      get: function() {
        return _keyword.isStrictReservedWord;
      }
    });
    var _identifier = require_identifier();
    var _keyword = require_keyword();
  }
});

// ../../node_modules/.pnpm/@babel+code-frame@7.29.0/node_modules/@babel/code-frame/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/.pnpm/@babel+code-frame@7.29.0/node_modules/@babel/code-frame/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var picocolors = require_picocolors();
    var jsTokens = require_js_tokens();
    var helperValidatorIdentifier = require_lib();
    function isColorSupported() {
      return typeof process === "object" && (process.env.FORCE_COLOR === "0" || process.env.FORCE_COLOR === "false") ? false : picocolors.isColorSupported;
    }
    var compose = (f, g) => (v) => f(g(v));
    function buildDefs(colors) {
      return {
        keyword: colors.cyan,
        capitalized: colors.yellow,
        jsxIdentifier: colors.yellow,
        punctuator: colors.yellow,
        number: colors.magenta,
        string: colors.green,
        regex: colors.magenta,
        comment: colors.gray,
        invalid: compose(compose(colors.white, colors.bgRed), colors.bold),
        gutter: colors.gray,
        marker: compose(colors.red, colors.bold),
        message: compose(colors.red, colors.bold),
        reset: colors.reset
      };
    }
    var defsOn = buildDefs(picocolors.createColors(true));
    var defsOff = buildDefs(picocolors.createColors(false));
    function getDefs(enabled) {
      return enabled ? defsOn : defsOff;
    }
    var sometimesKeywords = /* @__PURE__ */ new Set(["as", "async", "from", "get", "of", "set"]);
    var NEWLINE$1 = /\r\n|[\n\r\u2028\u2029]/;
    var BRACKET = /^[()[\]{}]$/;
    var tokenize;
    var JSX_TAG = /^[a-z][\w-]*$/i;
    var getTokenType = function(token, offset, text) {
      if (token.type === "name") {
        const tokenValue = token.value;
        if (helperValidatorIdentifier.isKeyword(tokenValue) || helperValidatorIdentifier.isStrictReservedWord(tokenValue, true) || sometimesKeywords.has(tokenValue)) {
          return "keyword";
        }
        if (JSX_TAG.test(tokenValue) && (text[offset - 1] === "<" || text.slice(offset - 2, offset) === "</")) {
          return "jsxIdentifier";
        }
        const firstChar = String.fromCodePoint(tokenValue.codePointAt(0));
        if (firstChar !== firstChar.toLowerCase()) {
          return "capitalized";
        }
      }
      if (token.type === "punctuator" && BRACKET.test(token.value)) {
        return "bracket";
      }
      if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
        return "punctuator";
      }
      return token.type;
    };
    tokenize = function* (text) {
      let match;
      while (match = jsTokens.default.exec(text)) {
        const token = jsTokens.matchToToken(match);
        yield {
          type: getTokenType(token, match.index, text),
          value: token.value
        };
      }
    };
    function highlight(text) {
      if (text === "") return "";
      const defs = getDefs(true);
      let highlighted = "";
      for (const {
        type,
        value
      } of tokenize(text)) {
        if (type in defs) {
          highlighted += value.split(NEWLINE$1).map((str) => defs[type](str)).join("\n");
        } else {
          highlighted += value;
        }
      }
      return highlighted;
    }
    var deprecationWarningShown = false;
    var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
    function getMarkerLines(loc, source, opts, startLineBaseZero) {
      const startLoc = Object.assign({
        column: 0,
        line: -1
      }, loc.start);
      const endLoc = Object.assign({}, startLoc, loc.end);
      const {
        linesAbove = 2,
        linesBelow = 3
      } = opts || {};
      const startLine = startLoc.line - startLineBaseZero;
      const startColumn = startLoc.column;
      const endLine = endLoc.line - startLineBaseZero;
      const endColumn = endLoc.column;
      let start = Math.max(startLine - (linesAbove + 1), 0);
      let end = Math.min(source.length, endLine + linesBelow);
      if (startLine === -1) {
        start = 0;
      }
      if (endLine === -1) {
        end = source.length;
      }
      const lineDiff = endLine - startLine;
      const markerLines = {};
      if (lineDiff) {
        for (let i = 0; i <= lineDiff; i++) {
          const lineNumber = i + startLine;
          if (!startColumn) {
            markerLines[lineNumber] = true;
          } else if (i === 0) {
            const sourceLength = source[lineNumber - 1].length;
            markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
          } else if (i === lineDiff) {
            markerLines[lineNumber] = [0, endColumn];
          } else {
            const sourceLength = source[lineNumber - i].length;
            markerLines[lineNumber] = [0, sourceLength];
          }
        }
      } else {
        if (startColumn === endColumn) {
          if (startColumn) {
            markerLines[startLine] = [startColumn, 0];
          } else {
            markerLines[startLine] = true;
          }
        } else {
          markerLines[startLine] = [startColumn, endColumn - startColumn];
        }
      }
      return {
        start,
        end,
        markerLines
      };
    }
    function codeFrameColumns(rawLines, loc, opts = {}) {
      const shouldHighlight = opts.forceColor || isColorSupported() && opts.highlightCode;
      const startLineBaseZero = (opts.startLine || 1) - 1;
      const defs = getDefs(shouldHighlight);
      const lines = rawLines.split(NEWLINE);
      const {
        start,
        end,
        markerLines
      } = getMarkerLines(loc, lines, opts, startLineBaseZero);
      const hasColumns = loc.start && typeof loc.start.column === "number";
      const numberMaxWidth = String(end + startLineBaseZero).length;
      const highlightedLines = shouldHighlight ? highlight(rawLines) : rawLines;
      let frame = highlightedLines.split(NEWLINE, end).slice(start, end).map((line, index2) => {
        const number = start + 1 + index2;
        const paddedNumber = ` ${number + startLineBaseZero}`.slice(-numberMaxWidth);
        const gutter = ` ${paddedNumber} |`;
        const hasMarker = markerLines[number];
        const lastMarkerLine = !markerLines[number + 1];
        if (hasMarker) {
          let markerLine = "";
          if (Array.isArray(hasMarker)) {
            const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
            const numberOfMarkers = hasMarker[1] || 1;
            markerLine = ["\n ", defs.gutter(gutter.replace(/\d/g, " ")), " ", markerSpacing, defs.marker("^").repeat(numberOfMarkers)].join("");
            if (lastMarkerLine && opts.message) {
              markerLine += " " + defs.message(opts.message);
            }
          }
          return [defs.marker(">"), defs.gutter(gutter), line.length > 0 ? ` ${line}` : "", markerLine].join("");
        } else {
          return ` ${defs.gutter(gutter)}${line.length > 0 ? ` ${line}` : ""}`;
        }
      }).join("\n");
      if (opts.message && !hasColumns) {
        frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}
${frame}`;
      }
      if (shouldHighlight) {
        return defs.reset(frame);
      } else {
        return frame;
      }
    }
    function index(rawLines, lineNumber, colNumber, opts = {}) {
      if (!deprecationWarningShown) {
        deprecationWarningShown = true;
        const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
        if (process.emitWarning) {
          process.emitWarning(message, "DeprecationWarning");
        } else {
          const deprecationError = new Error(message);
          deprecationError.name = "DeprecationWarning";
          console.warn(new Error(message));
        }
      }
      colNumber = Math.max(colNumber, 0);
      const location = {
        start: {
          column: colNumber,
          line: lineNumber
        }
      };
      return codeFrameColumns(rawLines, location, opts);
    }
    exports.codeFrameColumns = codeFrameColumns;
    exports.default = index;
    exports.highlight = highlight;
  }
});

// ../../node_modules/.pnpm/parse-json@5.2.0/node_modules/parse-json/index.js
var require_parse_json = __commonJS({
  "../../node_modules/.pnpm/parse-json@5.2.0/node_modules/parse-json/index.js"(exports, module) {
    "use strict";
    var errorEx = require_error_ex();
    var fallback = require_json_parse_even_better_errors();
    var { default: LinesAndColumns } = require_build();
    var { codeFrameColumns } = require_lib2();
    var JSONError = errorEx("JSONError", {
      fileName: errorEx.append("in %s"),
      codeFrame: errorEx.append("\n\n%s\n")
    });
    var parseJson = (string, reviver, filename) => {
      if (typeof reviver === "string") {
        filename = reviver;
        reviver = null;
      }
      try {
        try {
          return JSON.parse(string, reviver);
        } catch (error) {
          fallback(string, reviver);
          throw error;
        }
      } catch (error) {
        error.message = error.message.replace(/\n/g, "");
        const indexMatch = error.message.match(/in JSON at position (\d+) while parsing/);
        const jsonError = new JSONError(error);
        if (filename) {
          jsonError.fileName = filename;
        }
        if (indexMatch && indexMatch.length > 0) {
          const lines = new LinesAndColumns(string);
          const index = Number(indexMatch[1]);
          const location = lines.locationForIndex(index);
          const codeFrame = codeFrameColumns(
            string,
            { start: { line: location.line + 1, column: location.column + 1 } },
            { highlightCode: true }
          );
          jsonError.codeFrame = codeFrame;
        }
        throw jsonError;
      }
    };
    parseJson.JSONError = JSONError;
    module.exports = parseJson;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/common.js
var require_common = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/common.js"(exports, module) {
    "use strict";
    function isNothing(subject) {
      return typeof subject === "undefined" || subject === null;
    }
    function isObject(subject) {
      return typeof subject === "object" && subject !== null;
    }
    function toArray(sequence) {
      if (Array.isArray(sequence)) return sequence;
      else if (isNothing(sequence)) return [];
      return [sequence];
    }
    function extend(target, source) {
      var index, length, key, sourceKeys;
      if (source) {
        sourceKeys = Object.keys(source);
        for (index = 0, length = sourceKeys.length; index < length; index += 1) {
          key = sourceKeys[index];
          target[key] = source[key];
        }
      }
      return target;
    }
    function repeat(string, count) {
      var result = "", cycle;
      for (cycle = 0; cycle < count; cycle += 1) {
        result += string;
      }
      return result;
    }
    function isNegativeZero(number) {
      return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
    }
    module.exports.isNothing = isNothing;
    module.exports.isObject = isObject;
    module.exports.toArray = toArray;
    module.exports.repeat = repeat;
    module.exports.isNegativeZero = isNegativeZero;
    module.exports.extend = extend;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/exception.js
var require_exception = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/exception.js"(exports, module) {
    "use strict";
    function formatError(exception, compact) {
      var where = "", message = exception.reason || "(unknown reason)";
      if (!exception.mark) return message;
      if (exception.mark.name) {
        where += 'in "' + exception.mark.name + '" ';
      }
      where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
      if (!compact && exception.mark.snippet) {
        where += "\n\n" + exception.mark.snippet;
      }
      return message + " " + where;
    }
    function YAMLException(reason, mark) {
      Error.call(this);
      this.name = "YAMLException";
      this.reason = reason;
      this.mark = mark;
      this.message = formatError(this, false);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack || "";
      }
    }
    YAMLException.prototype = Object.create(Error.prototype);
    YAMLException.prototype.constructor = YAMLException;
    YAMLException.prototype.toString = function toString(compact) {
      return this.name + ": " + formatError(this, compact);
    };
    module.exports = YAMLException;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/snippet.js
var require_snippet = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/snippet.js"(exports, module) {
    "use strict";
    var common = require_common();
    function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
      var head = "";
      var tail = "";
      var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
      if (position - lineStart > maxHalfLength) {
        head = " ... ";
        lineStart = position - maxHalfLength + head.length;
      }
      if (lineEnd - position > maxHalfLength) {
        tail = " ...";
        lineEnd = position + maxHalfLength - tail.length;
      }
      return {
        str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
        pos: position - lineStart + head.length
        // relative position
      };
    }
    function padStart(string, max) {
      return common.repeat(" ", max - string.length) + string;
    }
    function makeSnippet(mark, options) {
      options = Object.create(options || null);
      if (!mark.buffer) return null;
      if (!options.maxLength) options.maxLength = 79;
      if (typeof options.indent !== "number") options.indent = 1;
      if (typeof options.linesBefore !== "number") options.linesBefore = 3;
      if (typeof options.linesAfter !== "number") options.linesAfter = 2;
      var re = /\r?\n|\r|\0/g;
      var lineStarts = [0];
      var lineEnds = [];
      var match;
      var foundLineNo = -1;
      while (match = re.exec(mark.buffer)) {
        lineEnds.push(match.index);
        lineStarts.push(match.index + match[0].length);
        if (mark.position <= match.index && foundLineNo < 0) {
          foundLineNo = lineStarts.length - 2;
        }
      }
      if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
      var result = "", i, line;
      var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
      var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
      for (i = 1; i <= options.linesBefore; i++) {
        if (foundLineNo - i < 0) break;
        line = getLine(
          mark.buffer,
          lineStarts[foundLineNo - i],
          lineEnds[foundLineNo - i],
          mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
          maxLineLength
        );
        result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
      }
      line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
      result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
      result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
      for (i = 1; i <= options.linesAfter; i++) {
        if (foundLineNo + i >= lineEnds.length) break;
        line = getLine(
          mark.buffer,
          lineStarts[foundLineNo + i],
          lineEnds[foundLineNo + i],
          mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
          maxLineLength
        );
        result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
      }
      return result.replace(/\n$/, "");
    }
    module.exports = makeSnippet;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type.js
var require_type = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type.js"(exports, module) {
    "use strict";
    var YAMLException = require_exception();
    var TYPE_CONSTRUCTOR_OPTIONS = [
      "kind",
      "multi",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "representName",
      "defaultStyle",
      "styleAliases"
    ];
    var YAML_NODE_KINDS = [
      "scalar",
      "sequence",
      "mapping"
    ];
    function compileStyleAliases(map2) {
      var result = {};
      if (map2 !== null) {
        Object.keys(map2).forEach(function(style) {
          map2[style].forEach(function(alias) {
            result[String(alias)] = style;
          });
        });
      }
      return result;
    }
    function Type(tag, options) {
      options = options || {};
      Object.keys(options).forEach(function(name) {
        if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
          throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
        }
      });
      this.options = options;
      this.tag = tag;
      this.kind = options["kind"] || null;
      this.resolve = options["resolve"] || function() {
        return true;
      };
      this.construct = options["construct"] || function(data) {
        return data;
      };
      this.instanceOf = options["instanceOf"] || null;
      this.predicate = options["predicate"] || null;
      this.represent = options["represent"] || null;
      this.representName = options["representName"] || null;
      this.defaultStyle = options["defaultStyle"] || null;
      this.multi = options["multi"] || false;
      this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
      if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
        throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
      }
    }
    module.exports = Type;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema.js
var require_schema = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema.js"(exports, module) {
    "use strict";
    var YAMLException = require_exception();
    var Type = require_type();
    function compileList(schema, name) {
      var result = [];
      schema[name].forEach(function(currentType) {
        var newIndex = result.length;
        result.forEach(function(previousType, previousIndex) {
          if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
            newIndex = previousIndex;
          }
        });
        result[newIndex] = currentType;
      });
      return result;
    }
    function compileMap() {
      var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;
      function collectType(type) {
        if (type.multi) {
          result.multi[type.kind].push(type);
          result.multi["fallback"].push(type);
        } else {
          result[type.kind][type.tag] = result["fallback"][type.tag] = type;
        }
      }
      for (index = 0, length = arguments.length; index < length; index += 1) {
        arguments[index].forEach(collectType);
      }
      return result;
    }
    function Schema(definition) {
      return this.extend(definition);
    }
    Schema.prototype.extend = function extend(definition) {
      var implicit = [];
      var explicit = [];
      if (definition instanceof Type) {
        explicit.push(definition);
      } else if (Array.isArray(definition)) {
        explicit = explicit.concat(definition);
      } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
        if (definition.implicit) implicit = implicit.concat(definition.implicit);
        if (definition.explicit) explicit = explicit.concat(definition.explicit);
      } else {
        throw new YAMLException("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
      }
      implicit.forEach(function(type) {
        if (!(type instanceof Type)) {
          throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
        if (type.loadKind && type.loadKind !== "scalar") {
          throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
        }
        if (type.multi) {
          throw new YAMLException("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
        }
      });
      explicit.forEach(function(type) {
        if (!(type instanceof Type)) {
          throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
      });
      var result = Object.create(Schema.prototype);
      result.implicit = (this.implicit || []).concat(implicit);
      result.explicit = (this.explicit || []).concat(explicit);
      result.compiledImplicit = compileList(result, "implicit");
      result.compiledExplicit = compileList(result, "explicit");
      result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
      return result;
    };
    module.exports = Schema;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/str.js
var require_str = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/str.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/seq.js
var require_seq = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/seq.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/map.js
var require_map = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/map.js"(exports, module) {
    "use strict";
    var Type = require_type();
    module.exports = new Type("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/failsafe.js
var require_failsafe = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/failsafe.js"(exports, module) {
    "use strict";
    var Schema = require_schema();
    module.exports = new Schema({
      explicit: [
        require_str(),
        require_seq(),
        require_map()
      ]
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/null.js
var require_null = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/null.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlNull(data) {
      if (data === null) return true;
      var max = data.length;
      return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
    }
    function constructYamlNull() {
      return null;
    }
    function isNull(object) {
      return object === null;
    }
    module.exports = new Type("tag:yaml.org,2002:null", {
      kind: "scalar",
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function() {
          return "~";
        },
        lowercase: function() {
          return "null";
        },
        uppercase: function() {
          return "NULL";
        },
        camelcase: function() {
          return "Null";
        },
        empty: function() {
          return "";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/bool.js
var require_bool = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/bool.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlBoolean(data) {
      if (data === null) return false;
      var max = data.length;
      return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
    }
    function constructYamlBoolean(data) {
      return data === "true" || data === "True" || data === "TRUE";
    }
    function isBoolean(object) {
      return Object.prototype.toString.call(object) === "[object Boolean]";
    }
    module.exports = new Type("tag:yaml.org,2002:bool", {
      kind: "scalar",
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function(object) {
          return object ? "true" : "false";
        },
        uppercase: function(object) {
          return object ? "TRUE" : "FALSE";
        },
        camelcase: function(object) {
          return object ? "True" : "False";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/int.js
var require_int = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/int.js"(exports, module) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    function isHexCode(c) {
      return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
    }
    function isOctCode(c) {
      return 48 <= c && c <= 55;
    }
    function isDecCode(c) {
      return 48 <= c && c <= 57;
    }
    function resolveYamlInteger(data) {
      if (data === null) return false;
      var max = data.length, index = 0, hasDigits = false, ch;
      if (!max) return false;
      ch = data[index];
      if (ch === "-" || ch === "+") {
        ch = data[++index];
      }
      if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (ch !== "0" && ch !== "1") return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "x") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (!isHexCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "o") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
      }
      if (ch === "_") return false;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isDecCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      if (!hasDigits || ch === "_") return false;
      return true;
    }
    function constructYamlInteger(data) {
      var value = data, sign = 1, ch;
      if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
      }
      ch = value[0];
      if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
      }
      if (value === "0") return 0;
      if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
        if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
      }
      return sign * parseInt(value, 10);
    }
    function isInteger(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
    }
    module.exports = new Type("tag:yaml.org,2002:int", {
      kind: "scalar",
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary: function(obj) {
          return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
        },
        octal: function(obj) {
          return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
        },
        decimal: function(obj) {
          return obj.toString(10);
        },
        /* eslint-disable max-len */
        hexadecimal: function(obj) {
          return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
        }
      },
      defaultStyle: "decimal",
      styleAliases: {
        binary: [2, "bin"],
        octal: [8, "oct"],
        decimal: [10, "dec"],
        hexadecimal: [16, "hex"]
      }
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/float.js
var require_float = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/float.js"(exports, module) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    var YAML_FLOAT_PATTERN = new RegExp(
      // 2.5e4, 2.5 and integers
      "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
    );
    function resolveYamlFloat(data) {
      if (data === null) return false;
      if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === "_") {
        return false;
      }
      return true;
    }
    function constructYamlFloat(data) {
      var value, sign;
      value = data.replace(/_/g, "").toLowerCase();
      sign = value[0] === "-" ? -1 : 1;
      if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
      }
      if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      } else if (value === ".nan") {
        return NaN;
      }
      return sign * parseFloat(value, 10);
    }
    var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
    function representYamlFloat(object, style) {
      var res;
      if (isNaN(object)) {
        switch (style) {
          case "lowercase":
            return ".nan";
          case "uppercase":
            return ".NAN";
          case "camelcase":
            return ".NaN";
        }
      } else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return ".inf";
          case "uppercase":
            return ".INF";
          case "camelcase":
            return ".Inf";
        }
      } else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return "-.inf";
          case "uppercase":
            return "-.INF";
          case "camelcase":
            return "-.Inf";
        }
      } else if (common.isNegativeZero(object)) {
        return "-0.0";
      }
      res = object.toString(10);
      return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
    }
    function isFloat(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
    }
    module.exports = new Type("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/json.js
var require_json = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/json.js"(exports, module) {
    "use strict";
    module.exports = require_failsafe().extend({
      implicit: [
        require_null(),
        require_bool(),
        require_int(),
        require_float()
      ]
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/core.js
var require_core = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/core.js"(exports, module) {
    "use strict";
    module.exports = require_json();
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/timestamp.js
var require_timestamp = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/timestamp.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var YAML_DATE_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
    );
    var YAML_TIMESTAMP_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
    );
    function resolveYamlTimestamp(data) {
      if (data === null) return false;
      if (YAML_DATE_REGEXP.exec(data) !== null) return true;
      if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
      return false;
    }
    function constructYamlTimestamp(data) {
      var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
      match = YAML_DATE_REGEXP.exec(data);
      if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
      if (match === null) throw new Error("Date resolve error");
      year = +match[1];
      month = +match[2] - 1;
      day = +match[3];
      if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
      }
      hour = +match[4];
      minute = +match[5];
      second = +match[6];
      if (match[7]) {
        fraction = match[7].slice(0, 3);
        while (fraction.length < 3) {
          fraction += "0";
        }
        fraction = +fraction;
      }
      if (match[9]) {
        tz_hour = +match[10];
        tz_minute = +(match[11] || 0);
        delta = (tz_hour * 60 + tz_minute) * 6e4;
        if (match[9] === "-") delta = -delta;
      }
      date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
      if (delta) date.setTime(date.getTime() - delta);
      return date;
    }
    function representYamlTimestamp(object) {
      return object.toISOString();
    }
    module.exports = new Type("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/merge.js
var require_merge = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/merge.js"(exports, module) {
    "use strict";
    var Type = require_type();
    function resolveYamlMerge(data) {
      return data === "<<" || data === null;
    }
    module.exports = new Type("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/binary.js
var require_binary = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/binary.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    function resolveYamlBinary(data) {
      if (data === null) return false;
      var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        code = map2.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
      }
      return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
      var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
      for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
          result.push(bits >> 16 & 255);
          result.push(bits >> 8 & 255);
          result.push(bits & 255);
        }
        bits = bits << 6 | map2.indexOf(input.charAt(idx));
      }
      tailbits = max % 4 * 6;
      if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
      } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
      }
      return new Uint8Array(result);
    }
    function representYamlBinary(object) {
      var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
          result += map2[bits >> 18 & 63];
          result += map2[bits >> 12 & 63];
          result += map2[bits >> 6 & 63];
          result += map2[bits & 63];
        }
        bits = (bits << 8) + object[idx];
      }
      tail = max % 3;
      if (tail === 0) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      } else if (tail === 2) {
        result += map2[bits >> 10 & 63];
        result += map2[bits >> 4 & 63];
        result += map2[bits << 2 & 63];
        result += map2[64];
      } else if (tail === 1) {
        result += map2[bits >> 2 & 63];
        result += map2[bits << 4 & 63];
        result += map2[64];
        result += map2[64];
      }
      return result;
    }
    function isBinary(obj) {
      return Object.prototype.toString.call(obj) === "[object Uint8Array]";
    }
    module.exports = new Type("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/omap.js
var require_omap = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/omap.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _toString = Object.prototype.toString;
    function resolveYamlOmap(data) {
      if (data === null) return true;
      var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for (pairKey in pair) {
          if (_hasOwnProperty.call(pair, pairKey)) {
            if (!pairHasKey) pairHasKey = true;
            else return false;
          }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
      }
      return true;
    }
    function constructYamlOmap(data) {
      return data !== null ? data : [];
    }
    module.exports = new Type("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/pairs.js
var require_pairs = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/pairs.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _toString = Object.prototype.toString;
    function resolveYamlPairs(data) {
      if (data === null) return true;
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        if (_toString.call(pair) !== "[object Object]") return false;
        keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [keys[0], pair[keys[0]]];
      }
      return true;
    }
    function constructYamlPairs(data) {
      if (data === null) return [];
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        keys = Object.keys(pair);
        result[index] = [keys[0], pair[keys[0]]];
      }
      return result;
    }
    module.exports = new Type("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/set.js
var require_set = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/type/set.js"(exports, module) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function resolveYamlSet(data) {
      if (data === null) return true;
      var key, object = data;
      for (key in object) {
        if (_hasOwnProperty.call(object, key)) {
          if (object[key] !== null) return false;
        }
      }
      return true;
    }
    function constructYamlSet(data) {
      return data !== null ? data : {};
    }
    module.exports = new Type("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/default.js
var require_default = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/schema/default.js"(exports, module) {
    "use strict";
    module.exports = require_core().extend({
      implicit: [
        require_timestamp(),
        require_merge()
      ],
      explicit: [
        require_binary(),
        require_omap(),
        require_pairs(),
        require_set()
      ]
    });
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/loader.js
var require_loader = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/loader.js"(exports, module) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var makeSnippet = require_snippet();
    var DEFAULT_SCHEMA = require_default();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CONTEXT_FLOW_IN = 1;
    var CONTEXT_FLOW_OUT = 2;
    var CONTEXT_BLOCK_IN = 3;
    var CONTEXT_BLOCK_OUT = 4;
    var CHOMPING_CLIP = 1;
    var CHOMPING_STRIP = 2;
    var CHOMPING_KEEP = 3;
    var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function _class(obj) {
      return Object.prototype.toString.call(obj);
    }
    function is_EOL(c) {
      return c === 10 || c === 13;
    }
    function is_WHITE_SPACE(c) {
      return c === 9 || c === 32;
    }
    function is_WS_OR_EOL(c) {
      return c === 9 || c === 32 || c === 10 || c === 13;
    }
    function is_FLOW_INDICATOR(c) {
      return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
    }
    function fromHexCode(c) {
      var lc;
      if (48 <= c && c <= 57) {
        return c - 48;
      }
      lc = c | 32;
      if (97 <= lc && lc <= 102) {
        return lc - 97 + 10;
      }
      return -1;
    }
    function escapedHexLen(c) {
      if (c === 120) {
        return 2;
      }
      if (c === 117) {
        return 4;
      }
      if (c === 85) {
        return 8;
      }
      return 0;
    }
    function fromDecimalCode(c) {
      if (48 <= c && c <= 57) {
        return c - 48;
      }
      return -1;
    }
    function simpleEscapeSequence(c) {
      return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
    }
    function charFromCodepoint(c) {
      if (c <= 65535) {
        return String.fromCharCode(c);
      }
      return String.fromCharCode(
        (c - 65536 >> 10) + 55296,
        (c - 65536 & 1023) + 56320
      );
    }
    function setProperty(object, key, value) {
      if (key === "__proto__") {
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value
        });
      } else {
        object[key] = value;
      }
    }
    var simpleEscapeCheck = new Array(256);
    var simpleEscapeMap = new Array(256);
    for (i = 0; i < 256; i++) {
      simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
      simpleEscapeMap[i] = simpleEscapeSequence(i);
    }
    var i;
    function State(input, options) {
      this.input = input;
      this.filename = options["filename"] || null;
      this.schema = options["schema"] || DEFAULT_SCHEMA;
      this.onWarning = options["onWarning"] || null;
      this.legacy = options["legacy"] || false;
      this.json = options["json"] || false;
      this.listener = options["listener"] || null;
      this.implicitTypes = this.schema.compiledImplicit;
      this.typeMap = this.schema.compiledTypeMap;
      this.length = input.length;
      this.position = 0;
      this.line = 0;
      this.lineStart = 0;
      this.lineIndent = 0;
      this.firstTabInLine = -1;
      this.documents = [];
    }
    function generateError(state, message) {
      var mark = {
        name: state.filename,
        buffer: state.input.slice(0, -1),
        // omit trailing \0
        position: state.position,
        line: state.line,
        column: state.position - state.lineStart
      };
      mark.snippet = makeSnippet(mark);
      return new YAMLException(message, mark);
    }
    function throwError(state, message) {
      throw generateError(state, message);
    }
    function throwWarning(state, message) {
      if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
      }
    }
    var directiveHandlers = {
      YAML: function handleYamlDirective(state, name, args) {
        var match, major, minor;
        if (state.version !== null) {
          throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
          throwError(state, "YAML directive accepts exactly one argument");
        }
        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
          throwError(state, "ill-formed argument of the YAML directive");
        }
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        if (major !== 1) {
          throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
          throwWarning(state, "unsupported YAML version of the document");
        }
      },
      TAG: function handleTagDirective(state, name, args) {
        var handle, prefix;
        if (args.length !== 2) {
          throwError(state, "TAG directive accepts exactly two arguments");
        }
        handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        try {
          prefix = decodeURIComponent(prefix);
        } catch (err) {
          throwError(state, "tag prefix is malformed: " + prefix);
        }
        state.tagMap[handle] = prefix;
      }
    };
    function captureSegment(state, start, end, checkJson) {
      var _position, _length, _character, _result;
      if (start < end) {
        _result = state.input.slice(start, end);
        if (checkJson) {
          for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
            _character = _result.charCodeAt(_position);
            if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
              throwError(state, "expected valid JSON character");
            }
          }
        } else if (PATTERN_NON_PRINTABLE.test(_result)) {
          throwError(state, "the stream contains non-printable characters");
        }
        state.result += _result;
      }
    }
    function mergeMappings(state, destination, source, overridableKeys) {
      var sourceKeys, key, index, quantity;
      if (!common.isObject(source)) {
        throwError(state, "cannot merge mappings; the provided source object is unacceptable");
      }
      sourceKeys = Object.keys(source);
      for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        key = sourceKeys[index];
        if (!_hasOwnProperty.call(destination, key)) {
          setProperty(destination, key, source[key]);
          overridableKeys[key] = true;
        }
      }
    }
    function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
      var index, quantity;
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index])) {
            throwError(state, "nested arrays are not supported inside keys");
          }
          if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
            keyNode[index] = "[object Object]";
          }
        }
      }
      if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
      }
      keyNode = String(keyNode);
      if (_result === null) {
        _result = {};
      }
      if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
          for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            mergeMappings(state, _result, valueNode[index], overridableKeys);
          }
        } else {
          mergeMappings(state, _result, valueNode, overridableKeys);
        }
      } else {
        if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
          state.line = startLine || state.line;
          state.lineStart = startLineStart || state.lineStart;
          state.position = startPos || state.position;
          throwError(state, "duplicated mapping key");
        }
        setProperty(_result, keyNode, valueNode);
        delete overridableKeys[keyNode];
      }
      return _result;
    }
    function readLineBreak(state) {
      var ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 10) {
        state.position++;
      } else if (ch === 13) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 10) {
          state.position++;
        }
      } else {
        throwError(state, "a line break is expected");
      }
      state.line += 1;
      state.lineStart = state.position;
      state.firstTabInLine = -1;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
      var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          if (ch === 9 && state.firstTabInLine === -1) {
            state.firstTabInLine = state.position;
          }
          ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 10 && ch !== 13 && ch !== 0);
        }
        if (is_EOL(ch)) {
          readLineBreak(state);
          ch = state.input.charCodeAt(state.position);
          lineBreaks++;
          state.lineIndent = 0;
          while (ch === 32) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
          }
        } else {
          break;
        }
      }
      if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
      }
      return lineBreaks;
    }
    function testDocumentSeparator(state) {
      var _position = state.position, ch;
      ch = state.input.charCodeAt(_position);
      if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || is_WS_OR_EOL(ch)) {
          return true;
        }
      }
      return false;
    }
    function writeFoldedLines(state, count) {
      if (count === 1) {
        state.result += " ";
      } else if (count > 1) {
        state.result += common.repeat("\n", count - 1);
      }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
      var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
      ch = state.input.charCodeAt(state.position);
      if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
        return false;
      }
      if (ch === 63 || ch === 45) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }
      state.kind = "scalar";
      state.result = "";
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
      while (ch !== 0) {
        if (ch === 58) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }
        } else if (ch === 35) {
          preceding = state.input.charCodeAt(state.position - 1);
          if (is_WS_OR_EOL(preceding)) {
            break;
          }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
          break;
        } else if (is_EOL(ch)) {
          _line = state.line;
          _lineStart = state.lineStart;
          _lineIndent = state.lineIndent;
          skipSeparationSpace(state, false, -1);
          if (state.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state.input.charCodeAt(state.position);
            continue;
          } else {
            state.position = captureEnd;
            state.line = _line;
            state.lineStart = _lineStart;
            state.lineIndent = _lineIndent;
            break;
          }
        }
        if (hasPendingContent) {
          captureSegment(state, captureStart, captureEnd, false);
          writeFoldedLines(state, state.line - _line);
          captureStart = captureEnd = state.position;
          hasPendingContent = false;
        }
        if (!is_WHITE_SPACE(ch)) {
          captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, captureEnd, false);
      if (state.result) {
        return true;
      }
      state.kind = _kind;
      state.result = _result;
      return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
      var ch, captureStart, captureEnd;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 39) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 39) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (ch === 39) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
            return true;
          }
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
      var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 34) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 34) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;
        } else if (ch === 92) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent);
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;
            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);
              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;
              } else {
                throwError(state, "expected hexadecimal character");
              }
            }
            state.result += charFromCodepoint(hexResult);
            state.position++;
          } else {
            throwError(state, "unknown escape sequence");
          }
          captureStart = captureEnd = state.position;
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
      var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 91) {
        terminator = 93;
        isMapping = false;
        _result = [];
      } else if (ch === 123) {
        terminator = 125;
        isMapping = true;
        _result = {};
      } else {
        return false;
      }
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(++state.position);
      while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
          state.position++;
          state.tag = _tag;
          state.anchor = _anchor;
          state.kind = isMapping ? "mapping" : "sequence";
          state.result = _result;
          return true;
        } else if (!readNext) {
          throwError(state, "missed comma between flow collection entries");
        } else if (ch === 44) {
          throwError(state, "expected the node content, but found ','");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }
        _line = state.line;
        _lineStart = state.lineStart;
        _pos = state.position;
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === _line) && ch === 58) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }
        if (isMapping) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
        } else if (isPair) {
          _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
        } else {
          _result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 44) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
          readNext = false;
        }
      }
      throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
      var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 124) {
        folding = false;
      } else if (ch === 62) {
        folding = true;
      } else {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
        if (ch === 43 || ch === 45) {
          if (CHOMPING_CLIP === chomping) {
            chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, "repeat of a chomping mode identifier");
          }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
          if (tmp === 0) {
            throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
          } else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else {
            throwError(state, "repeat of an indentation width identifier");
          }
        } else {
          break;
        }
      }
      if (is_WHITE_SPACE(ch)) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (is_WHITE_SPACE(ch));
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (!is_EOL(ch) && ch !== 0);
        }
      }
      while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
          textIndent = state.lineIndent;
        }
        if (is_EOL(ch)) {
          emptyLines++;
          continue;
        }
        if (state.lineIndent < textIndent) {
          if (chomping === CHOMPING_KEEP) {
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (chomping === CHOMPING_CLIP) {
            if (didReadContent) {
              state.result += "\n";
            }
          }
          break;
        }
        if (folding) {
          if (is_WHITE_SPACE(ch)) {
            atMoreIndented = true;
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state.result += common.repeat("\n", emptyLines + 1);
          } else if (emptyLines === 0) {
            if (didReadContent) {
              state.result += " ";
            }
          } else {
            state.result += common.repeat("\n", emptyLines);
          }
        } else {
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        captureStart = state.position;
        while (!is_EOL(ch) && ch !== 0) {
          ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
      }
      return true;
    }
    function readBlockSequence(state, nodeIndent) {
      var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
      if (state.firstTabInLine !== -1) return false;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, "tab characters must not be used in indentation");
        }
        if (ch !== 45) {
          break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!is_WS_OR_EOL(following)) {
          break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
          if (state.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state.input.charCodeAt(state.position);
            continue;
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "sequence";
        state.result = _result;
        return true;
      }
      return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
      var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
      if (state.firstTabInLine !== -1) return false;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (!atExplicitKey && state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, "tab characters must not be used in indentation");
        }
        following = state.input.charCodeAt(state.position + 1);
        _line = state.line;
        if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
          if (ch === 63) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
            atExplicitKey = false;
            allowCompact = true;
          } else {
            throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
          }
          state.position += 1;
          ch = following;
        } else {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
          if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
            break;
          }
          if (state.line === _line) {
            ch = state.input.charCodeAt(state.position);
            while (is_WHITE_SPACE(ch)) {
              ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 58) {
              ch = state.input.charCodeAt(++state.position);
              if (!is_WS_OR_EOL(ch)) {
                throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
              }
              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
                keyTag = keyNode = valueNode = null;
              }
              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;
            } else if (detected) {
              throwError(state, "can not read an implicit mapping pair; a colon is missed");
            } else {
              state.tag = _tag;
              state.anchor = _anchor;
              return true;
            }
          } else if (detected) {
            throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        }
        if (state.line === _line || state.lineIndent > nodeIndent) {
          if (atExplicitKey) {
            _keyLine = state.line;
            _keyLineStart = state.lineStart;
            _keyPos = state.position;
          }
          if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
            if (atExplicitKey) {
              keyNode = state.result;
            } else {
              valueNode = state.result;
            }
          }
          if (!atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          skipSeparationSpace(state, true, -1);
          ch = state.input.charCodeAt(state.position);
        }
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "mapping";
        state.result = _result;
      }
      return detected;
    }
    function readTagProperty(state) {
      var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 33) return false;
      if (state.tag !== null) {
        throwError(state, "duplication of a tag property");
      }
      ch = state.input.charCodeAt(++state.position);
      if (ch === 60) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
      } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
      } else {
        tagHandle = "!";
      }
      _position = state.position;
      if (isVerbatim) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && ch !== 62);
        if (state.position < state.length) {
          tagName = state.input.slice(_position, state.position);
          ch = state.input.charCodeAt(++state.position);
        } else {
          throwError(state, "unexpected end of the stream within a verbatim tag");
        }
      } else {
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          if (ch === 33) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);
              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, "named tag handle cannot contain such characters");
              }
              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, "tag suffix cannot contain exclamation marks");
            }
          }
          ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(_position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
          throwError(state, "tag suffix cannot contain flow indicator characters");
        }
      }
      if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        throwError(state, "tag name cannot contain such characters: " + tagName);
      }
      try {
        tagName = decodeURIComponent(tagName);
      } catch (err) {
        throwError(state, "tag name is malformed: " + tagName);
      }
      if (isVerbatim) {
        state.tag = tagName;
      } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
      } else if (tagHandle === "!") {
        state.tag = "!" + tagName;
      } else if (tagHandle === "!!") {
        state.tag = "tag:yaml.org,2002:" + tagName;
      } else {
        throwError(state, 'undeclared tag handle "' + tagHandle + '"');
      }
      return true;
    }
    function readAnchorProperty(state) {
      var _position, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 38) return false;
      if (state.anchor !== null) {
        throwError(state, "duplication of an anchor property");
      }
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an anchor node must contain at least one character");
      }
      state.anchor = state.input.slice(_position, state.position);
      return true;
    }
    function readAlias(state) {
      var _position, alias, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 42) return false;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an alias node must contain at least one character");
      }
      alias = state.input.slice(_position, state.position);
      if (!_hasOwnProperty.call(state.anchorMap, alias)) {
        throwError(state, 'unidentified alias "' + alias + '"');
      }
      state.result = state.anchorMap[alias];
      skipSeparationSpace(state, true, -1);
      return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
      var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type, flowIndent, blockIndent;
      if (state.listener !== null) {
        state.listener("open", state);
      }
      state.tag = null;
      state.anchor = null;
      state.kind = null;
      state.result = null;
      allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
      if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        }
      }
      if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
          if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;
            if (state.lineIndent > parentIndent) {
              indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
              indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
              indentStatus = -1;
            }
          } else {
            allowBlockCollections = false;
          }
        }
      }
      if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
      }
      if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
          flowIndent = parentIndent;
        } else {
          flowIndent = parentIndent + 1;
        }
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
          if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
            hasContent = true;
          } else {
            if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
              hasContent = true;
            } else if (readAlias(state)) {
              hasContent = true;
              if (state.tag !== null || state.anchor !== null) {
                throwError(state, "alias node should not have any properties");
              }
            } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;
              if (state.tag === null) {
                state.tag = "?";
              }
            }
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else if (indentStatus === 0) {
          hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
      }
      if (state.tag === null) {
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      } else if (state.tag === "?") {
        if (state.result !== null && state.kind !== "scalar") {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }
        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state.implicitTypes[typeIndex];
          if (type.resolve(state.result)) {
            state.result = type.construct(state.result);
            state.tag = type.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (state.tag !== "!") {
        if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
          type = state.typeMap[state.kind || "fallback"][state.tag];
        } else {
          type = null;
          typeList = state.typeMap.multi[state.kind || "fallback"];
          for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
            if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
              type = typeList[typeIndex];
              break;
            }
          }
        }
        if (!type) {
          throwError(state, "unknown tag !<" + state.tag + ">");
        }
        if (state.result !== null && type.kind !== state.kind) {
          throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
        }
        if (!type.resolve(state.result, state.tag)) {
          throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
        } else {
          state.result = type.construct(state.result, state.tag);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      }
      if (state.listener !== null) {
        state.listener("close", state);
      }
      return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
      var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
      state.version = null;
      state.checkLineBreaks = state.legacy;
      state.tagMap = /* @__PURE__ */ Object.create(null);
      state.anchorMap = /* @__PURE__ */ Object.create(null);
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 37) {
          break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(_position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
          throwError(state, "directive name must not be less than one character in length");
        }
        while (ch !== 0) {
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 35) {
            do {
              ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && !is_EOL(ch));
            break;
          }
          if (is_EOL(ch)) break;
          _position = state.position;
          while (ch !== 0 && !is_WS_OR_EOL(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          directiveArgs.push(state.input.slice(_position, state.position));
        }
        if (ch !== 0) readLineBreak(state);
        if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
          directiveHandlers[directiveName](state, directiveName, directiveArgs);
        } else {
          throwWarning(state, 'unknown document directive "' + directiveName + '"');
        }
      }
      skipSeparationSpace(state, true, -1);
      if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      } else if (hasDirectives) {
        throwError(state, "directives end mark is expected");
      }
      composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state, true, -1);
      if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
      }
      state.documents.push(state.result);
      if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 46) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }
        return;
      }
      if (state.position < state.length - 1) {
        throwError(state, "end of the stream or a document separator is expected");
      } else {
        return;
      }
    }
    function loadDocuments(input, options) {
      input = String(input);
      options = options || {};
      if (input.length !== 0) {
        if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
          input += "\n";
        }
        if (input.charCodeAt(0) === 65279) {
          input = input.slice(1);
        }
      }
      var state = new State(input, options);
      var nullpos = input.indexOf("\0");
      if (nullpos !== -1) {
        state.position = nullpos;
        throwError(state, "null byte is not allowed in input");
      }
      state.input += "\0";
      while (state.input.charCodeAt(state.position) === 32) {
        state.lineIndent += 1;
        state.position += 1;
      }
      while (state.position < state.length - 1) {
        readDocument(state);
      }
      return state.documents;
    }
    function loadAll(input, iterator, options) {
      if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
        options = iterator;
        iterator = null;
      }
      var documents = loadDocuments(input, options);
      if (typeof iterator !== "function") {
        return documents;
      }
      for (var index = 0, length = documents.length; index < length; index += 1) {
        iterator(documents[index]);
      }
    }
    function load(input, options) {
      var documents = loadDocuments(input, options);
      if (documents.length === 0) {
        return void 0;
      } else if (documents.length === 1) {
        return documents[0];
      }
      throw new YAMLException("expected a single document in the stream, but found more");
    }
    module.exports.loadAll = loadAll;
    module.exports.load = load;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/dumper.js
var require_dumper = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/lib/dumper.js"(exports, module) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var DEFAULT_SCHEMA = require_default();
    var _toString = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CHAR_BOM = 65279;
    var CHAR_TAB = 9;
    var CHAR_LINE_FEED = 10;
    var CHAR_CARRIAGE_RETURN = 13;
    var CHAR_SPACE = 32;
    var CHAR_EXCLAMATION = 33;
    var CHAR_DOUBLE_QUOTE = 34;
    var CHAR_SHARP = 35;
    var CHAR_PERCENT = 37;
    var CHAR_AMPERSAND = 38;
    var CHAR_SINGLE_QUOTE = 39;
    var CHAR_ASTERISK = 42;
    var CHAR_COMMA = 44;
    var CHAR_MINUS = 45;
    var CHAR_COLON = 58;
    var CHAR_EQUALS = 61;
    var CHAR_GREATER_THAN = 62;
    var CHAR_QUESTION = 63;
    var CHAR_COMMERCIAL_AT = 64;
    var CHAR_LEFT_SQUARE_BRACKET = 91;
    var CHAR_RIGHT_SQUARE_BRACKET = 93;
    var CHAR_GRAVE_ACCENT = 96;
    var CHAR_LEFT_CURLY_BRACKET = 123;
    var CHAR_VERTICAL_LINE = 124;
    var CHAR_RIGHT_CURLY_BRACKET = 125;
    var ESCAPE_SEQUENCES = {};
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    var DEPRECATED_BOOLEANS_SYNTAX = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF"
    ];
    var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
    function compileStyleMap(schema, map2) {
      var result, keys, index, length, tag, style, type;
      if (map2 === null) return {};
      result = {};
      keys = Object.keys(map2);
      for (index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map2[tag]);
        if (tag.slice(0, 2) === "!!") {
          tag = "tag:yaml.org,2002:" + tag.slice(2);
        }
        type = schema.compiledTypeMap["fallback"][tag];
        if (type && _hasOwnProperty.call(type.styleAliases, style)) {
          style = type.styleAliases[style];
        }
        result[tag] = style;
      }
      return result;
    }
    function encodeHex(character) {
      var string, handle, length;
      string = character.toString(16).toUpperCase();
      if (character <= 255) {
        handle = "x";
        length = 2;
      } else if (character <= 65535) {
        handle = "u";
        length = 4;
      } else if (character <= 4294967295) {
        handle = "U";
        length = 8;
      } else {
        throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
      }
      return "\\" + handle + common.repeat("0", length - string.length) + string;
    }
    var QUOTING_TYPE_SINGLE = 1;
    var QUOTING_TYPE_DOUBLE = 2;
    function State(options) {
      this.schema = options["schema"] || DEFAULT_SCHEMA;
      this.indent = Math.max(1, options["indent"] || 2);
      this.noArrayIndent = options["noArrayIndent"] || false;
      this.skipInvalid = options["skipInvalid"] || false;
      this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
      this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
      this.sortKeys = options["sortKeys"] || false;
      this.lineWidth = options["lineWidth"] || 80;
      this.noRefs = options["noRefs"] || false;
      this.noCompatMode = options["noCompatMode"] || false;
      this.condenseFlow = options["condenseFlow"] || false;
      this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
      this.forceQuotes = options["forceQuotes"] || false;
      this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
      this.implicitTypes = this.schema.compiledImplicit;
      this.explicitTypes = this.schema.compiledExplicit;
      this.tag = null;
      this.result = "";
      this.duplicates = [];
      this.usedDuplicates = null;
    }
    function indentString(string, spaces) {
      var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
      while (position < length) {
        next = string.indexOf("\n", position);
        if (next === -1) {
          line = string.slice(position);
          position = length;
        } else {
          line = string.slice(position, next + 1);
          position = next + 1;
        }
        if (line.length && line !== "\n") result += ind;
        result += line;
      }
      return result;
    }
    function generateNextLine(state, level) {
      return "\n" + common.repeat(" ", state.indent * level);
    }
    function testImplicitResolving(state, str) {
      var index, length, type;
      for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
          return true;
        }
      }
      return false;
    }
    function isWhitespace(c) {
      return c === CHAR_SPACE || c === CHAR_TAB;
    }
    function isPrintable(c) {
      return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
    }
    function isNsCharOrWhitespace(c) {
      return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
    }
    function isPlainSafe(c, prev, inblock) {
      var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
      var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
      return (
        // ns-plain-safe
        (inblock ? (
          // c = flow-in
          cIsNsCharOrWhitespace
        ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
      );
    }
    function isPlainSafeFirst(c) {
      return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
    }
    function isPlainSafeLast(c) {
      return !isWhitespace(c) && c !== CHAR_COLON;
    }
    function codePointAt(string, pos) {
      var first = string.charCodeAt(pos), second;
      if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
        second = string.charCodeAt(pos + 1);
        if (second >= 56320 && second <= 57343) {
          return (first - 55296) * 1024 + second - 56320 + 65536;
        }
      }
      return first;
    }
    function needIndentIndicator(string) {
      var leadingSpaceRe = /^\n* /;
      return leadingSpaceRe.test(string);
    }
    var STYLE_PLAIN = 1;
    var STYLE_SINGLE = 2;
    var STYLE_LITERAL = 3;
    var STYLE_FOLDED = 4;
    var STYLE_DOUBLE = 5;
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
      var i;
      var char = 0;
      var prevChar = null;
      var hasLineBreak = false;
      var hasFoldableLine = false;
      var shouldTrackWidth = lineWidth !== -1;
      var previousLineBreak = -1;
      var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
      if (singleLineOnly || forceQuotes) {
        for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
      } else {
        for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (char === CHAR_LINE_FEED) {
            hasLineBreak = true;
            if (shouldTrackWidth) {
              hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
              i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
              previousLineBreak = i;
            }
          } else if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
      }
      if (!hasLineBreak && !hasFoldableLine) {
        if (plain && !forceQuotes && !testAmbiguousType(string)) {
          return STYLE_PLAIN;
        }
        return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
      }
      if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
      }
      if (!forceQuotes) {
        return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    function writeScalar(state, string, level, iskey, inblock) {
      state.dump = (function() {
        if (string.length === 0) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
        }
        if (!state.noCompatMode) {
          if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
            return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
          }
        }
        var indent = state.indent * Math.max(1, level);
        var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(string2) {
          return testImplicitResolving(state, string2);
        }
        switch (chooseScalarStyle(
          string,
          singleLineOnly,
          state.indent,
          lineWidth,
          testAmbiguity,
          state.quotingType,
          state.forceQuotes && !iskey,
          inblock
        )) {
          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
          case STYLE_DOUBLE:
            return '"' + escapeString(string, lineWidth) + '"';
          default:
            throw new YAMLException("impossible error: invalid scalar style");
        }
      })();
    }
    function blockHeader(string, indentPerLevel) {
      var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
      var clip = string[string.length - 1] === "\n";
      var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
      var chomp = keep ? "+" : clip ? "" : "-";
      return indentIndicator + chomp + "\n";
    }
    function dropEndingNewline(string) {
      return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
      var lineRe = /(\n+)([^\n]*)/g;
      var result = (function() {
        var nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
      })();
      var prevMoreIndented = string[0] === "\n" || string[0] === " ";
      var moreIndented;
      var match;
      while (match = lineRe.exec(string)) {
        var prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
      }
      return result;
    }
    function foldLine(line, width) {
      if (line === "" || line[0] === " ") return line;
      var breakRe = / [^ ]/g;
      var match;
      var start = 0, end, curr = 0, next = 0;
      var result = "";
      while (match = breakRe.exec(line)) {
        next = match.index;
        if (next - start > width) {
          end = curr > start ? curr : next;
          result += "\n" + line.slice(start, end);
          start = end + 1;
        }
        curr = next;
      }
      result += "\n";
      if (line.length - start > width && curr > start) {
        result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
      } else {
        result += line.slice(start);
      }
      return result.slice(1);
    }
    function escapeString(string) {
      var result = "";
      var char = 0;
      var escapeSeq;
      for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        escapeSeq = ESCAPE_SEQUENCES[char];
        if (!escapeSeq && isPrintable(char)) {
          result += string[i];
          if (char >= 65536) result += string[i + 1];
        } else {
          result += escapeSeq || encodeHex(char);
        }
      }
      return result;
    }
    function writeFlowSequence(state, level, object) {
      var _result = "", _tag = state.tag, index, length, value;
      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];
        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }
        if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
          if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = "[" + _result + "]";
    }
    function writeBlockSequence(state, level, object, compact) {
      var _result = "", _tag = state.tag, index, length, value;
      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];
        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }
        if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
          if (!compact || _result !== "") {
            _result += generateNextLine(state, level);
          }
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            _result += "-";
          } else {
            _result += "- ";
          }
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (_result !== "") pairBuffer += ", ";
        if (state.condenseFlow) pairBuffer += '"';
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }
        if (!writeNode(state, level, objectKey, false, false)) {
          continue;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
        if (!writeNode(state, level, objectValue, false, false)) {
          continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = "{" + _result + "}";
    }
    function writeBlockMapping(state, level, object, compact) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
      if (state.sortKeys === true) {
        objectKeyList.sort();
      } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
      } else if (state.sortKeys) {
        throw new YAMLException("sortKeys must be a boolean or a function");
      }
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (!compact || _result !== "") {
          pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
          continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += "?";
          } else {
            pairBuffer += "? ";
          }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
          pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
          continue;
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += ":";
        } else {
          pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = _result || "{}";
    }
    function detectType(state, object, explicit) {
      var _result, typeList, index, length, type, style;
      typeList = explicit ? state.explicitTypes : state.implicitTypes;
      for (index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
          if (explicit) {
            if (type.multi && type.representName) {
              state.tag = type.representName(object);
            } else {
              state.tag = type.tag;
            }
          } else {
            state.tag = "?";
          }
          if (type.represent) {
            style = state.styleMap[type.tag] || type.defaultStyle;
            if (_toString.call(type.represent) === "[object Function]") {
              _result = type.represent(object, style);
            } else if (_hasOwnProperty.call(type.represent, style)) {
              _result = type.represent[style](object, style);
            } else {
              throw new YAMLException("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
            }
            state.dump = _result;
          }
          return true;
        }
      }
      return false;
    }
    function writeNode(state, level, object, block, compact, iskey, isblockseq) {
      state.tag = null;
      state.dump = object;
      if (!detectType(state, object, false)) {
        detectType(state, object, true);
      }
      var type = _toString.call(state.dump);
      var inblock = block;
      var tagStr;
      if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
      }
      var objectOrArray = type === "[object Object]" || type === "[object Array]", duplicateIndex, duplicate;
      if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }
      if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
      }
      if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = "*ref_" + duplicateIndex;
      } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
          state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
          if (block && Object.keys(state.dump).length !== 0) {
            writeBlockMapping(state, level, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowMapping(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object Array]") {
          if (block && state.dump.length !== 0) {
            if (state.noArrayIndent && !isblockseq && level > 0) {
              writeBlockSequence(state, level - 1, state.dump, compact);
            } else {
              writeBlockSequence(state, level, state.dump, compact);
            }
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowSequence(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object String]") {
          if (state.tag !== "?") {
            writeScalar(state, state.dump, level, iskey, inblock);
          }
        } else if (type === "[object Undefined]") {
          return false;
        } else {
          if (state.skipInvalid) return false;
          throw new YAMLException("unacceptable kind of an object to dump " + type);
        }
        if (state.tag !== null && state.tag !== "?") {
          tagStr = encodeURI(
            state.tag[0] === "!" ? state.tag.slice(1) : state.tag
          ).replace(/!/g, "%21");
          if (state.tag[0] === "!") {
            tagStr = "!" + tagStr;
          } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
            tagStr = "!!" + tagStr.slice(18);
          } else {
            tagStr = "!<" + tagStr + ">";
          }
          state.dump = tagStr + " " + state.dump;
        }
      }
      return true;
    }
    function getDuplicateReferences(object, state) {
      var objects = [], duplicatesIndexes = [], index, length;
      inspectNode(object, objects, duplicatesIndexes);
      for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
      }
      state.usedDuplicates = new Array(length);
    }
    function inspectNode(object, objects, duplicatesIndexes) {
      var objectKeyList, index, length;
      if (object !== null && typeof object === "object") {
        index = objects.indexOf(object);
        if (index !== -1) {
          if (duplicatesIndexes.indexOf(index) === -1) {
            duplicatesIndexes.push(index);
          }
        } else {
          objects.push(object);
          if (Array.isArray(object)) {
            for (index = 0, length = object.length; index < length; index += 1) {
              inspectNode(object[index], objects, duplicatesIndexes);
            }
          } else {
            objectKeyList = Object.keys(object);
            for (index = 0, length = objectKeyList.length; index < length; index += 1) {
              inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
            }
          }
        }
      }
    }
    function dump(input, options) {
      options = options || {};
      var state = new State(options);
      if (!state.noRefs) getDuplicateReferences(input, state);
      var value = input;
      if (state.replacer) {
        value = state.replacer.call({ "": value }, "", value);
      }
      if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
      return "";
    }
    module.exports.dump = dump;
  }
});

// ../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/index.js
var require_js_yaml = __commonJS({
  "../../node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml/index.js"(exports, module) {
    "use strict";
    var loader = require_loader();
    var dumper = require_dumper();
    function renamed(from2, to) {
      return function() {
        throw new Error("Function yaml." + from2 + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
      };
    }
    module.exports.Type = require_type();
    module.exports.Schema = require_schema();
    module.exports.FAILSAFE_SCHEMA = require_failsafe();
    module.exports.JSON_SCHEMA = require_json();
    module.exports.CORE_SCHEMA = require_core();
    module.exports.DEFAULT_SCHEMA = require_default();
    module.exports.load = loader.load;
    module.exports.loadAll = loader.loadAll;
    module.exports.dump = dumper.dump;
    module.exports.YAMLException = require_exception();
    module.exports.types = {
      binary: require_binary(),
      float: require_float(),
      map: require_map(),
      null: require_null(),
      pairs: require_pairs(),
      set: require_set(),
      timestamp: require_timestamp(),
      bool: require_bool(),
      int: require_int(),
      merge: require_merge(),
      omap: require_omap(),
      seq: require_seq(),
      str: require_str()
    };
    module.exports.safeLoad = renamed("safeLoad", "load");
    module.exports.safeLoadAll = renamed("safeLoadAll", "loadAll");
    module.exports.safeDump = renamed("safeDump", "dump");
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/loaders.js
var require_loaders = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/loaders.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadTs = exports.loadTsSync = exports.loadYaml = exports.loadJson = exports.loadJs = exports.loadJsSync = void 0;
    var fs_1 = __require("fs");
    var promises_1 = __require("fs/promises");
    var path_1 = __importDefault(__require("path"));
    var url_1 = __require("url");
    var crypto_1 = __require("crypto");
    var importFresh;
    var loadJsSync = function loadJsSync2(filepath) {
      if (importFresh === void 0) {
        importFresh = require_import_fresh();
      }
      return importFresh(filepath);
    };
    exports.loadJsSync = loadJsSync;
    var loadJs = async function loadJs2(filepath) {
      try {
        const { href } = (0, url_1.pathToFileURL)(await (0, promises_1.realpath)(filepath));
        return (await import(href)).default;
      } catch (error) {
        try {
          return (0, exports.loadJsSync)(filepath, "");
        } catch (requireError) {
          if (requireError.code === "ERR_REQUIRE_ESM" || requireError instanceof SyntaxError && requireError.toString().includes("Cannot use import statement outside a module")) {
            throw error;
          }
          throw requireError;
        }
      }
    };
    exports.loadJs = loadJs;
    var parseJson;
    var loadJson = function loadJson2(filepath, content) {
      if (parseJson === void 0) {
        parseJson = require_parse_json();
      }
      try {
        return parseJson(content);
      } catch (error) {
        error.message = `JSON Error in ${filepath}:
${error.message}`;
        throw error;
      }
    };
    exports.loadJson = loadJson;
    var yaml;
    var loadYaml = function loadYaml2(filepath, content) {
      if (yaml === void 0) {
        yaml = require_js_yaml();
      }
      try {
        return yaml.load(content);
      } catch (error) {
        error.message = `YAML Error in ${filepath}:
${error.message}`;
        throw error;
      }
    };
    exports.loadYaml = loadYaml;
    var typescript;
    var loadTsSync = function loadTsSync2(filepath, content) {
      if (typescript === void 0) {
        typescript = require_typescript();
      }
      const compiledFilepath = `${filepath}.${(0, crypto_1.randomUUID)()}.cjs`;
      try {
        const config = resolveTsConfig(path_1.default.dirname(filepath)) ?? {};
        config.compilerOptions = {
          ...config.compilerOptions,
          module: typescript.ModuleKind.NodeNext,
          moduleResolution: typescript.ModuleResolutionKind.NodeNext,
          target: typescript.ScriptTarget.ES2022,
          noEmit: false
        };
        content = typescript.transpileModule(content, config).outputText;
        (0, fs_1.writeFileSync)(compiledFilepath, content);
        return (0, exports.loadJsSync)(compiledFilepath, content).default;
      } catch (error) {
        error.message = `TypeScript Error in ${filepath}:
${error.message}`;
        throw error;
      } finally {
        if ((0, fs_1.existsSync)(compiledFilepath)) {
          (0, fs_1.rmSync)(compiledFilepath);
        }
      }
    };
    exports.loadTsSync = loadTsSync;
    var loadTs = async function loadTs2(filepath, content) {
      if (typescript === void 0) {
        typescript = (await import("./typescript-PIMQAOM7.js")).default;
      }
      const compiledFilepath = `${filepath}.${(0, crypto_1.randomUUID)()}.mjs`;
      let transpiledContent;
      try {
        try {
          const config = resolveTsConfig(path_1.default.dirname(filepath)) ?? {};
          config.compilerOptions = {
            ...config.compilerOptions,
            module: typescript.ModuleKind.ES2022,
            moduleResolution: typescript.ModuleResolutionKind.Bundler,
            target: typescript.ScriptTarget.ES2022,
            noEmit: false
          };
          transpiledContent = typescript.transpileModule(content, config).outputText;
          await (0, promises_1.writeFile)(compiledFilepath, transpiledContent);
        } catch (error) {
          error.message = `TypeScript Error in ${filepath}:
${error.message}`;
          throw error;
        }
        return await (0, exports.loadJs)(compiledFilepath, transpiledContent);
      } finally {
        if ((0, fs_1.existsSync)(compiledFilepath)) {
          await (0, promises_1.rm)(compiledFilepath);
        }
      }
    };
    exports.loadTs = loadTs;
    function resolveTsConfig(directory) {
      const filePath = typescript.findConfigFile(directory, (fileName) => {
        return typescript.sys.fileExists(fileName);
      });
      if (filePath !== void 0) {
        const { config, error } = typescript.readConfigFile(filePath, (path4) => typescript.sys.readFile(path4));
        if (error) {
          throw new Error(`Error in ${filePath}: ${error.messageText.toString()}`);
        }
        return config;
      }
      return;
    }
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/defaults.js
var require_defaults = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultLoadersSync = exports.defaultLoaders = exports.metaSearchPlaces = exports.globalConfigSearchPlacesSync = exports.globalConfigSearchPlaces = exports.getDefaultSearchPlacesSync = exports.getDefaultSearchPlaces = void 0;
    var loaders_1 = require_loaders();
    function getDefaultSearchPlaces(moduleName) {
      return [
        "package.json",
        `.${moduleName}rc`,
        `.${moduleName}rc.json`,
        `.${moduleName}rc.yaml`,
        `.${moduleName}rc.yml`,
        `.${moduleName}rc.js`,
        `.${moduleName}rc.ts`,
        `.${moduleName}rc.cjs`,
        `.${moduleName}rc.mjs`,
        `.config/${moduleName}rc`,
        `.config/${moduleName}rc.json`,
        `.config/${moduleName}rc.yaml`,
        `.config/${moduleName}rc.yml`,
        `.config/${moduleName}rc.js`,
        `.config/${moduleName}rc.ts`,
        `.config/${moduleName}rc.cjs`,
        `.config/${moduleName}rc.mjs`,
        `${moduleName}.config.js`,
        `${moduleName}.config.ts`,
        `${moduleName}.config.cjs`,
        `${moduleName}.config.mjs`
      ];
    }
    exports.getDefaultSearchPlaces = getDefaultSearchPlaces;
    function getDefaultSearchPlacesSync(moduleName) {
      return [
        "package.json",
        `.${moduleName}rc`,
        `.${moduleName}rc.json`,
        `.${moduleName}rc.yaml`,
        `.${moduleName}rc.yml`,
        `.${moduleName}rc.js`,
        `.${moduleName}rc.ts`,
        `.${moduleName}rc.cjs`,
        `.config/${moduleName}rc`,
        `.config/${moduleName}rc.json`,
        `.config/${moduleName}rc.yaml`,
        `.config/${moduleName}rc.yml`,
        `.config/${moduleName}rc.js`,
        `.config/${moduleName}rc.ts`,
        `.config/${moduleName}rc.cjs`,
        `${moduleName}.config.js`,
        `${moduleName}.config.ts`,
        `${moduleName}.config.cjs`
      ];
    }
    exports.getDefaultSearchPlacesSync = getDefaultSearchPlacesSync;
    exports.globalConfigSearchPlaces = [
      "config",
      "config.json",
      "config.yaml",
      "config.yml",
      "config.js",
      "config.ts",
      "config.cjs",
      "config.mjs"
    ];
    exports.globalConfigSearchPlacesSync = [
      "config",
      "config.json",
      "config.yaml",
      "config.yml",
      "config.js",
      "config.ts",
      "config.cjs"
    ];
    exports.metaSearchPlaces = [
      "package.json",
      "package.yaml",
      ".config/config.json",
      ".config/config.yaml",
      ".config/config.yml",
      ".config/config.js",
      ".config/config.ts",
      ".config/config.cjs",
      ".config/config.mjs"
    ];
    exports.defaultLoaders = Object.freeze({
      ".mjs": loaders_1.loadJs,
      ".cjs": loaders_1.loadJs,
      ".js": loaders_1.loadJs,
      ".ts": loaders_1.loadTs,
      ".json": loaders_1.loadJson,
      ".yaml": loaders_1.loadYaml,
      ".yml": loaders_1.loadYaml,
      noExt: loaders_1.loadYaml
    });
    exports.defaultLoadersSync = Object.freeze({
      ".cjs": loaders_1.loadJsSync,
      ".js": loaders_1.loadJsSync,
      ".ts": loaders_1.loadTsSync,
      ".json": loaders_1.loadJson,
      ".yaml": loaders_1.loadYaml,
      ".yml": loaders_1.loadYaml,
      noExt: loaders_1.loadYaml
    });
  }
});

// ../../node_modules/.pnpm/env-paths@2.2.1/node_modules/env-paths/index.js
var require_env_paths = __commonJS({
  "../../node_modules/.pnpm/env-paths@2.2.1/node_modules/env-paths/index.js"(exports, module) {
    "use strict";
    var path4 = __require("path");
    var os4 = __require("os");
    var homedir2 = os4.homedir();
    var tmpdir2 = os4.tmpdir();
    var { env } = process;
    var macos = (name) => {
      const library = path4.join(homedir2, "Library");
      return {
        data: path4.join(library, "Application Support", name),
        config: path4.join(library, "Preferences", name),
        cache: path4.join(library, "Caches", name),
        log: path4.join(library, "Logs", name),
        temp: path4.join(tmpdir2, name)
      };
    };
    var windows = (name) => {
      const appData = env.APPDATA || path4.join(homedir2, "AppData", "Roaming");
      const localAppData = env.LOCALAPPDATA || path4.join(homedir2, "AppData", "Local");
      return {
        // Data/config/cache/log are invented by me as Windows isn't opinionated about this
        data: path4.join(localAppData, name, "Data"),
        config: path4.join(appData, name, "Config"),
        cache: path4.join(localAppData, name, "Cache"),
        log: path4.join(localAppData, name, "Log"),
        temp: path4.join(tmpdir2, name)
      };
    };
    var linux = (name) => {
      const username = path4.basename(homedir2);
      return {
        data: path4.join(env.XDG_DATA_HOME || path4.join(homedir2, ".local", "share"), name),
        config: path4.join(env.XDG_CONFIG_HOME || path4.join(homedir2, ".config"), name),
        cache: path4.join(env.XDG_CACHE_HOME || path4.join(homedir2, ".cache"), name),
        // https://wiki.debian.org/XDGBaseDirectorySpecification#state
        log: path4.join(env.XDG_STATE_HOME || path4.join(homedir2, ".local", "state"), name),
        temp: path4.join(tmpdir2, username, name)
      };
    };
    var envPaths = (name, options) => {
      if (typeof name !== "string") {
        throw new TypeError(`Expected string, got ${typeof name}`);
      }
      options = Object.assign({ suffix: "nodejs" }, options);
      if (options.suffix) {
        name += `-${options.suffix}`;
      }
      if (process.platform === "darwin") {
        return macos(name);
      }
      if (process.platform === "win32") {
        return windows(name);
      }
      return linux(name);
    };
    module.exports = envPaths;
    module.exports.default = envPaths;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/util.js
var require_util = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/util.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDirectorySync = exports.isDirectory = exports.removeUndefinedValuesFromObject = exports.getPropertyByPath = exports.emplace = void 0;
    var fs_1 = __importStar(__require("fs"));
    function emplace(map2, key, fn) {
      const cached = map2.get(key);
      if (cached !== void 0) {
        return cached;
      }
      const result = fn();
      map2.set(key, result);
      return result;
    }
    exports.emplace = emplace;
    function getPropertyByPath(source, path4) {
      if (typeof path4 === "string" && Object.prototype.hasOwnProperty.call(source, path4)) {
        return source[path4];
      }
      const parsedPath = typeof path4 === "string" ? path4.split(".") : path4;
      return parsedPath.reduce((previous, key) => {
        if (previous === void 0) {
          return previous;
        }
        return previous[key];
      }, source);
    }
    exports.getPropertyByPath = getPropertyByPath;
    function removeUndefinedValuesFromObject(options) {
      return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== void 0));
    }
    exports.removeUndefinedValuesFromObject = removeUndefinedValuesFromObject;
    async function isDirectory(path4) {
      try {
        const stat = await fs_1.promises.stat(path4);
        return stat.isDirectory();
      } catch (e) {
        if (e.code === "ENOENT") {
          return false;
        }
        throw e;
      }
    }
    exports.isDirectory = isDirectory;
    function isDirectorySync(path4) {
      try {
        const stat = fs_1.default.statSync(path4);
        return stat.isDirectory();
      } catch (e) {
        if (e.code === "ENOENT") {
          return false;
        }
        throw e;
      }
    }
    exports.isDirectorySync = isDirectorySync;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/ExplorerBase.js
var require_ExplorerBase = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/ExplorerBase.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getExtensionDescription = exports.ExplorerBase = void 0;
    var env_paths_1 = __importDefault(require_env_paths());
    var os_1 = __importDefault(__require("os"));
    var path_1 = __importDefault(__require("path"));
    var util_js_1 = require_util();
    var ExplorerBase = class {
      #loadingMetaConfig = false;
      config;
      loadCache;
      searchCache;
      constructor(options) {
        this.config = options;
        if (options.cache) {
          this.loadCache = /* @__PURE__ */ new Map();
          this.searchCache = /* @__PURE__ */ new Map();
        }
        this.#validateConfig();
      }
      set loadingMetaConfig(value) {
        this.#loadingMetaConfig = value;
      }
      #validateConfig() {
        const config = this.config;
        for (const place of config.searchPlaces) {
          const extension = path_1.default.extname(place);
          const loader = this.config.loaders[extension || "noExt"] ?? this.config.loaders["default"];
          if (loader === void 0) {
            throw new Error(`Missing loader for ${getExtensionDescription(place)}.`);
          }
          if (typeof loader !== "function") {
            throw new Error(`Loader for ${getExtensionDescription(place)} is not a function: Received ${typeof loader}.`);
          }
        }
      }
      clearLoadCache() {
        if (this.loadCache) {
          this.loadCache.clear();
        }
      }
      clearSearchCache() {
        if (this.searchCache) {
          this.searchCache.clear();
        }
      }
      clearCaches() {
        this.clearLoadCache();
        this.clearSearchCache();
      }
      toCosmiconfigResult(filepath, config) {
        if (config === null) {
          return null;
        }
        if (config === void 0) {
          return { filepath, config: void 0, isEmpty: true };
        }
        if (this.config.applyPackagePropertyPathToConfiguration || this.#loadingMetaConfig) {
          const packageProp = this.config.packageProp ?? this.config.moduleName;
          config = (0, util_js_1.getPropertyByPath)(config, packageProp);
        }
        if (config === void 0) {
          return { filepath, config: void 0, isEmpty: true };
        }
        return { config, filepath };
      }
      validateImports(containingFilePath, imports, importStack) {
        const fileDirectory = path_1.default.dirname(containingFilePath);
        for (const importPath of imports) {
          if (typeof importPath !== "string") {
            throw new Error(`${containingFilePath}: Key $import must contain a string or a list of strings`);
          }
          const fullPath = path_1.default.resolve(fileDirectory, importPath);
          if (fullPath === containingFilePath) {
            throw new Error(`Self-import detected in ${containingFilePath}`);
          }
          const idx = importStack.indexOf(fullPath);
          if (idx !== -1) {
            throw new Error(`Circular import detected:
${[...importStack, fullPath].map((path4, i) => `${i + 1}. ${path4}`).join("\n")} (same as ${idx + 1}.)`);
          }
        }
      }
      getSearchPlacesForDir(dir, globalConfigPlaces) {
        return (dir.isGlobalConfig ? globalConfigPlaces : this.config.searchPlaces).map((place) => path_1.default.join(dir.path, place));
      }
      getGlobalConfigDir() {
        return (0, env_paths_1.default)(this.config.moduleName, { suffix: "" }).config;
      }
      *getGlobalDirs(startDir) {
        const stopDir = path_1.default.resolve(this.config.stopDir ?? os_1.default.homedir());
        yield { path: startDir, isGlobalConfig: false };
        let currentDir = startDir;
        while (currentDir !== stopDir) {
          const parentDir = path_1.default.dirname(currentDir);
          if (parentDir === currentDir) {
            break;
          }
          yield { path: parentDir, isGlobalConfig: false };
          currentDir = parentDir;
        }
        yield { path: this.getGlobalConfigDir(), isGlobalConfig: true };
      }
    };
    exports.ExplorerBase = ExplorerBase;
    function getExtensionDescription(extension) {
      return extension ? `extension "${extension}"` : "files without extensions";
    }
    exports.getExtensionDescription = getExtensionDescription;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/merge.js
var require_merge2 = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/merge.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeAll = exports.hasOwn = void 0;
    exports.hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
    var objToString = Function.prototype.call.bind(Object.prototype.toString);
    function isPlainObject(obj) {
      return objToString(obj) === "[object Object]";
    }
    function merge(target, source, options) {
      for (const key of Object.keys(source)) {
        const newValue = source[key];
        if ((0, exports.hasOwn)(target, key)) {
          if (Array.isArray(target[key]) && Array.isArray(newValue)) {
            if (options.mergeArrays) {
              target[key].push(...newValue);
              continue;
            }
          } else if (isPlainObject(target[key]) && isPlainObject(newValue)) {
            target[key] = merge(target[key], newValue, options);
            continue;
          }
        }
        target[key] = newValue;
      }
      return target;
    }
    function mergeAll(objects, options) {
      return objects.reduce((target, source) => merge(target, source, options), {});
    }
    exports.mergeAll = mergeAll;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/Explorer.js
var require_Explorer = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/Explorer.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Explorer = void 0;
    var promises_1 = __importDefault(__require("fs/promises"));
    var path_1 = __importDefault(__require("path"));
    var defaults_1 = require_defaults();
    var ExplorerBase_js_1 = require_ExplorerBase();
    var merge_1 = require_merge2();
    var util_js_1 = require_util();
    var Explorer = class extends ExplorerBase_js_1.ExplorerBase {
      async load(filepath) {
        filepath = path_1.default.resolve(filepath);
        const load = async () => {
          return await this.config.transform(await this.#readConfiguration(filepath));
        };
        if (this.loadCache) {
          return await (0, util_js_1.emplace)(this.loadCache, filepath, load);
        }
        return await load();
      }
      async search(from2 = "") {
        if (this.config.metaConfigFilePath) {
          this.loadingMetaConfig = true;
          const config = await this.load(this.config.metaConfigFilePath);
          this.loadingMetaConfig = false;
          if (config && !config.isEmpty) {
            return config;
          }
        }
        from2 = path_1.default.resolve(from2);
        const dirs = this.#getDirs(from2);
        const firstDirIter = await dirs.next();
        if (firstDirIter.done) {
          throw new Error(`Could not find any folders to iterate through (start from ${from2})`);
        }
        let currentDir = firstDirIter.value;
        const search = async () => {
          if (await (0, util_js_1.isDirectory)(currentDir.path)) {
            for (const filepath of this.getSearchPlacesForDir(currentDir, defaults_1.globalConfigSearchPlaces)) {
              try {
                const result = await this.#readConfiguration(filepath);
                if (result !== null && !(result.isEmpty && this.config.ignoreEmptySearchPlaces)) {
                  return await this.config.transform(result);
                }
              } catch (error) {
                if (error.code === "ENOENT" || error.code === "EISDIR" || error.code === "ENOTDIR" || error.code === "EACCES") {
                  continue;
                }
                throw error;
              }
            }
          }
          const nextDirIter = await dirs.next();
          if (!nextDirIter.done) {
            currentDir = nextDirIter.value;
            if (this.searchCache) {
              return await (0, util_js_1.emplace)(this.searchCache, currentDir.path, search);
            }
            return await search();
          }
          return await this.config.transform(null);
        };
        if (this.searchCache) {
          return await (0, util_js_1.emplace)(this.searchCache, from2, search);
        }
        return await search();
      }
      async #readConfiguration(filepath, importStack = []) {
        const contents = await promises_1.default.readFile(filepath, { encoding: "utf-8" });
        return this.toCosmiconfigResult(filepath, await this.#loadConfigFileWithImports(filepath, contents, importStack));
      }
      async #loadConfigFileWithImports(filepath, contents, importStack) {
        const loadedContent = await this.#loadConfiguration(filepath, contents);
        if (!loadedContent || !(0, merge_1.hasOwn)(loadedContent, "$import")) {
          return loadedContent;
        }
        const fileDirectory = path_1.default.dirname(filepath);
        const { $import: imports, ...ownContent } = loadedContent;
        const importPaths = Array.isArray(imports) ? imports : [imports];
        const newImportStack = [...importStack, filepath];
        this.validateImports(filepath, importPaths, newImportStack);
        const importedConfigs = await Promise.all(importPaths.map(async (importPath) => {
          const fullPath = path_1.default.resolve(fileDirectory, importPath);
          const result = await this.#readConfiguration(fullPath, newImportStack);
          return result?.config;
        }));
        return (0, merge_1.mergeAll)([...importedConfigs, ownContent], {
          mergeArrays: this.config.mergeImportArrays
        });
      }
      async #loadConfiguration(filepath, contents) {
        if (contents.trim() === "") {
          return;
        }
        const extension = path_1.default.extname(filepath);
        const loader = this.config.loaders[extension || "noExt"] ?? this.config.loaders["default"];
        if (!loader) {
          throw new Error(`No loader specified for ${(0, ExplorerBase_js_1.getExtensionDescription)(extension)}`);
        }
        try {
          const loadedContents = await loader(filepath, contents);
          if (path_1.default.basename(filepath, extension) !== "package") {
            return loadedContents;
          }
          return (0, util_js_1.getPropertyByPath)(loadedContents, this.config.packageProp ?? this.config.moduleName) ?? null;
        } catch (error) {
          error.filepath = filepath;
          throw error;
        }
      }
      async #fileExists(path4) {
        try {
          await promises_1.default.stat(path4);
          return true;
        } catch (e) {
          return false;
        }
      }
      async *#getDirs(startDir) {
        switch (this.config.searchStrategy) {
          case "none": {
            yield { path: startDir, isGlobalConfig: false };
            return;
          }
          case "project": {
            let currentDir = startDir;
            while (true) {
              yield { path: currentDir, isGlobalConfig: false };
              for (const ext of ["json", "yaml"]) {
                const packageFile = path_1.default.join(currentDir, `package.${ext}`);
                if (await this.#fileExists(packageFile)) {
                  break;
                }
              }
              const parentDir = path_1.default.dirname(currentDir);
              if (parentDir === currentDir) {
                break;
              }
              currentDir = parentDir;
            }
            return;
          }
          case "global": {
            yield* this.getGlobalDirs(startDir);
          }
        }
      }
    };
    exports.Explorer = Explorer;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/ExplorerSync.js
var require_ExplorerSync = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/ExplorerSync.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExplorerSync = void 0;
    var fs_1 = __importDefault(__require("fs"));
    var path_1 = __importDefault(__require("path"));
    var defaults_1 = require_defaults();
    var ExplorerBase_js_1 = require_ExplorerBase();
    var merge_1 = require_merge2();
    var util_js_1 = require_util();
    var ExplorerSync = class extends ExplorerBase_js_1.ExplorerBase {
      load(filepath) {
        filepath = path_1.default.resolve(filepath);
        const load = () => {
          return this.config.transform(this.#readConfiguration(filepath));
        };
        if (this.loadCache) {
          return (0, util_js_1.emplace)(this.loadCache, filepath, load);
        }
        return load();
      }
      search(from2 = "") {
        if (this.config.metaConfigFilePath) {
          this.loadingMetaConfig = true;
          const config = this.load(this.config.metaConfigFilePath);
          this.loadingMetaConfig = false;
          if (config && !config.isEmpty) {
            return config;
          }
        }
        from2 = path_1.default.resolve(from2);
        const dirs = this.#getDirs(from2);
        const firstDirIter = dirs.next();
        if (firstDirIter.done) {
          throw new Error(`Could not find any folders to iterate through (start from ${from2})`);
        }
        let currentDir = firstDirIter.value;
        const search = () => {
          if ((0, util_js_1.isDirectorySync)(currentDir.path)) {
            for (const filepath of this.getSearchPlacesForDir(currentDir, defaults_1.globalConfigSearchPlacesSync)) {
              try {
                const result = this.#readConfiguration(filepath);
                if (result !== null && !(result.isEmpty && this.config.ignoreEmptySearchPlaces)) {
                  return this.config.transform(result);
                }
              } catch (error) {
                if (error.code === "ENOENT" || error.code === "EISDIR" || error.code === "ENOTDIR" || error.code === "EACCES") {
                  continue;
                }
                throw error;
              }
            }
          }
          const nextDirIter = dirs.next();
          if (!nextDirIter.done) {
            currentDir = nextDirIter.value;
            if (this.searchCache) {
              return (0, util_js_1.emplace)(this.searchCache, currentDir.path, search);
            }
            return search();
          }
          return this.config.transform(null);
        };
        if (this.searchCache) {
          return (0, util_js_1.emplace)(this.searchCache, from2, search);
        }
        return search();
      }
      #readConfiguration(filepath, importStack = []) {
        const contents = fs_1.default.readFileSync(filepath, "utf8");
        return this.toCosmiconfigResult(filepath, this.#loadConfigFileWithImports(filepath, contents, importStack));
      }
      #loadConfigFileWithImports(filepath, contents, importStack) {
        const loadedContent = this.#loadConfiguration(filepath, contents);
        if (!loadedContent || !(0, merge_1.hasOwn)(loadedContent, "$import")) {
          return loadedContent;
        }
        const fileDirectory = path_1.default.dirname(filepath);
        const { $import: imports, ...ownContent } = loadedContent;
        const importPaths = Array.isArray(imports) ? imports : [imports];
        const newImportStack = [...importStack, filepath];
        this.validateImports(filepath, importPaths, newImportStack);
        const importedConfigs = importPaths.map((importPath) => {
          const fullPath = path_1.default.resolve(fileDirectory, importPath);
          const result = this.#readConfiguration(fullPath, newImportStack);
          return result?.config;
        });
        return (0, merge_1.mergeAll)([...importedConfigs, ownContent], {
          mergeArrays: this.config.mergeImportArrays
        });
      }
      #loadConfiguration(filepath, contents) {
        if (contents.trim() === "") {
          return;
        }
        const extension = path_1.default.extname(filepath);
        const loader = this.config.loaders[extension || "noExt"] ?? this.config.loaders["default"];
        if (!loader) {
          throw new Error(`No loader specified for ${(0, ExplorerBase_js_1.getExtensionDescription)(extension)}`);
        }
        try {
          const loadedContents = loader(filepath, contents);
          if (path_1.default.basename(filepath, extension) !== "package") {
            return loadedContents;
          }
          return (0, util_js_1.getPropertyByPath)(loadedContents, this.config.packageProp ?? this.config.moduleName) ?? null;
        } catch (error) {
          error.filepath = filepath;
          throw error;
        }
      }
      #fileExists(path4) {
        try {
          fs_1.default.statSync(path4);
          return true;
        } catch (e) {
          return false;
        }
      }
      *#getDirs(startDir) {
        switch (this.config.searchStrategy) {
          case "none": {
            yield { path: startDir, isGlobalConfig: false };
            return;
          }
          case "project": {
            let currentDir = startDir;
            while (true) {
              yield { path: currentDir, isGlobalConfig: false };
              for (const ext of ["json", "yaml"]) {
                const packageFile = path_1.default.join(currentDir, `package.${ext}`);
                if (this.#fileExists(packageFile)) {
                  break;
                }
              }
              const parentDir = path_1.default.dirname(currentDir);
              if (parentDir === currentDir) {
                break;
              }
              currentDir = parentDir;
            }
            return;
          }
          case "global": {
            yield* this.getGlobalDirs(startDir);
          }
        }
      }
      /**
       * @deprecated Use {@link ExplorerSync.prototype.load}.
       */
      /* istanbul ignore next */
      loadSync(filepath) {
        return this.load(filepath);
      }
      /**
       * @deprecated Use {@link ExplorerSync.prototype.search}.
       */
      /* istanbul ignore next */
      searchSync(from2 = "") {
        return this.search(from2);
      }
    };
    exports.ExplorerSync = ExplorerSync;
  }
});

// ../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/.pnpm/cosmiconfig@9.0.1_typescript@5.9.3/node_modules/cosmiconfig/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultLoadersSync = exports.defaultLoaders = exports.globalConfigSearchPlacesSync = exports.globalConfigSearchPlaces = exports.getDefaultSearchPlacesSync = exports.getDefaultSearchPlaces = exports.cosmiconfigSync = exports.cosmiconfig = void 0;
    var defaults_1 = require_defaults();
    Object.defineProperty(exports, "defaultLoaders", { enumerable: true, get: function() {
      return defaults_1.defaultLoaders;
    } });
    Object.defineProperty(exports, "defaultLoadersSync", { enumerable: true, get: function() {
      return defaults_1.defaultLoadersSync;
    } });
    Object.defineProperty(exports, "getDefaultSearchPlaces", { enumerable: true, get: function() {
      return defaults_1.getDefaultSearchPlaces;
    } });
    Object.defineProperty(exports, "getDefaultSearchPlacesSync", { enumerable: true, get: function() {
      return defaults_1.getDefaultSearchPlacesSync;
    } });
    Object.defineProperty(exports, "globalConfigSearchPlaces", { enumerable: true, get: function() {
      return defaults_1.globalConfigSearchPlaces;
    } });
    Object.defineProperty(exports, "globalConfigSearchPlacesSync", { enumerable: true, get: function() {
      return defaults_1.globalConfigSearchPlacesSync;
    } });
    var Explorer_js_1 = require_Explorer();
    var ExplorerSync_js_1 = require_ExplorerSync();
    var util_1 = require_util();
    var identity = function identity2(x) {
      return x;
    };
    function getUserDefinedOptionsFromMetaConfig() {
      const metaExplorer = new ExplorerSync_js_1.ExplorerSync({
        moduleName: "cosmiconfig",
        stopDir: process.cwd(),
        searchPlaces: defaults_1.metaSearchPlaces,
        ignoreEmptySearchPlaces: false,
        applyPackagePropertyPathToConfiguration: true,
        loaders: defaults_1.defaultLoaders,
        transform: identity,
        cache: true,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: "none"
      });
      const metaConfig = metaExplorer.search();
      if (!metaConfig) {
        return null;
      }
      if (metaConfig.config?.loaders) {
        throw new Error("Can not specify loaders in meta config file");
      }
      if (metaConfig.config?.searchStrategy) {
        throw new Error("Can not specify searchStrategy in meta config file");
      }
      const overrideOptions = {
        mergeSearchPlaces: true,
        ...metaConfig.config ?? {}
      };
      return {
        config: (0, util_1.removeUndefinedValuesFromObject)(overrideOptions),
        filepath: metaConfig.filepath
      };
    }
    function getResolvedSearchPlaces(moduleName, toolDefinedSearchPlaces, userConfiguredOptions) {
      const userConfiguredSearchPlaces = userConfiguredOptions.searchPlaces?.map((path4) => path4.replace("{name}", moduleName));
      if (userConfiguredOptions.mergeSearchPlaces) {
        return [...userConfiguredSearchPlaces ?? [], ...toolDefinedSearchPlaces];
      }
      return userConfiguredSearchPlaces ?? /* istanbul ignore next */
      toolDefinedSearchPlaces;
    }
    function mergeOptionsBase(moduleName, defaults, options) {
      const userDefinedConfig = getUserDefinedOptionsFromMetaConfig();
      if (!userDefinedConfig) {
        return {
          ...defaults,
          ...(0, util_1.removeUndefinedValuesFromObject)(options),
          loaders: {
            ...defaults.loaders,
            ...options.loaders
          }
        };
      }
      const userConfiguredOptions = userDefinedConfig.config;
      const toolDefinedSearchPlaces = options.searchPlaces ?? defaults.searchPlaces;
      return {
        ...defaults,
        ...(0, util_1.removeUndefinedValuesFromObject)(options),
        metaConfigFilePath: userDefinedConfig.filepath,
        ...userConfiguredOptions,
        searchPlaces: getResolvedSearchPlaces(moduleName, toolDefinedSearchPlaces, userConfiguredOptions),
        loaders: {
          ...defaults.loaders,
          ...options.loaders
        }
      };
    }
    function validateOptions(options) {
      if (options.searchStrategy != null && options.searchStrategy !== "global" && options.stopDir) {
        throw new Error('Can not supply `stopDir` option with `searchStrategy` other than "global"');
      }
    }
    function mergeOptions(moduleName, options) {
      validateOptions(options);
      const defaults = {
        moduleName,
        searchPlaces: (0, defaults_1.getDefaultSearchPlaces)(moduleName),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: identity,
        loaders: defaults_1.defaultLoaders,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: options.stopDir ? "global" : "none"
      };
      return mergeOptionsBase(moduleName, defaults, options);
    }
    function mergeOptionsSync(moduleName, options) {
      validateOptions(options);
      const defaults = {
        moduleName,
        searchPlaces: (0, defaults_1.getDefaultSearchPlacesSync)(moduleName),
        ignoreEmptySearchPlaces: true,
        cache: true,
        transform: identity,
        loaders: defaults_1.defaultLoadersSync,
        metaConfigFilePath: null,
        mergeImportArrays: true,
        mergeSearchPlaces: true,
        searchStrategy: options.stopDir ? "global" : "none"
      };
      return mergeOptionsBase(moduleName, defaults, options);
    }
    function cosmiconfig(moduleName, options = {}) {
      const normalizedOptions = mergeOptions(moduleName, options);
      const explorer = new Explorer_js_1.Explorer(normalizedOptions);
      return {
        search: explorer.search.bind(explorer),
        load: explorer.load.bind(explorer),
        clearLoadCache: explorer.clearLoadCache.bind(explorer),
        clearSearchCache: explorer.clearSearchCache.bind(explorer),
        clearCaches: explorer.clearCaches.bind(explorer)
      };
    }
    exports.cosmiconfig = cosmiconfig;
    function cosmiconfigSync2(moduleName, options = {}) {
      const normalizedOptions = mergeOptionsSync(moduleName, options);
      const explorerSync = new ExplorerSync_js_1.ExplorerSync(normalizedOptions);
      return {
        search: explorerSync.search.bind(explorerSync),
        load: explorerSync.load.bind(explorerSync),
        clearLoadCache: explorerSync.clearLoadCache.bind(explorerSync),
        clearSearchCache: explorerSync.clearSearchCache.bind(explorerSync),
        clearCaches: explorerSync.clearCaches.bind(explorerSync)
      };
    }
    exports.cosmiconfigSync = cosmiconfigSync2;
  }
});

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Binding.js
var __addDisposableResource = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var Binding = class {
  #name;
  #fn;
  #initSource;
  constructor(name, fn, initSource) {
    this.#name = name;
    this.#fn = fn;
    this.#initSource = initSource;
  }
  get name() {
    return this.#name;
  }
  get initSource() {
    return this.#initSource;
  }
  /**
   * @param context - Context to run the binding in; the context should have
   * the binding added to it beforehand.
   * @param id - ID of the call. This should come from the CDP
   * `onBindingCalled` response.
   * @param args - Plain arguments from CDP.
   */
  async run(context, id, args, isTrivial) {
    const stack = new DisposableStack();
    try {
      if (!isTrivial) {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
          const handles = __addDisposableResource(env_1, await context.evaluateHandle((name, seq) => {
            return globalThis[name].args.get(seq);
          }, this.#name, id), false);
          const properties = await handles.getProperties();
          for (const [index, handle] of properties) {
            if (index in args) {
              switch (handle.remoteObject().subtype) {
                case "node":
                  args[+index] = handle;
                  break;
                default:
                  stack.use(handle);
              }
            } else {
              stack.use(handle);
            }
          }
        } catch (e_1) {
          env_1.error = e_1;
          env_1.hasError = true;
        } finally {
          __disposeResources(env_1);
        }
      }
      await context.evaluate((name, seq, result) => {
        const callbacks = globalThis[name].callbacks;
        callbacks.get(seq).resolve(result);
        callbacks.delete(seq);
      }, this.#name, id, await this.#fn(...args));
      for (const arg of args) {
        if (arg instanceof JSHandle) {
          stack.use(arg);
        }
      }
    } catch (error) {
      if (isErrorLike(error)) {
        await context.evaluate((name, seq, message, stack2) => {
          const error2 = new Error(message);
          error2.stack = stack2;
          const callbacks = globalThis[name].callbacks;
          callbacks.get(seq).reject(error2);
          callbacks.delete(seq);
        }, this.#name, id, error.message, error.stack).catch(debugError);
      } else {
        await context.evaluate((name, seq, error2) => {
          const callbacks = globalThis[name].callbacks;
          callbacks.get(seq).reject(error2);
          callbacks.delete(seq);
        }, this.#name, id, error).catch(debugError);
      }
    }
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/BluetoothEmulation.js
var CdpBluetoothEmulation = class {
  #connection;
  constructor(connection) {
    this.#connection = connection;
  }
  async emulateAdapter(state, leSupported = true) {
    await this.#connection.send("BluetoothEmulation.disable");
    await this.#connection.send("BluetoothEmulation.enable", {
      state,
      leSupported
    });
  }
  async disableEmulation() {
    await this.#connection.send("BluetoothEmulation.disable");
  }
  async simulatePreconnectedPeripheral(preconnectedPeripheral) {
    await this.#connection.send("BluetoothEmulation.simulatePreconnectedPeripheral", preconnectedPeripheral);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/common/NetworkManagerEvents.js
var NetworkManagerEvent;
(function(NetworkManagerEvent2) {
  NetworkManagerEvent2.Request = /* @__PURE__ */ Symbol("NetworkManager.Request");
  NetworkManagerEvent2.RequestServedFromCache = /* @__PURE__ */ Symbol("NetworkManager.RequestServedFromCache");
  NetworkManagerEvent2.Response = /* @__PURE__ */ Symbol("NetworkManager.Response");
  NetworkManagerEvent2.RequestFailed = /* @__PURE__ */ Symbol("NetworkManager.RequestFailed");
  NetworkManagerEvent2.RequestFinished = /* @__PURE__ */ Symbol("NetworkManager.RequestFinished");
})(NetworkManagerEvent || (NetworkManagerEvent = {}));

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/CdpSession.js
var CdpCDPSession = class extends CDPSession {
  #sessionId;
  #targetType;
  #callbacks;
  #connection;
  #parentSessionId;
  #target;
  #rawErrors = false;
  #detached = false;
  /**
   * @internal
   */
  constructor(connection, targetType, sessionId, parentSessionId, rawErrors) {
    super();
    this.#connection = connection;
    this.#targetType = targetType;
    this.#callbacks = new CallbackRegistry(connection._idGenerator);
    this.#sessionId = sessionId;
    this.#parentSessionId = parentSessionId;
    this.#rawErrors = rawErrors;
  }
  /**
   * Sets the {@link CdpTarget} associated with the session instance.
   *
   * @internal
   */
  setTarget(target) {
    this.#target = target;
  }
  /**
   * Gets the {@link CdpTarget} associated with the session instance.
   *
   * @internal
   */
  target() {
    assert(this.#target, "Target must exist");
    return this.#target;
  }
  connection() {
    return this.#connection;
  }
  get detached() {
    return this.#connection._closed || this.#detached;
  }
  parentSession() {
    if (!this.#parentSessionId) {
      return this;
    }
    const parent = this.#connection?.session(this.#parentSessionId);
    return parent ?? void 0;
  }
  send(method, params, options) {
    if (this.detached) {
      return Promise.reject(new TargetCloseError(`Protocol error (${method}): Session closed. Most likely the ${this.#targetType} has been closed.`));
    }
    return this.#connection._rawSend(this.#callbacks, method, params, this.#sessionId, options);
  }
  /**
   * @internal
   */
  onMessage(object) {
    if (object.id) {
      if (object.error) {
        if (this.#rawErrors) {
          this.#callbacks.rejectRaw(object.id, object.error);
        } else {
          this.#callbacks.reject(object.id, createProtocolErrorMessage(object), object.error.message);
        }
      } else {
        this.#callbacks.resolve(object.id, object.result);
      }
    } else {
      assert(!object.id);
      this.emit(object.method, object.params);
    }
  }
  /**
   * Detaches the cdpSession from the target. Once detached, the cdpSession object
   * won't emit any events and can't be used to send messages.
   */
  async detach() {
    if (this.detached) {
      throw new Error(`Session already detached. Most likely the ${this.#targetType} has been closed.`);
    }
    await this.#connection.send("Target.detachFromTarget", {
      sessionId: this.#sessionId
    });
    this.#detached = true;
  }
  /**
   * @internal
   */
  onClosed() {
    this.#callbacks.clear();
    this.#detached = true;
    this.emit(CDPSessionEvent.Disconnected, void 0);
  }
  /**
   * Returns the session's id.
   */
  id() {
    return this.#sessionId;
  }
  /**
   * @internal
   */
  getPendingProtocolErrors() {
    return this.#callbacks.getPendingProtocolErrors();
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Connection.js
var debugProtocolSend = debug("puppeteer:protocol:SEND \u25BA");
var debugProtocolReceive = debug("puppeteer:protocol:RECV \u25C0");
var Connection = class extends EventEmitter {
  #url;
  #transport;
  #delay;
  #timeout;
  #sessions = /* @__PURE__ */ new Map();
  #closed = false;
  #manuallyAttached = /* @__PURE__ */ new Set();
  #callbacks;
  #rawErrors = false;
  #idGenerator;
  constructor(url, transport, delay = 0, timeout2, rawErrors = false, idGenerator = createIncrementalIdGenerator()) {
    super();
    this.#rawErrors = rawErrors;
    this.#idGenerator = idGenerator;
    this.#callbacks = new CallbackRegistry(idGenerator);
    this.#url = url;
    this.#delay = delay;
    this.#timeout = timeout2 ?? 18e4;
    this.#transport = transport;
    this.#transport.onmessage = this.onMessage.bind(this);
    this.#transport.onclose = this.#onClose.bind(this);
  }
  static fromSession(session) {
    return session.connection();
  }
  /**
   * @internal
   */
  get delay() {
    return this.#delay;
  }
  get timeout() {
    return this.#timeout;
  }
  /**
   * @internal
   */
  get _closed() {
    return this.#closed;
  }
  /**
   * @internal
   */
  get _idGenerator() {
    return this.#idGenerator;
  }
  /**
   * @internal
   */
  get _sessions() {
    return this.#sessions;
  }
  /**
   * @internal
   */
  _session(sessionId) {
    return this.#sessions.get(sessionId) || null;
  }
  /**
   * @param sessionId - The session id
   * @returns The current CDP session if it exists
   */
  session(sessionId) {
    return this._session(sessionId);
  }
  url() {
    return this.#url;
  }
  send(method, params, options) {
    return this._rawSend(this.#callbacks, method, params, void 0, options);
  }
  /**
   * @internal
   */
  _rawSend(callbacks, method, params, sessionId, options) {
    if (this.#closed) {
      return Promise.reject(new ConnectionClosedError("Connection closed."));
    }
    return callbacks.create(method, options?.timeout ?? this.#timeout, (id) => {
      const stringifiedMessage = JSON.stringify({
        method,
        params,
        id,
        sessionId
      });
      debugProtocolSend(stringifiedMessage);
      this.#transport.send(stringifiedMessage);
    });
  }
  /**
   * @internal
   */
  async closeBrowser() {
    await this.send("Browser.close");
  }
  /**
   * @internal
   */
  async onMessage(message) {
    if (this.#delay) {
      await new Promise((r) => {
        return setTimeout(r, this.#delay);
      });
    }
    debugProtocolReceive(message);
    const object = JSON.parse(message);
    if (object.method === "Target.attachedToTarget") {
      const sessionId = object.params.sessionId;
      const session = new CdpCDPSession(this, object.params.targetInfo.type, sessionId, object.sessionId, this.#rawErrors);
      this.#sessions.set(sessionId, session);
      this.emit(CDPSessionEvent.SessionAttached, session);
      const parentSession = this.#sessions.get(object.sessionId);
      if (parentSession) {
        parentSession.emit(CDPSessionEvent.SessionAttached, session);
      }
    } else if (object.method === "Target.detachedFromTarget") {
      const session = this.#sessions.get(object.params.sessionId);
      if (session) {
        session.onClosed();
        this.#sessions.delete(object.params.sessionId);
        this.emit(CDPSessionEvent.SessionDetached, session);
        const parentSession = this.#sessions.get(object.sessionId);
        if (parentSession) {
          parentSession.emit(CDPSessionEvent.SessionDetached, session);
        }
      }
    }
    if (object.sessionId) {
      const session = this.#sessions.get(object.sessionId);
      if (session) {
        session.onMessage(object);
      }
    } else if (object.id) {
      if (object.error) {
        if (this.#rawErrors) {
          this.#callbacks.rejectRaw(object.id, object.error);
        } else {
          this.#callbacks.reject(object.id, createProtocolErrorMessage(object), object.error.message);
        }
      } else {
        this.#callbacks.resolve(object.id, object.result);
      }
    } else {
      this.emit(object.method, object.params);
    }
  }
  #onClose() {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#transport.onmessage = void 0;
    this.#transport.onclose = void 0;
    this.#callbacks.clear();
    for (const session of this.#sessions.values()) {
      session.onClosed();
    }
    this.#sessions.clear();
    this.emit(CDPSessionEvent.Disconnected, void 0);
  }
  dispose() {
    this.#onClose();
    this.#transport.close();
  }
  /**
   * @internal
   */
  isAutoAttached(targetId) {
    return !this.#manuallyAttached.has(targetId);
  }
  /**
   * @internal
   */
  async _createSession(targetInfo, isAutoAttachEmulated = true) {
    if (!isAutoAttachEmulated) {
      this.#manuallyAttached.add(targetInfo.targetId);
    }
    const { sessionId } = await this.send("Target.attachToTarget", {
      targetId: targetInfo.targetId,
      flatten: true
    });
    this.#manuallyAttached.delete(targetInfo.targetId);
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error("CDPSession creation failed.");
    }
    return session;
  }
  /**
   * @param targetInfo - The target info
   * @returns The CDP session that is created
   */
  async createSession(targetInfo) {
    return await this._createSession(targetInfo, false);
  }
  /**
   * @internal
   */
  getPendingProtocolErrors() {
    const result = [];
    result.push(...this.#callbacks.getPendingProtocolErrors());
    for (const session of this.#sessions.values()) {
      result.push(...session.getPendingProtocolErrors());
    }
    return result;
  }
};
function isTargetClosedError(error) {
  return error instanceof TargetCloseError;
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Dialog.js
var CdpDialog = class extends Dialog {
  #client;
  constructor(client, type, message, defaultValue = "") {
    super(type, message, defaultValue);
    this.#client = client;
  }
  async handle(options) {
    await this.#client.send("Page.handleJavaScriptDialog", {
      accept: options.accept,
      promptText: options.text
    });
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/CdpPreloadScript.js
var CdpPreloadScript = class {
  /**
   * This is the ID of the preload script returned by
   * Page.addScriptToEvaluateOnNewDocument in the main frame.
   *
   * Sub-frames would get a different CDP ID because
   * addScriptToEvaluateOnNewDocument is called for each subframe. But
   * users only see this ID and subframe IDs are internal to Puppeteer.
   */
  #id;
  #source;
  #frameToId = /* @__PURE__ */ new WeakMap();
  constructor(mainFrame, id, source) {
    this.#id = id;
    this.#source = source;
    this.#frameToId.set(mainFrame, id);
  }
  get id() {
    return this.#id;
  }
  get source() {
    return this.#source;
  }
  getIdForFrame(frame) {
    return this.#frameToId.get(frame);
  }
  setIdForFrame(frame, identifier) {
    this.#frameToId.set(frame, identifier);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/DeviceRequestPrompt.js
var CdpDeviceRequestPrompt = class extends DeviceRequestPrompt {
  #client;
  #timeoutSettings;
  #id;
  #handled = false;
  #updateDevicesHandle = this.#updateDevices.bind(this);
  #waitForDevicePromises = /* @__PURE__ */ new Set();
  constructor(client, timeoutSettings, firstEvent) {
    super();
    this.#client = client;
    this.#timeoutSettings = timeoutSettings;
    this.#id = firstEvent.id;
    this.#client.on("DeviceAccess.deviceRequestPrompted", this.#updateDevicesHandle);
    this.#client.on("Target.detachedFromTarget", () => {
      this.#client = null;
    });
    this.#updateDevices(firstEvent);
  }
  #updateDevices(event) {
    if (event.id !== this.#id) {
      return;
    }
    for (const rawDevice of event.devices) {
      if (this.devices.some((device) => {
        return device.id === rawDevice.id;
      })) {
        continue;
      }
      const newDevice = { id: rawDevice.id, name: rawDevice.name };
      this.devices.push(newDevice);
      for (const waitForDevicePromise of this.#waitForDevicePromises) {
        if (waitForDevicePromise.filter(newDevice)) {
          waitForDevicePromise.promise.resolve(newDevice);
        }
      }
    }
  }
  async waitForDevice(filter2, options = {}) {
    for (const device of this.devices) {
      if (filter2(device)) {
        return device;
      }
    }
    const { timeout: timeout2 = this.#timeoutSettings.timeout() } = options;
    const deferred = Deferred.create({
      message: `Waiting for \`DeviceRequestPromptDevice\` failed: ${timeout2}ms exceeded`,
      timeout: timeout2
    });
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        deferred.reject(options.signal?.reason);
      }, { once: true });
    }
    const handle = { filter: filter2, promise: deferred };
    this.#waitForDevicePromises.add(handle);
    try {
      return await deferred.valueOrThrow();
    } finally {
      this.#waitForDevicePromises.delete(handle);
    }
  }
  async select(device) {
    assert(this.#client !== null, "Cannot select device through detached session!");
    assert(this.devices.includes(device), "Cannot select unknown device!");
    assert(!this.#handled, "Cannot select DeviceRequestPrompt which is already handled!");
    this.#client.off("DeviceAccess.deviceRequestPrompted", this.#updateDevicesHandle);
    this.#handled = true;
    return await this.#client.send("DeviceAccess.selectPrompt", {
      id: this.#id,
      deviceId: device.id
    });
  }
  async cancel() {
    assert(this.#client !== null, "Cannot cancel prompt through detached session!");
    assert(!this.#handled, "Cannot cancel DeviceRequestPrompt which is already handled!");
    this.#client.off("DeviceAccess.deviceRequestPrompted", this.#updateDevicesHandle);
    this.#handled = true;
    return await this.#client.send("DeviceAccess.cancelPrompt", { id: this.#id });
  }
};
var CdpDeviceRequestPromptManager = class {
  #client;
  #timeoutSettings;
  #deviceRequestPromptDeferreds = /* @__PURE__ */ new Set();
  constructor(client, timeoutSettings) {
    this.#client = client;
    this.#timeoutSettings = timeoutSettings;
    this.#client.on("DeviceAccess.deviceRequestPrompted", (event) => {
      this.#onDeviceRequestPrompted(event);
    });
    this.#client.on("Target.detachedFromTarget", () => {
      this.#client = null;
    });
  }
  async waitForDevicePrompt(options = {}) {
    assert(this.#client !== null, "Cannot wait for device prompt through detached session!");
    const needsEnable = this.#deviceRequestPromptDeferreds.size === 0;
    let enablePromise;
    if (needsEnable) {
      enablePromise = this.#client.send("DeviceAccess.enable");
    }
    const { timeout: timeout2 = this.#timeoutSettings.timeout() } = options;
    const deferred = Deferred.create({
      message: `Waiting for \`DeviceRequestPrompt\` failed: ${timeout2}ms exceeded`,
      timeout: timeout2
    });
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        deferred.reject(options.signal?.reason);
      }, { once: true });
    }
    this.#deviceRequestPromptDeferreds.add(deferred);
    try {
      const [result] = await Promise.all([
        deferred.valueOrThrow(),
        enablePromise
      ]);
      return result;
    } finally {
      this.#deviceRequestPromptDeferreds.delete(deferred);
    }
  }
  #onDeviceRequestPrompted(event) {
    if (!this.#deviceRequestPromptDeferreds.size) {
      return;
    }
    assert(this.#client !== null);
    const devicePrompt = new CdpDeviceRequestPrompt(this.#client, this.#timeoutSettings, event);
    for (const promise of this.#deviceRequestPromptDeferreds) {
      promise.resolve(devicePrompt);
    }
    this.#deviceRequestPromptDeferreds.clear();
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/utils.js
function createEvaluationError(details) {
  let name;
  let message;
  if (!details.exception) {
    name = "Error";
    message = details.text;
  } else if ((details.exception.type !== "object" || details.exception.subtype !== "error") && !details.exception.objectId) {
    return valueFromPrimitiveRemoteObject(details.exception);
  } else {
    const detail = getErrorDetails(details);
    name = detail.name;
    message = detail.message;
  }
  const messageHeight = message.split("\n").length;
  const error = new Error(message);
  error.name = name;
  const stackLines = error.stack.split("\n");
  const messageLines = stackLines.splice(0, messageHeight);
  stackLines.shift();
  if (details.stackTrace && stackLines.length < Error.stackTraceLimit) {
    for (const frame of details.stackTrace.callFrames.reverse()) {
      if (PuppeteerURL.isPuppeteerURL(frame.url) && frame.url !== PuppeteerURL.INTERNAL_URL) {
        const url = PuppeteerURL.parse(frame.url);
        stackLines.unshift(`    at ${frame.functionName || url.functionName} (${url.functionName} at ${url.siteString}, <anonymous>:${frame.lineNumber}:${frame.columnNumber})`);
      } else {
        stackLines.push(`    at ${frame.functionName || "<anonymous>"} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})`);
      }
      if (stackLines.length >= Error.stackTraceLimit) {
        break;
      }
    }
  }
  error.stack = [...messageLines, ...stackLines].join("\n");
  return error;
}
var getErrorDetails = (details) => {
  let name = "";
  let message;
  const lines = details.exception?.description?.split("\n    at ") ?? [];
  const size = Math.min(details.stackTrace?.callFrames.length ?? 0, lines.length - 1);
  lines.splice(-size, size);
  if (details.exception?.className) {
    name = details.exception.className;
  }
  message = lines.join("\n");
  if (name && message.startsWith(`${name}: `)) {
    message = message.slice(name.length + 2);
  }
  return { message, name };
};
function createClientError(details) {
  let name;
  let message;
  if (!details.exception) {
    name = "Error";
    message = details.text;
  } else if ((details.exception.type !== "object" || details.exception.subtype !== "error") && !details.exception.objectId) {
    return valueFromPrimitiveRemoteObject(details.exception);
  } else {
    const detail = getErrorDetails(details);
    name = detail.name;
    message = detail.message;
  }
  const error = new Error(message);
  error.name = name;
  const messageHeight = error.message.split("\n").length;
  const messageLines = error.stack.split("\n").splice(0, messageHeight);
  const stackLines = [];
  if (details.stackTrace) {
    for (const frame of details.stackTrace.callFrames) {
      stackLines.push(`    at ${frame.functionName || "<anonymous>"} (${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1})`);
      if (stackLines.length >= Error.stackTraceLimit) {
        break;
      }
    }
  }
  error.stack = [...messageLines, ...stackLines].join("\n");
  return error;
}
function valueFromJSHandle(handle) {
  const remoteObject = handle.remoteObject();
  if (remoteObject.objectId) {
    return valueFromRemoteObjectReference(handle);
  } else {
    return valueFromPrimitiveRemoteObject(remoteObject);
  }
}
function valueFromRemoteObjectReference(handle) {
  const remoteObject = handle.remoteObject();
  assert(remoteObject.objectId, "Cannot extract value when no objectId is given");
  const description = remoteObject.description ?? "";
  if (remoteObject.subtype === "error" && description) {
    const newlineIdx = description.indexOf("\n");
    if (newlineIdx === -1) {
      return description;
    }
    return description.slice(0, newlineIdx);
  }
  return `[${remoteObject.subtype || remoteObject.type} ${remoteObject.className}]`;
}
function valueFromPrimitiveRemoteObject(remoteObject) {
  assert(!remoteObject.objectId, "Cannot extract value when objectId is given");
  if (remoteObject.unserializableValue) {
    if (remoteObject.type === "bigint") {
      return BigInt(remoteObject.unserializableValue.replace("n", ""));
    }
    switch (remoteObject.unserializableValue) {
      case "-0":
        return -0;
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        throw new Error("Unsupported unserializable value: " + remoteObject.unserializableValue);
    }
  }
  return remoteObject.value;
}
function addPageBinding(type, name, prefix) {
  if (globalThis[name]) {
    return;
  }
  Object.assign(globalThis, {
    [name](...args) {
      const callPuppeteer = globalThis[name];
      callPuppeteer.args ??= /* @__PURE__ */ new Map();
      callPuppeteer.callbacks ??= /* @__PURE__ */ new Map();
      const seq = (callPuppeteer.lastSeq ?? 0) + 1;
      callPuppeteer.lastSeq = seq;
      callPuppeteer.args.set(seq, args);
      globalThis[prefix + name](JSON.stringify({
        type,
        name,
        seq,
        args,
        isTrivial: !args.some((value) => {
          return value instanceof Node;
        })
      }));
      return new Promise((resolve, reject) => {
        callPuppeteer.callbacks.set(seq, {
          resolve(value) {
            callPuppeteer.args.delete(seq);
            resolve(value);
          },
          reject(value) {
            callPuppeteer.args.delete(seq);
            reject(value);
          }
        });
      });
    }
  });
}
var CDP_BINDING_PREFIX = "puppeteer_";
function pageBindingInitString(type, name) {
  return evaluationString(addPageBinding, type, name, CDP_BINDING_PREFIX);
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/JSHandle.js
var CdpJSHandle = class extends JSHandle {
  #disposed = false;
  #remoteObject;
  #world;
  constructor(world, remoteObject) {
    super();
    this.#world = world;
    this.#remoteObject = remoteObject;
  }
  get disposed() {
    return this.#disposed;
  }
  get realm() {
    return this.#world;
  }
  get client() {
    return this.realm.environment.client;
  }
  async jsonValue() {
    if (!this.#remoteObject.objectId) {
      return valueFromPrimitiveRemoteObject(this.#remoteObject);
    }
    const value = await this.evaluate((object) => {
      return object;
    });
    if (value === void 0) {
      throw new Error("Could not serialize referenced object");
    }
    return value;
  }
  /**
   * Either `null` or the handle itself if the handle is an
   * instance of {@link ElementHandle}.
   */
  asElement() {
    return null;
  }
  async dispose() {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    await releaseObject(this.client, this.#remoteObject);
  }
  toString() {
    if (!this.#remoteObject.objectId) {
      return "JSHandle:" + valueFromPrimitiveRemoteObject(this.#remoteObject);
    }
    const type = this.#remoteObject.subtype || this.#remoteObject.type;
    return "JSHandle@" + type;
  }
  get id() {
    return this.#remoteObject.objectId;
  }
  remoteObject() {
    return this.#remoteObject;
  }
  async getProperties() {
    const response = await this.client.send("Runtime.getProperties", {
      objectId: this.#remoteObject.objectId,
      ownProperties: true
    });
    const result = /* @__PURE__ */ new Map();
    for (const property of response.result) {
      if (!property.enumerable || !property.value) {
        continue;
      }
      result.set(property.name, this.#world.createCdpHandle(property.value));
    }
    return result;
  }
};
async function releaseObject(client, remoteObject) {
  if (!remoteObject.objectId) {
    return;
  }
  await client.send("Runtime.releaseObject", { objectId: remoteObject.objectId }).catch((error) => {
    debugError(error);
  });
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/ElementHandle.js
var __runInitializers = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var NON_ELEMENT_NODE_ROLES = /* @__PURE__ */ new Set(["StaticText", "InlineTextBox"]);
var CdpElementHandle = (() => {
  let _classSuper = ElementHandle;
  let _instanceExtraInitializers = [];
  let _contentFrame_decorators;
  let _scrollIntoView_decorators;
  let _uploadFile_decorators;
  let _autofill_decorators;
  return class CdpElementHandle extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _contentFrame_decorators = [throwIfDisposed()];
      _scrollIntoView_decorators = [throwIfDisposed(), bindIsolatedHandle];
      _uploadFile_decorators = [throwIfDisposed(), bindIsolatedHandle];
      _autofill_decorators = [throwIfDisposed()];
      __esDecorate(this, null, _contentFrame_decorators, { kind: "method", name: "contentFrame", static: false, private: false, access: { has: (obj) => "contentFrame" in obj, get: (obj) => obj.contentFrame }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _scrollIntoView_decorators, { kind: "method", name: "scrollIntoView", static: false, private: false, access: { has: (obj) => "scrollIntoView" in obj, get: (obj) => obj.scrollIntoView }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _uploadFile_decorators, { kind: "method", name: "uploadFile", static: false, private: false, access: { has: (obj) => "uploadFile" in obj, get: (obj) => obj.uploadFile }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _autofill_decorators, { kind: "method", name: "autofill", static: false, private: false, access: { has: (obj) => "autofill" in obj, get: (obj) => obj.autofill }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #backendNodeId = __runInitializers(this, _instanceExtraInitializers);
    constructor(world, remoteObject) {
      super(new CdpJSHandle(world, remoteObject));
    }
    get realm() {
      return this.handle.realm;
    }
    get client() {
      return this.handle.client;
    }
    remoteObject() {
      return this.handle.remoteObject();
    }
    get #frameManager() {
      return this.frame._frameManager;
    }
    get frame() {
      return this.realm.environment;
    }
    async contentFrame() {
      const nodeInfo = await this.client.send("DOM.describeNode", {
        objectId: this.id
      });
      if (typeof nodeInfo.node.frameId !== "string") {
        return null;
      }
      return this.#frameManager.frame(nodeInfo.node.frameId);
    }
    async scrollIntoView() {
      await this.assertConnectedElement();
      try {
        await this.client.send("DOM.scrollIntoViewIfNeeded", {
          objectId: this.id
        });
      } catch (error) {
        debugError(error);
        await super.scrollIntoView();
      }
    }
    async uploadFile(...files) {
      const isMultiple = await this.evaluate((element) => {
        return element.multiple;
      });
      assert(files.length <= 1 || isMultiple, "Multiple file uploads only work with <input type=file multiple>");
      const path4 = environment.value.path;
      if (path4) {
        files = files.map((filePath) => {
          if (path4.win32.isAbsolute(filePath) || path4.posix.isAbsolute(filePath)) {
            return filePath;
          } else {
            return path4.resolve(filePath);
          }
        });
      }
      if (files.length === 0) {
        await this.evaluate((element) => {
          element.files = new DataTransfer().files;
          element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        });
        return;
      }
      const { node: { backendNodeId } } = await this.client.send("DOM.describeNode", {
        objectId: this.id
      });
      await this.client.send("DOM.setFileInputFiles", {
        objectId: this.id,
        files,
        backendNodeId
      });
    }
    async autofill(data) {
      const nodeInfo = await this.client.send("DOM.describeNode", {
        objectId: this.handle.id
      });
      const fieldId = nodeInfo.node.backendNodeId;
      const frameId = this.frame._id;
      await this.client.send("Autofill.trigger", {
        fieldId,
        frameId,
        card: data.creditCard
      });
    }
    async *queryAXTree(name, role) {
      const { nodes } = await this.client.send("Accessibility.queryAXTree", {
        objectId: this.id,
        accessibleName: name,
        role
      });
      const results = nodes.filter((node) => {
        if (node.ignored) {
          return false;
        }
        if (!node.role) {
          return false;
        }
        if (NON_ELEMENT_NODE_ROLES.has(node.role.value)) {
          return false;
        }
        return true;
      });
      return yield* AsyncIterableUtil.map(results, (node) => {
        return this.realm.adoptBackendNode(node.backendDOMNodeId);
      });
    }
    async backendNodeId() {
      if (this.#backendNodeId) {
        return this.#backendNodeId;
      }
      const { node } = await this.client.send("DOM.describeNode", {
        objectId: this.handle.id
      });
      this.#backendNodeId = node.backendNodeId;
      return this.#backendNodeId;
    }
  };
})();

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/ExecutionContext.js
var __addDisposableResource2 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources2 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var ariaQuerySelectorBinding = new Binding("__ariaQuerySelector", ARIAQueryHandler.queryOne, "");
var ariaQuerySelectorAllBinding = new Binding("__ariaQuerySelectorAll", (async (element, selector) => {
  const results = ARIAQueryHandler.queryAll(element, selector);
  return await element.realm.evaluateHandle((...elements) => {
    return elements;
  }, ...await AsyncIterableUtil.collect(results));
}), "");
var ExecutionContext = class extends EventEmitter {
  #client;
  #world;
  #id;
  #name;
  #disposables = new DisposableStack();
  constructor(client, contextPayload, world) {
    super();
    this.#client = client;
    this.#world = world;
    this.#id = contextPayload.id;
    if (contextPayload.name) {
      this.#name = contextPayload.name;
    }
    const clientEmitter = this.#disposables.use(new EventEmitter(this.#client));
    clientEmitter.on("Runtime.bindingCalled", this.#onBindingCalled.bind(this));
    clientEmitter.on("Runtime.executionContextDestroyed", async (event) => {
      if (event.executionContextId === this.#id) {
        this[disposeSymbol]();
      }
    });
    clientEmitter.on("Runtime.executionContextsCleared", async () => {
      this[disposeSymbol]();
    });
    clientEmitter.on("Runtime.consoleAPICalled", this.#onConsoleAPI.bind(this));
    clientEmitter.on(CDPSessionEvent.Disconnected, () => {
      this[disposeSymbol]();
    });
  }
  // Contains mapping from functions that should be bound to Puppeteer functions.
  #bindings = /* @__PURE__ */ new Map();
  // If multiple waitFor are set up asynchronously, we need to wait for the
  // first one to set up the binding in the page before running the others.
  #mutex = new Mutex();
  async #addBinding(binding) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      if (this.#bindings.has(binding.name)) {
        return;
      }
      const _ = __addDisposableResource2(env_1, await this.#mutex.acquire(), false);
      try {
        await this.#client.send("Runtime.addBinding", this.#name ? {
          name: CDP_BINDING_PREFIX + binding.name,
          executionContextName: this.#name
        } : {
          name: CDP_BINDING_PREFIX + binding.name,
          executionContextId: this.#id
        });
        await this.evaluate(addPageBinding, "internal", binding.name, CDP_BINDING_PREFIX);
        this.#bindings.set(binding.name, binding);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Execution context was destroyed")) {
            return;
          }
          if (error.message.includes("Cannot find context with specified id")) {
            return;
          }
        }
        debugError(error);
      }
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      __disposeResources2(env_1);
    }
  }
  async #onBindingCalled(event) {
    if (event.executionContextId !== this.#id) {
      return;
    }
    let payload;
    try {
      payload = JSON.parse(event.payload);
    } catch {
      return;
    }
    const { type, name, seq, args, isTrivial } = payload;
    if (type !== "internal") {
      this.emit("bindingcalled", event);
      return;
    }
    if (!this.#bindings.has(name)) {
      this.emit("bindingcalled", event);
      return;
    }
    try {
      const binding = this.#bindings.get(name);
      await binding?.run(this, seq, args, isTrivial);
    } catch (err) {
      debugError(err);
    }
  }
  get id() {
    return this.#id;
  }
  #onConsoleAPI(event) {
    if (event.executionContextId !== this.#id) {
      return;
    }
    this.emit("consoleapicalled", event);
  }
  #bindingsInstalled = false;
  #puppeteerUtil;
  get puppeteerUtil() {
    let promise = Promise.resolve();
    if (!this.#bindingsInstalled) {
      promise = Promise.all([
        this.#addBindingWithoutThrowing(ariaQuerySelectorBinding),
        this.#addBindingWithoutThrowing(ariaQuerySelectorAllBinding)
      ]);
      this.#bindingsInstalled = true;
    }
    scriptInjector.inject((script) => {
      if (this.#puppeteerUtil) {
        void this.#puppeteerUtil.then((handle) => {
          void handle.dispose();
        });
      }
      this.#puppeteerUtil = promise.then(() => {
        return this.evaluateHandle(script);
      });
    }, !this.#puppeteerUtil);
    return this.#puppeteerUtil;
  }
  async #addBindingWithoutThrowing(binding) {
    try {
      await this.#addBinding(binding);
    } catch (err) {
      debugError(err);
    }
  }
  /**
   * Evaluates the given function.
   *
   * @example
   *
   * ```ts
   * const executionContext = await page.mainFrame().executionContext();
   * const result = await executionContext.evaluate(() => Promise.resolve(8 * 7))* ;
   * console.log(result); // prints "56"
   * ```
   *
   * @example
   * A string can also be passed in instead of a function:
   *
   * ```ts
   * console.log(await executionContext.evaluate('1 + 2')); // prints "3"
   * ```
   *
   * @example
   * Handles can also be passed as `args`. They resolve to their referenced object:
   *
   * ```ts
   * const oneHandle = await executionContext.evaluateHandle(() => 1);
   * const twoHandle = await executionContext.evaluateHandle(() => 2);
   * const result = await executionContext.evaluate(
   *   (a, b) => a + b,
   *   oneHandle,
   *   twoHandle,
   * );
   * await oneHandle.dispose();
   * await twoHandle.dispose();
   * console.log(result); // prints '3'.
   * ```
   *
   * @param pageFunction - The function to evaluate.
   * @param args - Additional arguments to pass into the function.
   * @returns The result of evaluating the function. If the result is an object,
   * a vanilla object containing the serializable properties of the result is
   * returned.
   */
  async evaluate(pageFunction, ...args) {
    return await this.#evaluate(true, pageFunction, ...args);
  }
  /**
   * Evaluates the given function.
   *
   * Unlike {@link ExecutionContext.evaluate | evaluate}, this method returns a
   * handle to the result of the function.
   *
   * This method may be better suited if the object cannot be serialized (e.g.
   * `Map`) and requires further manipulation.
   *
   * @example
   *
   * ```ts
   * const context = await page.mainFrame().executionContext();
   * const handle: JSHandle<typeof globalThis> = await context.evaluateHandle(
   *   () => Promise.resolve(self),
   * );
   * ```
   *
   * @example
   * A string can also be passed in instead of a function.
   *
   * ```ts
   * const handle: JSHandle<number> = await context.evaluateHandle('1 + 2');
   * ```
   *
   * @example
   * Handles can also be passed as `args`. They resolve to their referenced object:
   *
   * ```ts
   * const bodyHandle: ElementHandle<HTMLBodyElement> =
   *   await context.evaluateHandle(() => {
   *     return document.body;
   *   });
   * const stringHandle: JSHandle<string> = await context.evaluateHandle(
   *   body => body.innerHTML,
   *   body,
   * );
   * console.log(await stringHandle.jsonValue()); // prints body's innerHTML
   * // Always dispose your garbage! :)
   * await bodyHandle.dispose();
   * await stringHandle.dispose();
   * ```
   *
   * @param pageFunction - The function to evaluate.
   * @param args - Additional arguments to pass into the function.
   * @returns A {@link JSHandle | handle} to the result of evaluating the
   * function. If the result is a `Node`, then this will return an
   * {@link ElementHandle | element handle}.
   */
  async evaluateHandle(pageFunction, ...args) {
    return await this.#evaluate(false, pageFunction, ...args);
  }
  async #evaluate(returnByValue, pageFunction, ...args) {
    const sourceUrlComment = getSourceUrlComment(getSourcePuppeteerURLIfAvailable(pageFunction)?.toString() ?? PuppeteerURL.INTERNAL_URL);
    if (isString(pageFunction)) {
      const contextId = this.#id;
      const expression = pageFunction;
      const expressionWithSourceUrl = SOURCE_URL_REGEX.test(expression) ? expression : `${expression}
${sourceUrlComment}
`;
      const { exceptionDetails: exceptionDetails2, result: remoteObject2 } = await this.#client.send("Runtime.evaluate", {
        expression: expressionWithSourceUrl,
        contextId,
        returnByValue,
        awaitPromise: true,
        userGesture: true
      }).catch(rewriteError);
      if (exceptionDetails2) {
        throw createEvaluationError(exceptionDetails2);
      }
      if (returnByValue) {
        return valueFromPrimitiveRemoteObject(remoteObject2);
      }
      return this.#world.createCdpHandle(remoteObject2);
    }
    const functionDeclaration = stringifyFunction(pageFunction);
    const functionDeclarationWithSourceUrl = SOURCE_URL_REGEX.test(functionDeclaration) ? functionDeclaration : `${functionDeclaration}
${sourceUrlComment}
`;
    let callFunctionOnPromise;
    try {
      callFunctionOnPromise = this.#client.send("Runtime.callFunctionOn", {
        functionDeclaration: functionDeclarationWithSourceUrl,
        executionContextId: this.#id,
        // LazyArgs are used only internally and should not affect the order
        // evaluate calls for the public APIs.
        arguments: args.some((arg) => {
          return arg instanceof LazyArg;
        }) ? await Promise.all(args.map((arg) => {
          return convertArgumentAsync(this, arg);
        })) : args.map((arg) => {
          return convertArgument(this, arg);
        }),
        returnByValue,
        awaitPromise: true,
        userGesture: true
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.startsWith("Converting circular structure to JSON")) {
        error.message += " Recursive objects are not allowed.";
      }
      throw error;
    }
    const { exceptionDetails, result: remoteObject } = await callFunctionOnPromise.catch(rewriteError);
    if (exceptionDetails) {
      throw createEvaluationError(exceptionDetails);
    }
    if (returnByValue) {
      return valueFromPrimitiveRemoteObject(remoteObject);
    }
    return this.#world.createCdpHandle(remoteObject);
    async function convertArgumentAsync(context, arg) {
      if (arg instanceof LazyArg) {
        arg = await arg.get(context);
      }
      return convertArgument(context, arg);
    }
    function convertArgument(context, arg) {
      if (typeof arg === "bigint") {
        return { unserializableValue: `${arg.toString()}n` };
      }
      if (Object.is(arg, -0)) {
        return { unserializableValue: "-0" };
      }
      if (Object.is(arg, Infinity)) {
        return { unserializableValue: "Infinity" };
      }
      if (Object.is(arg, -Infinity)) {
        return { unserializableValue: "-Infinity" };
      }
      if (Object.is(arg, NaN)) {
        return { unserializableValue: "NaN" };
      }
      const objectHandle = arg && (arg instanceof CdpJSHandle || arg instanceof CdpElementHandle) ? arg : null;
      if (objectHandle) {
        if (objectHandle.realm !== context.#world) {
          throw new Error("JSHandles can be evaluated only in the context they were created!");
        }
        if (objectHandle.disposed) {
          throw new Error("JSHandle is disposed!");
        }
        if (objectHandle.remoteObject().unserializableValue) {
          return {
            unserializableValue: objectHandle.remoteObject().unserializableValue
          };
        }
        if (!objectHandle.remoteObject().objectId) {
          return { value: objectHandle.remoteObject().value };
        }
        return { objectId: objectHandle.remoteObject().objectId };
      }
      return { value: arg };
    }
  }
  [disposeSymbol]() {
    this.#disposables.dispose();
    this.emit("disposed", void 0);
  }
};
var rewriteError = (error) => {
  if (error.message.includes("Object reference chain is too long")) {
    return { result: { type: "undefined" } };
  }
  if (error.message.includes("Object couldn't be returned by value")) {
    return { result: { type: "undefined" } };
  }
  if (error.message.endsWith("Cannot find context with specified id") || error.message.endsWith("Inspected target navigated or closed")) {
    throw new Error("Execution context was destroyed, most likely because of a navigation.");
  }
  throw error;
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/FrameManagerEvents.js
var FrameManagerEvent;
(function(FrameManagerEvent2) {
  FrameManagerEvent2.FrameAttached = /* @__PURE__ */ Symbol("FrameManager.FrameAttached");
  FrameManagerEvent2.FrameNavigated = /* @__PURE__ */ Symbol("FrameManager.FrameNavigated");
  FrameManagerEvent2.FrameDetached = /* @__PURE__ */ Symbol("FrameManager.FrameDetached");
  FrameManagerEvent2.FrameSwapped = /* @__PURE__ */ Symbol("FrameManager.FrameSwapped");
  FrameManagerEvent2.LifecycleEvent = /* @__PURE__ */ Symbol("FrameManager.LifecycleEvent");
  FrameManagerEvent2.FrameNavigatedWithinDocument = /* @__PURE__ */ Symbol("FrameManager.FrameNavigatedWithinDocument");
  FrameManagerEvent2.ConsoleApiCalled = /* @__PURE__ */ Symbol("FrameManager.ConsoleApiCalled");
  FrameManagerEvent2.BindingCalled = /* @__PURE__ */ Symbol("FrameManager.BindingCalled");
})(FrameManagerEvent || (FrameManagerEvent = {}));

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/IsolatedWorld.js
var IsolatedWorld = class extends Realm {
  #context;
  #emitter = new EventEmitter();
  #frameOrWorker;
  constructor(frameOrWorker, timeoutSettings) {
    super(timeoutSettings);
    this.#frameOrWorker = frameOrWorker;
  }
  get environment() {
    return this.#frameOrWorker;
  }
  get client() {
    return this.#frameOrWorker.client;
  }
  get emitter() {
    return this.#emitter;
  }
  setContext(context) {
    this.#context?.[disposeSymbol]();
    context.once("disposed", this.#onContextDisposed.bind(this));
    context.on("consoleapicalled", this.#onContextConsoleApiCalled.bind(this));
    context.on("bindingcalled", this.#onContextBindingCalled.bind(this));
    this.#context = context;
    this.#emitter.emit("context", context);
    void this.taskManager.rerunAll();
  }
  #onContextDisposed() {
    this.#context = void 0;
    if ("clearDocumentHandle" in this.#frameOrWorker) {
      this.#frameOrWorker.clearDocumentHandle();
    }
  }
  #onContextConsoleApiCalled(event) {
    this.#emitter.emit("consoleapicalled", event);
  }
  #onContextBindingCalled(event) {
    this.#emitter.emit("bindingcalled", event);
  }
  hasContext() {
    return !!this.#context;
  }
  get context() {
    return this.#context;
  }
  #executionContext() {
    if (this.disposed) {
      throw new Error(`Execution context is not available in detached frame or worker "${this.environment.url()}" (are you trying to evaluate?)`);
    }
    return this.#context;
  }
  /**
   * Waits for the next context to be set on the isolated world.
   */
  async #waitForExecutionContext() {
    const error = new Error("Execution context was destroyed");
    const result = await firstValueFrom(fromEmitterEvent(this.#emitter, "context").pipe(raceWith(fromEmitterEvent(this.#emitter, "disposed").pipe(map(() => {
      throw error;
    })), timeout(this.timeoutSettings.timeout()))));
    return result;
  }
  async evaluateHandle(pageFunction, ...args) {
    pageFunction = withSourcePuppeteerURLIfNone(this.evaluateHandle.name, pageFunction);
    let context = this.#executionContext();
    if (!context) {
      context = await this.#waitForExecutionContext();
    }
    return await context.evaluateHandle(pageFunction, ...args);
  }
  async evaluate(pageFunction, ...args) {
    pageFunction = withSourcePuppeteerURLIfNone(this.evaluate.name, pageFunction);
    let context = this.#executionContext();
    if (!context) {
      context = await this.#waitForExecutionContext();
    }
    return await context.evaluate(pageFunction, ...args);
  }
  async adoptBackendNode(backendNodeId) {
    let context = this.#executionContext();
    if (!context) {
      context = await this.#waitForExecutionContext();
    }
    const { object } = await this.client.send("DOM.resolveNode", {
      backendNodeId,
      executionContextId: context.id
    });
    return this.createCdpHandle(object);
  }
  async adoptHandle(handle) {
    if (handle.realm === this) {
      return await handle.evaluateHandle((value) => {
        return value;
      });
    }
    const nodeInfo = await this.client.send("DOM.describeNode", {
      objectId: handle.id
    });
    return await this.adoptBackendNode(nodeInfo.node.backendNodeId);
  }
  async transferHandle(handle) {
    if (handle.realm === this) {
      return handle;
    }
    if (handle.remoteObject().objectId === void 0) {
      return handle;
    }
    const info = await this.client.send("DOM.describeNode", {
      objectId: handle.remoteObject().objectId
    });
    const newHandle = await this.adoptBackendNode(info.node.backendNodeId);
    await handle.dispose();
    return newHandle;
  }
  /**
   * @internal
   */
  createCdpHandle(remoteObject) {
    if (remoteObject.subtype === "node") {
      return new CdpElementHandle(this, remoteObject);
    }
    return new CdpJSHandle(this, remoteObject);
  }
  [disposeSymbol]() {
    this.#context?.[disposeSymbol]();
    this.#emitter.emit("disposed", void 0);
    super[disposeSymbol]();
    this.#emitter.removeAllListeners();
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/IsolatedWorlds.js
var MAIN_WORLD = /* @__PURE__ */ Symbol("mainWorld");
var PUPPETEER_WORLD = /* @__PURE__ */ Symbol("puppeteerWorld");

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/LifecycleWatcher.js
var puppeteerToProtocolLifecycle = /* @__PURE__ */ new Map([
  ["load", "load"],
  ["domcontentloaded", "DOMContentLoaded"],
  ["networkidle0", "networkIdle"],
  ["networkidle2", "networkAlmostIdle"]
]);
var LifecycleWatcher = class {
  #expectedLifecycle;
  #frame;
  #timeout;
  #navigationRequest = null;
  #subscriptions = new DisposableStack();
  #initialLoaderId;
  #terminationDeferred;
  #sameDocumentNavigationDeferred = Deferred.create();
  #lifecycleDeferred = Deferred.create();
  #newDocumentNavigationDeferred = Deferred.create();
  #error = new Error("LifecycleWatcher terminated");
  #hasSameDocumentNavigation;
  #swapped;
  #navigationResponseReceived;
  constructor(networkManager, frame, waitUntil, timeout2, signal) {
    if (Array.isArray(waitUntil)) {
      waitUntil = waitUntil.slice();
    } else if (typeof waitUntil === "string") {
      waitUntil = [waitUntil];
    }
    this.#initialLoaderId = frame._loaderId;
    this.#expectedLifecycle = waitUntil.map((value) => {
      const protocolEvent = puppeteerToProtocolLifecycle.get(value);
      assert(protocolEvent, "Unknown value for options.waitUntil: " + value);
      return protocolEvent;
    });
    signal?.addEventListener("abort", () => {
      if (signal.reason instanceof Error) {
        signal.reason.cause = this.#error;
      }
      this.#terminationDeferred.reject(signal.reason);
    });
    this.#frame = frame;
    this.#timeout = timeout2;
    const frameManagerEmitter = this.#subscriptions.use(new EventEmitter(frame._frameManager));
    frameManagerEmitter.on(FrameManagerEvent.LifecycleEvent, this.#checkLifecycleComplete.bind(this));
    const frameEmitter = this.#subscriptions.use(new EventEmitter(frame));
    frameEmitter.on(FrameEvent.FrameNavigatedWithinDocument, this.#navigatedWithinDocument.bind(this));
    frameEmitter.on(FrameEvent.FrameNavigated, this.#navigated.bind(this));
    frameEmitter.on(FrameEvent.FrameSwapped, this.#frameSwapped.bind(this));
    frameEmitter.on(FrameEvent.FrameSwappedByActivation, this.#frameSwapped.bind(this));
    frameEmitter.on(FrameEvent.FrameDetached, this.#onFrameDetached.bind(this));
    const networkManagerEmitter = this.#subscriptions.use(new EventEmitter(networkManager));
    networkManagerEmitter.on(NetworkManagerEvent.Request, this.#onRequest.bind(this));
    networkManagerEmitter.on(NetworkManagerEvent.Response, this.#onResponse.bind(this));
    networkManagerEmitter.on(NetworkManagerEvent.RequestFailed, this.#onRequestFailed.bind(this));
    this.#terminationDeferred = Deferred.create({
      timeout: this.#timeout,
      message: `Navigation timeout of ${this.#timeout} ms exceeded`
    });
    this.#checkLifecycleComplete();
  }
  #onRequest(request) {
    if (request.frame() !== this.#frame || !request.isNavigationRequest()) {
      return;
    }
    this.#navigationRequest = request;
    this.#navigationResponseReceived?.resolve();
    this.#navigationResponseReceived = Deferred.create();
    if (request.response() !== null) {
      this.#navigationResponseReceived?.resolve();
    }
  }
  #onRequestFailed(request) {
    if (this.#navigationRequest?.id !== request.id) {
      return;
    }
    this.#navigationResponseReceived?.resolve();
  }
  #onResponse(response) {
    if (this.#navigationRequest?.id !== response.request().id) {
      return;
    }
    this.#navigationResponseReceived?.resolve();
  }
  #onFrameDetached(frame) {
    if (this.#frame === frame) {
      this.#error.message = "Navigating frame was detached";
      this.#terminationDeferred.resolve(this.#error);
      return;
    }
    this.#checkLifecycleComplete();
  }
  async navigationResponse() {
    await this.#navigationResponseReceived?.valueOrThrow();
    return this.#navigationRequest ? this.#navigationRequest.response() : null;
  }
  sameDocumentNavigationPromise() {
    return this.#sameDocumentNavigationDeferred.valueOrThrow();
  }
  newDocumentNavigationPromise() {
    return this.#newDocumentNavigationDeferred.valueOrThrow();
  }
  lifecyclePromise() {
    return this.#lifecycleDeferred.valueOrThrow();
  }
  terminationPromise() {
    return this.#terminationDeferred.valueOrThrow();
  }
  #navigatedWithinDocument() {
    this.#hasSameDocumentNavigation = true;
    this.#checkLifecycleComplete();
  }
  #navigated(navigationType) {
    if (navigationType === "BackForwardCacheRestore") {
      return this.#frameSwapped();
    }
    this.#checkLifecycleComplete();
  }
  #frameSwapped() {
    this.#swapped = true;
    this.#checkLifecycleComplete();
  }
  #checkLifecycleComplete() {
    if (!checkLifecycle(this.#frame, this.#expectedLifecycle)) {
      return;
    }
    this.#lifecycleDeferred.resolve();
    if (this.#hasSameDocumentNavigation) {
      this.#sameDocumentNavigationDeferred.resolve(void 0);
    }
    if (this.#swapped || this.#frame._loaderId !== this.#initialLoaderId) {
      this.#newDocumentNavigationDeferred.resolve(void 0);
    }
    function checkLifecycle(frame, expectedLifecycle) {
      for (const event of expectedLifecycle) {
        if (!frame._lifecycleEvents.has(event)) {
          return false;
        }
      }
      for (const child of frame.childFrames()) {
        if (child._hasStartedLoading && !checkLifecycle(child, expectedLifecycle)) {
          return false;
        }
      }
      return true;
    }
  }
  dispose() {
    this.#subscriptions.dispose();
    this.#error.cause = new Error("LifecycleWatcher disposed");
    this.#terminationDeferred.resolve(this.#error);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Frame.js
var __runInitializers2 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate2 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var CdpFrame = (() => {
  let _classSuper = Frame;
  let _instanceExtraInitializers = [];
  let _goto_decorators;
  let _waitForNavigation_decorators;
  let _setContent_decorators;
  let _addPreloadScript_decorators;
  let _addExposedFunctionBinding_decorators;
  let _removeExposedFunctionBinding_decorators;
  let _waitForDevicePrompt_decorators;
  return class CdpFrame extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate2(this, null, _goto_decorators, { kind: "method", name: "goto", static: false, private: false, access: { has: (obj) => "goto" in obj, get: (obj) => obj.goto }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _waitForNavigation_decorators, { kind: "method", name: "waitForNavigation", static: false, private: false, access: { has: (obj) => "waitForNavigation" in obj, get: (obj) => obj.waitForNavigation }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _setContent_decorators, { kind: "method", name: "setContent", static: false, private: false, access: { has: (obj) => "setContent" in obj, get: (obj) => obj.setContent }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _addPreloadScript_decorators, { kind: "method", name: "addPreloadScript", static: false, private: false, access: { has: (obj) => "addPreloadScript" in obj, get: (obj) => obj.addPreloadScript }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _addExposedFunctionBinding_decorators, { kind: "method", name: "addExposedFunctionBinding", static: false, private: false, access: { has: (obj) => "addExposedFunctionBinding" in obj, get: (obj) => obj.addExposedFunctionBinding }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _removeExposedFunctionBinding_decorators, { kind: "method", name: "removeExposedFunctionBinding", static: false, private: false, access: { has: (obj) => "removeExposedFunctionBinding" in obj, get: (obj) => obj.removeExposedFunctionBinding }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _waitForDevicePrompt_decorators, { kind: "method", name: "waitForDevicePrompt", static: false, private: false, access: { has: (obj) => "waitForDevicePrompt" in obj, get: (obj) => obj.waitForDevicePrompt }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #url = (__runInitializers2(this, _instanceExtraInitializers), "");
    #detached = false;
    #client;
    _frameManager;
    _loaderId = "";
    _lifecycleEvents = /* @__PURE__ */ new Set();
    _id;
    _parentId;
    accessibility;
    worlds;
    constructor(frameManager, frameId, parentFrameId, client) {
      super();
      this._frameManager = frameManager;
      this.#url = "";
      this._id = frameId;
      this._parentId = parentFrameId;
      this.#detached = false;
      this.#client = client;
      this._loaderId = "";
      this.worlds = {
        [MAIN_WORLD]: new IsolatedWorld(this, this._frameManager.timeoutSettings),
        [PUPPETEER_WORLD]: new IsolatedWorld(this, this._frameManager.timeoutSettings)
      };
      this.accessibility = new Accessibility(this.worlds[MAIN_WORLD], frameId);
      this.on(FrameEvent.FrameSwappedByActivation, () => {
        this._onLoadingStarted();
        this._onLoadingStopped();
      });
      this.worlds[MAIN_WORLD].emitter.on("consoleapicalled", this.#onMainWorldConsoleApiCalled.bind(this));
      this.worlds[MAIN_WORLD].emitter.on("bindingcalled", this.#onMainWorldBindingCalled.bind(this));
    }
    #onMainWorldConsoleApiCalled(event) {
      this._frameManager.emit(FrameManagerEvent.ConsoleApiCalled, [
        this.worlds[MAIN_WORLD],
        event
      ]);
    }
    #onMainWorldBindingCalled(event) {
      this._frameManager.emit(FrameManagerEvent.BindingCalled, [
        this.worlds[MAIN_WORLD],
        event
      ]);
    }
    /**
     * This is used internally in DevTools.
     *
     * @internal
     */
    _client() {
      return this.#client;
    }
    /**
     * Updates the frame ID with the new ID. This happens when the main frame is
     * replaced by a different frame.
     */
    updateId(id) {
      this._id = id;
    }
    updateClient(client) {
      this.#client = client;
    }
    page() {
      return this._frameManager.page();
    }
    async goto(url, options = {}) {
      const { referer = this._frameManager.networkManager.extraHTTPHeaders()["referer"], referrerPolicy = this._frameManager.networkManager.extraHTTPHeaders()["referer-policy"], waitUntil = ["load"], timeout: timeout2 = this._frameManager.timeoutSettings.navigationTimeout() } = options;
      let ensureNewDocumentNavigation = false;
      const watcher = new LifecycleWatcher(this._frameManager.networkManager, this, waitUntil, timeout2);
      let error = await Deferred.race([
        navigate(this.#client, url, referer, referrerPolicy ? referrerPolicyToProtocol(referrerPolicy) : void 0, this._id),
        watcher.terminationPromise()
      ]);
      if (!error) {
        error = await Deferred.race([
          watcher.terminationPromise(),
          ensureNewDocumentNavigation ? watcher.newDocumentNavigationPromise() : watcher.sameDocumentNavigationPromise()
        ]);
      }
      try {
        if (error) {
          throw error;
        }
        return await watcher.navigationResponse();
      } finally {
        watcher.dispose();
      }
      async function navigate(client, url2, referrer, referrerPolicy2, frameId) {
        try {
          const response = await client.send("Page.navigate", {
            url: url2,
            referrer,
            frameId,
            referrerPolicy: referrerPolicy2
          });
          ensureNewDocumentNavigation = !!response.loaderId;
          if (response.errorText === "net::ERR_HTTP_RESPONSE_CODE_FAILURE") {
            return null;
          }
          return response.errorText ? new Error(`${response.errorText} at ${url2}`) : null;
        } catch (error2) {
          if (isErrorLike(error2)) {
            return error2;
          }
          throw error2;
        }
      }
    }
    async waitForNavigation(options = {}) {
      const { waitUntil = ["load"], timeout: timeout2 = this._frameManager.timeoutSettings.navigationTimeout(), signal } = options;
      const watcher = new LifecycleWatcher(this._frameManager.networkManager, this, waitUntil, timeout2, signal);
      const error = await Deferred.race([
        watcher.terminationPromise(),
        ...options.ignoreSameDocumentNavigation ? [] : [watcher.sameDocumentNavigationPromise()],
        watcher.newDocumentNavigationPromise()
      ]);
      try {
        if (error) {
          throw error;
        }
        const result = await Deferred.race([watcher.terminationPromise(), watcher.navigationResponse()]);
        if (result instanceof Error) {
          throw error;
        }
        return result || null;
      } finally {
        watcher.dispose();
      }
    }
    get client() {
      return this.#client;
    }
    mainRealm() {
      return this.worlds[MAIN_WORLD];
    }
    isolatedRealm() {
      return this.worlds[PUPPETEER_WORLD];
    }
    async setContent(html, options = {}) {
      const { waitUntil = ["load"], timeout: timeout2 = this._frameManager.timeoutSettings.navigationTimeout() } = options;
      await this.setFrameContent(html);
      const watcher = new LifecycleWatcher(this._frameManager.networkManager, this, waitUntil, timeout2);
      const error = await Deferred.race([
        watcher.terminationPromise(),
        watcher.lifecyclePromise()
      ]);
      watcher.dispose();
      if (error) {
        throw error;
      }
    }
    url() {
      return this.#url;
    }
    parentFrame() {
      return this._frameManager._frameTree.parentFrame(this._id) || null;
    }
    childFrames() {
      return this._frameManager._frameTree.childFrames(this._id);
    }
    #deviceRequestPromptManager() {
      return this._frameManager._deviceRequestPromptManager(this.#client);
    }
    async addPreloadScript(preloadScript) {
      const parentFrame = this.parentFrame();
      if (parentFrame && this.#client === parentFrame.client) {
        return;
      }
      if (preloadScript.getIdForFrame(this)) {
        return;
      }
      const { identifier } = await this.#client.send("Page.addScriptToEvaluateOnNewDocument", {
        source: preloadScript.source
      });
      preloadScript.setIdForFrame(this, identifier);
    }
    async addExposedFunctionBinding(binding) {
      if (this !== this._frameManager.mainFrame() && !this._hasStartedLoading) {
        return;
      }
      await Promise.all([
        this.#client.send("Runtime.addBinding", {
          name: CDP_BINDING_PREFIX + binding.name
        }),
        this.evaluate(binding.initSource).catch(debugError)
      ]);
    }
    async removeExposedFunctionBinding(binding) {
      if (this !== this._frameManager.mainFrame() && !this._hasStartedLoading) {
        return;
      }
      await Promise.all([
        this.#client.send("Runtime.removeBinding", {
          name: CDP_BINDING_PREFIX + binding.name
        }),
        this.evaluate((name) => {
          globalThis[name] = void 0;
        }, binding.name).catch(debugError)
      ]);
    }
    async waitForDevicePrompt(options = {}) {
      return await this.#deviceRequestPromptManager().waitForDevicePrompt(options);
    }
    _navigated(framePayload) {
      this._name = framePayload.name;
      this.#url = `${framePayload.url}${framePayload.urlFragment || ""}`;
    }
    _navigatedWithinDocument(url) {
      this.#url = url;
    }
    _onLifecycleEvent(loaderId, name) {
      if (name === "init") {
        this._loaderId = loaderId;
        this._lifecycleEvents.clear();
      }
      this._lifecycleEvents.add(name);
    }
    _onLoadingStopped() {
      this._lifecycleEvents.add("DOMContentLoaded");
      this._lifecycleEvents.add("load");
    }
    _onLoadingStarted() {
      this._hasStartedLoading = true;
    }
    get detached() {
      return this.#detached;
    }
    [(_goto_decorators = [throwIfDetached], _waitForNavigation_decorators = [throwIfDetached], _setContent_decorators = [throwIfDetached], _addPreloadScript_decorators = [throwIfDetached], _addExposedFunctionBinding_decorators = [throwIfDetached], _removeExposedFunctionBinding_decorators = [throwIfDetached], _waitForDevicePrompt_decorators = [throwIfDetached], disposeSymbol)]() {
      if (this.#detached) {
        return;
      }
      this.#detached = true;
      this.worlds[MAIN_WORLD][disposeSymbol]();
      this.worlds[PUPPETEER_WORLD][disposeSymbol]();
    }
    exposeFunction() {
      throw new UnsupportedOperation();
    }
    async frameElement() {
      const parent = this.parentFrame();
      if (!parent) {
        return null;
      }
      const { backendNodeId } = await parent.client.send("DOM.getFrameOwner", {
        frameId: this._id
      });
      return await parent.mainRealm().adoptBackendNode(backendNodeId);
    }
  };
})();
function referrerPolicyToProtocol(referrerPolicy) {
  return referrerPolicy.replaceAll(/-./g, (match) => {
    return match[1].toUpperCase();
  });
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/FrameTree.js
var FrameTree = class {
  #frames = /* @__PURE__ */ new Map();
  // frameID -> parentFrameID
  #parentIds = /* @__PURE__ */ new Map();
  // frameID -> childFrameIDs
  #childIds = /* @__PURE__ */ new Map();
  #mainFrame;
  #isMainFrameStale = false;
  #waitRequests = /* @__PURE__ */ new Map();
  getMainFrame() {
    return this.#mainFrame;
  }
  getById(frameId) {
    return this.#frames.get(frameId);
  }
  /**
   * Returns a promise that is resolved once the frame with
   * the given ID is added to the tree.
   */
  waitForFrame(frameId) {
    const frame = this.getById(frameId);
    if (frame) {
      return Promise.resolve(frame);
    }
    const deferred = Deferred.create();
    const callbacks = this.#waitRequests.get(frameId) || /* @__PURE__ */ new Set();
    callbacks.add(deferred);
    return deferred.valueOrThrow();
  }
  frames() {
    return Array.from(this.#frames.values());
  }
  addFrame(frame) {
    this.#frames.set(frame._id, frame);
    if (frame._parentId) {
      this.#parentIds.set(frame._id, frame._parentId);
      if (!this.#childIds.has(frame._parentId)) {
        this.#childIds.set(frame._parentId, /* @__PURE__ */ new Set());
      }
      this.#childIds.get(frame._parentId).add(frame._id);
    } else if (!this.#mainFrame || this.#isMainFrameStale) {
      this.#mainFrame = frame;
      this.#isMainFrameStale = false;
    }
    this.#waitRequests.get(frame._id)?.forEach((request) => {
      return request.resolve(frame);
    });
  }
  removeFrame(frame) {
    this.#frames.delete(frame._id);
    this.#parentIds.delete(frame._id);
    if (frame._parentId) {
      this.#childIds.get(frame._parentId)?.delete(frame._id);
    } else {
      this.#isMainFrameStale = true;
    }
  }
  childFrames(frameId) {
    const childIds = this.#childIds.get(frameId);
    if (!childIds) {
      return [];
    }
    return Array.from(childIds).map((id) => {
      return this.getById(id);
    }).filter((frame) => {
      return frame !== void 0;
    });
  }
  parentFrame(frameId) {
    const parentId = this.#parentIds.get(frameId);
    return parentId ? this.getById(parentId) : void 0;
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/HTTPRequest.js
var CdpHTTPRequest = class extends HTTPRequest {
  id;
  #client;
  #isNavigationRequest;
  #url;
  #resourceType;
  #method;
  #hasPostData = false;
  #postData;
  #headers = {};
  #frame;
  #initiator;
  get client() {
    return this.#client;
  }
  set client(newClient) {
    this.#client = newClient;
  }
  constructor(client, frame, interceptionId, allowInterception, data, redirectChain) {
    super();
    this.#client = client;
    this.id = data.requestId;
    this.#isNavigationRequest = data.requestId === data.loaderId && data.type === "Document";
    this._interceptionId = interceptionId;
    this.#url = data.request.url + (data.request.urlFragment ?? "");
    this.#resourceType = (data.type || "other").toLowerCase();
    this.#method = data.request.method;
    if (data.request.postDataEntries && data.request.postDataEntries.length > 0) {
      this.#postData = new TextDecoder().decode(mergeUint8Arrays(data.request.postDataEntries.map((entry) => {
        return entry.bytes ? stringToTypedArray(entry.bytes, true) : null;
      }).filter((entry) => {
        return entry !== null;
      })));
    } else {
      this.#postData = data.request.postData;
    }
    this.#hasPostData = data.request.hasPostData ?? false;
    this.#frame = frame;
    this._redirectChain = redirectChain;
    this.#initiator = data.initiator;
    this.interception.enabled = allowInterception;
    this.updateHeaders(data.request.headers);
  }
  updateHeaders(headers) {
    for (const [key, value] of Object.entries(headers)) {
      this.#headers[key.toLowerCase()] = value;
    }
  }
  url() {
    return this.#url;
  }
  resourceType() {
    return this.#resourceType;
  }
  method() {
    return this.#method;
  }
  postData() {
    return this.#postData;
  }
  hasPostData() {
    return this.#hasPostData;
  }
  async fetchPostData() {
    try {
      const result = await this.#client.send("Network.getRequestPostData", {
        requestId: this.id
      });
      return result.postData;
    } catch (err) {
      debugError(err);
      return;
    }
  }
  headers() {
    return structuredClone(this.#headers);
  }
  response() {
    return this._response;
  }
  frame() {
    return this.#frame;
  }
  isNavigationRequest() {
    return this.#isNavigationRequest;
  }
  initiator() {
    return this.#initiator;
  }
  redirectChain() {
    return this._redirectChain.slice();
  }
  failure() {
    if (!this._failureText) {
      return null;
    }
    return {
      errorText: this._failureText
    };
  }
  canBeIntercepted() {
    return !this.url().startsWith("data:") && !this._fromMemoryCache;
  }
  /**
   * @internal
   */
  async _continue(overrides = {}) {
    const { url, method, postData, headers } = overrides;
    this.interception.handled = true;
    const postDataBinaryBase64 = postData ? stringToBase64(postData) : void 0;
    if (this._interceptionId === void 0) {
      throw new Error("HTTPRequest is missing _interceptionId needed for Fetch.continueRequest");
    }
    await this.#client.send("Fetch.continueRequest", {
      requestId: this._interceptionId,
      url,
      method,
      postData: postDataBinaryBase64,
      headers: headers ? headersArray(headers) : void 0
    }).catch((error) => {
      this.interception.handled = false;
      return handleError(error);
    });
  }
  async _respond(response) {
    this.interception.handled = true;
    let parsedBody;
    if (response.body) {
      parsedBody = HTTPRequest.getResponse(response.body);
    }
    const responseHeaders = {};
    if (response.headers) {
      for (const header of Object.keys(response.headers)) {
        const value = response.headers[header];
        responseHeaders[header.toLowerCase()] = Array.isArray(value) ? value.map((item) => {
          return String(item);
        }) : String(value);
      }
    }
    if (response.contentType) {
      responseHeaders["content-type"] = response.contentType;
    }
    if (parsedBody?.contentLength && !("content-length" in responseHeaders)) {
      responseHeaders["content-length"] = String(parsedBody.contentLength);
    }
    const status = response.status || 200;
    if (this._interceptionId === void 0) {
      throw new Error("HTTPRequest is missing _interceptionId needed for Fetch.fulfillRequest");
    }
    await this.#client.send("Fetch.fulfillRequest", {
      requestId: this._interceptionId,
      responseCode: status,
      responsePhrase: STATUS_TEXTS[status],
      responseHeaders: headersArray(responseHeaders),
      body: parsedBody?.base64
    }).catch((error) => {
      this.interception.handled = false;
      return handleError(error);
    });
  }
  async _abort(errorReason) {
    this.interception.handled = true;
    if (this._interceptionId === void 0) {
      throw new Error("HTTPRequest is missing _interceptionId needed for Fetch.failRequest");
    }
    await this.#client.send("Fetch.failRequest", {
      requestId: this._interceptionId,
      errorReason: errorReason || "Failed"
    }).catch(handleError);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/HTTPResponse.js
var CdpHTTPResponse = class extends HTTPResponse {
  #request;
  #contentPromise = null;
  #bodyLoadedDeferred = Deferred.create();
  #remoteAddress;
  #status;
  #statusText;
  #fromDiskCache;
  #fromServiceWorker;
  #headers = {};
  #securityDetails;
  #timing;
  constructor(request, responsePayload, extraInfo) {
    super();
    this.#request = request;
    this.#remoteAddress = {
      ip: responsePayload.remoteIPAddress,
      port: responsePayload.remotePort
    };
    this.#statusText = this.#parseStatusTextFromExtraInfo(extraInfo) || responsePayload.statusText;
    this.#fromDiskCache = !!responsePayload.fromDiskCache;
    this.#fromServiceWorker = !!responsePayload.fromServiceWorker;
    this.#status = extraInfo ? extraInfo.statusCode : responsePayload.status;
    const headers = extraInfo ? extraInfo.headers : responsePayload.headers;
    for (const [key, value] of Object.entries(headers)) {
      this.#headers[key.toLowerCase()] = value;
    }
    this.#securityDetails = responsePayload.securityDetails ? new SecurityDetails(responsePayload.securityDetails) : null;
    this.#timing = responsePayload.timing || null;
  }
  #parseStatusTextFromExtraInfo(extraInfo) {
    if (!extraInfo || !extraInfo.headersText) {
      return;
    }
    const firstLine = extraInfo.headersText.split("\r", 1)[0];
    if (!firstLine || firstLine.length > 1e3) {
      return;
    }
    const match = firstLine.match(/[^ ]* [^ ]* (.*)/);
    if (!match) {
      return;
    }
    const statusText = match[1];
    if (!statusText) {
      return;
    }
    return statusText;
  }
  _resolveBody(err) {
    if (err) {
      return this.#bodyLoadedDeferred.reject(err);
    }
    return this.#bodyLoadedDeferred.resolve();
  }
  remoteAddress() {
    return this.#remoteAddress;
  }
  url() {
    return this.#request.url();
  }
  status() {
    return this.#status;
  }
  statusText() {
    return this.#statusText;
  }
  headers() {
    return this.#headers;
  }
  securityDetails() {
    return this.#securityDetails;
  }
  timing() {
    return this.#timing;
  }
  content() {
    if (!this.#contentPromise) {
      this.#contentPromise = this.#bodyLoadedDeferred.valueOrThrow().then(async () => {
        try {
          const response = await this.#request.client.send("Network.getResponseBody", {
            requestId: this.#request.id
          });
          return stringToTypedArray(response.body, response.base64Encoded);
        } catch (error) {
          if (error instanceof ProtocolError && error.originalMessage === "No resource with given identifier found") {
            throw new ProtocolError("Could not load response body for this request. This might happen if the request is a preflight request.");
          }
          throw error;
        }
      });
    }
    return this.#contentPromise;
  }
  request() {
    return this.#request;
  }
  fromCache() {
    return this.#fromDiskCache || this.#request._fromMemoryCache;
  }
  fromServiceWorker() {
    return this.#fromServiceWorker;
  }
  frame() {
    return this.#request.frame();
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/NetworkEventManager.js
var NetworkEventManager = class {
  /**
   * There are four possible orders of events:
   * A. `_onRequestWillBeSent`
   * B. `_onRequestWillBeSent`, `_onRequestPaused`
   * C. `_onRequestPaused`, `_onRequestWillBeSent`
   * D. `_onRequestPaused`, `_onRequestWillBeSent`, `_onRequestPaused`,
   * `_onRequestWillBeSent`, `_onRequestPaused`, `_onRequestPaused`
   * (see crbug.com/1196004)
   *
   * For `_onRequest` we need the event from `_onRequestWillBeSent` and
   * optionally the `interceptionId` from `_onRequestPaused`.
   *
   * If request interception is disabled, call `_onRequest` once per call to
   * `_onRequestWillBeSent`.
   * If request interception is enabled, call `_onRequest` once per call to
   * `_onRequestPaused` (once per `interceptionId`).
   *
   * Events are stored to allow for subsequent events to call `_onRequest`.
   *
   * Note that (chains of) redirect requests have the same `requestId` (!) as
   * the original request. We have to anticipate series of events like these:
   * A. `_onRequestWillBeSent`,
   * `_onRequestWillBeSent`, ...
   * B. `_onRequestWillBeSent`, `_onRequestPaused`,
   * `_onRequestWillBeSent`, `_onRequestPaused`, ...
   * C. `_onRequestWillBeSent`, `_onRequestPaused`,
   * `_onRequestPaused`, `_onRequestWillBeSent`, ...
   * D. `_onRequestPaused`, `_onRequestWillBeSent`,
   * `_onRequestPaused`, `_onRequestWillBeSent`, `_onRequestPaused`,
   * `_onRequestWillBeSent`, `_onRequestPaused`, `_onRequestPaused`, ...
   * (see crbug.com/1196004)
   */
  #requestWillBeSentMap = /* @__PURE__ */ new Map();
  #requestPausedMap = /* @__PURE__ */ new Map();
  #httpRequestsMap = /* @__PURE__ */ new Map();
  #requestWillBeSentExtraInfoMap = /* @__PURE__ */ new Map();
  /*
   * The below maps are used to reconcile Network.responseReceivedExtraInfo
   * events with their corresponding request. Each response and redirect
   * response gets an ExtraInfo event, and we don't know which will come first.
   * This means that we have to store a Response or an ExtraInfo for each
   * response, and emit the event when we get both of them. In addition, to
   * handle redirects, we have to make them Arrays to represent the chain of
   * events.
   */
  #responseReceivedExtraInfoMap = /* @__PURE__ */ new Map();
  #queuedRedirectInfoMap = /* @__PURE__ */ new Map();
  #queuedEventGroupMap = /* @__PURE__ */ new Map();
  forget(networkRequestId) {
    this.#requestWillBeSentMap.delete(networkRequestId);
    this.#requestPausedMap.delete(networkRequestId);
    this.#requestWillBeSentExtraInfoMap.delete(networkRequestId);
    this.#queuedEventGroupMap.delete(networkRequestId);
    this.#queuedRedirectInfoMap.delete(networkRequestId);
    this.#responseReceivedExtraInfoMap.delete(networkRequestId);
  }
  requestExtraInfo(networkRequestId) {
    if (!this.#requestWillBeSentExtraInfoMap.has(networkRequestId)) {
      this.#requestWillBeSentExtraInfoMap.set(networkRequestId, []);
    }
    return this.#requestWillBeSentExtraInfoMap.get(networkRequestId);
  }
  responseExtraInfo(networkRequestId) {
    if (!this.#responseReceivedExtraInfoMap.has(networkRequestId)) {
      this.#responseReceivedExtraInfoMap.set(networkRequestId, []);
    }
    return this.#responseReceivedExtraInfoMap.get(networkRequestId);
  }
  queuedRedirectInfo(fetchRequestId) {
    if (!this.#queuedRedirectInfoMap.has(fetchRequestId)) {
      this.#queuedRedirectInfoMap.set(fetchRequestId, []);
    }
    return this.#queuedRedirectInfoMap.get(fetchRequestId);
  }
  queueRedirectInfo(fetchRequestId, redirectInfo) {
    this.queuedRedirectInfo(fetchRequestId).push(redirectInfo);
  }
  takeQueuedRedirectInfo(fetchRequestId) {
    return this.queuedRedirectInfo(fetchRequestId).shift();
  }
  inFlightRequestsCount() {
    let inFlightRequestCounter = 0;
    for (const request of this.#httpRequestsMap.values()) {
      if (!request.response()) {
        inFlightRequestCounter++;
      }
    }
    return inFlightRequestCounter;
  }
  storeRequestWillBeSent(networkRequestId, event) {
    this.#requestWillBeSentMap.set(networkRequestId, event);
  }
  getRequestWillBeSent(networkRequestId) {
    return this.#requestWillBeSentMap.get(networkRequestId);
  }
  forgetRequestWillBeSent(networkRequestId) {
    this.#requestWillBeSentMap.delete(networkRequestId);
  }
  getRequestPaused(networkRequestId) {
    return this.#requestPausedMap.get(networkRequestId);
  }
  forgetRequestPaused(networkRequestId) {
    this.#requestPausedMap.delete(networkRequestId);
  }
  storeRequestPaused(networkRequestId, event) {
    this.#requestPausedMap.set(networkRequestId, event);
  }
  getRequest(networkRequestId) {
    return this.#httpRequestsMap.get(networkRequestId);
  }
  storeRequest(networkRequestId, request) {
    this.#httpRequestsMap.set(networkRequestId, request);
  }
  forgetRequest(networkRequestId) {
    this.#httpRequestsMap.delete(networkRequestId);
  }
  getQueuedEventGroup(networkRequestId) {
    return this.#queuedEventGroupMap.get(networkRequestId);
  }
  queueEventGroup(networkRequestId, event) {
    this.#queuedEventGroupMap.set(networkRequestId, event);
  }
  forgetQueuedEventGroup(networkRequestId) {
    this.#queuedEventGroupMap.delete(networkRequestId);
  }
  printState() {
    function replacer(_key, value) {
      if (value instanceof Map) {
        return {
          dataType: "Map",
          value: Array.from(value.entries())
          // or with spread: value: [...value]
        };
      } else if (value instanceof CdpHTTPRequest) {
        return {
          dataType: "CdpHTTPRequest",
          value: `${value.id}: ${value.url()}`
        };
      }
      {
        return value;
      }
    }
    console.log("httpRequestsMap", JSON.stringify(this.#httpRequestsMap, replacer, 2));
    console.log("requestWillBeSentMap", JSON.stringify(this.#requestWillBeSentMap, replacer, 2));
    console.log("requestWillBeSentMap", JSON.stringify(this.#responseReceivedExtraInfoMap, replacer, 2));
    console.log("requestWillBeSentMap", JSON.stringify(this.#requestPausedMap, replacer, 2));
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/NetworkManager.js
var NetworkManager = class extends EventEmitter {
  #frameManager;
  #networkEventManager = new NetworkEventManager();
  #extraHTTPHeaders;
  #credentials = null;
  #attemptedAuthentications = /* @__PURE__ */ new Set();
  #userRequestInterceptionEnabled = false;
  #protocolRequestInterceptionEnabled;
  #userCacheDisabled;
  #emulatedNetworkConditions;
  #userAgent;
  #userAgentMetadata;
  #platform;
  #handlers = [
    ["Fetch.requestPaused", this.#onRequestPaused],
    ["Fetch.authRequired", this.#onAuthRequired],
    ["Network.requestWillBeSent", this.#onRequestWillBeSent],
    ["Network.requestWillBeSentExtraInfo", this.#onRequestWillBeSentExtraInfo],
    ["Network.requestServedFromCache", this.#onRequestServedFromCache],
    ["Network.responseReceived", this.#onResponseReceived],
    ["Network.loadingFinished", this.#onLoadingFinished],
    ["Network.loadingFailed", this.#onLoadingFailed],
    ["Network.responseReceivedExtraInfo", this.#onResponseReceivedExtraInfo],
    [CDPSessionEvent.Disconnected, this.#removeClient]
  ];
  #clients = /* @__PURE__ */ new Map();
  #networkEnabled = true;
  constructor(frameManager, networkEnabled) {
    super();
    this.#frameManager = frameManager;
    this.#networkEnabled = networkEnabled ?? true;
  }
  #canIgnoreError(error) {
    return isErrorLike(error) && (isTargetClosedError(error) || error.message.includes("Not supported") || error.message.includes("wasn't found"));
  }
  async addClient(client) {
    if (!this.#networkEnabled || this.#clients.has(client)) {
      return;
    }
    const subscriptions = new DisposableStack();
    this.#clients.set(client, subscriptions);
    const clientEmitter = subscriptions.use(new EventEmitter(client));
    for (const [event, handler] of this.#handlers) {
      clientEmitter.on(event, (arg) => {
        return handler.bind(this)(client, arg);
      });
    }
    try {
      await Promise.all([
        client.send("Network.enable"),
        this.#applyExtraHTTPHeaders(client),
        this.#applyNetworkConditions(client),
        this.#applyProtocolCacheDisabled(client),
        this.#applyProtocolRequestInterception(client),
        this.#applyUserAgent(client)
      ]);
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  async #removeClient(client) {
    this.#clients.get(client)?.dispose();
    this.#clients.delete(client);
  }
  async authenticate(credentials) {
    this.#credentials = credentials;
    const enabled = this.#userRequestInterceptionEnabled || !!this.#credentials;
    if (enabled === this.#protocolRequestInterceptionEnabled) {
      return;
    }
    this.#protocolRequestInterceptionEnabled = enabled;
    await this.#applyToAllClients(this.#applyProtocolRequestInterception.bind(this));
  }
  async setExtraHTTPHeaders(headers) {
    const extraHTTPHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      assert(isString(value), `Expected value of header "${key}" to be String, but "${typeof value}" is found.`);
      extraHTTPHeaders[key.toLowerCase()] = value;
    }
    this.#extraHTTPHeaders = extraHTTPHeaders;
    await this.#applyToAllClients(this.#applyExtraHTTPHeaders.bind(this));
  }
  async #applyExtraHTTPHeaders(client) {
    if (this.#extraHTTPHeaders === void 0) {
      return;
    }
    try {
      await client.send("Network.setExtraHTTPHeaders", {
        headers: this.#extraHTTPHeaders
      });
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  extraHTTPHeaders() {
    return Object.assign({}, this.#extraHTTPHeaders);
  }
  inFlightRequestsCount() {
    return this.#networkEventManager.inFlightRequestsCount();
  }
  async setOfflineMode(value) {
    if (!this.#emulatedNetworkConditions) {
      this.#emulatedNetworkConditions = {
        offline: false,
        upload: -1,
        download: -1,
        latency: 0
      };
    }
    this.#emulatedNetworkConditions.offline = value;
    await this.#applyToAllClients(this.#applyNetworkConditions.bind(this));
  }
  async emulateNetworkConditions(networkConditions) {
    if (!this.#emulatedNetworkConditions) {
      this.#emulatedNetworkConditions = {
        offline: networkConditions?.offline ?? false,
        upload: -1,
        download: -1,
        latency: 0
      };
    }
    this.#emulatedNetworkConditions.upload = networkConditions ? networkConditions.upload : -1;
    this.#emulatedNetworkConditions.download = networkConditions ? networkConditions.download : -1;
    this.#emulatedNetworkConditions.latency = networkConditions ? networkConditions.latency : 0;
    this.#emulatedNetworkConditions.offline = networkConditions?.offline ?? false;
    await this.#applyToAllClients(this.#applyNetworkConditions.bind(this));
  }
  async #applyToAllClients(fn) {
    await Promise.all(Array.from(this.#clients.keys()).map((client) => {
      return fn(client);
    }));
  }
  async #applyNetworkConditions(client) {
    if (this.#emulatedNetworkConditions === void 0) {
      return;
    }
    try {
      await client.send("Network.emulateNetworkConditions", {
        offline: this.#emulatedNetworkConditions.offline,
        latency: this.#emulatedNetworkConditions.latency,
        uploadThroughput: this.#emulatedNetworkConditions.upload,
        downloadThroughput: this.#emulatedNetworkConditions.download
      });
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  async setUserAgent(userAgent, userAgentMetadata, platform) {
    this.#userAgent = userAgent;
    this.#userAgentMetadata = userAgentMetadata;
    this.#platform = platform;
    await this.#applyToAllClients(this.#applyUserAgent.bind(this));
  }
  async #applyUserAgent(client) {
    if (this.#userAgent === void 0) {
      return;
    }
    try {
      await client.send("Network.setUserAgentOverride", {
        userAgent: this.#userAgent,
        userAgentMetadata: this.#userAgentMetadata,
        platform: this.#platform
      });
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  async setCacheEnabled(enabled) {
    this.#userCacheDisabled = !enabled;
    await this.#applyToAllClients(this.#applyProtocolCacheDisabled.bind(this));
  }
  async setRequestInterception(value) {
    this.#userRequestInterceptionEnabled = value;
    const enabled = this.#userRequestInterceptionEnabled || !!this.#credentials;
    if (enabled === this.#protocolRequestInterceptionEnabled) {
      return;
    }
    this.#protocolRequestInterceptionEnabled = enabled;
    await this.#applyToAllClients(this.#applyProtocolRequestInterception.bind(this));
  }
  async #applyProtocolRequestInterception(client) {
    if (this.#protocolRequestInterceptionEnabled === void 0) {
      return;
    }
    if (this.#userCacheDisabled === void 0) {
      this.#userCacheDisabled = false;
    }
    try {
      if (this.#protocolRequestInterceptionEnabled) {
        await Promise.all([
          this.#applyProtocolCacheDisabled(client),
          client.send("Fetch.enable", {
            handleAuthRequests: true,
            patterns: [{ urlPattern: "*" }]
          })
        ]);
      } else {
        await Promise.all([
          this.#applyProtocolCacheDisabled(client),
          client.send("Fetch.disable")
        ]);
      }
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  async #applyProtocolCacheDisabled(client) {
    if (this.#userCacheDisabled === void 0) {
      return;
    }
    try {
      await client.send("Network.setCacheDisabled", {
        cacheDisabled: this.#userCacheDisabled
      });
    } catch (error) {
      if (this.#canIgnoreError(error)) {
        return;
      }
      throw error;
    }
  }
  #onRequestWillBeSent(client, event) {
    if (this.#userRequestInterceptionEnabled && !event.request.url.startsWith("data:")) {
      const { requestId: networkRequestId } = event;
      this.#networkEventManager.storeRequestWillBeSent(networkRequestId, event);
      const requestPausedEvent = this.#networkEventManager.getRequestPaused(networkRequestId);
      if (requestPausedEvent) {
        const { requestId: fetchRequestId } = requestPausedEvent;
        this.#patchRequestEventHeaders(event, requestPausedEvent);
        this.#onRequest(client, event, fetchRequestId);
        this.#networkEventManager.forgetRequestPaused(networkRequestId);
      }
      return;
    }
    this.#onRequest(client, event, void 0);
  }
  #onAuthRequired(client, event) {
    let response = "Default";
    if (this.#attemptedAuthentications.has(event.requestId)) {
      response = "CancelAuth";
    } else if (this.#credentials) {
      response = "ProvideCredentials";
      this.#attemptedAuthentications.add(event.requestId);
    }
    const { username, password } = this.#credentials || {
      username: void 0,
      password: void 0
    };
    client.send("Fetch.continueWithAuth", {
      requestId: event.requestId,
      authChallengeResponse: { response, username, password }
    }).catch(debugError);
  }
  /**
   * CDP may send a Fetch.requestPaused without or before a
   * Network.requestWillBeSent
   *
   * CDP may send multiple Fetch.requestPaused
   * for the same Network.requestWillBeSent.
   */
  #onRequestPaused(client, event) {
    if (!this.#userRequestInterceptionEnabled && this.#protocolRequestInterceptionEnabled) {
      client.send("Fetch.continueRequest", {
        requestId: event.requestId
      }).catch(debugError);
    }
    const { networkId: networkRequestId, requestId: fetchRequestId } = event;
    if (!networkRequestId) {
      this.#onRequestWithoutNetworkInstrumentation(client, event);
      return;
    }
    const requestWillBeSentEvent = (() => {
      const requestWillBeSentEvent2 = this.#networkEventManager.getRequestWillBeSent(networkRequestId);
      if (requestWillBeSentEvent2 && (requestWillBeSentEvent2.request.url !== event.request.url || requestWillBeSentEvent2.request.method !== event.request.method)) {
        this.#networkEventManager.forgetRequestWillBeSent(networkRequestId);
        return;
      }
      return requestWillBeSentEvent2;
    })();
    if (requestWillBeSentEvent) {
      this.#patchRequestEventHeaders(requestWillBeSentEvent, event);
      this.#onRequest(client, requestWillBeSentEvent, fetchRequestId);
    } else {
      this.#networkEventManager.storeRequestPaused(networkRequestId, event);
    }
  }
  #patchRequestEventHeaders(requestWillBeSentEvent, requestPausedEvent) {
    requestWillBeSentEvent.request.headers = {
      ...requestWillBeSentEvent.request.headers,
      // includes extra headers, like: Accept, Origin
      ...requestPausedEvent.request.headers
    };
  }
  #onRequestWithoutNetworkInstrumentation(client, event) {
    const frame = event.frameId ? this.#frameManager.frame(event.frameId) : null;
    const request = new CdpHTTPRequest(client, frame, event.requestId, this.#userRequestInterceptionEnabled, event, []);
    this.emit(NetworkManagerEvent.Request, request);
    void request.finalizeInterceptions();
  }
  #onRequest(client, event, fetchRequestId, fromMemoryCache = false) {
    let redirectChain = [];
    if (event.redirectResponse) {
      let redirectResponseExtraInfo = null;
      if (event.redirectHasExtraInfo) {
        redirectResponseExtraInfo = this.#networkEventManager.responseExtraInfo(event.requestId).shift();
        if (!redirectResponseExtraInfo) {
          this.#networkEventManager.queueRedirectInfo(event.requestId, {
            event,
            fetchRequestId
          });
          return;
        }
      }
      const request2 = this.#networkEventManager.getRequest(event.requestId);
      if (request2) {
        this.#handleRequestRedirect(client, request2, event.redirectResponse, redirectResponseExtraInfo);
        redirectChain = request2._redirectChain;
        const extraInfo2 = this.#networkEventManager.requestExtraInfo(event.requestId).shift();
        if (extraInfo2) {
          request2.updateHeaders(extraInfo2.headers);
        }
      }
    }
    const frame = event.frameId ? this.#frameManager.frame(event.frameId) : null;
    const request = new CdpHTTPRequest(client, frame, fetchRequestId, this.#userRequestInterceptionEnabled, event, redirectChain);
    const extraInfo = this.#networkEventManager.requestExtraInfo(event.requestId).shift();
    if (extraInfo) {
      request.updateHeaders(extraInfo.headers);
    }
    request._fromMemoryCache = fromMemoryCache;
    this.#networkEventManager.storeRequest(event.requestId, request);
    this.emit(NetworkManagerEvent.Request, request);
    void request.finalizeInterceptions();
  }
  #onRequestWillBeSentExtraInfo(_client, event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (request) {
      request.updateHeaders(event.headers);
    } else {
      this.#networkEventManager.requestExtraInfo(event.requestId).push(event);
    }
  }
  #onRequestServedFromCache(client, event) {
    const requestWillBeSentEvent = this.#networkEventManager.getRequestWillBeSent(event.requestId);
    let request = this.#networkEventManager.getRequest(event.requestId);
    if (request) {
      request._fromMemoryCache = true;
    }
    if (!request && requestWillBeSentEvent) {
      this.#onRequest(client, requestWillBeSentEvent, void 0, true);
      request = this.#networkEventManager.getRequest(event.requestId);
    }
    if (!request) {
      debugError(new Error(`Request ${event.requestId} was served from cache but we could not find the corresponding request object`));
      return;
    }
    this.emit(NetworkManagerEvent.RequestServedFromCache, request);
  }
  #handleRequestRedirect(_client, request, responsePayload, extraInfo) {
    const response = new CdpHTTPResponse(request, responsePayload, extraInfo);
    request._response = response;
    request._redirectChain.push(request);
    response._resolveBody(new Error("Response body is unavailable for redirect responses"));
    this.#forgetRequest(request, false);
    this.emit(NetworkManagerEvent.Response, response);
    this.emit(NetworkManagerEvent.RequestFinished, request);
  }
  #emitResponseEvent(_client, responseReceived, extraInfo) {
    const request = this.#networkEventManager.getRequest(responseReceived.requestId);
    if (!request) {
      return;
    }
    const extraInfos = this.#networkEventManager.responseExtraInfo(responseReceived.requestId);
    if (extraInfos.length) {
      debugError(new Error("Unexpected extraInfo events for request " + responseReceived.requestId));
    }
    if (responseReceived.response.fromDiskCache) {
      extraInfo = null;
    }
    const response = new CdpHTTPResponse(request, responseReceived.response, extraInfo);
    request._response = response;
    this.emit(NetworkManagerEvent.Response, response);
  }
  #onResponseReceived(client, event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    let extraInfo = null;
    if (request && !request._fromMemoryCache && event.hasExtraInfo) {
      extraInfo = this.#networkEventManager.responseExtraInfo(event.requestId).shift();
      if (!extraInfo) {
        this.#networkEventManager.queueEventGroup(event.requestId, {
          responseReceivedEvent: event
        });
        return;
      }
    }
    this.#emitResponseEvent(client, event, extraInfo);
  }
  #onResponseReceivedExtraInfo(client, event) {
    const redirectInfo = this.#networkEventManager.takeQueuedRedirectInfo(event.requestId);
    if (redirectInfo) {
      this.#networkEventManager.responseExtraInfo(event.requestId).push(event);
      this.#onRequest(client, redirectInfo.event, redirectInfo.fetchRequestId);
      return;
    }
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      this.#networkEventManager.forgetQueuedEventGroup(event.requestId);
      this.#emitResponseEvent(client, queuedEvents.responseReceivedEvent, event);
      if (queuedEvents.loadingFinishedEvent) {
        this.#emitLoadingFinished(client, queuedEvents.loadingFinishedEvent);
      }
      if (queuedEvents.loadingFailedEvent) {
        this.#emitLoadingFailed(client, queuedEvents.loadingFailedEvent);
      }
      return;
    }
    this.#networkEventManager.responseExtraInfo(event.requestId).push(event);
  }
  #forgetRequest(request, events) {
    const requestId = request.id;
    const interceptionId = request._interceptionId;
    this.#networkEventManager.forgetRequest(requestId);
    if (interceptionId !== void 0) {
      this.#attemptedAuthentications.delete(interceptionId);
    }
    if (events) {
      this.#networkEventManager.forget(requestId);
    }
  }
  #onLoadingFinished(client, event) {
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      queuedEvents.loadingFinishedEvent = event;
    } else {
      this.#emitLoadingFinished(client, event);
    }
  }
  #emitLoadingFinished(client, event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (!request) {
      return;
    }
    this.#adoptCdpSessionIfNeeded(client, request);
    if (request.response()) {
      request.response()?._resolveBody();
    }
    this.#forgetRequest(request, true);
    this.emit(NetworkManagerEvent.RequestFinished, request);
  }
  #onLoadingFailed(client, event) {
    const queuedEvents = this.#networkEventManager.getQueuedEventGroup(event.requestId);
    if (queuedEvents) {
      queuedEvents.loadingFailedEvent = event;
    } else {
      this.#emitLoadingFailed(client, event);
    }
  }
  #emitLoadingFailed(client, event) {
    const request = this.#networkEventManager.getRequest(event.requestId);
    if (!request) {
      return;
    }
    this.#adoptCdpSessionIfNeeded(client, request);
    request._failureText = event.errorText;
    const response = request.response();
    if (response) {
      response._resolveBody();
    }
    this.#forgetRequest(request, true);
    this.emit(NetworkManagerEvent.RequestFailed, request);
  }
  #adoptCdpSessionIfNeeded(client, request) {
    if (client !== request.client) {
      request.client = client;
    }
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/FrameManager.js
var TIME_FOR_WAITING_FOR_SWAP = 100;
var FrameManager = class extends EventEmitter {
  #page;
  #networkManager;
  #timeoutSettings;
  #isolatedWorlds = /* @__PURE__ */ new Set();
  #client;
  #scriptsToEvaluateOnNewDocument = /* @__PURE__ */ new Map();
  #bindings = /* @__PURE__ */ new Set();
  _frameTree = new FrameTree();
  /**
   * Set of frame IDs stored to indicate if a frame has received a
   * frameNavigated event so that frame tree responses could be ignored as the
   * frameNavigated event usually contains the latest information.
   */
  #frameNavigatedReceived = /* @__PURE__ */ new Set();
  #deviceRequestPromptManagerMap = /* @__PURE__ */ new WeakMap();
  #frameTreeHandled;
  get timeoutSettings() {
    return this.#timeoutSettings;
  }
  get networkManager() {
    return this.#networkManager;
  }
  get client() {
    return this.#client;
  }
  constructor(client, page, timeoutSettings) {
    super();
    this.#client = client;
    this.#page = page;
    this.#networkManager = new NetworkManager(this, page.browser().isNetworkEnabled());
    this.#timeoutSettings = timeoutSettings;
    this.setupEventListeners(this.#client);
    client.once(CDPSessionEvent.Disconnected, () => {
      this.#onClientDisconnect().catch(debugError);
    });
  }
  /**
   * Called when the frame's client is disconnected. We don't know if the
   * disconnect means that the frame is removed or if it will be replaced by a
   * new frame. Therefore, we wait for a swap event.
   */
  async #onClientDisconnect() {
    const mainFrame = this._frameTree.getMainFrame();
    if (!mainFrame) {
      return;
    }
    if (!this.#page.browser().connected) {
      this.#removeFramesRecursively(mainFrame);
      return;
    }
    for (const child of mainFrame.childFrames()) {
      this.#removeFramesRecursively(child);
    }
    const swapped = Deferred.create({
      timeout: TIME_FOR_WAITING_FOR_SWAP,
      message: "Frame was not swapped"
    });
    mainFrame.once(FrameEvent.FrameSwappedByActivation, () => {
      swapped.resolve();
    });
    try {
      await swapped.valueOrThrow();
    } catch {
      this.#removeFramesRecursively(mainFrame);
    }
  }
  /**
   * When the main frame is replaced by another main frame,
   * we maintain the main frame object identity while updating
   * its frame tree and ID.
   */
  async swapFrameTree(client) {
    this.#client = client;
    const frame = this._frameTree.getMainFrame();
    if (frame) {
      this.#frameNavigatedReceived.add(this.#client.target()._targetId);
      this._frameTree.removeFrame(frame);
      frame.updateId(this.#client.target()._targetId);
      this._frameTree.addFrame(frame);
      frame.updateClient(client);
    }
    this.setupEventListeners(client);
    client.once(CDPSessionEvent.Disconnected, () => {
      this.#onClientDisconnect().catch(debugError);
    });
    await this.initialize(client, frame);
    await this.#networkManager.addClient(client);
    if (frame) {
      frame.emit(FrameEvent.FrameSwappedByActivation, void 0);
    }
  }
  async registerSpeculativeSession(client) {
    await this.#networkManager.addClient(client);
  }
  setupEventListeners(session) {
    session.on("Page.frameAttached", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onFrameAttached(session, event.frameId, event.parentFrameId);
    });
    session.on("Page.frameNavigated", async (event) => {
      this.#frameNavigatedReceived.add(event.frame.id);
      await this.#frameTreeHandled?.valueOrThrow();
      void this.#onFrameNavigated(event.frame, event.type);
    });
    session.on("Page.navigatedWithinDocument", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onFrameNavigatedWithinDocument(event.frameId, event.url);
    });
    session.on("Page.frameDetached", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onFrameDetached(event.frameId, event.reason);
    });
    session.on("Page.frameStartedLoading", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onFrameStartedLoading(event.frameId);
    });
    session.on("Page.frameStoppedLoading", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onFrameStoppedLoading(event.frameId);
    });
    session.on("Runtime.executionContextCreated", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onExecutionContextCreated(event.context, session);
    });
    session.on("Page.lifecycleEvent", async (event) => {
      await this.#frameTreeHandled?.valueOrThrow();
      this.#onLifecycleEvent(event);
    });
  }
  async initialize(client, frame) {
    try {
      this.#frameTreeHandled?.resolve();
      this.#frameTreeHandled = Deferred.create();
      await Promise.all([
        this.#networkManager.addClient(client),
        client.send("Page.enable"),
        client.send("Page.getFrameTree").then(({ frameTree }) => {
          this.#handleFrameTree(client, frameTree);
          this.#frameTreeHandled?.resolve();
        }),
        client.send("Page.setLifecycleEventsEnabled", { enabled: true }),
        client.send("Runtime.enable").then(() => {
          return this.#createIsolatedWorld(client, UTILITY_WORLD_NAME);
        }),
        ...(frame ? Array.from(this.#scriptsToEvaluateOnNewDocument.values()) : []).map((script) => {
          return frame?.addPreloadScript(script);
        }),
        ...(frame ? Array.from(this.#bindings.values()) : []).map((binding) => {
          return frame?.addExposedFunctionBinding(binding);
        })
      ]);
    } catch (error) {
      this.#frameTreeHandled?.resolve();
      if (isErrorLike(error) && isTargetClosedError(error)) {
        return;
      }
      throw error;
    }
  }
  page() {
    return this.#page;
  }
  mainFrame() {
    const mainFrame = this._frameTree.getMainFrame();
    assert(mainFrame, "Requesting main frame too early!");
    return mainFrame;
  }
  frames() {
    return Array.from(this._frameTree.frames());
  }
  frame(frameId) {
    return this._frameTree.getById(frameId) || null;
  }
  async addExposedFunctionBinding(binding) {
    this.#bindings.add(binding);
    await Promise.all(this.frames().map(async (frame) => {
      return await frame.addExposedFunctionBinding(binding);
    }));
  }
  async removeExposedFunctionBinding(binding) {
    this.#bindings.delete(binding);
    await Promise.all(this.frames().map(async (frame) => {
      return await frame.removeExposedFunctionBinding(binding);
    }));
  }
  async evaluateOnNewDocument(source) {
    const { identifier } = await this.mainFrame()._client().send("Page.addScriptToEvaluateOnNewDocument", {
      source
    });
    const preloadScript = new CdpPreloadScript(this.mainFrame(), identifier, source);
    this.#scriptsToEvaluateOnNewDocument.set(identifier, preloadScript);
    await Promise.all(this.frames().map(async (frame) => {
      return await frame.addPreloadScript(preloadScript);
    }));
    return { identifier };
  }
  async removeScriptToEvaluateOnNewDocument(identifier) {
    const preloadScript = this.#scriptsToEvaluateOnNewDocument.get(identifier);
    if (!preloadScript) {
      throw new Error(`Script to evaluate on new document with id ${identifier} not found`);
    }
    this.#scriptsToEvaluateOnNewDocument.delete(identifier);
    await Promise.all(this.frames().map((frame) => {
      const identifier2 = preloadScript.getIdForFrame(frame);
      if (!identifier2) {
        return;
      }
      return frame._client().send("Page.removeScriptToEvaluateOnNewDocument", {
        identifier: identifier2
      }).catch(debugError);
    }));
  }
  onAttachedToTarget(target) {
    if (target._getTargetInfo().type !== "iframe") {
      return;
    }
    const frame = this.frame(target._getTargetInfo().targetId);
    if (frame) {
      frame.updateClient(target._session());
    }
    this.setupEventListeners(target._session());
    void this.initialize(target._session(), frame).catch(debugError);
  }
  _deviceRequestPromptManager(client) {
    let manager = this.#deviceRequestPromptManagerMap.get(client);
    if (manager === void 0) {
      manager = new CdpDeviceRequestPromptManager(client, this.#timeoutSettings);
      this.#deviceRequestPromptManagerMap.set(client, manager);
    }
    return manager;
  }
  #onLifecycleEvent(event) {
    const frame = this.frame(event.frameId);
    if (!frame) {
      return;
    }
    frame._onLifecycleEvent(event.loaderId, event.name);
    this.emit(FrameManagerEvent.LifecycleEvent, frame);
    frame.emit(FrameEvent.LifecycleEvent, void 0);
  }
  #onFrameStartedLoading(frameId) {
    const frame = this.frame(frameId);
    if (!frame) {
      return;
    }
    frame._onLoadingStarted();
  }
  #onFrameStoppedLoading(frameId) {
    const frame = this.frame(frameId);
    if (!frame) {
      return;
    }
    frame._onLoadingStopped();
    this.emit(FrameManagerEvent.LifecycleEvent, frame);
    frame.emit(FrameEvent.LifecycleEvent, void 0);
  }
  #handleFrameTree(session, frameTree) {
    if (frameTree.frame.parentId) {
      this.#onFrameAttached(session, frameTree.frame.id, frameTree.frame.parentId);
    }
    if (!this.#frameNavigatedReceived.has(frameTree.frame.id)) {
      void this.#onFrameNavigated(frameTree.frame, "Navigation");
    } else {
      this.#frameNavigatedReceived.delete(frameTree.frame.id);
    }
    if (!frameTree.childFrames) {
      return;
    }
    for (const child of frameTree.childFrames) {
      this.#handleFrameTree(session, child);
    }
  }
  #onFrameAttached(session, frameId, parentFrameId) {
    let frame = this.frame(frameId);
    if (frame) {
      const parentFrame = this.frame(parentFrameId);
      if (session && parentFrame && frame.client !== parentFrame?.client) {
        frame.updateClient(session);
      }
      return;
    }
    frame = new CdpFrame(this, frameId, parentFrameId, session);
    this._frameTree.addFrame(frame);
    this.emit(FrameManagerEvent.FrameAttached, frame);
  }
  async #onFrameNavigated(framePayload, navigationType) {
    const frameId = framePayload.id;
    const isMainFrame = !framePayload.parentId;
    let frame = this._frameTree.getById(frameId);
    if (frame) {
      for (const child of frame.childFrames()) {
        this.#removeFramesRecursively(child);
      }
    }
    if (isMainFrame) {
      if (frame) {
        this._frameTree.removeFrame(frame);
        frame._id = frameId;
      } else {
        frame = new CdpFrame(this, frameId, void 0, this.#client);
      }
      this._frameTree.addFrame(frame);
    }
    frame = await this._frameTree.waitForFrame(frameId);
    frame._navigated(framePayload);
    this.emit(FrameManagerEvent.FrameNavigated, frame);
    frame.emit(FrameEvent.FrameNavigated, navigationType);
  }
  async #createIsolatedWorld(session, name) {
    const key = `${session.id()}:${name}`;
    if (this.#isolatedWorlds.has(key)) {
      return;
    }
    await session.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `//# sourceURL=${PuppeteerURL.INTERNAL_URL}`,
      worldName: name
    });
    await Promise.all(this.frames().filter((frame) => {
      return frame.client === session;
    }).map((frame) => {
      return session.send("Page.createIsolatedWorld", {
        frameId: frame._id,
        worldName: name,
        grantUniveralAccess: true
      }).catch(debugError);
    }));
    this.#isolatedWorlds.add(key);
  }
  #onFrameNavigatedWithinDocument(frameId, url) {
    const frame = this.frame(frameId);
    if (!frame) {
      return;
    }
    frame._navigatedWithinDocument(url);
    this.emit(FrameManagerEvent.FrameNavigatedWithinDocument, frame);
    frame.emit(FrameEvent.FrameNavigatedWithinDocument, void 0);
    this.emit(FrameManagerEvent.FrameNavigated, frame);
    frame.emit(FrameEvent.FrameNavigated, "Navigation");
  }
  #onFrameDetached(frameId, reason) {
    const frame = this.frame(frameId);
    if (!frame) {
      return;
    }
    switch (reason) {
      case "remove":
        this.#removeFramesRecursively(frame);
        break;
      case "swap":
        this.emit(FrameManagerEvent.FrameSwapped, frame);
        frame.emit(FrameEvent.FrameSwapped, void 0);
        break;
    }
  }
  #onExecutionContextCreated(contextPayload, session) {
    const auxData = contextPayload.auxData;
    const frameId = auxData && auxData.frameId;
    const frame = typeof frameId === "string" ? this.frame(frameId) : void 0;
    let world;
    if (frame) {
      if (frame.client !== session) {
        return;
      }
      if (contextPayload.auxData && contextPayload.auxData["isDefault"]) {
        world = frame.worlds[MAIN_WORLD];
      } else if (contextPayload.name === UTILITY_WORLD_NAME) {
        world = frame.worlds[PUPPETEER_WORLD];
      }
    }
    if (!world) {
      return;
    }
    const context = new ExecutionContext(frame?.client || this.#client, contextPayload, world);
    world.setContext(context);
  }
  #removeFramesRecursively(frame) {
    for (const child of frame.childFrames()) {
      this.#removeFramesRecursively(child);
    }
    frame[disposeSymbol]();
    this._frameTree.removeFrame(frame);
    this.emit(FrameManagerEvent.FrameDetached, frame);
    frame.emit(FrameEvent.FrameDetached, frame);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/common/USKeyboardLayout.js
var _keyDefinitions = {
  "0": { keyCode: 48, key: "0", code: "Digit0" },
  "1": { keyCode: 49, key: "1", code: "Digit1" },
  "2": { keyCode: 50, key: "2", code: "Digit2" },
  "3": { keyCode: 51, key: "3", code: "Digit3" },
  "4": { keyCode: 52, key: "4", code: "Digit4" },
  "5": { keyCode: 53, key: "5", code: "Digit5" },
  "6": { keyCode: 54, key: "6", code: "Digit6" },
  "7": { keyCode: 55, key: "7", code: "Digit7" },
  "8": { keyCode: 56, key: "8", code: "Digit8" },
  "9": { keyCode: 57, key: "9", code: "Digit9" },
  Power: { key: "Power", code: "Power" },
  Eject: { key: "Eject", code: "Eject" },
  Abort: { keyCode: 3, code: "Abort", key: "Cancel" },
  Help: { keyCode: 6, code: "Help", key: "Help" },
  Backspace: { keyCode: 8, code: "Backspace", key: "Backspace" },
  Tab: { keyCode: 9, code: "Tab", key: "Tab" },
  Numpad5: {
    keyCode: 12,
    shiftKeyCode: 101,
    key: "Clear",
    code: "Numpad5",
    shiftKey: "5",
    location: 3
  },
  NumpadEnter: {
    keyCode: 13,
    code: "NumpadEnter",
    key: "Enter",
    text: "\r",
    location: 3
  },
  Enter: { keyCode: 13, code: "Enter", key: "Enter", text: "\r" },
  "\r": { keyCode: 13, code: "Enter", key: "Enter", text: "\r" },
  "\n": { keyCode: 13, code: "Enter", key: "Enter", text: "\r" },
  ShiftLeft: { keyCode: 16, code: "ShiftLeft", key: "Shift", location: 1 },
  ShiftRight: { keyCode: 16, code: "ShiftRight", key: "Shift", location: 2 },
  ControlLeft: {
    keyCode: 17,
    code: "ControlLeft",
    key: "Control",
    location: 1
  },
  ControlRight: {
    keyCode: 17,
    code: "ControlRight",
    key: "Control",
    location: 2
  },
  AltLeft: { keyCode: 18, code: "AltLeft", key: "Alt", location: 1 },
  AltRight: { keyCode: 18, code: "AltRight", key: "Alt", location: 2 },
  Pause: { keyCode: 19, code: "Pause", key: "Pause" },
  CapsLock: { keyCode: 20, code: "CapsLock", key: "CapsLock" },
  Escape: { keyCode: 27, code: "Escape", key: "Escape" },
  Convert: { keyCode: 28, code: "Convert", key: "Convert" },
  NonConvert: { keyCode: 29, code: "NonConvert", key: "NonConvert" },
  Space: { keyCode: 32, code: "Space", key: " " },
  Numpad9: {
    keyCode: 33,
    shiftKeyCode: 105,
    key: "PageUp",
    code: "Numpad9",
    shiftKey: "9",
    location: 3
  },
  PageUp: { keyCode: 33, code: "PageUp", key: "PageUp" },
  Numpad3: {
    keyCode: 34,
    shiftKeyCode: 99,
    key: "PageDown",
    code: "Numpad3",
    shiftKey: "3",
    location: 3
  },
  PageDown: { keyCode: 34, code: "PageDown", key: "PageDown" },
  End: { keyCode: 35, code: "End", key: "End" },
  Numpad1: {
    keyCode: 35,
    shiftKeyCode: 97,
    key: "End",
    code: "Numpad1",
    shiftKey: "1",
    location: 3
  },
  Home: { keyCode: 36, code: "Home", key: "Home" },
  Numpad7: {
    keyCode: 36,
    shiftKeyCode: 103,
    key: "Home",
    code: "Numpad7",
    shiftKey: "7",
    location: 3
  },
  ArrowLeft: { keyCode: 37, code: "ArrowLeft", key: "ArrowLeft" },
  Numpad4: {
    keyCode: 37,
    shiftKeyCode: 100,
    key: "ArrowLeft",
    code: "Numpad4",
    shiftKey: "4",
    location: 3
  },
  Numpad8: {
    keyCode: 38,
    shiftKeyCode: 104,
    key: "ArrowUp",
    code: "Numpad8",
    shiftKey: "8",
    location: 3
  },
  ArrowUp: { keyCode: 38, code: "ArrowUp", key: "ArrowUp" },
  ArrowRight: { keyCode: 39, code: "ArrowRight", key: "ArrowRight" },
  Numpad6: {
    keyCode: 39,
    shiftKeyCode: 102,
    key: "ArrowRight",
    code: "Numpad6",
    shiftKey: "6",
    location: 3
  },
  Numpad2: {
    keyCode: 40,
    shiftKeyCode: 98,
    key: "ArrowDown",
    code: "Numpad2",
    shiftKey: "2",
    location: 3
  },
  ArrowDown: { keyCode: 40, code: "ArrowDown", key: "ArrowDown" },
  Select: { keyCode: 41, code: "Select", key: "Select" },
  Open: { keyCode: 43, code: "Open", key: "Execute" },
  PrintScreen: { keyCode: 44, code: "PrintScreen", key: "PrintScreen" },
  Insert: { keyCode: 45, code: "Insert", key: "Insert" },
  Numpad0: {
    keyCode: 45,
    shiftKeyCode: 96,
    key: "Insert",
    code: "Numpad0",
    shiftKey: "0",
    location: 3
  },
  Delete: { keyCode: 46, code: "Delete", key: "Delete" },
  NumpadDecimal: {
    keyCode: 46,
    shiftKeyCode: 110,
    code: "NumpadDecimal",
    key: "\0",
    shiftKey: ".",
    location: 3
  },
  Digit0: { keyCode: 48, code: "Digit0", shiftKey: ")", key: "0" },
  Digit1: { keyCode: 49, code: "Digit1", shiftKey: "!", key: "1" },
  Digit2: { keyCode: 50, code: "Digit2", shiftKey: "@", key: "2" },
  Digit3: { keyCode: 51, code: "Digit3", shiftKey: "#", key: "3" },
  Digit4: { keyCode: 52, code: "Digit4", shiftKey: "$", key: "4" },
  Digit5: { keyCode: 53, code: "Digit5", shiftKey: "%", key: "5" },
  Digit6: { keyCode: 54, code: "Digit6", shiftKey: "^", key: "6" },
  Digit7: { keyCode: 55, code: "Digit7", shiftKey: "&", key: "7" },
  Digit8: { keyCode: 56, code: "Digit8", shiftKey: "*", key: "8" },
  Digit9: { keyCode: 57, code: "Digit9", shiftKey: "(", key: "9" },
  KeyA: { keyCode: 65, code: "KeyA", shiftKey: "A", key: "a" },
  KeyB: { keyCode: 66, code: "KeyB", shiftKey: "B", key: "b" },
  KeyC: { keyCode: 67, code: "KeyC", shiftKey: "C", key: "c" },
  KeyD: { keyCode: 68, code: "KeyD", shiftKey: "D", key: "d" },
  KeyE: { keyCode: 69, code: "KeyE", shiftKey: "E", key: "e" },
  KeyF: { keyCode: 70, code: "KeyF", shiftKey: "F", key: "f" },
  KeyG: { keyCode: 71, code: "KeyG", shiftKey: "G", key: "g" },
  KeyH: { keyCode: 72, code: "KeyH", shiftKey: "H", key: "h" },
  KeyI: { keyCode: 73, code: "KeyI", shiftKey: "I", key: "i" },
  KeyJ: { keyCode: 74, code: "KeyJ", shiftKey: "J", key: "j" },
  KeyK: { keyCode: 75, code: "KeyK", shiftKey: "K", key: "k" },
  KeyL: { keyCode: 76, code: "KeyL", shiftKey: "L", key: "l" },
  KeyM: { keyCode: 77, code: "KeyM", shiftKey: "M", key: "m" },
  KeyN: { keyCode: 78, code: "KeyN", shiftKey: "N", key: "n" },
  KeyO: { keyCode: 79, code: "KeyO", shiftKey: "O", key: "o" },
  KeyP: { keyCode: 80, code: "KeyP", shiftKey: "P", key: "p" },
  KeyQ: { keyCode: 81, code: "KeyQ", shiftKey: "Q", key: "q" },
  KeyR: { keyCode: 82, code: "KeyR", shiftKey: "R", key: "r" },
  KeyS: { keyCode: 83, code: "KeyS", shiftKey: "S", key: "s" },
  KeyT: { keyCode: 84, code: "KeyT", shiftKey: "T", key: "t" },
  KeyU: { keyCode: 85, code: "KeyU", shiftKey: "U", key: "u" },
  KeyV: { keyCode: 86, code: "KeyV", shiftKey: "V", key: "v" },
  KeyW: { keyCode: 87, code: "KeyW", shiftKey: "W", key: "w" },
  KeyX: { keyCode: 88, code: "KeyX", shiftKey: "X", key: "x" },
  KeyY: { keyCode: 89, code: "KeyY", shiftKey: "Y", key: "y" },
  KeyZ: { keyCode: 90, code: "KeyZ", shiftKey: "Z", key: "z" },
  MetaLeft: { keyCode: 91, code: "MetaLeft", key: "Meta", location: 1 },
  MetaRight: { keyCode: 92, code: "MetaRight", key: "Meta", location: 2 },
  ContextMenu: { keyCode: 93, code: "ContextMenu", key: "ContextMenu" },
  NumpadMultiply: {
    keyCode: 106,
    code: "NumpadMultiply",
    key: "*",
    location: 3
  },
  NumpadAdd: { keyCode: 107, code: "NumpadAdd", key: "+", location: 3 },
  NumpadSubtract: {
    keyCode: 109,
    code: "NumpadSubtract",
    key: "-",
    location: 3
  },
  NumpadDivide: { keyCode: 111, code: "NumpadDivide", key: "/", location: 3 },
  F1: { keyCode: 112, code: "F1", key: "F1" },
  F2: { keyCode: 113, code: "F2", key: "F2" },
  F3: { keyCode: 114, code: "F3", key: "F3" },
  F4: { keyCode: 115, code: "F4", key: "F4" },
  F5: { keyCode: 116, code: "F5", key: "F5" },
  F6: { keyCode: 117, code: "F6", key: "F6" },
  F7: { keyCode: 118, code: "F7", key: "F7" },
  F8: { keyCode: 119, code: "F8", key: "F8" },
  F9: { keyCode: 120, code: "F9", key: "F9" },
  F10: { keyCode: 121, code: "F10", key: "F10" },
  F11: { keyCode: 122, code: "F11", key: "F11" },
  F12: { keyCode: 123, code: "F12", key: "F12" },
  F13: { keyCode: 124, code: "F13", key: "F13" },
  F14: { keyCode: 125, code: "F14", key: "F14" },
  F15: { keyCode: 126, code: "F15", key: "F15" },
  F16: { keyCode: 127, code: "F16", key: "F16" },
  F17: { keyCode: 128, code: "F17", key: "F17" },
  F18: { keyCode: 129, code: "F18", key: "F18" },
  F19: { keyCode: 130, code: "F19", key: "F19" },
  F20: { keyCode: 131, code: "F20", key: "F20" },
  F21: { keyCode: 132, code: "F21", key: "F21" },
  F22: { keyCode: 133, code: "F22", key: "F22" },
  F23: { keyCode: 134, code: "F23", key: "F23" },
  F24: { keyCode: 135, code: "F24", key: "F24" },
  NumLock: { keyCode: 144, code: "NumLock", key: "NumLock" },
  ScrollLock: { keyCode: 145, code: "ScrollLock", key: "ScrollLock" },
  AudioVolumeMute: {
    keyCode: 173,
    code: "AudioVolumeMute",
    key: "AudioVolumeMute"
  },
  AudioVolumeDown: {
    keyCode: 174,
    code: "AudioVolumeDown",
    key: "AudioVolumeDown"
  },
  AudioVolumeUp: { keyCode: 175, code: "AudioVolumeUp", key: "AudioVolumeUp" },
  MediaTrackNext: {
    keyCode: 176,
    code: "MediaTrackNext",
    key: "MediaTrackNext"
  },
  MediaTrackPrevious: {
    keyCode: 177,
    code: "MediaTrackPrevious",
    key: "MediaTrackPrevious"
  },
  MediaStop: { keyCode: 178, code: "MediaStop", key: "MediaStop" },
  MediaPlayPause: {
    keyCode: 179,
    code: "MediaPlayPause",
    key: "MediaPlayPause"
  },
  Semicolon: { keyCode: 186, code: "Semicolon", shiftKey: ":", key: ";" },
  Equal: { keyCode: 187, code: "Equal", shiftKey: "+", key: "=" },
  NumpadEqual: { keyCode: 187, code: "NumpadEqual", key: "=", location: 3 },
  Comma: { keyCode: 188, code: "Comma", shiftKey: "<", key: "," },
  Minus: { keyCode: 189, code: "Minus", shiftKey: "_", key: "-" },
  Period: { keyCode: 190, code: "Period", shiftKey: ">", key: "." },
  Slash: { keyCode: 191, code: "Slash", shiftKey: "?", key: "/" },
  Backquote: { keyCode: 192, code: "Backquote", shiftKey: "~", key: "`" },
  BracketLeft: { keyCode: 219, code: "BracketLeft", shiftKey: "{", key: "[" },
  Backslash: { keyCode: 220, code: "Backslash", shiftKey: "|", key: "\\" },
  BracketRight: { keyCode: 221, code: "BracketRight", shiftKey: "}", key: "]" },
  Quote: { keyCode: 222, code: "Quote", shiftKey: '"', key: "'" },
  AltGraph: { keyCode: 225, code: "AltGraph", key: "AltGraph" },
  Props: { keyCode: 247, code: "Props", key: "CrSel" },
  Cancel: { keyCode: 3, key: "Cancel", code: "Abort" },
  Clear: { keyCode: 12, key: "Clear", code: "Numpad5", location: 3 },
  Shift: { keyCode: 16, key: "Shift", code: "ShiftLeft", location: 1 },
  Control: { keyCode: 17, key: "Control", code: "ControlLeft", location: 1 },
  Alt: { keyCode: 18, key: "Alt", code: "AltLeft", location: 1 },
  Accept: { keyCode: 30, key: "Accept" },
  ModeChange: { keyCode: 31, key: "ModeChange" },
  " ": { keyCode: 32, key: " ", code: "Space" },
  Print: { keyCode: 42, key: "Print" },
  Execute: { keyCode: 43, key: "Execute", code: "Open" },
  "\0": { keyCode: 46, key: "\0", code: "NumpadDecimal", location: 3 },
  a: { keyCode: 65, key: "a", code: "KeyA" },
  b: { keyCode: 66, key: "b", code: "KeyB" },
  c: { keyCode: 67, key: "c", code: "KeyC" },
  d: { keyCode: 68, key: "d", code: "KeyD" },
  e: { keyCode: 69, key: "e", code: "KeyE" },
  f: { keyCode: 70, key: "f", code: "KeyF" },
  g: { keyCode: 71, key: "g", code: "KeyG" },
  h: { keyCode: 72, key: "h", code: "KeyH" },
  i: { keyCode: 73, key: "i", code: "KeyI" },
  j: { keyCode: 74, key: "j", code: "KeyJ" },
  k: { keyCode: 75, key: "k", code: "KeyK" },
  l: { keyCode: 76, key: "l", code: "KeyL" },
  m: { keyCode: 77, key: "m", code: "KeyM" },
  n: { keyCode: 78, key: "n", code: "KeyN" },
  o: { keyCode: 79, key: "o", code: "KeyO" },
  p: { keyCode: 80, key: "p", code: "KeyP" },
  q: { keyCode: 81, key: "q", code: "KeyQ" },
  r: { keyCode: 82, key: "r", code: "KeyR" },
  s: { keyCode: 83, key: "s", code: "KeyS" },
  t: { keyCode: 84, key: "t", code: "KeyT" },
  u: { keyCode: 85, key: "u", code: "KeyU" },
  v: { keyCode: 86, key: "v", code: "KeyV" },
  w: { keyCode: 87, key: "w", code: "KeyW" },
  x: { keyCode: 88, key: "x", code: "KeyX" },
  y: { keyCode: 89, key: "y", code: "KeyY" },
  z: { keyCode: 90, key: "z", code: "KeyZ" },
  Meta: { keyCode: 91, key: "Meta", code: "MetaLeft", location: 1 },
  "*": { keyCode: 106, key: "*", code: "NumpadMultiply", location: 3 },
  "+": { keyCode: 107, key: "+", code: "NumpadAdd", location: 3 },
  "-": { keyCode: 109, key: "-", code: "NumpadSubtract", location: 3 },
  "/": { keyCode: 111, key: "/", code: "NumpadDivide", location: 3 },
  ";": { keyCode: 186, key: ";", code: "Semicolon" },
  "=": { keyCode: 187, key: "=", code: "Equal" },
  ",": { keyCode: 188, key: ",", code: "Comma" },
  ".": { keyCode: 190, key: ".", code: "Period" },
  "`": { keyCode: 192, key: "`", code: "Backquote" },
  "[": { keyCode: 219, key: "[", code: "BracketLeft" },
  "\\": { keyCode: 220, key: "\\", code: "Backslash" },
  "]": { keyCode: 221, key: "]", code: "BracketRight" },
  "'": { keyCode: 222, key: "'", code: "Quote" },
  Attn: { keyCode: 246, key: "Attn" },
  CrSel: { keyCode: 247, key: "CrSel", code: "Props" },
  ExSel: { keyCode: 248, key: "ExSel" },
  EraseEof: { keyCode: 249, key: "EraseEof" },
  Play: { keyCode: 250, key: "Play" },
  ZoomOut: { keyCode: 251, key: "ZoomOut" },
  ")": { keyCode: 48, key: ")", code: "Digit0" },
  "!": { keyCode: 49, key: "!", code: "Digit1" },
  "@": { keyCode: 50, key: "@", code: "Digit2" },
  "#": { keyCode: 51, key: "#", code: "Digit3" },
  $: { keyCode: 52, key: "$", code: "Digit4" },
  "%": { keyCode: 53, key: "%", code: "Digit5" },
  "^": { keyCode: 54, key: "^", code: "Digit6" },
  "&": { keyCode: 55, key: "&", code: "Digit7" },
  "(": { keyCode: 57, key: "(", code: "Digit9" },
  A: { keyCode: 65, key: "A", code: "KeyA" },
  B: { keyCode: 66, key: "B", code: "KeyB" },
  C: { keyCode: 67, key: "C", code: "KeyC" },
  D: { keyCode: 68, key: "D", code: "KeyD" },
  E: { keyCode: 69, key: "E", code: "KeyE" },
  F: { keyCode: 70, key: "F", code: "KeyF" },
  G: { keyCode: 71, key: "G", code: "KeyG" },
  H: { keyCode: 72, key: "H", code: "KeyH" },
  I: { keyCode: 73, key: "I", code: "KeyI" },
  J: { keyCode: 74, key: "J", code: "KeyJ" },
  K: { keyCode: 75, key: "K", code: "KeyK" },
  L: { keyCode: 76, key: "L", code: "KeyL" },
  M: { keyCode: 77, key: "M", code: "KeyM" },
  N: { keyCode: 78, key: "N", code: "KeyN" },
  O: { keyCode: 79, key: "O", code: "KeyO" },
  P: { keyCode: 80, key: "P", code: "KeyP" },
  Q: { keyCode: 81, key: "Q", code: "KeyQ" },
  R: { keyCode: 82, key: "R", code: "KeyR" },
  S: { keyCode: 83, key: "S", code: "KeyS" },
  T: { keyCode: 84, key: "T", code: "KeyT" },
  U: { keyCode: 85, key: "U", code: "KeyU" },
  V: { keyCode: 86, key: "V", code: "KeyV" },
  W: { keyCode: 87, key: "W", code: "KeyW" },
  X: { keyCode: 88, key: "X", code: "KeyX" },
  Y: { keyCode: 89, key: "Y", code: "KeyY" },
  Z: { keyCode: 90, key: "Z", code: "KeyZ" },
  ":": { keyCode: 186, key: ":", code: "Semicolon" },
  "<": { keyCode: 188, key: "<", code: "Comma" },
  _: { keyCode: 189, key: "_", code: "Minus" },
  ">": { keyCode: 190, key: ">", code: "Period" },
  "?": { keyCode: 191, key: "?", code: "Slash" },
  "~": { keyCode: 192, key: "~", code: "Backquote" },
  "{": { keyCode: 219, key: "{", code: "BracketLeft" },
  "|": { keyCode: 220, key: "|", code: "Backslash" },
  "}": { keyCode: 221, key: "}", code: "BracketRight" },
  '"': { keyCode: 222, key: '"', code: "Quote" },
  SoftLeft: { key: "SoftLeft", code: "SoftLeft", location: 4 },
  SoftRight: { key: "SoftRight", code: "SoftRight", location: 4 },
  Camera: { keyCode: 44, key: "Camera", code: "Camera", location: 4 },
  Call: { key: "Call", code: "Call", location: 4 },
  EndCall: { keyCode: 95, key: "EndCall", code: "EndCall", location: 4 },
  VolumeDown: {
    keyCode: 182,
    key: "VolumeDown",
    code: "VolumeDown",
    location: 4
  },
  VolumeUp: { keyCode: 183, key: "VolumeUp", code: "VolumeUp", location: 4 }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Input.js
var CdpKeyboard = class extends Keyboard {
  #client;
  #pressedKeys = /* @__PURE__ */ new Set();
  _modifiers = 0;
  constructor(client) {
    super();
    this.#client = client;
  }
  updateClient(client) {
    this.#client = client;
  }
  async down(key, options = {
    text: void 0,
    commands: []
  }) {
    const description = this.#keyDescriptionForString(key);
    const autoRepeat = this.#pressedKeys.has(description.code);
    this.#pressedKeys.add(description.code);
    this._modifiers |= this.#modifierBit(description.key);
    const text = options.text === void 0 ? description.text : options.text;
    await this.#client.send("Input.dispatchKeyEvent", {
      type: text ? "keyDown" : "rawKeyDown",
      modifiers: this._modifiers,
      windowsVirtualKeyCode: description.keyCode,
      code: description.code,
      key: description.key,
      text,
      unmodifiedText: text,
      autoRepeat,
      location: description.location,
      isKeypad: description.location === 3,
      commands: options.commands
    });
  }
  #modifierBit(key) {
    if (key === "Alt") {
      return 1;
    }
    if (key === "Control") {
      return 2;
    }
    if (key === "Meta") {
      return 4;
    }
    if (key === "Shift") {
      return 8;
    }
    return 0;
  }
  #keyDescriptionForString(keyString) {
    const shift = this._modifiers & 8;
    const description = {
      key: "",
      keyCode: 0,
      code: "",
      text: "",
      location: 0
    };
    const definition = _keyDefinitions[keyString];
    assert(definition, `Unknown key: "${keyString}"`);
    if (definition.key) {
      description.key = definition.key;
    }
    if (shift && definition.shiftKey) {
      description.key = definition.shiftKey;
    }
    if (definition.keyCode) {
      description.keyCode = definition.keyCode;
    }
    if (shift && definition.shiftKeyCode) {
      description.keyCode = definition.shiftKeyCode;
    }
    if (definition.code) {
      description.code = definition.code;
    }
    if (definition.location) {
      description.location = definition.location;
    }
    if (description.key.length === 1) {
      description.text = description.key;
    }
    if (definition.text) {
      description.text = definition.text;
    }
    if (shift && definition.shiftText) {
      description.text = definition.shiftText;
    }
    if (this._modifiers & ~8) {
      description.text = "";
    }
    return description;
  }
  async up(key) {
    const description = this.#keyDescriptionForString(key);
    this._modifiers &= ~this.#modifierBit(description.key);
    this.#pressedKeys.delete(description.code);
    await this.#client.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      modifiers: this._modifiers,
      key: description.key,
      windowsVirtualKeyCode: description.keyCode,
      code: description.code,
      location: description.location
    });
  }
  async sendCharacter(char) {
    await this.#client.send("Input.insertText", { text: char });
  }
  charIsKey(char) {
    return !!_keyDefinitions[char];
  }
  async type(text, options = {}) {
    const delay = options.delay || void 0;
    for (const char of text) {
      if (this.charIsKey(char)) {
        await this.press(char, { delay });
      } else {
        if (delay) {
          await new Promise((f) => {
            return setTimeout(f, delay);
          });
        }
        await this.sendCharacter(char);
      }
    }
  }
  async press(key, options = {}) {
    const { delay = null } = options;
    await this.down(key, options);
    if (delay) {
      await new Promise((f) => {
        return setTimeout(f, options.delay);
      });
    }
    await this.up(key);
  }
};
var getFlag = (button) => {
  switch (button) {
    case MouseButton.Left:
      return 1;
    case MouseButton.Right:
      return 2;
    case MouseButton.Middle:
      return 4;
    case MouseButton.Back:
      return 8;
    case MouseButton.Forward:
      return 16;
  }
};
var getButtonFromPressedButtons = (buttons) => {
  if (buttons & 1) {
    return MouseButton.Left;
  } else if (buttons & 2) {
    return MouseButton.Right;
  } else if (buttons & 4) {
    return MouseButton.Middle;
  } else if (buttons & 8) {
    return MouseButton.Back;
  } else if (buttons & 16) {
    return MouseButton.Forward;
  }
  return "none";
};
var CdpMouse = class extends Mouse {
  #client;
  #keyboard;
  constructor(client, keyboard) {
    super();
    this.#client = client;
    this.#keyboard = keyboard;
  }
  updateClient(client) {
    this.#client = client;
  }
  #_state = {
    position: { x: 0, y: 0 },
    buttons: 0
  };
  get #state() {
    return Object.assign({ ...this.#_state }, ...this.#transactions);
  }
  // Transactions can run in parallel, so we store each of thme in this array.
  #transactions = [];
  #createTransaction() {
    const transaction = {};
    this.#transactions.push(transaction);
    const popTransaction = () => {
      this.#transactions.splice(this.#transactions.indexOf(transaction), 1);
    };
    return {
      update: (updates) => {
        Object.assign(transaction, updates);
      },
      commit: () => {
        this.#_state = { ...this.#_state, ...transaction };
        popTransaction();
      },
      rollback: popTransaction
    };
  }
  /**
   * This is a shortcut for a typical update, commit/rollback lifecycle based on
   * the error of the action.
   */
  async #withTransaction(action) {
    const { update, commit, rollback } = this.#createTransaction();
    try {
      await action(update);
      commit();
    } catch (error) {
      rollback();
      throw error;
    }
  }
  async reset() {
    const actions = [];
    for (const [flag, button] of [
      [1, MouseButton.Left],
      [4, MouseButton.Middle],
      [2, MouseButton.Right],
      [16, MouseButton.Forward],
      [8, MouseButton.Back]
    ]) {
      if (this.#state.buttons & flag) {
        actions.push(this.up({ button }));
      }
    }
    if (this.#state.position.x !== 0 || this.#state.position.y !== 0) {
      actions.push(this.move(0, 0));
    }
    await Promise.all(actions);
  }
  async move(x, y, options = {}) {
    const { steps = 1 } = options;
    const from2 = this.#state.position;
    const to = { x, y };
    for (let i = 1; i <= steps; i++) {
      await this.#withTransaction((updateState) => {
        updateState({
          position: {
            x: from2.x + (to.x - from2.x) * (i / steps),
            y: from2.y + (to.y - from2.y) * (i / steps)
          }
        });
        const { buttons, position } = this.#state;
        return this.#client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          modifiers: this.#keyboard._modifiers,
          buttons,
          button: getButtonFromPressedButtons(buttons),
          ...position
        });
      });
    }
  }
  async down(options = {}) {
    const { button = MouseButton.Left, clickCount = 1 } = options;
    const flag = getFlag(button);
    if (!flag) {
      throw new Error(`Unsupported mouse button: ${button}`);
    }
    if (this.#state.buttons & flag) {
      throw new Error(`'${button}' is already pressed.`);
    }
    await this.#withTransaction((updateState) => {
      updateState({
        buttons: this.#state.buttons | flag
      });
      const { buttons, position } = this.#state;
      return this.#client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        modifiers: this.#keyboard._modifiers,
        clickCount,
        buttons,
        button,
        ...position
      });
    });
  }
  async up(options = {}) {
    const { button = MouseButton.Left, clickCount = 1 } = options;
    const flag = getFlag(button);
    if (!flag) {
      throw new Error(`Unsupported mouse button: ${button}`);
    }
    if (!(this.#state.buttons & flag)) {
      throw new Error(`'${button}' is not pressed.`);
    }
    await this.#withTransaction((updateState) => {
      updateState({
        buttons: this.#state.buttons & ~flag
      });
      const { buttons, position } = this.#state;
      return this.#client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        modifiers: this.#keyboard._modifiers,
        clickCount,
        buttons,
        button,
        ...position
      });
    });
  }
  async click(x, y, options = {}) {
    const { delay, count = 1, clickCount = count } = options;
    if (count < 1) {
      throw new Error("Click must occur a positive number of times.");
    }
    const actions = [this.move(x, y)];
    if (clickCount === count) {
      for (let i = 1; i < count; ++i) {
        actions.push(this.down({ ...options, clickCount: i }), this.up({ ...options, clickCount: i }));
      }
    }
    actions.push(this.down({ ...options, clickCount }));
    if (typeof delay === "number") {
      await Promise.all(actions);
      actions.length = 0;
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
    actions.push(this.up({ ...options, clickCount }));
    await Promise.all(actions);
  }
  async wheel(options = {}) {
    const { deltaX = 0, deltaY = 0 } = options;
    const { position, buttons } = this.#state;
    await this.#client.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      pointerType: "mouse",
      modifiers: this.#keyboard._modifiers,
      deltaY,
      deltaX,
      buttons,
      ...position
    });
  }
  async drag(start, target) {
    const promise = new Promise((resolve) => {
      this.#client.once("Input.dragIntercepted", (event) => {
        return resolve(event.data);
      });
    });
    await this.move(start.x, start.y);
    await this.down();
    await this.move(target.x, target.y);
    return await promise;
  }
  async dragEnter(target, data) {
    await this.#client.send("Input.dispatchDragEvent", {
      type: "dragEnter",
      x: target.x,
      y: target.y,
      modifiers: this.#keyboard._modifiers,
      data
    });
  }
  async dragOver(target, data) {
    await this.#client.send("Input.dispatchDragEvent", {
      type: "dragOver",
      x: target.x,
      y: target.y,
      modifiers: this.#keyboard._modifiers,
      data
    });
  }
  async drop(target, data) {
    await this.#client.send("Input.dispatchDragEvent", {
      type: "drop",
      x: target.x,
      y: target.y,
      modifiers: this.#keyboard._modifiers,
      data
    });
  }
  async dragAndDrop(start, target, options = {}) {
    const { delay = null } = options;
    const data = await this.drag(start, target);
    await this.dragEnter(target, data);
    await this.dragOver(target, data);
    if (delay) {
      await new Promise((resolve) => {
        return setTimeout(resolve, delay);
      });
    }
    await this.drop(target, data);
    await this.up();
  }
};
var CdpTouchHandle = class {
  #started = false;
  #touchScreen;
  #touchPoint;
  #client;
  #keyboard;
  constructor(client, touchScreen, keyboard, touchPoint) {
    this.#client = client;
    this.#touchScreen = touchScreen;
    this.#keyboard = keyboard;
    this.#touchPoint = touchPoint;
  }
  updateClient(client) {
    this.#client = client;
  }
  async start() {
    if (this.#started) {
      throw new TouchError("Touch has already started");
    }
    await this.#client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [this.#touchPoint],
      modifiers: this.#keyboard._modifiers
    });
    this.#started = true;
  }
  move(x, y) {
    this.#touchPoint.x = Math.round(x);
    this.#touchPoint.y = Math.round(y);
    return this.#client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [this.#touchPoint],
      modifiers: this.#keyboard._modifiers
    });
  }
  async end() {
    await this.#client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [this.#touchPoint],
      modifiers: this.#keyboard._modifiers
    });
    this.#touchScreen.removeHandle(this);
  }
};
var CdpTouchscreen = class extends Touchscreen {
  #client;
  #keyboard;
  constructor(client, keyboard) {
    super();
    this.#client = client;
    this.#keyboard = keyboard;
  }
  updateClient(client) {
    this.#client = client;
    this.touches.forEach((t) => {
      t.updateClient(client);
    });
  }
  async touchStart(x, y) {
    const id = this.idGenerator();
    const touchPoint = {
      x: Math.round(x),
      y: Math.round(y),
      radiusX: 0.5,
      radiusY: 0.5,
      force: 0.5,
      id
    };
    const touch = new CdpTouchHandle(this.#client, this, this.#keyboard, touchPoint);
    await touch.start();
    this.touches.push(touch);
    return touch;
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/WebWorker.js
var CdpWebWorker = class extends WebWorker {
  #world;
  #client;
  #id;
  #targetType;
  constructor(client, url, targetId, targetType, consoleAPICalled, exceptionThrown, networkManager) {
    super(url);
    this.#id = targetId;
    this.#client = client;
    this.#targetType = targetType;
    this.#world = new IsolatedWorld(this, new TimeoutSettings());
    this.#client.once("Runtime.executionContextCreated", async (event) => {
      this.#world.setContext(new ExecutionContext(client, event.context, this.#world));
    });
    this.#world.emitter.on("consoleapicalled", async (event) => {
      try {
        return consoleAPICalled(this.#world, event);
      } catch (err) {
        debugError(err);
      }
    });
    this.#client.on("Runtime.exceptionThrown", exceptionThrown);
    this.#client.once(CDPSessionEvent.Disconnected, () => {
      this.#world.dispose();
    });
    networkManager?.addClient(this.#client).catch(debugError);
    this.#client.send("Runtime.enable").catch(debugError);
  }
  mainRealm() {
    return this.#world;
  }
  get client() {
    return this.#client;
  }
  async close() {
    switch (this.#targetType) {
      case TargetType.SERVICE_WORKER: {
        await this.client.connection()?.send("Target.closeTarget", {
          targetId: this.#id
        });
        await this.client.connection()?.send("Target.detachFromTarget", {
          sessionId: this.client.id()
        });
        break;
      }
      case TargetType.SHARED_WORKER: {
        await this.client.connection()?.send("Target.closeTarget", {
          targetId: this.#id
        });
        break;
      }
      default:
        await this.evaluate(() => {
          self.close();
        });
    }
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Page.js
var __addDisposableResource3 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources3 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
function convertConsoleMessageLevel(method) {
  switch (method) {
    case "warning":
      return "warn";
    default:
      return method;
  }
}
function convertSameSiteFromPuppeteerToCdp(sameSite) {
  switch (sameSite) {
    case "Strict":
    case "Lax":
    case "None":
      return sameSite;
    default:
      return void 0;
  }
}
var CdpPage = class _CdpPage extends Page {
  static async _create(client, target, defaultViewport) {
    const page = new _CdpPage(client, target);
    await page.#initialize();
    if (defaultViewport) {
      try {
        await page.setViewport(defaultViewport);
      } catch (err) {
        if (isErrorLike(err) && isTargetClosedError(err)) {
          debugError(err);
        } else {
          throw err;
        }
      }
    }
    return page;
  }
  #closed = false;
  #targetManager;
  #cdpBluetoothEmulation;
  #primaryTargetClient;
  #primaryTarget;
  #tabTargetClient;
  #tabTarget;
  #keyboard;
  #mouse;
  #touchscreen;
  #frameManager;
  #emulationManager;
  #tracing;
  #bindings = /* @__PURE__ */ new Map();
  #exposedFunctions = /* @__PURE__ */ new Map();
  #coverage;
  #viewport;
  #workers = /* @__PURE__ */ new Map();
  #fileChooserDeferreds = /* @__PURE__ */ new Set();
  #sessionCloseDeferred = Deferred.create();
  #serviceWorkerBypassed = false;
  #userDragInterceptionEnabled = false;
  constructor(client, target) {
    super();
    this.#primaryTargetClient = client;
    this.#tabTargetClient = client.parentSession();
    assert(this.#tabTargetClient, "Tab target session is not defined.");
    this.#tabTarget = this.#tabTargetClient.target();
    assert(this.#tabTarget, "Tab target is not defined.");
    this._tabId = this.#tabTarget._getTargetInfo().targetId;
    this.#primaryTarget = target;
    this.#targetManager = target._targetManager();
    this.#keyboard = new CdpKeyboard(client);
    this.#mouse = new CdpMouse(client, this.#keyboard);
    this.#touchscreen = new CdpTouchscreen(client, this.#keyboard);
    this.#frameManager = new FrameManager(client, this, this._timeoutSettings);
    this.#emulationManager = new EmulationManager(client);
    this.#tracing = new Tracing(client);
    this.#coverage = new Coverage(client);
    this.#viewport = null;
    this.#cdpBluetoothEmulation = new CdpBluetoothEmulation(this.#primaryTargetClient.connection());
    const frameManagerEmitter = new EventEmitter(this.#frameManager);
    frameManagerEmitter.on(FrameManagerEvent.FrameAttached, (frame) => {
      this.emit("frameattached", frame);
    });
    frameManagerEmitter.on(FrameManagerEvent.FrameDetached, (frame) => {
      this.emit("framedetached", frame);
    });
    frameManagerEmitter.on(FrameManagerEvent.FrameNavigated, (frame) => {
      this.emit("framenavigated", frame);
    });
    frameManagerEmitter.on(FrameManagerEvent.ConsoleApiCalled, ([world, event]) => {
      this.#onConsoleAPI(world, event);
    });
    frameManagerEmitter.on(FrameManagerEvent.BindingCalled, ([world, event]) => {
      void this.#onBindingCalled(world, event);
    });
    const networkManagerEmitter = new EventEmitter(this.#frameManager.networkManager);
    networkManagerEmitter.on(NetworkManagerEvent.Request, (request) => {
      this.emit("request", request);
    });
    networkManagerEmitter.on(NetworkManagerEvent.RequestServedFromCache, (request) => {
      this.emit("requestservedfromcache", request);
    });
    networkManagerEmitter.on(NetworkManagerEvent.Response, (response) => {
      this.emit("response", response);
    });
    networkManagerEmitter.on(NetworkManagerEvent.RequestFailed, (request) => {
      this.emit("requestfailed", request);
    });
    networkManagerEmitter.on(NetworkManagerEvent.RequestFinished, (request) => {
      this.emit("requestfinished", request);
    });
    this.#tabTargetClient.on(CDPSessionEvent.Swapped, this.#onActivation.bind(this));
    this.#tabTargetClient.on(CDPSessionEvent.Ready, this.#onSecondaryTarget.bind(this));
    this.#targetManager.on("targetGone", this.#onDetachedFromTarget);
    this.#tabTarget._isClosedDeferred.valueOrThrow().then(() => {
      this.#targetManager.off("targetGone", this.#onDetachedFromTarget);
      this.emit("close", void 0);
      this.#closed = true;
    }).catch(debugError);
    this.#setupPrimaryTargetListeners();
    this.#attachExistingTargets();
  }
  #attachExistingTargets() {
    const queue = [];
    for (const childTarget of this.#targetManager.getChildTargets(this.#primaryTarget)) {
      queue.push(childTarget);
    }
    let idx = 0;
    while (idx < queue.length) {
      const next = queue[idx];
      idx++;
      const session = next._session();
      if (session) {
        this.#onAttachedToTarget(session);
      }
      for (const childTarget of this.#targetManager.getChildTargets(next)) {
        queue.push(childTarget);
      }
    }
  }
  async #onActivation(newSession) {
    assert(newSession instanceof CdpCDPSession, "CDPSession is not instance of CdpCDPSession");
    this.#primaryTargetClient = newSession;
    this.#primaryTarget = newSession.target();
    assert(this.#primaryTarget, "Missing target on swap");
    this.#keyboard.updateClient(newSession);
    this.#mouse.updateClient(newSession);
    this.#touchscreen.updateClient(newSession);
    this.#emulationManager.updateClient(newSession);
    this.#tracing.updateClient(newSession);
    this.#coverage.updateClient(newSession);
    await this.#frameManager.swapFrameTree(newSession);
    this.#setupPrimaryTargetListeners();
  }
  async #onSecondaryTarget(session) {
    assert(session instanceof CdpCDPSession);
    if (session.target()._subtype() !== "prerender") {
      return;
    }
    this.#frameManager.registerSpeculativeSession(session).catch(debugError);
    this.#emulationManager.registerSpeculativeSession(session).catch(debugError);
  }
  /**
   * Sets up listeners for the primary target. The primary target can change
   * during a navigation to a prerended page.
   */
  #setupPrimaryTargetListeners() {
    const clientEmitter = new EventEmitter(this.#primaryTargetClient);
    clientEmitter.on(CDPSessionEvent.Ready, this.#onAttachedToTarget);
    clientEmitter.on(CDPSessionEvent.Disconnected, () => {
      this.#sessionCloseDeferred.reject(new TargetCloseError("Target closed"));
    });
    clientEmitter.on("Page.domContentEventFired", () => {
      this.emit("domcontentloaded", void 0);
    });
    clientEmitter.on("Page.loadEventFired", () => {
      this.emit("load", void 0);
    });
    clientEmitter.on("Page.javascriptDialogOpening", this.#onDialog.bind(this));
    clientEmitter.on("Runtime.exceptionThrown", this.#handleException.bind(this));
    clientEmitter.on("Inspector.targetCrashed", this.#onTargetCrashed.bind(this));
    clientEmitter.on("Performance.metrics", this.#emitMetrics.bind(this));
    clientEmitter.on("Log.entryAdded", this.#onLogEntryAdded.bind(this));
    clientEmitter.on("Page.fileChooserOpened", this.#onFileChooser.bind(this));
  }
  #onDetachedFromTarget = (target) => {
    const sessionId = target._session()?.id();
    const worker = this.#workers.get(sessionId);
    if (!worker) {
      return;
    }
    this.#workers.delete(sessionId);
    this.emit("workerdestroyed", worker);
  };
  #onAttachedToTarget = (session) => {
    assert(session instanceof CdpCDPSession);
    this.#frameManager.onAttachedToTarget(session.target());
    if (session.target()._getTargetInfo().type === "worker") {
      const worker = new CdpWebWorker(session, session.target().url(), session.target()._targetId, session.target().type(), this.#onConsoleAPI.bind(this), this.#handleException.bind(this), this.#frameManager.networkManager);
      this.#workers.set(session.id(), worker);
      this.emit("workercreated", worker);
    }
    session.on(CDPSessionEvent.Ready, this.#onAttachedToTarget);
  };
  async #initialize() {
    try {
      await Promise.all([
        this.#frameManager.initialize(this.#primaryTargetClient),
        this.#primaryTargetClient.send("Performance.enable"),
        this.#primaryTargetClient.send("Log.enable")
      ]);
    } catch (err) {
      if (isErrorLike(err) && isTargetClosedError(err)) {
        debugError(err);
      } else {
        throw err;
      }
    }
  }
  async resize(params) {
    const windowId = await this.windowId();
    await this.#primaryTargetClient.send("Browser.setContentsSize", {
      windowId: Number(windowId),
      width: params.contentWidth,
      height: params.contentHeight
    });
  }
  async windowId() {
    const { windowId } = await this.#primaryTargetClient.send("Browser.getWindowForTarget");
    return windowId.toString();
  }
  async #onFileChooser(event) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      if (!this.#fileChooserDeferreds.size) {
        return;
      }
      const frame = this.#frameManager.frame(event.frameId);
      assert(frame, "This should never happen.");
      const handle = __addDisposableResource3(env_1, await frame.worlds[MAIN_WORLD].adoptBackendNode(event.backendNodeId), false);
      const fileChooser = new FileChooser(handle.move(), event.mode !== "selectSingle");
      for (const promise of this.#fileChooserDeferreds) {
        promise.resolve(fileChooser);
      }
      this.#fileChooserDeferreds.clear();
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      __disposeResources3(env_1);
    }
  }
  _client() {
    return this.#primaryTargetClient;
  }
  isServiceWorkerBypassed() {
    return this.#serviceWorkerBypassed;
  }
  isDragInterceptionEnabled() {
    return this.#userDragInterceptionEnabled;
  }
  isJavaScriptEnabled() {
    return this.#emulationManager.javascriptEnabled;
  }
  async openDevTools() {
    const pageTargetId = this.target()._targetId;
    const browser = this.browser();
    const devtoolsPage = await browser._createDevToolsPage(pageTargetId);
    return devtoolsPage;
  }
  async hasDevTools() {
    const browser = this.browser();
    const targetId = await browser._hasDevToolsTarget(this.target()._targetId);
    return Boolean(targetId);
  }
  async waitForFileChooser(options = {}) {
    const needsEnable = this.#fileChooserDeferreds.size === 0;
    const { timeout: timeout2 = this._timeoutSettings.timeout() } = options;
    const deferred = Deferred.create({
      message: `Waiting for \`FileChooser\` failed: ${timeout2}ms exceeded`,
      timeout: timeout2
    });
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        deferred.reject(options.signal?.reason);
      }, { once: true });
    }
    this.#fileChooserDeferreds.add(deferred);
    let enablePromise;
    if (needsEnable) {
      enablePromise = this.#primaryTargetClient.send("Page.setInterceptFileChooserDialog", {
        enabled: true
      });
    }
    try {
      const [result] = await Promise.all([
        deferred.valueOrThrow(),
        enablePromise
      ]);
      return result;
    } catch (error) {
      this.#fileChooserDeferreds.delete(deferred);
      throw error;
    }
  }
  async setGeolocation(options) {
    return await this.#emulationManager.setGeolocation(options);
  }
  target() {
    return this.#primaryTarget;
  }
  browser() {
    return this.#primaryTarget.browser();
  }
  browserContext() {
    return this.#primaryTarget.browserContext();
  }
  #onTargetCrashed() {
    this.emit("error", new Error("Page crashed!"));
  }
  #onLogEntryAdded(event) {
    const { level, text, args, source, url, lineNumber, stackTrace } = event.entry;
    if (args) {
      args.map((arg) => {
        void releaseObject(this.#primaryTargetClient, arg);
      });
    }
    if (source !== "worker") {
      this.emit("console", new ConsoleMessage(convertConsoleMessageLevel(level), text, [], [{ url, lineNumber }], void 0, stackTrace, this.#primaryTarget._targetId));
    }
  }
  mainFrame() {
    return this.#frameManager.mainFrame();
  }
  get keyboard() {
    return this.#keyboard;
  }
  get touchscreen() {
    return this.#touchscreen;
  }
  get coverage() {
    return this.#coverage;
  }
  get tracing() {
    return this.#tracing;
  }
  frames() {
    return this.#frameManager.frames();
  }
  workers() {
    return Array.from(this.#workers.values());
  }
  async setRequestInterception(value) {
    return await this.#frameManager.networkManager.setRequestInterception(value);
  }
  async setBypassServiceWorker(bypass) {
    this.#serviceWorkerBypassed = bypass;
    return await this.#primaryTargetClient.send("Network.setBypassServiceWorker", { bypass });
  }
  async setDragInterception(enabled) {
    this.#userDragInterceptionEnabled = enabled;
    return await this.#primaryTargetClient.send("Input.setInterceptDrags", {
      enabled
    });
  }
  async setOfflineMode(enabled) {
    return await this.#frameManager.networkManager.setOfflineMode(enabled);
  }
  async emulateNetworkConditions(networkConditions) {
    return await this.#frameManager.networkManager.emulateNetworkConditions(networkConditions);
  }
  async emulateFocusedPage(enabled) {
    return await this.#emulationManager.emulateFocus(enabled);
  }
  setDefaultNavigationTimeout(timeout2) {
    this._timeoutSettings.setDefaultNavigationTimeout(timeout2);
  }
  setDefaultTimeout(timeout2) {
    this._timeoutSettings.setDefaultTimeout(timeout2);
  }
  getDefaultTimeout() {
    return this._timeoutSettings.timeout();
  }
  getDefaultNavigationTimeout() {
    return this._timeoutSettings.navigationTimeout();
  }
  async queryObjects(prototypeHandle) {
    assert(!prototypeHandle.disposed, "Prototype JSHandle is disposed!");
    assert(prototypeHandle.id, "Prototype JSHandle must not be referencing primitive value");
    const response = await this.mainFrame().client.send("Runtime.queryObjects", {
      prototypeObjectId: prototypeHandle.id
    });
    return this.mainFrame().mainRealm().createCdpHandle(response.objects);
  }
  async cookies(...urls) {
    const originalCookies = (await this.#primaryTargetClient.send("Network.getCookies", {
      urls: urls.length ? urls : [this.url()]
    })).cookies;
    const unsupportedCookieAttributes = ["sourcePort"];
    const filterUnsupportedAttributes = (cookie) => {
      for (const attr of unsupportedCookieAttributes) {
        delete cookie[attr];
      }
      return cookie;
    };
    return originalCookies.map(filterUnsupportedAttributes).map((cookie) => {
      return {
        ...cookie,
        // TODO: a breaking change is needed in Puppeteer types to support other
        // partition keys.
        partitionKey: cookie.partitionKey ? cookie.partitionKey.topLevelSite : void 0,
        // TODO: remove sameParty as it is removed from Chrome.
        sameParty: false
      };
    });
  }
  async deleteCookie(...cookies) {
    const pageURL = this.url();
    for (const cookie of cookies) {
      const item = {
        ...cookie,
        partitionKey: convertCookiesPartitionKeyFromPuppeteerToCdp(cookie.partitionKey)
      };
      if (!cookie.url && pageURL.startsWith("http")) {
        item.url = pageURL;
      }
      await this.#primaryTargetClient.send("Network.deleteCookies", item);
      if (pageURL.startsWith("http") && !item.partitionKey) {
        const url = new URL(pageURL);
        await this.#primaryTargetClient.send("Network.deleteCookies", {
          ...item,
          partitionKey: {
            topLevelSite: url.origin.replace(`:${url.port}`, ""),
            hasCrossSiteAncestor: false
          }
        });
      }
    }
  }
  async setCookie(...cookies) {
    const pageURL = this.url();
    const startsWithHTTP = pageURL.startsWith("http");
    const items = cookies.map((cookie) => {
      const item = Object.assign({}, cookie);
      if (!item.url && startsWithHTTP) {
        item.url = pageURL;
      }
      assert(item.url !== "about:blank", `Blank page can not have cookie "${item.name}"`);
      assert(!String.prototype.startsWith.call(item.url || "", "data:"), `Data URL page can not have cookie "${item.name}"`);
      return item;
    });
    await this.deleteCookie(...items);
    if (items.length) {
      await this.#primaryTargetClient.send("Network.setCookies", {
        cookies: items.map((cookieParam) => {
          return {
            ...cookieParam,
            partitionKey: convertCookiesPartitionKeyFromPuppeteerToCdp(cookieParam.partitionKey),
            sameSite: convertSameSiteFromPuppeteerToCdp(cookieParam.sameSite)
          };
        })
      });
    }
  }
  async exposeFunction(name, pptrFunction) {
    if (this.#bindings.has(name)) {
      throw new Error(`Failed to add page binding with name ${name}: window['${name}'] already exists!`);
    }
    const source = pageBindingInitString("exposedFun", name);
    let binding;
    switch (typeof pptrFunction) {
      case "function":
        binding = new Binding(name, pptrFunction, source);
        break;
      default:
        binding = new Binding(name, pptrFunction.default, source);
        break;
    }
    this.#bindings.set(name, binding);
    const [{ identifier }] = await Promise.all([
      this.#frameManager.evaluateOnNewDocument(source),
      this.#frameManager.addExposedFunctionBinding(binding)
    ]);
    this.#exposedFunctions.set(name, identifier);
  }
  async removeExposedFunction(name) {
    const exposedFunctionId = this.#exposedFunctions.get(name);
    if (!exposedFunctionId) {
      throw new Error(`Function with name "${name}" does not exist`);
    }
    const binding = this.#bindings.get(name);
    this.#exposedFunctions.delete(name);
    this.#bindings.delete(name);
    await Promise.all([
      this.#frameManager.removeScriptToEvaluateOnNewDocument(exposedFunctionId),
      this.#frameManager.removeExposedFunctionBinding(binding)
    ]);
  }
  async authenticate(credentials) {
    return await this.#frameManager.networkManager.authenticate(credentials);
  }
  async setExtraHTTPHeaders(headers) {
    return await this.#frameManager.networkManager.setExtraHTTPHeaders(headers);
  }
  async setUserAgent(userAgentOrOptions, userAgentMetadata) {
    if (typeof userAgentOrOptions === "string") {
      return await this.#frameManager.networkManager.setUserAgent(userAgentOrOptions, userAgentMetadata);
    } else {
      const userAgent = userAgentOrOptions.userAgent ?? await this.browser().userAgent();
      return await this.#frameManager.networkManager.setUserAgent(userAgent, userAgentOrOptions.userAgentMetadata, userAgentOrOptions.platform);
    }
  }
  async metrics() {
    const response = await this.#primaryTargetClient.send("Performance.getMetrics");
    return this.#buildMetricsObject(response.metrics);
  }
  async captureHeapSnapshot(options) {
    const { createWriteStream } = environment.value.fs;
    const stream = createWriteStream(options.path);
    const streamPromise = new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
    });
    const client = this.#primaryTargetClient;
    await client.send("HeapProfiler.enable");
    await client.send("HeapProfiler.collectGarbage");
    const handler = (event) => {
      stream.write(event.chunk);
    };
    client.on("HeapProfiler.addHeapSnapshotChunk", handler);
    try {
      await client.send("HeapProfiler.takeHeapSnapshot", {
        reportProgress: false
      });
    } finally {
      client.off("HeapProfiler.addHeapSnapshotChunk", handler);
      await client.send("HeapProfiler.disable");
    }
    stream.end();
    await streamPromise;
  }
  #emitMetrics(event) {
    this.emit("metrics", {
      title: event.title,
      metrics: this.#buildMetricsObject(event.metrics)
    });
  }
  #buildMetricsObject(metrics) {
    const result = {};
    for (const metric of metrics || []) {
      if (supportedMetrics.has(metric.name)) {
        result[metric.name] = metric.value;
      }
    }
    return result;
  }
  #handleException(exception) {
    this.emit("pageerror", createClientError(exception.exceptionDetails));
  }
  #onConsoleAPI(world, event) {
    const values = event.args.map((arg) => {
      return world.createCdpHandle(arg);
    });
    if (!this.listenerCount(
      "console"
      /* PageEvent.Console */
    )) {
      values.forEach((arg) => {
        return arg.dispose();
      });
      return;
    }
    const textTokens = [];
    for (const arg of values) {
      textTokens.push(valueFromJSHandle(arg));
    }
    const stackTraceLocations = [];
    if (event.stackTrace) {
      for (const callFrame of event.stackTrace.callFrames) {
        stackTraceLocations.push({
          url: callFrame.url,
          lineNumber: callFrame.lineNumber,
          columnNumber: callFrame.columnNumber
        });
      }
    }
    let targetId;
    if (world.environment.client instanceof CdpCDPSession) {
      targetId = world.environment.client.target()._targetId;
    }
    const message = new ConsoleMessage(convertConsoleMessageLevel(event.type), textTokens.join(" "), values, stackTraceLocations, void 0, event.stackTrace, targetId);
    this.emit("console", message);
  }
  async #onBindingCalled(world, event) {
    let payload;
    try {
      payload = JSON.parse(event.payload);
    } catch {
      return;
    }
    const { type, name, seq, args, isTrivial } = payload;
    if (type !== "exposedFun") {
      return;
    }
    const context = world.context;
    if (!context) {
      return;
    }
    const binding = this.#bindings.get(name);
    await binding?.run(context, seq, args, isTrivial);
  }
  #onDialog(event) {
    const type = validateDialogType(event.type);
    const dialog = new CdpDialog(this.#primaryTargetClient, type, event.message, event.defaultPrompt);
    this.emit("dialog", dialog);
  }
  async reload(options) {
    const [result] = await Promise.all([
      this.waitForNavigation({
        ...options,
        ignoreSameDocumentNavigation: true
      }),
      this.#primaryTargetClient.send("Page.reload", {
        ignoreCache: options?.ignoreCache ?? false
      })
    ]);
    return result;
  }
  async createCDPSession() {
    return await this.target().createCDPSession();
  }
  async goBack(options = {}) {
    return await this.#go(-1, options);
  }
  async goForward(options = {}) {
    return await this.#go(1, options);
  }
  async #go(delta, options) {
    const history = await this.#primaryTargetClient.send("Page.getNavigationHistory");
    const entry = history.entries[history.currentIndex + delta];
    if (!entry) {
      throw new Error("History entry to navigate to not found.");
    }
    const result = await Promise.all([
      this.waitForNavigation(options),
      this.#primaryTargetClient.send("Page.navigateToHistoryEntry", {
        entryId: entry.id
      })
    ]);
    return result[0];
  }
  async bringToFront() {
    await this.#primaryTargetClient.send("Page.bringToFront");
  }
  async setJavaScriptEnabled(enabled) {
    return await this.#emulationManager.setJavaScriptEnabled(enabled);
  }
  async setBypassCSP(enabled) {
    await this.#primaryTargetClient.send("Page.setBypassCSP", { enabled });
  }
  async emulateMediaType(type) {
    return await this.#emulationManager.emulateMediaType(type);
  }
  async emulateCPUThrottling(factor) {
    return await this.#emulationManager.emulateCPUThrottling(factor);
  }
  async emulateMediaFeatures(features) {
    return await this.#emulationManager.emulateMediaFeatures(features);
  }
  async emulateTimezone(timezoneId) {
    return await this.#emulationManager.emulateTimezone(timezoneId);
  }
  async emulateIdleState(overrides) {
    return await this.#emulationManager.emulateIdleState(overrides);
  }
  async emulateVisionDeficiency(type) {
    return await this.#emulationManager.emulateVisionDeficiency(type);
  }
  async setViewport(viewport) {
    const needsReload = await this.#emulationManager.emulateViewport(viewport);
    this.#viewport = viewport;
    if (needsReload) {
      await this.reload();
    }
  }
  viewport() {
    return this.#viewport;
  }
  async evaluateOnNewDocument(pageFunction, ...args) {
    const source = evaluationString(pageFunction, ...args);
    return await this.#frameManager.evaluateOnNewDocument(source);
  }
  async removeScriptToEvaluateOnNewDocument(identifier) {
    return await this.#frameManager.removeScriptToEvaluateOnNewDocument(identifier);
  }
  async setCacheEnabled(enabled = true) {
    await this.#frameManager.networkManager.setCacheEnabled(enabled);
  }
  async _screenshot(options) {
    const env_2 = { stack: [], error: void 0, hasError: false };
    try {
      const { fromSurface, omitBackground, optimizeForSpeed, quality, clip: userClip, type, captureBeyondViewport } = options;
      const stack = __addDisposableResource3(env_2, new AsyncDisposableStack(), true);
      if (omitBackground && (type === "png" || type === "webp")) {
        await this.#emulationManager.setTransparentBackgroundColor();
        stack.defer(async () => {
          await this.#emulationManager.resetDefaultBackgroundColor().catch(debugError);
        });
      }
      let clip = userClip;
      if (clip && !captureBeyondViewport) {
        const viewport = await this.mainFrame().isolatedRealm().evaluate(() => {
          const { height, pageLeft: x, pageTop: y, width } = window.visualViewport;
          return { x, y, height, width };
        });
        clip = getIntersectionRect(clip, viewport);
      }
      const { data } = await this.#primaryTargetClient.send("Page.captureScreenshot", {
        format: type,
        optimizeForSpeed,
        fromSurface,
        ...quality !== void 0 ? { quality: Math.round(quality) } : {},
        ...clip ? { clip: { ...clip, scale: clip.scale ?? 1 } } : {},
        captureBeyondViewport
      });
      return data;
    } catch (e_2) {
      env_2.error = e_2;
      env_2.hasError = true;
    } finally {
      const result_1 = __disposeResources3(env_2);
      if (result_1)
        await result_1;
    }
  }
  async createPDFStream(options = {}) {
    const { timeout: ms = this._timeoutSettings.timeout() } = options;
    const { landscape, displayHeaderFooter, headerTemplate, footerTemplate, printBackground, scale, width: paperWidth, height: paperHeight, margin, pageRanges, preferCSSPageSize, omitBackground, tagged: generateTaggedPDF, outline: generateDocumentOutline, waitForFonts } = parsePDFOptions(options);
    if (omitBackground) {
      await this.#emulationManager.setTransparentBackgroundColor();
    }
    if (waitForFonts) {
      await firstValueFrom(from(this.mainFrame().isolatedRealm().evaluate(() => {
        return document.fonts.ready;
      })).pipe(raceWith(timeout(ms))));
    }
    const printCommandPromise = this.#primaryTargetClient.send("Page.printToPDF", {
      transferMode: "ReturnAsStream",
      landscape,
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
      printBackground,
      scale,
      paperWidth,
      paperHeight,
      marginTop: margin.top,
      marginBottom: margin.bottom,
      marginLeft: margin.left,
      marginRight: margin.right,
      pageRanges,
      preferCSSPageSize,
      generateTaggedPDF,
      generateDocumentOutline
    });
    const result = await firstValueFrom(from(printCommandPromise).pipe(raceWith(timeout(ms))));
    if (omitBackground) {
      await this.#emulationManager.resetDefaultBackgroundColor();
    }
    assert(result.stream, "`stream` is missing from `Page.printToPDF");
    return await getReadableFromProtocolStream(this.#primaryTargetClient, result.stream);
  }
  async pdf(options = {}) {
    const { path: path4 = void 0 } = options;
    const readable = await this.createPDFStream(options);
    const typedArray = await getReadableAsTypedArray(readable, path4);
    assert(typedArray, "Could not create typed array");
    return typedArray;
  }
  async close(options = { runBeforeUnload: void 0 }) {
    const env_3 = { stack: [], error: void 0, hasError: false };
    try {
      const _guard = __addDisposableResource3(env_3, await this.browserContext().waitForScreenshotOperations(), false);
      const connection = this.#primaryTargetClient.connection();
      assert(connection, "Connection closed. Most likely the page has been closed.");
      const runBeforeUnload = !!options.runBeforeUnload;
      if (runBeforeUnload) {
        await this.#primaryTargetClient.send("Page.close");
      } else {
        await connection.send("Target.closeTarget", {
          targetId: this.#primaryTarget._targetId
        });
        await this.#tabTarget._isClosedDeferred.valueOrThrow();
      }
    } catch (e_3) {
      env_3.error = e_3;
      env_3.hasError = true;
    } finally {
      __disposeResources3(env_3);
    }
  }
  isClosed() {
    return this.#closed;
  }
  get mouse() {
    return this.#mouse;
  }
  /**
   * This method is typically coupled with an action that triggers a device
   * request from an api such as WebBluetooth.
   *
   * :::caution
   *
   * This must be called before the device request is made. It will not return a
   * currently active device prompt.
   *
   * :::
   *
   * @example
   *
   * ```ts
   * const [devicePrompt] = Promise.all([
   *   page.waitForDevicePrompt(),
   *   page.click('#connect-bluetooth'),
   * ]);
   * await devicePrompt.select(
   *   await devicePrompt.waitForDevice(({name}) => name.includes('My Device')),
   * );
   * ```
   */
  async waitForDevicePrompt(options = {}) {
    return await this.mainFrame().waitForDevicePrompt(options);
  }
  get bluetooth() {
    return this.#cdpBluetoothEmulation;
  }
};
var supportedMetrics = /* @__PURE__ */ new Set([
  "Timestamp",
  "Documents",
  "Frames",
  "JSEventListeners",
  "Nodes",
  "LayoutCount",
  "RecalcStyleCount",
  "LayoutDuration",
  "RecalcStyleDuration",
  "ScriptDuration",
  "TaskDuration",
  "JSHeapUsedSize",
  "JSHeapTotalSize"
]);
function getIntersectionRect(clip, viewport) {
  const x = Math.max(clip.x, viewport.x);
  const y = Math.max(clip.y, viewport.y);
  return {
    x,
    y,
    width: Math.max(Math.min(clip.x + clip.width, viewport.x + viewport.width) - x, 0),
    height: Math.max(Math.min(clip.y + clip.height, viewport.y + viewport.height) - y, 0)
  };
}
function convertCookiesPartitionKeyFromPuppeteerToCdp(partitionKey) {
  if (partitionKey === void 0) {
    return void 0;
  }
  if (typeof partitionKey === "string") {
    return {
      topLevelSite: partitionKey,
      hasCrossSiteAncestor: false
    };
  }
  return {
    topLevelSite: partitionKey.sourceOrigin,
    hasCrossSiteAncestor: partitionKey.hasCrossSiteAncestor ?? false
  };
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/BrowserContext.js
var __addDisposableResource4 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources4 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var CdpBrowserContext = class extends BrowserContext {
  #connection;
  #browser;
  #id;
  constructor(connection, browser, contextId) {
    super();
    this.#connection = connection;
    this.#browser = browser;
    this.#id = contextId;
  }
  get id() {
    return this.#id;
  }
  targets() {
    return this.#browser.targets().filter((target) => {
      return target.browserContext() === this;
    });
  }
  async pages(includeAll = false) {
    const pages = await Promise.all(this.targets().filter((target) => {
      return target.type() === "page" || (target.type() === "other" || includeAll) && this.#browser._getIsPageTargetCallback()?.(target);
    }).map((target) => {
      return target.page();
    }));
    return pages.filter((page) => {
      return !!page;
    });
  }
  async overridePermissions(origin, permissions) {
    const protocolPermissions = permissions.map((permission) => {
      const protocolPermission = WEB_PERMISSION_TO_PROTOCOL_PERMISSION.get(permission);
      if (!protocolPermission) {
        throw new Error("Unknown permission: " + permission);
      }
      return protocolPermission;
    });
    await this.#connection.send("Browser.grantPermissions", {
      origin,
      browserContextId: this.#id || void 0,
      permissions: protocolPermissions
    });
  }
  async setPermission(origin, ...permissions) {
    await Promise.all(permissions.map(async (permission) => {
      const protocolPermission = {
        name: permission.permission.name,
        userVisibleOnly: permission.permission.userVisibleOnly,
        sysex: permission.permission.sysex,
        allowWithoutSanitization: permission.permission.allowWithoutSanitization,
        panTiltZoom: permission.permission.panTiltZoom
      };
      await this.#connection.send("Browser.setPermission", {
        origin: origin === "*" ? void 0 : origin,
        browserContextId: this.#id || void 0,
        permission: protocolPermission,
        setting: permission.state
      });
    }));
  }
  async clearPermissionOverrides() {
    await this.#connection.send("Browser.resetPermissions", {
      browserContextId: this.#id || void 0
    });
  }
  async newPage(options) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      const _guard = __addDisposableResource4(env_1, await this.waitForScreenshotOperations(), false);
      return await this.#browser._createPageInContext(this.#id, options);
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      __disposeResources4(env_1);
    }
  }
  browser() {
    return this.#browser;
  }
  async close() {
    assert(this.#id, "Default BrowserContext cannot be closed!");
    await this.#browser._disposeContext(this.#id);
  }
  async cookies() {
    const { cookies } = await this.#connection.send("Storage.getCookies", {
      browserContextId: this.#id
    });
    return cookies.map((cookie) => {
      return {
        ...cookie,
        partitionKey: cookie.partitionKey ? {
          sourceOrigin: cookie.partitionKey.topLevelSite,
          hasCrossSiteAncestor: cookie.partitionKey.hasCrossSiteAncestor
        } : void 0,
        // TODO: remove sameParty as it is removed from Chrome.
        sameParty: false
      };
    });
  }
  async setCookie(...cookies) {
    return await this.#connection.send("Storage.setCookies", {
      browserContextId: this.#id,
      cookies: cookies.map((cookie) => {
        return {
          ...cookie,
          partitionKey: convertCookiesPartitionKeyFromPuppeteerToCdp(cookie.partitionKey),
          sameSite: convertSameSiteFromPuppeteerToCdp(cookie.sameSite)
        };
      })
    });
  }
  async setDownloadBehavior(downloadBehavior) {
    await this.#connection.send("Browser.setDownloadBehavior", {
      behavior: downloadBehavior.policy,
      downloadPath: downloadBehavior.downloadPath,
      browserContextId: this.#id
    });
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Target.js
var InitializationStatus;
(function(InitializationStatus2) {
  InitializationStatus2["SUCCESS"] = "success";
  InitializationStatus2["ABORTED"] = "aborted";
})(InitializationStatus || (InitializationStatus = {}));
var CdpTarget = class extends Target {
  #browserContext;
  #session;
  #targetInfo;
  #targetManager;
  #sessionFactory;
  #childTargets = /* @__PURE__ */ new Set();
  _initializedDeferred = Deferred.create();
  _isClosedDeferred = Deferred.create();
  _targetId;
  /**
   * To initialize the target for use, call initialize.
   *
   * @internal
   */
  constructor(targetInfo, session, browserContext, targetManager, sessionFactory) {
    super();
    this.#session = session;
    this.#targetManager = targetManager;
    this.#targetInfo = targetInfo;
    this.#browserContext = browserContext;
    this._targetId = targetInfo.targetId;
    this.#sessionFactory = sessionFactory;
    if (this.#session) {
      this.#session.setTarget(this);
    }
  }
  async asPage() {
    const session = this._session();
    if (!session) {
      return await this.createCDPSession().then((client) => {
        return CdpPage._create(client, this, null);
      });
    }
    return await CdpPage._create(session, this, null);
  }
  _subtype() {
    return this.#targetInfo.subtype;
  }
  _session() {
    return this.#session;
  }
  _addChildTarget(target) {
    this.#childTargets.add(target);
  }
  _removeChildTarget(target) {
    this.#childTargets.delete(target);
  }
  _childTargets() {
    return this.#childTargets;
  }
  _sessionFactory() {
    if (!this.#sessionFactory) {
      throw new Error("sessionFactory is not initialized");
    }
    return this.#sessionFactory;
  }
  createCDPSession() {
    if (!this.#sessionFactory) {
      throw new Error("sessionFactory is not initialized");
    }
    return this.#sessionFactory(false).then((session) => {
      session.setTarget(this);
      return session;
    });
  }
  url() {
    return this.#targetInfo.url;
  }
  type() {
    const type = this.#targetInfo.type;
    switch (type) {
      case "page":
        return TargetType.PAGE;
      case "background_page":
        return TargetType.BACKGROUND_PAGE;
      case "service_worker":
        return TargetType.SERVICE_WORKER;
      case "shared_worker":
        return TargetType.SHARED_WORKER;
      case "browser":
        return TargetType.BROWSER;
      case "webview":
        return TargetType.WEBVIEW;
      case "tab":
        return TargetType.TAB;
      default:
        return TargetType.OTHER;
    }
  }
  _targetManager() {
    if (!this.#targetManager) {
      throw new Error("targetManager is not initialized");
    }
    return this.#targetManager;
  }
  _getTargetInfo() {
    return this.#targetInfo;
  }
  browser() {
    if (!this.#browserContext) {
      throw new Error("browserContext is not initialized");
    }
    return this.#browserContext.browser();
  }
  browserContext() {
    if (!this.#browserContext) {
      throw new Error("browserContext is not initialized");
    }
    return this.#browserContext;
  }
  opener() {
    const { openerId } = this.#targetInfo;
    if (!openerId) {
      return;
    }
    return this.browser().targets().find((target) => {
      return target._targetId === openerId;
    });
  }
  _targetInfoChanged(targetInfo) {
    this.#targetInfo = targetInfo;
    this._checkIfInitialized();
  }
  _initialize() {
    this._initializedDeferred.resolve(InitializationStatus.SUCCESS);
  }
  _isTargetExposed() {
    return this.type() !== TargetType.TAB && !this._subtype();
  }
  _checkIfInitialized() {
    if (!this._initializedDeferred.resolved()) {
      this._initializedDeferred.resolve(InitializationStatus.SUCCESS);
    }
  }
};
var PageTarget = class _PageTarget extends CdpTarget {
  #defaultViewport;
  pagePromise;
  constructor(targetInfo, session, browserContext, targetManager, sessionFactory, defaultViewport) {
    super(targetInfo, session, browserContext, targetManager, sessionFactory);
    this.#defaultViewport = defaultViewport ?? void 0;
  }
  _initialize() {
    this._initializedDeferred.valueOrThrow().then(async (result) => {
      if (result === InitializationStatus.ABORTED) {
        return;
      }
      const opener = this.opener();
      if (!(opener instanceof _PageTarget)) {
        return;
      }
      if (!opener || !opener.pagePromise || this.type() !== "page") {
        return true;
      }
      const openerPage = await opener.pagePromise;
      if (!openerPage.listenerCount(
        "popup"
        /* PageEvent.Popup */
      )) {
        return true;
      }
      const popupPage = await this.page();
      openerPage.emit("popup", popupPage);
      return true;
    }).catch(debugError);
    this._checkIfInitialized();
  }
  async page() {
    if (!this.pagePromise) {
      const session = this._session();
      this.pagePromise = (session ? Promise.resolve(session) : this._sessionFactory()(
        /* isAutoAttachEmulated=*/
        false
      )).then((client) => {
        return CdpPage._create(client, this, this.#defaultViewport ?? null);
      });
    }
    return await this.pagePromise ?? null;
  }
  _checkIfInitialized() {
    if (this._initializedDeferred.resolved()) {
      return;
    }
    if (this._getTargetInfo().url !== "") {
      this._initializedDeferred.resolve(InitializationStatus.SUCCESS);
    }
  }
};
var DevToolsTarget = class extends PageTarget {
};
var WorkerTarget = class extends CdpTarget {
  #workerPromise;
  async worker() {
    if (!this.#workerPromise) {
      const session = this._session();
      this.#workerPromise = (session ? Promise.resolve(session) : this._sessionFactory()(
        /* isAutoAttachEmulated=*/
        false
      )).then((client) => {
        return new CdpWebWorker(
          client,
          this._getTargetInfo().url,
          this._targetId,
          this.type(),
          () => {
          },
          () => {
          },
          void 0
          /* networkManager */
        );
      });
    }
    return await this.#workerPromise;
  }
};
var OtherTarget = class extends CdpTarget {
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/TargetManager.js
function isPageTargetBecomingPrimary(target, newTargetInfo) {
  return Boolean(target._subtype()) && !newTargetInfo.subtype;
}
var TargetManager = class extends EventEmitter {
  #connection;
  /**
   * Keeps track of the following events: 'Target.targetCreated',
   * 'Target.targetDestroyed', 'Target.targetInfoChanged'.
   *
   * A target becomes discovered when 'Target.targetCreated' is received.
   * A target is removed from this map once 'Target.targetDestroyed' is
   * received.
   *
   * `targetFilterCallback` has no effect on this map.
   */
  #discoveredTargetsByTargetId = /* @__PURE__ */ new Map();
  /**
   * A target is added to this map once TargetManager has created
   * a Target and attached at least once to it.
   */
  #attachedTargetsByTargetId = /* @__PURE__ */ new Map();
  /**
   * Tracks which sessions attach to which target.
   */
  #attachedTargetsBySessionId = /* @__PURE__ */ new Map();
  /**
   * If a target was filtered out by `targetFilterCallback`, we still receive
   * events about it from CDP, but we don't forward them to the rest of Puppeteer.
   */
  #ignoredTargets = /* @__PURE__ */ new Set();
  #targetFilterCallback;
  #targetFactory;
  #attachedToTargetListenersBySession = /* @__PURE__ */ new WeakMap();
  #detachedFromTargetListenersBySession = /* @__PURE__ */ new WeakMap();
  #initializeDeferred = Deferred.create();
  #waitForInitiallyDiscoveredTargets = true;
  #discoveryFilter = [{}];
  // IDs of tab targets detected while running the initial Target.setAutoAttach
  // request. These are the targets whose initialization we want to await for
  // before resolving puppeteer.connect() or launch() to avoid flakiness.
  // Whenever a sub-target whose parent is a tab target is attached, we remove
  // the tab target from this list. Once the list is empty, we resolve the
  // initializeDeferred.
  #targetsIdsForInit = /* @__PURE__ */ new Set();
  // This is false until the connection-level Target.setAutoAttach request is
  // done. It indicates whethere we are running the initial auto-attach step or
  // if we are handling targets after that.
  #initialAttachDone = false;
  constructor(connection, targetFactory, targetFilterCallback, waitForInitiallyDiscoveredTargets = true) {
    super();
    this.#connection = connection;
    this.#targetFilterCallback = targetFilterCallback;
    this.#targetFactory = targetFactory;
    this.#waitForInitiallyDiscoveredTargets = waitForInitiallyDiscoveredTargets;
    this.#connection.on("Target.targetCreated", this.#onTargetCreated);
    this.#connection.on("Target.targetDestroyed", this.#onTargetDestroyed);
    this.#connection.on("Target.targetInfoChanged", this.#onTargetInfoChanged);
    this.#connection.on(CDPSessionEvent.SessionDetached, this.#onSessionDetached);
    this.#setupAttachmentListeners(this.#connection);
  }
  async initialize() {
    await this.#connection.send("Target.setDiscoverTargets", {
      discover: true,
      filter: this.#discoveryFilter
    });
    await this.#connection.send("Target.setAutoAttach", {
      waitForDebuggerOnStart: true,
      flatten: true,
      autoAttach: true,
      filter: [
        {
          type: "page",
          exclude: true
        },
        ...this.#discoveryFilter
      ]
    });
    this.#initialAttachDone = true;
    this.#finishInitializationIfReady();
    await this.#initializeDeferred.valueOrThrow();
  }
  getChildTargets(target) {
    return target._childTargets();
  }
  dispose() {
    this.#connection.off("Target.targetCreated", this.#onTargetCreated);
    this.#connection.off("Target.targetDestroyed", this.#onTargetDestroyed);
    this.#connection.off("Target.targetInfoChanged", this.#onTargetInfoChanged);
    this.#connection.off(CDPSessionEvent.SessionDetached, this.#onSessionDetached);
    this.#removeAttachmentListeners(this.#connection);
  }
  getAvailableTargets() {
    return this.#attachedTargetsByTargetId;
  }
  #setupAttachmentListeners(session) {
    const listener = (event) => {
      void this.#onAttachedToTarget(session, event);
    };
    assert(!this.#attachedToTargetListenersBySession.has(session));
    this.#attachedToTargetListenersBySession.set(session, listener);
    session.on("Target.attachedToTarget", listener);
    const detachedListener = (event) => {
      return this.#onDetachedFromTarget(session, event);
    };
    assert(!this.#detachedFromTargetListenersBySession.has(session));
    this.#detachedFromTargetListenersBySession.set(session, detachedListener);
    session.on("Target.detachedFromTarget", detachedListener);
  }
  #removeAttachmentListeners(session) {
    const listener = this.#attachedToTargetListenersBySession.get(session);
    if (listener) {
      session.off("Target.attachedToTarget", listener);
      this.#attachedToTargetListenersBySession.delete(session);
    }
    const detachedListener = this.#detachedFromTargetListenersBySession.get(session);
    if (detachedListener) {
      session.off("Target.detachedFromTarget", detachedListener);
      this.#detachedFromTargetListenersBySession.delete(session);
    }
  }
  #silentDetach = async (session, parentSession) => {
    await session.send("Runtime.runIfWaitingForDebugger").catch(debugError);
    await parentSession.send("Target.detachFromTarget", {
      sessionId: session.id()
    }).catch(debugError);
  };
  #getParentTarget = (parentSession) => {
    return parentSession instanceof CdpCDPSession ? parentSession.target() : null;
  };
  #onSessionDetached = (session) => {
    this.#removeAttachmentListeners(session);
  };
  #onTargetCreated = async (event) => {
    this.#discoveredTargetsByTargetId.set(event.targetInfo.targetId, event.targetInfo);
    this.emit("targetDiscovered", event.targetInfo);
    if (event.targetInfo.type === "browser" && event.targetInfo.attached) {
      if (this.#attachedTargetsByTargetId.has(event.targetInfo.targetId)) {
        return;
      }
      const target = this.#targetFactory(event.targetInfo, void 0);
      target._initialize();
      this.#attachedTargetsByTargetId.set(event.targetInfo.targetId, target);
    }
  };
  #onTargetDestroyed = (event) => {
    const targetInfo = this.#discoveredTargetsByTargetId.get(event.targetId);
    this.#discoveredTargetsByTargetId.delete(event.targetId);
    this.#finishInitializationIfReady(event.targetId);
    if (targetInfo?.type === "service_worker") {
      const target = this.#attachedTargetsByTargetId.get(event.targetId);
      if (target) {
        this.emit("targetGone", target);
        this.#attachedTargetsByTargetId.delete(event.targetId);
      }
    }
  };
  #onTargetInfoChanged = (event) => {
    this.#discoveredTargetsByTargetId.set(event.targetInfo.targetId, event.targetInfo);
    if (this.#ignoredTargets.has(event.targetInfo.targetId) || !event.targetInfo.attached) {
      return;
    }
    const target = this.#attachedTargetsByTargetId.get(event.targetInfo.targetId);
    if (!target) {
      return;
    }
    const previousURL = target.url();
    const wasInitialized = target._initializedDeferred.value() === InitializationStatus.SUCCESS;
    if (isPageTargetBecomingPrimary(target, event.targetInfo)) {
      const session = target._session();
      assert(session, "Target that is being activated is missing a CDPSession.");
      session.parentSession()?.emit(CDPSessionEvent.Swapped, session);
    }
    target._targetInfoChanged(event.targetInfo);
    if (wasInitialized && previousURL !== target.url()) {
      this.emit("targetChanged", {
        target,
        wasInitialized,
        previousURL
      });
    }
  };
  #onAttachedToTarget = async (parentSession, event) => {
    const targetInfo = event.targetInfo;
    const session = this.#connection._session(event.sessionId);
    if (!session) {
      throw new Error(`Session ${event.sessionId} was not created.`);
    }
    if (!this.#connection.isAutoAttached(targetInfo.targetId)) {
      return;
    }
    if (targetInfo.type === "service_worker") {
      await this.#silentDetach(session, parentSession);
      if (this.#attachedTargetsByTargetId.has(targetInfo.targetId)) {
        return;
      }
      const target2 = this.#targetFactory(targetInfo);
      target2._initialize();
      this.#attachedTargetsByTargetId.set(targetInfo.targetId, target2);
      this.emit("targetAvailable", target2);
      return;
    }
    let target = this.#attachedTargetsByTargetId.get(targetInfo.targetId);
    const isExistingTarget = target !== void 0;
    if (!target) {
      target = this.#targetFactory(targetInfo, session, parentSession instanceof CdpCDPSession ? parentSession : void 0);
    }
    const parentTarget = this.#getParentTarget(parentSession);
    if (this.#targetFilterCallback && !this.#targetFilterCallback(target)) {
      this.#ignoredTargets.add(targetInfo.targetId);
      if (parentTarget?.type() === "tab") {
        this.#finishInitializationIfReady(parentTarget._targetId);
      }
      await this.#silentDetach(session, parentSession);
      return;
    }
    if (this.#waitForInitiallyDiscoveredTargets && event.targetInfo.type === "tab" && !this.#initialAttachDone) {
      this.#targetsIdsForInit.add(event.targetInfo.targetId);
    }
    this.#setupAttachmentListeners(session);
    if (isExistingTarget) {
      session.setTarget(target);
      this.#attachedTargetsBySessionId.set(session.id(), target);
    } else {
      target._initialize();
      this.#attachedTargetsByTargetId.set(targetInfo.targetId, target);
      this.#attachedTargetsBySessionId.set(session.id(), target);
    }
    parentTarget?._addChildTarget(target);
    parentSession.emit(CDPSessionEvent.Ready, session);
    if (!isExistingTarget) {
      this.emit("targetAvailable", target);
    }
    if (parentTarget?.type() === "tab") {
      this.#finishInitializationIfReady(parentTarget._targetId);
    }
    await Promise.all([
      session.send("Target.setAutoAttach", {
        waitForDebuggerOnStart: true,
        flatten: true,
        autoAttach: true,
        filter: this.#discoveryFilter
      }),
      session.send("Runtime.runIfWaitingForDebugger")
    ]).catch(debugError);
  };
  #finishInitializationIfReady(targetId) {
    if (targetId !== void 0) {
      this.#targetsIdsForInit.delete(targetId);
    }
    if (!this.#initialAttachDone) {
      return;
    }
    if (this.#targetsIdsForInit.size === 0) {
      this.#initializeDeferred.resolve();
    }
  }
  #onDetachedFromTarget = (parentSession, event) => {
    const target = this.#attachedTargetsBySessionId.get(event.sessionId);
    this.#attachedTargetsBySessionId.delete(event.sessionId);
    if (!target) {
      return;
    }
    if (parentSession instanceof CdpCDPSession) {
      parentSession.target()._removeChildTarget(target);
    }
    this.#attachedTargetsByTargetId.delete(target._targetId);
    this.emit("targetGone", target);
  };
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/Browser.js
function isDevToolsPageTarget(url) {
  return url.startsWith("devtools://devtools/bundled/devtools_app.html");
}
var CdpBrowser = class _CdpBrowser extends Browser {
  protocol = "cdp";
  static async _create(connection, contextIds, acceptInsecureCerts, defaultViewport, downloadBehavior, process2, closeCallback, targetFilterCallback, isPageTargetCallback, waitForInitiallyDiscoveredTargets = true, networkEnabled = true, handleDevToolsAsPage = false) {
    const browser = new _CdpBrowser(connection, contextIds, defaultViewport, process2, closeCallback, targetFilterCallback, isPageTargetCallback, waitForInitiallyDiscoveredTargets, networkEnabled, handleDevToolsAsPage);
    if (acceptInsecureCerts) {
      await connection.send("Security.setIgnoreCertificateErrors", {
        ignore: true
      });
    }
    await browser._attach(downloadBehavior);
    return browser;
  }
  #defaultViewport;
  #process;
  #connection;
  #closeCallback;
  #targetFilterCallback;
  #isPageTargetCallback;
  #defaultContext;
  #contexts = /* @__PURE__ */ new Map();
  #networkEnabled = true;
  #targetManager;
  #handleDevToolsAsPage = false;
  constructor(connection, contextIds, defaultViewport, process2, closeCallback, targetFilterCallback, isPageTargetCallback, waitForInitiallyDiscoveredTargets = true, networkEnabled = true, handleDevToolsAsPage = false) {
    super();
    this.#networkEnabled = networkEnabled;
    this.#defaultViewport = defaultViewport;
    this.#process = process2;
    this.#connection = connection;
    this.#closeCallback = closeCallback || (() => {
    });
    this.#targetFilterCallback = targetFilterCallback || (() => {
      return true;
    });
    this.#handleDevToolsAsPage = handleDevToolsAsPage;
    this.#setIsPageTargetCallback(isPageTargetCallback);
    this.#targetManager = new TargetManager(connection, this.#createTarget, this.#targetFilterCallback, waitForInitiallyDiscoveredTargets);
    this.#defaultContext = new CdpBrowserContext(this.#connection, this);
    for (const contextId of contextIds) {
      this.#contexts.set(contextId, new CdpBrowserContext(this.#connection, this, contextId));
    }
  }
  #emitDisconnected = () => {
    this.emit("disconnected", void 0);
  };
  async _attach(downloadBehavior) {
    this.#connection.on(CDPSessionEvent.Disconnected, this.#emitDisconnected);
    if (downloadBehavior) {
      await this.#defaultContext.setDownloadBehavior(downloadBehavior);
    }
    this.#targetManager.on("targetAvailable", this.#onAttachedToTarget);
    this.#targetManager.on("targetGone", this.#onDetachedFromTarget);
    this.#targetManager.on("targetChanged", this.#onTargetChanged);
    this.#targetManager.on("targetDiscovered", this.#onTargetDiscovered);
    await this.#targetManager.initialize();
  }
  _detach() {
    this.#connection.off(CDPSessionEvent.Disconnected, this.#emitDisconnected);
    this.#targetManager.off("targetAvailable", this.#onAttachedToTarget);
    this.#targetManager.off("targetGone", this.#onDetachedFromTarget);
    this.#targetManager.off("targetChanged", this.#onTargetChanged);
    this.#targetManager.off("targetDiscovered", this.#onTargetDiscovered);
  }
  process() {
    return this.#process ?? null;
  }
  _targetManager() {
    return this.#targetManager;
  }
  #setIsPageTargetCallback(isPageTargetCallback) {
    this.#isPageTargetCallback = isPageTargetCallback || ((target) => {
      return target.type() === "page" || target.type() === "background_page" || target.type() === "webview" || this.#handleDevToolsAsPage && target.type() === "other" && isDevToolsPageTarget(target.url());
    });
  }
  _getIsPageTargetCallback() {
    return this.#isPageTargetCallback;
  }
  async createBrowserContext(options = {}) {
    const { proxyServer, proxyBypassList, downloadBehavior } = options;
    const { browserContextId } = await this.#connection.send("Target.createBrowserContext", {
      proxyServer,
      proxyBypassList: proxyBypassList && proxyBypassList.join(",")
    });
    const context = new CdpBrowserContext(this.#connection, this, browserContextId);
    if (downloadBehavior) {
      await context.setDownloadBehavior(downloadBehavior);
    }
    this.#contexts.set(browserContextId, context);
    return context;
  }
  browserContexts() {
    return [this.#defaultContext, ...Array.from(this.#contexts.values())];
  }
  defaultBrowserContext() {
    return this.#defaultContext;
  }
  async _disposeContext(contextId) {
    if (!contextId) {
      return;
    }
    await this.#connection.send("Target.disposeBrowserContext", {
      browserContextId: contextId
    });
    this.#contexts.delete(contextId);
  }
  #createTarget = (targetInfo, session) => {
    const { browserContextId } = targetInfo;
    const context = browserContextId && this.#contexts.has(browserContextId) ? this.#contexts.get(browserContextId) : this.#defaultContext;
    if (!context) {
      throw new Error("Missing browser context");
    }
    const createSession = (isAutoAttachEmulated) => {
      return this.#connection._createSession(targetInfo, isAutoAttachEmulated);
    };
    const otherTarget = new OtherTarget(targetInfo, session, context, this.#targetManager, createSession);
    if (targetInfo.url && isDevToolsPageTarget(targetInfo.url)) {
      return new DevToolsTarget(targetInfo, session, context, this.#targetManager, createSession, this.#defaultViewport ?? null);
    }
    if (this.#isPageTargetCallback(otherTarget)) {
      return new PageTarget(targetInfo, session, context, this.#targetManager, createSession, this.#defaultViewport ?? null);
    }
    if (targetInfo.type === "service_worker" || targetInfo.type === "shared_worker") {
      return new WorkerTarget(targetInfo, session, context, this.#targetManager, createSession);
    }
    return otherTarget;
  };
  #onAttachedToTarget = async (target) => {
    if (target._isTargetExposed() && await target._initializedDeferred.valueOrThrow() === InitializationStatus.SUCCESS) {
      this.emit("targetcreated", target);
      target.browserContext().emit("targetcreated", target);
    }
  };
  #onDetachedFromTarget = async (target) => {
    target._initializedDeferred.resolve(InitializationStatus.ABORTED);
    target._isClosedDeferred.resolve();
    if (target._isTargetExposed() && await target._initializedDeferred.valueOrThrow() === InitializationStatus.SUCCESS) {
      this.emit("targetdestroyed", target);
      target.browserContext().emit("targetdestroyed", target);
    }
  };
  #onTargetChanged = ({ target }) => {
    this.emit("targetchanged", target);
    target.browserContext().emit("targetchanged", target);
  };
  #onTargetDiscovered = (targetInfo) => {
    this.emit("targetdiscovered", targetInfo);
  };
  wsEndpoint() {
    return this.#connection.url();
  }
  async newPage(options) {
    return await this.#defaultContext.newPage(options);
  }
  async _createPageInContext(contextId, options) {
    const hasTargets = this.targets().filter((t) => {
      return t.browserContext().id === contextId;
    }).length > 0;
    const windowBounds = options?.type === "window" ? options.windowBounds : void 0;
    const { targetId } = await this.#connection.send("Target.createTarget", {
      url: "about:blank",
      browserContextId: contextId || void 0,
      left: windowBounds?.left,
      top: windowBounds?.top,
      width: windowBounds?.width,
      height: windowBounds?.height,
      windowState: windowBounds?.windowState,
      // Works around crbug.com/454825274.
      newWindow: hasTargets && options?.type === "window" ? true : void 0,
      background: options?.background
    });
    const target = await this.waitForTarget((t) => {
      return t._targetId === targetId;
    });
    if (!target) {
      throw new Error(`Missing target for page (id = ${targetId})`);
    }
    const initialized = await target._initializedDeferred.valueOrThrow() === InitializationStatus.SUCCESS;
    if (!initialized) {
      throw new Error(`Failed to create target for page (id = ${targetId})`);
    }
    const page = await target.page();
    if (!page) {
      throw new Error(`Failed to create a page for context (id = ${contextId})`);
    }
    return page;
  }
  async _createDevToolsPage(pageTargetId) {
    const openDevToolsResponse = await this.#connection.send("Target.openDevTools", {
      targetId: pageTargetId
    });
    const target = await this.waitForTarget((t) => {
      return t._targetId === openDevToolsResponse.targetId;
    });
    if (!target) {
      throw new Error(`Missing target for DevTools page (id = ${pageTargetId})`);
    }
    const initialized = await target._initializedDeferred.valueOrThrow() === InitializationStatus.SUCCESS;
    if (!initialized) {
      throw new Error(`Failed to create target for DevTools page (id = ${pageTargetId})`);
    }
    const page = await target.page();
    if (!page) {
      throw new Error(`Failed to create a DevTools Page for target (id = ${pageTargetId})`);
    }
    return page;
  }
  async _hasDevToolsTarget(pageTargetId) {
    const response = await this.#connection.send("Target.getDevToolsTarget", {
      targetId: pageTargetId
    });
    return response.targetId;
  }
  async installExtension(path4) {
    const { id } = await this.#connection.send("Extensions.loadUnpacked", { path: path4 });
    return id;
  }
  uninstallExtension(id) {
    return this.#connection.send("Extensions.uninstall", { id });
  }
  async screens() {
    const { screenInfos } = await this.#connection.send("Emulation.getScreenInfos");
    return screenInfos;
  }
  async addScreen(params) {
    const { screenInfo } = await this.#connection.send("Emulation.addScreen", params);
    return screenInfo;
  }
  async removeScreen(screenId) {
    return await this.#connection.send("Emulation.removeScreen", { screenId });
  }
  async getWindowBounds(windowId) {
    const { bounds } = await this.#connection.send("Browser.getWindowBounds", {
      windowId: Number(windowId)
    });
    return bounds;
  }
  async setWindowBounds(windowId, windowBounds) {
    await this.#connection.send("Browser.setWindowBounds", {
      windowId: Number(windowId),
      bounds: windowBounds
    });
  }
  targets() {
    return Array.from(this.#targetManager.getAvailableTargets().values()).filter((target) => {
      return target._isTargetExposed() && target._initializedDeferred.value() === InitializationStatus.SUCCESS;
    });
  }
  target() {
    const browserTarget = this.targets().find((target) => {
      return target.type() === "browser";
    });
    if (!browserTarget) {
      throw new Error("Browser target is not found");
    }
    return browserTarget;
  }
  async version() {
    const version = await this.#getVersion();
    return version.product;
  }
  async userAgent() {
    const version = await this.#getVersion();
    return version.userAgent;
  }
  async close() {
    await this.#closeCallback.call(null);
    await this.disconnect();
  }
  disconnect() {
    this.#targetManager.dispose();
    this.#connection.dispose();
    this._detach();
    return Promise.resolve();
  }
  get connected() {
    return !this.#connection._closed;
  }
  #getVersion() {
    return this.#connection.send("Browser.getVersion");
  }
  get debugInfo() {
    return {
      pendingProtocolErrors: this.#connection.getPendingProtocolErrors()
    };
  }
  isNetworkEnabled() {
    return this.#networkEnabled;
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/BrowserConnector.js
async function _connectToCdpBrowser(connectionTransport, url, options) {
  const { acceptInsecureCerts = false, networkEnabled = true, defaultViewport = DEFAULT_VIEWPORT, downloadBehavior, targetFilter, _isPageTarget: isPageTarget, slowMo = 0, protocolTimeout, handleDevToolsAsPage, idGenerator = createIncrementalIdGenerator() } = options;
  const connection = new Connection(
    url,
    connectionTransport,
    slowMo,
    protocolTimeout,
    /* rawErrors */
    false,
    idGenerator
  );
  const { browserContextIds } = await connection.send("Target.getBrowserContexts");
  const browser = await CdpBrowser._create(connection, browserContextIds, acceptInsecureCerts, defaultViewport, downloadBehavior, void 0, () => {
    return connection.send("Browser.close").catch(debugError);
  }, targetFilter, isPageTarget, void 0, networkEnabled, handleDevToolsAsPage);
  return browser;
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/cdp/PredefinedNetworkConditions.js
var PredefinedNetworkConditions = Object.freeze({
  // Generally aligned with DevTools
  // https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/core/sdk/NetworkManager.ts;l=398;drc=225e1240f522ca684473f541ae6dae6cd766dd33.
  "Slow 3G": {
    // ~500Kbps down
    download: 500 * 1e3 / 8 * 0.8,
    // ~500Kbps up
    upload: 500 * 1e3 / 8 * 0.8,
    // 400ms RTT
    latency: 400 * 5
  },
  "Fast 3G": {
    // ~1.6 Mbps down
    download: 1.6 * 1e3 * 1e3 / 8 * 0.9,
    // ~0.75 Mbps up
    upload: 750 * 1e3 / 8 * 0.9,
    // 150ms RTT
    latency: 150 * 3.75
  },
  // alias to Fast 3G to align with Lighthouse (crbug.com/342406608)
  // and DevTools (crbug.com/342406608),
  "Slow 4G": {
    // ~1.6 Mbps down
    download: 1.6 * 1e3 * 1e3 / 8 * 0.9,
    // ~0.75 Mbps up
    upload: 750 * 1e3 / 8 * 0.9,
    // 150ms RTT
    latency: 150 * 3.75
  },
  "Fast 4G": {
    // 9 Mbps down
    download: 9 * 1e3 * 1e3 / 8 * 0.9,
    // 1.5 Mbps up
    upload: 1.5 * 1e3 * 1e3 / 8 * 0.9,
    // 60ms RTT
    latency: 60 * 2.75
  }
});

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/common/Device.js
var knownDevices = [
  {
    name: "Blackberry PlayBook",
    userAgent: "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+",
    viewport: {
      width: 600,
      height: 1024,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Blackberry PlayBook landscape",
    userAgent: "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+",
    viewport: {
      width: 1024,
      height: 600,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "BlackBerry Z30",
    userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "BlackBerry Z30 landscape",
    userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy Note 3",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy Note 3 landscape",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy Note II",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy Note II landscape",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy S III",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy S III landscape",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy S5",
    userAgent: "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy S5 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy S8",
    userAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G950U Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
    viewport: {
      width: 360,
      height: 740,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy S8 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 7.0; SM-G950U Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
    viewport: {
      width: 740,
      height: 360,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy S9+",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36",
    viewport: {
      width: 320,
      height: 658,
      deviceScaleFactor: 4.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy S9+ landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36",
    viewport: {
      width: 658,
      height: 320,
      deviceScaleFactor: 4.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Galaxy Tab S4",
    userAgent: "Mozilla/5.0 (Linux; Android 8.1.0; SM-T837A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Safari/537.36",
    viewport: {
      width: 712,
      height: 1138,
      deviceScaleFactor: 2.25,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Galaxy Tab S4 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.1.0; SM-T837A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Safari/537.36",
    viewport: {
      width: 1138,
      height: 712,
      deviceScaleFactor: 2.25,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad (gen 6)",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad (gen 6) landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad (gen 7)",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 810,
      height: 1080,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad (gen 7) landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 1080,
      height: 810,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad Mini",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad Mini landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad Pro",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad Pro landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
    viewport: {
      width: 1366,
      height: 1024,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPad Pro 11",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 834,
      height: 1194,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPad Pro 11 landscape",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 1194,
      height: 834,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 4",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53",
    viewport: {
      width: 320,
      height: 480,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 4 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53",
    viewport: {
      width: 480,
      height: 320,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 5",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    viewport: {
      width: 320,
      height: 568,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 5 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    viewport: {
      width: 568,
      height: 320,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 6",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 6 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 667,
      height: 375,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 6 Plus",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 414,
      height: 736,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 6 Plus landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 736,
      height: 414,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 7",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 7 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 667,
      height: 375,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 7 Plus",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 414,
      height: 736,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 7 Plus landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 736,
      height: 414,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 8",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 8 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 667,
      height: 375,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 8 Plus",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 414,
      height: 736,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 8 Plus landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 736,
      height: 414,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone SE",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    viewport: {
      width: 320,
      height: 568,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone SE landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    viewport: {
      width: 568,
      height: 320,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone X",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone X landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 812,
      height: 375,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone XR",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 414,
      height: 896,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone XR landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 896,
      height: 414,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 11",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 414,
      height: 828,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 11 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 828,
      height: 414,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 11 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 11 Pro landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 812,
      height: 375,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 11 Pro Max",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 414,
      height: 896,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 11 Pro Max landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 896,
      height: 414,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 12",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 12 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 12 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 12 Pro landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 12 Pro Max",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 428,
      height: 926,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 12 Pro Max landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 926,
      height: 428,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 12 Mini",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 12 Mini landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 812,
      height: 375,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 13",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 13 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 13 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 13 Pro landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 13 Pro Max",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 428,
      height: 926,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 13 Pro Max landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 926,
      height: 428,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 13 Mini",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 13 Mini landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 812,
      height: 375,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 14",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 663,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 14 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 750,
      height: 340,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 14 Plus",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 428,
      height: 745,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 14 Plus landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 832,
      height: 378,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 14 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 393,
      height: 659,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 14 Pro landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 734,
      height: 343,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 14 Pro Max",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 430,
      height: 739,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 14 Pro Max landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 814,
      height: 380,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 15",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 393,
      height: 659,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 15 landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 734,
      height: 343,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 15 Plus",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 430,
      height: 739,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 15 Plus landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 814,
      height: 380,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 15 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 393,
      height: 659,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 15 Pro landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 734,
      height: 343,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "iPhone 15 Pro Max",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 430,
      height: 739,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "iPhone 15 Pro Max landscape",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 814,
      height: 380,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "JioPhone 2",
    userAgent: "Mozilla/5.0 (Mobile; LYF/F300B/LYF-F300B-001-01-15-130718-i;Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5",
    viewport: {
      width: 240,
      height: 320,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "JioPhone 2 landscape",
    userAgent: "Mozilla/5.0 (Mobile; LYF/F300B/LYF-F300B-001-01-15-130718-i;Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5",
    viewport: {
      width: 320,
      height: 240,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Kindle Fire HDX",
    userAgent: "Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true",
    viewport: {
      width: 800,
      height: 1280,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Kindle Fire HDX landscape",
    userAgent: "Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true",
    viewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "LG Optimus L70",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 384,
      height: 640,
      deviceScaleFactor: 1.25,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "LG Optimus L70 landscape",
    userAgent: "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 640,
      height: 384,
      deviceScaleFactor: 1.25,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Microsoft Lumia 550",
    userAgent: "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 550) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Microsoft Lumia 950",
    userAgent: "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 4,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Microsoft Lumia 950 landscape",
    userAgent: "Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 4,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 10",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Safari/537.36",
    viewport: {
      width: 800,
      height: 1280,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 10 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Safari/537.36",
    viewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 4",
    userAgent: "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 384,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 4 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 640,
      height: 384,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 5",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 5 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 5X",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 412,
      height: 732,
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 5X landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 5X Build/OPR4.170623.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 732,
      height: 412,
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 6",
    userAgent: "Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 412,
      height: 732,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 6 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 7.1.1; Nexus 6 Build/N6F26U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 732,
      height: 412,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 6P",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 412,
      height: 732,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 6P landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 732,
      height: 412,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nexus 7",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Safari/537.36",
    viewport: {
      width: 600,
      height: 960,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nexus 7 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Safari/537.36",
    viewport: {
      width: 960,
      height: 600,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nokia Lumia 520",
    userAgent: "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)",
    viewport: {
      width: 320,
      height: 533,
      deviceScaleFactor: 1.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nokia Lumia 520 landscape",
    userAgent: "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)",
    viewport: {
      width: 533,
      height: 320,
      deviceScaleFactor: 1.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Nokia N9",
    userAgent: "Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13",
    viewport: {
      width: 480,
      height: 854,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Nokia N9 landscape",
    userAgent: "Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13",
    viewport: {
      width: 854,
      height: 480,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 2",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 411,
      height: 731,
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 2 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 731,
      height: 411,
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 2 XL",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 411,
      height: 823,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 2 XL landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3765.0 Mobile Safari/537.36",
    viewport: {
      width: 823,
      height: 411,
      deviceScaleFactor: 3.5,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 3",
    userAgent: "Mozilla/5.0 (Linux; Android 9; Pixel 3 Build/PQ1A.181105.017.A1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36",
    viewport: {
      width: 393,
      height: 786,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 3 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 9; Pixel 3 Build/PQ1A.181105.017.A1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36",
    viewport: {
      width: 786,
      height: 393,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 4",
    userAgent: "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
    viewport: {
      width: 353,
      height: 745,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 4 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
    viewport: {
      width: 745,
      height: 353,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 4a (5G)",
    userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 4a (5G)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 353,
      height: 745,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 4a (5G) landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 4a (5G)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 745,
      height: 353,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Pixel 5",
    userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 393,
      height: 851,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Pixel 5 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 851,
      height: 393,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  },
  {
    name: "Moto G4",
    userAgent: "Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  {
    name: "Moto G4 landscape",
    userAgent: "Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4812.0 Mobile Safari/537.36",
    viewport: {
      width: 640,
      height: 360,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: true
    }
  }
];
var knownDevicesByName = {};
for (const device of knownDevices) {
  knownDevicesByName[device.name] = device;
}
var KnownDevices = Object.freeze(knownDevicesByName);

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/bidi/BrowserConnector.js
async function _connectToBiDiBrowser(connectionTransport, url, options) {
  const { acceptInsecureCerts = false, networkEnabled = true, defaultViewport = DEFAULT_VIEWPORT } = options;
  const { bidiConnection, cdpConnection, closeCallback } = await getBiDiConnection(connectionTransport, url, options);
  const BiDi = await import(
    /* webpackIgnore: true */
    "./bidi-7N6ZLTHK.js"
  );
  const bidiBrowser = await BiDi.BidiBrowser.create({
    connection: bidiConnection,
    cdpConnection,
    closeCallback,
    process: void 0,
    defaultViewport,
    acceptInsecureCerts,
    networkEnabled,
    capabilities: options.capabilities
  });
  return bidiBrowser;
}
async function getBiDiConnection(connectionTransport, url, options) {
  const BiDi = await import(
    /* webpackIgnore: true */
    "./bidi-7N6ZLTHK.js"
  );
  const { slowMo = 0, protocolTimeout, idGenerator = createIncrementalIdGenerator() } = options;
  const pureBidiConnection = new BiDi.BidiConnection(url, connectionTransport, idGenerator, slowMo, protocolTimeout);
  try {
    const result = await pureBidiConnection.send("session.status", {});
    if ("type" in result && result.type === "success") {
      return {
        bidiConnection: pureBidiConnection,
        closeCallback: async () => {
          await pureBidiConnection.send("browser.close", {}).catch(debugError);
        }
      };
    }
  } catch (e) {
    if (!(e instanceof ProtocolError)) {
      throw e;
    }
  }
  pureBidiConnection.unbind();
  const cdpConnection = new Connection(
    url,
    connectionTransport,
    slowMo,
    protocolTimeout,
    /* rawErrors= */
    true,
    idGenerator
  );
  const version = await cdpConnection.send("Browser.getVersion");
  if (version.product.toLowerCase().includes("firefox")) {
    throw new UnsupportedOperation("Firefox is not supported in BiDi over CDP mode.");
  }
  const bidiOverCdpConnection = await BiDi.connectBidiOverCdp(cdpConnection);
  return {
    cdpConnection,
    bidiConnection: bidiOverCdpConnection,
    closeCallback: async () => {
      await cdpConnection.send("Browser.close").catch(debugError);
    }
  };
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/common/BrowserConnector.js
var getWebSocketTransportClass = async () => {
  return isNode ? (await import("./NodeWebSocketTransport-RXUGDMTG.js")).NodeWebSocketTransport : (await import("./BrowserWebSocketTransport-PDKYCUZS.js")).BrowserWebSocketTransport;
};
async function _connectToBrowser(options) {
  const { connectionTransport, endpointUrl } = await getConnectionTransport(options);
  if (options.protocol === "webDriverBiDi") {
    const bidiBrowser = await _connectToBiDiBrowser(connectionTransport, endpointUrl, options);
    return bidiBrowser;
  } else {
    const cdpBrowser = await _connectToCdpBrowser(connectionTransport, endpointUrl, options);
    return cdpBrowser;
  }
}
async function getConnectionTransport(options) {
  const { browserWSEndpoint, browserURL, channel, transport, headers = {} } = options;
  assert(Number(!!browserWSEndpoint) + Number(!!browserURL) + Number(!!transport) + Number(!!channel) === 1, "Exactly one of browserWSEndpoint, browserURL, transport or channel must be passed to puppeteer.connect");
  if (transport) {
    return { connectionTransport: transport, endpointUrl: "" };
  } else if (browserWSEndpoint) {
    const WebSocketClass = await getWebSocketTransportClass();
    const connectionTransport = await WebSocketClass.create(browserWSEndpoint, headers);
    return {
      connectionTransport,
      endpointUrl: browserWSEndpoint
    };
  } else if (browserURL) {
    const connectionURL = await getWSEndpoint(browserURL);
    const WebSocketClass = await getWebSocketTransportClass();
    const connectionTransport = await WebSocketClass.create(connectionURL);
    return {
      connectionTransport,
      endpointUrl: connectionURL
    };
  } else if (options.channel && isNode) {
    const { detectBrowserPlatform: detectBrowserPlatform2, resolveDefaultUserDataDir, Browser: Browser3 } = await import("./main-4D7TE564.js");
    const platform = detectBrowserPlatform2();
    if (!platform) {
      throw new Error("Could not detect required browser platform");
    }
    const { convertPuppeteerChannelToBrowsersChannel: convertPuppeteerChannelToBrowsersChannel2 } = await import("./LaunchOptions-UXR5LPBG.js");
    const { join: join3 } = await import("node:path");
    const userDataDir = resolveDefaultUserDataDir(Browser3.CHROME, platform, convertPuppeteerChannelToBrowsersChannel2(options.channel));
    const portPath = join3(userDataDir, "DevToolsActivePort");
    try {
      const fileContent = await environment.value.fs.promises.readFile(portPath, "ascii");
      const [rawPort, rawPath] = fileContent.split("\n").map((line) => {
        return line.trim();
      }).filter((line) => {
        return !!line;
      });
      if (!rawPort || !rawPath) {
        throw new Error(`Invalid DevToolsActivePort '${fileContent}' found`);
      }
      const port = parseInt(rawPort, 10);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid port '${rawPort}' found`);
      }
      const browserWSEndpoint2 = `ws://localhost:${port}${rawPath}`;
      const WebSocketClass = await getWebSocketTransportClass();
      const connectionTransport = await WebSocketClass.create(browserWSEndpoint2, headers);
      return {
        connectionTransport,
        endpointUrl: browserWSEndpoint2
      };
    } catch (error) {
      throw new Error(`Could not find DevToolsActivePort for ${options.channel} at ${portPath}`, {
        cause: error
      });
    }
  }
  throw new Error("Invalid connection options");
}
async function getWSEndpoint(browserURL) {
  const endpointURL = new URL("/json/version", browserURL);
  try {
    const result = await globalThis.fetch(endpointURL.toString(), {
      method: "GET"
    });
    if (!result.ok) {
      throw new Error(`HTTP ${result.statusText}`);
    }
    const data = await result.json();
    return data.webSocketDebuggerUrl;
  } catch (error) {
    if (isErrorLike(error)) {
      error.message = `Failed to fetch browser webSocket URL from ${endpointURL}: ` + error.message;
    }
    throw error;
  }
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/common/Puppeteer.js
var Puppeteer = class {
  /**
   * Operations for {@link CustomQueryHandler | custom query handlers}. See
   * {@link CustomQueryHandlerRegistry}.
   *
   * @internal
   */
  static customQueryHandlers = customQueryHandlers;
  /**
   * Registers a {@link CustomQueryHandler | custom query handler}.
   *
   * @remarks
   * After registration, the handler can be used everywhere where a selector is
   * expected by prepending the selection string with `<name>/`. The name is only
   * allowed to consist of lower- and upper case latin letters.
   *
   * @example
   *
   * ```
   * import {Puppeteer}, puppeteer from 'puppeteer';
   *
   * Puppeteer.registerCustomQueryHandler('text', { … });
   * const aHandle = await page.$('text/…');
   * ```
   *
   * @param name - The name that the custom query handler will be registered
   * under.
   * @param queryHandler - The {@link CustomQueryHandler | custom query handler}
   * to register.
   *
   * @public
   */
  static registerCustomQueryHandler(name, queryHandler) {
    return this.customQueryHandlers.register(name, queryHandler);
  }
  /**
   * Unregisters a custom query handler for a given name.
   */
  static unregisterCustomQueryHandler(name) {
    return this.customQueryHandlers.unregister(name);
  }
  /**
   * Gets the names of all custom query handlers.
   */
  static customQueryHandlerNames() {
    return this.customQueryHandlers.names();
  }
  /**
   * Unregisters all custom query handlers.
   */
  static clearCustomQueryHandlers() {
    return this.customQueryHandlers.clear();
  }
  /**
   * @internal
   */
  _isPuppeteerCore;
  /**
   * @internal
   */
  _changedBrowsers = false;
  /**
   * @internal
   */
  constructor(settings) {
    this._isPuppeteerCore = settings.isPuppeteerCore;
    this.connect = this.connect.bind(this);
  }
  /**
   * This method attaches Puppeteer to an existing browser instance.
   *
   * @remarks
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to browser instance.
   */
  connect(options) {
    return _connectToBrowser(options);
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/revisions.js
var PUPPETEER_REVISIONS = Object.freeze({
  chrome: "146.0.7680.153",
  "chrome-headless-shell": "146.0.7680.153",
  firefox: "stable_148.0.2"
});

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/ChromeLauncher.js
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/BrowserLauncher.js
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/PipeTransport.js
var PipeTransport = class {
  #pipeWrite;
  #subscriptions = new DisposableStack();
  #isClosed = false;
  #pendingMessage = [];
  onclose;
  onmessage;
  constructor(pipeWrite, pipeRead) {
    this.#pipeWrite = pipeWrite;
    const pipeReadEmitter = this.#subscriptions.use(
      // NodeJS event emitters don't support `*` so we need to typecast
      // As long as we don't use it we should be OK.
      new EventEmitter(pipeRead)
    );
    pipeReadEmitter.on("data", (buffer) => {
      return this.#dispatch(buffer);
    });
    pipeReadEmitter.on("close", () => {
      if (this.onclose) {
        this.onclose.call(null);
      }
    });
    pipeReadEmitter.on("error", debugError);
    const pipeWriteEmitter = this.#subscriptions.use(
      // NodeJS event emitters don't support `*` so we need to typecast
      // As long as we don't use it we should be OK.
      new EventEmitter(pipeWrite)
    );
    pipeWriteEmitter.on("error", debugError);
  }
  send(message) {
    assert(!this.#isClosed, "`PipeTransport` is closed.");
    this.#pipeWrite.write(message);
    this.#pipeWrite.write("\0");
  }
  #dispatch(buffer) {
    assert(!this.#isClosed, "`PipeTransport` is closed.");
    this.#pendingMessage.push(buffer);
    if (buffer.indexOf("\0") === -1) {
      return;
    }
    const concatBuffer = Buffer.concat(this.#pendingMessage);
    let start = 0;
    let end = concatBuffer.indexOf("\0");
    while (end !== -1) {
      const message = concatBuffer.toString(void 0, start, end);
      setImmediate(() => {
        if (this.onmessage) {
          this.onmessage.call(null, message);
        }
      });
      start = end + 1;
      end = concatBuffer.indexOf("\0", start);
    }
    if (start >= concatBuffer.length) {
      this.#pendingMessage = [];
    } else {
      this.#pendingMessage = [concatBuffer.subarray(start)];
    }
  }
  close() {
    this.#isClosed = true;
    this.#subscriptions.dispose();
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/BrowserLauncher.js
var BrowserLauncher = class {
  #browser;
  /**
   * @internal
   */
  puppeteer;
  /**
   * @internal
   */
  constructor(puppeteer3, browser) {
    this.puppeteer = puppeteer3;
    this.#browser = browser;
  }
  get browser() {
    return this.#browser;
  }
  async launch(options = {}) {
    const { dumpio = false, enableExtensions = false, env = process.env, handleSIGINT = true, handleSIGTERM = true, handleSIGHUP = true, acceptInsecureCerts = false, networkEnabled = true, defaultViewport = DEFAULT_VIEWPORT, downloadBehavior, slowMo = 0, timeout: timeout2 = 3e4, waitForInitialPage = true, protocolTimeout, handleDevToolsAsPage, idGenerator = createIncrementalIdGenerator() } = options;
    let { protocol } = options;
    if (this.#browser === "firefox" && protocol === void 0) {
      protocol = "webDriverBiDi";
    }
    if (this.#browser === "firefox" && protocol === "cdp") {
      throw new Error("Connecting to Firefox using CDP is no longer supported");
    }
    const launchArgs = await this.computeLaunchArguments({
      ...options,
      protocol
    });
    if (!existsSync(launchArgs.executablePath)) {
      throw new Error(`Browser was not found at the configured executablePath (${launchArgs.executablePath})`);
    }
    const usePipe = launchArgs.args.includes("--remote-debugging-pipe");
    const onProcessExit = async () => {
      await this.cleanUserDataDir(launchArgs.userDataDir, {
        isTemp: launchArgs.isTempUserDataDir
      });
    };
    if (this.#browser === "firefox" && protocol === "webDriverBiDi" && usePipe) {
      throw new Error("Pipe connections are not supported with Firefox and WebDriver BiDi");
    }
    const browserProcess = launch({
      executablePath: launchArgs.executablePath,
      args: launchArgs.args,
      handleSIGHUP,
      handleSIGTERM,
      handleSIGINT,
      dumpio,
      env,
      pipe: usePipe,
      onExit: onProcessExit,
      signal: options.signal
    });
    let browser;
    let cdpConnection;
    let closing = false;
    const browserCloseCallback = async () => {
      if (closing) {
        return;
      }
      closing = true;
      await this.closeBrowser(browserProcess, cdpConnection);
    };
    try {
      if (this.#browser === "firefox") {
        browser = await this.createBiDiBrowser(browserProcess, browserCloseCallback, {
          timeout: timeout2,
          protocolTimeout,
          slowMo,
          defaultViewport,
          acceptInsecureCerts,
          networkEnabled,
          idGenerator
        });
      } else {
        if (usePipe) {
          cdpConnection = await this.createCdpPipeConnection(browserProcess, {
            timeout: timeout2,
            protocolTimeout,
            slowMo,
            idGenerator
          });
        } else {
          cdpConnection = await this.createCdpSocketConnection(browserProcess, {
            timeout: timeout2,
            protocolTimeout,
            slowMo,
            idGenerator
          });
        }
        if (protocol === "webDriverBiDi") {
          browser = await this.createBiDiOverCdpBrowser(browserProcess, cdpConnection, browserCloseCallback, {
            defaultViewport,
            acceptInsecureCerts,
            networkEnabled
          });
        } else {
          browser = await CdpBrowser._create(cdpConnection, [], acceptInsecureCerts, defaultViewport, downloadBehavior, browserProcess.nodeProcess, browserCloseCallback, options.targetFilter, void 0, void 0, networkEnabled, handleDevToolsAsPage);
        }
      }
    } catch (error) {
      void browserCloseCallback();
      const logs = browserProcess.getRecentLogs().join("\n");
      if (logs.includes("Failed to create a ProcessSingleton for your profile directory") || // On Windows we will not get logs due to the singleton process
      // handover. See
      // https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/process_singleton_win.cc;l=46;drc=fc7952f0422b5073515a205a04ec9c3a1ae81658
      process.platform === "win32" && existsSync(join(launchArgs.userDataDir, "lockfile"))) {
        throw new Error(`The browser is already running for ${launchArgs.userDataDir}. Use a different \`userDataDir\` or stop the running browser first.`);
      }
      if (logs.includes("Missing X server") && options.headless === false) {
        throw new Error(`Missing X server to start the headful browser. Either set headless to true or use xvfb-run to run your Puppeteer script.`);
      }
      if (error instanceof TimeoutError2) {
        throw new TimeoutError(error.message);
      }
      throw error;
    }
    if (Array.isArray(enableExtensions)) {
      if (this.#browser === "chrome" && !usePipe) {
        throw new Error("To use `enableExtensions` with a list of paths in Chrome, you must be connected with `--remote-debugging-pipe` (`pipe: true`).");
      }
      await Promise.all([
        enableExtensions.map((path4) => {
          return browser.installExtension(path4);
        })
      ]);
    }
    if (waitForInitialPage) {
      await this.waitForPageTarget(browser, timeout2);
    }
    return browser;
  }
  /**
   * @internal
   */
  async closeBrowser(browserProcess, cdpConnection) {
    if (cdpConnection) {
      try {
        await cdpConnection.closeBrowser();
        await browserProcess.hasClosed();
      } catch (error) {
        debugError(error);
        await browserProcess.close();
      }
    } else {
      await firstValueFrom(race(from(browserProcess.hasClosed()), timer(5e3).pipe(map(() => {
        return from(browserProcess.close());
      }))));
    }
  }
  /**
   * @internal
   */
  async waitForPageTarget(browser, timeout2) {
    try {
      await browser.waitForTarget((t) => {
        return t.type() === "page";
      }, { timeout: timeout2 });
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
  /**
   * @internal
   */
  async createCdpSocketConnection(browserProcess, opts) {
    const browserWSEndpoint = await browserProcess.waitForLineOutput(CDP_WEBSOCKET_ENDPOINT_REGEX, opts.timeout);
    const transport = await NodeWebSocketTransport.create(browserWSEndpoint);
    return new Connection(
      browserWSEndpoint,
      transport,
      opts.slowMo,
      opts.protocolTimeout,
      /* rawErrors */
      false,
      opts.idGenerator
    );
  }
  /**
   * @internal
   */
  async createCdpPipeConnection(browserProcess, opts) {
    const { 3: pipeWrite, 4: pipeRead } = browserProcess.nodeProcess.stdio;
    const transport = new PipeTransport(pipeWrite, pipeRead);
    return new Connection(
      "",
      transport,
      opts.slowMo,
      opts.protocolTimeout,
      /* rawErrors */
      false,
      opts.idGenerator
    );
  }
  /**
   * @internal
   */
  async createBiDiOverCdpBrowser(browserProcess, cdpConnection, closeCallback, opts) {
    const bidiOnly = process.env["PUPPETEER_WEBDRIVER_BIDI_ONLY"] === "true";
    const BiDi = await import(
      /* webpackIgnore: true */
      "./bidi-7N6ZLTHK.js"
    );
    const bidiConnection = await BiDi.connectBidiOverCdp(cdpConnection);
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      // Do not provide CDP connection to Browser, if BiDi-only mode is enabled. This
      // would restrict Browser to use only BiDi endpoint.
      cdpConnection: bidiOnly ? void 0 : cdpConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      acceptInsecureCerts: opts.acceptInsecureCerts,
      networkEnabled: opts.networkEnabled
    });
  }
  /**
   * @internal
   */
  async createBiDiBrowser(browserProcess, closeCallback, opts) {
    const browserWSEndpoint = await browserProcess.waitForLineOutput(WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX, opts.timeout) + "/session";
    const transport = await NodeWebSocketTransport.create(browserWSEndpoint);
    const BiDi = await import(
      /* webpackIgnore: true */
      "./bidi-7N6ZLTHK.js"
    );
    const bidiConnection = new BiDi.BidiConnection(browserWSEndpoint, transport, opts.idGenerator, opts.slowMo, opts.protocolTimeout);
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      acceptInsecureCerts: opts.acceptInsecureCerts,
      networkEnabled: opts.networkEnabled ?? true
    });
  }
  /**
   * @internal
   */
  getProfilePath() {
    return join(this.puppeteer.configuration.temporaryDirectory ?? tmpdir(), `puppeteer_dev_${this.browser}_profile-`);
  }
  /**
   * @internal
   */
  resolveExecutablePath(headless, validatePath = true) {
    let executablePath3 = this.puppeteer.configuration.executablePath;
    if (executablePath3) {
      if (validatePath && !existsSync(executablePath3)) {
        throw new Error(`Tried to find the browser at the configured path (${executablePath3}), but no executable was found.`);
      }
      return executablePath3;
    }
    function puppeteerBrowserToInstalledBrowser(browser, headless2) {
      switch (browser) {
        case "chrome":
          if (headless2 === "shell") {
            return Browser2.CHROMEHEADLESSSHELL;
          }
          return Browser2.CHROME;
        case "firefox":
          return Browser2.FIREFOX;
      }
      return Browser2.CHROME;
    }
    const browserType = puppeteerBrowserToInstalledBrowser(this.browser, headless);
    executablePath3 = computeExecutablePath({
      cacheDir: this.puppeteer.defaultDownloadPath,
      browser: browserType,
      buildId: this.puppeteer.browserVersion
    });
    if (validatePath && !existsSync(executablePath3)) {
      const configVersion = this.puppeteer.configuration?.[this.browser]?.version;
      if (configVersion) {
        throw new Error(`Tried to find the browser at the configured path (${executablePath3}) for version ${configVersion}, but no executable was found.`);
      }
      switch (this.browser) {
        case "chrome":
          throw new Error(`Could not find Chrome (ver. ${this.puppeteer.browserVersion}). This can occur if either
 1. you did not perform an installation before running the script (e.g. \`npx puppeteer browsers install ${browserType}\`) or
 2. your cache path is incorrectly configured (which is: ${this.puppeteer.configuration.cacheDirectory}).
For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.`);
        case "firefox":
          throw new Error(`Could not find Firefox (rev. ${this.puppeteer.browserVersion}). This can occur if either
 1. you did not perform an installation for Firefox before running the script (e.g. \`npx puppeteer browsers install firefox\`) or
 2. your cache path is incorrectly configured (which is: ${this.puppeteer.configuration.cacheDirectory}).
For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.`);
      }
    }
    return executablePath3;
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/util/fs.js
import fs from "node:fs";
var rmOptions = {
  force: true,
  recursive: true,
  maxRetries: 5
};
async function rm(path4) {
  await fs.promises.rm(path4, rmOptions);
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/ChromeLauncher.js
var ChromeLauncher = class extends BrowserLauncher {
  constructor(puppeteer3) {
    super(puppeteer3, "chrome");
  }
  launch(options = {}) {
    if (this.puppeteer.configuration.logLevel === "warn" && process.platform === "darwin" && process.arch === "x64") {
      const cpus = os.cpus();
      if (cpus[0]?.model.includes("Apple")) {
        console.warn([
          "\x1B[1m\x1B[43m\x1B[30m",
          "Degraded performance warning:\x1B[0m\x1B[33m",
          "Launching Chrome on Mac Silicon (arm64) from an x64 Node installation results in",
          "Rosetta translating the Chrome binary, even if Chrome is already arm64. This would",
          "result in huge performance issues. To resolve this, you must run Puppeteer with",
          "a version of Node built for arm64."
        ].join("\n  "));
      }
    }
    return super.launch(options);
  }
  /**
   * @internal
   */
  async computeLaunchArguments(options = {}) {
    const { ignoreDefaultArgs = false, args = [], pipe = false, debuggingPort, channel, executablePath: executablePath3 } = options;
    const chromeArguments = [];
    if (!ignoreDefaultArgs) {
      chromeArguments.push(...this.defaultArgs(options));
    } else if (Array.isArray(ignoreDefaultArgs)) {
      chromeArguments.push(...this.defaultArgs(options).filter((arg) => {
        return !ignoreDefaultArgs.includes(arg);
      }));
    } else {
      chromeArguments.push(...args);
    }
    if (!chromeArguments.some((argument) => {
      return argument.startsWith("--remote-debugging-");
    })) {
      if (pipe) {
        assert(!debuggingPort, "Browser should be launched with either pipe or debugging port - not both.");
        chromeArguments.push("--remote-debugging-pipe");
      } else {
        chromeArguments.push(`--remote-debugging-port=${debuggingPort || 0}`);
      }
    }
    let isTempUserDataDir = false;
    let userDataDirIndex = chromeArguments.findIndex((arg) => {
      return arg.startsWith("--user-data-dir");
    });
    if (userDataDirIndex < 0) {
      isTempUserDataDir = true;
      chromeArguments.push(`--user-data-dir=${await mkdtemp(this.getProfilePath())}`);
      userDataDirIndex = chromeArguments.length - 1;
    }
    const userDataDir = chromeArguments[userDataDirIndex].split("=", 2)[1];
    assert(typeof userDataDir === "string", "`--user-data-dir` is malformed");
    let chromeExecutable = executablePath3;
    if (!chromeExecutable) {
      assert(channel || !this.puppeteer._isPuppeteerCore, `An \`executablePath\` or \`channel\` must be specified for \`puppeteer-core\``);
      chromeExecutable = channel ? this.executablePath(channel) : this.resolveExecutablePath(options.headless ?? true);
    }
    return {
      executablePath: chromeExecutable,
      args: chromeArguments,
      isTempUserDataDir,
      userDataDir
    };
  }
  /**
   * @internal
   */
  async cleanUserDataDir(path4, opts) {
    if (opts.isTemp) {
      try {
        await rm(path4);
      } catch (error) {
        debugError(error);
        throw error;
      }
    }
  }
  defaultArgs(options = {}) {
    const userDisabledFeatures = getFeatures("--disable-features", options.args);
    if (options.args && userDisabledFeatures.length > 0) {
      removeMatchingFlags(options.args, "--disable-features");
    }
    const turnOnExperimentalFeaturesForTesting = process.env["PUPPETEER_TEST_EXPERIMENTAL_CHROME_FEATURES"] === "true";
    const disabledFeatures = [
      "Translate",
      // AcceptCHFrame disabled because of crbug.com/1348106.
      "AcceptCHFrame",
      "MediaRouter",
      "OptimizationHints",
      "RenderDocument",
      // https://crbug.com/444150315
      "PartitionAllocSchedulerLoopQuarantineTaskControlledPurge",
      // https://crbug.com/489314676
      ...turnOnExperimentalFeaturesForTesting ? [] : [
        // https://crbug.com/1492053
        "ProcessPerSiteUpToMainFrameThreshold",
        // https://github.com/puppeteer/puppeteer/issues/10715
        "IsolateSandboxedIframes"
      ],
      ...userDisabledFeatures
    ].filter((feature) => {
      return feature !== "";
    });
    const userEnabledFeatures = getFeatures("--enable-features", options.args);
    if (options.args && userEnabledFeatures.length > 0) {
      removeMatchingFlags(options.args, "--enable-features");
    }
    const enabledFeatures = [
      "PdfOopif",
      // Add features to enable by default here.
      ...userEnabledFeatures
    ].filter((feature) => {
      return feature !== "";
    });
    const chromeArguments = [
      "--allow-pre-commit-input",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-extensions-with-background-pages",
      "--disable-crash-reporter",
      // No crash reporting in CfT.
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-hang-monitor",
      "--disable-infobars",
      "--disable-ipc-flooding-protection",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-search-engine-choice-screen",
      "--disable-sync",
      "--enable-automation",
      "--export-tagged-pdf",
      "--force-color-profile=srgb",
      "--generate-pdf-document-outline",
      "--metrics-recording-only",
      "--no-first-run",
      "--password-store=basic",
      "--use-mock-keychain",
      `--disable-features=${disabledFeatures.join(",")}`,
      `--enable-features=${enabledFeatures.join(",")}`
    ].filter((arg) => {
      return arg !== "";
    });
    const { devtools = false, headless = !devtools, args = [], userDataDir, enableExtensions = false } = options;
    if (process.env["PUPPETEER_DANGEROUS_NO_SANDBOX"] === "true" && !args.includes("--no-sandbox")) {
      chromeArguments.push("--no-sandbox");
    }
    if (userDataDir) {
      chromeArguments.push(`--user-data-dir=${path.posix.isAbsolute(userDataDir) || path.win32.isAbsolute(userDataDir) ? userDataDir : path.resolve(userDataDir)}`);
    }
    if (devtools) {
      chromeArguments.push("--auto-open-devtools-for-tabs");
    }
    if (headless) {
      chromeArguments.push(headless === "shell" ? "--headless" : "--headless=new", "--hide-scrollbars", "--mute-audio");
    }
    chromeArguments.push(enableExtensions ? "--enable-unsafe-extension-debugging" : "--disable-extensions");
    if (args.every((arg) => {
      return arg.startsWith("-");
    })) {
      chromeArguments.push("about:blank");
    }
    chromeArguments.push(...args);
    return chromeArguments;
  }
  executablePath(channel, validatePath = true) {
    if (channel) {
      return computeSystemExecutablePath({
        browser: Browser2.CHROME,
        channel: convertPuppeteerChannelToBrowsersChannel(channel)
      });
    } else {
      return this.resolveExecutablePath(void 0, validatePath);
    }
  }
};
function getFeatures(flag, options = []) {
  return options.filter((s) => {
    return s.startsWith(flag.endsWith("=") ? flag : `${flag}=`);
  }).map((s) => {
    return s.split(new RegExp(`${flag}=\\s*`))[1]?.trim();
  }).filter((s) => {
    return s;
  });
}
function removeMatchingFlags(array, flag) {
  const regex = new RegExp(`^${flag}=.*`);
  let i = 0;
  while (i < array.length) {
    if (regex.test(array[i])) {
      array.splice(i, 1);
    } else {
      i++;
    }
  }
  return array;
}

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/FirefoxLauncher.js
import fs2 from "node:fs";
import { rename, unlink, mkdtemp as mkdtemp2 } from "node:fs/promises";
import os2 from "node:os";
import path2 from "node:path";
var FirefoxLauncher = class _FirefoxLauncher extends BrowserLauncher {
  constructor(puppeteer3) {
    super(puppeteer3, "firefox");
  }
  static getPreferences(extraPrefsFirefox) {
    return {
      ...extraPrefsFirefox,
      // Force all web content to use a single content process. TODO: remove
      // this once Firefox supports mouse event dispatch from the main frame
      // context. See https://bugzilla.mozilla.org/show_bug.cgi?id=1773393.
      "fission.webContentIsolationStrategy": 0
    };
  }
  /**
   * @internal
   */
  async computeLaunchArguments(options = {}) {
    const { ignoreDefaultArgs = false, args = [], executablePath: executablePath3, pipe = false, extraPrefsFirefox = {}, debuggingPort = null } = options;
    const firefoxArguments = [];
    if (!ignoreDefaultArgs) {
      firefoxArguments.push(...this.defaultArgs(options));
    } else if (Array.isArray(ignoreDefaultArgs)) {
      firefoxArguments.push(...this.defaultArgs(options).filter((arg) => {
        return !ignoreDefaultArgs.includes(arg);
      }));
    } else {
      firefoxArguments.push(...args);
    }
    if (!firefoxArguments.some((argument) => {
      return argument.startsWith("--remote-debugging-");
    })) {
      if (pipe) {
        assert(debuggingPort === null, "Browser should be launched with either pipe or debugging port - not both.");
      }
      firefoxArguments.push(`--remote-debugging-port=${debuggingPort || 0}`);
    }
    let userDataDir;
    let isTempUserDataDir = true;
    const profileArgIndex = firefoxArguments.findIndex((arg) => {
      return ["-profile", "--profile"].includes(arg);
    });
    if (profileArgIndex !== -1) {
      userDataDir = firefoxArguments[profileArgIndex + 1];
      if (!userDataDir) {
        throw new Error(`Missing value for profile command line argument`);
      }
      isTempUserDataDir = false;
    } else {
      userDataDir = await mkdtemp2(this.getProfilePath());
      firefoxArguments.push("--profile");
      firefoxArguments.push(userDataDir);
    }
    await createProfile(Browser2.FIREFOX, {
      path: userDataDir,
      preferences: _FirefoxLauncher.getPreferences(extraPrefsFirefox)
    });
    let firefoxExecutable;
    if (this.puppeteer._isPuppeteerCore || executablePath3) {
      assert(executablePath3, `An \`executablePath\` must be specified for \`puppeteer-core\``);
      firefoxExecutable = executablePath3;
    } else {
      firefoxExecutable = this.executablePath(void 0);
    }
    return {
      isTempUserDataDir,
      userDataDir,
      args: firefoxArguments,
      executablePath: firefoxExecutable
    };
  }
  /**
   * @internal
   */
  async cleanUserDataDir(userDataDir, opts) {
    if (opts.isTemp) {
      try {
        await rm(userDataDir);
      } catch (error) {
        debugError(error);
        throw error;
      }
    } else {
      try {
        const backupSuffix = ".puppeteer";
        const backupFiles = ["prefs.js", "user.js"];
        const results = await Promise.allSettled(backupFiles.map(async (file) => {
          const prefsBackupPath = path2.join(userDataDir, file + backupSuffix);
          if (fs2.existsSync(prefsBackupPath)) {
            const prefsPath = path2.join(userDataDir, file);
            await unlink(prefsPath);
            await rename(prefsBackupPath, prefsPath);
          }
        }));
        for (const result of results) {
          if (result.status === "rejected") {
            throw result.reason;
          }
        }
      } catch (error) {
        debugError(error);
      }
    }
  }
  executablePath(_, validatePath = true) {
    return this.resolveExecutablePath(
      void 0,
      /* validatePath=*/
      validatePath
    );
  }
  defaultArgs(options = {}) {
    const { devtools = false, headless = !devtools, args = [], userDataDir = null } = options;
    const firefoxArguments = [];
    switch (os2.platform()) {
      case "darwin":
        firefoxArguments.push("--foreground");
        break;
      case "win32":
        firefoxArguments.push("--wait-for-browser");
        break;
    }
    if (userDataDir) {
      firefoxArguments.push("--profile");
      firefoxArguments.push(userDataDir);
    }
    if (headless) {
      firefoxArguments.push("--headless");
    }
    if (devtools) {
      firefoxArguments.push("--devtools");
    }
    if (args.every((arg) => {
      return arg.startsWith("-");
    })) {
      firefoxArguments.push("about:blank");
    }
    firefoxArguments.push(...args);
    return firefoxArguments;
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/PuppeteerNode.js
var PuppeteerNode = class extends Puppeteer {
  #launcher;
  #lastLaunchedBrowser;
  /**
   * @internal
   */
  defaultBrowserRevision;
  /**
   * @internal
   */
  configuration = {};
  /**
   * @internal
   */
  constructor(settings) {
    const { configuration: configuration2, ...commonSettings } = settings;
    super(commonSettings);
    if (configuration2) {
      this.configuration = configuration2;
    }
    switch (this.configuration.defaultBrowser) {
      case "firefox":
        this.defaultBrowserRevision = PUPPETEER_REVISIONS.firefox;
        break;
      default:
        this.configuration.defaultBrowser = "chrome";
        this.defaultBrowserRevision = PUPPETEER_REVISIONS.chrome;
        break;
    }
    this.connect = this.connect.bind(this);
    this.launch = this.launch.bind(this);
    this.executablePath = this.executablePath.bind(this);
    this.defaultArgs = this.defaultArgs.bind(this);
    this.trimCache = this.trimCache.bind(this);
  }
  /**
   * This method attaches Puppeteer to an existing browser instance.
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to browser instance.
   */
  connect(options) {
    return super.connect(options);
  }
  /**
   * Launches a browser instance with given arguments and options when
   * specified.
   *
   * When using with `puppeteer-core`,
   * {@link LaunchOptions.executablePath | options.executablePath} or
   * {@link LaunchOptions.channel | options.channel} must be provided.
   *
   * @example
   * You can use {@link LaunchOptions.ignoreDefaultArgs | options.ignoreDefaultArgs}
   * to filter out `--mute-audio` from default arguments:
   *
   * ```ts
   * const browser = await puppeteer.launch({
   *   ignoreDefaultArgs: ['--mute-audio'],
   * });
   * ```
   *
   * @remarks
   * Puppeteer can also be used to control the Chrome browser, but it works best
   * with the version of Chrome for Testing downloaded by default.
   * There is no guarantee it will work with any other version. If Google Chrome
   * (rather than Chrome for Testing) is preferred, a
   * {@link https://www.google.com/chrome/browser/canary.html | Chrome Canary}
   * or
   * {@link https://www.chromium.org/getting-involved/dev-channel | Dev Channel}
   * build is suggested. See
   * {@link https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/ | this article}
   * for a description of the differences between Chromium and Chrome.
   * {@link https://chromium.googlesource.com/chromium/src/+/lkgr/docs/chromium_browser_vs_google_chrome.md | This article}
   * describes some differences for Linux users. See
   * {@link https://developer.chrome.com/blog/chrome-for-testing/ | this doc} for the description
   * of Chrome for Testing.
   *
   * @param options - Options to configure launching behavior.
   */
  launch(options = {}) {
    const { browser = this.defaultBrowser } = options;
    this.#lastLaunchedBrowser = browser;
    switch (browser) {
      case "chrome":
        this.defaultBrowserRevision = PUPPETEER_REVISIONS.chrome;
        break;
      case "firefox":
        this.defaultBrowserRevision = PUPPETEER_REVISIONS.firefox;
        break;
      default:
        throw new Error(`Unknown product: ${browser}`);
    }
    this.#launcher = this.#getLauncher(browser);
    return this.#launcher.launch(options);
  }
  /**
   * @internal
   */
  #getLauncher(browser) {
    if (this.#launcher && this.#launcher.browser === browser) {
      return this.#launcher;
    }
    switch (browser) {
      case "chrome":
        return new ChromeLauncher(this);
      case "firefox":
        return new FirefoxLauncher(this);
      default:
        throw new Error(`Unknown product: ${browser}`);
    }
  }
  executablePath(optsOrChannel) {
    if (optsOrChannel === void 0) {
      return this.#getLauncher(this.lastLaunchedBrowser).executablePath(
        void 0,
        /* validatePath= */
        false
      );
    }
    if (typeof optsOrChannel === "string") {
      return this.#getLauncher("chrome").executablePath(
        optsOrChannel,
        /* validatePath= */
        false
      );
    }
    return this.#getLauncher(optsOrChannel.browser ?? this.lastLaunchedBrowser).resolveExecutablePath(
      optsOrChannel.headless,
      /* validatePath= */
      false
    );
  }
  /**
   * @internal
   */
  get browserVersion() {
    return this.configuration?.[this.lastLaunchedBrowser]?.version ?? this.defaultBrowserRevision;
  }
  /**
   * The default download path for puppeteer. For puppeteer-core, this
   * code should never be called as it is never defined.
   *
   * @internal
   */
  get defaultDownloadPath() {
    return this.configuration.cacheDirectory;
  }
  /**
   * The name of the browser that was last launched.
   */
  get lastLaunchedBrowser() {
    return this.#lastLaunchedBrowser ?? this.defaultBrowser;
  }
  /**
   * The name of the browser that will be launched by default. For
   * `puppeteer`, this is influenced by your configuration. Otherwise, it's
   * `chrome`.
   */
  get defaultBrowser() {
    return this.configuration.defaultBrowser ?? "chrome";
  }
  /**
   * @deprecated Do not use as this field as it does not take into account
   * multiple browsers of different types. Use
   * {@link PuppeteerNode.defaultBrowser | defaultBrowser} or
   * {@link PuppeteerNode.lastLaunchedBrowser | lastLaunchedBrowser}.
   *
   * @returns The name of the browser that is under automation.
   */
  get product() {
    return this.lastLaunchedBrowser;
  }
  /**
   * @param options - Set of configurable options to set on the browser.
   *
   * @returns The default arguments that the browser will be launched with.
   */
  defaultArgs(options = {}) {
    return this.#getLauncher(options.browser ?? this.lastLaunchedBrowser).defaultArgs(options);
  }
  /**
   * Removes all non-current Firefox and Chrome binaries in the cache directory
   * identified by the provided Puppeteer configuration. The current browser
   * version is determined by resolving PUPPETEER_REVISIONS from Puppeteer
   * unless `configuration.browserRevision` is provided.
   *
   * @remarks
   *
   * Note that the method does not check if any other Puppeteer versions
   * installed on the host that use the same cache directory require the
   * non-current binaries.
   *
   * @public
   */
  async trimCache() {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error("The current platform is not supported.");
    }
    const cacheDir = this.configuration.cacheDirectory;
    const installedBrowsers = await getInstalledBrowsers({
      cacheDir
    });
    const puppeteerBrowsers = [
      {
        product: "chrome",
        browser: Browser2.CHROME,
        currentBuildId: ""
      },
      {
        product: "firefox",
        browser: Browser2.FIREFOX,
        currentBuildId: ""
      }
    ];
    await Promise.all(puppeteerBrowsers.map(async (item) => {
      const tag = this.configuration?.[item.product]?.version ?? PUPPETEER_REVISIONS[item.product];
      item.currentBuildId = await resolveBuildId(item.browser, platform, tag);
    }));
    const currentBrowserBuilds = new Set(puppeteerBrowsers.map((browser) => {
      return `${browser.browser}_${browser.currentBuildId}`;
    }));
    const currentBrowsers = new Set(puppeteerBrowsers.map((browser) => {
      return browser.browser;
    }));
    for (const installedBrowser of installedBrowsers) {
      if (!currentBrowsers.has(installedBrowser.browser)) {
        continue;
      }
      if (currentBrowserBuilds.has(`${installedBrowser.browser}_${installedBrowser.buildId}`)) {
        continue;
      }
      await uninstall({
        browser: installedBrowser.browser,
        platform,
        cacheDir,
        buildId: installedBrowser.buildId
      });
    }
  }
};

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/node/ScreenRecorder.js
var import_debug = __toESM(require_src(), 1);
import { spawn, spawnSync } from "node:child_process";
import fs3 from "node:fs";
import os3 from "node:os";
import { dirname } from "node:path";
import { PassThrough } from "node:stream";
var __runInitializers3 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate3 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __setFunctionName = function(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var CRF_VALUE = 30;
var DEFAULT_FPS = 30;
var debugFfmpeg = (0, import_debug.default)("puppeteer:ffmpeg");
var ScreenRecorder = (() => {
  let _classSuper = PassThrough;
  let _instanceExtraInitializers = [];
  let _private_writeFrame_decorators;
  let _private_writeFrame_descriptor;
  let _stop_decorators;
  return class ScreenRecorder extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate3(this, _private_writeFrame_descriptor = { value: __setFunctionName(async function(buffer) {
        const error = await new Promise((resolve) => {
          this.#process.stdin.write(buffer, resolve);
        });
        if (error) {
          console.log(`ffmpeg failed to write: ${error.message}.`);
        }
      }, "#writeFrame") }, _private_writeFrame_decorators, { kind: "method", name: "#writeFrame", static: false, private: true, access: { has: (obj) => #writeFrame in obj, get: (obj) => obj.#writeFrame }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate3(this, null, _stop_decorators, { kind: "method", name: "stop", static: false, private: false, access: { has: (obj) => "stop" in obj, get: (obj) => obj.stop }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #page = __runInitializers3(this, _instanceExtraInitializers);
    #process;
    #controller = new AbortController();
    #lastFrame;
    #fps;
    /**
     * @internal
     */
    constructor(page, width, height, { ffmpegPath, speed, scale, crop, format, fps, loop, delay, quality, colors, path: path4, overwrite } = {}) {
      super({ allowHalfOpen: false });
      ffmpegPath ??= "ffmpeg";
      format ??= "webm";
      fps ??= DEFAULT_FPS;
      loop ||= -1;
      delay ??= -1;
      quality ??= CRF_VALUE;
      colors ??= 256;
      overwrite ??= true;
      this.#fps = fps;
      const { error } = spawnSync(ffmpegPath);
      if (error) {
        throw error;
      }
      const filters = [
        `crop='min(${width},iw):min(${height},ih):0:0'`,
        `pad=${width}:${height}:0:0`
      ];
      if (speed) {
        filters.push(`setpts=${1 / speed}*PTS`);
      }
      if (crop) {
        filters.push(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`);
      }
      if (scale) {
        filters.push(`scale=iw*${scale}:-1:flags=lanczos`);
      }
      const formatArgs = this.#getFormatArgs(format, fps, loop, delay, quality, colors);
      const vf = formatArgs.indexOf("-vf");
      if (vf !== -1) {
        filters.push(formatArgs.splice(vf, 2).at(-1) ?? "");
      }
      if (path4) {
        fs3.mkdirSync(dirname(path4), { recursive: overwrite });
      }
      this.#process = spawn(
        ffmpegPath,
        // See https://trac.ffmpeg.org/wiki/Encode/VP9 for more information on flags.
        [
          ["-loglevel", "error"],
          // Reduces general buffering.
          ["-avioflags", "direct"],
          // Reduces initial buffering while analyzing input fps and other stats.
          [
            "-fpsprobesize",
            "0",
            "-probesize",
            "32",
            "-analyzeduration",
            "0",
            "-fflags",
            "nobuffer"
          ],
          // Forces input to be read from standard input, and forces png input
          // image format.
          ["-f", "image2pipe", "-vcodec", "png", "-i", "pipe:0"],
          // No audio
          ["-an"],
          // This drastically reduces stalling when cpu is overbooked. By default
          // VP9 tries to use all available threads?
          ["-threads", "1"],
          // Specifies the frame rate we are giving ffmpeg.
          ["-framerate", `${fps}`],
          // Disable bitrate.
          ["-b:v", "0"],
          // Specifies the encoding and format we are using.
          formatArgs,
          // Filters to ensure the images are piped correctly,
          // combined with any format-specific filters.
          ["-vf", filters.join()],
          // Overwrite output, or exit immediately if file already exists.
          [overwrite ? "-y" : "-n"],
          "pipe:1"
        ].flat(),
        { stdio: ["pipe", "pipe", "pipe"] }
      );
      this.#process.stdout.pipe(this);
      this.#process.stderr.on("data", (data) => {
        debugFfmpeg(data.toString("utf8"));
      });
      this.#page = page;
      const { client } = this.#page.mainFrame();
      client.once(CDPSessionEvent.Disconnected, () => {
        void this.stop().catch(debugError);
      });
      this.#lastFrame = lastValueFrom(fromEmitterEvent(client, "Page.screencastFrame").pipe(tap((event) => {
        void client.send("Page.screencastFrameAck", {
          sessionId: event.sessionId
        });
      }), filter((event) => {
        return event.metadata.timestamp !== void 0;
      }), map((event) => {
        return {
          buffer: Buffer.from(event.data, "base64"),
          timestamp: event.metadata.timestamp
        };
      }), bufferCount(2, 1), concatMap(([{ timestamp: previousTimestamp, buffer }, { timestamp }]) => {
        return from(Array(Math.round(fps * Math.max(timestamp - previousTimestamp, 0))).fill(buffer));
      }), map((buffer) => {
        void this.#writeFrame(buffer);
        return [buffer, performance.now()];
      }), takeUntil(fromEvent(this.#controller.signal, "abort"))), { defaultValue: [Buffer.from([]), performance.now()] });
    }
    #getFormatArgs(format, fps, loop, delay, quality, colors) {
      const libvpx = [
        ["-vcodec", "vp9"],
        // Sets the quality. Lower the better.
        ["-crf", `${quality}`],
        // Sets the quality and how efficient the compression will be.
        [
          "-deadline",
          "realtime",
          "-cpu-used",
          `${Math.min(os3.cpus().length / 2, 8)}`
        ]
      ];
      switch (format) {
        case "webm":
          return [
            ...libvpx,
            // Sets the format
            ["-f", "webm"]
          ].flat();
        case "gif":
          fps = DEFAULT_FPS === fps ? 20 : "source_fps";
          if (loop === Infinity) {
            loop = 0;
          }
          if (delay !== -1) {
            delay /= 10;
          }
          return [
            // Sets the frame rate and uses a custom palette generated from the
            // input.
            [
              "-vf",
              `fps=${fps},split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer`
            ],
            // Sets the number of times to loop playback.
            ["-loop", `${loop}`],
            // Sets the delay between iterations of a loop.
            ["-final_delay", `${delay}`],
            // Sets the format
            ["-f", "gif"]
          ].flat();
        case "mp4":
          return [
            ...libvpx,
            // Fragment file during stream to avoid errors.
            ["-movflags", "hybrid_fragmented"],
            // Sets the format
            ["-f", "mp4"]
          ].flat();
      }
    }
    get #writeFrame() {
      return _private_writeFrame_descriptor.value;
    }
    /**
     * Stops the recorder.
     *
     * @public
     */
    async stop() {
      if (this.#controller.signal.aborted) {
        return;
      }
      await this.#page._stopScreencast().catch(debugError);
      this.#controller.abort();
      const [buffer, timestamp] = await this.#lastFrame;
      await Promise.all(Array(Math.max(1, Math.round(this.#fps * (performance.now() - timestamp) / 1e3))).fill(buffer).map(this.#writeFrame.bind(this)));
      this.#process.stdin.end();
      await new Promise((resolve) => {
        this.#process.once("close", resolve);
      });
    }
    /**
     * @internal
     */
    async [(_private_writeFrame_decorators = [guarded()], _stop_decorators = [guarded()], asyncDisposeSymbol)]() {
      await this.stop();
    }
  };
})();

// ../../node_modules/.pnpm/puppeteer-core@24.40.0/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js
import fs4 from "node:fs";
import path3 from "node:path";
environment.value = {
  fs: fs4,
  path: path3,
  ScreenRecorder
};
var puppeteer = new PuppeteerNode({
  isPuppeteerCore: true
});
var {
  /**
   * @public
   */
  connect,
  /**
   * @public
   */
  defaultArgs,
  /**
   * @public
   */
  executablePath,
  /**
   * @public
   */
  launch: launch2
} = puppeteer;

// ../../node_modules/.pnpm/puppeteer@24.40.0_typescript@5.9.3/node_modules/puppeteer/lib/esm/puppeteer/getConfiguration.js
var import_cosmiconfig = __toESM(require_dist(), 1);
import { homedir } from "node:os";
import { join as join2 } from "node:path";
function getBooleanEnvVar(name) {
  const env = process.env[name];
  if (env === void 0) {
    return;
  }
  switch (env.toLowerCase()) {
    case "":
    case "0":
    case "false":
    case "off":
      return false;
    default:
      return true;
  }
}
function isSupportedBrowser(product) {
  switch (product) {
    case "chrome":
    case "firefox":
      return true;
    default:
      return false;
  }
}
function getDefaultBrowser(browser) {
  if (browser && !isSupportedBrowser(browser)) {
    throw new Error(`Unsupported browser ${browser}`);
  }
  switch (browser) {
    case "firefox":
      return "firefox";
    default:
      return "chrome";
  }
}
function getLogLevel(logLevel) {
  switch (logLevel) {
    case "silent":
      return "silent";
    case "error":
      return "error";
    default:
      return "warn";
  }
}
function getBrowserSetting(browser, configuration2, defaultConfig = {}) {
  if (configuration2.skipDownload) {
    return {
      skipDownload: true
    };
  }
  const browserSetting = {};
  const browserEnvName = browser.replaceAll("-", "_").toUpperCase();
  browserSetting.version = process.env[`PUPPETEER_${browserEnvName}_VERSION`] ?? configuration2[browser]?.version ?? defaultConfig.version;
  browserSetting.downloadBaseUrl = process.env[`PUPPETEER_${browserEnvName}_DOWNLOAD_BASE_URL`] ?? configuration2[browser]?.downloadBaseUrl ?? defaultConfig.downloadBaseUrl;
  browserSetting.skipDownload = getBooleanEnvVar(`PUPPETEER_${browserEnvName}_SKIP_DOWNLOAD`) ?? getBooleanEnvVar(`PUPPETEER_SKIP_${browserEnvName}_DOWNLOAD`) ?? configuration2[browser]?.skipDownload ?? defaultConfig.skipDownload;
  return browserSetting;
}
var getConfiguration = () => {
  const result = (0, import_cosmiconfig.cosmiconfigSync)("puppeteer", {
    searchStrategy: "global"
  }).search();
  const configuration2 = result ? { ...result.config } : {};
  configuration2.logLevel = getLogLevel(process.env["PUPPETEER_LOGLEVEL"] ?? configuration2.logLevel);
  configuration2.defaultBrowser = getDefaultBrowser(process.env["PUPPETEER_BROWSER"] ?? configuration2.defaultBrowser);
  configuration2.executablePath = process.env["PUPPETEER_EXECUTABLE_PATH"] ?? configuration2.executablePath;
  if (configuration2.executablePath) {
    configuration2.skipDownload = true;
  }
  configuration2.skipDownload = getBooleanEnvVar("PUPPETEER_SKIP_DOWNLOAD") ?? configuration2.skipDownload;
  configuration2.chrome = getBrowserSetting("chrome", configuration2);
  configuration2["chrome-headless-shell"] = getBrowserSetting("chrome-headless-shell", configuration2);
  configuration2.firefox = getBrowserSetting("firefox", configuration2, {
    skipDownload: true
  });
  configuration2.cacheDirectory = process.env["PUPPETEER_CACHE_DIR"] ?? configuration2.cacheDirectory ?? join2(homedir(), ".cache", "puppeteer");
  configuration2.temporaryDirectory = process.env["PUPPETEER_TMP_DIR"] ?? configuration2.temporaryDirectory;
  configuration2.experiments ??= {};
  return configuration2;
};

// ../../node_modules/.pnpm/puppeteer@24.40.0_typescript@5.9.3/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js
var configuration = getConfiguration();
var puppeteer2 = new PuppeteerNode({
  isPuppeteerCore: false,
  configuration
});
var {
  /**
   * @public
   */
  connect: connect2,
  /**
   * @public
   */
  defaultArgs: defaultArgs2,
  /**
   * @public
   */
  executablePath: executablePath2,
  /**
   * @public
   */
  launch: launch3,
  /**
   * @public
   */
  trimCache
} = puppeteer2;
var puppeteer_default = puppeteer2;

export {
  puppeteer_default
};
/*! Bundled license information:

cosmiconfig/dist/loaders.js:
cosmiconfig/dist/util.js:
  (* istanbul ignore next -- @preserve *)

cosmiconfig/dist/ExplorerBase.js:
  (* istanbul ignore if -- @preserve *)
  (* istanbul ignore next -- @preserve *)

cosmiconfig/dist/Explorer.js:
cosmiconfig/dist/ExplorerSync.js:
  (* istanbul ignore if -- @preserve *)

puppeteer-core/lib/esm/puppeteer/api/api.js:
puppeteer-core/lib/esm/puppeteer/common/NetworkManagerEvents.js:
puppeteer-core/lib/esm/puppeteer/cdp/DeviceRequestPrompt.js:
puppeteer-core/lib/esm/puppeteer/cdp/IsolatedWorlds.js:
puppeteer-core/lib/esm/puppeteer/cdp/FrameTree.js:
puppeteer-core/lib/esm/puppeteer/cdp/NetworkEventManager.js:
puppeteer-core/lib/esm/puppeteer/cdp/TargetManager.js:
puppeteer-core/lib/esm/puppeteer/common/common.js:
puppeteer-core/lib/esm/puppeteer/util/util.js:
puppeteer-core/lib/esm/puppeteer/node/node.js:
  (**
   * @license
   * Copyright 2022 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/Binding.js:
puppeteer-core/lib/esm/puppeteer/cdp/CdpPreloadScript.js:
puppeteer-core/lib/esm/puppeteer/cdp/BrowserContext.js:
puppeteer-core/lib/esm/puppeteer/cdp/TargetManageEvents.js:
  (**
   * @license
   * Copyright 2024 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/CdpSession.js:
puppeteer-core/lib/esm/puppeteer/cdp/Connection.js:
puppeteer-core/lib/esm/puppeteer/cdp/Dialog.js:
puppeteer-core/lib/esm/puppeteer/cdp/utils.js:
puppeteer-core/lib/esm/puppeteer/cdp/ExecutionContext.js:
puppeteer-core/lib/esm/puppeteer/cdp/Frame.js:
puppeteer-core/lib/esm/puppeteer/cdp/NetworkManager.js:
puppeteer-core/lib/esm/puppeteer/cdp/FrameManager.js:
puppeteer-core/lib/esm/puppeteer/common/USKeyboardLayout.js:
puppeteer-core/lib/esm/puppeteer/cdp/Input.js:
puppeteer-core/lib/esm/puppeteer/cdp/Page.js:
puppeteer-core/lib/esm/puppeteer/cdp/Browser.js:
puppeteer-core/lib/esm/puppeteer/common/Device.js:
puppeteer-core/lib/esm/puppeteer/common/Puppeteer.js:
puppeteer-core/lib/esm/puppeteer/index-browser.js:
puppeteer-core/lib/esm/puppeteer/node/BrowserLauncher.js:
puppeteer-core/lib/esm/puppeteer/index.js:
puppeteer-core/lib/esm/puppeteer/puppeteer-core.js:
puppeteer/lib/esm/puppeteer/puppeteer.js:
  (**
   * @license
   * Copyright 2017 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/JSHandle.js:
puppeteer-core/lib/esm/puppeteer/cdp/ElementHandle.js:
puppeteer-core/lib/esm/puppeteer/cdp/IsolatedWorld.js:
puppeteer-core/lib/esm/puppeteer/cdp/LifecycleWatcher.js:
puppeteer-core/lib/esm/puppeteer/cdp/Target.js:
  (**
   * @license
   * Copyright 2019 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/FrameManagerEvents.js:
puppeteer-core/lib/esm/puppeteer/cdp/cdp.js:
puppeteer-core/lib/esm/puppeteer/bidi/BrowserConnector.js:
puppeteer-core/lib/esm/puppeteer/common/BrowserConnector.js:
puppeteer-core/lib/esm/puppeteer/node/util/fs.js:
puppeteer-core/lib/esm/puppeteer/node/ChromeLauncher.js:
puppeteer-core/lib/esm/puppeteer/node/FirefoxLauncher.js:
puppeteer-core/lib/esm/puppeteer/node/ScreenRecorder.js:
puppeteer/lib/esm/puppeteer/getConfiguration.js:
  (**
   * @license
   * Copyright 2023 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/BrowserConnector.js:
puppeteer-core/lib/esm/puppeteer/common/TaskQueue.js:
puppeteer-core/lib/esm/puppeteer/revisions.js:
puppeteer-core/lib/esm/puppeteer/node/PuppeteerNode.js:
  (**
   * @license
   * Copyright 2020 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/esm/puppeteer/cdp/PredefinedNetworkConditions.js:
  (**
   * @license
   * Copyright 2021 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
