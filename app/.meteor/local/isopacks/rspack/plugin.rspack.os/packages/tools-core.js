Package["core-runtime"].queue("tools-core",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"tools-core":{"tools-core.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/tools-core.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.link('./lib/log',{"*":"*"},0);module.link('./lib/meteor',{"*":"*"},1);module.link('./lib/npm',{"*":"*"},2);module.link('./lib/process',{"*":"*"},3);module.link('./lib/global-state',{"*":"*"},4);module.link('./lib/git',{"*":"*"},5);module.link('./lib/string',{"*":"*"},6);module.link('./lib/ignore',{"*":"*"},7);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();







//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"git.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/git.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({isGitRepository:()=>isGitRepository,gitignoreExists:()=>gitignoreExists,ensureGitignoreExists:()=>ensureGitignoreExists,getMissingGitignoreEntries:()=>getMissingGitignoreEntries,addGitignoreEntries:()=>addGitignoreEntries});let fs;module.link('fs',{default(v){fs=v}},0);let path;module.link('path',{default(v){path=v}},1);let logError,logProgress,logSuccess;module.link('./log',{logError(v){logError=v},logProgress(v){logProgress=v},logSuccess(v){logSuccess=v}},2);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();


/**
 * Checks if the given directory is a git repository
 * @param {string} dir - Directory to check
 * @returns {boolean} - True if the directory is a git repository
 */ function isGitRepository(dir) {
    try {
        const gitDir = path.join(dir, '.git');
        return fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory();
    } catch (error) {
        return false;
    }
}
/**
 * Checks if a .gitignore file exists in the given directory
 * @param {string} dir - Directory to check
 * @returns {boolean} - True if .gitignore exists
 */ function gitignoreExists(dir) {
    try {
        const gitignorePath = path.join(dir, '.gitignore');
        return fs.existsSync(gitignorePath);
    } catch (error) {
        return false;
    }
}
/**
 * Creates a .gitignore file in the given directory if it doesn't exist
 * @param {string} dir - Directory where to create .gitignore
 * @param {string[]} [initialEntries=[]] - Initial entries to add to the .gitignore file
 * @returns {boolean} - True if .gitignore was created or already exists
 */ function ensureGitignoreExists(dir, initialEntries = []) {
    const gitignorePath = path.join(dir, '.gitignore');
    if (!gitignoreExists(dir)) {
        try {
            const content = initialEntries.length > 0 ? initialEntries.join('\n') + '\n' : '';
            fs.writeFileSync(gitignorePath, content, 'utf8');
            return true;
        } catch (error) {
            logError(`=> Failed to create .gitignore: ${error.message}`);
            return false;
        }
    }
    return true;
}
/**
 * Checks if specific entries exist in the .gitignore file
 * @param {string} dir - Directory containing the .gitignore file
 * @param {string[]} entries - Entries to check
 * @returns {string[]} - Entries that don't exist in the .gitignore file
 */ function getMissingGitignoreEntries(dir, entries) {
    if (!gitignoreExists(dir)) {
        return entries;
    }
    try {
        const gitignorePath = path.join(dir, '.gitignore');
        const content = fs.readFileSync(gitignorePath, 'utf8');
        const lines = content.split('\n').map((line)=>line.trim());
        return entries.filter((entry)=>!lines.includes(entry));
    } catch (error) {
        logError(`=> Failed to read .gitignore: ${error.message}`);
        return entries;
    }
}
/**
 * Adds entries to the .gitignore file if they don't exist
 * @param {string} dir - Directory containing the .gitignore file
 * @param {string[]} entries - Entries to add
 * @param {string} [context] - Optional context to add as a comment before the entries
 * @returns {boolean} - True if entries were added successfully
 */ function addGitignoreEntries(dir, entries, context = '') {
    // Ensure .gitignore exists
    if (!ensureGitignoreExists(dir)) {
        return false;
    }
    // Get entries that don't exist
    const missingEntries = getMissingGitignoreEntries(dir, entries);
    if (missingEntries.length === 0) {
        return true; // All entries already exist
    }
    logProgress(`=> Adding gitignore entries${context ? ` for ${context}` : ''}: ${missingEntries.join(', ')}`);
    try {
        const gitignorePath = path.join(dir, '.gitignore');
        let content = '';
        if (fs.existsSync(gitignorePath)) {
            content = fs.readFileSync(gitignorePath, 'utf8');
            // Ensure there's a newline at the end if the file is not empty
            if (content.length > 0 && !content.endsWith('\n')) {
                content += '\n';
            }
        }
        // Add context as a comment if provided
        if (context) {
            content += `\n# ${context}\n`;
        }
        content += missingEntries.join('\n') + '\n';
        fs.writeFileSync(gitignorePath, content, 'utf8');
        logSuccess(`=> Added gitignore entries${context ? ` for ${context}` : ''}`);
        return true;
    } catch (error) {
        logError(`=> Failed to add gitignore entries${context ? ` for ${context}` : ''}: ${error.message}`);
        return false;
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"global-state.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/global-state.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({getGlobalState:()=>getGlobalState,setGlobalState:()=>setGlobalState,removeGlobalState:()=>removeGlobalState,clearGlobalState:()=>clearGlobalState});/**
 * Global state management for Meteor packages.
 * This module provides a way to store and retrieve global state that persists across file changes.
 */ /**
 * Gets a value from the global state.
 * @param {string} key - The key to retrieve.
 * @param {any} defaultValue - The default value to return if the key doesn't exist.
 * @returns {any} The value associated with the key, or the default value if not found.
 */ function getGlobalState(key, defaultValue) {
    var _Package_meteor_global, _Package_meteor;
    return ((_Package_meteor = Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : _Package_meteor_global[key]) !== undefined ? Package.meteor.global.persistentState[key] : defaultValue;
}
/**
 * Sets a value in the global state.
 * @param {string} key - The key to set.
 * @param {any} value - The value to associate with the key.
 */ function setGlobalState(key, value) {
    var _Package;
    // Create a namespace for our global state if it doesn't exist
    if (!((_Package = Package) === null || _Package === void 0 ? void 0 : _Package.meteor.global.persistentState)) {
        Package.meteor.global.persistentState = {};
    }
    Package.meteor.global.persistentState[key] = value;
}
/**
 * Removes a key from the global state.
 * @param {string} key - The key to remove.
 */ function removeGlobalState(key) {
    delete Package.meteor.global.persistentState[key];
}
/**
 * Clears all keys from the global state.
 */ function clearGlobalState() {
    Package.meteor.global.persistentState = {};
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ignore.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/ignore.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({buildUnignorePatterns:()=>buildUnignorePatterns});/**
 * Build gitignore-style "unignore" patterns for specific files/folders.
 *
 * Rules:
 *  - Files:  !a/  !a/b/  !a/b/c.txt
 *  - Folders (must end with '/'):
 *            !a/  !a/b/  !a/b/c/  !a/b/c/**
 *
 * @param {string[]} inputPaths  Paths to keep. Use '/' for dirs (e.g. 'assets/public/').
 * @param {Object} [options]
 * @param {boolean} [options.includeAllAncestors=true]  If false, only include the immediate parent dir.
 * @param {boolean} [options.includeGlobForDirs=true]   Emit '**' for directories.
 * @param {number} [options.skipLevel=0]               Skip this many levels from the beginning.
 * @returns {string[]} Negation patterns, in correct order.
 */ function buildUnignorePatterns(inputPaths, { includeAllAncestors = true, includeGlobForDirs = true, skipLevel = 0 } = {}) {
    const out = [];
    const seen = new Set();
    const push = (p)=>{
        if (!seen.has(p)) {
            seen.add(p);
            out.push(p);
        }
    };
    for (let raw of inputPaths){
        if (!raw || typeof raw !== 'string') continue;
        // Normalize: forward slashes, drop leading './', collapse double slashes
        let anchored = raw.startsWith('/');
        let p = raw.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/{2,}/g, '/');
        // detect dir by trailing slash
        const isDir = p.endsWith('/');
        // strip leading + trailing slashes for splitting, but remember anchoring
        const core = p.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!core) continue;
        const parts = core.split('/');
        // Process based on skipLevel
        if (skipLevel >= parts.length) {
            continue;
        }
        // Ancestors (top-down)
        if (includeAllAncestors) {
            // Start from skipLevel + 1 to skip the specified number of levels
            const startLevel = Math.max(1, skipLevel + 1);
            for(let i = startLevel; i <= parts.length - 1; i++){
                const anc = (anchored ? '/' : '') + parts.slice(0, i).join('/') + '/';
                push('!' + anc);
            }
        } else if (parts.length > 1) {
            // Only immediate parent
            // For minimal mode with skipLevel, we need to check if the parent is at a level we should skip
            if (skipLevel < parts.length - 1) {
                // Check if the parent's level is greater than skipLevel
                const parentLevel = parts.length - 1;
                if (parentLevel > skipLevel) {
                    const parent = (anchored ? '/' : '') + parts.slice(0, parts.length - 1).join('/') + '/';
                    push('!' + parent);
                }
            }
        }
        // Add the file/directory pattern
        if (isDir) {
            const dir = (anchored ? '/' : '') + parts.join('/') + '/';
            push('!' + dir);
            if (includeGlobForDirs) push('!' + dir + '**');
        } else {
            const file = (anchored ? '/' : '') + parts.join('/');
            push('!' + file);
        }
    }
    return out;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"log.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/log.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({padMessage:()=>padMessage,logProgress:()=>logProgress,logError:()=>logError,logInfo:()=>logInfo,logRaw:()=>logRaw,logSuccess:()=>logSuccess,getRunLog:()=>getRunLog});// Check if colors should be disabled
const shouldDisableColors = !!process.env.METEOR_DISABLE_COLORS;
// Minimum message length for consistent log formatting
const MIN_MESSAGE_LENGTH = 80;
// ANSI color codes
const colors = {
    reset: shouldDisableColors ? "" : "\x1b[0m",
    blue: shouldDisableColors ? "" : "\x1b[34m",
    red: shouldDisableColors ? "" : "\x1b[31m",
    purple: shouldDisableColors ? "" : "\x1b[35m",
    green: shouldDisableColors ? "" : "\x1b[32m",
    cyan: shouldDisableColors ? "" : "\x1b[36m"
};
/**
 * Pad a message to ensure it has a minimum length
 * @param {string} message - The message to pad
 * @param {number} minLength - The minimum length (default: MIN_MESSAGE_LENGTH)
 * @returns {string} The padded message
 */ function padMessage(message, minLength = MIN_MESSAGE_LENGTH) {
    if (message.length >= minLength) {
        return message;
    }
    return message.padEnd(minLength);
}
/**
 * Log a progress message in blue
 * @param {string} message - The message to log
 */ function logProgress(message) {
    console.log(`${colors.blue}${padMessage(message)}${colors.reset}`);
}
/**
 * Log an error message in red
 * @param {string} message - The message to log
 */ function logError(message) {
    console.error(`${colors.red}${padMessage(message)}${colors.reset}`);
}
/**
 * Log an info message in cyan
 * @param {string} message - The message to log
 */ function logInfo(message) {
    console.log(`${colors.cyan}${padMessage(message)}${colors.reset}`);
}
/**
 * Log a raw message without any color
 * @param {string} message - The message to log
 */ function logRaw(message) {
    console.log(padMessage(message));
}
/**
 * Log a success message in green
 * @param {string} message - The message to log
 */ function logSuccess(message) {
    console.log(`${colors.green}${padMessage(message)}${colors.reset}`);
}
/**
 * Get the runLogInstance from the Plugin object if it exists
 * @returns {Object|undefined} The runLogInstance or undefined
 */ function getRunLog() {
    if (typeof Plugin !== 'undefined') {
        return Plugin.runLogInstance;
    }
    return undefined;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/meteor.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({getMeteorAppDir:()=>getMeteorAppDir,getMeteorAppPackageJson:()=>getMeteorAppPackageJson,getMeteorAppConfig:()=>getMeteorAppConfig,getMeteorAppPort:()=>getMeteorAppPort,getMeteorAppConfigModern:()=>getMeteorAppConfigModern,isMeteorAppConfigModernVerbose:()=>isMeteorAppConfigModernVerbose,hasMeteorAppConfigAutoInstallDeps:()=>hasMeteorAppConfigAutoInstallDeps,getMeteorAppEntrypoints:()=>getMeteorAppEntrypoints,getMeteorInitialAppEntrypoints:()=>getMeteorInitialAppEntrypoints,isMeteorAppTestModule:()=>isMeteorAppTestModule,setMeteorAppEntrypoints:()=>setMeteorAppEntrypoints,setMeteorAppIgnore:()=>setMeteorAppIgnore,isMeteorAppRun:()=>isMeteorAppRun,isMeteorAppBuild:()=>isMeteorAppBuild,isMeteorAppUpdate:()=>isMeteorAppUpdate,isMeteorAppTest:()=>isMeteorAppTest,isMeteorAppTestFullApp:()=>isMeteorAppTestFullApp,isMeteorAppTestWatch:()=>isMeteorAppTestWatch,isMeteorAppNativeAndroid:()=>isMeteorAppNativeAndroid,isMeteorAppNativeIos:()=>isMeteorAppNativeIos,isMeteorAppNative:()=>isMeteorAppNative,isMeteorAppDevelopment:()=>isMeteorAppDevelopment,isMeteorAppProduction:()=>isMeteorAppProduction,isMeteorAppDebug:()=>isMeteorAppDebug,isMeteorAppProfile:()=>isMeteorAppProfile,setMeteorAppCustomScriptUrl:()=>setMeteorAppCustomScriptUrl,getMeteorAppPackages:()=>getMeteorAppPackages,getMeteorAppFilesAndFolders:()=>getMeteorAppFilesAndFolders,getMeteorToolsRequire:()=>getMeteorToolsRequire,isMeteorBlazeProject:()=>isMeteorBlazeProject,isMeteorBlazeHotProject:()=>isMeteorBlazeHotProject,isMeteorCoffeescriptProject:()=>isMeteorCoffeescriptProject,isMeteorLessProject:()=>isMeteorLessProject,isMeteorScssProject:()=>isMeteorScssProject,isMeteorBundleVisualizerProject:()=>isMeteorBundleVisualizerProject,isMeteorTypescriptProject:()=>isMeteorTypescriptProject,isMeteorPackagesTest:()=>isMeteorPackagesTest,getMeteorEnvPackageDirs:()=>getMeteorEnvPackageDirs,inheritMeteorToolNodeFlags:()=>inheritMeteorToolNodeFlags});function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const fs = require('fs');
const path = require('path');
const { logError } = require("./log");
// Normalize a path to always use forward slashes (POSIX style).
// Module identifiers must use '/' regardless of OS.
const toPosix = (p)=>p.replace(/\\/g, '/');
/**
 * Returns the current working directory of the Meteor application.
 * @returns {string} The absolute path to the Meteor application directory.
 */ function getMeteorAppDir() {
    return process.cwd();
}
/**
 * Reads and parses the package.json file of the Meteor application.
 * @returns {Object} The parsed content of the package.json file.
 */ function getMeteorAppPackageJson() {
    return JSON.parse(fs.readFileSync(`${getMeteorAppDir()}/package.json`, 'utf-8'));
}
/**
 * Retrieves the Meteor configuration from the application's package.json.
 * @returns {Object|undefined} The Meteor configuration object or undefined if not found.
 */ function getMeteorAppConfig() {
    var _Plugin, _getMeteorAppPackageJson;
    return typeof ((_Plugin = Plugin) === null || _Plugin === void 0 ? void 0 : _Plugin.getMeteorConfig) === 'function' ? Plugin.getMeteorConfig() : (_getMeteorAppPackageJson = getMeteorAppPackageJson()) === null || _getMeteorAppPackageJson === void 0 ? void 0 : _getMeteorAppPackageJson.meteor;
}
/**
 * Get Meteor's app port
 * @returns {false|*}
 */ function getMeteorAppPort() {
    var _Package_meteor_global_currentCommand_options, _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return ((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options = _Package_meteor_global_currentCommand.options) === null || _Package_meteor_global_currentCommand_options === void 0 ? void 0 : _Package_meteor_global_currentCommand_options['port']) || process.env.PORT || '3000';
}
/**
 * Retrieves the modern configuration from the application's package.json.
 * @returns {Object|undefined} The modern configuration object or undefined if not found.
 */ function getMeteorAppConfigModern() {
    var _getMeteorAppConfig;
    return (_getMeteorAppConfig = getMeteorAppConfig()) === null || _getMeteorAppConfig === void 0 ? void 0 : _getMeteorAppConfig.modern;
}
/**
 * Retrieves the verbose flag from the application's package.json.
 * @returns {boolean|undefined} The verbose flag or undefined if not found.
 */ function isMeteorAppConfigModernVerbose() {
    var _getMeteorAppConfigModern, _getMeteorAppConfigModern_transpiler, _getMeteorAppConfigModern1;
    return ((_getMeteorAppConfigModern = getMeteorAppConfigModern()) === null || _getMeteorAppConfigModern === void 0 ? void 0 : _getMeteorAppConfigModern.verbose) || ((_getMeteorAppConfigModern1 = getMeteorAppConfigModern()) === null || _getMeteorAppConfigModern1 === void 0 ? void 0 : (_getMeteorAppConfigModern_transpiler = _getMeteorAppConfigModern1.transpiler) === null || _getMeteorAppConfigModern_transpiler === void 0 ? void 0 : _getMeteorAppConfigModern_transpiler.verbose) || false;
}
/**
 * Retrieves the auto install deps flag from the app's package.json.
 * @returns {Boolean|*}
 */ function hasMeteorAppConfigAutoInstallDeps() {
    const { autoInstallDeps = true } = getMeteorAppConfig() || {};
    return !!autoInstallDeps;
}
/**
 * Retrieves the entry points for the Meteor application from the configuration.
 * Uses Plugin.getMeteorConfig() if available, otherwise falls back to getMeteorAppConfig().
 * @returns {Object} An object containing the main and test entry points for client and server.
 * @returns {string|undefined} mainClient - The client main module path.
 * @returns {string|undefined} mainServer - The server main module path.
 * @returns {string|undefined} testClient - The client test module path.
 * @returns {string|undefined} testServer - The server test module path.
 */ function getMeteorAppEntrypoints() {
    var _meteorConfig_mainModule, _meteorConfig_mainModule1, _meteorConfig_testModule, _meteorConfig_testModule1;
    const meteorConfig = getMeteorAppConfig();
    return {
        mainClient: meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_mainModule = meteorConfig.mainModule) === null || _meteorConfig_mainModule === void 0 ? void 0 : _meteorConfig_mainModule.client,
        mainServer: meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_mainModule1 = meteorConfig.mainModule) === null || _meteorConfig_mainModule1 === void 0 ? void 0 : _meteorConfig_mainModule1.server,
        testClient: (meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule = meteorConfig.testModule) === null || _meteorConfig_testModule === void 0 ? void 0 : _meteorConfig_testModule.client) || (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.testModule),
        testServer: (meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule1 = meteorConfig.testModule) === null || _meteorConfig_testModule1 === void 0 ? void 0 : _meteorConfig_testModule1.server) || (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.testModule)
    };
}
/**
 * Retrieves the initial entry points for the Meteor application from the package.json.
 * @returns {Object} An object containing the main and test entry points for client and server.
 * @returns {string|undefined} mainClient - The client main module path.
 * @returns {string|undefined} mainClientHtml - The client main html path.
 * @returns {string|undefined} mainServer - The server main module path.
 * @returns {string|undefined} testClient - The client test module path.
 * @returns {string|undefined} testServer - The server test module path.
 */ function getMeteorInitialAppEntrypoints() {
    var _getMeteorAppPackageJson, _meteorConfig_mainModule, _meteorConfig_mainModule1, _meteorConfig_testModule, _meteorConfig_testModule1, _meteorConfig_testModule2, _meteorConfig_testModule3, _meteorConfig_testModule4, _meteorConfig_testModule5;
    const meteorConfig = (_getMeteorAppPackageJson = getMeteorAppPackageJson()) === null || _getMeteorAppPackageJson === void 0 ? void 0 : _getMeteorAppPackageJson.meteor;
    const mainClient = meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_mainModule = meteorConfig.mainModule) === null || _meteorConfig_mainModule === void 0 ? void 0 : _meteorConfig_mainModule.client;
    let mainClientHtml;
    if (mainClient) {
        const clientDir = path.dirname(mainClient);
        const clientBasename = path.basename(mainClient, path.extname(mainClient));
        const htmlPath = path.join(getMeteorAppDir(), clientDir, `${clientBasename}.html`);
        if (fs.existsSync(htmlPath)) {
            mainClientHtml = toPosix(path.join(clientDir, `${clientBasename}.html`));
        } else {
            // Find first html in entry folder
            const files = fs.readdirSync(path.join(getMeteorAppDir(), clientDir));
            const htmlFile = files.find((file)=>path.extname(file) === ".html");
            if (htmlFile) {
                mainClientHtml = toPosix(path.join(clientDir, htmlFile));
            }
        }
    }
    return _object_spread({
        mainClient,
        mainClientHtml,
        mainServer: meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_mainModule1 = meteorConfig.mainModule) === null || _meteorConfig_mainModule1 === void 0 ? void 0 : _meteorConfig_mainModule1.server
    }, (meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule = meteorConfig.testModule) === null || _meteorConfig_testModule === void 0 ? void 0 : _meteorConfig_testModule.client) && {
        testClient: meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule1 = meteorConfig.testModule) === null || _meteorConfig_testModule1 === void 0 ? void 0 : _meteorConfig_testModule1.client
    }, (meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule2 = meteorConfig.testModule) === null || _meteorConfig_testModule2 === void 0 ? void 0 : _meteorConfig_testModule2.server) && {
        testServer: meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule3 = meteorConfig.testModule) === null || _meteorConfig_testModule3 === void 0 ? void 0 : _meteorConfig_testModule3.server
    }, !(meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule4 = meteorConfig.testModule) === null || _meteorConfig_testModule4 === void 0 ? void 0 : _meteorConfig_testModule4.client) && !(meteorConfig === null || meteorConfig === void 0 ? void 0 : (_meteorConfig_testModule5 = meteorConfig.testModule) === null || _meteorConfig_testModule5 === void 0 ? void 0 : _meteorConfig_testModule5.server) && {
        testModule: meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.testModule
    });
}
/**
 * Checks if the current Meteor project is configured as test module.
 * @returns {boolean}
 */ function isMeteorAppTestModule() {
    return getMeteorInitialAppEntrypoints().testModule != null;
}
/**
 * Sets the Meteor application entry points in environment variables.
 * @param {Object} options - The entry points configuration object.
 * @param {string} [options.mainClient] - The client main module path.
 * @param {string} [options.mainServer] - The server main module path.
 * @param {string} [options.testModule] - The test module path.
 * @param {string} [options.testClient] - The client test module path.
 * @param {string} [options.testServer] - The server test module path.
 */ function setMeteorAppEntrypoints({ mainClient, mainServer, testModule, testClient, testServer }) {
    var _global_reinitializeMeteorConfig, _global;
    if (mainClient) {
        process.env.METEOR_CONFIG_CLIENT = mainClient;
    }
    if (mainServer) {
        process.env.METEOR_CONFIG_SERVER = mainServer;
    }
    if (testModule) {
        process.env.METEOR_CONFIG_TEST = testModule;
    } else {
        if (testClient) {
            process.env.METEOR_CONFIG_TEST_CLIENT = testClient;
        }
        if (testServer) {
            process.env.METEOR_CONFIG_TEST_SERVER = testServer;
        }
    }
    (_global_reinitializeMeteorConfig = (_global = global).reinitializeMeteorConfig) === null || _global_reinitializeMeteorConfig === void 0 ? void 0 : _global_reinitializeMeteorConfig.call(_global);
}
/**
 * Sets patterns to be ignored by the Meteor application in the environment variable.
 * Appends the new ignore pattern to any existing ones.
 * @param {string} ignore - The pattern to be ignored.
 */ function setMeteorAppIgnore(ignore) {
    process.env.METEOR_IGNORE = `${process.env.METEOR_IGNORE || ''} ${ignore}`.trim();
}
/**
 * Checks if the current Meteor command is 'run'.
 * @returns {boolean} True if the current command is 'run', false otherwise.
 */ function isMeteorAppRun() {
    var _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return ((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : _Package_meteor_global_currentCommand.name) === 'run';
}
/**
 * Checks if the current Meteor command is 'build'.
 * @returns {boolean} True if the current command is 'build', false otherwise.
 */ function isMeteorAppBuild() {
    var _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return [
        'build',
        'deploy'
    ].includes((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : _Package_meteor_global_currentCommand.name);
}
/**
 * Checks if the current Meteor command is 'update'.
 * @returns {boolean} True if the current command is 'update', false otherwise.
 */ function isMeteorAppUpdate() {
    var _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return ((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : _Package_meteor_global_currentCommand.name) === 'update';
}
/**
 * Checks if the current Meteor command is 'test'.
 * @returns {boolean} True if the current command is 'test', false otherwise.
 */ function isMeteorAppTest() {
    var _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return ((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : _Package_meteor_global_currentCommand.name) === 'test';
}
/**
 * Checks if the current Meteor command is 'test' and is running in full app mode.
 * @returns {false|*}
 */ function isMeteorAppTestFullApp() {
    var _Package_meteor_global_currentCommand_options, _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return isMeteorAppTest() && !!((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options = _Package_meteor_global_currentCommand.options) === null || _Package_meteor_global_currentCommand_options === void 0 ? void 0 : _Package_meteor_global_currentCommand_options['full-app']);
}
/**
 * Checks if the current Meteor command is 'test' and is running in watch mode.
 * @returns {boolean} True if the current command is 'test' and is running in watch mode, false otherwise.
 */ function isMeteorAppTestWatch() {
    var _Package_meteor_global_currentCommand_options, _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return isMeteorAppTest() && !((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options = _Package_meteor_global_currentCommand.options) === null || _Package_meteor_global_currentCommand_options === void 0 ? void 0 : _Package_meteor_global_currentCommand_options.once);
}
/**
 * Check if the current Meteor current command is running Android.
 * @returns {boolean}
 */ function isMeteorAppNativeAndroid() {
    var _Package_meteor_global_currentCommand_options_args, _Package_meteor_global_currentCommand_options, _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return (_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options = _Package_meteor_global_currentCommand.options) === null || _Package_meteor_global_currentCommand_options === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options_args = _Package_meteor_global_currentCommand_options.args) === null || _Package_meteor_global_currentCommand_options_args === void 0 ? void 0 : _Package_meteor_global_currentCommand_options_args.some((_arg)=>[
            'android',
            'android-device'
        ].includes(_arg));
}
/**
 * Check if the current Meteor current command is running iOS.
 * @returns {boolean}
 */ function isMeteorAppNativeIos() {
    var _Package_meteor_global_currentCommand_options_args, _Package_meteor_global_currentCommand_options, _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return (_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options = _Package_meteor_global_currentCommand.options) === null || _Package_meteor_global_currentCommand_options === void 0 ? void 0 : (_Package_meteor_global_currentCommand_options_args = _Package_meteor_global_currentCommand_options.args) === null || _Package_meteor_global_currentCommand_options_args === void 0 ? void 0 : _Package_meteor_global_currentCommand_options_args.some((_arg)=>[
            'ios',
            'ios-device'
        ].includes(_arg));
}
/**
 * Checks if the current Meteor command is running native.
 * @returns {boolean}
 */ function isMeteorAppNative() {
    return isMeteorAppNativeAndroid() || isMeteorAppNativeIos();
}
/**
 * Checks if the Meteor application is running in development mode.
 * @returns {boolean} True if the application is in development mode, false otherwise.
 */ function isMeteorAppDevelopment() {
    var _Package_meteor;
    if (process.env.NODE_ENV) {
        return process.env.NODE_ENV !== 'production';
    }
    return ((_Package_meteor = Package.meteor) === null || _Package_meteor === void 0 ? void 0 : _Package_meteor.Meteor.isDevelopment) && !isMeteorAppBuild();
}
/**
 * Checks if the Meteor application is running in production mode.
 * @returns {boolean} True if the application is in production mode, false otherwise.
 */ function isMeteorAppProduction() {
    var _Package_meteor;
    if (process.env.NODE_ENV) {
        return process.env.NODE_ENV === 'production';
    }
    return ((_Package_meteor = Package.meteor) === null || _Package_meteor === void 0 ? void 0 : _Package_meteor.Meteor.isProduction) || isMeteorAppBuild();
}
/**
 * Checks if the Meteor application is running in debug mode.
 * @returns {boolean} True if the application is in debug mode, false otherwise.
 */ function isMeteorAppDebug() {
    var _Package_meteor, _global_currentCommand;
    return ((_Package_meteor = Package.meteor) === null || _Package_meteor === void 0 ? void 0 : _Package_meteor.Meteor.isDebug) || !!process.env.NODE_INSPECTOR_IPC || !!process.env.VSCODE_INSPECTOR_OPTIONS || Object.keys(((_global_currentCommand = global.currentCommand) === null || _global_currentCommand === void 0 ? void 0 : _global_currentCommand.options) || {}).some(function(_arg) {
        return [
            'inspect',
            'debug',
            'brk'
        ].includes(_arg);
    });
}
/**
 * Checks if the Meteor application is running with METEOR_PROFILE enabled.
 * @returns {boolean} True if METEOR_PROFILE is set, false otherwise.
 */ function isMeteorAppProfile() {
    return !!process.env.METEOR_PROFILE;
}
/**
 * Sets a custom script URL for the Meteor application in the environment variable.
 * @param {string} scriptUrl - The URL of the custom script.
 */ function setMeteorAppCustomScriptUrl(scriptUrl) {
    process.env.METEOR_APP_CUSTOM_SCRIPT_URL = scriptUrl;
}
/**
 * Retrieves a list of all packages installed in the Meteor application.
 * @returns {string[]} An array of package names.
 */ function getMeteorAppPackages() {
    var _Package_meteor_global, _Package_meteor, _Package;
    return Object.keys(((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : _Package_meteor_global.packageVersionMap) || {});
}
/**
 * Gets all files and folders from the root level of the Meteor application.
 * @param {Object} options - Options for getting files and folders.
 * @param {boolean} [options.recursive=true] - Whether to scan directories recursively.
 * @param {Array<string>} [options.ignore=[]] - Patterns to ignore (e.g., ['node_modules', '.git']).
 * @param {boolean} [options.includeStats=false] - Whether to include file/folder stats in the result.
 * @param {string} [options.startPath] - Custom start path (defaults to Meteor app root).
 * @returns {Object} An object with 'files' and 'directories' arrays containing paths relative to the root.
 */ function getMeteorAppFilesAndFolders(options = {}) {
    const { recursive = true, ignore = [
        'node_modules',
        '.git',
        '.meteor/local'
    ], includeStats = false, startPath = getMeteorAppDir() } = options;
    // Helper function to check if a path should be ignored
    const shouldIgnore = (itemPath)=>{
        const relativePath = path.relative(getMeteorAppDir(), itemPath);
        return ignore.some((pattern)=>{
            if (pattern.endsWith('/**')) {
                const dirPattern = pattern.slice(0, -3);
                return relativePath === dirPattern || relativePath.startsWith(`${dirPattern}/`);
            }
            return relativePath === pattern || relativePath.startsWith(`${pattern}/`);
        });
    };
    // Helper function to recursively scan directories
    const scanDirectory = (dirPath)=>{
        const result = {
            files: [],
            directories: []
        };
        if (shouldIgnore(dirPath)) {
            return result;
        }
        try {
            const items = fs.readdirSync(dirPath);
            for (const item of items){
                const itemPath = path.join(dirPath, item);
                // Skip if the item should be ignored
                if (shouldIgnore(itemPath)) {
                    continue;
                }
                try {
                    const stats = fs.statSync(itemPath);
                    const relativePath = path.relative(getMeteorAppDir(), itemPath);
                    if (stats.isDirectory()) {
                        // Add directory to the result
                        result.directories.push(includeStats ? {
                            path: relativePath,
                            stats
                        } : relativePath);
                        // Recursively scan subdirectories if recursive option is true
                        if (recursive) {
                            const subResult = scanDirectory(itemPath);
                            result.files.push(...subResult.files);
                            result.directories.push(...subResult.directories);
                        }
                    } else if (stats.isFile()) {
                        // Add file to the result
                        result.files.push(includeStats ? {
                            path: relativePath,
                            stats
                        } : relativePath);
                    }
                } catch (error) {
                    // Skip items that can't be accessed
                    logError(`=> Failed to access ${itemPath}: ${error.message}`);
                }
            }
        } catch (error) {
            logError(`=> Failed to read directory ${dirPath}: ${error.message}`);
        }
        return result;
    };
    // Start the scan from the specified path
    return scanDirectory(startPath);
}
/**
 * Requires a module relative to the Meteor tools directory.
 * @param {string} filePath - The path of the file to require, relative to the Meteor tools directory.
 * @returns {Object} The exported module from the required file.
 */ function getMeteorToolsRequire(filePath) {
    const mainModule = global.process.mainModule;
    const absPath = mainModule.filename.split(path.sep).slice(0, -1).join(path.sep);
    return mainModule.require(path.resolve(absPath, filePath));
}
/**
 * Checks if the Meteor application is a Blaze project.
 * @returns {boolean} True if the application is a Blaze project, false otherwise.
 */ function isMeteorBlazeProject() {
    return getMeteorAppPackages().includes('blaze') || getMeteorAppPackages().includes('blaze-html-templates');
}
/**
 * Checks if the Meteor application is a Blaze Hot project.
 * @returns {boolean} True if the application is a Blaze Hot project, false otherwise.
 */ function isMeteorBlazeHotProject() {
    return isMeteorBlazeProject() && getMeteorAppPackages().includes('blaze-hot');
}
/**
 * Checks if the Meteor application is a Coffeescript project.
 * @returns {boolean}
 */ function isMeteorCoffeescriptProject() {
    return getMeteorAppPackages().includes('coffeescript');
}
/**
 * Checks if the Meteor application is a Less project.
 * @returns {boolean} True if the application has the 'less' package, false otherwise.
 */ function isMeteorLessProject() {
    return getMeteorAppPackages().includes('less');
}
/**
 * Checks if the Meteor application is a SCSS project.
 * @returns {boolean} True if the application has any package containing 'scss', false otherwise.
 */ function isMeteorScssProject() {
    return getMeteorAppPackages().some((pkg)=>pkg.includes('scss'));
}
/**
 * Checks if the Meteor application is a Bundle Visualizer project.
 * @returns {boolean}
 */ function isMeteorBundleVisualizerProject() {
    return getMeteorAppPackages().includes('bundle-visualizer');
}
/**
 * Checks if the Meteor application is a Typescript project.
 * @returns {boolean} True if the application is a Typescript project, false otherwise.
 */ function isMeteorTypescriptProject() {
    return getMeteorAppPackages().includes('typescript');
}
/**
 * Checks if the current Meteor command is 'test-packages'.
 * @returns {boolean} True if the current command is 'test-packages', false otherwise.
 */ function isMeteorPackagesTest() {
    var _Package_meteor_global_currentCommand, _Package_meteor_global, _Package_meteor, _Package;
    return ((_Package = Package) === null || _Package === void 0 ? void 0 : (_Package_meteor = _Package.meteor) === null || _Package_meteor === void 0 ? void 0 : (_Package_meteor_global = _Package_meteor.global) === null || _Package_meteor_global === void 0 ? void 0 : (_Package_meteor_global_currentCommand = _Package_meteor_global.currentCommand) === null || _Package_meteor_global_currentCommand === void 0 ? void 0 : _Package_meteor_global_currentCommand.name) === 'test-packages';
}
/**
 * Gets the package directories from the environment variables.
 * @returns {string[]}
 */ function getMeteorEnvPackageDirs() {
    function packageDirsFromEnvVar(envVar, delimiter = path.delimiter) {
        return process.env[envVar] && process.env[envVar].split(delimiter) || [];
    }
    return [
        // METEOR_PACKAGE_DIRS should use the arch-specific delimiter
        ...packageDirsFromEnvVar('METEOR_PACKAGE_DIRS', path.delimiter || ':'),
        // PACKAGE_DIRS (deprecated) always used ':' separator (yes, even Windows)
        ...packageDirsFromEnvVar('PACKAGE_DIRS', ':')
    ];
}
/**
 * Spreads Meteor's TOOL_NODE_FLAGS to NODE_OPTIONS for proper inheritance
 * of Meteor-specific tool environment process variables.
 * Only spreads if TOOL_NODE_FLAGS_INHERIT is truthy (enabled by default).
 * @param {Object} env - The current environment variables
 * @returns {Object} The updated environment variables with NODE_OPTIONS
 */ function inheritMeteorToolNodeFlags(env = {}) {
    const toolFlags = env.TOOL_NODE_FLAGS;
    if (!toolFlags) {
        return env;
    }
    // Check if spreading is enabled (default: true)
    // Only disable if TOOL_NODE_FLAGS_INHERIT is explicitly set to a falsy value
    // Treat "0" as falsy for this specific case
    const shouldSpread = env.TOOL_NODE_FLAGS_INHERIT !== undefined ? env.TOOL_NODE_FLAGS_INHERIT !== "0" && !!env.TOOL_NODE_FLAGS_INHERIT : true;
    if (!shouldSpread) {
        return env;
    }
    return _object_spread_props(_object_spread({}, env), {
        NODE_OPTIONS: [
            toolFlags,
            env.NODE_OPTIONS
        ].filter(Boolean).map((s)=>s.trim()).join(' ')
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"npm.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/npm.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({getNodeBinEnv:()=>getNodeBinEnv,getNodeBinaryPath:()=>getNodeBinaryPath,checkNpmDependencyExists:()=>checkNpmDependencyExists,checkNpmBinaryExists:()=>checkNpmBinaryExists,installNpmDependency:()=>installNpmDependency,checkNpmDependencyVersion:()=>checkNpmDependencyVersion,getNpmCommand:()=>getNpmCommand,getNpxCommand:()=>getNpxCommand,isYarnProject:()=>isYarnProject,getYarnCommand:()=>getYarnCommand,getMonorepoPath:()=>getMonorepoPath,isMonorepo:()=>isMonorepo});function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const fs = require('fs');
const path = require('path');
const { spawnProcess } = require('./process');
/**
 * Returns the Meteor dev_bundle bin directory path if available, otherwise null.
 *
 * @returns {string|null} The path to the dev_bundle bin directory, or null if not available
 */ function resolveNodeBinDir() {
    try {
        if (typeof Plugin !== 'undefined' && typeof Plugin.getCurrentNodeBinDir === 'function' && Plugin.getCurrentNodeBinDir()) {
            return Plugin.getCurrentNodeBinDir();
        }
        if (typeof getCurrentNodeBinDir === 'function') {
            return getCurrentNodeBinDir();
        }
    } catch (e) {
    // fall through
    }
    return null;
}
/**
 * Returns environment variables that ensure child processes can find
 * Meteor's bundled Node.js (and npm/npx) on their PATH.
 *
 * When the dev_bundle bin directory is available, it is prepended to PATH
 * so that `#!/usr/bin/env node` shebangs in spawned scripts resolve to
 * Meteor's Node rather than requiring a separate global install.
 *
 * Returns an empty object when the bin directory cannot be determined,
 * leaving the caller's environment unchanged.
 *
 * @returns {Object} An object with a PATH key, or empty object
 */ function getNodeBinEnv() {
    const binDir = resolveNodeBinDir();
    if (!binDir) {
        return {};
    }
    const currentPath = process.env.PATH || process.env.Path || '';
    return {
        PATH: binDir + path.delimiter + currentPath
    };
}
/**
 * Gets the path to a Node.js binary using Plugin.getCurrentNodeBinDir() if available,
 * otherwise returns null.
 *
 * @param {string} binaryName - The name of the binary (e.g., 'npm', 'npx', 'node')
 * @returns {string|null} The path to the specified binary, or null if not available
 */ function getNodeBinaryPath(binaryName) {
    const binDir = resolveNodeBinDir();
    if (binDir) {
        return path.join(binDir, binaryName);
    }
    return null;
}
/**
 * Checks if a npm dependency exists in the project.
 * First checks optimistically in node_modules folder, then checks package.json.
 * 
 * @param {string} dependency - The npm dependency name to check
 * @param {Object} [options] - Options for the check
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @param {boolean} [options.checkNodeModules] - Whether to check in node_modules first (defaults to false)
 * @returns {boolean} True if the dependency exists, false otherwise
 */ function checkNpmDependencyExists(dependency, options = {}) {
    const cwd = options.cwd || process.cwd();
    // First, optimistically check if the dependency exists in node_modules
    if (options.checkNodeModules) {
        const nodeModulesPath = path.join(cwd, 'node_modules', dependency);
        try {
            if (fs.existsSync(nodeModulesPath)) {
                // Check if it has a package.json to confirm it's a valid package
                const packageJsonPath = path.join(nodeModulesPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    return true;
                }
            }
        } catch (error) {
        // If there's an error checking the file system, continue to the fallback method
        }
    }
    // Fallback: Check package.json directly instead of using `npm ls`
    try {
        const packageJsonPath = path.join(cwd, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            // Check if the dependency is listed in any of the dependency sections
            return !!(packageJson.dependencies && packageJson.dependencies[dependency] || packageJson.devDependencies && packageJson.devDependencies[dependency] || packageJson.optionalDependencies && packageJson.optionalDependencies[dependency] || packageJson.peerDependencies && packageJson.peerDependencies[dependency]);
        }
    } catch (error) {
        // If there's an error reading or parsing package.json, return false
        return false;
    }
    // If we've reached this point, the dependency was not found
    return false;
}
/**
 * Checks if a npm binary exists in the project.
 * Looks for the binary in the node_modules/.bin directory.
 * 
 * @param {string} binary - The npm binary name to check
 * @param {Object} [options] - Options for the check
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @returns {boolean} True if the binary exists, false otherwise
 */ function checkNpmBinaryExists(binary, options = {}) {
    const cwd = options.cwd || process.cwd();
    const binaryPath = path.join(cwd, 'node_modules', '.bin', binary);
    try {
        // Check if the binary file exists and is executable
        const stats = fs.statSync(binaryPath);
        return stats.isFile() && stats.mode & 0o111; // Check if executable bit is set
    } catch (error) {
        return false;
    }
}
/**
 * Builds npm install arguments based on options and dependencies
 * 
 * @param {string|string[]} dependencies - The npm dependency or dependencies to install
 * @param {Object} [options] - Options for the installation
 * @param {boolean} [options.dev=false] - If true, install as a dev dependency
 * @param {boolean} [options.exact=false] - If true, install with exact version
 * @param {boolean} [options.isMeteorCommand=false] - If true, prepends 'npm' to the args for meteor command
 * @returns {string[]} Array of arguments for the npm install command
 */ function buildNpmInstallArgs(dependencies, options = {}) {
    const args = options.isMeteorCommand ? [
        'npm',
        'install'
    ] : [
        'install'
    ];
    // Add flags based on options
    if (options.dev) {
        args.push('--save-dev');
    }
    if (options.exact) {
        args.push('--save-exact');
    }
    // Add dependencies to the command
    if (Array.isArray(dependencies)) {
        args.push(...dependencies);
    } else {
        args.push(dependencies);
    }
    return args;
}
/**
 * Builds yarn install arguments based on options and dependencies
 * 
 * @param {string|string[]} dependencies - The npm dependency or dependencies to install
 * @param {Object} [options] - Options for the installation
 * @param {boolean} [options.dev=false] - If true, install as a dev dependency
 * @param {boolean} [options.exact=false] - If true, install with exact version
 * @returns {string[]} Array of arguments for the yarn add command
 */ function buildYarnInstallArgs(dependencies, options = {}) {
    const args = [
        'add'
    ];
    // Add flags based on options
    if (options.dev) {
        args.push('--dev');
    }
    if (options.exact) {
        args.push('--exact');
    }
    // Add dependencies to the command
    if (Array.isArray(dependencies)) {
        args.push(...dependencies);
    } else {
        args.push(dependencies);
    }
    return args;
}
/**
 * Executes a command and returns a promise that resolves to true if successful
 * 
 * @param {string} command - The command to execute
 * @param {string[]} args - The arguments for the command
 * @param {Object} options - Options for the spawn process
 * @param {string} options.cwd - Current working directory
 * @returns {Promise<boolean>} A promise that resolves to true if command succeeded, false otherwise
 */ function executeCommand(command, args, options) {
    return new Promise((resolve)=>{
        spawnProcess(command, args, {
            cwd: options.cwd,
            onExit: (code)=>{
                resolve(code === 0);
            },
            onError: ()=>{
                resolve(false);
            }
        });
    });
}
/**
 * Installs a npm dependency using direct npm binary if available, otherwise falls back to `meteor npm install`.
 * If yarn option is true, uses yarn instead.
 * 
 * @param {string|string[]} dependencies - The npm dependency or dependencies to install
 * @param {Object} [options] - Options for the installation
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @param {boolean} [options.dev=false] - If true, install as a dev dependency
 * @param {boolean} [options.exact=false] - If true, install with exact version
 * @param {boolean} [options.yarn=false] - If true, use yarn instead of npm
 * @returns {Promise<boolean>} A promise that resolves to true if installation succeeded, false otherwise
 */ function installNpmDependency(dependencies, options = {}) {
    const cwd = options.cwd || process.cwd();
    // If yarn option is true, use yarn
    if (options.yarn) {
        const { command, args: baseArgs } = getYarnCommand([]);
        const args = buildYarnInstallArgs(dependencies, options);
        return executeCommand(command, [
            ...baseArgs,
            ...args
        ], {
            cwd
        });
    }
    // Try to get the npm binary path
    const npmBinaryPath = getNodeBinaryPath('npm');
    // If we have a direct path to npm, use it
    if (npmBinaryPath && fs.existsSync(npmBinaryPath)) {
        const args = buildNpmInstallArgs(dependencies, options);
        return executeCommand(npmBinaryPath, args, {
            cwd
        });
    }
    // Fall back to the current method using 'meteor npm install'
    const args = buildNpmInstallArgs(dependencies, _object_spread_props(_object_spread({}, options), {
        isMeteorCommand: true
    }));
    return executeCommand('meteor', args, {
        cwd
    });
}
/**
 * Checks if a specific npm dependency version meets a semver condition.
 * First checks in node_modules if checkNodeModules is true, then checks project's package.json.
 * 
 * @param {string} dependency - The npm dependency name to check
 * @param {Object} [options] - Options for the check
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @param {string} [options.versionRequirement] - The version requirement to check against (e.g., '6.0.0')
 * @param {string} [options.semverCondition='gte'] - The semver condition to use (e.g., 'gte', 'lt', 'eq')
 * @param {boolean} [options.checkNodeModules] - Whether to check in node_modules first (defaults to false)
 * @param {boolean} [options.existenceOnly] - If true, only checks if the dependency exists without version validation
 * @returns {boolean} True if the dependency version meets the condition (or exists if existenceOnly is true), false otherwise
 */ function checkNpmDependencyVersion(dependency, options = {}) {
    const semver = require('semver');
    const cwd = options.cwd || process.cwd();
    const versionRequirement = options.versionRequirement;
    const semverCondition = options.semverCondition || 'gte';
    if (!dependency) {
        throw new Error('Dependency name must be specified');
    }
    // If existenceOnly is true, delegate to checkNpmDependencyExists
    if (options.existenceOnly) {
        return checkNpmDependencyExists(dependency, {
            cwd,
            checkNodeModules: options.checkNodeModules
        });
    }
    if (!versionRequirement) {
        throw new Error('Version requirement must be specified');
    }
    if (!semver[semverCondition]) {
        throw new Error(`Invalid semver condition: ${semverCondition}`);
    }
    // First, check in node_modules if the option is enabled
    if (options.checkNodeModules) {
        const nodeModulesPath = path.join(cwd, 'node_modules', dependency, 'package.json');
        try {
            if (fs.existsSync(nodeModulesPath)) {
                const packageJson = JSON.parse(fs.readFileSync(nodeModulesPath, 'utf8'));
                if (packageJson.version) {
                    return semver[semverCondition](packageJson.version, versionRequirement);
                }
            }
        } catch (error) {
        // If there's an error reading the package.json, continue to the fallback method
        }
    }
    // Fallback: Check project's package.json directly
    try {
        const packageJsonPath = path.join(cwd, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            // Check all dependency sections for the package and its version
            const sections = [
                'dependencies',
                'devDependencies',
                'optionalDependencies',
                'peerDependencies'
            ];
            for (const section of sections){
                if (packageJson[section] && packageJson[section][dependency]) {
                    const versionString = packageJson[section][dependency];
                    // Extract the version number from the version string (removing ^ or ~ if present)
                    const version = versionString.replace(/^[\^~]/, '');
                    return semver[semverCondition](version, versionRequirement);
                }
            }
        }
    } catch (error) {
        // If there's an error reading or parsing package.json, return false
        return false;
    }
    // If we've reached this point, the dependency version couldn't be determined
    return false;
}
/**
 * Gets the npm command and arguments
 * @param {string[]} args - The arguments to pass to npm
 * @returns {Object} An object with command, args, and base properties
 */ function getNpmCommand(args) {
    // Try to get the npm binary path
    const npmBinaryPath = getNodeBinaryPath('npm');
    // If we have a direct path to npm, use it
    if (npmBinaryPath && fs.existsSync(npmBinaryPath)) {
        return {
            command: npmBinaryPath,
            args: args,
            prefix: `${npmBinaryPath}`
        };
    }
    // Fall back to the current method using 'meteor npm'
    return {
        command: 'meteor',
        args: [
            'npm',
            ...args
        ],
        prefix: `meteor npm`
    };
}
/**
 * Gets the npx command and arguments
 * @param {string[]} args - The arguments to pass to npx
 * @returns {Object} An object with command, args, and base properties
 */ function getNpxCommand(args) {
    // Try to get the npx binary path
    const npxBinaryPath = getNodeBinaryPath('npx');
    // If we have a direct path to npx, use it
    if (npxBinaryPath && fs.existsSync(npxBinaryPath)) {
        return {
            command: npxBinaryPath,
            args: args,
            prefix: `${npxBinaryPath}`
        };
    }
    // Fall back to the current method using 'meteor npx'
    return {
        command: 'meteor',
        args: [
            'npx',
            ...args
        ],
        prefix: `meteor npx`
    };
}
/**
 * Checks if the current project is a Yarn project.
 * Looks for yarn.lock file in the current working directory and checks packageManager in package.json.
 * 
 * @param {Object} [options] - Options for the check
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @returns {boolean} True if it's a Yarn project, false otherwise
 */ function isYarnProject(options = {}) {
    const cwd = options.cwd || process.cwd();
    // Check if yarn.lock exists
    const yarnLockPath = path.join(cwd, 'yarn.lock');
    if (fs.existsSync(yarnLockPath)) {
        return true;
    }
    // Check packageManager field in package.json
    try {
        const packageJsonPath = path.join(cwd, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            // Check if packageManager contains "yarn"
            if (packageJson.packageManager && packageJson.packageManager.includes('yarn')) {
                return true;
            }
        }
    } catch (error) {
    // If there's an error reading or parsing package.json, continue
    }
    return false;
}
/**
 * Gets the yarn command and arguments
 * @param {string[]} args - The arguments to pass to yarn
 * @returns {Object} An object with command, args, and base properties
 */ function getYarnCommand(args) {
    // Try to get the yarn binary path
    const yarnBinaryPath = getNodeBinaryPath('yarn');
    // If we have a direct path to yarn, use it
    if (yarnBinaryPath && fs.existsSync(yarnBinaryPath)) {
        return {
            command: yarnBinaryPath,
            args,
            prefix: `${yarnBinaryPath}`
        };
    }
    // Fall back to using 'yarn' directly
    return {
        command: 'yarn',
        args,
        prefix: `yarn`
    };
}
/**
 * Gets the path to the monorepo root by checking for common monorepo indicators.
 * Traverses up the directory tree until it finds a monorepo indicator or reaches the root.
 * 
 * @param {Object} [options] - Options for the detection
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @returns {string|null} Path to the monorepo root if found, null otherwise
 */ function getMonorepoPath(options = {}) {
    const cwd = options.cwd || process.cwd();
    let currentDir = cwd;
    // Function to check if directory has monorepo indicators
    const hasMonorepoIndicators = (dir)=>{
        try {
            // Check for npm/yarn workspaces in package.json
            const packageJsonPath = path.join(dir, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.workspaces) {
                    return true;
                }
            }
            // Check for Lerna
            const lernaJsonPath = path.join(dir, 'lerna.json');
            if (fs.existsSync(lernaJsonPath)) {
                return true;
            }
            // Check for pnpm workspaces
            const pnpmWorkspacePath = path.join(dir, 'pnpm-workspace.yaml');
            if (fs.existsSync(pnpmWorkspacePath)) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };
    // Traverse up the directory tree
    while(currentDir !== path.dirname(currentDir)){
        if (hasMonorepoIndicators(currentDir)) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    // Check the root directory as well
    return hasMonorepoIndicators(currentDir) ? currentDir : null;
}
/**
 * Detects if a directory is within a monorepo by checking for common monorepo indicators.
 *
 * @param {Object} [options] - Options for the detection
 * @param {string} [options.cwd] - Current working directory (defaults to process.cwd())
 * @returns {boolean} True if the directory is within a monorepo, false otherwise
 */ function isMonorepo(options = {}) {
    return getMonorepoPath(options) !== null;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"process.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/process.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({spawnProcess:()=>spawnProcess,stopProcess:()=>stopProcess,isProcessRunning:()=>isProcessRunning,isPortAvailable:()=>isPortAvailable,waitForPort:()=>waitForPort});function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const { spawn } = require('child_process');
const net = require('net');
const { logError } = require('./log');
/**
 * Spawns a new OS process with the given command and arguments.
 * Streams output with original styling and handles errors and exit events.
 * Always preserves raw output formatting (colors, progress bars, etc.) and
 * provides decoded string data to callbacks for logic/checking/logging.
 * 
 * @param {string} command - The command to run
 * @param {string[]} args - Arguments to pass to the command
 * @param {Object} options - Options for the spawned process
 * @param {Object} [options.env] - Environment variables to merge with process.env
 * @param {string} [options.cwd] - Current working directory
 * @param {boolean} [options.detached] - Whether to run the process detached from the parent
 * @param {Function} [options.onStdout] - Callback for stdout data (receives decoded string)
 * @param {Function} [options.onStderr] - Callback for stderr data (receives decoded string)
 * @param {Function} [options.onExit] - Callback when process exits
 * @param {Function} [options.onError] - Callback when process encounters an error
 * @returns {Object} The spawned process with additional utility methods
 */ function spawnProcess(command, args, options = {}) {
    const proc = spawn(command, args, _object_spread({
        env: _object_spread_props(_object_spread({}, process.env, options.env || {}), {
            FORCE_COLOR: '1',
            TERM: 'xterm-256color'
        }),
        cwd: options.cwd || process.cwd(),
        stdio: [
            'pipe',
            'pipe',
            'pipe'
        ],
        detached: options.detached || false
    }, process.platform === 'win32' && {
        shell: true
    }));
    // Add a reference to track if the process is running
    proc.isRunning = true;
    // Handle stdout
    proc.stdout.on('data', (buf)=>{
        if (options.onStdout) {
            options.onStdout(buf.toString());
        }
    });
    // Handle stderr
    proc.stderr.on('data', (buf)=>{
        if (options.onStderr) {
            options.onStderr(buf.toString());
        }
    });
    // Handle process exit
    proc.on('close', (code, signal)=>{
        proc.isRunning = false;
        if (options.onExit) options.onExit(code, signal);
    });
    // Handle process errors
    proc.on('error', (err)=>{
        proc.isRunning = false;
        if (options.onError) options.onError(err);
        else logError(`=> Process error: ${err.message}`);
    });
    // This happens sometimes when we write to stdin after the app
    // is dead. If we don't register a handler, we get a top level
    // exception and the whole app dies.
    proc.stdin.on('error', ()=>{});
    if (options.detached) proc.unref();
    return proc;
}
/**
 * Stops a running process.
 * 
 * @param {Object} proc - The process to stop
 * @param {Object} [options] - Options for stopping the process
 * @param {string} [options.signal='SIGTERM'] - The signal to send to the process
 * @param {number} [options.timeout=5000] - Timeout in ms before forcing kill with SIGKILL
 * @returns {Promise<void>} A promise that resolves when the process is stopped
 */ function stopProcess(proc, options = {}) {
    if (!proc || !proc.pid || !isProcessRunning(proc)) {
        return Promise.resolve();
    }
    const signal = options.signal || 'SIGTERM';
    const timeout = options.timeout || 5000;
    return new Promise((resolve)=>{
        // Set a timeout to force kill if the process doesn't exit gracefully
        const forceKillTimeout = setTimeout(()=>{
            if (isProcessRunning(proc)) {
                proc.kill('SIGKILL');
            }
        }, timeout);
        // Listen for the process to exit
        proc.on('close', ()=>{
            clearTimeout(forceKillTimeout);
            proc.isRunning = false;
            resolve();
        });
        // Send the signal to terminate the process
        proc.kill(signal);
    });
}
/**
 * Checks if a process is running.
 * 
 * @param {Object} proc - The process to check
 * @returns {boolean} True if the process is running, false otherwise
 */ function isProcessRunning(proc) {
    if (!proc || !proc.pid) {
        return false;
    }
    // If we've been tracking the process state with our isRunning property
    if (proc.isRunning === false) {
        return false;
    }
    // Try to send signal 0 to the process, which doesn't actually send a signal
    // but checks if the process exists
    try {
        process.kill(proc.pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}
/**
 * Checks if a port is available.
 * 
 * @param {number} port - The port to check
 * @param {string} [host='127.0.0.1'] - The host to check
 * @returns {Promise<boolean>} A promise that resolves to true if the port is available, false otherwise
 */ function isPortAvailable(port, host = '127.0.0.1') {
    return new Promise((resolve)=>{
        const server = net.createServer();
        server.once('error', (err)=>{
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                // For other errors, we'll assume the port is not available
                resolve(false);
            }
        });
        server.once('listening', ()=>{
            // Close the server and resolve with true (port is available)
            server.close(()=>{
                resolve(true);
            });
        });
        server.listen(port, host);
    });
}
/**
 * Waits for a port to become available or unavailable.
 * 
 * @param {number} port - The port to check
 * @param {Object} [options] - Options for waiting
 * @param {string} [options.host='127.0.0.1'] - The host to check
 * @param {boolean} [options.waitUntilAvailable=false] - If true, wait until port is available; if false, wait until port is in use
 * @param {number} [options.timeout=30000] - Timeout in ms
 * @param {number} [options.interval=500] - Interval between checks in ms
 * @returns {Promise<boolean>} A promise that resolves to true if the condition is met, false if timed out
 */ function waitForPort(port, options = {}) {
    const host = options.host || '127.0.0.1';
    const waitUntilAvailable = options.waitUntilAvailable || false;
    const timeout = options.timeout || 30000;
    const interval = options.interval || 500;
    const startTime = Date.now();
    return new Promise((resolve)=>{
        let timeoutId = null;
        const check = ()=>_async_to_generator(function*() {
                // Check if we've exceeded the timeout
                if (Date.now() - startTime > timeout) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    resolve(false);
                    return;
                }
                const isAvailable = yield isPortAvailable(port, host);
                // If we're waiting for the port to be available and it is, or
                // if we're waiting for the port to be in use and it's not available
                if (waitUntilAvailable && isAvailable || !waitUntilAvailable && !isAvailable) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    resolve(true);
                    return;
                }
                // Schedule the next check
                timeoutId = setTimeout(check, interval);
            })();
        // Start checking
        check();
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/tools-core/lib/string.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({capitalizeFirstLetter:()=>capitalizeFirstLetter,shuffleString:()=>shuffleString,joinWithAnd:()=>joinWithAnd});/**
 * Capitalizes the first letter of the given string.
 *
 * @param {string} str – The input string.
 * @returns {string} – The string with its first character uppercased.
 */ function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Shuffles the elements of the given array.
 * @param arr
 * @returns {*}
 */ function shuffleArray(arr) {
    for(let i = arr.length - 1; i > 0; --i){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [
            arr[j],
            arr[i]
        ];
    }
    return arr;
}
/**
 * Shuffles the characters of the given string.
 * @param str
 * @returns {string}
 */ function shuffleString(str) {
    return shuffleArray(str.split('')).join('');
}
/**
 * Join an array of strings into a human-readable list.
 *
 * @param {string[]} items - The items to join.
 * @param {object}   [opts]
 * @param {string}   [opts.separator=', ']      - Separator between items (except last).
 * @param {string}   [opts.lastSeparator=' and '] - Text to insert before the last item.
 * @returns {string}
 */ function joinWithAnd(items, { separator = ', ', lastSeparator = ' and ' } = {}) {
    const len = items.length;
    if (len === 0) return '';
    if (len === 1) return items[0];
    if (len === 2) return items[0] + lastSeparator + items[1];
    return items.slice(0, -1).reduce((acc, item, idx)=>{
        return acc + (idx === 0 ? '' : separator) + item;
    }, '') + lastSeparator + items[len - 1];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/tools-core/tools-core.js"
  ],
  mainModulePath: "/node_modules/meteor/tools-core/tools-core.js"
}});

//# sourceURL=meteor://💻app/packages/tools-core.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdG9vbHMtY29yZS90b29scy1jb3JlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90b29scy1jb3JlL2xpYi9naXQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3Rvb2xzLWNvcmUvbGliL2dsb2JhbC1zdGF0ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdG9vbHMtY29yZS9saWIvaWdub3JlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90b29scy1jb3JlL2xpYi9sb2cuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3Rvb2xzLWNvcmUvbGliL21ldGVvci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvdG9vbHMtY29yZS9saWIvbnBtLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90b29scy1jb3JlL2xpYi9wcm9jZXNzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy90b29scy1jb3JlL2xpYi9zdHJpbmcuanMiXSwibmFtZXMiOlsiZnMiLCJpc0dpdFJlcG9zaXRvcnkiLCJnaXREaXIiLCJwYXRoIiwiam9pbiIsImRpciIsImV4aXN0c1N5bmMiLCJzdGF0U3luYyIsImlzRGlyZWN0b3J5IiwiZXJyb3IiLCJnaXRpZ25vcmVFeGlzdHMiLCJnaXRpZ25vcmVQYXRoIiwiZW5zdXJlR2l0aWdub3JlRXhpc3RzIiwiaW5pdGlhbEVudHJpZXMiLCJjb250ZW50IiwibGVuZ3RoIiwid3JpdGVGaWxlU3luYyIsImxvZ0Vycm9yIiwibWVzc2FnZSIsImdldE1pc3NpbmdHaXRpZ25vcmVFbnRyaWVzIiwiZW50cmllcyIsInJlYWRGaWxlU3luYyIsImxpbmVzIiwic3BsaXQiLCJtYXAiLCJsaW5lIiwidHJpbSIsImZpbHRlciIsImVudHJ5IiwiaW5jbHVkZXMiLCJhZGRHaXRpZ25vcmVFbnRyaWVzIiwiY29udGV4dCIsIm1pc3NpbmdFbnRyaWVzIiwibG9nUHJvZ3Jlc3MiLCJlbmRzV2l0aCIsImxvZ1N1Y2Nlc3MiLCJnZXRHbG9iYWxTdGF0ZSIsImtleSIsImRlZmF1bHRWYWx1ZSIsIlBhY2thZ2UiLCJtZXRlb3IiLCJnbG9iYWwiLCJ1bmRlZmluZWQiLCJwZXJzaXN0ZW50U3RhdGUiLCJzZXRHbG9iYWxTdGF0ZSIsInZhbHVlIiwicmVtb3ZlR2xvYmFsU3RhdGUiLCJjbGVhckdsb2JhbFN0YXRlIiwiYnVpbGRVbmlnbm9yZVBhdHRlcm5zIiwiaW5wdXRQYXRocyIsImluY2x1ZGVBbGxBbmNlc3RvcnMiLCJpbmNsdWRlR2xvYkZvckRpcnMiLCJza2lwTGV2ZWwiLCJvdXQiLCJzZWVuIiwiU2V0IiwicHVzaCIsInAiLCJoYXMiLCJhZGQiLCJyYXciLCJhbmNob3JlZCIsInN0YXJ0c1dpdGgiLCJyZXBsYWNlIiwiaXNEaXIiLCJjb3JlIiwicGFydHMiLCJzdGFydExldmVsIiwiTWF0aCIsIm1heCIsImkiLCJhbmMiLCJzbGljZSIsInBhcmVudExldmVsIiwicGFyZW50IiwiZmlsZSIsInNob3VsZERpc2FibGVDb2xvcnMiLCJwcm9jZXNzIiwiZW52IiwiTUVURU9SX0RJU0FCTEVfQ09MT1JTIiwiTUlOX01FU1NBR0VfTEVOR1RIIiwiY29sb3JzIiwicmVzZXQiLCJibHVlIiwicmVkIiwicHVycGxlIiwiZ3JlZW4iLCJjeWFuIiwicGFkTWVzc2FnZSIsIm1pbkxlbmd0aCIsInBhZEVuZCIsImNvbnNvbGUiLCJsb2ciLCJsb2dJbmZvIiwibG9nUmF3IiwiZ2V0UnVuTG9nIiwiUGx1Z2luIiwicnVuTG9nSW5zdGFuY2UiLCJyZXF1aXJlIiwidG9Qb3NpeCIsImdldE1ldGVvckFwcERpciIsImN3ZCIsImdldE1ldGVvckFwcFBhY2thZ2VKc29uIiwiSlNPTiIsInBhcnNlIiwiZ2V0TWV0ZW9yQXBwQ29uZmlnIiwiZ2V0TWV0ZW9yQ29uZmlnIiwiZ2V0TWV0ZW9yQXBwUG9ydCIsImN1cnJlbnRDb21tYW5kIiwib3B0aW9ucyIsIlBPUlQiLCJnZXRNZXRlb3JBcHBDb25maWdNb2Rlcm4iLCJtb2Rlcm4iLCJpc01ldGVvckFwcENvbmZpZ01vZGVyblZlcmJvc2UiLCJ2ZXJib3NlIiwidHJhbnNwaWxlciIsImhhc01ldGVvckFwcENvbmZpZ0F1dG9JbnN0YWxsRGVwcyIsImF1dG9JbnN0YWxsRGVwcyIsImdldE1ldGVvckFwcEVudHJ5cG9pbnRzIiwibWV0ZW9yQ29uZmlnIiwibWFpbkNsaWVudCIsIm1haW5Nb2R1bGUiLCJjbGllbnQiLCJtYWluU2VydmVyIiwic2VydmVyIiwidGVzdENsaWVudCIsInRlc3RNb2R1bGUiLCJ0ZXN0U2VydmVyIiwiZ2V0TWV0ZW9ySW5pdGlhbEFwcEVudHJ5cG9pbnRzIiwibWFpbkNsaWVudEh0bWwiLCJjbGllbnREaXIiLCJkaXJuYW1lIiwiY2xpZW50QmFzZW5hbWUiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJodG1sUGF0aCIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJodG1sRmlsZSIsImZpbmQiLCJpc01ldGVvckFwcFRlc3RNb2R1bGUiLCJzZXRNZXRlb3JBcHBFbnRyeXBvaW50cyIsIk1FVEVPUl9DT05GSUdfQ0xJRU5UIiwiTUVURU9SX0NPTkZJR19TRVJWRVIiLCJNRVRFT1JfQ09ORklHX1RFU1QiLCJNRVRFT1JfQ09ORklHX1RFU1RfQ0xJRU5UIiwiTUVURU9SX0NPTkZJR19URVNUX1NFUlZFUiIsInJlaW5pdGlhbGl6ZU1ldGVvckNvbmZpZyIsInNldE1ldGVvckFwcElnbm9yZSIsImlnbm9yZSIsIk1FVEVPUl9JR05PUkUiLCJpc01ldGVvckFwcFJ1biIsIm5hbWUiLCJpc01ldGVvckFwcEJ1aWxkIiwiaXNNZXRlb3JBcHBVcGRhdGUiLCJpc01ldGVvckFwcFRlc3QiLCJpc01ldGVvckFwcFRlc3RGdWxsQXBwIiwiaXNNZXRlb3JBcHBUZXN0V2F0Y2giLCJvbmNlIiwiaXNNZXRlb3JBcHBOYXRpdmVBbmRyb2lkIiwiYXJncyIsInNvbWUiLCJfYXJnIiwiaXNNZXRlb3JBcHBOYXRpdmVJb3MiLCJpc01ldGVvckFwcE5hdGl2ZSIsImlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQiLCJOT0RFX0VOViIsIk1ldGVvciIsImlzRGV2ZWxvcG1lbnQiLCJpc01ldGVvckFwcFByb2R1Y3Rpb24iLCJpc1Byb2R1Y3Rpb24iLCJpc01ldGVvckFwcERlYnVnIiwiaXNEZWJ1ZyIsIk5PREVfSU5TUEVDVE9SX0lQQyIsIlZTQ09ERV9JTlNQRUNUT1JfT1BUSU9OUyIsIk9iamVjdCIsImtleXMiLCJpc01ldGVvckFwcFByb2ZpbGUiLCJNRVRFT1JfUFJPRklMRSIsInNldE1ldGVvckFwcEN1c3RvbVNjcmlwdFVybCIsInNjcmlwdFVybCIsIk1FVEVPUl9BUFBfQ1VTVE9NX1NDUklQVF9VUkwiLCJnZXRNZXRlb3JBcHBQYWNrYWdlcyIsInBhY2thZ2VWZXJzaW9uTWFwIiwiZ2V0TWV0ZW9yQXBwRmlsZXNBbmRGb2xkZXJzIiwicmVjdXJzaXZlIiwiaW5jbHVkZVN0YXRzIiwic3RhcnRQYXRoIiwic2hvdWxkSWdub3JlIiwiaXRlbVBhdGgiLCJyZWxhdGl2ZVBhdGgiLCJyZWxhdGl2ZSIsInBhdHRlcm4iLCJkaXJQYXR0ZXJuIiwic2NhbkRpcmVjdG9yeSIsImRpclBhdGgiLCJyZXN1bHQiLCJkaXJlY3RvcmllcyIsIml0ZW1zIiwiaXRlbSIsInN0YXRzIiwic3ViUmVzdWx0IiwiaXNGaWxlIiwiZ2V0TWV0ZW9yVG9vbHNSZXF1aXJlIiwiZmlsZVBhdGgiLCJhYnNQYXRoIiwiZmlsZW5hbWUiLCJzZXAiLCJyZXNvbHZlIiwiaXNNZXRlb3JCbGF6ZVByb2plY3QiLCJpc01ldGVvckJsYXplSG90UHJvamVjdCIsImlzTWV0ZW9yQ29mZmVlc2NyaXB0UHJvamVjdCIsImlzTWV0ZW9yTGVzc1Byb2plY3QiLCJpc01ldGVvclNjc3NQcm9qZWN0IiwicGtnIiwiaXNNZXRlb3JCdW5kbGVWaXN1YWxpemVyUHJvamVjdCIsImlzTWV0ZW9yVHlwZXNjcmlwdFByb2plY3QiLCJpc01ldGVvclBhY2thZ2VzVGVzdCIsImdldE1ldGVvckVudlBhY2thZ2VEaXJzIiwicGFja2FnZURpcnNGcm9tRW52VmFyIiwiZW52VmFyIiwiZGVsaW1pdGVyIiwiaW5oZXJpdE1ldGVvclRvb2xOb2RlRmxhZ3MiLCJ0b29sRmxhZ3MiLCJUT09MX05PREVfRkxBR1MiLCJzaG91bGRTcHJlYWQiLCJUT09MX05PREVfRkxBR1NfSU5IRVJJVCIsIk5PREVfT1BUSU9OUyIsIkJvb2xlYW4iLCJzIiwic3Bhd25Qcm9jZXNzIiwicmVzb2x2ZU5vZGVCaW5EaXIiLCJnZXRDdXJyZW50Tm9kZUJpbkRpciIsImUiLCJnZXROb2RlQmluRW52IiwiYmluRGlyIiwiY3VycmVudFBhdGgiLCJQQVRIIiwiUGF0aCIsImdldE5vZGVCaW5hcnlQYXRoIiwiYmluYXJ5TmFtZSIsImNoZWNrTnBtRGVwZW5kZW5jeUV4aXN0cyIsImRlcGVuZGVuY3kiLCJjaGVja05vZGVNb2R1bGVzIiwibm9kZU1vZHVsZXNQYXRoIiwicGFja2FnZUpzb25QYXRoIiwicGFja2FnZUpzb24iLCJkZXBlbmRlbmNpZXMiLCJkZXZEZXBlbmRlbmNpZXMiLCJvcHRpb25hbERlcGVuZGVuY2llcyIsInBlZXJEZXBlbmRlbmNpZXMiLCJjaGVja05wbUJpbmFyeUV4aXN0cyIsImJpbmFyeSIsImJpbmFyeVBhdGgiLCJtb2RlIiwiYnVpbGROcG1JbnN0YWxsQXJncyIsImlzTWV0ZW9yQ29tbWFuZCIsImRldiIsImV4YWN0IiwiQXJyYXkiLCJpc0FycmF5IiwiYnVpbGRZYXJuSW5zdGFsbEFyZ3MiLCJleGVjdXRlQ29tbWFuZCIsImNvbW1hbmQiLCJQcm9taXNlIiwib25FeGl0IiwiY29kZSIsIm9uRXJyb3IiLCJpbnN0YWxsTnBtRGVwZW5kZW5jeSIsInlhcm4iLCJiYXNlQXJncyIsImdldFlhcm5Db21tYW5kIiwibnBtQmluYXJ5UGF0aCIsImNoZWNrTnBtRGVwZW5kZW5jeVZlcnNpb24iLCJzZW12ZXIiLCJ2ZXJzaW9uUmVxdWlyZW1lbnQiLCJzZW12ZXJDb25kaXRpb24iLCJFcnJvciIsImV4aXN0ZW5jZU9ubHkiLCJ2ZXJzaW9uIiwic2VjdGlvbnMiLCJzZWN0aW9uIiwidmVyc2lvblN0cmluZyIsImdldE5wbUNvbW1hbmQiLCJwcmVmaXgiLCJnZXROcHhDb21tYW5kIiwibnB4QmluYXJ5UGF0aCIsImlzWWFyblByb2plY3QiLCJ5YXJuTG9ja1BhdGgiLCJwYWNrYWdlTWFuYWdlciIsInlhcm5CaW5hcnlQYXRoIiwiZ2V0TW9ub3JlcG9QYXRoIiwiY3VycmVudERpciIsImhhc01vbm9yZXBvSW5kaWNhdG9ycyIsIndvcmtzcGFjZXMiLCJsZXJuYUpzb25QYXRoIiwicG5wbVdvcmtzcGFjZVBhdGgiLCJpc01vbm9yZXBvIiwic3Bhd24iLCJuZXQiLCJwcm9jIiwiRk9SQ0VfQ09MT1IiLCJURVJNIiwic3RkaW8iLCJkZXRhY2hlZCIsInBsYXRmb3JtIiwic2hlbGwiLCJpc1J1bm5pbmciLCJzdGRvdXQiLCJvbiIsImJ1ZiIsIm9uU3Rkb3V0IiwidG9TdHJpbmciLCJzdGRlcnIiLCJvblN0ZGVyciIsInNpZ25hbCIsImVyciIsInN0ZGluIiwidW5yZWYiLCJzdG9wUHJvY2VzcyIsInBpZCIsImlzUHJvY2Vzc1J1bm5pbmciLCJ0aW1lb3V0IiwiZm9yY2VLaWxsVGltZW91dCIsInNldFRpbWVvdXQiLCJraWxsIiwiY2xlYXJUaW1lb3V0IiwiaXNQb3J0QXZhaWxhYmxlIiwicG9ydCIsImhvc3QiLCJjcmVhdGVTZXJ2ZXIiLCJjbG9zZSIsImxpc3RlbiIsIndhaXRGb3JQb3J0Iiwid2FpdFVudGlsQXZhaWxhYmxlIiwiaW50ZXJ2YWwiLCJzdGFydFRpbWUiLCJEYXRlIiwibm93IiwidGltZW91dElkIiwiY2hlY2siLCJpc0F2YWlsYWJsZSIsImNhcGl0YWxpemVGaXJzdExldHRlciIsInN0ciIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2h1ZmZsZUFycmF5IiwiYXJyIiwiaiIsImZsb29yIiwicmFuZG9tIiwic2h1ZmZsZVN0cmluZyIsImpvaW5XaXRoQW5kIiwic2VwYXJhdG9yIiwibGFzdFNlcGFyYXRvciIsImxlbiIs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S0FBTXhSLEtBQUk7UUFDMUMsQ0FBQ3FSLEdBQUcsQ0FBQ3JSLEVBQUUsRUFBRXFSLEdBQUcsQ0FBQ0MsRUFBRSxDQUFDLEdBQUc7WUFBQ0QsR0FBRyxDQUFDQyxFQUFFO1lBQUVELEdBQUcsQ0FBQ3JSLEVBQUU7U0FBQztJQUNyQztJQUNBLE9BQU9xUjtBQUNUO0FBRUE7Ozs7Q0FJQyxHQUNELE9BQU8sU0FBU0ksYUFBaUI7SUFDL0IsT0FBT0wsYUFBYUgsSUFBSWhVLEtBQUssQ0FBQyxLQUFLbkIsSUFBSSxDQUFDO0FBQzFDO0FBRUE7Ozs7Ozs7O0NBUUMsR0FDRCxPQUFPLFNBQVM0VixZQUNkMUosS0FBSyxFQUNMLEVBQUUySixZQUFZLElBQUksRUFBRUMsZ0JBQWdCLE9BQU8sRUFBRSxDQUFLO0lBRWxELE1BQU1DLE1BQU03SixNQUFNdkwsTUFBTTtJQUN4QixJQUFJb1YsUUFBUSxHQUFHLE9BQU87SUFDdEIsSUFBSUEsUUFBUSxHQUFHLE9BQU83SixLQUFLLENBQUMsRUFBRTtJQUM5QixJQUFJNkosUUFBUSxHQUFHLE9BQU83SixLQUFLLENBQUMsRUFBRSxHQUFHNEosZ0JBQWdCNUosS0FBSyxDQUFDLEVBQUU7SUFDekQsT0FBT0EsTUFDSjlILEtBQUssQ0FBQyxHQUFHLENBQUMsR0FDVjRSLE1BQU0sQ0FBQyxDQUFDQyxLQUFLOUosTUFBTStKO1FBQ2xCLE9BQU9ELE1BQU9DLFNBQVEsSUFBSSxLQUFLTCxTQUFRLElBQUsxSjtJQUM5QyxHQUFHLE1BQU0ySixnQkFBZ0I1SixLQUFLLENBQUM2SixNQUFNLEVBQUU7QUFDM0MiLCJmaWxlIjoiL3BhY2thZ2VzL3Rvb2xzLWNvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBmcm9tICcuL2xpYi9sb2cnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvbWV0ZW9yJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL25wbSc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9wcm9jZXNzJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2dsb2JhbC1zdGF0ZSc7XG5leHBvcnQgKiBmcm9tICcuL2xpYi9naXQnO1xuZXhwb3J0ICogZnJvbSAnLi9saWIvc3RyaW5nJztcbmV4cG9ydCAqIGZyb20gJy4vbGliL2lnbm9yZSc7XG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBsb2dFcnJvciwgbG9nUHJvZ3Jlc3MsIGxvZ1N1Y2Nlc3MgfSBmcm9tICcuL2xvZyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBkaXJlY3RvcnkgaXMgYSBnaXQgcmVwb3NpdG9yeVxuICogQHBhcmFtIHtzdHJpbmd9IGRpciAtIERpcmVjdG9yeSB0byBjaGVja1xuICogQHJldHVybnMge2Jvb2xlYW59IC0gVHJ1ZSBpZiB0aGUgZGlyZWN0b3J5IGlzIGEgZ2l0IHJlcG9zaXRvcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR2l0UmVwb3NpdG9yeShkaXIpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBnaXREaXIgPSBwYXRoLmpvaW4oZGlyLCAnLmdpdCcpO1xuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKGdpdERpcikgJiYgZnMuc3RhdFN5bmMoZ2l0RGlyKS5pc0RpcmVjdG9yeSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIC5naXRpZ25vcmUgZmlsZSBleGlzdHMgaW4gdGhlIGdpdmVuIGRpcmVjdG9yeVxuICogQHBhcmFtIHtzdHJpbmd9IGRpciAtIERpcmVjdG9yeSB0byBjaGVja1xuICogQHJldHVybnMge2Jvb2xlYW59IC0gVHJ1ZSBpZiAuZ2l0aWdub3JlIGV4aXN0c1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2l0aWdub3JlRXhpc3RzKGRpcikge1xuICB0cnkge1xuICAgIGNvbnN0IGdpdGlnbm9yZVBhdGggPSBwYXRoLmpvaW4oZGlyLCAnLmdpdGlnbm9yZScpO1xuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKGdpdGlnbm9yZVBhdGgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSAuZ2l0aWdub3JlIGZpbGUgaW4gdGhlIGdpdmVuIGRpcmVjdG9yeSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyIC0gRGlyZWN0b3J5IHdoZXJlIHRvIGNyZWF0ZSAuZ2l0aWdub3JlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBbaW5pdGlhbEVudHJpZXM9W11dIC0gSW5pdGlhbCBlbnRyaWVzIHRvIGFkZCB0byB0aGUgLmdpdGlnbm9yZSBmaWxlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBUcnVlIGlmIC5naXRpZ25vcmUgd2FzIGNyZWF0ZWQgb3IgYWxyZWFkeSBleGlzdHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUdpdGlnbm9yZUV4aXN0cyhkaXIsIGluaXRpYWxFbnRyaWVzID0gW10pIHtcbiAgY29uc3QgZ2l0aWdub3JlUGF0aCA9IHBhdGguam9pbihkaXIsICcuZ2l0aWdub3JlJyk7XG5cbiAgaWYgKCFnaXRpZ25vcmVFeGlzdHMoZGlyKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gaW5pdGlhbEVudHJpZXMubGVuZ3RoID4gMCA/IGluaXRpYWxFbnRyaWVzLmpvaW4oJ1xcbicpICsgJ1xcbicgOiAnJztcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZ2l0aWdub3JlUGF0aCwgY29udGVudCwgJ3V0ZjgnKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dFcnJvcihgPT4gRmFpbGVkIHRvIGNyZWF0ZSAuZ2l0aWdub3JlOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHNwZWNpZmljIGVudHJpZXMgZXhpc3QgaW4gdGhlIC5naXRpZ25vcmUgZmlsZVxuICogQHBhcmFtIHtzdHJpbmd9IGRpciAtIERpcmVjdG9yeSBjb250YWluaW5nIHRoZSAuZ2l0aWdub3JlIGZpbGVcbiAqIEBwYXJhbSB7c3RyaW5nW119IGVudHJpZXMgLSBFbnRyaWVzIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7c3RyaW5nW119IC0gRW50cmllcyB0aGF0IGRvbid0IGV4aXN0IGluIHRoZSAuZ2l0aWdub3JlIGZpbGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1pc3NpbmdHaXRpZ25vcmVFbnRyaWVzKGRpciwgZW50cmllcykge1xuICBpZiAoIWdpdGlnbm9yZUV4aXN0cyhkaXIpKSB7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGdpdGlnbm9yZVBhdGggPSBwYXRoLmpvaW4oZGlyLCAnLmdpdGlnbm9yZScpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZ2l0aWdub3JlUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpLm1hcChsaW5lID0+IGxpbmUudHJpbSgpKTtcblxuICAgIHJldHVybiBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiAhbGluZXMuaW5jbHVkZXMoZW50cnkpKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcihgPT4gRmFpbGVkIHRvIHJlYWQgLmdpdGlnbm9yZTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9XG59XG5cbi8qKlxuICogQWRkcyBlbnRyaWVzIHRvIHRoZSAuZ2l0aWdub3JlIGZpbGUgaWYgdGhleSBkb24ndCBleGlzdFxuICogQHBhcmFtIHtzdHJpbmd9IGRpciAtIERpcmVjdG9yeSBjb250YWluaW5nIHRoZSAuZ2l0aWdub3JlIGZpbGVcbiAqIEBwYXJhbSB7c3RyaW5nW119IGVudHJpZXMgLSBFbnRyaWVzIHRvIGFkZFxuICogQHBhcmFtIHtzdHJpbmd9IFtjb250ZXh0XSAtIE9wdGlvbmFsIGNvbnRleHQgdG8gYWRkIGFzIGEgY29tbWVudCBiZWZvcmUgdGhlIGVudHJpZXNcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIFRydWUgaWYgZW50cmllcyB3ZXJlIGFkZGVkIHN1Y2Nlc3NmdWxseVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkR2l0aWdub3JlRW50cmllcyhkaXIsIGVudHJpZXMsIGNvbnRleHQgPSAnJykge1xuICAvLyBFbnN1cmUgLmdpdGlnbm9yZSBleGlzdHNcbiAgaWYgKCFlbnN1cmVHaXRpZ25vcmVFeGlzdHMoZGlyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEdldCBlbnRyaWVzIHRoYXQgZG9uJ3QgZXhpc3RcbiAgY29uc3QgbWlzc2luZ0VudHJpZXMgPSBnZXRNaXNzaW5nR2l0aWdub3JlRW50cmllcyhkaXIsIGVudHJpZXMpO1xuXG4gIGlmIChtaXNzaW5nRW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTsgLy8gQWxsIGVudHJpZXMgYWxyZWFkeSBleGlzdFxuICB9XG5cbiAgbG9nUHJvZ3Jlc3MoYD0+IEFkZGluZyBnaXRpZ25vcmUgZW50cmllcyR7Y29udGV4dCA/IGAgZm9yICR7Y29udGV4dH1gIDogJyd9OiAke21pc3NpbmdFbnRyaWVzLmpvaW4oJywgJyl9YCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBnaXRpZ25vcmVQYXRoID0gcGF0aC5qb2luKGRpciwgJy5naXRpZ25vcmUnKTtcbiAgICBsZXQgY29udGVudCA9ICcnO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZ2l0aWdub3JlUGF0aCkpIHtcbiAgICAgIGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZ2l0aWdub3JlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgIC8vIEVuc3VyZSB0aGVyZSdzIGEgbmV3bGluZSBhdCB0aGUgZW5kIGlmIHRoZSBmaWxlIGlzIG5vdCBlbXB0eVxuICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMCAmJiAhY29udGVudC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgY29udGVudCArPSAnXFxuJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgY29udGV4dCBhcyBhIGNvbW1lbnQgaWYgcHJvdmlkZWRcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgY29udGVudCArPSBgXFxuIyAke2NvbnRleHR9XFxuYDtcbiAgICB9XG4gICAgY29udGVudCArPSBtaXNzaW5nRW50cmllcy5qb2luKCdcXG4nKSArICdcXG4nO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoZ2l0aWdub3JlUGF0aCwgY29udGVudCwgJ3V0ZjgnKTtcblxuICAgIGxvZ1N1Y2Nlc3MoYD0+IEFkZGVkIGdpdGlnbm9yZSBlbnRyaWVzJHtjb250ZXh0ID8gYCBmb3IgJHtjb250ZXh0fWAgOiAnJ31gKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcihgPT4gRmFpbGVkIHRvIGFkZCBnaXRpZ25vcmUgZW50cmllcyR7Y29udGV4dCA/IGAgZm9yICR7Y29udGV4dH1gIDogJyd9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCIvKipcbiAqIEdsb2JhbCBzdGF0ZSBtYW5hZ2VtZW50IGZvciBNZXRlb3IgcGFja2FnZXMuXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBhIHdheSB0byBzdG9yZSBhbmQgcmV0cmlldmUgZ2xvYmFsIHN0YXRlIHRoYXQgcGVyc2lzdHMgYWNyb3NzIGZpbGUgY2hhbmdlcy5cbiAqL1xuXG4vKipcbiAqIEdldHMgYSB2YWx1ZSBmcm9tIHRoZSBnbG9iYWwgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gVGhlIGtleSB0byByZXRyaWV2ZS5cbiAqIEBwYXJhbSB7YW55fSBkZWZhdWx0VmFsdWUgLSBUaGUgZGVmYXVsdCB2YWx1ZSB0byByZXR1cm4gaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0LlxuICogQHJldHVybnMge2FueX0gVGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUga2V5LCBvciB0aGUgZGVmYXVsdCB2YWx1ZSBpZiBub3QgZm91bmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWxTdGF0ZShrZXksIGRlZmF1bHRWYWx1ZSkge1xuICByZXR1cm4gUGFja2FnZS5tZXRlb3I/Lmdsb2JhbD8uW2tleV0gIT09IHVuZGVmaW5lZFxuICAgID8gUGFja2FnZS5tZXRlb3IuZ2xvYmFsLnBlcnNpc3RlbnRTdGF0ZVtrZXldXG4gICAgOiBkZWZhdWx0VmFsdWU7XG59XG5cbi8qKlxuICogU2V0cyBhIHZhbHVlIGluIHRoZSBnbG9iYWwgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IC0gVGhlIGtleSB0byBzZXQuXG4gKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gYXNzb2NpYXRlIHdpdGggdGhlIGtleS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEdsb2JhbFN0YXRlKGtleSwgdmFsdWUpIHtcbiAgLy8gQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciBvdXIgZ2xvYmFsIHN0YXRlIGlmIGl0IGRvZXNuJ3QgZXhpc3RcbiAgaWYgKCFQYWNrYWdlPy5tZXRlb3IuZ2xvYmFsLnBlcnNpc3RlbnRTdGF0ZSkge1xuICAgIFBhY2thZ2UubWV0ZW9yLmdsb2JhbC5wZXJzaXN0ZW50U3RhdGUgPSB7fTtcbiAgfVxuXG4gIFBhY2thZ2UubWV0ZW9yLmdsb2JhbC5wZXJzaXN0ZW50U3RhdGVba2V5XSA9IHZhbHVlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYSBrZXkgZnJvbSB0aGUgZ2xvYmFsIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIFRoZSBrZXkgdG8gcmVtb3ZlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlR2xvYmFsU3RhdGUoa2V5KSB7XG4gIGRlbGV0ZSBQYWNrYWdlLm1ldGVvci5nbG9iYWwucGVyc2lzdGVudFN0YXRlW2tleV07XG59XG5cbi8qKlxuICogQ2xlYXJzIGFsbCBrZXlzIGZyb20gdGhlIGdsb2JhbCBzdGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyR2xvYmFsU3RhdGUoKSB7XG4gIFBhY2thZ2UubWV0ZW9yLmdsb2JhbC5wZXJzaXN0ZW50U3RhdGUgPSB7fTtcbn1cbiIsIi8qKlxuICogQnVpbGQgZ2l0aWdub3JlLXN0eWxlIFwidW5pZ25vcmVcIiBwYXR0ZXJucyBmb3Igc3BlY2lmaWMgZmlsZXMvZm9sZGVycy5cbiAqXG4gKiBSdWxlczpcbiAqICAtIEZpbGVzOiAgIWEvICAhYS9iLyAgIWEvYi9jLnR4dFxuICogIC0gRm9sZGVycyAobXVzdCBlbmQgd2l0aCAnLycpOlxuICogICAgICAgICAgICAhYS8gICFhL2IvICAhYS9iL2MvICAhYS9iL2MvKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBpbnB1dFBhdGhzICBQYXRocyB0byBrZWVwLiBVc2UgJy8nIGZvciBkaXJzIChlLmcuICdhc3NldHMvcHVibGljLycpLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmNsdWRlQWxsQW5jZXN0b3JzPXRydWVdICBJZiBmYWxzZSwgb25seSBpbmNsdWRlIHRoZSBpbW1lZGlhdGUgcGFyZW50IGRpci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW5jbHVkZUdsb2JGb3JEaXJzPXRydWVdICAgRW1pdCAnKionIGZvciBkaXJlY3Rvcmllcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5za2lwTGV2ZWw9MF0gICAgICAgICAgICAgICBTa2lwIHRoaXMgbWFueSBsZXZlbHMgZnJvbSB0aGUgYmVnaW5uaW5nLlxuICogQHJldHVybnMge3N0cmluZ1tdfSBOZWdhdGlvbiBwYXR0ZXJucywgaW4gY29ycmVjdCBvcmRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVW5pZ25vcmVQYXR0ZXJucyhpbnB1dFBhdGhzLCB7XG4gIGluY2x1ZGVBbGxBbmNlc3RvcnMgPSB0cnVlLFxuICBpbmNsdWRlR2xvYkZvckRpcnMgPSB0cnVlLFxuICBza2lwTGV2ZWwgPSAwLFxufSA9IHt9KSB7XG4gIGNvbnN0IG91dCA9IFtdO1xuICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuXG4gIGNvbnN0IHB1c2ggPSAocCkgPT4ge1xuICAgIGlmICghc2Vlbi5oYXMocCkpIHtcbiAgICAgIHNlZW4uYWRkKHApO1xuICAgICAgb3V0LnB1c2gocCk7XG4gICAgfVxuICB9O1xuXG4gIGZvciAobGV0IHJhdyBvZiBpbnB1dFBhdGhzKSB7XG4gICAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpIGNvbnRpbnVlO1xuXG4gICAgLy8gTm9ybWFsaXplOiBmb3J3YXJkIHNsYXNoZXMsIGRyb3AgbGVhZGluZyAnLi8nLCBjb2xsYXBzZSBkb3VibGUgc2xhc2hlc1xuICAgIGxldCBhbmNob3JlZCA9IHJhdy5zdGFydHNXaXRoKCcvJyk7XG4gICAgbGV0IHAgPSByYXcucmVwbGFjZSgvXFxcXC9nLCAnLycpXG4gICAgICAucmVwbGFjZSgvXlxcLlxcLysvLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXC97Mix9L2csICcvJyk7XG5cbiAgICAvLyBkZXRlY3QgZGlyIGJ5IHRyYWlsaW5nIHNsYXNoXG4gICAgY29uc3QgaXNEaXIgPSBwLmVuZHNXaXRoKCcvJyk7XG4gICAgLy8gc3RyaXAgbGVhZGluZyArIHRyYWlsaW5nIHNsYXNoZXMgZm9yIHNwbGl0dGluZywgYnV0IHJlbWVtYmVyIGFuY2hvcmluZ1xuICAgIGNvbnN0IGNvcmUgPSBwLnJlcGxhY2UoL15cXC8rLywgJycpLnJlcGxhY2UoL1xcLyskLywgJycpO1xuICAgIGlmICghY29yZSkgY29udGludWU7XG5cbiAgICBjb25zdCBwYXJ0cyA9IGNvcmUuc3BsaXQoJy8nKTtcblxuICAgIC8vIFByb2Nlc3MgYmFzZWQgb24gc2tpcExldmVsXG4gICAgaWYgKHNraXBMZXZlbCA+PSBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIC8vIFNraXAgZXZlcnl0aGluZyBpZiBza2lwTGV2ZWwgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZSBudW1iZXIgb2YgcGFydHNcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEFuY2VzdG9ycyAodG9wLWRvd24pXG4gICAgaWYgKGluY2x1ZGVBbGxBbmNlc3RvcnMpIHtcbiAgICAgIC8vIFN0YXJ0IGZyb20gc2tpcExldmVsICsgMSB0byBza2lwIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGxldmVsc1xuICAgICAgY29uc3Qgc3RhcnRMZXZlbCA9IE1hdGgubWF4KDEsIHNraXBMZXZlbCArIDEpO1xuICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0TGV2ZWw7IGkgPD0gcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFuYyA9IChhbmNob3JlZCA/ICcvJyA6ICcnKSArIHBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJy8nKSArICcvJztcbiAgICAgICAgcHVzaCgnIScgKyBhbmMpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgLy8gT25seSBpbW1lZGlhdGUgcGFyZW50XG4gICAgICAvLyBGb3IgbWluaW1hbCBtb2RlIHdpdGggc2tpcExldmVsLCB3ZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXJlbnQgaXMgYXQgYSBsZXZlbCB3ZSBzaG91bGQgc2tpcFxuICAgICAgaWYgKHNraXBMZXZlbCA8IHBhcnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHBhcmVudCdzIGxldmVsIGlzIGdyZWF0ZXIgdGhhbiBza2lwTGV2ZWxcbiAgICAgICAgY29uc3QgcGFyZW50TGV2ZWwgPSBwYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICBpZiAocGFyZW50TGV2ZWwgPiBza2lwTGV2ZWwpIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSAoYW5jaG9yZWQgPyAnLycgOiAnJykgKyBwYXJ0cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGggLSAxKS5qb2luKCcvJykgKyAnLyc7XG4gICAgICAgICAgcHVzaCgnIScgKyBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBmaWxlL2RpcmVjdG9yeSBwYXR0ZXJuXG4gICAgaWYgKGlzRGlyKSB7XG4gICAgICBjb25zdCBkaXIgPSAoYW5jaG9yZWQgPyAnLycgOiAnJykgKyBwYXJ0cy5qb2luKCcvJykgKyAnLyc7XG4gICAgICBwdXNoKCchJyArIGRpcik7XG4gICAgICBpZiAoaW5jbHVkZUdsb2JGb3JEaXJzKSBwdXNoKCchJyArIGRpciArICcqKicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaWxlID0gKGFuY2hvcmVkID8gJy8nIDogJycpICsgcGFydHMuam9pbignLycpO1xuICAgICAgcHVzaCgnIScgKyBmaWxlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuIiwiLy8gQ2hlY2sgaWYgY29sb3JzIHNob3VsZCBiZSBkaXNhYmxlZFxuY29uc3Qgc2hvdWxkRGlzYWJsZUNvbG9ycyA9ICEhcHJvY2Vzcy5lbnYuTUVURU9SX0RJU0FCTEVfQ09MT1JTO1xuXG4vLyBNaW5pbXVtIG1lc3NhZ2UgbGVuZ3RoIGZvciBjb25zaXN0ZW50IGxvZyBmb3JtYXR0aW5nXG5jb25zdCBNSU5fTUVTU0FHRV9MRU5HVEggPSA4MDtcblxuLy8gQU5TSSBjb2xvciBjb2Rlc1xuY29uc3QgY29sb3JzID0ge1xuICByZXNldDogc2hvdWxkRGlzYWJsZUNvbG9ycyA/IFwiXCIgOiBcIlxceDFiWzBtXCIsXG4gIGJsdWU6IHNob3VsZERpc2FibGVDb2xvcnMgPyBcIlwiIDogXCJcXHgxYlszNG1cIixcbiAgcmVkOiBzaG91bGREaXNhYmxlQ29sb3JzID8gXCJcIiA6IFwiXFx4MWJbMzFtXCIsXG4gIHB1cnBsZTogc2hvdWxkRGlzYWJsZUNvbG9ycyA/IFwiXCIgOiBcIlxceDFiWzM1bVwiLFxuICBncmVlbjogc2hvdWxkRGlzYWJsZUNvbG9ycyA/IFwiXCIgOiBcIlxceDFiWzMybVwiLFxuICBjeWFuOiBzaG91bGREaXNhYmxlQ29sb3JzID8gXCJcIiA6IFwiXFx4MWJbMzZtXCIsXG59O1xuXG4vKipcbiAqIFBhZCBhIG1lc3NhZ2UgdG8gZW5zdXJlIGl0IGhhcyBhIG1pbmltdW0gbGVuZ3RoXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIHBhZFxuICogQHBhcmFtIHtudW1iZXJ9IG1pbkxlbmd0aCAtIFRoZSBtaW5pbXVtIGxlbmd0aCAoZGVmYXVsdDogTUlOX01FU1NBR0VfTEVOR1RIKVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIHBhZGRlZCBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRNZXNzYWdlKG1lc3NhZ2UsIG1pbkxlbmd0aCA9IE1JTl9NRVNTQUdFX0xFTkdUSCkge1xuICBpZiAobWVzc2FnZS5sZW5ndGggPj0gbWluTGVuZ3RoKSB7XG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2UucGFkRW5kKG1pbkxlbmd0aCk7XG59XG5cbi8qKlxuICogTG9nIGEgcHJvZ3Jlc3MgbWVzc2FnZSBpbiBibHVlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGxvZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nUHJvZ3Jlc3MobWVzc2FnZSkge1xuICBjb25zb2xlLmxvZyhgJHtjb2xvcnMuYmx1ZX0ke3BhZE1lc3NhZ2UobWVzc2FnZSl9JHtjb2xvcnMucmVzZXR9YCk7XG59XG5cbi8qKlxuICogTG9nIGFuIGVycm9yIG1lc3NhZ2UgaW4gcmVkXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGxvZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nRXJyb3IobWVzc2FnZSkge1xuICBjb25zb2xlLmVycm9yKGAke2NvbG9ycy5yZWR9JHtwYWRNZXNzYWdlKG1lc3NhZ2UpfSR7Y29sb3JzLnJlc2V0fWApO1xufVxuXG4vKipcbiAqIExvZyBhbiBpbmZvIG1lc3NhZ2UgaW4gY3lhblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBsb2dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0luZm8obWVzc2FnZSkge1xuICBjb25zb2xlLmxvZyhgJHtjb2xvcnMuY3lhbn0ke3BhZE1lc3NhZ2UobWVzc2FnZSl9JHtjb2xvcnMucmVzZXR9YCk7XG59XG5cbi8qKlxuICogTG9nIGEgcmF3IG1lc3NhZ2Ugd2l0aG91dCBhbnkgY29sb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gbG9nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dSYXcobWVzc2FnZSkge1xuICBjb25zb2xlLmxvZyhwYWRNZXNzYWdlKG1lc3NhZ2UpKTtcbn1cblxuLyoqXG4gKiBMb2cgYSBzdWNjZXNzIG1lc3NhZ2UgaW4gZ3JlZW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gbG9nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dTdWNjZXNzKG1lc3NhZ2UpIHtcbiAgY29uc29sZS5sb2coYCR7Y29sb3JzLmdyZWVufSR7cGFkTWVzc2FnZShtZXNzYWdlKX0ke2NvbG9ycy5yZXNldH1gKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJ1bkxvZ0luc3RhbmNlIGZyb20gdGhlIFBsdWdpbiBvYmplY3QgaWYgaXQgZXhpc3RzXG4gKiBAcmV0dXJucyB7T2JqZWN0fHVuZGVmaW5lZH0gVGhlIHJ1bkxvZ0luc3RhbmNlIG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UnVuTG9nKCkge1xuICBpZiAodHlwZW9mIFBsdWdpbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gUGx1Z2luLnJ1bkxvZ0luc3RhbmNlO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCB7IGxvZ0Vycm9yIH0gPSByZXF1aXJlKFwiLi9sb2dcIik7XG5cbi8vIE5vcm1hbGl6ZSBhIHBhdGggdG8gYWx3YXlzIHVzZSBmb3J3YXJkIHNsYXNoZXMgKFBPU0lYIHN0eWxlKS5cbi8vIE1vZHVsZSBpZGVudGlmaWVycyBtdXN0IHVzZSAnLycgcmVnYXJkbGVzcyBvZiBPUy5cbmNvbnN0IHRvUG9zaXggPSAocCkgPT4gcC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uLlxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXRlb3JBcHBEaXIoKSB7XG4gIHJldHVybiBwcm9jZXNzLmN3ZCgpO1xufVxuXG4vKipcbiAqIFJlYWRzIGFuZCBwYXJzZXMgdGhlIHBhY2thZ2UuanNvbiBmaWxlIG9mIHRoZSBNZXRlb3IgYXBwbGljYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgcGFyc2VkIGNvbnRlbnQgb2YgdGhlIHBhY2thZ2UuanNvbiBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0ZW9yQXBwUGFja2FnZUpzb24oKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKFxuICAgIGZzLnJlYWRGaWxlU3luYyhgJHtnZXRNZXRlb3JBcHBEaXIoKX0vcGFja2FnZS5qc29uYCwgJ3V0Zi04JylcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIE1ldGVvciBjb25maWd1cmF0aW9uIGZyb20gdGhlIGFwcGxpY2F0aW9uJ3MgcGFja2FnZS5qc29uLlxuICogQHJldHVybnMge09iamVjdHx1bmRlZmluZWR9IFRoZSBNZXRlb3IgY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgdW5kZWZpbmVkIGlmIG5vdCBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGVvckFwcENvbmZpZygpIHtcbiAgcmV0dXJuIHR5cGVvZiBQbHVnaW4/LmdldE1ldGVvckNvbmZpZyA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gUGx1Z2luLmdldE1ldGVvckNvbmZpZygpXG4gICAgOiBnZXRNZXRlb3JBcHBQYWNrYWdlSnNvbigpPy5tZXRlb3I7XG59XG5cbi8qKlxuICogR2V0IE1ldGVvcidzIGFwcCBwb3J0XG4gKiBAcmV0dXJucyB7ZmFsc2V8Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGVvckFwcFBvcnQoKSB7XG4gIHJldHVybiBQYWNrYWdlPy5tZXRlb3I/Lmdsb2JhbD8uY3VycmVudENvbW1hbmQ/Lm9wdGlvbnM/LlsncG9ydCddIHx8IHByb2Nlc3MuZW52LlBPUlQgfHwgJzMwMDAnO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbW9kZXJuIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgYXBwbGljYXRpb24ncyBwYWNrYWdlLmpzb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fHVuZGVmaW5lZH0gVGhlIG1vZGVybiBjb25maWd1cmF0aW9uIG9iamVjdCBvciB1bmRlZmluZWQgaWYgbm90IGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0ZW9yQXBwQ29uZmlnTW9kZXJuKCkge1xuICByZXR1cm4gZ2V0TWV0ZW9yQXBwQ29uZmlnKCk/Lm1vZGVybjtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHZlcmJvc2UgZmxhZyBmcm9tIHRoZSBhcHBsaWNhdGlvbidzIHBhY2thZ2UuanNvbi5cbiAqIEByZXR1cm5zIHtib29sZWFufHVuZGVmaW5lZH0gVGhlIHZlcmJvc2UgZmxhZyBvciB1bmRlZmluZWQgaWYgbm90IGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlKCkge1xuICByZXR1cm4gZ2V0TWV0ZW9yQXBwQ29uZmlnTW9kZXJuKCk/LnZlcmJvc2UgfHxcbiAgICBnZXRNZXRlb3JBcHBDb25maWdNb2Rlcm4oKT8udHJhbnNwaWxlcj8udmVyYm9zZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGF1dG8gaW5zdGFsbCBkZXBzIGZsYWcgZnJvbSB0aGUgYXBwJ3MgcGFja2FnZS5qc29uLlxuICogQHJldHVybnMge0Jvb2xlYW58Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGVvckFwcENvbmZpZ0F1dG9JbnN0YWxsRGVwcygpIHtcbiAgY29uc3QgeyBhdXRvSW5zdGFsbERlcHMgPSB0cnVlIH0gPSBnZXRNZXRlb3JBcHBDb25maWcoKSB8fCB7fTtcbiAgcmV0dXJuICEhYXV0b0luc3RhbGxEZXBzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZW50cnkgcG9pbnRzIGZvciB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uIGZyb20gdGhlIGNvbmZpZ3VyYXRpb24uXG4gKiBVc2VzIFBsdWdpbi5nZXRNZXRlb3JDb25maWcoKSBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxscyBiYWNrIHRvIGdldE1ldGVvckFwcENvbmZpZygpLlxuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1haW4gYW5kIHRlc3QgZW50cnkgcG9pbnRzIGZvciBjbGllbnQgYW5kIHNlcnZlci5cbiAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfSBtYWluQ2xpZW50IC0gVGhlIGNsaWVudCBtYWluIG1vZHVsZSBwYXRoLlxuICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IG1haW5TZXJ2ZXIgLSBUaGUgc2VydmVyIG1haW4gbW9kdWxlIHBhdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH0gdGVzdENsaWVudCAtIFRoZSBjbGllbnQgdGVzdCBtb2R1bGUgcGF0aC5cbiAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfSB0ZXN0U2VydmVyIC0gVGhlIHNlcnZlciB0ZXN0IG1vZHVsZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0ZW9yQXBwRW50cnlwb2ludHMoKSB7XG4gIGNvbnN0IG1ldGVvckNvbmZpZyA9IGdldE1ldGVvckFwcENvbmZpZygpO1xuICByZXR1cm4ge1xuICAgIG1haW5DbGllbnQ6IG1ldGVvckNvbmZpZz8ubWFpbk1vZHVsZT8uY2xpZW50LFxuICAgIG1haW5TZXJ2ZXI6IG1ldGVvckNvbmZpZz8ubWFpbk1vZHVsZT8uc2VydmVyLFxuICAgIHRlc3RDbGllbnQ6IG1ldGVvckNvbmZpZz8udGVzdE1vZHVsZT8uY2xpZW50IHx8IG1ldGVvckNvbmZpZz8udGVzdE1vZHVsZSxcbiAgICB0ZXN0U2VydmVyOiBtZXRlb3JDb25maWc/LnRlc3RNb2R1bGU/LnNlcnZlciB8fCBtZXRlb3JDb25maWc/LnRlc3RNb2R1bGUsXG4gIH07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBpbml0aWFsIGVudHJ5IHBvaW50cyBmb3IgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBmcm9tIHRoZSBwYWNrYWdlLmpzb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFpbiBhbmQgdGVzdCBlbnRyeSBwb2ludHMgZm9yIGNsaWVudCBhbmQgc2VydmVyLlxuICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IG1haW5DbGllbnQgLSBUaGUgY2xpZW50IG1haW4gbW9kdWxlIHBhdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH0gbWFpbkNsaWVudEh0bWwgLSBUaGUgY2xpZW50IG1haW4gaHRtbCBwYXRoLlxuICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IG1haW5TZXJ2ZXIgLSBUaGUgc2VydmVyIG1haW4gbW9kdWxlIHBhdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH0gdGVzdENsaWVudCAtIFRoZSBjbGllbnQgdGVzdCBtb2R1bGUgcGF0aC5cbiAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfSB0ZXN0U2VydmVyIC0gVGhlIHNlcnZlciB0ZXN0IG1vZHVsZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0ZW9ySW5pdGlhbEFwcEVudHJ5cG9pbnRzKCkge1xuICBjb25zdCBtZXRlb3JDb25maWcgPSBnZXRNZXRlb3JBcHBQYWNrYWdlSnNvbigpPy5tZXRlb3I7XG4gIGNvbnN0IG1haW5DbGllbnQgPSBtZXRlb3JDb25maWc/Lm1haW5Nb2R1bGU/LmNsaWVudDtcblxuICBsZXQgbWFpbkNsaWVudEh0bWw7XG4gIGlmIChtYWluQ2xpZW50KSB7XG4gICAgY29uc3QgY2xpZW50RGlyID0gcGF0aC5kaXJuYW1lKG1haW5DbGllbnQpO1xuICAgIGNvbnN0IGNsaWVudEJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShtYWluQ2xpZW50LCBwYXRoLmV4dG5hbWUobWFpbkNsaWVudCkpO1xuICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKFxuICAgICAgZ2V0TWV0ZW9yQXBwRGlyKCksXG4gICAgICBjbGllbnREaXIsXG4gICAgICBgJHtjbGllbnRCYXNlbmFtZX0uaHRtbGBcbiAgICApO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XG4gICAgICBtYWluQ2xpZW50SHRtbCA9IHRvUG9zaXgocGF0aC5qb2luKGNsaWVudERpciwgYCR7Y2xpZW50QmFzZW5hbWV9Lmh0bWxgKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZpbmQgZmlyc3QgaHRtbCBpbiBlbnRyeSBmb2xkZXJcbiAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKGdldE1ldGVvckFwcERpcigpLCBjbGllbnREaXIpKTtcbiAgICAgIGNvbnN0IGh0bWxGaWxlID0gZmlsZXMuZmluZCgoZmlsZSkgPT4gcGF0aC5leHRuYW1lKGZpbGUpID09PSBcIi5odG1sXCIpO1xuICAgICAgaWYgKGh0bWxGaWxlKSB7XG4gICAgICAgIG1haW5DbGllbnRIdG1sID0gdG9Qb3NpeChwYXRoLmpvaW4oY2xpZW50RGlyLCBodG1sRmlsZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbWFpbkNsaWVudCxcbiAgICBtYWluQ2xpZW50SHRtbCxcbiAgICBtYWluU2VydmVyOiBtZXRlb3JDb25maWc/Lm1haW5Nb2R1bGU/LnNlcnZlcixcbiAgICAuLi4obWV0ZW9yQ29uZmlnPy50ZXN0TW9kdWxlPy5jbGllbnQgJiYge1xuICAgICAgdGVzdENsaWVudDogbWV0ZW9yQ29uZmlnPy50ZXN0TW9kdWxlPy5jbGllbnQsXG4gICAgfSksXG4gICAgLi4uKG1ldGVvckNvbmZpZz8udGVzdE1vZHVsZT8uc2VydmVyICYmIHtcbiAgICAgIHRlc3RTZXJ2ZXI6IG1ldGVvckNvbmZpZz8udGVzdE1vZHVsZT8uc2VydmVyLFxuICAgIH0pLFxuICAgIC4uLighbWV0ZW9yQ29uZmlnPy50ZXN0TW9kdWxlPy5jbGllbnQgJiZcbiAgICAgICFtZXRlb3JDb25maWc/LnRlc3RNb2R1bGU/LnNlcnZlciAmJiB7XG4gICAgICAgIHRlc3RNb2R1bGU6IG1ldGVvckNvbmZpZz8udGVzdE1vZHVsZSxcbiAgICAgIH0pLFxuICB9O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBNZXRlb3IgcHJvamVjdCBpcyBjb25maWd1cmVkIGFzIHRlc3QgbW9kdWxlLlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvckFwcFRlc3RNb2R1bGUoKSB7XG4gIHJldHVybiBnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMoKS50ZXN0TW9kdWxlICE9IG51bGw7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uIGVudHJ5IHBvaW50cyBpbiBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBlbnRyeSBwb2ludHMgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubWFpbkNsaWVudF0gLSBUaGUgY2xpZW50IG1haW4gbW9kdWxlIHBhdGguXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubWFpblNlcnZlcl0gLSBUaGUgc2VydmVyIG1haW4gbW9kdWxlIHBhdGguXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudGVzdE1vZHVsZV0gLSBUaGUgdGVzdCBtb2R1bGUgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50ZXN0Q2xpZW50XSAtIFRoZSBjbGllbnQgdGVzdCBtb2R1bGUgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50ZXN0U2VydmVyXSAtIFRoZSBzZXJ2ZXIgdGVzdCBtb2R1bGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldE1ldGVvckFwcEVudHJ5cG9pbnRzKHtcbiAgbWFpbkNsaWVudCxcbiAgbWFpblNlcnZlcixcbiAgdGVzdE1vZHVsZSxcbiAgdGVzdENsaWVudCxcbiAgdGVzdFNlcnZlcixcbn0pIHtcbiAgaWYgKG1haW5DbGllbnQpIHtcbiAgICBwcm9jZXNzLmVudi5NRVRFT1JfQ09ORklHX0NMSUVOVCA9IG1haW5DbGllbnQ7XG4gIH1cbiAgaWYgKG1haW5TZXJ2ZXIpIHtcbiAgICBwcm9jZXNzLmVudi5NRVRFT1JfQ09ORklHX1NFUlZFUiA9IG1haW5TZXJ2ZXI7XG4gIH1cbiAgaWYgKHRlc3RNb2R1bGUpIHtcbiAgICBwcm9jZXNzLmVudi5NRVRFT1JfQ09ORklHX1RFU1QgPSB0ZXN0TW9kdWxlO1xuICB9IGVsc2Uge1xuICAgIGlmICh0ZXN0Q2xpZW50KSB7XG4gICAgICBwcm9jZXNzLmVudi5NRVRFT1JfQ09ORklHX1RFU1RfQ0xJRU5UID0gdGVzdENsaWVudDtcbiAgICB9XG4gICAgaWYgKHRlc3RTZXJ2ZXIpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk1FVEVPUl9DT05GSUdfVEVTVF9TRVJWRVIgPSB0ZXN0U2VydmVyO1xuICAgIH1cbiAgfVxuICBnbG9iYWwucmVpbml0aWFsaXplTWV0ZW9yQ29uZmlnPy4oKTtcbn1cblxuLyoqXG4gKiBTZXRzIHBhdHRlcm5zIHRvIGJlIGlnbm9yZWQgYnkgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBpbiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKiBBcHBlbmRzIHRoZSBuZXcgaWdub3JlIHBhdHRlcm4gdG8gYW55IGV4aXN0aW5nIG9uZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWdub3JlIC0gVGhlIHBhdHRlcm4gdG8gYmUgaWdub3JlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldE1ldGVvckFwcElnbm9yZShpZ25vcmUpIHtcbiAgcHJvY2Vzcy5lbnYuTUVURU9SX0lHTk9SRSA9IGAke3Byb2Nlc3MuZW52Lk1FVEVPUl9JR05PUkUgfHwgJyd9ICR7aWdub3JlfWAudHJpbSgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBNZXRlb3IgY29tbWFuZCBpcyAncnVuJy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGNvbW1hbmQgaXMgJ3J1bicsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQXBwUnVuKCkge1xuICByZXR1cm4gUGFja2FnZT8ubWV0ZW9yPy5nbG9iYWw/LmN1cnJlbnRDb21tYW5kPy5uYW1lID09PSAncnVuJztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgTWV0ZW9yIGNvbW1hbmQgaXMgJ2J1aWxkJy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGNvbW1hbmQgaXMgJ2J1aWxkJywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBCdWlsZCgpIHtcbiAgcmV0dXJuIFsnYnVpbGQnLCAnZGVwbG95J10uaW5jbHVkZXMoUGFja2FnZT8ubWV0ZW9yPy5nbG9iYWw/LmN1cnJlbnRDb21tYW5kPy5uYW1lKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgTWV0ZW9yIGNvbW1hbmQgaXMgJ3VwZGF0ZScuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBjb21tYW5kIGlzICd1cGRhdGUnLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvckFwcFVwZGF0ZSgpIHtcbiAgcmV0dXJuIFBhY2thZ2U/Lm1ldGVvcj8uZ2xvYmFsPy5jdXJyZW50Q29tbWFuZD8ubmFtZSA9PT0gJ3VwZGF0ZSc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IE1ldGVvciBjb21tYW5kIGlzICd0ZXN0Jy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGNvbW1hbmQgaXMgJ3Rlc3QnLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvckFwcFRlc3QoKSB7XG4gIHJldHVybiBQYWNrYWdlPy5tZXRlb3I/Lmdsb2JhbD8uY3VycmVudENvbW1hbmQ/Lm5hbWUgPT09ICd0ZXN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgTWV0ZW9yIGNvbW1hbmQgaXMgJ3Rlc3QnIGFuZCBpcyBydW5uaW5nIGluIGZ1bGwgYXBwIG1vZGUuXG4gKiBAcmV0dXJucyB7ZmFsc2V8Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQXBwVGVzdEZ1bGxBcHAoKSB7XG4gIHJldHVybiBpc01ldGVvckFwcFRlc3QoKSAmJiAhIVBhY2thZ2U/Lm1ldGVvcj8uZ2xvYmFsPy5jdXJyZW50Q29tbWFuZD8ub3B0aW9ucz8uWydmdWxsLWFwcCddO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBNZXRlb3IgY29tbWFuZCBpcyAndGVzdCcgYW5kIGlzIHJ1bm5pbmcgaW4gd2F0Y2ggbW9kZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGNvbW1hbmQgaXMgJ3Rlc3QnIGFuZCBpcyBydW5uaW5nIGluIHdhdGNoIG1vZGUsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQXBwVGVzdFdhdGNoKCkge1xuICByZXR1cm4gaXNNZXRlb3JBcHBUZXN0KCkgJiYgIVBhY2thZ2U/Lm1ldGVvcj8uZ2xvYmFsPy5jdXJyZW50Q29tbWFuZD8ub3B0aW9ucz8ub25jZTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgY3VycmVudCBNZXRlb3IgY3VycmVudCBjb21tYW5kIGlzIHJ1bm5pbmcgQW5kcm9pZC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBOYXRpdmVBbmRyb2lkKCkge1xuICByZXR1cm4gUGFja2FnZT8ubWV0ZW9yPy5nbG9iYWw/LmN1cnJlbnRDb21tYW5kPy5vcHRpb25zPy5hcmdzPy5zb21lKF9hcmcgPT5cbiAgICBbJ2FuZHJvaWQnLCAnYW5kcm9pZC1kZXZpY2UnXS5pbmNsdWRlcyhfYXJnKVxuICApO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBjdXJyZW50IE1ldGVvciBjdXJyZW50IGNvbW1hbmQgaXMgcnVubmluZyBpT1MuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQXBwTmF0aXZlSW9zKCkge1xuICByZXR1cm4gUGFja2FnZT8ubWV0ZW9yPy5nbG9iYWw/LmN1cnJlbnRDb21tYW5kPy5vcHRpb25zPy5hcmdzPy5zb21lKF9hcmcgPT5cbiAgICBbJ2lvcycsICdpb3MtZGV2aWNlJ10uaW5jbHVkZXMoX2FyZylcbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgTWV0ZW9yIGNvbW1hbmQgaXMgcnVubmluZyBuYXRpdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQXBwTmF0aXZlKCkge1xuICByZXR1cm4gaXNNZXRlb3JBcHBOYXRpdmVBbmRyb2lkKCkgfHwgaXNNZXRlb3JBcHBOYXRpdmVJb3MoKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGRldmVsb3BtZW50IG1vZGUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaXMgaW4gZGV2ZWxvcG1lbnQgbW9kZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBEZXZlbG9wbWVudCgpIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbic7XG4gIH1cbiAgcmV0dXJuIFBhY2thZ2UubWV0ZW9yPy5NZXRlb3IuaXNEZXZlbG9wbWVudCAmJiAhaXNNZXRlb3JBcHBCdWlsZCgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gcHJvZHVjdGlvbiBtb2RlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIGluIHByb2R1Y3Rpb24gbW9kZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBQcm9kdWN0aW9uKCkge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJztcbiAgfVxuICByZXR1cm4gUGFja2FnZS5tZXRlb3I/Lk1ldGVvci5pc1Byb2R1Y3Rpb24gfHwgaXNNZXRlb3JBcHBCdWlsZCgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gZGVidWcgbW9kZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBpbiBkZWJ1ZyBtb2RlLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvckFwcERlYnVnKCkge1xuICByZXR1cm4gUGFja2FnZS5tZXRlb3I/Lk1ldGVvci5pc0RlYnVnIHx8IChcbiAgICAhIXByb2Nlc3MuZW52Lk5PREVfSU5TUEVDVE9SX0lQQyB8fFxuICAgICEhcHJvY2Vzcy5lbnYuVlNDT0RFX0lOU1BFQ1RPUl9PUFRJT05TIHx8XG4gICAgT2JqZWN0LmtleXMoZ2xvYmFsLmN1cnJlbnRDb21tYW5kPy5vcHRpb25zIHx8IHt9KS5zb21lKGZ1bmN0aW9uKF9hcmcpIHtcbiAgICAgIHJldHVybiBbJ2luc3BlY3QnLCAnZGVidWcnLCAnYnJrJ10uaW5jbHVkZXMoX2FyZyk7XG4gICAgfSlcbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIHdpdGggTUVURU9SX1BST0ZJTEUgZW5hYmxlZC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIE1FVEVPUl9QUk9GSUxFIGlzIHNldCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JBcHBQcm9maWxlKCkge1xuICByZXR1cm4gISFwcm9jZXNzLmVudi5NRVRFT1JfUFJPRklMRTtcbn1cblxuLyoqXG4gKiBTZXRzIGEgY3VzdG9tIHNjcmlwdCBVUkwgZm9yIHRoZSBNZXRlb3IgYXBwbGljYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICogQHBhcmFtIHtzdHJpbmd9IHNjcmlwdFVybCAtIFRoZSBVUkwgb2YgdGhlIGN1c3RvbSBzY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNZXRlb3JBcHBDdXN0b21TY3JpcHRVcmwoc2NyaXB0VXJsKSB7XG4gIHByb2Nlc3MuZW52Lk1FVEVPUl9BUFBfQ1VTVE9NX1NDUklQVF9VUkwgPSBzY3JpcHRVcmw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbGlzdCBvZiBhbGwgcGFja2FnZXMgaW5zdGFsbGVkIGluIHRoZSBNZXRlb3IgYXBwbGljYXRpb24uXG4gKiBAcmV0dXJucyB7c3RyaW5nW119IEFuIGFycmF5IG9mIHBhY2thZ2UgbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXRlb3JBcHBQYWNrYWdlcygpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKFBhY2thZ2U/Lm1ldGVvcj8uZ2xvYmFsPy5wYWNrYWdlVmVyc2lvbk1hcCB8fCB7fSk7XG59XG5cbi8qKlxuICogR2V0cyBhbGwgZmlsZXMgYW5kIGZvbGRlcnMgZnJvbSB0aGUgcm9vdCBsZXZlbCBvZiB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25zIGZvciBnZXR0aW5nIGZpbGVzIGFuZCBmb2xkZXJzLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZWN1cnNpdmU9dHJ1ZV0gLSBXaGV0aGVyIHRvIHNjYW4gZGlyZWN0b3JpZXMgcmVjdXJzaXZlbHkuXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IFtvcHRpb25zLmlnbm9yZT1bXV0gLSBQYXR0ZXJucyB0byBpZ25vcmUgKGUuZy4sIFsnbm9kZV9tb2R1bGVzJywgJy5naXQnXSkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmluY2x1ZGVTdGF0cz1mYWxzZV0gLSBXaGV0aGVyIHRvIGluY2x1ZGUgZmlsZS9mb2xkZXIgc3RhdHMgaW4gdGhlIHJlc3VsdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zdGFydFBhdGhdIC0gQ3VzdG9tIHN0YXJ0IHBhdGggKGRlZmF1bHRzIHRvIE1ldGVvciBhcHAgcm9vdCkuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3Qgd2l0aCAnZmlsZXMnIGFuZCAnZGlyZWN0b3JpZXMnIGFycmF5cyBjb250YWluaW5nIHBhdGhzIHJlbGF0aXZlIHRvIHRoZSByb290LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0ZW9yQXBwRmlsZXNBbmRGb2xkZXJzKG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCB7XG4gICAgcmVjdXJzaXZlID0gdHJ1ZSxcbiAgICBpZ25vcmUgPSBbJ25vZGVfbW9kdWxlcycsICcuZ2l0JywgJy5tZXRlb3IvbG9jYWwnXSxcbiAgICBpbmNsdWRlU3RhdHMgPSBmYWxzZSxcbiAgICBzdGFydFBhdGggPSBnZXRNZXRlb3JBcHBEaXIoKVxuICB9ID0gb3B0aW9ucztcblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY2hlY2sgaWYgYSBwYXRoIHNob3VsZCBiZSBpZ25vcmVkXG4gIGNvbnN0IHNob3VsZElnbm9yZSA9IChpdGVtUGF0aCkgPT4ge1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoZ2V0TWV0ZW9yQXBwRGlyKCksIGl0ZW1QYXRoKTtcbiAgICByZXR1cm4gaWdub3JlLnNvbWUocGF0dGVybiA9PiB7XG4gICAgICBpZiAocGF0dGVybi5lbmRzV2l0aCgnLyoqJykpIHtcbiAgICAgICAgY29uc3QgZGlyUGF0dGVybiA9IHBhdHRlcm4uc2xpY2UoMCwgLTMpO1xuICAgICAgICByZXR1cm4gcmVsYXRpdmVQYXRoID09PSBkaXJQYXR0ZXJuIHx8IHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKGAke2RpclBhdHRlcm59L2ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbGF0aXZlUGF0aCA9PT0gcGF0dGVybiB8fCByZWxhdGl2ZVBhdGguc3RhcnRzV2l0aChgJHtwYXR0ZXJufS9gKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gcmVjdXJzaXZlbHkgc2NhbiBkaXJlY3Rvcmllc1xuICBjb25zdCBzY2FuRGlyZWN0b3J5ID0gKGRpclBhdGgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBmaWxlczogW10sXG4gICAgICBkaXJlY3RvcmllczogW11cbiAgICB9O1xuXG4gICAgaWYgKHNob3VsZElnbm9yZShkaXJQYXRoKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaXRlbXMgPSBmcy5yZWFkZGlyU3luYyhkaXJQYXRoKTtcblxuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1QYXRoID0gcGF0aC5qb2luKGRpclBhdGgsIGl0ZW0pO1xuXG4gICAgICAgIC8vIFNraXAgaWYgdGhlIGl0ZW0gc2hvdWxkIGJlIGlnbm9yZWRcbiAgICAgICAgaWYgKHNob3VsZElnbm9yZShpdGVtUGF0aCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhpdGVtUGF0aCk7XG4gICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShnZXRNZXRlb3JBcHBEaXIoKSwgaXRlbVBhdGgpO1xuXG4gICAgICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIC8vIEFkZCBkaXJlY3RvcnkgdG8gdGhlIHJlc3VsdFxuICAgICAgICAgICAgcmVzdWx0LmRpcmVjdG9yaWVzLnB1c2goXG4gICAgICAgICAgICAgIGluY2x1ZGVTdGF0cyA/IHsgcGF0aDogcmVsYXRpdmVQYXRoLCBzdGF0cyB9IDogcmVsYXRpdmVQYXRoXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzY2FuIHN1YmRpcmVjdG9yaWVzIGlmIHJlY3Vyc2l2ZSBvcHRpb24gaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICBjb25zdCBzdWJSZXN1bHQgPSBzY2FuRGlyZWN0b3J5KGl0ZW1QYXRoKTtcbiAgICAgICAgICAgICAgcmVzdWx0LmZpbGVzLnB1c2goLi4uc3ViUmVzdWx0LmZpbGVzKTtcbiAgICAgICAgICAgICAgcmVzdWx0LmRpcmVjdG9yaWVzLnB1c2goLi4uc3ViUmVzdWx0LmRpcmVjdG9yaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAvLyBBZGQgZmlsZSB0byB0aGUgcmVzdWx0XG4gICAgICAgICAgICByZXN1bHQuZmlsZXMucHVzaChcbiAgICAgICAgICAgICAgaW5jbHVkZVN0YXRzID8geyBwYXRoOiByZWxhdGl2ZVBhdGgsIHN0YXRzIH0gOiByZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIC8vIFNraXAgaXRlbXMgdGhhdCBjYW4ndCBiZSBhY2Nlc3NlZFxuICAgICAgICAgIGxvZ0Vycm9yKGA9PiBGYWlsZWQgdG8gYWNjZXNzICR7aXRlbVBhdGh9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nRXJyb3IoYD0+IEZhaWxlZCB0byByZWFkIGRpcmVjdG9yeSAke2RpclBhdGh9OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTdGFydCB0aGUgc2NhbiBmcm9tIHRoZSBzcGVjaWZpZWQgcGF0aFxuICByZXR1cm4gc2NhbkRpcmVjdG9yeShzdGFydFBhdGgpO1xufVxuXG4vKipcbiAqIFJlcXVpcmVzIGEgbW9kdWxlIHJlbGF0aXZlIHRvIHRoZSBNZXRlb3IgdG9vbHMgZGlyZWN0b3J5LlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gVGhlIHBhdGggb2YgdGhlIGZpbGUgdG8gcmVxdWlyZSwgcmVsYXRpdmUgdG8gdGhlIE1ldGVvciB0b29scyBkaXJlY3RvcnkuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgZXhwb3J0ZWQgbW9kdWxlIGZyb20gdGhlIHJlcXVpcmVkIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXRlb3JUb29sc1JlcXVpcmUoZmlsZVBhdGgpIHtcbiAgY29uc3QgbWFpbk1vZHVsZSA9IGdsb2JhbC5wcm9jZXNzLm1haW5Nb2R1bGU7XG4gIGNvbnN0IGFic1BhdGggPSBtYWluTW9kdWxlLmZpbGVuYW1lLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG4gIHJldHVybiBtYWluTW9kdWxlLnJlcXVpcmUocGF0aC5yZXNvbHZlKGFic1BhdGgsIGZpbGVQYXRoKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBNZXRlb3IgYXBwbGljYXRpb24gaXMgYSBCbGF6ZSBwcm9qZWN0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIGEgQmxhemUgcHJvamVjdCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JCbGF6ZVByb2plY3QoKSB7XG4gIHJldHVybiBnZXRNZXRlb3JBcHBQYWNrYWdlcygpLmluY2x1ZGVzKCdibGF6ZScpIHx8IGdldE1ldGVvckFwcFBhY2thZ2VzKCkuaW5jbHVkZXMoJ2JsYXplLWh0bWwtdGVtcGxhdGVzJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBNZXRlb3IgYXBwbGljYXRpb24gaXMgYSBCbGF6ZSBIb3QgcHJvamVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBhIEJsYXplIEhvdCBwcm9qZWN0LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvckJsYXplSG90UHJvamVjdCgpIHtcbiAgcmV0dXJuIGlzTWV0ZW9yQmxhemVQcm9qZWN0KCkgJiYgZ2V0TWV0ZW9yQXBwUGFja2FnZXMoKS5pbmNsdWRlcygnYmxhemUtaG90Jyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBNZXRlb3IgYXBwbGljYXRpb24gaXMgYSBDb2ZmZWVzY3JpcHQgcHJvamVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JDb2ZmZWVzY3JpcHRQcm9qZWN0KCkge1xuICByZXR1cm4gZ2V0TWV0ZW9yQXBwUGFja2FnZXMoKS5pbmNsdWRlcygnY29mZmVlc2NyaXB0Jyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBNZXRlb3IgYXBwbGljYXRpb24gaXMgYSBMZXNzIHByb2plY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaGFzIHRoZSAnbGVzcycgcGFja2FnZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JMZXNzUHJvamVjdCgpIHtcbiAgcmV0dXJuIGdldE1ldGVvckFwcFBhY2thZ2VzKCkuaW5jbHVkZXMoJ2xlc3MnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBpcyBhIFNDU1MgcHJvamVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBoYXMgYW55IHBhY2thZ2UgY29udGFpbmluZyAnc2NzcycsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yU2Nzc1Byb2plY3QoKSB7XG4gIHJldHVybiBnZXRNZXRlb3JBcHBQYWNrYWdlcygpLnNvbWUocGtnID0+IHBrZy5pbmNsdWRlcygnc2NzcycpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIE1ldGVvciBhcHBsaWNhdGlvbiBpcyBhIEJ1bmRsZSBWaXN1YWxpemVyIHByb2plY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9yQnVuZGxlVmlzdWFsaXplclByb2plY3QoKSB7XG4gIHJldHVybiBnZXRNZXRlb3JBcHBQYWNrYWdlcygpLmluY2x1ZGVzKCdidW5kbGUtdmlzdWFsaXplcicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgTWV0ZW9yIGFwcGxpY2F0aW9uIGlzIGEgVHlwZXNjcmlwdCBwcm9qZWN0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIGEgVHlwZXNjcmlwdCBwcm9qZWN0LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGVvclR5cGVzY3JpcHRQcm9qZWN0KCkge1xuICByZXR1cm4gZ2V0TWV0ZW9yQXBwUGFja2FnZXMoKS5pbmNsdWRlcygndHlwZXNjcmlwdCcpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBNZXRlb3IgY29tbWFuZCBpcyAndGVzdC1wYWNrYWdlcycuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBjb21tYW5kIGlzICd0ZXN0LXBhY2thZ2VzJywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRlb3JQYWNrYWdlc1Rlc3QoKSB7XG4gIHJldHVybiBQYWNrYWdlPy5tZXRlb3I/Lmdsb2JhbD8uY3VycmVudENvbW1hbmQ/Lm5hbWUgPT09ICd0ZXN0LXBhY2thZ2VzJztcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwYWNrYWdlIGRpcmVjdG9yaWVzIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGVvckVudlBhY2thZ2VEaXJzKCkge1xuICBmdW5jdGlvbiBwYWNrYWdlRGlyc0Zyb21FbnZWYXIoZW52VmFyLCBkZWxpbWl0ZXIgPSBwYXRoLmRlbGltaXRlcikge1xuICAgIHJldHVybiBwcm9jZXNzLmVudltlbnZWYXJdICYmIHByb2Nlc3MuZW52W2VudlZhcl0uc3BsaXQoZGVsaW1pdGVyKSB8fCBbXTtcbiAgfVxuICByZXR1cm4gW1xuICAgIC8vIE1FVEVPUl9QQUNLQUdFX0RJUlMgc2hvdWxkIHVzZSB0aGUgYXJjaC1zcGVjaWZpYyBkZWxpbWl0ZXJcbiAgICAuLi4ocGFja2FnZURpcnNGcm9tRW52VmFyKCdNRVRFT1JfUEFDS0FHRV9ESVJTJywgcGF0aC5kZWxpbWl0ZXIgfHwgJzonKSksXG4gICAgLy8gUEFDS0FHRV9ESVJTIChkZXByZWNhdGVkKSBhbHdheXMgdXNlZCAnOicgc2VwYXJhdG9yICh5ZXMsIGV2ZW4gV2luZG93cylcbiAgICAuLi4ocGFja2FnZURpcnNGcm9tRW52VmFyKCdQQUNLQUdFX0RJUlMnLCAnOicpKSxcbiAgXTtcbn1cblxuLyoqXG4gKiBTcHJlYWRzIE1ldGVvcidzIFRPT0xfTk9ERV9GTEFHUyB0byBOT0RFX09QVElPTlMgZm9yIHByb3BlciBpbmhlcml0YW5jZVxuICogb2YgTWV0ZW9yLXNwZWNpZmljIHRvb2wgZW52aXJvbm1lbnQgcHJvY2VzcyB2YXJpYWJsZXMuXG4gKiBPbmx5IHNwcmVhZHMgaWYgVE9PTF9OT0RFX0ZMQUdTX0lOSEVSSVQgaXMgdHJ1dGh5IChlbmFibGVkIGJ5IGRlZmF1bHQpLlxuICogQHBhcmFtIHtPYmplY3R9IGVudiAtIFRoZSBjdXJyZW50IGVudmlyb25tZW50IHZhcmlhYmxlc1xuICogQHJldHVybnMge09iamVjdH0gVGhlIHVwZGF0ZWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIHdpdGggTk9ERV9PUFRJT05TXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmhlcml0TWV0ZW9yVG9vbE5vZGVGbGFncyhlbnYgPSB7fSkge1xuICBjb25zdCB0b29sRmxhZ3MgPSBlbnYuVE9PTF9OT0RFX0ZMQUdTO1xuICBpZiAoIXRvb2xGbGFncykge1xuICAgIHJldHVybiBlbnY7XG4gIH1cblxuICAvLyBDaGVjayBpZiBzcHJlYWRpbmcgaXMgZW5hYmxlZCAoZGVmYXVsdDogdHJ1ZSlcbiAgLy8gT25seSBkaXNhYmxlIGlmIFRPT0xfTk9ERV9GTEFHU19JTkhFUklUIGlzIGV4cGxpY2l0bHkgc2V0IHRvIGEgZmFsc3kgdmFsdWVcbiAgLy8gVHJlYXQgXCIwXCIgYXMgZmFsc3kgZm9yIHRoaXMgc3BlY2lmaWMgY2FzZVxuICBjb25zdCBzaG91bGRTcHJlYWQgPSBlbnYuVE9PTF9OT0RFX0ZMQUdTX0lOSEVSSVQgIT09IHVuZGVmaW5lZCBcbiAgICA/IChlbnYuVE9PTF9OT0RFX0ZMQUdTX0lOSEVSSVQgIT09IFwiMFwiICYmICEhZW52LlRPT0xfTk9ERV9GTEFHU19JTkhFUklUKVxuICAgIDogdHJ1ZTtcblxuICBpZiAoIXNob3VsZFNwcmVhZCkge1xuICAgIHJldHVybiBlbnY7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmVudixcbiAgICBOT0RFX09QVElPTlM6IFt0b29sRmxhZ3MsIGVudi5OT0RFX09QVElPTlNdXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAubWFwKHMgPT4gcy50cmltKCkpXG4gICAgICAuam9pbignICcpLFxuICB9O1xufVxuIiwiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHsgc3Bhd25Qcm9jZXNzIH0gPSByZXF1aXJlKCcuL3Byb2Nlc3MnKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBNZXRlb3IgZGV2X2J1bmRsZSBiaW4gZGlyZWN0b3J5IHBhdGggaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgbnVsbC5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFRoZSBwYXRoIHRvIHRoZSBkZXZfYnVuZGxlIGJpbiBkaXJlY3RvcnksIG9yIG51bGwgaWYgbm90IGF2YWlsYWJsZVxuICovXG5mdW5jdGlvbiByZXNvbHZlTm9kZUJpbkRpcigpIHtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIFBsdWdpbiAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgdHlwZW9mIFBsdWdpbi5nZXRDdXJyZW50Tm9kZUJpbkRpciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICBQbHVnaW4uZ2V0Q3VycmVudE5vZGVCaW5EaXIoKSkge1xuICAgICAgcmV0dXJuIFBsdWdpbi5nZXRDdXJyZW50Tm9kZUJpbkRpcigpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2V0Q3VycmVudE5vZGVCaW5EaXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBnZXRDdXJyZW50Tm9kZUJpbkRpcigpO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGZhbGwgdGhyb3VnaFxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgZW52aXJvbm1lbnQgdmFyaWFibGVzIHRoYXQgZW5zdXJlIGNoaWxkIHByb2Nlc3NlcyBjYW4gZmluZFxuICogTWV0ZW9yJ3MgYnVuZGxlZCBOb2RlLmpzIChhbmQgbnBtL25weCkgb24gdGhlaXIgUEFUSC5cbiAqXG4gKiBXaGVuIHRoZSBkZXZfYnVuZGxlIGJpbiBkaXJlY3RvcnkgaXMgYXZhaWxhYmxlLCBpdCBpcyBwcmVwZW5kZWQgdG8gUEFUSFxuICogc28gdGhhdCBgIyEvdXNyL2Jpbi9lbnYgbm9kZWAgc2hlYmFuZ3MgaW4gc3Bhd25lZCBzY3JpcHRzIHJlc29sdmUgdG9cbiAqIE1ldGVvcidzIE5vZGUgcmF0aGVyIHRoYW4gcmVxdWlyaW5nIGEgc2VwYXJhdGUgZ2xvYmFsIGluc3RhbGwuXG4gKlxuICogUmV0dXJucyBhbiBlbXB0eSBvYmplY3Qgd2hlbiB0aGUgYmluIGRpcmVjdG9yeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZCxcbiAqIGxlYXZpbmcgdGhlIGNhbGxlcidzIGVudmlyb25tZW50IHVuY2hhbmdlZC5cbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3Qgd2l0aCBhIFBBVEgga2V5LCBvciBlbXB0eSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVCaW5FbnYoKSB7XG4gIGNvbnN0IGJpbkRpciA9IHJlc29sdmVOb2RlQmluRGlyKCk7XG4gIGlmICghYmluRGlyKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG4gIGNvbnN0IGN1cnJlbnRQYXRoID0gcHJvY2Vzcy5lbnYuUEFUSCB8fCBwcm9jZXNzLmVudi5QYXRoIHx8ICcnO1xuICByZXR1cm4ge1xuICAgIFBBVEg6IGJpbkRpciArIHBhdGguZGVsaW1pdGVyICsgY3VycmVudFBhdGgsXG4gIH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCB0byBhIE5vZGUuanMgYmluYXJ5IHVzaW5nIFBsdWdpbi5nZXRDdXJyZW50Tm9kZUJpbkRpcigpIGlmIGF2YWlsYWJsZSxcbiAqIG90aGVyd2lzZSByZXR1cm5zIG51bGwuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJpbmFyeU5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYmluYXJ5IChlLmcuLCAnbnBtJywgJ25weCcsICdub2RlJylcbiAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH0gVGhlIHBhdGggdG8gdGhlIHNwZWNpZmllZCBiaW5hcnksIG9yIG51bGwgaWYgbm90IGF2YWlsYWJsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZUJpbmFyeVBhdGgoYmluYXJ5TmFtZSkge1xuICBjb25zdCBiaW5EaXIgPSByZXNvbHZlTm9kZUJpbkRpcigpO1xuICBpZiAoYmluRGlyKSB7XG4gICAgcmV0dXJuIHBhdGguam9pbihiaW5EaXIsIGJpbmFyeU5hbWUpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIG5wbSBkZXBlbmRlbmN5IGV4aXN0cyBpbiB0aGUgcHJvamVjdC5cbiAqIEZpcnN0IGNoZWNrcyBvcHRpbWlzdGljYWxseSBpbiBub2RlX21vZHVsZXMgZm9sZGVyLCB0aGVuIGNoZWNrcyBwYWNrYWdlLmpzb24uXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZXBlbmRlbmN5IC0gVGhlIG5wbSBkZXBlbmRlbmN5IG5hbWUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBPcHRpb25zIGZvciB0aGUgY2hlY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jd2RdIC0gQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSlcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tOb2RlTW9kdWxlc10gLSBXaGV0aGVyIHRvIGNoZWNrIGluIG5vZGVfbW9kdWxlcyBmaXJzdCAoZGVmYXVsdHMgdG8gZmFsc2UpXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgZGVwZW5kZW5jeSBleGlzdHMsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOcG1EZXBlbmRlbmN5RXhpc3RzKGRlcGVuZGVuY3ksIG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCBjd2QgPSBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuXG4gIC8vIEZpcnN0LCBvcHRpbWlzdGljYWxseSBjaGVjayBpZiB0aGUgZGVwZW5kZW5jeSBleGlzdHMgaW4gbm9kZV9tb2R1bGVzXG4gIGlmIChvcHRpb25zLmNoZWNrTm9kZU1vZHVsZXMpIHtcbiAgICBjb25zdCBub2RlTW9kdWxlc1BhdGggPSBwYXRoLmpvaW4oY3dkLCAnbm9kZV9tb2R1bGVzJywgZGVwZW5kZW5jeSk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKG5vZGVNb2R1bGVzUGF0aCkpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQgaGFzIGEgcGFja2FnZS5qc29uIHRvIGNvbmZpcm0gaXQncyBhIHZhbGlkIHBhY2thZ2VcbiAgICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5qb2luKG5vZGVNb2R1bGVzUGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYWNrYWdlSnNvblBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gSWYgdGhlcmUncyBhbiBlcnJvciBjaGVja2luZyB0aGUgZmlsZSBzeXN0ZW0sIGNvbnRpbnVlIHRvIHRoZSBmYWxsYmFjayBtZXRob2RcbiAgICB9XG4gIH1cblxuICAvLyBGYWxsYmFjazogQ2hlY2sgcGFja2FnZS5qc29uIGRpcmVjdGx5IGluc3RlYWQgb2YgdXNpbmcgYG5wbSBsc2BcbiAgdHJ5IHtcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLmpvaW4oY3dkLCAncGFja2FnZS5qc29uJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xuICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYWNrYWdlSnNvblBhdGgsICd1dGY4JykpO1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGUgZGVwZW5kZW5jeSBpcyBsaXN0ZWQgaW4gYW55IG9mIHRoZSBkZXBlbmRlbmN5IHNlY3Rpb25zXG4gICAgICByZXR1cm4gISEoXG4gICAgICAgIChwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24uZGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldKSB8fFxuICAgICAgICAocGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llc1tkZXBlbmRlbmN5XSkgfHxcbiAgICAgICAgKHBhY2thZ2VKc29uLm9wdGlvbmFsRGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLm9wdGlvbmFsRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldKSB8fFxuICAgICAgICAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldKVxuICAgICAgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgdGhlcmUncyBhbiBlcnJvciByZWFkaW5nIG9yIHBhcnNpbmcgcGFja2FnZS5qc29uLCByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB3ZSd2ZSByZWFjaGVkIHRoaXMgcG9pbnQsIHRoZSBkZXBlbmRlbmN5IHdhcyBub3QgZm91bmRcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIG5wbSBiaW5hcnkgZXhpc3RzIGluIHRoZSBwcm9qZWN0LlxuICogTG9va3MgZm9yIHRoZSBiaW5hcnkgaW4gdGhlIG5vZGVfbW9kdWxlcy8uYmluIGRpcmVjdG9yeS5cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGJpbmFyeSAtIFRoZSBucG0gYmluYXJ5IG5hbWUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBPcHRpb25zIGZvciB0aGUgY2hlY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jd2RdIC0gQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSlcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBiaW5hcnkgZXhpc3RzLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTnBtQmluYXJ5RXhpc3RzKGJpbmFyeSwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IGJpbmFyeVBhdGggPSBwYXRoLmpvaW4oY3dkLCAnbm9kZV9tb2R1bGVzJywgJy5iaW4nLCBiaW5hcnkpO1xuXG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGJpbmFyeSBmaWxlIGV4aXN0cyBhbmQgaXMgZXhlY3V0YWJsZVxuICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmMoYmluYXJ5UGF0aCk7XG4gICAgcmV0dXJuIHN0YXRzLmlzRmlsZSgpICYmIChzdGF0cy5tb2RlICYgMG8xMTEpOyAvLyBDaGVjayBpZiBleGVjdXRhYmxlIGJpdCBpcyBzZXRcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgbnBtIGluc3RhbGwgYXJndW1lbnRzIGJhc2VkIG9uIG9wdGlvbnMgYW5kIGRlcGVuZGVuY2llc1xuICogXG4gKiBAcGFyYW0ge3N0cmluZ3xzdHJpbmdbXX0gZGVwZW5kZW5jaWVzIC0gVGhlIG5wbSBkZXBlbmRlbmN5IG9yIGRlcGVuZGVuY2llcyB0byBpbnN0YWxsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9ucyBmb3IgdGhlIGluc3RhbGxhdGlvblxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZXY9ZmFsc2VdIC0gSWYgdHJ1ZSwgaW5zdGFsbCBhcyBhIGRldiBkZXBlbmRlbmN5XG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmV4YWN0PWZhbHNlXSAtIElmIHRydWUsIGluc3RhbGwgd2l0aCBleGFjdCB2ZXJzaW9uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmlzTWV0ZW9yQ29tbWFuZD1mYWxzZV0gLSBJZiB0cnVlLCBwcmVwZW5kcyAnbnBtJyB0byB0aGUgYXJncyBmb3IgbWV0ZW9yIGNvbW1hbmRcbiAqIEByZXR1cm5zIHtzdHJpbmdbXX0gQXJyYXkgb2YgYXJndW1lbnRzIGZvciB0aGUgbnBtIGluc3RhbGwgY29tbWFuZFxuICovXG5mdW5jdGlvbiBidWlsZE5wbUluc3RhbGxBcmdzKGRlcGVuZGVuY2llcywgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGFyZ3MgPSBvcHRpb25zLmlzTWV0ZW9yQ29tbWFuZCA/IFsnbnBtJywgJ2luc3RhbGwnXSA6IFsnaW5zdGFsbCddO1xuXG4gIC8vIEFkZCBmbGFncyBiYXNlZCBvbiBvcHRpb25zXG4gIGlmIChvcHRpb25zLmRldikge1xuICAgIGFyZ3MucHVzaCgnLS1zYXZlLWRldicpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZXhhY3QpIHtcbiAgICBhcmdzLnB1c2goJy0tc2F2ZS1leGFjdCcpO1xuICB9XG5cbiAgLy8gQWRkIGRlcGVuZGVuY2llcyB0byB0aGUgY29tbWFuZFxuICBpZiAoQXJyYXkuaXNBcnJheShkZXBlbmRlbmNpZXMpKSB7XG4gICAgYXJncy5wdXNoKC4uLmRlcGVuZGVuY2llcyk7XG4gIH0gZWxzZSB7XG4gICAgYXJncy5wdXNoKGRlcGVuZGVuY2llcyk7XG4gIH1cblxuICByZXR1cm4gYXJncztcbn1cblxuLyoqXG4gKiBCdWlsZHMgeWFybiBpbnN0YWxsIGFyZ3VtZW50cyBiYXNlZCBvbiBvcHRpb25zIGFuZCBkZXBlbmRlbmNpZXNcbiAqIFxuICogQHBhcmFtIHtzdHJpbmd8c3RyaW5nW119IGRlcGVuZGVuY2llcyAtIFRoZSBucG0gZGVwZW5kZW5jeSBvciBkZXBlbmRlbmNpZXMgdG8gaW5zdGFsbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHRoZSBpbnN0YWxsYXRpb25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGV2PWZhbHNlXSAtIElmIHRydWUsIGluc3RhbGwgYXMgYSBkZXYgZGVwZW5kZW5jeVxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5leGFjdD1mYWxzZV0gLSBJZiB0cnVlLCBpbnN0YWxsIHdpdGggZXhhY3QgdmVyc2lvblxuICogQHJldHVybnMge3N0cmluZ1tdfSBBcnJheSBvZiBhcmd1bWVudHMgZm9yIHRoZSB5YXJuIGFkZCBjb21tYW5kXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkWWFybkluc3RhbGxBcmdzKGRlcGVuZGVuY2llcywgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2FkZCddO1xuXG4gIC8vIEFkZCBmbGFncyBiYXNlZCBvbiBvcHRpb25zXG4gIGlmIChvcHRpb25zLmRldikge1xuICAgIGFyZ3MucHVzaCgnLS1kZXYnKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmV4YWN0KSB7XG4gICAgYXJncy5wdXNoKCctLWV4YWN0Jyk7XG4gIH1cblxuICAvLyBBZGQgZGVwZW5kZW5jaWVzIHRvIHRoZSBjb21tYW5kXG4gIGlmIChBcnJheS5pc0FycmF5KGRlcGVuZGVuY2llcykpIHtcbiAgICBhcmdzLnB1c2goLi4uZGVwZW5kZW5jaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnB1c2goZGVwZW5kZW5jaWVzKTtcbiAgfVxuXG4gIHJldHVybiBhcmdzO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY29tbWFuZCBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0cnVlIGlmIHN1Y2Nlc3NmdWxcbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1hbmQgLSBUaGUgY29tbWFuZCB0byBleGVjdXRlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyBmb3IgdGhlIGNvbW1hbmRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIHNwYXduIHByb2Nlc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmN3ZCAtIEN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0cnVlIGlmIGNvbW1hbmQgc3VjY2VlZGVkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZUNvbW1hbmQoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzcGF3blByb2Nlc3MoY29tbWFuZCwgYXJncywge1xuICAgICAgY3dkOiBvcHRpb25zLmN3ZCxcbiAgICAgIG9uRXhpdDogKGNvZGUpID0+IHtcbiAgICAgICAgcmVzb2x2ZShjb2RlID09PSAwKTtcbiAgICAgIH0sXG4gICAgICBvbkVycm9yOiAoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBJbnN0YWxscyBhIG5wbSBkZXBlbmRlbmN5IHVzaW5nIGRpcmVjdCBucG0gYmluYXJ5IGlmIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGZhbGxzIGJhY2sgdG8gYG1ldGVvciBucG0gaW5zdGFsbGAuXG4gKiBJZiB5YXJuIG9wdGlvbiBpcyB0cnVlLCB1c2VzIHlhcm4gaW5zdGVhZC5cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd8c3RyaW5nW119IGRlcGVuZGVuY2llcyAtIFRoZSBucG0gZGVwZW5kZW5jeSBvciBkZXBlbmRlbmNpZXMgdG8gaW5zdGFsbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHRoZSBpbnN0YWxsYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jd2RdIC0gQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSlcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGV2PWZhbHNlXSAtIElmIHRydWUsIGluc3RhbGwgYXMgYSBkZXYgZGVwZW5kZW5jeVxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5leGFjdD1mYWxzZV0gLSBJZiB0cnVlLCBpbnN0YWxsIHdpdGggZXhhY3QgdmVyc2lvblxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy55YXJuPWZhbHNlXSAtIElmIHRydWUsIHVzZSB5YXJuIGluc3RlYWQgb2YgbnBtXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdHJ1ZSBpZiBpbnN0YWxsYXRpb24gc3VjY2VlZGVkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxOcG1EZXBlbmRlbmN5KGRlcGVuZGVuY2llcywgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgLy8gSWYgeWFybiBvcHRpb24gaXMgdHJ1ZSwgdXNlIHlhcm5cbiAgaWYgKG9wdGlvbnMueWFybikge1xuICAgIGNvbnN0IHsgY29tbWFuZCwgYXJnczogYmFzZUFyZ3MgfSA9IGdldFlhcm5Db21tYW5kKFtdKTtcbiAgICBjb25zdCBhcmdzID0gYnVpbGRZYXJuSW5zdGFsbEFyZ3MoZGVwZW5kZW5jaWVzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gZXhlY3V0ZUNvbW1hbmQoY29tbWFuZCwgWy4uLmJhc2VBcmdzLCAuLi5hcmdzXSwgeyBjd2QgfSk7XG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IHRoZSBucG0gYmluYXJ5IHBhdGhcbiAgY29uc3QgbnBtQmluYXJ5UGF0aCA9IGdldE5vZGVCaW5hcnlQYXRoKCducG0nKTtcblxuICAvLyBJZiB3ZSBoYXZlIGEgZGlyZWN0IHBhdGggdG8gbnBtLCB1c2UgaXRcbiAgaWYgKG5wbUJpbmFyeVBhdGggJiYgZnMuZXhpc3RzU3luYyhucG1CaW5hcnlQYXRoKSkge1xuICAgIGNvbnN0IGFyZ3MgPSBidWlsZE5wbUluc3RhbGxBcmdzKGRlcGVuZGVuY2llcywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGV4ZWN1dGVDb21tYW5kKG5wbUJpbmFyeVBhdGgsIGFyZ3MsIHsgY3dkIH0pO1xuICB9XG5cbiAgLy8gRmFsbCBiYWNrIHRvIHRoZSBjdXJyZW50IG1ldGhvZCB1c2luZyAnbWV0ZW9yIG5wbSBpbnN0YWxsJ1xuICBjb25zdCBhcmdzID0gYnVpbGROcG1JbnN0YWxsQXJncyhkZXBlbmRlbmNpZXMsIHsgLi4ub3B0aW9ucywgaXNNZXRlb3JDb21tYW5kOiB0cnVlIH0pO1xuICByZXR1cm4gZXhlY3V0ZUNvbW1hbmQoJ21ldGVvcicsIGFyZ3MsIHsgY3dkIH0pO1xufVxuXG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgc3BlY2lmaWMgbnBtIGRlcGVuZGVuY3kgdmVyc2lvbiBtZWV0cyBhIHNlbXZlciBjb25kaXRpb24uXG4gKiBGaXJzdCBjaGVja3MgaW4gbm9kZV9tb2R1bGVzIGlmIGNoZWNrTm9kZU1vZHVsZXMgaXMgdHJ1ZSwgdGhlbiBjaGVja3MgcHJvamVjdCdzIHBhY2thZ2UuanNvbi5cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGRlcGVuZGVuY3kgLSBUaGUgbnBtIGRlcGVuZGVuY3kgbmFtZSB0byBjaGVja1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHRoZSBjaGVja1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN3ZF0gLSBDdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IChkZWZhdWx0cyB0byBwcm9jZXNzLmN3ZCgpKVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnZlcnNpb25SZXF1aXJlbWVudF0gLSBUaGUgdmVyc2lvbiByZXF1aXJlbWVudCB0byBjaGVjayBhZ2FpbnN0IChlLmcuLCAnNi4wLjAnKVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNlbXZlckNvbmRpdGlvbj0nZ3RlJ10gLSBUaGUgc2VtdmVyIGNvbmRpdGlvbiB0byB1c2UgKGUuZy4sICdndGUnLCAnbHQnLCAnZXEnKVxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGVja05vZGVNb2R1bGVzXSAtIFdoZXRoZXIgdG8gY2hlY2sgaW4gbm9kZV9tb2R1bGVzIGZpcnN0IChkZWZhdWx0cyB0byBmYWxzZSlcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZXhpc3RlbmNlT25seV0gLSBJZiB0cnVlLCBvbmx5IGNoZWNrcyBpZiB0aGUgZGVwZW5kZW5jeSBleGlzdHMgd2l0aG91dCB2ZXJzaW9uIHZhbGlkYXRpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBkZXBlbmRlbmN5IHZlcnNpb24gbWVldHMgdGhlIGNvbmRpdGlvbiAob3IgZXhpc3RzIGlmIGV4aXN0ZW5jZU9ubHkgaXMgdHJ1ZSksIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOcG1EZXBlbmRlbmN5VmVyc2lvbihkZXBlbmRlbmN5LCBvcHRpb25zID0ge30pIHtcbiAgY29uc3Qgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IHZlcnNpb25SZXF1aXJlbWVudCA9IG9wdGlvbnMudmVyc2lvblJlcXVpcmVtZW50O1xuICBjb25zdCBzZW12ZXJDb25kaXRpb24gPSBvcHRpb25zLnNlbXZlckNvbmRpdGlvbiB8fCAnZ3RlJztcblxuICBpZiAoIWRlcGVuZGVuY3kpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RlcGVuZGVuY3kgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICB9XG5cbiAgLy8gSWYgZXhpc3RlbmNlT25seSBpcyB0cnVlLCBkZWxlZ2F0ZSB0byBjaGVja05wbURlcGVuZGVuY3lFeGlzdHNcbiAgaWYgKG9wdGlvbnMuZXhpc3RlbmNlT25seSkge1xuICAgIHJldHVybiBjaGVja05wbURlcGVuZGVuY3lFeGlzdHMoZGVwZW5kZW5jeSwge1xuICAgICAgY3dkLFxuICAgICAgY2hlY2tOb2RlTW9kdWxlczogb3B0aW9ucy5jaGVja05vZGVNb2R1bGVzXG4gICAgfSk7XG4gIH1cblxuICBpZiAoIXZlcnNpb25SZXF1aXJlbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVmVyc2lvbiByZXF1aXJlbWVudCBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICB9XG5cbiAgaWYgKCFzZW12ZXJbc2VtdmVyQ29uZGl0aW9uXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzZW12ZXIgY29uZGl0aW9uOiAke3NlbXZlckNvbmRpdGlvbn1gKTtcbiAgfVxuXG4gIC8vIEZpcnN0LCBjaGVjayBpbiBub2RlX21vZHVsZXMgaWYgdGhlIG9wdGlvbiBpcyBlbmFibGVkXG4gIGlmIChvcHRpb25zLmNoZWNrTm9kZU1vZHVsZXMpIHtcbiAgICBjb25zdCBub2RlTW9kdWxlc1BhdGggPSBwYXRoLmpvaW4oY3dkLCAnbm9kZV9tb2R1bGVzJywgZGVwZW5kZW5jeSwgJ3BhY2thZ2UuanNvbicpO1xuICAgIHRyeSB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhub2RlTW9kdWxlc1BhdGgpKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMobm9kZU1vZHVsZXNQYXRoLCAndXRmOCcpKTtcbiAgICAgICAgaWYgKHBhY2thZ2VKc29uLnZlcnNpb24pIHtcbiAgICAgICAgICByZXR1cm4gc2VtdmVyW3NlbXZlckNvbmRpdGlvbl0ocGFja2FnZUpzb24udmVyc2lvbiwgdmVyc2lvblJlcXVpcmVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBJZiB0aGVyZSdzIGFuIGVycm9yIHJlYWRpbmcgdGhlIHBhY2thZ2UuanNvbiwgY29udGludWUgdG8gdGhlIGZhbGxiYWNrIG1ldGhvZFxuICAgIH1cbiAgfVxuXG4gIC8vIEZhbGxiYWNrOiBDaGVjayBwcm9qZWN0J3MgcGFja2FnZS5qc29uIGRpcmVjdGx5XG4gIHRyeSB7XG4gICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5qb2luKGN3ZCwgJ3BhY2thZ2UuanNvbicpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGFja2FnZUpzb25QYXRoLCAndXRmOCcpKTtcblxuICAgICAgLy8gQ2hlY2sgYWxsIGRlcGVuZGVuY3kgc2VjdGlvbnMgZm9yIHRoZSBwYWNrYWdlIGFuZCBpdHMgdmVyc2lvblxuICAgICAgY29uc3Qgc2VjdGlvbnMgPSBbJ2RlcGVuZGVuY2llcycsICdkZXZEZXBlbmRlbmNpZXMnLCAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnLCAncGVlckRlcGVuZGVuY2llcyddO1xuXG4gICAgICBmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMpIHtcbiAgICAgICAgaWYgKHBhY2thZ2VKc29uW3NlY3Rpb25dICYmIHBhY2thZ2VKc29uW3NlY3Rpb25dW2RlcGVuZGVuY3ldKSB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvblN0cmluZyA9IHBhY2thZ2VKc29uW3NlY3Rpb25dW2RlcGVuZGVuY3ldO1xuICAgICAgICAgIC8vIEV4dHJhY3QgdGhlIHZlcnNpb24gbnVtYmVyIGZyb20gdGhlIHZlcnNpb24gc3RyaW5nIChyZW1vdmluZyBeIG9yIH4gaWYgcHJlc2VudClcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gdmVyc2lvblN0cmluZy5yZXBsYWNlKC9eW1xcXn5dLywgJycpO1xuICAgICAgICAgIHJldHVybiBzZW12ZXJbc2VtdmVyQ29uZGl0aW9uXSh2ZXJzaW9uLCB2ZXJzaW9uUmVxdWlyZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIHRoZXJlJ3MgYW4gZXJyb3IgcmVhZGluZyBvciBwYXJzaW5nIHBhY2thZ2UuanNvbiwgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgd2UndmUgcmVhY2hlZCB0aGlzIHBvaW50LCB0aGUgZGVwZW5kZW5jeSB2ZXJzaW9uIGNvdWxkbid0IGJlIGRldGVybWluZWRcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG5wbSBjb21tYW5kIGFuZCBhcmd1bWVudHNcbiAqIEBwYXJhbSB7c3RyaW5nW119IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gbnBtXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3Qgd2l0aCBjb21tYW5kLCBhcmdzLCBhbmQgYmFzZSBwcm9wZXJ0aWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROcG1Db21tYW5kKGFyZ3MpIHtcbiAgLy8gVHJ5IHRvIGdldCB0aGUgbnBtIGJpbmFyeSBwYXRoXG4gIGNvbnN0IG5wbUJpbmFyeVBhdGggPSBnZXROb2RlQmluYXJ5UGF0aCgnbnBtJyk7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGRpcmVjdCBwYXRoIHRvIG5wbSwgdXNlIGl0XG4gIGlmIChucG1CaW5hcnlQYXRoICYmIGZzLmV4aXN0c1N5bmMobnBtQmluYXJ5UGF0aCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZDogbnBtQmluYXJ5UGF0aCxcbiAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICBwcmVmaXg6IGAke25wbUJpbmFyeVBhdGh9YCxcbiAgICB9O1xuICB9XG5cbiAgLy8gRmFsbCBiYWNrIHRvIHRoZSBjdXJyZW50IG1ldGhvZCB1c2luZyAnbWV0ZW9yIG5wbSdcbiAgcmV0dXJuIHtcbiAgICBjb21tYW5kOiAnbWV0ZW9yJyxcbiAgICBhcmdzOiBbJ25wbScsIC4uLmFyZ3NdLFxuICAgIHByZWZpeDogYG1ldGVvciBucG1gLFxuICB9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG5weCBjb21tYW5kIGFuZCBhcmd1bWVudHNcbiAqIEBwYXJhbSB7c3RyaW5nW119IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gbnB4XG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3Qgd2l0aCBjb21tYW5kLCBhcmdzLCBhbmQgYmFzZSBwcm9wZXJ0aWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROcHhDb21tYW5kKGFyZ3MpIHtcbiAgLy8gVHJ5IHRvIGdldCB0aGUgbnB4IGJpbmFyeSBwYXRoXG4gIGNvbnN0IG5weEJpbmFyeVBhdGggPSBnZXROb2RlQmluYXJ5UGF0aCgnbnB4Jyk7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGRpcmVjdCBwYXRoIHRvIG5weCwgdXNlIGl0XG4gIGlmIChucHhCaW5hcnlQYXRoICYmIGZzLmV4aXN0c1N5bmMobnB4QmluYXJ5UGF0aCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZDogbnB4QmluYXJ5UGF0aCxcbiAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICBwcmVmaXg6IGAke25weEJpbmFyeVBhdGh9YCxcbiAgICB9O1xuICB9XG5cbiAgLy8gRmFsbCBiYWNrIHRvIHRoZSBjdXJyZW50IG1ldGhvZCB1c2luZyAnbWV0ZW9yIG5weCdcbiAgcmV0dXJuIHtcbiAgICBjb21tYW5kOiAnbWV0ZW9yJyxcbiAgICBhcmdzOiBbJ25weCcsIC4uLmFyZ3NdLFxuICAgIHByZWZpeDogYG1ldGVvciBucHhgLFxuICB9O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBwcm9qZWN0IGlzIGEgWWFybiBwcm9qZWN0LlxuICogTG9va3MgZm9yIHlhcm4ubG9jayBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGFuZCBjaGVja3MgcGFja2FnZU1hbmFnZXIgaW4gcGFja2FnZS5qc29uLlxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9ucyBmb3IgdGhlIGNoZWNrXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3dkXSAtIEN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgKGRlZmF1bHRzIHRvIHByb2Nlc3MuY3dkKCkpXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBpdCdzIGEgWWFybiBwcm9qZWN0LCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzWWFyblByb2plY3Qob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgLy8gQ2hlY2sgaWYgeWFybi5sb2NrIGV4aXN0c1xuICBjb25zdCB5YXJuTG9ja1BhdGggPSBwYXRoLmpvaW4oY3dkLCAneWFybi5sb2NrJyk7XG4gIGlmIChmcy5leGlzdHNTeW5jKHlhcm5Mb2NrUGF0aCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIENoZWNrIHBhY2thZ2VNYW5hZ2VyIGZpZWxkIGluIHBhY2thZ2UuanNvblxuICB0cnkge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbihjd2QsICdwYWNrYWdlLmpzb24nKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYWNrYWdlSnNvblBhdGgpKSB7XG4gICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhY2thZ2VKc29uUGF0aCwgJ3V0ZjgnKSk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHBhY2thZ2VNYW5hZ2VyIGNvbnRhaW5zIFwieWFyblwiXG4gICAgICBpZiAocGFja2FnZUpzb24ucGFja2FnZU1hbmFnZXIgJiYgcGFja2FnZUpzb24ucGFja2FnZU1hbmFnZXIuaW5jbHVkZXMoJ3lhcm4nKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgdGhlcmUncyBhbiBlcnJvciByZWFkaW5nIG9yIHBhcnNpbmcgcGFja2FnZS5qc29uLCBjb250aW51ZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHlhcm4gY29tbWFuZCBhbmQgYXJndW1lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHlhcm5cbiAqIEByZXR1cm5zIHtPYmplY3R9IEFuIG9iamVjdCB3aXRoIGNvbW1hbmQsIGFyZ3MsIGFuZCBiYXNlIHByb3BlcnRpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFlhcm5Db21tYW5kKGFyZ3MpIHtcbiAgLy8gVHJ5IHRvIGdldCB0aGUgeWFybiBiaW5hcnkgcGF0aFxuICBjb25zdCB5YXJuQmluYXJ5UGF0aCA9IGdldE5vZGVCaW5hcnlQYXRoKCd5YXJuJyk7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGRpcmVjdCBwYXRoIHRvIHlhcm4sIHVzZSBpdFxuICBpZiAoeWFybkJpbmFyeVBhdGggJiYgZnMuZXhpc3RzU3luYyh5YXJuQmluYXJ5UGF0aCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZDogeWFybkJpbmFyeVBhdGgsXG4gICAgICBhcmdzLFxuICAgICAgcHJlZml4OiBgJHt5YXJuQmluYXJ5UGF0aH1gLFxuICAgIH07XG4gIH1cblxuICAvLyBGYWxsIGJhY2sgdG8gdXNpbmcgJ3lhcm4nIGRpcmVjdGx5XG4gIHJldHVybiB7XG4gICAgY29tbWFuZDogJ3lhcm4nLFxuICAgIGFyZ3MsXG4gICAgcHJlZml4OiBgeWFybmAsXG4gIH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCB0byB0aGUgbW9ub3JlcG8gcm9vdCBieSBjaGVja2luZyBmb3IgY29tbW9uIG1vbm9yZXBvIGluZGljYXRvcnMuXG4gKiBUcmF2ZXJzZXMgdXAgdGhlIGRpcmVjdG9yeSB0cmVlIHVudGlsIGl0IGZpbmRzIGEgbW9ub3JlcG8gaW5kaWNhdG9yIG9yIHJlYWNoZXMgdGhlIHJvb3QuXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBPcHRpb25zIGZvciB0aGUgZGV0ZWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3dkXSAtIEN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgKGRlZmF1bHRzIHRvIHByb2Nlc3MuY3dkKCkpXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFBhdGggdG8gdGhlIG1vbm9yZXBvIHJvb3QgaWYgZm91bmQsIG51bGwgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb25vcmVwb1BhdGgob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGN3ZCA9IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCk7XG4gIGxldCBjdXJyZW50RGlyID0gY3dkO1xuXG4gIC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGRpcmVjdG9yeSBoYXMgbW9ub3JlcG8gaW5kaWNhdG9yc1xuICBjb25zdCBoYXNNb25vcmVwb0luZGljYXRvcnMgPSAoZGlyKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIENoZWNrIGZvciBucG0veWFybiB3b3Jrc3BhY2VzIGluIHBhY2thZ2UuanNvblxuICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5qb2luKGRpciwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xuICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhY2thZ2VKc29uUGF0aCwgJ3V0ZjgnKSk7XG4gICAgICAgIGlmIChwYWNrYWdlSnNvbi53b3Jrc3BhY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgZm9yIExlcm5hXG4gICAgICBjb25zdCBsZXJuYUpzb25QYXRoID0gcGF0aC5qb2luKGRpciwgJ2xlcm5hLmpzb24nKTtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGxlcm5hSnNvblBhdGgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBmb3IgcG5wbSB3b3Jrc3BhY2VzXG4gICAgICBjb25zdCBwbnBtV29ya3NwYWNlUGF0aCA9IHBhdGguam9pbihkaXIsICdwbnBtLXdvcmtzcGFjZS55YW1sJyk7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwbnBtV29ya3NwYWNlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvLyBUcmF2ZXJzZSB1cCB0aGUgZGlyZWN0b3J5IHRyZWVcbiAgd2hpbGUgKGN1cnJlbnREaXIgIT09IHBhdGguZGlybmFtZShjdXJyZW50RGlyKSkgeyAvLyBTdG9wIHdoZW4gd2UgcmVhY2ggdGhlIHJvb3QgZGlyZWN0b3J5XG4gICAgaWYgKGhhc01vbm9yZXBvSW5kaWNhdG9ycyhjdXJyZW50RGlyKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnREaXI7XG4gICAgfVxuICAgIGN1cnJlbnREaXIgPSBwYXRoLmRpcm5hbWUoY3VycmVudERpcik7XG4gIH1cblxuICAvLyBDaGVjayB0aGUgcm9vdCBkaXJlY3RvcnkgYXMgd2VsbFxuICByZXR1cm4gaGFzTW9ub3JlcG9JbmRpY2F0b3JzKGN1cnJlbnREaXIpID8gY3VycmVudERpciA6IG51bGw7XG59XG5cbi8qKlxuICogRGV0ZWN0cyBpZiBhIGRpcmVjdG9yeSBpcyB3aXRoaW4gYSBtb25vcmVwbyBieSBjaGVja2luZyBmb3IgY29tbW9uIG1vbm9yZXBvIGluZGljYXRvcnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHRoZSBkZXRlY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jd2RdIC0gQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSlcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBkaXJlY3RvcnkgaXMgd2l0aGluIGEgbW9ub3JlcG8sIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNb25vcmVwbyhvcHRpb25zID0ge30pIHtcbiAgcmV0dXJuIGdldE1vbm9yZXBvUGF0aChvcHRpb25zKSAhPT0gbnVsbDtcbn1cbiIsImNvbnN0IHsgc3Bhd24gfSA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xuY29uc3QgeyBsb2dFcnJvciB9ID0gcmVxdWlyZSgnLi9sb2cnKTtcblxuLyoqXG4gKiBTcGF3bnMgYSBuZXcgT1MgcHJvY2VzcyB3aXRoIHRoZSBnaXZlbiBjb21tYW5kIGFuZCBhcmd1bWVudHMuXG4gKiBTdHJlYW1zIG91dHB1dCB3aXRoIG9yaWdpbmFsIHN0eWxpbmcgYW5kIGhhbmRsZXMgZXJyb3JzIGFuZCBleGl0IGV2ZW50cy5cbiAqIEFsd2F5cyBwcmVzZXJ2ZXMgcmF3IG91dHB1dCBmb3JtYXR0aW5nIChjb2xvcnMsIHByb2dyZXNzIGJhcnMsIGV0Yy4pIGFuZFxuICogcHJvdmlkZXMgZGVjb2RlZCBzdHJpbmcgZGF0YSB0byBjYWxsYmFja3MgZm9yIGxvZ2ljL2NoZWNraW5nL2xvZ2dpbmcuXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIC0gVGhlIGNvbW1hbmQgdG8gcnVuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhcmdzIC0gQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGNvbW1hbmRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIHNwYXduZWQgcHJvY2Vzc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmVudl0gLSBFbnZpcm9ubWVudCB2YXJpYWJsZXMgdG8gbWVyZ2Ugd2l0aCBwcm9jZXNzLmVudlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN3ZF0gLSBDdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRldGFjaGVkXSAtIFdoZXRoZXIgdG8gcnVuIHRoZSBwcm9jZXNzIGRldGFjaGVkIGZyb20gdGhlIHBhcmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub25TdGRvdXRdIC0gQ2FsbGJhY2sgZm9yIHN0ZG91dCBkYXRhIChyZWNlaXZlcyBkZWNvZGVkIHN0cmluZylcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9uU3RkZXJyXSAtIENhbGxiYWNrIGZvciBzdGRlcnIgZGF0YSAocmVjZWl2ZXMgZGVjb2RlZCBzdHJpbmcpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5vbkV4aXRdIC0gQ2FsbGJhY2sgd2hlbiBwcm9jZXNzIGV4aXRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5vbkVycm9yXSAtIENhbGxiYWNrIHdoZW4gcHJvY2VzcyBlbmNvdW50ZXJzIGFuIGVycm9yXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc3Bhd25lZCBwcm9jZXNzIHdpdGggYWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduUHJvY2Vzcyhjb21tYW5kLCBhcmdzLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3QgcHJvYyA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHtcbiAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIC4uLihvcHRpb25zLmVudiB8fCB7fSksIEZPUkNFX0NPTE9SOiAnMScsIFRFUk06ICd4dGVybS0yNTZjb2xvcicgfSxcbiAgICBjd2Q6IG9wdGlvbnMuY3dkIHx8IHByb2Nlc3MuY3dkKCksXG4gICAgc3RkaW86IFsncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICBkZXRhY2hlZDogb3B0aW9ucy5kZXRhY2hlZCB8fCBmYWxzZSxcbiAgICAuLi4ocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiB7IHNoZWxsOiB0cnVlIH0pLFxuICB9KTtcblxuICAvLyBBZGQgYSByZWZlcmVuY2UgdG8gdHJhY2sgaWYgdGhlIHByb2Nlc3MgaXMgcnVubmluZ1xuICBwcm9jLmlzUnVubmluZyA9IHRydWU7XG5cbiAgLy8gSGFuZGxlIHN0ZG91dFxuICBwcm9jLnN0ZG91dC5vbignZGF0YScsIChidWYpID0+IHtcbiAgICBpZiAob3B0aW9ucy5vblN0ZG91dCkge1xuICAgICAgb3B0aW9ucy5vblN0ZG91dChidWYudG9TdHJpbmcoKSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBIYW5kbGUgc3RkZXJyXG4gIHByb2Muc3RkZXJyLm9uKCdkYXRhJywgKGJ1ZikgPT4ge1xuICAgIGlmIChvcHRpb25zLm9uU3RkZXJyKSB7XG4gICAgICBvcHRpb25zLm9uU3RkZXJyKGJ1Zi50b1N0cmluZygpKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEhhbmRsZSBwcm9jZXNzIGV4aXRcbiAgcHJvYy5vbignY2xvc2UnLCAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgcHJvYy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy5vbkV4aXQpIG9wdGlvbnMub25FeGl0KGNvZGUsIHNpZ25hbCk7XG4gIH0pO1xuXG4gIC8vIEhhbmRsZSBwcm9jZXNzIGVycm9yc1xuICBwcm9jLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICBwcm9jLmlzUnVubmluZyA9IGZhbHNlO1xuICAgIGlmIChvcHRpb25zLm9uRXJyb3IpIG9wdGlvbnMub25FcnJvcihlcnIpO1xuICAgIGVsc2UgbG9nRXJyb3IoYD0+IFByb2Nlc3MgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gIH0pO1xuXG4gIC8vIFRoaXMgaGFwcGVucyBzb21ldGltZXMgd2hlbiB3ZSB3cml0ZSB0byBzdGRpbiBhZnRlciB0aGUgYXBwXG4gIC8vIGlzIGRlYWQuIElmIHdlIGRvbid0IHJlZ2lzdGVyIGEgaGFuZGxlciwgd2UgZ2V0IGEgdG9wIGxldmVsXG4gIC8vIGV4Y2VwdGlvbiBhbmQgdGhlIHdob2xlIGFwcCBkaWVzLlxuICBwcm9jLnN0ZGluLm9uKCdlcnJvcicsICgpID0+IHt9KTtcblxuICBpZiAob3B0aW9ucy5kZXRhY2hlZCkgcHJvYy51bnJlZigpO1xuICByZXR1cm4gcHJvYztcbn1cblxuLyoqXG4gKiBTdG9wcyBhIHJ1bm5pbmcgcHJvY2Vzcy5cbiAqIFxuICogQHBhcmFtIHtPYmplY3R9IHByb2MgLSBUaGUgcHJvY2VzcyB0byBzdG9wXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9ucyBmb3Igc3RvcHBpbmcgdGhlIHByb2Nlc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWduYWw9J1NJR1RFUk0nXSAtIFRoZSBzaWduYWwgdG8gc2VuZCB0byB0aGUgcHJvY2Vzc1xuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWVvdXQ9NTAwMF0gLSBUaW1lb3V0IGluIG1zIGJlZm9yZSBmb3JjaW5nIGtpbGwgd2l0aCBTSUdLSUxMXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgcHJvY2VzcyBpcyBzdG9wcGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wUHJvY2Vzcyhwcm9jLCBvcHRpb25zID0ge30pIHtcbiAgaWYgKCFwcm9jIHx8ICFwcm9jLnBpZCB8fCAhaXNQcm9jZXNzUnVubmluZyhwcm9jKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIGNvbnN0IHNpZ25hbCA9IG9wdGlvbnMuc2lnbmFsIHx8ICdTSUdURVJNJztcbiAgY29uc3QgdGltZW91dCA9IG9wdGlvbnMudGltZW91dCB8fCA1MDAwO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIC8vIFNldCBhIHRpbWVvdXQgdG8gZm9yY2Uga2lsbCBpZiB0aGUgcHJvY2VzcyBkb2Vzbid0IGV4aXQgZ3JhY2VmdWxseVxuICAgIGNvbnN0IGZvcmNlS2lsbFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChpc1Byb2Nlc3NSdW5uaW5nKHByb2MpKSB7XG4gICAgICAgIHByb2Mua2lsbCgnU0lHS0lMTCcpO1xuICAgICAgfVxuICAgIH0sIHRpbWVvdXQpO1xuXG4gICAgLy8gTGlzdGVuIGZvciB0aGUgcHJvY2VzcyB0byBleGl0XG4gICAgcHJvYy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoZm9yY2VLaWxsVGltZW91dCk7XG4gICAgICBwcm9jLmlzUnVubmluZyA9IGZhbHNlO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gU2VuZCB0aGUgc2lnbmFsIHRvIHRlcm1pbmF0ZSB0aGUgcHJvY2Vzc1xuICAgIHByb2Mua2lsbChzaWduYWwpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBwcm9jZXNzIGlzIHJ1bm5pbmcuXG4gKiBcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9jIC0gVGhlIHByb2Nlc3MgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwcm9jZXNzIGlzIHJ1bm5pbmcsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9jZXNzUnVubmluZyhwcm9jKSB7XG4gIGlmICghcHJvYyB8fCAhcHJvYy5waWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB3ZSd2ZSBiZWVuIHRyYWNraW5nIHRoZSBwcm9jZXNzIHN0YXRlIHdpdGggb3VyIGlzUnVubmluZyBwcm9wZXJ0eVxuICBpZiAocHJvYy5pc1J1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVHJ5IHRvIHNlbmQgc2lnbmFsIDAgdG8gdGhlIHByb2Nlc3MsIHdoaWNoIGRvZXNuJ3QgYWN0dWFsbHkgc2VuZCBhIHNpZ25hbFxuICAvLyBidXQgY2hlY2tzIGlmIHRoZSBwcm9jZXNzIGV4aXN0c1xuICB0cnkge1xuICAgIHByb2Nlc3Mua2lsbChwcm9jLnBpZCwgMCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBwb3J0IGlzIGF2YWlsYWJsZS5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJ9IHBvcnQgLSBUaGUgcG9ydCB0byBjaGVja1xuICogQHBhcmFtIHtzdHJpbmd9IFtob3N0PScxMjcuMC4wLjEnXSAtIFRoZSBob3N0IHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgcG9ydCBpcyBhdmFpbGFibGUsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQb3J0QXZhaWxhYmxlKHBvcnQsIGhvc3QgPSAnMTI3LjAuMC4xJykge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXQuY3JlYXRlU2VydmVyKCk7XG5cbiAgICBzZXJ2ZXIub25jZSgnZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyLmNvZGUgPT09ICdFQUREUklOVVNFJykge1xuICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvdGhlciBlcnJvcnMsIHdlJ2xsIGFzc3VtZSB0aGUgcG9ydCBpcyBub3QgYXZhaWxhYmxlXG4gICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgc2VydmVyLm9uY2UoJ2xpc3RlbmluZycsICgpID0+IHtcbiAgICAgIC8vIENsb3NlIHRoZSBzZXJ2ZXIgYW5kIHJlc29sdmUgd2l0aCB0cnVlIChwb3J0IGlzIGF2YWlsYWJsZSlcbiAgICAgIHNlcnZlci5jbG9zZSgoKSA9PiB7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgaG9zdCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdhaXRzIGZvciBhIHBvcnQgdG8gYmVjb21lIGF2YWlsYWJsZSBvciB1bmF2YWlsYWJsZS5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJ9IHBvcnQgLSBUaGUgcG9ydCB0byBjaGVja1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHdhaXRpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5ob3N0PScxMjcuMC4wLjEnXSAtIFRoZSBob3N0IHRvIGNoZWNrXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndhaXRVbnRpbEF2YWlsYWJsZT1mYWxzZV0gLSBJZiB0cnVlLCB3YWl0IHVudGlsIHBvcnQgaXMgYXZhaWxhYmxlOyBpZiBmYWxzZSwgd2FpdCB1bnRpbCBwb3J0IGlzIGluIHVzZVxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWVvdXQ9MzAwMDBdIC0gVGltZW91dCBpbiBtc1xuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmludGVydmFsPTUwMF0gLSBJbnRlcnZhbCBiZXR3ZWVuIGNoZWNrcyBpbiBtc1xuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGNvbmRpdGlvbiBpcyBtZXQsIGZhbHNlIGlmIHRpbWVkIG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvclBvcnQocG9ydCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGhvc3QgPSBvcHRpb25zLmhvc3QgfHwgJzEyNy4wLjAuMSc7XG4gIGNvbnN0IHdhaXRVbnRpbEF2YWlsYWJsZSA9IG9wdGlvbnMud2FpdFVudGlsQXZhaWxhYmxlIHx8IGZhbHNlO1xuICBjb25zdCB0aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0IHx8IDMwMDAwO1xuICBjb25zdCBpbnRlcnZhbCA9IG9wdGlvbnMuaW50ZXJ2YWwgfHwgNTAwO1xuXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRJZCA9IG51bGw7XG5cbiAgICBjb25zdCBjaGVjayA9IGFzeW5jICgpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIHdlJ3ZlIGV4Y2VlZGVkIHRoZSB0aW1lb3V0XG4gICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSA+IHRpbWVvdXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNBdmFpbGFibGUgPSBhd2FpdCBpc1BvcnRBdmFpbGFibGUocG9ydCwgaG9zdCk7XG5cbiAgICAgIC8vIElmIHdlJ3JlIHdhaXRpbmcgZm9yIHRoZSBwb3J0IHRvIGJlIGF2YWlsYWJsZSBhbmQgaXQgaXMsIG9yXG4gICAgICAvLyBpZiB3ZSdyZSB3YWl0aW5nIGZvciB0aGUgcG9ydCB0byBiZSBpbiB1c2UgYW5kIGl0J3Mgbm90IGF2YWlsYWJsZVxuICAgICAgaWYgKCh3YWl0VW50aWxBdmFpbGFibGUgJiYgaXNBdmFpbGFibGUpIHx8ICghd2FpdFVudGlsQXZhaWxhYmxlICYmICFpc0F2YWlsYWJsZSkpIHtcbiAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgIHRpbWVvdXRJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBTY2hlZHVsZSB0aGUgbmV4dCBjaGVja1xuICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChjaGVjaywgaW50ZXJ2YWwpO1xuICAgIH07XG5cbiAgICAvLyBTdGFydCBjaGVja2luZ1xuICAgIGNoZWNrKCk7XG4gIH0pO1xufVxuIiwiLyoqXG4gKiBDYXBpdGFsaXplcyB0aGUgZmlyc3QgbGV0dGVyIG9mIHRoZSBnaXZlbiBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciDigJMgVGhlIGlucHV0IHN0cmluZy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IOKAkyBUaGUgc3RyaW5nIHdpdGggaXRzIGZpcnN0IGNoYXJhY3RlciB1cHBlcmNhc2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cikge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycgfHwgc3RyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xufVxuXG4vKipcbiAqIFNodWZmbGVzIHRoZSBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYXJyYXkuXG4gKiBAcGFyYW0gYXJyXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycikge1xuICBmb3IgKGxldCBpID0gYXJyLmxlbmd0aCAtIDE7IGkgPiAwOyAtLWkpIHtcbiAgICBjb25zdCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgW2FycltpXSwgYXJyW2pdXSA9IFthcnJbal0sIGFycltpXV07XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuLyoqXG4gKiBTaHVmZmxlcyB0aGUgY2hhcmFjdGVycyBvZiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICogQHBhcmFtIHN0clxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGVTdHJpbmcoc3RyKSB7XG4gIHJldHVybiBzaHVmZmxlQXJyYXkoc3RyLnNwbGl0KCcnKSkuam9pbignJyk7XG59XG5cbi8qKlxuICogSm9pbiBhbiBhcnJheSBvZiBzdHJpbmdzIGludG8gYSBodW1hbi1yZWFkYWJsZSBsaXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGl0ZW1zIC0gVGhlIGl0ZW1zIHRvIGpvaW4uXG4gKiBAcGFyYW0ge29iamVjdH0gICBbb3B0c11cbiAqIEBwYXJhbSB7c3RyaW5nfSAgIFtvcHRzLnNlcGFyYXRvcj0nLCAnXSAgICAgIC0gU2VwYXJhdG9yIGJldHdlZW4gaXRlbXMgKGV4Y2VwdCBsYXN0KS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgIFtvcHRzLmxhc3RTZXBhcmF0b3I9JyBhbmQgJ10gLSBUZXh0IHRvIGluc2VydCBiZWZvcmUgdGhlIGxhc3QgaXRlbS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luV2l0aEFuZChcbiAgaXRlbXMsXG4gIHsgc2VwYXJhdG9yID0gJywgJywgbGFzdFNlcGFyYXRvciA9ICcgYW5kICcgfSA9IHt9LFxuKSB7XG4gIGNvbnN0IGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuICcnO1xuICBpZiAobGVuID09PSAxKSByZXR1cm4gaXRlbXNbMF07XG4gIGlmIChsZW4gPT09IDIpIHJldHVybiBpdGVtc1swXSArIGxhc3RTZXBhcmF0b3IgKyBpdGVtc1sxXTtcbiAgcmV0dXJuIGl0ZW1zXG4gICAgLnNsaWNlKDAsIC0xKVxuICAgIC5yZWR1Y2UoKGFjYywgaXRlbSwgaWR4KSA9PiB7XG4gICAgICByZXR1cm4gYWNjICsgKGlkeCA9PT0gMCA/ICcnIDogc2VwYXJhdG9yKSArIGl0ZW07XG4gICAgfSwgJycpICsgbGFzdFNlcGFyYXRvciArIGl0ZW1zW2xlbiAtIDFdO1xufVxuIl19
