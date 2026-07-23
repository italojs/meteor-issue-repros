Package["core-runtime"].queue("rspack",function () {/* Imports */
var meteorInstall = Package.modules.meteorInstall;
var ECMAScript = Package.ecmascript.ECMAScript;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"rspack":{"lib":{"constants.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/lib/constants.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({DEFAULT_RSPACK_VERSION:()=>DEFAULT_RSPACK_VERSION,DEFAULT_METEOR_RSPACK_VERSION:()=>DEFAULT_METEOR_RSPACK_VERSION,DEFAULT_METEOR_RSPACK_REACT_HMR_VERSION:()=>DEFAULT_METEOR_RSPACK_REACT_HMR_VERSION,DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION:()=>DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION,DEFAULT_METEOR_RSPACK_SWC_LOADER_VERSION:()=>DEFAULT_METEOR_RSPACK_SWC_LOADER_VERSION,DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION:()=>DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION,DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION:()=>DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION,GLOBAL_STATE_KEYS:()=>GLOBAL_STATE_KEYS,RSPACK_BUILD_CONTEXT:()=>RSPACK_BUILD_CONTEXT,RSPACK_ASSETS_CONTEXT:()=>RSPACK_ASSETS_CONTEXT,RSPACK_CHUNKS_CONTEXT:()=>RSPACK_CHUNKS_CONTEXT,RSPACK_DOCTOR_CONTEXT:()=>RSPACK_DOCTOR_CONTEXT,RSPACK_HOT_UPDATE_REGEX:()=>RSPACK_HOT_UPDATE_REGEX,FILE_ROLE:()=>FILE_ROLE},true);let path;module.link('path',{default(v){path=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();var _Plugin;
/**
 * @module constants
 * @description Constants and global state keys for Rspack plugin
 */ 
const DEFAULT_RSPACK_VERSION = '1.7.1';
const DEFAULT_METEOR_RSPACK_VERSION = '2.0.1';
const DEFAULT_METEOR_RSPACK_REACT_HMR_VERSION = '1.4.3';
const DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION = '0.17.0';
const DEFAULT_METEOR_RSPACK_SWC_LOADER_VERSION = '0.2.6';
const DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION = '0.5.17';
const DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION = '1.5.7';
/**
 * Global state keys used for storing and retrieving state across the application
 * @constant {Object}
 * @property {string} CLIENT_PROCESS - Key for storing the client process
 * @property {string} SERVER_PROCESS - Key for storing the server process
 * @property {string} RSPACK_INSTALLATION_CHECKED - Key for tracking if Rspack installation was checked
 * @property {string} IS_REACT_ENABLED - Key for tracking if React is enabled
 * @property {string} INITIAL_ENTRYPONTS - Key for storing initial entrypoints
 * @property {string} CLIENT_FIRST_COMPILE - Key for tracking client first compilation state
 * @property {string} SERVER_FIRST_COMPILE - Key for tracking server first compilation state
 * @property {string} BUILD_CONTEXT_FILES_CLEANED - Key for tracking if build context files have been cleaned
 */ const GLOBAL_STATE_KEYS = {
    CLIENT_PROCESS: 'rspack.clientProcess',
    SERVER_PROCESS: 'rspack.serverProcess',
    RSPACK_INSTALLATION_CHECKED: 'rspack.rspackInstallationChecked',
    RSPACK_REACT_INSTALLATION_CHECKED: 'rspack.rspackReactInstallationChecked',
    RSPACK_DOCTOR_INSTALLATION_CHECKED: 'rspack.rspackDoctorInstallationChecked',
    REACT_CHECKED: 'rspack.reactChecked',
    TYPESCRIPT_CHECKED: 'rspack.typescriptChecked',
    ANGULAR_CHECKED: 'rspack.angularChecked',
    INITIAL_ENTRYPONTS: 'meteor.initialEntrypoints',
    CLIENT_FIRST_COMPILE: 'rspack.clientFirstCompile',
    SERVER_FIRST_COMPILE: 'rspack.serverFirstCompile',
    BUILD_CONTEXT_FILES_CLEANED: 'rspack.buildContextFilesCleaned'
};
const meteorConfig = typeof Plugin !== 'undefined' ? (_Plugin = Plugin) === null || _Plugin === void 0 ? void 0 : _Plugin.getMeteorConfig() : null;
const meteorLocalDirName = process.env.METEOR_LOCAL_DIR ? path.basename(process.env.METEOR_LOCAL_DIR.replace(/\\/g, '/')) : '';
/**
 * Directory name for Rspack build context
 * Can be overridden with RSPACK_BUILD_CONTEXT environment variable
 * @constant {string}
 */ const RSPACK_BUILD_CONTEXT = (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.buildContext) || process.env.RSPACK_BUILD_CONTEXT || `_build${meteorLocalDirName && `-${meteorLocalDirName}` || ''}`;
process.env.RSPACK_BUILD_CONTEXT = RSPACK_BUILD_CONTEXT;
/**
 * Directory name for Rspack assets context
 * Can be overridden with RSPACK_ASSETS_CONTEXT environment variable
 * @constant {string}
 */ const RSPACK_ASSETS_CONTEXT = (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.assetsContext) || process.env.RSPACK_ASSETS_CONTEXT || `build-assets${meteorLocalDirName && `-${meteorLocalDirName}` || ''}`;
process.env.RSPACK_ASSETS_CONTEXT = RSPACK_ASSETS_CONTEXT;
/**
 * Directory name for Rspack bundles context
 * Can be overridden with RSPACK_ASSETS_CONTEXT environment variable
 * @constant {string}
 */ const RSPACK_CHUNKS_CONTEXT = (meteorConfig === null || meteorConfig === void 0 ? void 0 : meteorConfig.chunksContext) || process.env.RSPACK_CHUNKS_CONTEXT || `build-chunks${meteorLocalDirName && `-${meteorLocalDirName}` || ''}`;
process.env.RSPACK_CHUNKS_CONTEXT = RSPACK_CHUNKS_CONTEXT;
/**
 * Directory name for Rspack doctor context
 * @type {string}
 */ const RSPACK_DOCTOR_CONTEXT = '.rsdoctor';
/**
 * Regex pattern for hot update files
 * @constant {RegExp}
 */ const RSPACK_HOT_UPDATE_REGEX = /^\/(.+\.hot-update\.(?:json|js))$/;
const FILE_ROLE = {
    build: 'build',
    entry: 'entry',
    run: 'run',
    output: 'output'
};
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dependencies.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/lib/dependencies.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({ensureRspackInstalled:()=>ensureRspackInstalled,checkReactInstalled:()=>checkReactInstalled,ensureRspackReactInstalled:()=>ensureRspackReactInstalled,ensureRspackDoctorInstalled:()=>ensureRspackDoctorInstalled,checkTypescriptInstalled:()=>checkTypescriptInstalled,checkAngularInstalled:()=>checkAngularInstalled});let DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION,DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION,DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION;module.link("./constants",{DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION(v){DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION=v},DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION(v){DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION=v},DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION(v){DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
/**
 * @module dependencies
 * @description Functions for managing dependencies for Rspack plugin
 */ 
const { getGlobalState, setGlobalState } = require('meteor/tools-core/lib/global-state');
const { logProgress, logSuccess, logInfo, logError } = require('meteor/tools-core/lib/log');
const { isMeteorAppUpdate, getMeteorAppDir } = require('meteor/tools-core/lib/meteor');
const { checkNpmDependencyExists, installNpmDependency, checkNpmDependencyVersion } = require('meteor/tools-core/lib/npm');
const { joinWithAnd } = require('meteor/tools-core/lib/string');
const { DEFAULT_RSPACK_VERSION, DEFAULT_METEOR_RSPACK_VERSION, DEFAULT_METEOR_RSPACK_REACT_HMR_VERSION, GLOBAL_STATE_KEYS } = require('./constants');
/**
 * Generic function to ensure dependencies are installed with correct versions
 * @param {Object[]} dependencies - Array of dependency objects with name, version, and semverCondition
 * @param {string} globalStateKey - Global state key to track if check has been done
 * @param {string} packageName - Name of the package for logging purposes
 * @returns {Promise<void>} A promise that resolves when the check/installation is complete
 * @throws {Error} If installation fails
 */ function ensureDependenciesInstalled(dependencies, globalStateKey, packageName) {
    return _async_to_generator(function*() {
        // Skip if already checked
        if (getGlobalState(globalStateKey, false)) {
            return;
        }
        const appDir = getMeteorAppDir();
        // Filter dependencies that need to be installed (missing or wrong version)
        const allDepsToInstall = dependencies.filter((dep)=>!checkNpmDependencyExists(dep.name, {
                cwd: appDir
            }) || !checkNpmDependencyVersion(dep.name, {
                cwd: appDir,
                versionRequirement: dep.version,
                semverCondition: dep.semverCondition || 'gte',
                existenceOnly: dep.existenceOnly
            }));
        // Format dependencies for installation
        const dependencyStrings = allDepsToInstall.map((dep)=>`${dep.name}@${dep.version}`);
        if (allDepsToInstall.length > 0) {
            let devDepsSuccess = true;
            let regularDepsSuccess = true;
            let devDepsStrings = [];
            let regularDepsStrings = [];
            // Display a header for the installation process
            logProgress(`=> 📦 ${packageName} Dependencies`);
            // Show what dependencies will be installed
            dependencyStrings.forEach((dep)=>{
                logInfo(`   • ${dep}`);
            });
            // Check if this is a Yarn project
            const isYarnProj = process.env.YARN_ENABLED === 'true';
            // Install dev dependencies
            const devDepsToInstall = allDepsToInstall.filter((dep)=>dep.dev === true || dep.dev == null);
            if (devDepsToInstall.length > 0) {
                devDepsStrings = devDepsToInstall.map((dep)=>`${dep.name}@${dep.version}`);
                // Log progress for dev dependencies
                logProgress(`=> 🔧 Installing ${devDepsToInstall.length} dev dependenc${devDepsToInstall.length === 1 ? "y" : "ies"}...`);
                devDepsSuccess = yield installNpmDependency(devDepsStrings, {
                    cwd: appDir,
                    dev: true,
                    yarn: isYarnProj
                });
            }
            // Install regular dependencies
            const regularDepsToInstall = allDepsToInstall.filter((dep)=>dep.dev === false);
            if (regularDepsToInstall.length > 0) {
                regularDepsStrings = regularDepsToInstall.map((dep)=>`${dep.name}@${dep.version}`);
                // Log progress for regular dependencies
                logProgress(`=> 🔧 Installing ${regularDepsToInstall.length} dependenc${regularDepsToInstall.length === 1 ? "y" : "ies"}...`);
                regularDepsSuccess = yield installNpmDependency(regularDepsStrings, {
                    cwd: appDir,
                    dev: false,
                    yarn: isYarnProj
                });
            }
            const success = devDepsSuccess && regularDepsSuccess;
            if (!success) {
                const isYarnProj = process.env.YARN_ENABLED === 'true';
                logError(`=> ❌ Failed to install ${packageName}`);
                if (!devDepsSuccess && devDepsStrings.length > 0) {
                    const devInstallCommand = isYarnProj ? `yarn add --dev ${devDepsStrings.join(' ').trim()}` : `meteor npm install -D ${devDepsStrings.join(' ').trim()}`;
                    logError(`   For dev dependencies, run: ${devInstallCommand}`);
                }
                if (!regularDepsSuccess && regularDepsStrings.length > 0) {
                    const regularInstallCommand = isYarnProj ? `yarn add ${regularDepsStrings.join(' ').trim()}` : `meteor npm install ${regularDepsStrings.join(' ').trim()}`;
                    logError(`   For regular dependencies, run: ${regularInstallCommand}`);
                }
                const allFailedDeps = [];
                if (!devDepsSuccess) allFailedDeps.push('dev dependencies');
                if (!regularDepsSuccess) allFailedDeps.push('regular dependencies');
                throw new Error(`Failed to install ${packageName} ${joinWithAnd(allFailedDeps)}. Please install them manually with the commands above.`);
            }
            logSuccess(`=> ✅ Installed ${packageName} dependencies`);
            if (isMeteorAppUpdate()) {
                const isYarnProj = process.env.YARN_ENABLED === 'true';
                const installCommand = isYarnProj ? 'yarn install' : 'npm install';
                logInfo(`=> 🔔 Remember: Run \`${installCommand}\` after the Meteor update finishes.`);
                logInfo(`   This helps keep your dependencies correct and your project stable.`);
            }
        }
        // Mark as checked
        setGlobalState(globalStateKey, true);
    })();
}
/**
 * Checks if Rspack is installed, and installs it if not
 * @returns {Promise<void>} A promise that resolves when the check/installation is complete
 * @throws {Error} If Rspack installation fails
 */ function ensureRspackInstalled() {
    return _async_to_generator(function*() {
        const dependencies = [
            {
                name: '@rspack/cli',
                version: DEFAULT_RSPACK_VERSION,
                semverCondition: 'gte',
                dev: true
            },
            {
                name: '@rspack/core',
                version: DEFAULT_RSPACK_VERSION,
                semverCondition: 'gte',
                dev: true
            },
            {
                name: '@meteorjs/rspack',
                version: DEFAULT_METEOR_RSPACK_VERSION,
                semverCondition: 'gte',
                dev: true
            },
            {
                name: '@swc/helpers',
                version: DEFAULT_METEOR_RSPACK_SWC_HELPERS_VERSION,
                semverCondition: 'gte',
                dev: false
            },
            {
                name: '@rsdoctor/rspack-plugin',
                version: DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION,
                semverCondition: 'gte',
                dev: true
            }
        ];
        yield ensureDependenciesInstalled(dependencies, GLOBAL_STATE_KEYS.RSPACK_INSTALLATION_CHECKED, 'Rspack');
    })();
}
/**
 * Checks if React is installed and sets global state accordingly
 * Sets global state and environment variables based on React detection
 * @returns {Promise<void>} A promise that resolves when the check is complete
 */ function checkReactInstalled() {
    // Skip if already checked
    if (getGlobalState(GLOBAL_STATE_KEYS.REACT_CHECKED, false)) {
        return;
    }
    const appDir = getMeteorAppDir();
    // Check if React is a dependency in the project
    const isReactInstalled = checkNpmDependencyExists('react', {
        cwd: appDir
    }) && !checkNpmDependencyExists('preact', {
        cwd: appDir
    });
    if (isReactInstalled) {
        // Set environment variable to indicate React is enabled
        process.env.METEOR_REACT_ENABLED = 'true';
    } else {
        process.env.METEOR_REACT_ENABLED = 'false';
    }
    // Mark as checked
    setGlobalState(GLOBAL_STATE_KEYS.REACT_CHECKED, true);
    return isReactInstalled;
}
function ensureRspackReactInstalled() {
    return _async_to_generator(function*() {
        const dependencies = [
            {
                name: '@rspack/plugin-react-refresh',
                version: DEFAULT_METEOR_RSPACK_REACT_HMR_VERSION,
                semverCondition: 'gte',
                dev: true
            },
            {
                name: 'react-refresh',
                version: DEFAULT_METEOR_RSPACK_REACT_REFRESH_VERSION,
                semverCondition: 'gte',
                dev: true
            }
        ];
        yield ensureDependenciesInstalled(dependencies, GLOBAL_STATE_KEYS.RSPACK_REACT_INSTALLATION_CHECKED, 'Rspack React');
    })();
}
/**
 * Checks if Rspack Doctor is installed, and installs it if not
 * @returns {Promise<void>} A promise that resolves when the check/installation is complete
 * @throws {Error} If Rspack Doctor installation fails
 */ function ensureRspackDoctorInstalled() {
    return _async_to_generator(function*() {
        const dependencies = [
            {
                name: '@rsdoctor/rspack-plugin',
                version: DEFAULT_RSDOCTOR_RSPACK_PLUGIN_VERSION,
                semverCondition: 'gte',
                dev: true
            }
        ];
        yield ensureDependenciesInstalled(dependencies, GLOBAL_STATE_KEYS.RSPACK_DOCTOR_INSTALLATION_CHECKED, 'Rspack Doctor');
    })();
}
/**
 * Checks if TypeScript is installed and sets global state accordingly
 * Sets global state and environment variables based on TypeScript detection
 * @returns {boolean} Whether TypeScript is installed
 */ function checkTypescriptInstalled() {
    // Skip if already checked
    if (getGlobalState(GLOBAL_STATE_KEYS.TYPESCRIPT_CHECKED, false)) {
        return;
    }
    const appDir = getMeteorAppDir();
    // Check if TypeScript is a dependency in the project
    const isTypescriptInstalled = checkNpmDependencyExists('typescript', {
        cwd: appDir
    });
    if (isTypescriptInstalled) {
        // Set environment variable to indicate TypeScript is enabled
        process.env.METEOR_TYPESCRIPT_ENABLED = 'true';
    } else {
        process.env.METEOR_TYPESCRIPT_ENABLED = 'false';
    }
    // Mark as checked
    setGlobalState(GLOBAL_STATE_KEYS.TYPESCRIPT_CHECKED, true);
    return isTypescriptInstalled;
}
/**
 * Checks if Angular is installed and sets global state accordingly
 * Sets global state and environment variables based on Angular detection
 * @returns {boolean} Whether Angular is installed
 */ function checkAngularInstalled() {
    // Skip if already checked
    if (getGlobalState(GLOBAL_STATE_KEYS.ANGULAR_CHECKED, false)) {
        return;
    }
    const appDir = getMeteorAppDir();
    // Check if @nx/angular-rspack is a dependency in the project
    const isAngularInstalled = checkNpmDependencyExists('@nx/angular-rspack', {
        cwd: appDir
    });
    if (isAngularInstalled) {
        // Set environment variable to indicate Angular is enabled
        process.env.METEOR_ANGULAR_ENABLED = 'true';
    } else {
        process.env.METEOR_ANGULAR_ENABLED = 'false';
    }
    // Mark as checked
    setGlobalState(GLOBAL_STATE_KEYS.ANGULAR_CHECKED, true);
    return isAngularInstalled;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"build-context.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/lib/build-context.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({getInitialEntrypoints:()=>getInitialEntrypoints,ensureRspackBuildContextExists:()=>ensureRspackBuildContextExists,ensureModuleFilesExist:()=>ensureModuleFilesExist,getBuildFilePath:()=>getBuildFilePath,getBuildFileContent:()=>getBuildFileContent,cleanBuildContextFiles:()=>cleanBuildContextFiles,ensureRspackConfigExists:()=>ensureRspackConfigExists});let RSPACK_DOCTOR_CONTEXT;module.link("./constants",{RSPACK_DOCTOR_CONTEXT(v){RSPACK_DOCTOR_CONTEXT=v}},0);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _define_property(obj, key, value) {
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
/**
 * @module build-context
 * @description Functions for managing build context and module files for Rspack plugin
 */ 
const fs = require('fs');
const path = require('path');
const { getCustomConfigFilePath } = require('./processes');
const { logError } = require('meteor/tools-core/lib/log');
const { capitalizeFirstLetter } = require('meteor/tools-core/lib/string');
const { getMeteorAppDir, getMeteorInitialAppEntrypoints, isMeteorAppDevelopment, isMeteorAppRun, isMeteorAppBuild, isMeteorBlazeProject, isMeteorAppNative, isMeteorAppTestFullApp } = require('meteor/tools-core/lib/meteor');
const { getGlobalState, setGlobalState } = require('meteor/tools-core/lib/global-state');
const { addGitignoreEntries } = require('meteor/tools-core/lib/git');
const { RSPACK_BUILD_CONTEXT, RSPACK_CHUNKS_CONTEXT, RSPACK_ASSETS_CONTEXT, GLOBAL_STATE_KEYS, FILE_ROLE } = require('./constants');
// Common warning message for autogenerated files
const AUTO_GENERATED_WARNING = `* ⚠️ Note: This file is autogenerated. It is not meant to be modified manually.
* These files also act as a cache: they can be safely removed and will be
* regenerated on the next build. They should be ignored in IDE suggestions
* and version control.`;
/**
 * Gets entry points from Meteor configuration
 * Retrieves from global state if already stored, otherwise gets from Meteor
 * @returns {Object} Object containing entry points for client and server
 */ function getInitialEntrypoints() {
    const existingEntrypoint = getGlobalState(GLOBAL_STATE_KEYS.INITIAL_ENTRYPONTS);
    if (existingEntrypoint) return existingEntrypoint;
    const initialEntrypoints = getMeteorInitialAppEntrypoints();
    const hasInitialEntrypoints = initialEntrypoints && Object.values(initialEntrypoints).length > 0 && Object.values(initialEntrypoints).every((value)=>value != null);
    if (hasInitialEntrypoints) {
        setGlobalState(GLOBAL_STATE_KEYS.INITIAL_ENTRYPONTS, initialEntrypoints);
    }
    return initialEntrypoints;
}
/**
 * Ensures the Rspack build context directory exists
 * Creates the directory if it doesn't exist and adds it to .gitignore
 * @returns {string} Path to the build context directory
 * @throws {Error} If directory creation fails
 */ function ensureRspackBuildContextExists() {
    const appDir = getMeteorAppDir();
    const buildContextPath = path.join(appDir, RSPACK_BUILD_CONTEXT);
    if (!fs.existsSync(buildContextPath)) {
        try {
            fs.mkdirSync(buildContextPath, {
                recursive: true
            });
        } catch (error) {
            logError(`Failed to create Rspack build context directory: ${error.message}`);
            throw error;
        }
    }
    const commonBuildEntries = [
        RSPACK_BUILD_CONTEXT,
        `*/${RSPACK_ASSETS_CONTEXT}`,
        `*/${RSPACK_CHUNKS_CONTEXT}`,
        RSPACK_DOCTOR_CONTEXT
    ];
    if (process.env.METEOR_LOCAL_DIR) {
        addGitignoreEntries(appDir, [
            process.env.METEOR_LOCAL_DIR,
            ...commonBuildEntries
        ], "Meteor custom local directory (METEOR_LOCAL_DIR)");
        return buildContextPath;
    }
    addGitignoreEntries(appDir, commonBuildEntries, "Meteor Modern-Tools build context directories");
    return buildContextPath;
}
/**
 * Ensures module files exist in the build context directory
 * Creates default module files if they don't exist
 * @returns {void}
 */ function ensureModuleFilesExist() {
    const appDir = getMeteorAppDir();
    const env = _object_spread_props(_object_spread({}, isMeteorAppDevelopment() ? {
        isDevelopment: true
    } : {
        isProduction: true
    }), {
        isNative: isMeteorAppNative()
    });
    const commandRole = isMeteorAppRun() ? {
        role: FILE_ROLE.run
    } : isMeteorAppBuild() ? {
        role: FILE_ROLE.build
    } : {
        role: FILE_ROLE.run
    };
    const initialEntrypoints = getInitialEntrypoints();
    const mainClientFiles = {
        entryFile: initialEntrypoints.mainClient || '',
        outputFile: getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isClient: true
        }, env), {
            role: FILE_ROLE.output,
            onlyFilename: true
        }))
    };
    const mainServerFiles = {
        entryFile: initialEntrypoints.mainServer || '',
        outputFile: getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isServer: true
        }, env), {
            role: FILE_ROLE.output,
            onlyFilename: true
        }))
    };
    const isTestEager = initialEntrypoints.testModule == null && initialEntrypoints.testClient == null && initialEntrypoints.testServer == null;
    const isTestModule = initialEntrypoints.testModule != null || isTestEager;
    const testClientFiles = {
        entryFile: initialEntrypoints.testClient || '',
        outputFile: getBuildFilePath({
            isTest: true,
            isTestModule,
            isClient: true,
            role: FILE_ROLE.output,
            onlyFilename: true
        }),
        mainEntryFile: mainClientFiles.entryFile
    };
    const testServerFiles = {
        entryFile: initialEntrypoints.testServer || '',
        outputFile: getBuildFilePath({
            isTest: true,
            isTestModule,
            isServer: true,
            role: FILE_ROLE.output,
            onlyFilename: true
        }),
        mainEntryFile: mainServerFiles.entryFile
    };
    const isTestFullApp = isMeteorAppTestFullApp();
    const moduleFiles = {
        /* Main module files for client and server */ [getBuildFilePath(_object_spread({
            isMain: true,
            isClient: true
        }, env, commandRole))]: getBuildFileContent(_object_spread({
            isMain: true,
            isClient: true
        }, env, commandRole, mainClientFiles)),
        [getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isClient: true
        }, env), {
            role: FILE_ROLE.entry
        }))]: getBuildFileContent(_object_spread(_object_spread_props(_object_spread({
            isMain: true,
            isClient: true
        }, env), {
            role: FILE_ROLE.entry
        }), mainClientFiles)),
        [getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isClient: true
        }, env), {
            role: FILE_ROLE.output
        }))]: getBuildFileContent(_object_spread(_object_spread_props(_object_spread({
            isMain: true,
            isClient: true
        }, env), {
            role: FILE_ROLE.output
        }), mainClientFiles)),
        [getBuildFilePath(_object_spread({
            isMain: true,
            isServer: true
        }, env, commandRole))]: getBuildFileContent(_object_spread({
            isMain: true,
            isServer: true
        }, env, commandRole, mainServerFiles)),
        [getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isServer: true
        }, env), {
            role: FILE_ROLE.entry
        }))]: getBuildFileContent(_object_spread(_object_spread_props(_object_spread({
            isMain: true,
            isServer: true
        }, env), {
            role: FILE_ROLE.entry
        }), mainServerFiles)),
        [getBuildFilePath(_object_spread_props(_object_spread({
            isMain: true,
            isServer: true
        }, env), {
            role: FILE_ROLE.output
        }))]: getBuildFileContent(_object_spread(_object_spread_props(_object_spread({
            isMain: true,
            isServer: true
        }, env), {
            role: FILE_ROLE.output
        }), mainServerFiles)),
        /* Test module files when test module, test module files for client and server are present or eager discovery */ [getBuildFilePath(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true
        }, commandRole))]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true
        }, commandRole, testClientFiles)),
        [getBuildFilePath({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true,
            role: FILE_ROLE.entry
        })]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true,
            role: FILE_ROLE.entry
        }, testClientFiles)),
        [getBuildFilePath({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true,
            role: FILE_ROLE.output
        })]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isClient: true,
            role: FILE_ROLE.output
        }, testClientFiles)),
        [getBuildFilePath(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true
        }, commandRole))]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true
        }, commandRole, testServerFiles)),
        [getBuildFilePath({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true,
            role: FILE_ROLE.entry
        })]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true,
            role: FILE_ROLE.entry
        }, testServerFiles)),
        [getBuildFilePath({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true,
            role: FILE_ROLE.output
        })]: getBuildFileContent(_object_spread({
            isTest: true,
            isTestFullApp,
            isTestModule,
            isServer: true,
            role: FILE_ROLE.output
        }, testServerFiles))
    };
    Object.entries(moduleFiles).forEach(([filename, defaultContent])=>{
        // 1. Build full path and ensure directory exists
        const filePath = path.join(appDir, RSPACK_BUILD_CONTEXT, filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            } catch (err) {
                logError(`Failed to create directory ${dir}: ${err.message}`);
                return; // stop here if we can’t make the folder
            }
        }
        // 2. If the file exists, check its contents
        if (fs.existsSync(filePath)) {
            let existing;
            try {
                existing = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                logError(`Failed to read existing file ${filename}: ${err.message}`);
                return;
            }
            // 3. If it doesn't already start with the new defaultContent, overwrite it
            if (!existing.includes(defaultContent)) {
                try {
                    fs.writeFileSync(filePath, defaultContent, 'utf8');
                } catch (err) {
                    logError(`Failed to rewrite module file ${filename}: ${err.message}`);
                }
            }
        // 4. If the file doesn't exist at all, write it for the first time
        } else {
            try {
                fs.writeFileSync(filePath, defaultContent, 'utf8');
            } catch (err) {
                logError(`Failed to create module file ${filename}: ${err.message}`);
            }
        }
    });
}
/**
 * Generates a build file path based on configuration parameters
 * @param {Object} config - Configuration object containing build settings
 * @returns {string} The build file path or filename
 */ function getBuildFilePath(config) {
    // Determine the module part (directory name)
    let module = '';
    if (config === null || config === void 0 ? void 0 : config.isTest) {
        module = 'test';
    } else if (config === null || config === void 0 ? void 0 : config.isMain) {
        module = 'main';
    }
    // Determine the side part (first part of filename)
    let side = '';
    if (config === null || config === void 0 ? void 0 : config.isServer) {
        side = 'server';
    } else if (config === null || config === void 0 ? void 0 : config.isClient) {
        side = 'client';
    }
    // Determine the environment part (only for non-test files)
    let env = '';
    if (!(config === null || config === void 0 ? void 0 : config.isTest)) {
        if (config === null || config === void 0 ? void 0 : config.isDevelopment) {
            env = 'dev';
        } else if (config === null || config === void 0 ? void 0 : config.isProduction) {
            env = 'prod';
        }
    }
    // Determine the role part
    let role = config === null || config === void 0 ? void 0 : config.role;
    if ([
        FILE_ROLE.run,
        FILE_ROLE.build
    ].includes(role)) {
        role = 'meteor';
    } else if ([
        FILE_ROLE.output
    ].includes(role)) {
        role = 'rspack';
    }
    // 5. Get file extension (default to js)
    const extension = (config === null || config === void 0 ? void 0 : config.extension) || 'js';
    // 6. Construct the filename: {side}-{role}.{extension}
    const filename = `${side}-${role}.${extension}`;
    // Return either just the filename or the full path
    if (config === null || config === void 0 ? void 0 : config.onlyFilename) {
        return filename;
    } else {
        // Full path format: {module}[-{env}]/{filename}
        const envSuffix = env ? `-${env}` : '';
        return `${module}${envSuffix}/${filename}`;
    }
}
/**
 * Gets the appropriate banner based on file configuration
 * @param {Object} config - Configuration object
 * @param {string} side - The side (client, server, test)
 * @param {string} env - The environment (development, production)
 * @param {string} module - The module (main, test)
 * @param {string} role - The role (build, entry, run, output)
 * @returns {string} The banner content
 */ function getBanner(config, side, env, module, role) {
    const envDisplay = capitalizeFirstLetter(env || module);
    const sideDisplay = capitalizeFirstLetter(side);
    // For test mode, use the existing banners
    if (module === 'test') {
        // Test file banners
        if (role === FILE_ROLE.entry) {
            if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
                return `/**
* @file ${side}-entry.js
* @description No code generated
* --------------------------------------------------------------------------
* ⚡ Rspack Test ${sideDisplay} Entry (${envDisplay})
* --------------------------------------------------------------------------
* • [■ ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is empty because \`meteor.testModule${side === 'test' ? '' : `.${side}`}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
            }
            // For test mode, if side is client or server, include it in the title
            const testType = side === 'test' ? 'Test' : `Test ${sideDisplay}`;
            return `/**
* @file ${side}-entry.js
* @description Entry point for Rspack test build process
* --------------------------------------------------------------------------
* ⚡ Rspack ${testType} Entry (${envDisplay})
* --------------------------------------------------------------------------
* • [■ ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is the starting point for the Rspack test build. It imports your
* Meteor app's test modules so Rspack can resolve every dependency and
* generate the bundled output: \`${side}-rspack.js\`.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        if (role === FILE_ROLE.output) {
            if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
                return `/**
* @file ${side}-rspack.js
* @description No code generated
* --------------------------------------------------------------------------
* ⚡ Rspack Test ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [■ ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is empty because \`meteor.testModule${side === 'test' ? '' : `.${side}`}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
            }
            // For test mode, if side is client or server, include it in the title
            const testType = side === 'test' ? 'Test' : `Test ${sideDisplay}`;
            return `/**
* @file ${side}-rspack.js
* @description Bundled output generated by Rspack for tests
* --------------------------------------------------------------------------
* ⚡ Rspack ${testType} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [■ ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is the bundle that Rspack outputs for tests. It contains all of
* your test code in one optimized file. Next step is loading this bundle via
* \`${side}-meteor.js\`.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        if (role === FILE_ROLE.run || role === FILE_ROLE.build) {
            if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
                return `/**
* @file ${side}-meteor.js
* @description No code generated
* --------------------------------------------------------------------------
* ☄️ Meteor Test ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [■ ${side}-meteor.js ]
*
* This file is empty because \`meteor.testModule${side === 'test' ? '' : `.${side}`}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
            }
            // For test mode, if side is client or server, include it in the title
            const testType = side === 'test' ? 'Test' : `Test ${sideDisplay}`;
            return `/**
* @file ${side}-meteor.js
* @description Meteor runtime file that imports the Rspack test bundle
* --------------------------------------------------------------------------
* ☄️ Meteor ${testType} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [■ ${side}-meteor.js ]
*
* Defined under \`meteor.testModule${side === 'test' ? '' : `.${side}`}\` in package.json. Meteor loads this
* file at runtime to import the Rspack test bundle (\`${side}-rspack.js\`) and
* run your tests.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        return '';
    }
    // For main modules (not test mode), use the new templates
    // Entry files
    if (role === FILE_ROLE.entry) {
        if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
            return `/**
* @file ${side}-entry.js
* @description No code generated
* --------------------------------------------------------------------------
* 🔌 Rspack ${sideDisplay} Entry (${envDisplay})
* --------------------------------------------------------------------------
* • [■ ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is empty because \`meteor.mainModule.${side}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        return `/**
* @file ${side}-entry.js
* @description Entry point for Rspack build process
* --------------------------------------------------------------------------
* 🔌 Rspack ${sideDisplay} Entry (${envDisplay})
* --------------------------------------------------------------------------
* • [■ ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is the entry point that Rspack uses to start the build process.
* It imports the module defined in \`meteor.mainModule.${side}\` inside package.json.
* From here, Rspack can trace the entire dependency graph of your application
* and generate the bundled output (\`${side}-rspack.js\`).
*
${AUTO_GENERATED_WARNING}
*/`;
    }
    // Rspack output files
    if (role === FILE_ROLE.output) {
        if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
            return `/**
* @file ${side}-rspack.js
* @description No code generated
* --------------------------------------------------------------------------
* ⚡ Rspack ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [■ ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is empty because \`meteor.mainModule.${side}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        return `/**
* @file ${side}-rspack.js
* @description Bundled output generated by Rspack
* --------------------------------------------------------------------------
* ⚡ Rspack ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [■ ${side}-rspack.js ] ──▶ [   ${side}-meteor.js ]
*
* This file is the bundled output generated by Rspack.
* It contains all application code and assets combined into one build.
* It is not used directly, but will be imported by the Meteor main module
* file (\`${side}-meteor.js\`) so that Meteor runs the Rspack bundle.
*
${AUTO_GENERATED_WARNING}
*/`;
    }
    // Meteor files (run or build role)
    if (role === FILE_ROLE.run || role === FILE_ROLE.build) {
        if (!(config === null || config === void 0 ? void 0 : config.entryFile)) {
            return `/**
* @file ${side}-meteor.js
* @description No code generated
* --------------------------------------------------------------------------
* ☄️ Meteor ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [■ ${side}-meteor.js ]
*
* This file is empty because \`meteor.mainModule.${side}\` is not set in package.json.
*
${AUTO_GENERATED_WARNING}
*/`;
        }
        return `/**
* @file ${side}-meteor.js
* @description Meteor runtime file that imports the Rspack bundle
* --------------------------------------------------------------------------
* ☄️ Meteor ${sideDisplay} App (${envDisplay})
* --------------------------------------------------------------------------
* • [   ${side}-entry.js ] ──▶ [   ${side}-rspack.js ] ──▶ [■ ${side}-meteor.js ]
*
* This file overrides the corresponding \`meteor.mainModule.${side}\` entry in
* package.json. Meteor loads it at runtime, and it imports the Rspack
* bundle (\`${side}-rspack.js\`) so the application executes using the build
* produced by Rspack.
*
${AUTO_GENERATED_WARNING}
*/`;
    }
    return '';
}
/**
 * Gets the HMR code if applicable
 * @returns {string} The HMR code or empty string
 */ function getHmrCode(config, role) {
    if (!(config === null || config === void 0 ? void 0 : config.entryFile) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return '';
    }
    if (role === FILE_ROLE.entry && (config === null || config === void 0 ? void 0 : config.isClient) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return `/* Enables HMR */
if (module.hot) {
  module.hot.accept();
}`;
    }
    return '';
}
/**
 * Gets the import content based on configuration
 * @returns {string} The import content
 */ function getImportContent(config, side, role) {
    if (!(config === null || config === void 0 ? void 0 : config.entryFile) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return '';
    }
    if (role === FILE_ROLE.entry) {
        if (config === null || config === void 0 ? void 0 : config.isTest) {
            return `${(config === null || config === void 0 ? void 0 : config.isTestFullApp) && (config === null || config === void 0 ? void 0 : config.mainEntryFile) ? `/* Link to 🔌 Meteor ${capitalizeFirstLetter(side)} Main Entry (--full-app mode) */
import '../../${config.mainEntryFile}';` : ""}
${(config === null || config === void 0 ? void 0 : config.entryFile) ? `
/* Link to 🔌 Meteor ${capitalizeFirstLetter(side)} Test Entry */
import '../../${config.entryFile}';` : ""}`;
        }
        if (config === null || config === void 0 ? void 0 : config.entryFile) {
            return `/* Link to 🔌 Meteor ${capitalizeFirstLetter(side)} Entry */
import '../../${config === null || config === void 0 ? void 0 : config.entryFile}';`;
        }
    }
    if ((config === null || config === void 0 ? void 0 : config.outputFile) && (role === FILE_ROLE.build || (config === null || config === void 0 ? void 0 : config.isProduction) || role === FILE_ROLE.run && ((config === null || config === void 0 ? void 0 : config.isServer) || (config === null || config === void 0 ? void 0 : config.isTest) || (config === null || config === void 0 ? void 0 : config.isNative)))) {
        return `/* Link to ⚡ Rspack ${capitalizeFirstLetter(side)} App */
${isMeteorBlazeProject() && (config === null || config === void 0 ? void 0 : config.isClient) && '// In Blaze, import happens last so HTML files preload first' || `import './${(config === null || config === void 0 ? void 0 : config.outputFile) || ''}';`}`;
    }
    if (role === FILE_ROLE.run && (config === null || config === void 0 ? void 0 : config.isServer) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return '/* No link to ☄️ Meteor Server App as served by HMR server */';
    }
    if (role === FILE_ROLE.run && (config === null || config === void 0 ? void 0 : config.isClient) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return '/* No link to ⚡ Rspack Client App as served by HMR server */';
    }
    if (role === FILE_ROLE.output && (config === null || config === void 0 ? void 0 : config.isClient) && !(config === null || config === void 0 ? void 0 : config.isTest)) {
        return '/* No code generated as served by HMR server */';
    }
    if (role === FILE_ROLE.output && ((config === null || config === void 0 ? void 0 : config.isServer) || (config === null || config === void 0 ? void 0 : config.isTest))) {
        return '/* Code generated */';
    }
    if (role === FILE_ROLE.entry && (config === null || config === void 0 ? void 0 : config.isTest)) {
        return '/* Tests automatically imported */';
    }
    return '';
}
/**
 * Generates build file content based on configuration parameters
 * @param {Object} config - Configuration object
 * @returns {string} The build file content
 */ function getBuildFileContent(config) {
    // Extract configuration values
    const module = (config === null || config === void 0 ? void 0 : config.isTest) ? 'test' : (config === null || config === void 0 ? void 0 : config.isMain) ? 'main' : '';
    const side = (config === null || config === void 0 ? void 0 : config.isTestModule) ? 'test' : (config === null || config === void 0 ? void 0 : config.isServer) ? 'server' : (config === null || config === void 0 ? void 0 : config.isClient) ? 'client' : '';
    const env = (config === null || config === void 0 ? void 0 : config.isDevelopment) ? 'development' : (config === null || config === void 0 ? void 0 : config.isProduction) ? 'production' : '';
    const role = config === null || config === void 0 ? void 0 : config.role;
    // Get banner based on configuration
    const banner = getBanner(config, side, env, module, role);
    // Get HMR code if applicable
    const hmr = getHmrCode(config, role);
    // Get import content based on configuration
    const importContent = getImportContent(config, side, role);
    // Combine all parts to create the file content
    return `${banner}
${hmr && `
${hmr}
` || ''}
${importContent}
`;
}
/**
 * Cleans the build context files of the current environment
 * Removes all build files and directories for the current environment
 * Also cleans _build-* files from public and private folders
 * @returns {void}
 */ function cleanBuildContextFiles() {
    const appDir = getMeteorAppDir();
    const buildContextPath = path.join(appDir, RSPACK_BUILD_CONTEXT);
    // Only proceed if the build context directory exists
    if (!fs.existsSync(buildContextPath)) {
        return;
    }
    // Get current environment
    const env = _object_spread_props(_object_spread({}, isMeteorAppDevelopment() ? {
        isDevelopment: true
    } : {
        isProduction: true
    }), {
        isNative: isMeteorAppNative()
    });
    try {
        // Clean main module directories
        const mainClientPath = path.dirname(path.join(buildContextPath, getBuildFilePath(_object_spread({
            isMain: true,
            isClient: true
        }, env))));
        const mainServerPath = path.dirname(path.join(buildContextPath, getBuildFilePath(_object_spread({
            isMain: true,
            isServer: true
        }, env))));
        // Clean test module directories if they exist
        const testModulePath = path.dirname(path.join(buildContextPath, getBuildFilePath({
            isTest: true,
            isTestModule: true
        })));
        const testClientPath = path.dirname(path.join(buildContextPath, getBuildFilePath({
            isTest: true,
            isClient: true
        })));
        const testServerPath = path.dirname(path.join(buildContextPath, getBuildFilePath({
            isTest: true,
            isServer: true
        })));
        // Create a Set to ensure unique directory paths
        const uniqueDirPaths = new Set([
            mainClientPath,
            mainServerPath,
            testModulePath,
            testClientPath,
            testServerPath
        ]);
        // Remove directories if they exist
        [
            ...uniqueDirPaths
        ].forEach((dirPath)=>{
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, {
                    recursive: true,
                    force: true
                });
            }
        });
        // Clean _build-* files from public and private folders
        const publicDir = path.join(appDir, 'public');
        const privateDir = path.join(appDir, 'private');
        [
            publicDir,
            privateDir
        ].forEach((dir)=>{
            if (fs.existsSync(dir)) {
                try {
                    const files = fs.readdirSync(dir);
                    files.forEach((file)=>{
                        if ([
                            RSPACK_ASSETS_CONTEXT,
                            RSPACK_CHUNKS_CONTEXT,
                            RSPACK_DOCTOR_CONTEXT
                        ].includes(file)) {
                            const filePath = path.join(dir, file);
                            fs.rmSync(filePath, {
                                recursive: true,
                                force: true
                            });
                        }
                    });
                    // Also remove client-rspack.js from public directory if it exists
                    if (dir === publicDir) {
                        const clientRspackPath = path.join(dir, 'client-rspack.js');
                        if (fs.existsSync(clientRspackPath)) {
                            fs.rmSync(clientRspackPath, {
                                force: true
                            });
                        }
                    }
                } catch (err) {
                    logError(`Failed to clean _build-* files from ${dir}: ${err.message}`);
                }
            }
        });
    } catch (error) {
        logError(`Failed to clean build context files: ${error.message}`);
    }
}
/**
 * Ensures the rspack.config.js file exists at the project level
 * Creates the file if it doesn't exist with the required template
 * Will not create a new file if rspack.config.mjs or rspack.config.cjs exists
 * @returns {string} Path to the rspack.config file (.js, .mjs, or .cjs)
 */ function ensureRspackConfigExists() {
    const appDir = getMeteorAppDir();
    // Check if any config file already exists using the helper function
    const existingConfigPath = getCustomConfigFilePath(appDir);
    if (existingConfigPath) {
        return existingConfigPath;
    }
    // If no config file exists, we'll create a .js one
    const jsConfigPath = path.join(appDir, 'rspack.config.js');
    const configTemplate = `const { defineConfig } = require('@meteorjs/rspack');

/**
 * Rspack configuration for Meteor projects.
 *
 * Provides typed flags on the \`Meteor\` object, such as:
 * - \`Meteor.isClient\` / \`Meteor.isServer\`
 * - \`Meteor.isDevelopment\` / \`Meteor.isProduction\`
 * - …and other flags available
 *
 * Use these flags to adjust your build settings based on environment.
 */
module.exports = defineConfig(Meteor => {
  return {};
});
`;
    if (!fs.existsSync(jsConfigPath)) {
        try {
            fs.writeFileSync(jsConfigPath, configTemplate, 'utf8');
        } catch (error) {
            logError(`Failed to create rspack.config.js file: ${error.message}`);
            throw error;
        }
    }
    return jsConfigPath;
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"processes.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/lib/processes.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({calculateDevServerPort:()=>calculateDevServerPort,calculateRsdoctorClientPort:()=>calculateRsdoctorClientPort,calculateRsdoctorServerPort:()=>calculateRsdoctorServerPort,getCustomConfigFilePath:()=>getCustomConfigFilePath,getConfigFilePath:()=>getConfigFilePath,getRspackEnv:()=>getRspackEnv,startRspackClientServe:()=>startRspackClientServe,startRspackServerWatch:()=>startRspackServerWatch,runRspackBuild:()=>runRspackBuild,cleanup:()=>cleanup});let fs;module.link("fs",{default(v){fs=v}},0);let path;module.link("path",{default(v){path=v}},1);let logCompilationOutput,logHmrServerStarted,parseMeteorRspackOutput,shouldLogVerbose,stripRspackLabel;module.link("./logging",{logCompilationOutput(v){logCompilationOutput=v},logHmrServerStarted(v){logHmrServerStarted=v},parseMeteorRspackOutput(v){parseMeteorRspackOutput=v},shouldLogVerbose(v){shouldLogVerbose=v},stripRspackLabel(v){stripRspackLabel=v}},2);let isMeteorAppProfile;module.link("../../tools-core/lib/meteor",{isMeteorAppProfile(v){isMeteorAppProfile=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
/**
 * @module processes
 * @description Functions for managing Rspack processes
 */ 

const { spawnProcess, stopProcess, isProcessRunning } = require('meteor/tools-core/lib/process');
const { logError, logInfo, logRaw, getRunLog } = require("meteor/tools-core/lib/log");
const { getMeteorAppDir, isMeteorAppTest, isMeteorAppTestFullApp, isMeteorAppDevelopment, isMeteorAppProduction, isMeteorAppDebug, isMeteorAppRun, isMeteorAppBuild, isMeteorAppNative, isMeteorBlazeProject, isMeteorBlazeHotProject, getMeteorInitialAppEntrypoints, isMeteorAppConfigModernVerbose, isMeteorBundleVisualizerProject, getMeteorAppPort, inheritMeteorToolNodeFlags } = require('meteor/tools-core/lib/meteor');
const { checkNpmDependencyExists, getNpxCommand, getNodeBinEnv, getMonorepoPath } = require('meteor/tools-core/lib/npm');
const { getGlobalState, setGlobalState } = require('meteor/tools-core/lib/global-state');
const { GLOBAL_STATE_KEYS, RSPACK_CHUNKS_CONTEXT, RSPACK_ASSETS_CONTEXT, FILE_ROLE } = require('./constants');
const { getBuildFilePath, getBuildFileContent } = require('./build-context');


/**
 * Calculates the devServerPort based on process.env.PORT
 * Base port is 8077, and we add the sum of the digits of process.env.PORT
 * @returns {number} The calculated devServerPort
 */ function calculateDevServerPort() {
    const port = getMeteorAppPort();
    const basePort = 8077;
    // Sum the digits of the port
    const digitSum = port.split('').reduce((sum, digit)=>sum + parseInt(digit, 10), 0);
    return basePort + digitSum;
}
/**
 * Calculates the Rsdoctor client port based on process.env.PORT
 * Base port is 8885, and we add the sum of the digits of process.env.PORT
 * @returns {number} The calculated Rsdoctor client port
 */ function calculateRsdoctorClientPort() {
    const port = getMeteorAppPort();
    const basePort = 8885;
    // Sum the digits of the port
    const digitSum = port.split('').reduce((sum, digit)=>sum + parseInt(digit, 10), 0);
    return basePort + digitSum;
}
/**
 * Calculates the Rsdoctor server port based on process.env.PORT
 * Base port is 8885, and we add the sum of the digits of process.env.PORT + 1
 * @returns {number} The calculated Rsdoctor server port
 */ function calculateRsdoctorServerPort() {
    const port = getMeteorAppPort();
    const basePort = 8885;
    // Sum the digits of the port
    const digitSum = port.split('').reduce((sum, digit)=>sum + parseInt(digit, 10), 0);
    // Add 1 to differentiate from client port
    return basePort + digitSum + 1;
}
/**
 * Helper function to check for a file with different extensions in order of priority
 * @param {string} basePath - The base directory path (without 'rspack.config' and extension)
 * @returns {string|null} The full path with extension if found, null otherwise
 */ function getCustomConfigFilePath(basePath = getMeteorAppDir()) {
    const configBasePath = path.join(basePath, 'rspack.config');
    // Check for .js extension first (highest priority)
    const jsPath = `${configBasePath}.js`;
    if (fs.existsSync(jsPath)) {
        return jsPath;
    }
    // Check for .ts extension next
    const tsPath = `${configBasePath}.ts`;
    if (fs.existsSync(tsPath)) {
        return tsPath;
    }
    // Check for .mjs extension next
    const mjsPath = `${configBasePath}.mjs`;
    if (fs.existsSync(mjsPath)) {
        return mjsPath;
    }
    // Check for .cjs extension last
    const cjsPath = `${configBasePath}.cjs`;
    if (fs.existsSync(cjsPath)) {
        return cjsPath;
    }
    // No valid config file found with any extension
    return null;
}
/**
 * Gets the appropriate config file name based on environment
 * @returns {string} The name of the Rspack config file
 * @throws {Error} If no valid config file is found
 */ function getConfigFilePath() {
    // Check if the config file exists at the current path with any of the supported extensions
    const defaultConfigBasePath = path.join(process.cwd(), 'node_modules/@meteorjs/rspack');
    const defaultConfigPath = getCustomConfigFilePath(defaultConfigBasePath);
    if (defaultConfigPath) {
        return defaultConfigPath;
    }
    // If not found, check if we're in a monorepo and look for alternative config
    const monorepoPath = getMonorepoPath();
    if (monorepoPath) {
        const alternativeConfigBasePath = path.join(monorepoPath, 'node_modules/@meteorjs/rspack');
        const alternativeConfigPath = getCustomConfigFilePath(alternativeConfigBasePath);
        if (alternativeConfigPath) {
            return alternativeConfigPath;
        }
    }
    // If no config file is found, throw an error with suggestion to run npm install
    const isYarnProj = process.env.YARN_ENABLED === 'true';
    const installCommand = isYarnProj ? 'yarn install' : 'npm install';
    const isCI = !!(process.env.CI || // Most CI providers (GitHub Actions, GitLab CI, Travis, CircleCI, Buildkite, Drone, Semaphore, etc.)
    process.env.GITHUB_ACTIONS || // GitHub Actions
    process.env.JENKINS_URL || // Jenkins
    process.env.TEAMCITY_VERSION || // TeamCity
    process.env.CODEBUILD_BUILD_ARN || // AWS CodeBuild
    process.env.BUILDER_OUTPUT || // Google Cloud Build
    process.env.TF_BUILD || // Azure Pipelines
    process.env.KUBERNETES_SERVICE_HOST // Kubernetes
    );
    let message = `Could not find rspack.config.js, rspack.config.ts, rspack.config.mjs, or rspack.config.cjs.\n\n` + `Try running \`meteor update --npm\` followed by \`${installCommand}\` in your project directory and then re-run the build.\n` + `This will ensure @meteorjs/rspack is installed correctly.`;
    if (isCI) {
        message += `\n\nIt looks like you are running in a CI/Docker environment.\n` + `Make sure your Dockerfile or CI pipeline runs \`(meteor update --npm 2>/dev/null || true) && ${installCommand}\` before building.\n` + `See: https://docs.meteor.com/about/modern-build-stack/rspack-bundler-integration.html#docker`;
    }
    throw new Error(message);
}
/**
 * Gets the appropriate Rspack environment variables and command line arguments
 * @param {Object} options - Options for environment variables
 * @param {boolean} options.isClient - Whether this is for client-side build
 * @param {boolean} options.isServer - Whether this is for server-side build
 * @param {boolean} options.isTest - Whether this is for test build
 * @param {boolean} options.isTestLike - Whether test envs should be inherited
 * @returns {Object} Object containing params (command line arguments) and envs (environment variables)
 */ function getRspackEnv({ isClient, isServer, isTest: inIsTest, isTestLike: inIsTestLike }) {
    const RSPACK_BUILD_CONTEXT = require('./constants').RSPACK_BUILD_CONTEXT;
    const initialEntrypoints = getMeteorInitialAppEntrypoints();
    const isTest = inIsTest != null ? inIsTest : isMeteorAppTest();
    const isTestLike = isTest || inIsTestLike;
    const isTestEager = initialEntrypoints.testModule == null && initialEntrypoints.testClient == null && initialEntrypoints.testServer == null;
    const isTestModule = initialEntrypoints.testModule != null || isTestEager;
    const isTestFullApp = isMeteorAppTestFullApp();
    const module = isTest ? {
        isTest: true
    } : {
        isMain: true
    };
    const env = isMeteorAppDevelopment() ? {
        isDevelopment: true
    } : {
        isProduction: true
    };
    const side = isClient ? {
        isClient: true
    } : {
        isServer: true
    };
    const commandRole = isMeteorAppRun() ? {
        role: FILE_ROLE.run
    } : isMeteorAppBuild() ? {
        role: FILE_ROLE.build
    } : {
        role: FILE_ROLE.run
    };
    const entryKey = `${isTest && isTestModule ? 'test' : 'main'}${isClient ? 'Client' : 'Server'}`;
    const inputFilePath = initialEntrypoints[entryKey];
    const isTypescriptEnabled = process.env.METEOR_TYPESCRIPT_ENABLED === 'true' || (inputFilePath === null || inputFilePath === void 0 ? void 0 : inputFilePath.endsWith('.ts')) || (inputFilePath === null || inputFilePath === void 0 ? void 0 : inputFilePath.endsWith('.tsx'));
    const isReactEnabled = process.env.METEOR_REACT_ENABLED === 'true';
    const isAngularEnabled = process.env.METEOR_ANGULAR_ENABLED === 'true';
    const isTsxEnabled = isTypescriptEnabled && ((inputFilePath === null || inputFilePath === void 0 ? void 0 : inputFilePath.endsWith('.tsx')) || isReactEnabled);
    const isJsxEnabled = !isTypescriptEnabled && ((inputFilePath === null || inputFilePath === void 0 ? void 0 : inputFilePath.endsWith('.jsx')) || isReactEnabled);
    const isBlazeEnabled = isMeteorBlazeProject();
    const isBlazeHotEnabled = isMeteorBlazeHotProject();
    const isBundleVisualizerEnabled = isMeteorBundleVisualizerProject();
    const isProfile = isMeteorAppProfile();
    const swcExternalHelpers = checkNpmDependencyExists('@swc/helpers');
    const configPath = getConfigFilePath();
    const projectConfigPath = getCustomConfigFilePath();
    const pairs = [
        [
            "isDevelopment",
            isMeteorAppDevelopment()
        ],
        [
            "isProduction",
            isMeteorAppProduction()
        ],
        [
            "isDebug",
            isMeteorAppDebug()
        ],
        [
            "isVerbose",
            isMeteorAppConfigModernVerbose()
        ],
        ...isProfile && [
            [
                "isProfile",
                isMeteorAppProfile()
            ]
        ] || [],
        [
            "isTest",
            isTest
        ],
        ...isTestLike ? [
            [
                "isTestLike",
                isTestLike || isTest
            ]
        ] : [],
        ...isTestLike && isTestFullApp && [
            [
                "isTestFullApp",
                isTestFullApp
            ]
        ] || [],
        ...isTestLike && isTestModule && [
            [
                "isTestModule",
                isTestModule
            ]
        ] || [],
        ...isTestLike && isTestEager && [
            [
                "isTestEager",
                isTestEager
            ]
        ] || [],
        [
            "isRun",
            isMeteorAppRun()
        ],
        [
            "isBuild",
            isMeteorAppBuild()
        ],
        [
            "isNative",
            isMeteorAppNative()
        ],
        [
            "isClient",
            isClient
        ],
        [
            "isServer",
            isServer
        ],
        [
            "entryPath",
            getBuildFilePath(_object_spread_props(_object_spread({}, module, env, side), {
                isTestModule,
                role: FILE_ROLE.entry
            }))
        ],
        [
            "outputPath",
            getBuildFilePath(_object_spread_props(_object_spread({}, module, env, side), {
                isTestModule,
                role: FILE_ROLE.output
            }))
        ],
        [
            "outputFilename",
            getBuildFilePath(_object_spread_props(_object_spread({}, env, side), {
                isMain: true,
                role: FILE_ROLE.output,
                onlyFilename: true
            }))
        ],
        [
            "runPath",
            getBuildFilePath(_object_spread({}, module, env, side, commandRole))
        ],
        [
            "buildContext",
            RSPACK_BUILD_CONTEXT
        ],
        [
            "chunksContext",
            RSPACK_CHUNKS_CONTEXT
        ],
        [
            "assetsContext",
            RSPACK_ASSETS_CONTEXT
        ],
        [
            "devServerPort",
            process.env.RSPACK_DEVSERVER_PORT
        ],
        [
            "projectConfigPath",
            projectConfigPath
        ],
        [
            "configPath",
            configPath
        ],
        ...isTest && initialEntrypoints.testClient && initialEntrypoints.testServer && [
            [
                "testClientEntry",
                initialEntrypoints.testClient
            ],
            [
                "testServerEntry",
                initialEntrypoints.testServer
            ]
        ] || isTest && initialEntrypoints.testModule && [
            [
                "testEntry",
                initialEntrypoints.testModule
            ]
        ] || [
            [
                "mainClientEntry",
                initialEntrypoints.mainClient
            ],
            [
                "mainClientHtmlEntry",
                initialEntrypoints.mainClientHtml
            ],
            [
                "mainServerEntry",
                initialEntrypoints.mainServer
            ]
        ],
        ...swcExternalHelpers && [
            [
                "swcExternalHelpers",
                swcExternalHelpers
            ]
        ] || [],
        ...isReactEnabled && [
            [
                "isReactEnabled",
                isReactEnabled
            ]
        ] || [],
        ...isBlazeEnabled && [
            [
                "isBlazeEnabled",
                isBlazeEnabled
            ]
        ] || [],
        ...isBlazeHotEnabled && [
            [
                "isBlazeHotEnabled",
                isBlazeHotEnabled
            ]
        ] || [],
        ...isTypescriptEnabled && [
            [
                "isTypescriptEnabled",
                isTypescriptEnabled
            ]
        ] || [],
        ...isAngularEnabled && [
            [
                "isAngularEnabled",
                isAngularEnabled
            ]
        ] || [],
        ...isTsxEnabled && [
            [
                "isTsxEnabled",
                isTsxEnabled
            ]
        ] || [],
        ...isJsxEnabled && [
            [
                "isJsxEnabled",
                isJsxEnabled
            ]
        ] || [],
        ...isBundleVisualizerEnabled && [
            [
                "isBundleVisualizerEnabled",
                isBundleVisualizerEnabled
            ],
            [
                "rsdoctorClientPort",
                process.env.RSDOCTOR_CLIENT_PORT
            ],
            [
                "rsdoctorServerPort",
                process.env.RSDOCTOR_SERVER_PORT
            ]
        ] || []
    ].filter(Boolean);
    // Create environment variables object with bannerOutput
    const envs = {
        RSPACK_BANNER: JSON.stringify(getBuildFileContent(_object_spread_props(_object_spread({}, module, env, side), {
            role: FILE_ROLE.output
        })))
    };
    // Create params from pairs
    const params = pairs.flatMap(([key, val])=>[
            '--env',
            `${key}=${val}`
        ]);
    return {
        params,
        envs
    };
}
/**
 * Starts Rspack for client in serve mode
 * @param {Object} options - Options for client serve
 * @param {Function} options.onCompile - Callback function to be called when compilation is complete
 * @returns {Object} The client process object
 */ function startRspackClientServe(options = {}) {
    const { onCompile } = options;
    // Get the current client process from global state
    const clientProcess = getGlobalState(GLOBAL_STATE_KEYS.CLIENT_PROCESS, null);
    // Skip if client process is already running
    if (clientProcess && isProcessRunning(clientProcess)) {
        return clientProcess;
    }
    const appDir = getMeteorAppDir();
    const configFile = getConfigFilePath();
    const { params, envs } = getRspackEnv({
        isClient: true,
        isServer: false
    });
    const { command, args } = getNpxCommand([
        'rspack',
        'serve',
        '--config',
        configFile,
        ...params
    ]);
    const newClientProcess = spawnProcess(command, args, {
        cwd: appDir,
        env: inheritMeteorToolNodeFlags(_object_spread({}, process.env, getNodeBinEnv(), envs)),
        onStdout: (data)=>{
            const { cleanedData, config } = parseMeteorRspackOutput(data);
            if (config && !!(config === null || config === void 0 ? void 0 : config.devServerUrl)) {
                logHmrServerStarted(config);
            }
            if (onCompile && config && ((config === null || config === void 0 ? void 0 : config.compilationCount) || 0) > 0) {
                var _config_name;
                onCompile(cleanedData, config);
                if ((config === null || config === void 0 ? void 0 : (_config_name = config.name) === null || _config_name === void 0 ? void 0 : _config_name.includes("client")) && !(config === null || config === void 0 ? void 0 : config.hasErrors) && (config === null || config === void 0 ? void 0 : config.isRebuild)) {
                    var _getRunLog;
                    (_getRunLog = getRunLog()) === null || _getRunLog === void 0 ? void 0 : _getRunLog.logClientRestart();
                }
            }
            if (!cleanedData) return;
            if (shouldLogVerbose()) {
                logInfo(`[Rspack Client] ${cleanedData}`);
            } else {
                logCompilationOutput(cleanedData, 'client', config === null || config === void 0 ? void 0 : config.statsOverrided);
            }
        },
        onStderr: (data)=>{
            const { cleanedData } = parseMeteorRspackOutput(data);
            if (!cleanedData) return;
            // Check if this is an EADDRINUSE error in development mode (which we want to completely ignore)
            if (isMeteorAppDevelopment() && cleanedData.includes('EADDRINUSE')) {
                if (shouldLogVerbose()) {
                    logError(`[Rspack Client Error] ${cleanedData}`);
                } else {
                    logError(stripRspackLabel(cleanedData));
                }
                return;
            }
            // Check if this is actually an informational message (like webpack-dev-server messages)
            if (cleanedData.includes('Loopback:') || cleanedData.includes('Project is running at:')) {
                if (shouldLogVerbose()) {
                    logInfo(`[Rspack Client] ${cleanedData}`);
                } else {
                    logRaw(stripRspackLabel(cleanedData));
                }
            } else {
                // Check if this is the "npm error could not determine executable to run" error
                if (cleanedData.includes('npm error could not determine executable to run')) {
                    const errorMsg = '[Rspack Client Error] Try running "meteor npm install" to ensure rspack is available';
                    if (shouldLogVerbose()) {
                        logError(errorMsg);
                    } else {
                        logError('Try running "meteor npm install" to ensure rspack is available');
                    }
                    throw new Error(errorMsg);
                }
                if (shouldLogVerbose()) {
                    logError(`[Rspack Client Error] ${cleanedData}`);
                } else {
                    logError(stripRspackLabel(cleanedData));
                }
            }
        },
        onError: (err)=>{
            const errorMsg = `Rspack Error: ${err.message}`;
            if (shouldLogVerbose()) {
                logError(errorMsg);
            } else {
                logError(err.message);
            }
            throw new Error(errorMsg);
        }
    });
    // Store the new process in global state
    setGlobalState(GLOBAL_STATE_KEYS.CLIENT_PROCESS, newClientProcess);
    return newClientProcess;
}
/**
 * Starts Rspack for server in build --watch mode
 * @param {Object} options - Options for server watch
 * @param {Function} options.onCompile - Callback function to be called when compilation is complete
 * @returns {Object} The server process object
 */ function startRspackServerWatch(options = {}) {
    const { onCompile } = options;
    // Get the current server process from global state
    const serverProcess = getGlobalState(GLOBAL_STATE_KEYS.SERVER_PROCESS, null);
    // Skip if server process is already running
    if (serverProcess && isProcessRunning(serverProcess)) {
        return serverProcess;
    }
    const appDir = getMeteorAppDir();
    const configFile = getConfigFilePath();
    const { params, envs } = getRspackEnv({
        isClient: false,
        isServer: true
    });
    const { command, args } = getNpxCommand([
        'rspack',
        'build',
        '--watch',
        '--config',
        configFile,
        ...params
    ]);
    const newServerProcess = spawnProcess(command, args, {
        cwd: appDir,
        env: inheritMeteorToolNodeFlags(_object_spread({}, process.env, getNodeBinEnv(), envs)),
        onStdout: (data)=>{
            const { cleanedData, config } = parseMeteorRspackOutput(data);
            if (onCompile && config && ((config === null || config === void 0 ? void 0 : config.compilationCount) || 0) > 0) {
                onCompile(cleanedData, config);
            }
            if (!cleanedData) return;
            if (shouldLogVerbose()) {
                logInfo(`[Rspack Server] ${cleanedData}`);
            } else {
                logCompilationOutput(cleanedData, 'server', config === null || config === void 0 ? void 0 : config.statsOverrided);
            }
        },
        onStderr: (data)=>{
            const { cleanedData } = parseMeteorRspackOutput(data);
            if (!cleanedData) return;
            // Check if this is actually an informational message (like webpack-dev-server messages)
            if (cleanedData.includes('Project is running at:')) {
                if (shouldLogVerbose()) {
                    logInfo(`[Rspack Server] ${cleanedData}`);
                } else {
                    logRaw(stripRspackLabel(cleanedData));
                }
            } else {
                // Check if this is the "npm error could not determine executable to run" error
                if (cleanedData.includes('npm error could not determine executable to run')) {
                    const errorMsg = '[Rspack Server Error] Try running "meteor npm install" to ensure rspack is available';
                    if (shouldLogVerbose()) {
                        logError(errorMsg);
                    } else {
                        logError('Try running "meteor npm install" to ensure rspack is available');
                    }
                    throw new Error(errorMsg);
                }
                if (shouldLogVerbose()) {
                    logError(`[Rspack Server Error] ${cleanedData}`);
                } else {
                    logError(stripRspackLabel(cleanedData));
                }
            }
        },
        onError: (err)=>{
            const errorMsg = `Rspack Error: ${err.message}`;
            if (shouldLogVerbose()) {
                logError(errorMsg);
            } else {
                logError(err.message);
            }
            throw new Error(errorMsg);
        }
    });
    // Store the new process in global state
    setGlobalState(GLOBAL_STATE_KEYS.SERVER_PROCESS, newServerProcess);
    return newServerProcess;
}
/**
 * Runs Rspack build for both client and server without watch mode
 * @param {Object} options - Options for the build
 * @param {boolean} options.isClient - Whether this is a client build
 * @param {boolean} options.isServer - Whether this is a server build
 * @param {boolean} options.isTestModule - Whether this is a test module
 * @param {Function} options.onCompile - Callback function to be called when compilation is complete
 * @param {boolean} options.watch - Whether to run Rspack in watch mode
 * @returns {Promise<void>} A promise that resolves when the build is complete
 * @throws {Error} If the build process fails
 */ function runRspackBuild() {
    return _async_to_generator(function*({ isClient, isServer, isTest, isTestModule, isTestLike, onCompile, watch, label = 'Build' } = {}) {
        const appDir = getMeteorAppDir();
        const configFile = getConfigFilePath();
        const endpoint = isClient ? 'Client' : 'Server';
        // Use a promise to ensure Meteor waits until Rspack finishes
        return new Promise((resolve, reject)=>{
            const { params, envs } = getRspackEnv({
                isClient,
                isServer,
                isTest,
                isTestModule,
                isTestLike
            });
            const rspackArgs = [
                'rspack',
                'build',
                '--config',
                configFile,
                ...watch && [
                    '--watch'
                ] || [],
                ...params
            ].filter(Boolean);
            const { command, args } = getNpxCommand(rspackArgs);
            spawnProcess(command, args, {
                cwd: appDir,
                env: inheritMeteorToolNodeFlags(_object_spread({}, process.env, getNodeBinEnv(), envs)),
                onStdout: (data)=>{
                    const { cleanedData, config } = parseMeteorRspackOutput(data);
                    if (onCompile && config && ((config === null || config === void 0 ? void 0 : config.compilationCount) || 0) > 0) {
                        onCompile(cleanedData, config);
                    }
                    if (!cleanedData) return;
                    if (shouldLogVerbose()) {
                        logInfo(`[Rspack ${label} ${endpoint}] ${cleanedData}`);
                    } else {
                        logCompilationOutput(cleanedData, endpoint.toLowerCase(), config === null || config === void 0 ? void 0 : config.statsOverrided);
                    }
                },
                onStderr: (data)=>{
                    const { cleanedData } = parseMeteorRspackOutput(data);
                    if (!cleanedData) return;
                    // Check if this is actually an informational message (like webpack-dev-server messages)
                    if (cleanedData.includes('Project is running at:')) {
                        if (shouldLogVerbose()) {
                            logInfo(`[Rspack ${label} ${endpoint}] ${cleanedData}`);
                        } else {
                            logRaw(stripRspackLabel(cleanedData));
                        }
                    } else {
                        // Check if this is the "npm error could not determine executable to run" error
                        if (cleanedData.includes('npm error could not determine executable to run')) {
                            const errorMsg = `[Rspack ${label} Error ${endpoint}] Try running "meteor npm install" to ensure rspack is available`;
                            if (shouldLogVerbose()) {
                                logError(errorMsg);
                            } else {
                                logError(`Try running "meteor npm install" to ensure rspack is available`);
                            }
                            throw new Error(errorMsg);
                        }
                        if (shouldLogVerbose()) {
                            logError(`[Rspack ${label} Error ${endpoint}] ${cleanedData}`);
                        } else {
                            logError(stripRspackLabel(cleanedData));
                        }
                    }
                },
                onExit: (code)=>{
                    if (code === 0) {
                        resolve();
                    } else {
                        const error = new Error(`Rspack ${label} failed in ${endpoint} with exit code ${code}`);
                        if (shouldLogVerbose()) {
                            logError(error.message);
                        } else {
                            logError(`Rspack ${label} failed with exit code ${code}`);
                        }
                        reject(error);
                    }
                },
                onError: (err)=>{
                    if (shouldLogVerbose()) {
                        logError(`Rspack ${label} ${endpoint} error: ${err.message}`);
                    } else {
                        logError(err.message);
                    }
                    reject(err);
                }
            });
        });
    }).apply(this, arguments);
}
/**
 * Cleans up processes when the plugin is stopped
 * Stops any running client and server processes and clears their global state
 * @returns {void}
 */ function cleanup() {
    const clientProcess = getGlobalState(GLOBAL_STATE_KEYS.CLIENT_PROCESS, null);
    if (clientProcess) {
        stopProcess(clientProcess);
        setGlobalState(GLOBAL_STATE_KEYS.CLIENT_PROCESS, null);
    }
    const serverProcess = getGlobalState(GLOBAL_STATE_KEYS.SERVER_PROCESS, null);
    if (serverProcess) {
        stopProcess(serverProcess);
        setGlobalState(GLOBAL_STATE_KEYS.SERVER_PROCESS, null);
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"config.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/lib/config.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {module.export({configureMeteorForRspack:()=>configureMeteorForRspack,applyDelegatedExtensions:()=>applyDelegatedExtensions});let glob;module.link('glob',{glob(v){glob=v}},0);let path;module.link('path',{default(v){path=v}},1);let fs;module.link('fs',{default(v){fs=v}},2);let getInitialEntrypoints;module.link('./build-context',{getInitialEntrypoints(v){getInitialEntrypoints=v}},3);if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();function _define_property(obj, key, value) {
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
/**
 * @module config
 * @description Functions for configuring Meteor for Rspack
 */ 


const { logInfo } = require('meteor/tools-core/lib/log');
const { getMeteorAppFilesAndFolders, setMeteorAppIgnore, setMeteorAppEntrypoints, setMeteorAppCustomScriptUrl, isMeteorAppDevelopment, isMeteorAppRun, isMeteorAppBuild, isMeteorAppNative, isMeteorAppDebug, isMeteorAppTest, isMeteorAppTestFullApp, isMeteorAppConfigModernVerbose, isMeteorBlazeProject, isMeteorLessProject, isMeteorScssProject, getMeteorEnvPackageDirs, getMeteorAppConfig, getMeteorAppDir } = require('meteor/tools-core/lib/meteor');
const { buildUnignorePatterns } = require('meteor/tools-core/lib/ignore');

const { ensureModuleFilesExist, getBuildFilePath } = require('./build-context');
const { RSPACK_BUILD_CONTEXT, FILE_ROLE } = require('./constants');
/**
 * Checks if entries exist in .meteorignore file
 * @param {string[]} entries - Entries to check
 * @returns {Object} Results with entry keys and boolean values
 */ function checkMeteorIgnoreExactEntries(entries) {
    const meteorIgnorePath = path.join(getMeteorAppDir(), '.meteorignore');
    const results = {};
    // Initialize results object with false for each entry
    entries.forEach((entry)=>{
        results[entry] = false;
    });
    // Check if .meteorignore file exists
    if (!fs.existsSync(meteorIgnorePath)) {
        return results;
    }
    // Read the .meteorignore file
    try {
        const content = fs.readFileSync(meteorIgnorePath, 'utf8');
        const lines = content.split('\n');
        // Check each line against all entries
        lines.forEach((line)=>{
            // Skip empty lines and comments
            if (!line.trim() || line.trim().startsWith('#')) {
                return;
            }
            const trimmedLine = line.trim();
            // Check for exact matches
            entries.forEach((entry)=>{
                if (trimmedLine === entry) {
                    results[entry] = true;
                }
            });
        });
    } catch (error) {
    // If there's an error reading the file, return the initialized results
    }
    return results;
}
/**
 * Gets the list of file extensions to ignore based on project type
 * For Blaze projects, it excludes .html as used by Blaze
 * For Less projects, it excludes .less files
 * For SCSS projects, it excludes .scss files
 * @returns {string[]} Array of file extensions to ignore
 */ function getFileExtensionsToIgnore() {
    const isAnyCompilerProject = isMeteorBlazeProject() || isMeteorLessProject() || isMeteorScssProject();
    if (!isAnyCompilerProject) {
        return [];
    }
    const allFiles = glob.sync('**/*', {
        nodir: true,
        dot: true,
        ignore: [
            'node_modules/**',
            '.meteor/**'
        ]
    });
    const existingExts = Array.from(new Set(allFiles.map((f)=>path.extname(f).toLowerCase())));
    // Base extensions to ignore
    const baseExtensions = [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
        '.cjs',
        '.json'
    ];
    // Filter existing extensions based on project type
    let filteredExts = existingExts;
    // For Blaze projects, exclude .html files
    if (isMeteorBlazeProject()) {
        filteredExts = existingExts.filter((ext)=>ext !== '.html');
    }
    // Check for Less projects and exclude .less files
    if (isMeteorLessProject()) {
        filteredExts = filteredExts.filter((ext)=>ext !== '.less');
    }
    // Check for SCSS projects and exclude .scss files
    if (isMeteorScssProject()) {
        filteredExts = filteredExts.filter((ext)=>ext !== '.scss');
    }
    return Array.from(new Set([
        ...baseExtensions,
        ...filteredExts
    ])).filter((ext)=>ext !== '');
}
/**
 * Configures Meteor settings for Rspack
 * Sets up file ignores, entry points, and custom script URL
 * Creates necessary module files and writes content to them
 * @returns {void}
 */ function configureMeteorForRspack() {
    const meteorAppConfig = getMeteorAppConfig();
    const initialEntrypoints = getInitialEntrypoints();
    // Ignore node_modules to prevent Meteor from processing them
    const projectRootFilesAndFolders = getMeteorAppFilesAndFolders({
        recursive: false
    });
    const initialEntrypointContexts = [
        initialEntrypoints.mainClient,
        initialEntrypoints.mainServer
    ].filter(Boolean).map((entrypoint)=>path.dirname(entrypoint));
    const includedDirs = [
        'public',
        'private',
        '.meteor',
        RSPACK_BUILD_CONTEXT
    ];
    const ignoredDirs = projectRootFilesAndFolders.directories.filter((dir)=>!includedDirs.includes(dir));
    const envPackageDirs = getMeteorEnvPackageDirs().map((dir)=>{
        var _path_normalize_split_filter, _path_normalize_split, _path_normalize;
        return (_path_normalize = path.normalize(dir)) === null || _path_normalize === void 0 ? void 0 : (_path_normalize_split = _path_normalize.split(path.sep)) === null || _path_normalize_split === void 0 ? void 0 : (_path_normalize_split_filter = _path_normalize_split.filter(Boolean)) === null || _path_normalize_split_filter === void 0 ? void 0 : _path_normalize_split_filter[0];
    });
    let extraFoldersToIgnore = [
        ...ignoredDirs.filter((dir)=>![
                'public',
                'private',
                '.meteor',
                'packages',
                ...envPackageDirs,
                RSPACK_BUILD_CONTEXT
            ].includes(dir)).map((dir)=>`${dir}/**`)
    ];
    let extraFilesToIgnore = [];
    // Get extensions to ignore based on project type
    const extensionsToIgnore = getFileExtensionsToIgnore();
    // If we have extensions to ignore, apply them to the ignored directories
    if (extensionsToIgnore.length > 0) {
        extraFilesToIgnore = ignoredDirs.flatMap((dir)=>extensionsToIgnore.map((ext)=>`${dir}/**/*${ext}`));
        extraFoldersToIgnore = [];
    }
    // Skip CSS/HTML files in entrypoint contexts
    extraFilesToIgnore = [
        ...extraFilesToIgnore,
        ...initialEntrypointContexts.flatMap((entrypoint)=>{
            const cssPattern = `${entrypoint}/*.css`;
            const htmlPattern = `${entrypoint}/*.html`;
            const cssFiles = glob.sync(cssPattern);
            const htmlFiles = glob.sync(htmlPattern);
            const entriesToCheck = [
                cssPattern,
                htmlPattern,
                ...cssFiles,
                ...htmlFiles
            ];
            const entryResults = checkMeteorIgnoreExactEntries(entriesToCheck);
            const hasMatchingCssPattern = entryResults[cssPattern];
            const hasMatchingHtmlPattern = entryResults[htmlPattern];
            const hasAnyCssFileInMeteorIgnore = cssFiles.some((file)=>entryResults[file]);
            const hasAnyHtmlFileInMeteorIgnore = htmlFiles.some((file)=>entryResults[file]);
            const result = [];
            // Handle HTML files
            if (hasAnyHtmlFileInMeteorIgnore) {
                // Add individual HTML files that are not in meteorignore
                htmlFiles.forEach((file)=>{
                    if (!entryResults[file]) {
                        result.push(`!${file}`);
                    }
                });
            } else if (!hasMatchingHtmlPattern) {
                // Skip HTML pattern if not in meteorignore
                result.push(`!${htmlPattern}`);
            }
            // Handle CSS files
            if (hasAnyCssFileInMeteorIgnore) {
                // Add individual CSS files that are not in meteorignore
                cssFiles.forEach((file)=>{
                    if (!entryResults[file]) {
                        result.push(`!${file}`);
                    }
                });
            } else if (!hasMatchingCssPattern) {
                // Skip CSS pattern if not in meteorignore
                result.push(`!${cssPattern}`);
            }
            return result;
        })
    ];
    const testIgnorePath = `${RSPACK_BUILD_CONTEXT}/${path.dirname(getBuildFilePath({
        isTest: true
    }))}/**`;
    const otherMainIgnorePath = isMeteorAppDevelopment() && `${RSPACK_BUILD_CONTEXT}/${path.dirname(getBuildFilePath({
        isMain: true,
        isProduction: true
    }))}/**` || `${RSPACK_BUILD_CONTEXT}/${path.dirname(getBuildFilePath({
        isMain: true,
        isDevelopment: true
    }))}/**`;
    const foldersToIgnore = [
        ...isMeteorAppTest() && [
            otherMainIgnorePath
        ] || [
            testIgnorePath,
            otherMainIgnorePath
        ],
        'node_modules/**',
        ...extraFoldersToIgnore
    ].filter(Boolean);
    const rootFilesToIgnore = [
        ...projectRootFilesAndFolders.files.filter((file)=>![
                'package.json',
                '.meteorignore',
                'tsconfig.json',
                'postcss.config.js',
                'scss-config.json'
            ].includes(file))
    ];
    const filesToIgnore = [
        ...rootFilesToIgnore,
        ...extraFilesToIgnore
    ];
    const unignoredFilesAndFolders = buildUnignorePatterns((meteorAppConfig === null || meteorAppConfig === void 0 ? void 0 : meteorAppConfig.modules) || [], {
        skipLevel: 1
    });
    const meteorAppIgnores = `${foldersToIgnore.join(' ')} ${filesToIgnore.join(' ')} ${unignoredFilesAndFolders.join(' ')}`.trim();
    setMeteorAppIgnore(meteorAppIgnores);
    if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
        logInfo(`[i] Meteor app ignores: ${meteorAppIgnores}`);
    }
    const env = isMeteorAppDevelopment() ? {
        isDevelopment: true
    } : {
        isProduction: true
    };
    const commandRole = isMeteorAppRun() ? {
        role: FILE_ROLE.run
    } : isMeteorAppBuild() ? {
        role: FILE_ROLE.build
    } : {
        role: FILE_ROLE.run
    };
    const mainClientModule = getBuildFilePath(_object_spread_props(_object_spread({
        isMain: true
    }, env, commandRole), {
        isClient: true
    }));
    const mainServerModule = getBuildFilePath(_object_spread_props(_object_spread({
        isMain: true
    }, env, commandRole), {
        isServer: true
    }));
    const isTestEager = initialEntrypoints.testModule == null && initialEntrypoints.testClient == null && initialEntrypoints.testServer == null;
    const isTestModule = initialEntrypoints.testModule != null || isTestEager;
    const testClientModule = getBuildFilePath(_object_spread_props(_object_spread({
        isTest: true
    }, env, commandRole), {
        isTestModule,
        isClient: true
    }));
    const testServerModule = getBuildFilePath(_object_spread_props(_object_spread({
        isTest: true
    }, env, commandRole), {
        isTestModule,
        isServer: true
    }));
    let appEntrypoints = _object_spread({
        mainClient: `${RSPACK_BUILD_CONTEXT}/${mainClientModule}`,
        mainServer: `${RSPACK_BUILD_CONTEXT}/${mainServerModule}`
    }, isTestModule && {
        testClient: `${RSPACK_BUILD_CONTEXT}/${testClientModule}`,
        testServer: `${RSPACK_BUILD_CONTEXT}/${testServerModule}`
    } || {
        testClient: `${RSPACK_BUILD_CONTEXT}/${testClientModule}`,
        testServer: `${RSPACK_BUILD_CONTEXT}/${testServerModule}`
    });
    if (isMeteorAppTestFullApp()) {
        appEntrypoints = _object_spread_props(_object_spread({}, appEntrypoints), {
            mainClient: `${RSPACK_BUILD_CONTEXT}/${testClientModule}`,
            mainServer: `${RSPACK_BUILD_CONTEXT}/${testServerModule}`
        });
    }
    // Set entry points in environment variables if they exist
    setMeteorAppEntrypoints(appEntrypoints);
    if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
        logInfo(`[i] App entrypoints: ${JSON.stringify(appEntrypoints, null, 2)}`);
    }
    // Ensure module files exist
    ensureModuleFilesExist();
    // Write content to module files
    if (isMeteorAppRun() && isMeteorAppDevelopment() && !isMeteorAppNative()) {
        const customScriptUrl = `/__rspack__/${getBuildFilePath(_object_spread_props(_object_spread({}, env), {
            isMain: true,
            isClient: true,
            role: FILE_ROLE.output,
            onlyFilename: true
        }))}`;
        setMeteorAppCustomScriptUrl(customScriptUrl);
        if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
            logInfo(`[i] App custom script: ${customScriptUrl}`);
        }
    }
}
/**
 * Applies delegated extension ignore patterns for entry folder files.
 * Called after rspack's first compilation reports which extensions it handles.
 * Since Meteor awaits rspack compilation before scanning files, these patterns
 * are in place before Meteor processes any application files.
 *
 * Uses gitignore semantics: a later positive pattern (client/*.css) overrides
 * an earlier negation (!client/*.css) that was set in configureMeteorForRspack.
 *
 * @param {string[]} extensions - Array of extensions like ['.css', '.less']
 */ function applyDelegatedExtensions(extensions) {
    if (!extensions || extensions.length === 0) return;
    const initialEntrypoints = getInitialEntrypoints();
    const entrypointContexts = [
        initialEntrypoints.mainClient,
        initialEntrypoints.mainServer
    ].filter(Boolean).map((entrypoint)=>path.dirname(entrypoint));
    const ignorePatterns = [];
    for (const dir of entrypointContexts){
        for (const ext of extensions){
            // ext comes as '.css', glob needs '*.css'
            ignorePatterns.push(`${dir}/*${ext}`);
        }
    }
    if (ignorePatterns.length > 0) {
        // Re-append meteor.modules unignore patterns after the delegation ignores
        // so they take precedence (gitignore semantics: last match wins)
        const meteorAppConfig = getMeteorAppConfig();
        const unignoredFilesAndFolders = buildUnignorePatterns((meteorAppConfig === null || meteorAppConfig === void 0 ? void 0 : meteorAppConfig.modules) || [], {
            skipLevel: 1
        });
        setMeteorAppIgnore([
            ...ignorePatterns,
            ...unignoredFilesAndFolders
        ].join(' '));
        if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
            logInfo(`[i] Rspack delegated extensions: ${extensions.join(', ')} (ignored in entry folders)\n    ${process.env.METEOR_IGNORE}`);
        }
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: false });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"logging.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/rspack/lib/logging.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({shouldLogVerbose:()=>shouldLogVerbose,stripRspackLabel:()=>stripRspackLabel,parseMeteorRspackOutput:()=>parseMeteorRspackOutput,logHmrServerStarted:()=>logHmrServerStarted,logCompilationOutput:()=>logCompilationOutput});/**
 * @module logging
 * @description Functions for logging Rspack processes
 */

const { logRaw } = require("meteor/tools-core/lib/log");

const {
  isMeteorAppConfigModernVerbose,
  isMeteorAppProfile,
} = require("meteor/tools-core/lib/meteor");

/**
 * Checks if the logs should be verbose for Rspack processes.
 * @returns {boolean} True if profiling or verbose mode is enabled, false otherwise.
 */
function shouldLogVerbose() {
  return isMeteorAppProfile() || isMeteorAppConfigModernVerbose();
}

/**
 * Strips the leading label line (e.g. "[server-rspack]:\n") from Rspack output.
 * @param {string} output - The raw output from an Rspack process
 * @returns {string} The output without the leading label line, trimmed
 */
function stripRspackLabel(output) {
  return output.replace(/^\[.*?]:\s*\n/, "").trim();
}

/**
 * Parses and extracts [Meteor-Rspack]{}[/Meteor-Rspack] content from data.
 * Returns the cleaned data (without the tag content) and the parsed JSON config.
 * @param {string} data - The raw data that may contain Meteor-Rspack tags
 * @returns {{ cleanedData: string, config: Object|null }} Object with cleaned data and parsed config
 */
function parseMeteorRspackOutput(data) {
  const tagRegex = /\[Meteor-Rspack\](.*?)\[\/Meteor-Rspack\]/g;
  let config = null;
  let match;

  // Find all matches and parse the last one (in case of multiple)
  while ((match = tagRegex.exec(data)) !== null) {
    try {
      config = JSON.parse(match[1]);
    } catch (e) {
      // If JSON parsing fails, keep config as null
      config = null;
    }
  }

  // Remove all [Meteor-Rspack]...[/Meteor-Rspack] tags from the data
  const cleanedData = data.replace(tagRegex, "").trim();

  return { cleanedData, config };
}

const compilationCount = {};
let hmrServerLogged = false;

/**
 * Logs "=> Started Rspack HMR server at <devServerUrl>" if devServerUrl exists in config.
 * Only logs once per session.
 * @param {Object|null} config - The parsed config from MeteorRspackOutputPlugin
 */
function logHmrServerStarted(config) {
  if (hmrServerLogged) return;
  if (!config?.devServerUrl) return;
  hmrServerLogged = true;
  logRaw(`=> Started Rspack HMR server at ${config.devServerUrl}/`);
}

/**
 * Logs a friendly Meteor-style message with the raw Rspack output appended.
 * Strips the leading label and logs as:
 *   "=> Compiled your client app compiled successfully in 342 ms"
 * Adds a leading newline from the second compilation onwards per target.
 * @param {string} output - The raw stdout line from an Rspack process
 * @param {string} target - The build target label (e.g. "client", "server")
 * @param {boolean} statsOverrided - If true, skip cleaning and use \n separator
 */
function logCompilationOutput(output, target, statsOverrided = false) {
  let cleaned;
  let separator;
  // Logs original Rspack logging when stats overrided by user
  if (statsOverrided) {
    cleaned = stripRspackLabel(output);
    separator = "\n";
  } else {
    cleaned = stripRspackLabel(output)
      .replace(/^.*\[.*?]\s*/g, "")
      .trim()
      .replace(/\s*compiled\s*/g, "");
    separator = cleaned.includes("\n") ? ":\n" : " ";
    // Ignore successful logs on default Meteor-Rspack logging
    if (/\s*successfully\s*/g.test(cleaned)) return;
  }
  compilationCount[target] = (compilationCount[target] || 0) + 1;
  const prefix = compilationCount[target] > 1 ? "\n=>" : "=>";
  logRaw(`${prefix} Compiled Rspack ${target} app${separator}${cleaned}`);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"compilation.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/rspack/lib/compilation.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({setupCompilationTracking:()=>setupCompilationTracking,waitForFirstCompilation:()=>waitForFirstCompilation});/**
 * @module compilation-helpers
 * @description Helper functions for Rspack compilation tracking
 * 
 * This module provides utility functions for tracking Rspack compilations,
 * including setting up compilation tracking, waiting for first compilation,
 * and formatting time values.
 */

const {
  GLOBAL_STATE_KEYS
} = require('./constants');

const {
  getGlobalState,
  setGlobalState
} = require('meteor/tools-core/lib/global-state');

const { applyDelegatedExtensions } = require('./config');

// Helper function to format milliseconds with comma separators
function formatMilliseconds(ms) {
  return ms.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Sets up compilation tracking and callbacks
 * @returns {Object} Object containing compilation tracking state and callbacks
 */
function setupCompilationTracking() {
  // Initialize global state for first compilation tracking
  const clientFirstCompile = {
    resolved: false,
    resolve: null
  };
  const serverFirstCompile = {
    resolved: false,
    resolve: null
  };

  // Store in global state
  setGlobalState(GLOBAL_STATE_KEYS.CLIENT_FIRST_COMPILE, clientFirstCompile);
  setGlobalState(GLOBAL_STATE_KEYS.SERVER_FIRST_COMPILE, serverFirstCompile);

  // Create promises for first compilation of client and server
  const clientFirstCompilePromise = new Promise(resolve => {
    clientFirstCompile.resolve = resolve;
  });

  const serverFirstCompilePromise = new Promise(resolve => {
    serverFirstCompile.resolve = resolve;
  });

  // Create a shared state to track compilation times
  const compilationState = {
    clientMs: null,
    serverMs: null,
    timeoutId: null,
    initialCompilationOccurred: false,
    previousClientResolved: false,
    previousServerResolved: false,
    previousMaxTime: 0,
    // Base delay in milliseconds
    baseDelay: 100,
    // Calculate dynamic defer time based on previous maximum time
    calculateDeferTime: function() {
      // Use a fixed base delay plus a margin based on previous maximum time
      // The margin is 20% of the previous maximum time
      return this.baseDelay + this.previousMaxTime;
    },
    // Function to print the maximum time once compilations are complete
    printMaxTime: function() {
      const clientResolved = clientFirstCompile?.resolved || false;
      const serverResolved = serverFirstCompile?.resolved || false;

      // Check if this is the first time both client and server are resolved
      // but were previously not both resolved
      if (clientResolved && serverResolved && 
          !(this.previousClientResolved && this.previousServerResolved) && 
          !this.initialCompilationOccurred) {
        this.initialCompilationOccurred = true;
      }

      // Update previous resolved states for next call
      this.previousClientResolved = clientResolved;
      this.previousServerResolved = serverResolved;

      const shouldPrint = this.initialCompilationOccurred &&
        (this.clientMs !== null || this.serverMs !== null);

      // Clear any existing timeout
      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      // Handle cases where only one compilation runs
      if (shouldPrint) {
        // Use the available time or default to the other one
        const clientTime = this.clientMs !== null ? this.clientMs : 0;
        const serverTime = this.serverMs !== null ? this.serverMs : 0;

        // Calculate defer time based on previous maximum time
        const deferTime = this.calculateDeferTime();

        // Set a timeout to wait for both compilations to likely finish
        this.timeoutId = setTimeout(() => {
          const maxMs = Math.max(clientTime, serverTime);
          console.log(
            `| Total: ${formatMilliseconds(maxMs)} ms (Rspack ${
              this.initialCompilationOccurred ? 'Rebuild' : 'Build'
            } App)`
          );

          // Store the current maximum time for future defer time calculations
          this.previousMaxTime = Math.max(maxMs, this.previousMaxTime);

          // Reset the state for next compilation cycle
          clearTimeout(this.timeoutId);
          this.clientMs = null;
          this.serverMs = null;
          this.timeoutId = null;
        }, deferTime);
      }
    },
  };

  // Define separate onCompile callbacks for client and server
  const onCompileClient = (data, config) => {
    // Resolve the promise if it's the first compilation
    const clientState = getGlobalState(GLOBAL_STATE_KEYS.CLIENT_FIRST_COMPILE, clientFirstCompile);
    if (!clientState?.resolved) {
      // Apply delegated extensions before resolving (so they're set before Meteor scans)
      if (config?.delegatedExtensions?.length > 0) {
        applyDelegatedExtensions(config.delegatedExtensions);
      }

      clientState.resolved = true;
      clientState.resolve();
      setGlobalState(GLOBAL_STATE_KEYS.CLIENT_FIRST_COMPILE, clientState);
    }

    if (process.env.METEOR_PROFILE) {
      // Extract milliseconds from compilation message
      const msMatch = data.match(/in (\d+) ms/);
      if (msMatch && msMatch[1]) {
        // Store the client compilation time
        compilationState.clientMs = parseInt(msMatch[1], 10);
        // Try to print max time if both compilations are complete
        compilationState.printMaxTime();
      }
    }
  };

  const onCompileServer = (data) => {
    // Resolve the promise if it's the first compilation
    const serverState = getGlobalState(GLOBAL_STATE_KEYS.SERVER_FIRST_COMPILE, serverFirstCompile);
    if (!serverState?.resolved) {
      serverState.resolved = true;
      serverState.resolve();
      setGlobalState(GLOBAL_STATE_KEYS.SERVER_FIRST_COMPILE, serverState);
    }

    if (process.env.METEOR_PROFILE) {
      // Extract milliseconds from compilation message
      const msMatch = data.match(/in (\d+) ms/);
      if (msMatch && msMatch[1]) {
        // Store the server compilation time
        compilationState.serverMs = parseInt(msMatch[1], 10);
        // Try to print max time if both compilations are complete
        compilationState.printMaxTime();
      }
    }
  };

  return {
    clientFirstCompile,
    serverFirstCompile,
    clientFirstCompilePromise,
    serverFirstCompilePromise,
    onCompileClient,
    onCompileServer
  };
}

/**
 * Waits for first compilation to complete
 * @param {Object} clientFirstCompile - Client first compilation state
 * @param {Object} serverFirstCompile - Server first compilation state
 * @param {Promise} clientFirstCompilePromise - Promise for client first compilation
 * @param {Promise} serverFirstCompilePromise - Promise for server first compilation
 * @param {Object} options - Options for waiting
 * @param {string} options.target - Target to wait for: 'client', 'server', or 'both' (default)
 * @param {string} options.version - Specific version to wait for (optional)
 * @returns {Promise<void>} A promise that resolves when first compilation is complete
 */
async function waitForFirstCompilation(
  clientFirstCompile, 
  serverFirstCompile, 
  clientFirstCompilePromise, 
  serverFirstCompilePromise,
  options = { target: 'both' }
) {
  const clientState = getGlobalState(GLOBAL_STATE_KEYS.CLIENT_FIRST_COMPILE, clientFirstCompile);
  const serverState = getGlobalState(GLOBAL_STATE_KEYS.SERVER_FIRST_COMPILE, serverFirstCompile);

  // If compilation is already complete, return immediately
  if (process.env.RSPACK_FIRST_COMPILATION_COMPLETE) {
    return;
  }

  // Determine which compilation(s) to wait for based on target
  switch (options.target) {
    case 'client':
      if (!clientState?.resolved) {
        await clientFirstCompilePromise;
      }
      break;
    case 'server':
      if (!serverState?.resolved) {
        await serverFirstCompilePromise;
      }
      break;
    case 'both':
    default:
      if (!clientState?.resolved && !serverState?.resolved) {
        await Promise.all([clientFirstCompilePromise, serverFirstCompilePromise]);
      }
      break;
  }

  process.env.RSPACK_FIRST_COMPILATION_COMPLETE = true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"rspack_plugin.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rspack/rspack_plugin.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reifyAsyncResult__) {"use strict"; try {__reifyWaitForDeps__();/**
 * @module rspack_plugin
 * @description Rspack Plugin for Meteor
 *
 * This is the main entry point for the Rspack plugin. It orchestrates the integration
 * between Rspack and Meteor by:
 * 1. Ensuring Rspack and related dependencies are installed
 * 2. Setting up the build context directory
 * 3. Configuring Meteor settings for Rspack
 * 4. Starting Rspack processes based on the Meteor command (run or build)
 * 5. Handling cleanup when the plugin is stopped
 *
 * The plugin uses top-level await to ensure asynchronous operations complete
 * before Meteor continues execution.
 */ // Import modules from lib
const { GLOBAL_STATE_KEYS } = require('./lib/constants');
const { ensureRspackInstalled, checkReactInstalled, checkAngularInstalled, checkTypescriptInstalled, ensureRspackReactInstalled } = require('./lib/dependencies');
const { ensureRspackBuildContextExists, ensureRspackConfigExists, cleanBuildContextFiles } = require('./lib/build-context');
const { startRspackClientServe, startRspackServerWatch, runRspackBuild, cleanup, calculateDevServerPort, calculateRsdoctorClientPort, calculateRsdoctorServerPort, getConfigFilePath, getCustomConfigFilePath } = require('./lib/processes');
const { configureMeteorForRspack } = require('./lib/config');
const { setupCompilationTracking, waitForFirstCompilation } = require('./lib/compilation');
const { getGlobalState, setGlobalState } = require('meteor/tools-core/lib/global-state');
const { isMeteorAppRun, isMeteorAppBuild, isMeteorAppUpdate, getMeteorInitialAppEntrypoints, getMeteorAppEntrypoints, isMeteorAppTest, isMeteorAppTestWatch, isMeteorAppDevelopment, isMeteorAppProduction, isMeteorAppDebug, isMeteorAppConfigModernVerbose, isMeteorAppNative, isMeteorBundleVisualizerProject } = require('meteor/tools-core/lib/meteor');
const { logInfo, logError } = require('meteor/tools-core/lib/log');
const { getNpxCommand, getNpmCommand, getYarnCommand, isYarnProject } = require('meteor/tools-core/lib/npm');
const { hasMeteorAppConfigAutoInstallDeps } = require("../tools-core/lib/meteor");
// Get entry points from Meteor configuration
let initialEntrypoints;
if (isMeteorAppRun() || isMeteorAppBuild() || isMeteorAppTest() || isMeteorAppUpdate()) {
    initialEntrypoints = getMeteorInitialAppEntrypoints();
    // Check if mainClient and mainServer exist
    if (!(initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainServer)) {
        logError(`\n┌─────────────────────────────────────────────────`);
        logError(`│ ❌ Missing Required Entry Points`);
        logError(`└─────────────────────────────────────────────────`);
        logError(`Your project is missing the required entry points for Rspack.`);
        logError(`Please add the following to your package.json file:`);
        logError(`
{
  "meteor": {
    "mainModule": {
      "client": "client/main.js",
      "server": "server/main.js"
    }
  }
}
`);
        logError(`Make sure to replace the paths with your actual entry point files.`);
        throw new Error("Missing required entry points. Please add meteor.mainModule.client and meteor.mainModule.server in your package.json file.");
    }
    setGlobalState(GLOBAL_STATE_KEYS.INITIAL_ENTRYPONTS, getMeteorAppEntrypoints());
    let isYarnProj = process.env.YARN_ENABLED === 'true';
    // Main entry point - using top-level await
    try {
        // Check if the project is a Yarn project and store the result in environment variable if not already set
        if (process.env.YARN_ENABLED === undefined) {
            isYarnProj = isYarnProject();
            process.env.YARN_ENABLED = isYarnProj ? 'true' : 'false';
        }
        if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
            var _getNpxCommand, _getNpmCommand;
            logInfo(`[i] Meteor Npx prefix: ${(_getNpxCommand = getNpxCommand([])) === null || _getNpxCommand === void 0 ? void 0 : _getNpxCommand.prefix}`);
            logInfo(`[i] Meteor Npm prefix: ${(_getNpmCommand = getNpmCommand([])) === null || _getNpmCommand === void 0 ? void 0 : _getNpmCommand.prefix}`);
            if (isYarnProj) {
                var _getYarnCommand;
                logInfo(`[i] Meteor Yarn prefix: ${(_getYarnCommand = getYarnCommand([])) === null || _getYarnCommand === void 0 ? void 0 : _getYarnCommand.prefix}`);
            }
        }
        // Clean build context files only if they haven't been cleaned yet
        if (!getGlobalState(GLOBAL_STATE_KEYS.BUILD_CONTEXT_FILES_CLEANED)) {
            cleanBuildContextFiles();
            setGlobalState(GLOBAL_STATE_KEYS.BUILD_CONTEXT_FILES_CLEANED, true);
        }
        // Auto install deps (by default enabled)
        if (hasMeteorAppConfigAutoInstallDeps()) {
            // Ensure Rspack is installed
            await ensureRspackInstalled();
        }
        // Check if Rspack React is installed
        if (checkReactInstalled()) {
            // Auto install deps (by default enabled)
            if (hasMeteorAppConfigAutoInstallDeps()) {
                await ensureRspackReactInstalled();
            }
        }
    } catch (error) {
        logError(`Rspack plugin error: ${error.message}`);
        throw error;
    }
}
if (isMeteorAppRun() || isMeteorAppBuild() || isMeteorAppTest()) {
    try {
        // Check if Angular is installed
        checkAngularInstalled();
        // Check if TypeScript is installed
        checkTypescriptInstalled();
        // Ensure the Rspack build context directory exists
        ensureRspackBuildContextExists();
        // Ensure the rspack.config.js file exists at the project level
        ensureRspackConfigExists();
        // Configure Meteor settings for Rspack
        configureMeteorForRspack();
        // Set native mode flag so the server module can skip dev proxy setup
        if (isMeteorAppNative()) {
            process.env.RSPACK_NATIVE = 'true';
        }
        // Calculate and set the devServerPort at boot
        if (!process.env.RSPACK_DEVSERVER_PORT) {
            process.env.RSPACK_DEVSERVER_PORT = calculateDevServerPort();
            if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
                logInfo(`[i] Rspack DevServer Port: ${process.env.RSPACK_DEVSERVER_PORT}`);
            }
        }
        if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
            const configFile = getConfigFilePath();
            logInfo(`[i] Rspack default config: ${configFile}`);
            const projectConfigFile = getCustomConfigFilePath();
            logInfo(`[i] Rspack custom config: ${projectConfigFile}`);
        }
        // Calculate and set the Rsdoctor client and server ports at boot only if bundle visualizer is enabled
        if (isMeteorBundleVisualizerProject()) {
            if (!process.env.RSDOCTOR_CLIENT_PORT) {
                process.env.RSDOCTOR_CLIENT_PORT = calculateRsdoctorClientPort();
                if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
                    logInfo(`[i] Rsdoctor Client Port: ${process.env.RSDOCTOR_CLIENT_PORT}`);
                }
            }
            if (!process.env.RSDOCTOR_SERVER_PORT) {
                process.env.RSDOCTOR_SERVER_PORT = calculateRsdoctorServerPort();
                if (isMeteorAppDebug() || isMeteorAppConfigModernVerbose()) {
                    logInfo(`[i] Rsdoctor Server Port: ${process.env.RSDOCTOR_SERVER_PORT}`);
                }
            }
        }
        // Register cleanup handler
        process.on('exit', cleanup);
        process.on('SIGINT', ()=>{
            cleanup();
            process.exit();
        });
        // When running `meteor run` command
        if (isMeteorAppRun()) {
            // Setup compilation tracking and callbacks
            const { clientFirstCompile, serverFirstCompile, clientFirstCompilePromise, serverFirstCompilePromise, onCompileClient, onCompileServer } = setupCompilationTracking();
            // For 'run' command, start Rspack in appropriate modes with distinct callbacks
            if (isMeteorAppDevelopment() && !isMeteorAppNative()) {
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainClient) {
                    startRspackClientServe({
                        onCompile: onCompileClient
                    });
                }
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainServer) {
                    startRspackServerWatch({
                        onCompile: onCompileServer
                    });
                }
            } else if (isMeteorAppProduction() || isMeteorAppNative()) {
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainClient) {
                    runRspackBuild({
                        isClient: true,
                        isServer: false,
                        watch: true,
                        onCompile: onCompileClient
                    });
                }
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainServer) {
                    runRspackBuild({
                        isServer: true,
                        isClient: false,
                        watch: true,
                        onCompile: onCompileServer
                    });
                }
            }
            // Wait for first compilation to complete
            const waitTarget = (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainClient) && (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainServer) ? 'both' : 'server';
            await waitForFirstCompilation(clientFirstCompile, serverFirstCompile, clientFirstCompilePromise, serverFirstCompilePromise, {
                target: waitTarget
            });
        // When running `meteor test` command
        } else if (isMeteorAppTest()) {
            const initialEntrypoints = getMeteorInitialAppEntrypoints();
            // Setup compilation tracking and callbacks
            const { clientFirstCompile, serverFirstCompile, clientFirstCompilePromise, serverFirstCompilePromise, onCompileClient, onCompileServer } = setupCompilationTracking();
            // When testModule is specified for client or server, run Rspack considering those files
            if ((initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testClient) || (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testServer)) {
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testClient) {
                    runRspackBuild({
                        isTest: true,
                        isClient: true,
                        isServer: false,
                        watch: isMeteorAppTestWatch(),
                        onCompile: onCompileClient,
                        label: 'Test'
                    });
                }
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testServer) {
                    runRspackBuild({
                        isTest: true,
                        isClient: false,
                        isServer: true,
                        watch: isMeteorAppTestWatch(),
                        onCompile: onCompileServer,
                        label: 'Test'
                    });
                }
                // Wait for first compilation to complete
                const waitTarget = (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testClient) && (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testServer) ? 'both' : 'server';
                await waitForFirstCompilation(clientFirstCompile, serverFirstCompile, clientFirstCompilePromise, serverFirstCompilePromise, {
                    target: waitTarget
                });
            // When testModule is specified as a single file or not specified
            } else {
                if (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testModule) {
                    runRspackBuild({
                        isTest: true,
                        isTestModule: true,
                        isClient: true,
                        isServer: false,
                        watch: isMeteorAppTestWatch(),
                        onCompile: onCompileClient,
                        label: 'Test'
                    });
                }
                runRspackBuild({
                    isTest: true,
                    isTestModule: true,
                    isClient: false,
                    isServer: true,
                    watch: isMeteorAppTestWatch(),
                    onCompile: onCompileServer,
                    label: 'Test'
                });
                const waitTarget = (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.testModule) ? 'both' : 'server';
                await waitForFirstCompilation(clientFirstCompile, serverFirstCompile, clientFirstCompilePromise, serverFirstCompilePromise, {
                    target: waitTarget
                });
            }
        // When running `meteor build` command
        } else if (isMeteorAppBuild()) {
            // For 'build' command, run Rspack build without watch mode
            // Run client and server builds in parallel and wait for both to complete
            const targetsToBuild = [
                (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainClient) && runRspackBuild({
                    isClient: true,
                    isServer: false
                }),
                (initialEntrypoints === null || initialEntrypoints === void 0 ? void 0 : initialEntrypoints.mainServer) && runRspackBuild({
                    isServer: true,
                    isClient: false
                })
            ].filter(Boolean);
            await Promise.all(targetsToBuild);
        }
    } catch (error) {
        logError(`Rspack plugin error: ${error.message}`);
        throw error;
    }
}
//*/
__reifyAsyncResult__();} catch (_reifyError) { __reifyAsyncResult__(_reifyError); }}, { self: this, async: true });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/rspack/lib/constants.js",
    "/node_modules/meteor/rspack/lib/dependencies.js",
    "/node_modules/meteor/rspack/lib/build-context.js",
    "/node_modules/meteor/rspack/lib/processes.js",
    "/node_modules/meteor/rspack/lib/config.js",
    "/node_modules/meteor/rspack/rspack_plugin.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/rspack_plugin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcnNwYWNrL2xpYi9jb25zdGFudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JzcGFjay9saWIvZGVwZW5kZW5jaWVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9yc3BhY2svbGliL2J1aWxkLWNvbnRleHQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JzcGFjay9saWIvcHJvY2Vzc2VzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9yc3BhY2svbGliL2NvbmZpZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcnNwYWNrL3JzcGFja19wbHVnaW4uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwiREVGQVVMVF9SU1BBQ0tfVkVSU0lPTiIsIkRFRkFVTFRfTUVURU9SX1JTUEFDS19WRVJTSU9OIiwiREVGQVVMVF9NRVRFT1JfUlNQQUNLX1JFQUNUX0hNUl9WRVJTSU9OIiwiREVGQVVMVF9NRVRFT1JfUlNQQUNLX1JFQUNUX1JFRlJFU0hfVkVSU0lPTiIsIkRFRkFVTFRfTUVURU9SX1JTUEFDS19TV0NfTE9BREVSX1ZFUlNJT04iLCJERUZBVUxUX01FVEVPUl9SU1BBQ0tfU1dDX0hFTFBFUlNfVkVSU0lPTiIsIkRFRkFVTFRfUlNET0NUT1JfUlNQQUNLX1BMVUdJTl9WRVJTSU9OIiwiR0xPQkFMX1NUQVRFX0tFWVMiLCJDTElFTlRfUFJPQ0VTUyIsIlNFUlZFUl9QUk9DRVNTIiwiUlNQQUNLX0lOU1RBTExBVElPTl9DSEVDS0VEIiwiUlNQQUNLX1JFQUNUX0lOU1RBTExBVElPTl9DSEVDS0VEIiwiUlNQQUNLX0RPQ1RPUl9JTlNUQUxMQVRJT05fQ0hFQ0tFRCIsIlJFQUNUX0NIRUNLRUQiLCJUWVBFU0NSSVBUX0NIRUNLRUQiLCJBTkdVTEFSX0NIRUNLRUQiLCJJTklUSUFMX0VOVFJZUE9OVFMiLCJDTElFTlRfRklSU1RfQ09NUElMRSIsIlNFUlZFUl9GSVJTVF9DT01QSUxFIiwiQlVJTERfQ09OVEVYVF9GSUxFU19DTEVBTkVEIiwibWV0ZW9yQ29uZmlnIiwiZ2V0TWV0ZW9yQ29uZmlnIiwibWV0ZW9yTG9jYWxEaXJOYW1lIiwicHJvY2VzcyIsImVudiIsIk1FVEVPUl9MT0NBTF9ESVIiLCJwYXRoIiwiYmFzZW5hbWUiLCJyZXBsYWNlIiwiUlNQQUNLX0JVSUxEX0NPTlRFWFQiLCJidWlsZENvbnRleHQiLCJSU1BBQ0tfQVNTRVRTX0NPTlRFWFQiLCJhc3NldHNDb250ZXh0IiwiUlNQQUNLX0NIVU5LU19DT05URVhUIiwiY2h1bmtzQ29udGV4dCIsIlJTUEFDS19ET0NUT1JfQ09OVEVYVCIsIlJTUEFDS19IT1RfVVBEQVRFX1JFR0VYIiwiRklMRV9ST0xFIiwiYnVpbGQiLCJlbnRyeSIsInJ1biIsIm91dHB1dCIsImdldEdsb2JhbFN0YXRlIiwic2V0R2xvYmFsU3RhdGUiLCJyZXF1aXJlIiwibG9nUHJvZ3Jlc3MiLCJsb2dTdWNjZXNzIiwibG9nSW5mbyIsImxvZ0Vycm9yIiwiaXNNZXRlb3JBcHBVcGRhdGUiLCJnZXRNZXRlb3JBcHBEaXIiLCJjaGVja05wbURlcGVuZGVuY3lFeGlzdHMiLCJpbnN0YWxsTnBtRGVwZW5kZW5jeSIsImNoZWNrTnBtRGVwZW5kZW5jeVZlcnNpb24iLCJqb2luV2l0aEFuZCIsImVuc3VyZURlcGVuZGVuY2llc0luc3RhbGxlZCIsImRlcGVuZGVuY2llcyIsImdsb2JhbFN0YXRlS2V5IiwicGFja2FnZU5hbWUiLCJhcHBEaXIiLCJhbGxEZXBzVG9JbnN0YWxsIiwiZmlsdGVyIiwiZGVwIiwibmFtZSIsImN3ZCIsInZlcnNpb25SZXF1aXJlbWVudCIsInZlcnNpb24iLCJzZW12ZXJDb25kaXRpb24iLCJleGlzdGVuY2VPbmx5IiwiZGVwZW5kZW5jeVN0cmluZ3MiLCJtYXAiLCJsZW5ndGgiLCJkZXZEZXBzU3VjY2VzcyIsInJlZ3VsYXJEZXBzU3VjY2VzcyIsImRldkRlcHNTdHJpbmdzIiwicmVndWxhckRlcHNTdHJpbmdzIiwiZm9yRWFjaCIsImlzWWFyblByb2oiLCJZQVJOX0VOQUJMRUQiLCJkZXZEZXBzVG9JbnN0YWxsIiwiZGV2IiwieWFybiIsInJlZ3VsYXJEZXBzVG9JbnN0YWxsIiwic3VjY2VzcyIsImRldkluc3RhbGxDb21tYW5kIiwiam9pbiIsInRyaW0iLCJyZWd1bGFySW5zdGFsbENvbW1hbmQiLCJhbGxGYWlsZWREZXBzIiwicHVzaCIsIkVycm9yIiwiaW5zdGFsbENvbW1hbmQiLCJlbnN1cmVSc3BhY2tJbnN0YWxsZWQiLCJjaGVja1JlYWN0SW5zdGFsbGVkIiwiaXNSZWFjdEluc3RhbGxlZCIsIk1FVEVPUl9SRUFDVF9FTkFCTEVEIiwiZW5zdXJlUnNwYWNrUmVhY3RJbnN0YWxsZWQiLCJlbnN1cmVSc3BhY2tEb2N0b3JJbnN0YWxsZWQiLCJjaGVja1R5cGVzY3JpcHRJbnN0YWxsZWQiLCJpc1R5cGVzY3JpcHRJbnN0YWxsZWQiLCJNRVRFT1JfVFlQRVNDUklQVF9FTkFCTEVEIiwiY2hlY2tBbmd1bGFySW5zdGFsbGVkIiwiaXNBbmd1bGFySW5zdGFsbGVkIiwiTUVURU9SX0FOR1VMQVJfRU5BQkxFRCIsImZzIiwiZ2V0Q3VzdG9tQ29uZmlnRmlsZVBhdGgiLCJjYXBpdGFsaXplRmlyc3RMZXR0ZXIiLCJnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMiLCJpc01ldGVvckFwcERldmVsb3BtZW50IiwiaXNNZXRlb3JBcHBSdW4iLCJpc01ldGVvckFwcEJ1aWxkIiwiaXNNZXRlb3JCbGF6ZVByb2plY3QiLCJpc01ldGVvckFwcE5hdGl2ZSIsImlzTWV0ZW9yQXBwVGVzdEZ1bGxBcHAiLCJhZGRHaXRpZ25vcmVFbnRyaWVzIiwiQVVUT19HRU5FUkFURURfV0FSTklORyIsImdldEluaXRpYWxFbnRyeXBvaW50cyIsImV4aXN0aW5nRW50cnlwb2ludCIsImluaXRpYWxFbnRyeXBvaW50cyIsImhhc0luaXRpYWxFbnRyeXBvaW50cyIsIk9iamVjdCIsInZhbHVlcyIsImV2ZXJ5IiwidmFsdWUiLCJlbnN1cmVSc3BhY2tCdWlsZENvbnRleHRFeGlzdHMiLCJidWlsZENvbnRleHRQYXRoIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsInJlY3Vyc2l2ZSIsImVycm9yIiwibWVzc2FnZSIsImNvbW1vbkJ1aWxkRW50cmllcyIsImVuc3VyZU1vZHVsZUZpbGVzRXhpc3QiLCJpc0RldmVsb3BtZW50IiwiaXNQcm9kdWN0aW9uIiwiaXNOYXRpdmUiLCJjb21tYW5kUm9sZSIsInJvbGUiLCJtYWluQ2xpZW50RmlsZXMiLCJlbnRyeUZpbGUiLCJtYWluQ2xpZW50Iiwib3V0cHV0RmlsZSIsImdldEJ1aWxkRmlsZVBhdGgiLCJpc01haW4iLCJpc0NsaWVudCIsIm9ubHlGaWxlbmFtZSIsIm1haW5TZXJ2ZXJGaWxlcyIsIm1haW5TZXJ2ZXIiLCJpc1NlcnZlciIsImlzVGVzdEVhZ2VyIiwidGVzdE1vZHVsZSIsInRlc3RDbGllbnQiLCJ0ZXN0U2VydmVyIiwiaXNUZXN0TW9kdWxlIiwidGVzdENsaWVudEZpbGVzIiwiaXNUZXN0IiwibWFpbkVudHJ5RmlsZSIsInRlc3RTZXJ2ZXJGaWxlcyIsImlzVGVzdEZ1bGxBcHAiLCJtb2R1bGVGaWxlcyIsImdldEJ1aWxkRmlsZUNvbnRlbnQiLCJlbnRyaWVzIiwiZmlsZW5hbWUiLCJkZWZhdWx0Q29udGVudCIsImZpbGVQYXRoIiwiZGlyIiwiZGlybmFtZSIsImVyciIsImV4aXN0aW5nIiwicmVhZEZpbGVTeW5jIiwiaW5jbHVkZXMiLCJ3cml0ZUZpbGVTeW5jIiwiY29uZmlnIiwibW9kdWxlIiwic2lkZSIsImV4dGVuc2lvbiIsImVudlN1ZmZpeCIsImdldEJhbm5lciIsImVudkRpc3BsYXkiLCJzaWRlRGlzcGxheSIsInRlc3RUeXBlIiwiZ2V0SG1yQ29kZSIsImdldEltcG9ydENvbnRlbnQiLCJiYW5uZXIiLCJobXIiLCJpbXBvcnRDb250ZW50IiwiY2xlYW5CdWlsZENvbnRleHRGaWxlcyIsIm1haW5DbGllbnRQYXRoIiwibWFpblNlcnZlclBhdGgiLCJ0ZXN0TW9kdWxlUGF0aCIsInRlc3RDbGllbnRQYXRoIiwidGVzdFNlcnZlclBhdGgiLCJ1bmlxdWVEaXJQYXRocyIsIlNldCIsImRpclBhdGgiLCJybVN5bmMiLCJmb3JjZSIsInB1YmxpY0RpciIsInByaXZhdGVEaXIiLCJmaWxlcyIsInJlYWRkaXJTeW5jIiwiZmlsZSIsImNsaWVudFJzcGFja1BhdGgiLCJlbnN1cmVSc3BhY2tDb25maWdFeGlzdHMiLCJleGlzdGluZ0NvbmZpZ1BhdGgiLCJqc0NvbmZpZ1BhdGgiLCJjb25maWdUZW1wbGF0ZSIsInNwYXduUHJvY2VzcyIsInN0b3BQcm9jZXNzIiwiaXNQcm9jZXNzUnVubmluZyIsImxvZ1JhdyIsImdldFJ1bkxvZyIsImlzTWV0ZW9yQXBwVGVzdCIsImlzTWV0ZW9yQXBwUHJvZHVjdGlvbiIsImlzTWV0ZW9yQXBwRGVidWciLCJpc01ldGVvckJsYXplSG90UHJvamVjdCIsImlzTWV0ZW9yQXBwQ29uZmlnTW9kZXJuVmVyYm9zZSIsImlzTWV0ZW9yQnVuZGxlVmlzdWFsaXplclByb2plY3QiLCJnZXRNZXRlb3JBcHBQb3J0IiwiaW5oZXJpdE1ldGVvclRvb2xOb2RlRmxhZ3MiLCJnZXROcHhDb21tYW5kIiwiZ2V0Tm9kZUJpbkVudiIsImdldE1vbm9yZXBvUGF0aCIsImNhbGN1bGF0ZURldlNlcnZlclBvcnQiLCJwb3J0IiwiYmFzZVBvcnQiLCJkaWdpdFN1bSIsInNwbGl0IiwicmVkdWNlIiwic3VtIiwiZGlnaXQiLCJwYXJzZUludCIsImNhbGN1bGF0ZVJzZG9jdG9yQ2xpZW50UG9ydCIsImNhbGN1bGF0ZVJzZG9jdG9yU2VydmVyUG9ydCIsImJhc2VQYXRoIiwiY29uZmlnQmFzZVBhdGgiLCJqc1BhdGgiLCJ0c1BhdGgiLCJtanNQYXRoIiwiY2pzUGF0aCIsImdldENvbmZpZ0ZpbGVQYXRoIiwiZGVmYXVsdENvbmZpZ0Jhc2VQYXRoIiwiZGVmYXVsdENvbmZpZ1BhdGgiLCJtb25vcmVwb1BhdGgiLCJhbHRlcm5hdGl2ZUNvbmZpZ0Jhc2VQYXRoIiwiYWx0ZXJuYXRpdmVDb25maWdQYXRoIiwiaXNDSSIsIkNJIiwiR0lUSFVCX0FDVElPTlMiLCJKRU5LSU5TX1VSTCIsIlRFQU1DSVRZX1ZFUlNJT04iLCJDT0RFQlVJTERfQlVJTERfQVJOIiwiQlVJTERFUl9PVVRQVVQiLCJURl9CVUlMRCIsIktVQkVSTkVURVNfU0VSVklDRV9IT1NUIiwiZ2V0UnNwYWNrRW52IiwiaW5Jc1Rlc3QiLCJpc1Rlc3RMaWtlIiwiaW5Jc1Rlc3RMaWtlIiwiZW50cnlLZXkiLCJpbnB1dEZpbGVQYXRoIiwiaXNUeXBlc2NyaXB0RW5hYmxlZCIsImVuZHNXaXRoIiwiaXNSZWFjdEVuYWJsZWQiLCJpc0FuZ3VsYXJFbmFibGVkIiwiaXNUc3hFbmFibGVkIiwiaXNKc3hFbmFibGVkIiwiaXNCbGF6ZUVuYWJsZWQiLCJpc0JsYXplSG90RW5hYmxlZCIsImlzQnVuZGxlVmlzdWFsaXplckVuYWJsZWQiLCJpc1Byb2ZpbGUiLCJpc01ldGVvckFwcFByb2ZpbGUiLCJzd2NFeHRlcm5hbEhlbHBlcnMiLCJjb25maWdQYXRoIiwicHJvamVjdENvbmZpZ1BhdGgiLCJwYWlycyIsIlJTUEFDS19ERVZTRVJWRVJfUE9SVCIsIm1haW5DbGllbnRIdG1sIiwiUlNET0NUT1JfQ0xJRU5UX1BPUlQiLCJSU0RPQ1RPUl9TRVJWRVJfUE9SVCIsIkJvb2xlYW4iLCJlbnZzIiwiUlNQQUNLX0JBTk5FUiIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJhbXMiLCJmbGF0TWFwIiwia2V5IiwidmFsIiwic3RhcnRSc3BhY2tDbGllbnRTZXJ2ZSIsIm9wdGlvbnMiLCJvbkNvbXBpbGUiLCJjbGllbnRQcm9jZXNzIiwiY29uZmlnRmlsZSIsImNvbW1hbmQiLCJhcmdzIiwibmV3Q2xpZW50UHJvY2VzcyIsIm9uU3Rkb3V0IiwiZGF0YSIsImNsZWFuZWREYXRhIiwicGFyc2VNZXRlb3JSc3BhY2tPdXRwdXQiLCJkZXZTZXJ2ZXJVcmwiLCJsb2dIbXJTZXJ2ZXJTdGFydGVkIiwiY29tcGlsYXRpb25Db3VudCIsImhhc0Vycm9ycyIsImlzUmVidWlsZCIsImxvZ0NsaWVudFJlc3RhcnQiLCJzaG91bGRMb2dWZXJib3NlIiwibG9nQ29tcGlsYXRpb25PdXRwdXQiLCJzdGF0c092ZXJyaWRlZCIsIm9uU3RkZXJyIiwic3RyaXBSc3BhY2tMYWJlbCIsImVycm9yTXNnIiwib25FcnJvciIsInN0YXJ0UnNwYWNrU2VydmVyV2F0Y2giLCJzZXJ2ZXJQcm9jZXNzIiwibmV3U2VydmVyUHJvY2VzcyIsInJ1blJzcGFja0J1aWxkIiwid2F0Y2giLCJsYWJlbCIsImVuZHBvaW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyc3BhY2tBcmdzIiwidG9Mb3dlckNhc2UiLCJvbkV4aXQiLCJjb2RlIiwiY2xlYW51cCIsImdldE1ldGVvckFwcEZpbGVzQW5kRm9sZGVycyIsInNldE1ldGVvckFwcElnbm9yZSIsInNldE1ldGVvckFwcEVudHJ5cG9pbnRzIiwic2V0TWV0ZW9yQXBwQ3VzdG9tU2NyaXB0VXJsIiwiaXNNZXRlb3JMZXNzUHJvamVjdCIsImlzTWV0ZW9yU2Nzc1Byb2plY3QiLCJnZXRNZXRlb3JFbnZQYWNrYWdlRGlycyIsImdldE1ldGVvckFwcENvbmZpZyIsImJ1aWxkVW5pZ25vcmVQYXR0ZXJucyIsImNoZWNrTWV0ZW9ySWdub3JlRXhhY3RFbnRyaWVzIiwibWV0ZW9ySWdub3JlUGF0aCIsInJlc3VsdHMiLCJjb250ZW50IiwibGluZXMiLCJsaW5lIiwic3RhcnRzV2l0aCIsInRyaW1tZWRMaW5lIiwiZ2V0RmlsZUV4dGVuc2lvbnNUb0lnbm9yZSIsImlzQW55Q29tcGlsZXJQcm9qZWN0IiwiYWxsRmlsZXMiLCJnbG9iIiwic3luYyIsIm5vZGlyIiwiZG90IiwiaWdub3JlIiwiZXhpc3RpbmdFeHRzIiwiQXJyYXkiLCJmcm9tIiwiZiIsImV4dG5hbWUiLCJiYXNlRXh0ZW5zaW9ucyIsImZpbHRlcmVkRXh0cyIsImV4dCIsImNvbmZpZ3VyZU1ldGVvckZvclJzcGFjayIsIm1ldGVvckFwcENvbmZpZyIsInByb2plY3RSb290RmlsZXNBbmRGb2xkZXJzIiwiaW5pdGlhbEVudHJ5cG9pbnRDb250ZXh0cyIsImVudHJ5cG9pbnQiLCJpbmNsdWRlZERpcnMiLCJpZ25vcmVkRGlycyIsImRpcmVjdG9yaWVzIiwiZW52UGFja2FnZURpcnMiLCJub3JtYWxpemUiLCJzZXAiLCJleHRyYUZvbGRlcnNUb0lnbm9yZSIsImV4dHJhRmlsZXNUb0lnbm9yZSIsImV4dGVuc2lvbnNUb0lnbm9yZSIsImNzc1BhdHRlcm4iLCJodG1sUGF0dGVybiIsImNzc0ZpbGVzIiwiaHRtbEZpbGVzIiwiZW50cmllc1RvQ2hlY2siLCJlbnRyeVJlc3VsdHMiLCJoYXNNYXRjaGluZ0Nzc1BhdHRlcm4iLCJoYXNNYXRjaGluZ0h0bWxQYXR0ZXJuIiwiaGFzQW55Q3NzRmlsZUluTWV0ZW9ySWdub3JlIiwic29tZSIsImhhc0FueUh0bWxGaWxlSW5NZXRlb3JJZ25vcmUiLCJyZXN1bHQiLCJ0ZXN0SWdub3JlUGF0aCIsIm90aGVyTWFpbklnbm9yZVBhdGgiLCJmb2xkZXJzVG9JZ25vcmUiLCJyb290RmlsZXNUb0lnbm9yZSIsImZpbGVzVG9JZ25vcmUiLCJ1bmlnbm9yZWRGaWxlc0FuZEZvbGRlcnMiLCJtb2R1bGVzIiwic2tpcExldmVsIiwibWV0ZW9yQXBwSWdub3JlcyIsIm1haW5DbGllbnRNb2R1bGUiLCJtYWluU2VydmVyTW9kdWxlIiwidGVzdENsaWVudE1vZHVsZSIsInRlc3RTZXJ2ZXJNb2R1bGUiLCJhcHBFbnRyeXBvaW50cyIsImN1c3RvbVNjcmlwdFVybCIsImFwcGx5RGVsZWdhdGVkRXh0ZW5zaW9ucyIsImV4dGVuc2lvbnMiLCJlbnRyeXBvaW50Q29udGV4dHMiLCJpZ25vcmVQYXR0ZXJucyIsIk1FVEVPUl9JR05PUkUiLCJzZXR1cENvbXBpbGF0aW9uVHJhY2tpbmciLCJ3YWl0Rm9yRmlyc3RDb21waWxhdGlvbiIsImdldE1ldGVvckFwcEVudHJ5cG9pbnRzIiwiaXNNZXRlb3JBcHBUZXN0V2F0Y2giLCJnZXROcG1Db21tYW5kIiwiZ2V0WWFybkNvbW1hbmQiLCJpc1lhcm5Qcm9qZWN0IiwiaGFzTWV0ZW9yQXBwQ29uZmlnQXV0b0luc3RhbGxEZXBzIiwidW5kZWZpbmVkIiwicHJlZml4IiwiUlNQQUNLX05BVElWRSIsInByb2plY3RDb25maWdGaWxlIiwib24iLCJleGl0IiwiY2xpZW50Rmlyc3RDb21waWxlIiwic2VydmVyRmlyc3RDb21waWxlIiwiY2xpZW50Rmlyc3RDb21waWxlUHJvbWlzZSIsInNlcnZlckZpcnN0Q29tcGlsZVByb21pc2UiLCJvbkNvbXBpbGVDbGllbnQiLCJvbkNvbXBpbGVTZXJ2ZXIiLCJ3YWl0VGFyZ2V0IiwidGFyZ2V0IiwidGFyZ2V0c1RvQnVpbGQiLCJhbGwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFnRHFEQTtBQWhEckQ7OztDQUdDLEdBRXVCO0FBRXhCLE9BQU8sTUFBTUMseUJBQXlCLENBQVE7QUFFOUMsT0FBTyxNQUFNQyxnQ0FBZ0MsQ0FBUTtBQUVyRCxPQUFPLE1BQU1DLDBDQUEwQyxDQUFRO0FBRS9ELE9BQU8sTUFBTUMsOENBQThDLEVBQVM7QUFFcEUsT0FBTyxNQUFNQywyQ0FBMkMsQ0FBUTtBQUVoRSxPQUFPLE1BQU1DLDRDQUE0QyxFQUFTO0FBRWxFLE9BQU8sTUFBTUMseUNBQXlDLENBQVE7QUFFOUQ7Ozs7Ozs7Ozs7O0NBV0MsR0FDRCxPQUFPLE1BQU1DLGNBQW9CO0lBQy9CQyxnQkFBZ0I7SUFDaEJDLGdCQUFnQjtJQUNoQkMsNkJBQTZCO0lBQzdCQyxtQ0FBbUM7SUFDbkNDLG9DQUFvQztJQUNwQ0MsZUFBZTtJQUNmQyxvQkFBb0I7SUFDcEJDLGlCQUFpQjtJQUNqQkMsb0JBQW9CO0lBQ3BCQyxzQkFBc0I7SUFDdEJDLHNCQUFzQjtJQUN0QkMsNkJBQTZCO0FBQy9CLEVBQUU7QUFFRixNQUFNQyxlQUFlLE9BQU9yQixXQUFXLGVBQWNBLG9FQUFRc0IsZUFBZSxLQUFLO0FBRWpGLE1BQU1DLHFCQUFxQkMsUUFBUUMsR0FBRyxDQUFDQyxnQkFBZ0IsR0FDbkRDLEtBQUtDLFFBQVEs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RyxPQUFPO2dCQUNUO2dCQUVBLE1BQU02RyxhQUFhdFQsNEZBQW9CZ0MsVUFBVSxJQUFHLFNBQVM7Z0JBQzdELE1BQU1tUSx3QkFDSmEsb0JBQ0FDLG9CQUNBQywyQkFDQUMsMkJBQ0E7b0JBQUVJLFFBQVFEO2dCQUFXO1lBRXpCO1FBRUEsc0NBQXNDO1FBQ3hDLE9BQU8sSUFBSTlULG9CQUFvQjtZQUM3QiwyREFBMkQ7WUFDM0QseUVBQXlFO1lBQ3pFLE1BQU1nVSxpQkFBaUI7Z0JBQ3JCeFQsNEZBQW9Cc0IsVUFBVSxLQUM1QmlMLGVBQWU7b0JBQUU3SyxVQUFVO29CQUFNSSxVQUFVO2dCQUFNO2dCQUNuRDlCLDRGQUFvQjZCLFVBQVUsS0FDNUIwSyxlQUFlO29CQUFFekssVUFBVTtvQkFBTUosVUFBVTtnQkFBTTthQUNwRCxDQUFDbkYsTUFBTSxDQUFDMk47WUFDVCxNQUFNeUMsUUFBUThHLEdBQUcsQ0FBQ0Q7UUFDcEI7SUFDRixFQUFFLE9BQU83UyxPQUFPO1FBQ2RqRixTQUFTLENBQUMscUJBQXFCLEVBQUVpRixNQUFNQyxPQUFPLEVBQUU7UUFDaEQsTUFBTUQ7SUFDUjtBQUNGIiwiZmlsZSI6Ii9wYWNrYWdlcy9yc3BhY2tfcGx1Z2luLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbW9kdWxlIGNvbnN0YW50c1xuICogQGRlc2NyaXB0aW9uIENvbnN0YW50cyBhbmQgZ2xvYmFsIHN0YXRlIGtleXMgZm9yIFJzcGFjayBwbHVnaW5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUlNQQUNLX1ZFUlNJT04gPSAnMS43LjEnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NRVRFT1JfUlNQQUNLX1ZFUlNJT04gPSAnMi4wLjEnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NRVRFT1JfUlNQQUNLX1JFQUNUX0hNUl9WRVJTSU9OID0gJzEuNC4zJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUVURU9SX1JTUEFDS19SRUFDVF9SRUZSRVNIX1ZFUlNJT04gPSAnMC4xNy4wJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTUVURU9SX1JTUEFDS19TV0NfTE9BREVSX1ZFUlNJT04gPSAnMC4yLjYnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NRVRFT1JfUlNQQUNLX1NXQ19IRUxQRVJTX1ZFUlNJT04gPSAnMC41LjE3JztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUlNET0NUT1JfUlNQQUNLX1BMVUdJTl9WRVJTSU9OID0gJzEuNS43JztcblxuLyoqXG4gKiBHbG9iYWwgc3RhdGUga2V5cyB1c2VkIGZvciBzdG9yaW5nIGFuZCByZXRyaWV2aW5nIHN0YXRlIGFjcm9zcyB0aGUgYXBwbGljYXRpb25cbiAqIEBjb25zdGFudCB7T2JqZWN0fVxuICogQHByb3BlcnR5IHtzdHJpbmd9IENMSUVOVF9QUk9DRVNTIC0gS2V5IGZvciBzdG9yaW5nIHRoZSBjbGllbnQgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IFNFUlZFUl9QUk9DRVNTIC0gS2V5IGZvciBzdG9yaW5nIHRoZSBzZXJ2ZXIgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IFJTUEFDS19JTlNUQUxMQVRJT05fQ0hFQ0tFRCAtIEtleSBmb3IgdHJhY2tpbmcgaWYgUnNwYWNrIGluc3RhbGxhdGlvbiB3YXMgY2hlY2tlZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IElTX1JFQUNUX0VOQUJMRUQgLSBLZXkgZm9yIHRyYWNraW5nIGlmIFJlYWN0IGlzIGVuYWJsZWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBJTklUSUFMX0VOVFJZUE9OVFMgLSBLZXkgZm9yIHN0b3JpbmcgaW5pdGlhbCBlbnRyeXBvaW50c1xuICogQHByb3BlcnR5IHtzdHJpbmd9IENMSUVOVF9GSVJTVF9DT01QSUxFIC0gS2V5IGZvciB0cmFja2luZyBjbGllbnQgZmlyc3QgY29tcGlsYXRpb24gc3RhdGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBTRVJWRVJfRklSU1RfQ09NUElMRSAtIEtleSBmb3IgdHJhY2tpbmcgc2VydmVyIGZpcnN0IGNvbXBpbGF0aW9uIHN0YXRlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gQlVJTERfQ09OVEVYVF9GSUxFU19DTEVBTkVEIC0gS2V5IGZvciB0cmFja2luZyBpZiBidWlsZCBjb250ZXh0IGZpbGVzIGhhdmUgYmVlbiBjbGVhbmVkXG4gKi9cbmV4cG9ydCBjb25zdCBHTE9CQUxfU1RBVEVfS0VZUyA9IHtcbiAgQ0xJRU5UX1BST0NFU1M6ICdyc3BhY2suY2xpZW50UHJvY2VzcycsXG4gIFNFUlZFUl9QUk9DRVNTOiAncnNwYWNrLnNlcnZlclByb2Nlc3MnLFxuICBSU1BBQ0tfSU5TVEFMTEFUSU9OX0NIRUNLRUQ6ICdyc3BhY2sucnNwYWNrSW5zdGFsbGF0aW9uQ2hlY2tlZCcsXG4gIFJTUEFDS19SRUFDVF9JTlNUQUxMQVRJT05fQ0hFQ0tFRDogJ3JzcGFjay5yc3BhY2tSZWFjdEluc3RhbGxhdGlvbkNoZWNrZWQnLFxuICBSU1BBQ0tfRE9DVE9SX0lOU1RBTExBVElPTl9DSEVDS0VEOiAncnNwYWNrLnJzcGFja0RvY3Rvckluc3RhbGxhdGlvbkNoZWNrZWQnLFxuICBSRUFDVF9DSEVDS0VEOiAncnNwYWNrLnJlYWN0Q2hlY2tlZCcsXG4gIFRZUEVTQ1JJUFRfQ0hFQ0tFRDogJ3JzcGFjay50eXBlc2NyaXB0Q2hlY2tlZCcsXG4gIEFOR1VMQVJfQ0hFQ0tFRDogJ3JzcGFjay5hbmd1bGFyQ2hlY2tlZCcsXG4gIElOSVRJQUxfRU5UUllQT05UUzogJ21ldGVvci5pbml0aWFsRW50cnlwb2ludHMnLFxuICBDTElFTlRfRklSU1RfQ09NUElMRTogJ3JzcGFjay5jbGllbnRGaXJzdENvbXBpbGUnLFxuICBTRVJWRVJfRklSU1RfQ09NUElMRTogJ3JzcGFjay5zZXJ2ZXJGaXJzdENvbXBpbGUnLFxuICBCVUlMRF9DT05URVhUX0ZJTEVTX0NMRUFORUQ6ICdyc3BhY2suYnVpbGRDb250ZXh0RmlsZXNDbGVhbmVkJyxcbn07XG5cbmNvbnN0IG1ldGVvckNvbmZpZyA9IHR5cGVvZiBQbHVnaW4gIT09ICd1bmRlZmluZWQnID8gUGx1Z2luPy5nZXRNZXRlb3JDb25maWcoKSA6IG51bGw7XG5cbmNvbnN0IG1ldGVvckxvY2FsRGlyTmFtZSA9IHByb2Nlc3MuZW52Lk1FVEVPUl9MT0NBTF9ESVJcbiAgPyBwYXRoLmJhc2VuYW1lKHByb2Nlc3MuZW52Lk1FVEVPUl9MT0NBTF9ESVIucmVwbGFjZSgvXFxcXC9nLCAnLycpKVxuICA6ICcnO1xuXG4vKipcbiAqIERpcmVjdG9yeSBuYW1lIGZvciBSc3BhY2sgYnVpbGQgY29udGV4dFxuICogQ2FuIGJlIG92ZXJyaWRkZW4gd2l0aCBSU1BBQ0tfQlVJTERfQ09OVEVYVCBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICogQGNvbnN0YW50IHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBSU1BBQ0tfQlVJTERfQ09OVEVYVCA9XG4gIG1ldGVvckNvbmZpZz8uYnVpbGRDb250ZXh0IHx8XG4gIHByb2Nlc3MuZW52LlJTUEFDS19CVUlMRF9DT05URVhUIHx8XG4gIGBfYnVpbGQkeyhtZXRlb3JMb2NhbERpck5hbWUgJiYgYC0ke21ldGVvckxvY2FsRGlyTmFtZX1gKSB8fCAnJ31gO1xuXG5wcm9jZXNzLmVudi5SU1BBQ0tfQlVJTERfQ09OVEVYVCA9IFJTUEFDS19CVUlMRF9DT05URVhUO1xuXG4vKipcbiAqIERpcmVjdG9yeSBuYW1lIGZvciBSc3BhY2sgYXNzZXRzIGNvbnRleHRcbiAqIENhbiBiZSBvdmVycmlkZGVuIHdpdGggUlNQQUNLX0FTU0VUU19DT05URVhUIGVudmlyb25tZW50IHZhcmlhYmxlXG4gKiBAY29uc3RhbnQge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFJTUEFDS19BU1NFVFNfQ09OVEVYVCA9XG4gIG1ldGVvckNvbmZpZz8uYXNzZXRzQ29udGV4dCB8fFxuICBwcm9jZXNzLmVudi5SU1BBQ0tfQVNTRVRTX0NPTlRFWFQgfHxcbiAgYGJ1aWxkLWFzc2V0cyR7KG1ldGVvckxvY2FsRGlyTmFtZSAmJiBgLSR7bWV0ZW9yTG9jYWxEaXJOYW1lfWApIHx8ICcnfWA7XG5cbnByb2Nlc3MuZW52LlJTUEFDS19BU1NFVFNfQ09OVEVYVCA9IFJTUEFDS19BU1NFVFNfQ09OVEVYVDtcblxuLyoqXG4gKiBEaXJlY3RvcnkgbmFtZSBmb3IgUnNwYWNrIGJ1bmRsZXMgY29udGV4dFxuICogQ2FuIGJlIG92ZXJyaWRkZW4gd2l0aCBSU1BBQ0tfQVNTRVRTX0NPTlRFWFQgZW52aXJvbm1lbnQgdmFyaWFibGVcbiAqIEBjb25zdGFudCB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgUlNQQUNLX0NIVU5LU19DT05URVhUID1cbiAgbWV0ZW9yQ29uZmlnPy5jaHVua3NDb250ZXh0IHx8XG4gIHByb2Nlc3MuZW52LlJTUEFDS19DSFVOS1NfQ09OVEVYVCB8fFxuICBgYnVpbGQtY2h1bmtzJHsobWV0ZW9yTG9jYWxEaXJOYW1lICYmIGAtJHttZXRlb3JMb2NhbERpck5hbWV9YCkgfHwgJyd9YDtcblxucHJvY2Vzcy5lbnYuUlNQQUNLX0NIVU5LU19DT05URVhUID0gUlNQQUNLX0NIVU5LU19DT05URVhUO1xuXG4vKipcbiAqIERpcmVjdG9yeSBuYW1lIGZvciBSc3BhY2sgZG9jdG9yIGNvbnRleHRcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBSU1BBQ0tfRE9DVE9SX0NPTlRFWFQgPSAnLnJzZG9jdG9yJztcblxuLyoqXG4gKiBSZWdleCBwYXR0ZXJuIGZvciBob3QgdXBkYXRlIGZpbGVzXG4gKiBAY29uc3RhbnQge1JlZ0V4cH1cbiAqL1xuZXhwb3J0IGNvbnN0IFJTUEFDS19IT1RfVVBEQVRFX1JFR0VYID0gL15cXC8oLitcXC5ob3QtdXBkYXRlXFwuKD86anNvbnxqcykpJC87XG5cbmV4cG9ydCBjb25zdCBGSUxFX1JPTEUgPSB7XG4gIGJ1aWxkOiAnYnVpbGQnLFxuICBlbnRyeTogJ2VudHJ5JyxcbiAgcnVuOiAncnVuJyxcbiAgb3V0cHV0OiAnb3V0cHV0Jyxcbn07XG4iLCIvKipcbiAqIEBtb2R1bGUgZGVwZW5kZW5jaWVzXG4gKiBAZGVzY3JpcHRpb24gRnVuY3Rpb25zIGZvciBtYW5hZ2luZyBkZXBlbmRlbmNpZXMgZm9yIFJzcGFjayBwbHVnaW5cbiAqL1xuaW1wb3J0IHsgXG4gIERFRkFVTFRfTUVURU9SX1JTUEFDS19SRUFDVF9SRUZSRVNIX1ZFUlNJT04sIFxuICBERUZBVUxUX01FVEVPUl9SU1BBQ0tfU1dDX0hFTFBFUlNfVkVSU0lPTixcbiAgREVGQVVMVF9SU0RPQ1RPUl9SU1BBQ0tfUExVR0lOX1ZFUlNJT05cbn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmNvbnN0IHtcbiAgZ2V0R2xvYmFsU3RhdGUsXG4gIHNldEdsb2JhbFN0YXRlLFxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9nbG9iYWwtc3RhdGUnKTtcbmNvbnN0IHtcbiAgbG9nUHJvZ3Jlc3MsXG4gIGxvZ1N1Y2Nlc3MsXG4gIGxvZ0luZm8sXG4gIGxvZ0Vycm9yLFxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9sb2cnKTtcbmNvbnN0IHtcbiAgaXNNZXRlb3JBcHBVcGRhdGUsXG4gIGdldE1ldGVvckFwcERpcixcbn0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvbWV0ZW9yJyk7XG5jb25zdCB7XG4gIGNoZWNrTnBtRGVwZW5kZW5jeUV4aXN0cyxcbiAgaW5zdGFsbE5wbURlcGVuZGVuY3ksXG4gIGNoZWNrTnBtRGVwZW5kZW5jeVZlcnNpb24sXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL25wbScpO1xuY29uc3Qge1xuICBqb2luV2l0aEFuZCxcbn0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvc3RyaW5nJyk7XG5cbmNvbnN0IHtcbiAgREVGQVVMVF9SU1BBQ0tfVkVSU0lPTixcbiAgREVGQVVMVF9NRVRFT1JfUlNQQUNLX1ZFUlNJT04sXG4gIERFRkFVTFRfTUVURU9SX1JTUEFDS19SRUFDVF9ITVJfVkVSU0lPTixcbiAgR0xPQkFMX1NUQVRFX0tFWVMsXG59ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxuLyoqXG4gKiBHZW5lcmljIGZ1bmN0aW9uIHRvIGVuc3VyZSBkZXBlbmRlbmNpZXMgYXJlIGluc3RhbGxlZCB3aXRoIGNvcnJlY3QgdmVyc2lvbnNcbiAqIEBwYXJhbSB7T2JqZWN0W119IGRlcGVuZGVuY2llcyAtIEFycmF5IG9mIGRlcGVuZGVuY3kgb2JqZWN0cyB3aXRoIG5hbWUsIHZlcnNpb24sIGFuZCBzZW12ZXJDb25kaXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBnbG9iYWxTdGF0ZUtleSAtIEdsb2JhbCBzdGF0ZSBrZXkgdG8gdHJhY2sgaWYgY2hlY2sgaGFzIGJlZW4gZG9uZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhY2thZ2VOYW1lIC0gTmFtZSBvZiB0aGUgcGFja2FnZSBmb3IgbG9nZ2luZyBwdXJwb3Nlc1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGNoZWNrL2luc3RhbGxhdGlvbiBpcyBjb21wbGV0ZVxuICogQHRocm93cyB7RXJyb3J9IElmIGluc3RhbGxhdGlvbiBmYWlsc1xuICovXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVEZXBlbmRlbmNpZXNJbnN0YWxsZWQoZGVwZW5kZW5jaWVzLCBnbG9iYWxTdGF0ZUtleSwgcGFja2FnZU5hbWUpIHtcbiAgLy8gU2tpcCBpZiBhbHJlYWR5IGNoZWNrZWRcbiAgaWYgKGdldEdsb2JhbFN0YXRlKGdsb2JhbFN0YXRlS2V5LCBmYWxzZSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBhcHBEaXIgPSBnZXRNZXRlb3JBcHBEaXIoKTtcblxuICAvLyBGaWx0ZXIgZGVwZW5kZW5jaWVzIHRoYXQgbmVlZCB0byBiZSBpbnN0YWxsZWQgKG1pc3Npbmcgb3Igd3JvbmcgdmVyc2lvbilcbiAgY29uc3QgYWxsRGVwc1RvSW5zdGFsbCA9IGRlcGVuZGVuY2llcy5maWx0ZXIoZGVwID0+XG4gICAgIWNoZWNrTnBtRGVwZW5kZW5jeUV4aXN0cyhkZXAubmFtZSwgeyBjd2Q6IGFwcERpciB9KSB8fFxuICAgICFjaGVja05wbURlcGVuZGVuY3lWZXJzaW9uKGRlcC5uYW1lLCB7XG4gICAgICBjd2Q6IGFwcERpcixcbiAgICAgIHZlcnNpb25SZXF1aXJlbWVudDogZGVwLnZlcnNpb24sXG4gICAgICBzZW12ZXJDb25kaXRpb246IGRlcC5zZW12ZXJDb25kaXRpb24gfHwgJ2d0ZScsXG4gICAgICBleGlzdGVuY2VPbmx5OiBkZXAuZXhpc3RlbmNlT25seSxcbiAgICB9KVxuICApO1xuXG4gIC8vIEZvcm1hdCBkZXBlbmRlbmNpZXMgZm9yIGluc3RhbGxhdGlvblxuICBjb25zdCBkZXBlbmRlbmN5U3RyaW5ncyA9IGFsbERlcHNUb0luc3RhbGwubWFwKGRlcCA9PiBgJHtkZXAubmFtZX1AJHtkZXAudmVyc2lvbn1gKTtcblxuICBpZiAoYWxsRGVwc1RvSW5zdGFsbC5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGRldkRlcHNTdWNjZXNzID0gdHJ1ZTtcbiAgICBsZXQgcmVndWxhckRlcHNTdWNjZXNzID0gdHJ1ZTtcbiAgICBsZXQgZGV2RGVwc1N0cmluZ3MgPSBbXTtcbiAgICBsZXQgcmVndWxhckRlcHNTdHJpbmdzID0gW107XG5cbiAgICAvLyBEaXNwbGF5IGEgaGVhZGVyIGZvciB0aGUgaW5zdGFsbGF0aW9uIHByb2Nlc3NcbiAgICBsb2dQcm9ncmVzcyhgPT4g8J+TpiAke3BhY2thZ2VOYW1lfSBEZXBlbmRlbmNpZXNgKTtcblxuICAgIC8vIFNob3cgd2hhdCBkZXBlbmRlbmNpZXMgd2lsbCBiZSBpbnN0YWxsZWRcbiAgICBkZXBlbmRlbmN5U3RyaW5ncy5mb3JFYWNoKGRlcCA9PiB7XG4gICAgICBsb2dJbmZvKGAgICDigKIgJHtkZXB9YCk7XG4gICAgfSk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgWWFybiBwcm9qZWN0XG4gICAgY29uc3QgaXNZYXJuUHJvaiA9IHByb2Nlc3MuZW52LllBUk5fRU5BQkxFRCA9PT0gJ3RydWUnO1xuXG4gICAgLy8gSW5zdGFsbCBkZXYgZGVwZW5kZW5jaWVzXG4gICAgY29uc3QgZGV2RGVwc1RvSW5zdGFsbCA9IGFsbERlcHNUb0luc3RhbGwuZmlsdGVyKGRlcCA9PiBkZXAuZGV2ID09PSB0cnVlIHx8IGRlcC5kZXYgPT0gbnVsbCk7XG4gICAgaWYgKGRldkRlcHNUb0luc3RhbGwubGVuZ3RoID4gMCkge1xuICAgICAgZGV2RGVwc1N0cmluZ3MgPSBkZXZEZXBzVG9JbnN0YWxsLm1hcChkZXAgPT4gYCR7ZGVwLm5hbWV9QCR7ZGVwLnZlcnNpb259YCk7XG5cbiAgICAgIC8vIExvZyBwcm9ncmVzcyBmb3IgZGV2IGRlcGVuZGVuY2llc1xuICAgICAgbG9nUHJvZ3Jlc3MoXG4gICAgICAgIGA9PiDwn5SnIEluc3RhbGxpbmcgJHtkZXZEZXBzVG9JbnN0YWxsLmxlbmd0aH0gZGV2IGRlcGVuZGVuYyR7XG4gICAgICAgICAgZGV2RGVwc1RvSW5zdGFsbC5sZW5ndGggPT09IDEgPyBcInlcIiA6IFwiaWVzXCJcbiAgICAgICAgfS4uLmBcbiAgICAgICk7XG5cbiAgICAgIGRldkRlcHNTdWNjZXNzID0gYXdhaXQgaW5zdGFsbE5wbURlcGVuZGVuY3koZGV2RGVwc1N0cmluZ3MsIHtcbiAgICAgICAgY3dkOiBhcHBEaXIsXG4gICAgICAgIGRldjogdHJ1ZSxcbiAgICAgICAgeWFybjogaXNZYXJuUHJvaixcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEluc3RhbGwgcmVndWxhciBkZXBlbmRlbmNpZXNcbiAgICBjb25zdCByZWd1bGFyRGVwc1RvSW5zdGFsbCA9IGFsbERlcHNUb0luc3RhbGwuZmlsdGVyKGRlcCA9PiBkZXAuZGV2ID09PSBmYWxzZSk7XG4gICAgaWYgKHJlZ3VsYXJEZXBzVG9JbnN0YWxsLmxlbmd0aCA+IDApIHtcbiAgICAgIHJlZ3VsYXJEZXBzU3RyaW5ncyA9IHJlZ3VsYXJEZXBzVG9JbnN0YWxsLm1hcChkZXAgPT4gYCR7ZGVwLm5hbWV9QCR7ZGVwLnZlcnNpb259YCk7XG5cbiAgICAgIC8vIExvZyBwcm9ncmVzcyBmb3IgcmVndWxhciBkZXBlbmRlbmNpZXNcbiAgICAgIGxvZ1Byb2dyZXNzKFxuICAgICAgICBgPT4g8J+UpyBJbnN0YWxsaW5nICR7cmVndWxhckRlcHNUb0luc3RhbGwubGVuZ3RofSBkZXBlbmRlbmMke1xuICAgICAgICAgIHJlZ3VsYXJEZXBzVG9JbnN0YWxsLmxlbmd0aCA9PT0gMSA/IFwieVwiIDogXCJpZXNcIlxuICAgICAgICB9Li4uYFxuICAgICAgKTtcblxuICAgICAgcmVndWxhckRlcHNTdWNjZXNzID0gYXdhaXQgaW5zdGFsbE5wbURlcGVuZGVuY3kocmVndWxhckRlcHNTdHJpbmdzLCB7XG4gICAgICAgIGN3ZDogYXBwRGlyLFxuICAgICAgICBkZXY6IGZhbHNlLFxuICAgICAgICB5YXJuOiBpc1lhcm5Qcm9qLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3VjY2VzcyA9IGRldkRlcHNTdWNjZXNzICYmIHJlZ3VsYXJEZXBzU3VjY2VzcztcblxuICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgY29uc3QgaXNZYXJuUHJvaiA9IHByb2Nlc3MuZW52LllBUk5fRU5BQkxFRCA9PT0gJ3RydWUnO1xuXG4gICAgICBsb2dFcnJvcihgPT4g4p2MIEZhaWxlZCB0byBpbnN0YWxsICR7cGFja2FnZU5hbWV9YCk7XG5cbiAgICAgIGlmICghZGV2RGVwc1N1Y2Nlc3MgJiYgZGV2RGVwc1N0cmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBkZXZJbnN0YWxsQ29tbWFuZCA9IGlzWWFyblByb2ogXG4gICAgICAgICAgPyBgeWFybiBhZGQgLS1kZXYgJHtkZXZEZXBzU3RyaW5ncy5qb2luKCcgJykudHJpbSgpfWBcbiAgICAgICAgICA6IGBtZXRlb3IgbnBtIGluc3RhbGwgLUQgJHtkZXZEZXBzU3RyaW5ncy5qb2luKCcgJykudHJpbSgpfWA7XG4gICAgICAgIGxvZ0Vycm9yKGAgICBGb3IgZGV2IGRlcGVuZGVuY2llcywgcnVuOiAke2Rldkluc3RhbGxDb21tYW5kfWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJlZ3VsYXJEZXBzU3VjY2VzcyAmJiByZWd1bGFyRGVwc1N0cmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCByZWd1bGFySW5zdGFsbENvbW1hbmQgPSBpc1lhcm5Qcm9qIFxuICAgICAgICAgID8gYHlhcm4gYWRkICR7cmVndWxhckRlcHNTdHJpbmdzLmpvaW4oJyAnKS50cmltKCl9YFxuICAgICAgICAgIDogYG1ldGVvciBucG0gaW5zdGFsbCAke3JlZ3VsYXJEZXBzU3RyaW5ncy5qb2luKCcgJykudHJpbSgpfWA7XG4gICAgICAgIGxvZ0Vycm9yKGAgICBGb3IgcmVndWxhciBkZXBlbmRlbmNpZXMsIHJ1bjogJHtyZWd1bGFySW5zdGFsbENvbW1hbmR9YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFsbEZhaWxlZERlcHMgPSBbXTtcbiAgICAgIGlmICghZGV2RGVwc1N1Y2Nlc3MpIGFsbEZhaWxlZERlcHMucHVzaCgnZGV2IGRlcGVuZGVuY2llcycpO1xuICAgICAgaWYgKCFyZWd1bGFyRGVwc1N1Y2Nlc3MpIGFsbEZhaWxlZERlcHMucHVzaCgncmVndWxhciBkZXBlbmRlbmNpZXMnKTtcblxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIGluc3RhbGwgJHtwYWNrYWdlTmFtZX0gJHtqb2luV2l0aEFuZChhbGxGYWlsZWREZXBzKX0uIFBsZWFzZSBpbnN0YWxsIHRoZW0gbWFudWFsbHkgd2l0aCB0aGUgY29tbWFuZHMgYWJvdmUuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsb2dTdWNjZXNzKGA9PiDinIUgSW5zdGFsbGVkICR7cGFja2FnZU5hbWV9IGRlcGVuZGVuY2llc2ApO1xuXG4gICAgaWYgKGlzTWV0ZW9yQXBwVXBkYXRlKCkpIHtcbiAgICAgIGNvbnN0IGlzWWFyblByb2ogPSBwcm9jZXNzLmVudi5ZQVJOX0VOQUJMRUQgPT09ICd0cnVlJztcbiAgICAgIGNvbnN0IGluc3RhbGxDb21tYW5kID0gaXNZYXJuUHJvaiA/ICd5YXJuIGluc3RhbGwnIDogJ25wbSBpbnN0YWxsJztcblxuICAgICAgbG9nSW5mbyhgPT4g8J+UlCBSZW1lbWJlcjogUnVuIFxcYCR7aW5zdGFsbENvbW1hbmR9XFxgIGFmdGVyIHRoZSBNZXRlb3IgdXBkYXRlIGZpbmlzaGVzLmApO1xuICAgICAgbG9nSW5mbyhgICAgVGhpcyBoZWxwcyBrZWVwIHlvdXIgZGVwZW5kZW5jaWVzIGNvcnJlY3QgYW5kIHlvdXIgcHJvamVjdCBzdGFibGUuYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTWFyayBhcyBjaGVja2VkXG4gIHNldEdsb2JhbFN0YXRlKGdsb2JhbFN0YXRlS2V5LCB0cnVlKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgUnNwYWNrIGlzIGluc3RhbGxlZCwgYW5kIGluc3RhbGxzIGl0IGlmIG5vdFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGNoZWNrL2luc3RhbGxhdGlvbiBpcyBjb21wbGV0ZVxuICogQHRocm93cyB7RXJyb3J9IElmIFJzcGFjayBpbnN0YWxsYXRpb24gZmFpbHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZVJzcGFja0luc3RhbGxlZCgpIHtcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gW1xuICAgIHsgbmFtZTogJ0Byc3BhY2svY2xpJywgdmVyc2lvbjogREVGQVVMVF9SU1BBQ0tfVkVSU0lPTiwgc2VtdmVyQ29uZGl0aW9uOiAnZ3RlJywgZGV2OiB0cnVlIH0sXG4gICAgeyBuYW1lOiAnQHJzcGFjay9jb3JlJywgdmVyc2lvbjogREVGQVVMVF9SU1BBQ0tfVkVSU0lPTiwgc2VtdmVyQ29uZGl0aW9uOiAnZ3RlJywgZGV2OiB0cnVlIH0sXG4gICAgeyBuYW1lOiAnQG1ldGVvcmpzL3JzcGFjaycsIHZlcnNpb246IERFRkFVTFRfTUVURU9SX1JTUEFDS19WRVJTSU9OLCBzZW12ZXJDb25kaXRpb246ICdndGUnLCBkZXY6IHRydWUgfSxcbiAgICB7IG5hbWU6ICdAc3djL2hlbHBlcnMnLCB2ZXJzaW9uOiBERUZBVUxUX01FVEVPUl9SU1BBQ0tfU1dDX0hFTFBFUlNfVkVSU0lPTiwgc2VtdmVyQ29uZGl0aW9uOiAnZ3RlJywgZGV2OiBmYWxzZSB9LFxuICAgIHsgbmFtZTogJ0Byc2RvY3Rvci9yc3BhY2stcGx1Z2luJywgdmVyc2lvbjogREVGQVVMVF9SU0RPQ1RPUl9SU1BBQ0tfUExVR0lOX1ZFUlNJT04sIHNlbXZlckNvbmRpdGlvbjogJ2d0ZScsIGRldjogdHJ1ZSB9LFxuICBdO1xuXG4gIGF3YWl0IGVuc3VyZURlcGVuZGVuY2llc0luc3RhbGxlZChcbiAgICBkZXBlbmRlbmNpZXMsXG4gICAgR0xPQkFMX1NUQVRFX0tFWVMuUlNQQUNLX0lOU1RBTExBVElPTl9DSEVDS0VELFxuICAgICdSc3BhY2snLFxuICApO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBSZWFjdCBpcyBpbnN0YWxsZWQgYW5kIHNldHMgZ2xvYmFsIHN0YXRlIGFjY29yZGluZ2x5XG4gKiBTZXRzIGdsb2JhbCBzdGF0ZSBhbmQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGJhc2VkIG9uIFJlYWN0IGRldGVjdGlvblxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGNoZWNrIGlzIGNvbXBsZXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1JlYWN0SW5zdGFsbGVkKCkge1xuICAvLyBTa2lwIGlmIGFscmVhZHkgY2hlY2tlZFxuICBpZiAoZ2V0R2xvYmFsU3RhdGUoR0xPQkFMX1NUQVRFX0tFWVMuUkVBQ1RfQ0hFQ0tFRCwgZmFsc2UpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgYXBwRGlyID0gZ2V0TWV0ZW9yQXBwRGlyKCk7XG4gIC8vIENoZWNrIGlmIFJlYWN0IGlzIGEgZGVwZW5kZW5jeSBpbiB0aGUgcHJvamVjdFxuICBjb25zdCBpc1JlYWN0SW5zdGFsbGVkID0gY2hlY2tOcG1EZXBlbmRlbmN5RXhpc3RzKCdyZWFjdCcsIHsgY3dkOiBhcHBEaXIgfSkgJiYgIWNoZWNrTnBtRGVwZW5kZW5jeUV4aXN0cygncHJlYWN0JywgeyBjd2Q6IGFwcERpciB9KTtcblxuICBpZiAoaXNSZWFjdEluc3RhbGxlZCkge1xuICAgIC8vIFNldCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBpbmRpY2F0ZSBSZWFjdCBpcyBlbmFibGVkXG4gICAgcHJvY2Vzcy5lbnYuTUVURU9SX1JFQUNUX0VOQUJMRUQgPSAndHJ1ZSc7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5lbnYuTUVURU9SX1JFQUNUX0VOQUJMRUQgPSAnZmFsc2UnO1xuICB9XG5cbiAgLy8gTWFyayBhcyBjaGVja2VkXG4gIHNldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLlJFQUNUX0NIRUNLRUQsIHRydWUpO1xuXG4gIHJldHVybiBpc1JlYWN0SW5zdGFsbGVkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlUnNwYWNrUmVhY3RJbnN0YWxsZWQoKSB7XG4gIGNvbnN0IGRlcGVuZGVuY2llcyA9IFtcbiAgICB7IG5hbWU6ICdAcnNwYWNrL3BsdWdpbi1yZWFjdC1yZWZyZXNoJywgdmVyc2lvbjogREVGQVVMVF9NRVRFT1JfUlNQQUNLX1JFQUNUX0hNUl9WRVJTSU9OLCBzZW12ZXJDb25kaXRpb246ICdndGUnLCBkZXY6IHRydWUgfSxcbiAgICB7IG5hbWU6ICdyZWFjdC1yZWZyZXNoJywgdmVyc2lvbjogREVGQVVMVF9NRVRFT1JfUlNQQUNLX1JFQUNUX1JFRlJFU0hfVkVSU0lPTiwgc2VtdmVyQ29uZGl0aW9uOiAnZ3RlJywgZGV2OiB0cnVlIH0sXG4gIF07XG5cbiAgYXdhaXQgZW5zdXJlRGVwZW5kZW5jaWVzSW5zdGFsbGVkKFxuICAgIGRlcGVuZGVuY2llcyxcbiAgICBHTE9CQUxfU1RBVEVfS0VZUy5SU1BBQ0tfUkVBQ1RfSU5TVEFMTEFUSU9OX0NIRUNLRUQsXG4gICAgJ1JzcGFjayBSZWFjdCdcbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgUnNwYWNrIERvY3RvciBpcyBpbnN0YWxsZWQsIGFuZCBpbnN0YWxscyBpdCBpZiBub3RcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjaGVjay9pbnN0YWxsYXRpb24gaXMgY29tcGxldGVcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBSc3BhY2sgRG9jdG9yIGluc3RhbGxhdGlvbiBmYWlsc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlUnNwYWNrRG9jdG9ySW5zdGFsbGVkKCkge1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBbXG4gICAgeyBuYW1lOiAnQHJzZG9jdG9yL3JzcGFjay1wbHVnaW4nLCB2ZXJzaW9uOiBERUZBVUxUX1JTRE9DVE9SX1JTUEFDS19QTFVHSU5fVkVSU0lPTiwgc2VtdmVyQ29uZGl0aW9uOiAnZ3RlJywgZGV2OiB0cnVlIH0sXG4gIF07XG5cbiAgYXdhaXQgZW5zdXJlRGVwZW5kZW5jaWVzSW5zdGFsbGVkKFxuICAgIGRlcGVuZGVuY2llcyxcbiAgICBHTE9CQUxfU1RBVEVfS0VZUy5SU1BBQ0tfRE9DVE9SX0lOU1RBTExBVElPTl9DSEVDS0VELFxuICAgICdSc3BhY2sgRG9jdG9yJ1xuICApO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBUeXBlU2NyaXB0IGlzIGluc3RhbGxlZCBhbmQgc2V0cyBnbG9iYWwgc3RhdGUgYWNjb3JkaW5nbHlcbiAqIFNldHMgZ2xvYmFsIHN0YXRlIGFuZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYmFzZWQgb24gVHlwZVNjcmlwdCBkZXRlY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIFR5cGVTY3JpcHQgaXMgaW5zdGFsbGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1R5cGVzY3JpcHRJbnN0YWxsZWQoKSB7XG4gIC8vIFNraXAgaWYgYWxyZWFkeSBjaGVja2VkXG4gIGlmIChnZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5UWVBFU0NSSVBUX0NIRUNLRUQsIGZhbHNlKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGFwcERpciA9IGdldE1ldGVvckFwcERpcigpO1xuICAvLyBDaGVjayBpZiBUeXBlU2NyaXB0IGlzIGEgZGVwZW5kZW5jeSBpbiB0aGUgcHJvamVjdFxuICBjb25zdCBpc1R5cGVzY3JpcHRJbnN0YWxsZWQgPSBjaGVja05wbURlcGVuZGVuY3lFeGlzdHMoJ3R5cGVzY3JpcHQnLCB7IGN3ZDogYXBwRGlyIH0pO1xuXG4gIGlmIChpc1R5cGVzY3JpcHRJbnN0YWxsZWQpIHtcbiAgICAvLyBTZXQgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gaW5kaWNhdGUgVHlwZVNjcmlwdCBpcyBlbmFibGVkXG4gICAgcHJvY2Vzcy5lbnYuTUVURU9SX1RZUEVTQ1JJUFRfRU5BQkxFRCA9ICd0cnVlJztcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLmVudi5NRVRFT1JfVFlQRVNDUklQVF9FTkFCTEVEID0gJ2ZhbHNlJztcbiAgfVxuXG4gIC8vIE1hcmsgYXMgY2hlY2tlZFxuICBzZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5UWVBFU0NSSVBUX0NIRUNLRUQsIHRydWUpO1xuXG4gIHJldHVybiBpc1R5cGVzY3JpcHRJbnN0YWxsZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIEFuZ3VsYXIgaXMgaW5zdGFsbGVkIGFuZCBzZXRzIGdsb2JhbCBzdGF0ZSBhY2NvcmRpbmdseVxuICogU2V0cyBnbG9iYWwgc3RhdGUgYW5kIGVudmlyb25tZW50IHZhcmlhYmxlcyBiYXNlZCBvbiBBbmd1bGFyIGRldGVjdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgQW5ndWxhciBpcyBpbnN0YWxsZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5ndWxhckluc3RhbGxlZCgpIHtcbiAgLy8gU2tpcCBpZiBhbHJlYWR5IGNoZWNrZWRcbiAgaWYgKGdldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLkFOR1VMQVJfQ0hFQ0tFRCwgZmFsc2UpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgYXBwRGlyID0gZ2V0TWV0ZW9yQXBwRGlyKCk7XG4gIC8vIENoZWNrIGlmIEBueC9hbmd1bGFyLXJzcGFjayBpcyBhIGRlcGVuZGVuY3kgaW4gdGhlIHByb2plY3RcbiAgY29uc3QgaXNBbmd1bGFySW5zdGFsbGVkID0gY2hlY2tOcG1EZXBlbmRlbmN5RXhpc3RzKCdAbngvYW5ndWxhci1yc3BhY2snLCB7IGN3ZDogYXBwRGlyIH0pO1xuXG4gIGlmIChpc0FuZ3VsYXJJbnN0YWxsZWQpIHtcbiAgICAvLyBTZXQgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gaW5kaWNhdGUgQW5ndWxhciBpcyBlbmFibGVkXG4gICAgcHJvY2Vzcy5lbnYuTUVURU9SX0FOR1VMQVJfRU5BQkxFRCA9ICd0cnVlJztcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLmVudi5NRVRFT1JfQU5HVUxBUl9FTkFCTEVEID0gJ2ZhbHNlJztcbiAgfVxuXG4gIC8vIE1hcmsgYXMgY2hlY2tlZFxuICBzZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5BTkdVTEFSX0NIRUNLRUQsIHRydWUpO1xuXG4gIHJldHVybiBpc0FuZ3VsYXJJbnN0YWxsZWQ7XG59XG4iLCIvKipcbiAqIEBtb2R1bGUgYnVpbGQtY29udGV4dFxuICogQGRlc2NyaXB0aW9uIEZ1bmN0aW9ucyBmb3IgbWFuYWdpbmcgYnVpbGQgY29udGV4dCBhbmQgbW9kdWxlIGZpbGVzIGZvciBSc3BhY2sgcGx1Z2luXG4gKi9cbmltcG9ydCB7IFJTUEFDS19ET0NUT1JfQ09OVEVYVCB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCB7IGdldEN1c3RvbUNvbmZpZ0ZpbGVQYXRoIH0gPSByZXF1aXJlKCcuL3Byb2Nlc3NlcycpO1xuXG5jb25zdCB7IGxvZ0Vycm9yIH0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvbG9nJyk7XG5cbmNvbnN0IHsgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyIH0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvc3RyaW5nJyk7XG5cbmNvbnN0IHtcbiAgZ2V0TWV0ZW9yQXBwRGlyLFxuICBnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMsXG4gIGlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQsXG4gIGlzTWV0ZW9yQXBwUnVuLFxuICBpc01ldGVvckFwcEJ1aWxkLFxuICBpc01ldGVvckJsYXplUHJvamVjdCxcbiAgaXNNZXRlb3JBcHBOYXRpdmUsXG4gIGlzTWV0ZW9yQXBwVGVzdEZ1bGxBcHAsXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL21ldGVvcicpO1xuXG5jb25zdCB7XG4gIGdldEdsb2JhbFN0YXRlLFxuICBzZXRHbG9iYWxTdGF0ZVxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9nbG9iYWwtc3RhdGUnKTtcblxuY29uc3Qge1xuICBhZGRHaXRpZ25vcmVFbnRyaWVzXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL2dpdCcpO1xuXG5jb25zdCB7XG4gIFJTUEFDS19CVUlMRF9DT05URVhULFxuICBSU1BBQ0tfQ0hVTktTX0NPTlRFWFQsXG4gIFJTUEFDS19BU1NFVFNfQ09OVEVYVCxcbiAgR0xPQkFMX1NUQVRFX0tFWVMsXG4gIEZJTEVfUk9MRSxcbn0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG4vLyBDb21tb24gd2FybmluZyBtZXNzYWdlIGZvciBhdXRvZ2VuZXJhdGVkIGZpbGVzXG5jb25zdCBBVVRPX0dFTkVSQVRFRF9XQVJOSU5HID0gYCog4pqg77iPIE5vdGU6IFRoaXMgZmlsZSBpcyBhdXRvZ2VuZXJhdGVkLiBJdCBpcyBub3QgbWVhbnQgdG8gYmUgbW9kaWZpZWQgbWFudWFsbHkuXG4qIFRoZXNlIGZpbGVzIGFsc28gYWN0IGFzIGEgY2FjaGU6IHRoZXkgY2FuIGJlIHNhZmVseSByZW1vdmVkIGFuZCB3aWxsIGJlXG4qIHJlZ2VuZXJhdGVkIG9uIHRoZSBuZXh0IGJ1aWxkLiBUaGV5IHNob3VsZCBiZSBpZ25vcmVkIGluIElERSBzdWdnZXN0aW9uc1xuKiBhbmQgdmVyc2lvbiBjb250cm9sLmA7XG5cbi8qKlxuICogR2V0cyBlbnRyeSBwb2ludHMgZnJvbSBNZXRlb3IgY29uZmlndXJhdGlvblxuICogUmV0cmlldmVzIGZyb20gZ2xvYmFsIHN0YXRlIGlmIGFscmVhZHkgc3RvcmVkLCBvdGhlcndpc2UgZ2V0cyBmcm9tIE1ldGVvclxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IGNvbnRhaW5pbmcgZW50cnkgcG9pbnRzIGZvciBjbGllbnQgYW5kIHNlcnZlclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdGlhbEVudHJ5cG9pbnRzKCkge1xuICBjb25zdCBleGlzdGluZ0VudHJ5cG9pbnQgPSBnZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5JTklUSUFMX0VOVFJZUE9OVFMpO1xuICBpZiAoZXhpc3RpbmdFbnRyeXBvaW50KSByZXR1cm4gZXhpc3RpbmdFbnRyeXBvaW50O1xuICBjb25zdCBpbml0aWFsRW50cnlwb2ludHMgPSBnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMoKTtcbiAgY29uc3QgaGFzSW5pdGlhbEVudHJ5cG9pbnRzID0gaW5pdGlhbEVudHJ5cG9pbnRzICYmIE9iamVjdC52YWx1ZXMoaW5pdGlhbEVudHJ5cG9pbnRzKS5sZW5ndGggPiAwICYmIE9iamVjdC52YWx1ZXMoaW5pdGlhbEVudHJ5cG9pbnRzKS5ldmVyeSgodmFsdWUpID0+IHZhbHVlICE9IG51bGwpO1xuICBpZiAoaGFzSW5pdGlhbEVudHJ5cG9pbnRzKSB7XG4gICAgc2V0R2xvYmFsU3RhdGUoR0xPQkFMX1NUQVRFX0tFWVMuSU5JVElBTF9FTlRSWVBPTlRTLCBpbml0aWFsRW50cnlwb2ludHMpO1xuICB9XG4gIHJldHVybiBpbml0aWFsRW50cnlwb2ludHM7XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGUgUnNwYWNrIGJ1aWxkIGNvbnRleHQgZGlyZWN0b3J5IGV4aXN0c1xuICogQ3JlYXRlcyB0aGUgZGlyZWN0b3J5IGlmIGl0IGRvZXNuJ3QgZXhpc3QgYW5kIGFkZHMgaXQgdG8gLmdpdGlnbm9yZVxuICogQHJldHVybnMge3N0cmluZ30gUGF0aCB0byB0aGUgYnVpbGQgY29udGV4dCBkaXJlY3RvcnlcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBkaXJlY3RvcnkgY3JlYXRpb24gZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVJzcGFja0J1aWxkQ29udGV4dEV4aXN0cygpIHtcbiAgY29uc3QgYXBwRGlyID0gZ2V0TWV0ZW9yQXBwRGlyKCk7XG4gIGNvbnN0IGJ1aWxkQ29udGV4dFBhdGggPSBwYXRoLmpvaW4oYXBwRGlyLCBSU1BBQ0tfQlVJTERfQ09OVEVYVCk7XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKGJ1aWxkQ29udGV4dFBhdGgpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGZzLm1rZGlyU3luYyhidWlsZENvbnRleHRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgUnNwYWNrIGJ1aWxkIGNvbnRleHQgZGlyZWN0b3J5OiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICBjb25zdCBjb21tb25CdWlsZEVudHJpZXMgPSBbXG4gICAgUlNQQUNLX0JVSUxEX0NPTlRFWFQsXG4gICAgYCovJHtSU1BBQ0tfQVNTRVRTX0NPTlRFWFR9YCxcbiAgICBgKi8ke1JTUEFDS19DSFVOS1NfQ09OVEVYVH1gLFxuICAgIFJTUEFDS19ET0NUT1JfQ09OVEVYVCxcbiAgXTtcblxuICBpZiAocHJvY2Vzcy5lbnYuTUVURU9SX0xPQ0FMX0RJUikge1xuICAgIGFkZEdpdGlnbm9yZUVudHJpZXMoXG4gICAgICBhcHBEaXIsXG4gICAgICBbcHJvY2Vzcy5lbnYuTUVURU9SX0xPQ0FMX0RJUiwgLi4uY29tbW9uQnVpbGRFbnRyaWVzXSxcbiAgICAgIFwiTWV0ZW9yIGN1c3RvbSBsb2NhbCBkaXJlY3RvcnkgKE1FVEVPUl9MT0NBTF9ESVIpXCJcbiAgICApO1xuICAgIHJldHVybiBidWlsZENvbnRleHRQYXRoO1xuICB9XG5cbiAgYWRkR2l0aWdub3JlRW50cmllcyhcbiAgICBhcHBEaXIsXG4gICAgY29tbW9uQnVpbGRFbnRyaWVzLFxuICAgIFwiTWV0ZW9yIE1vZGVybi1Ub29scyBidWlsZCBjb250ZXh0IGRpcmVjdG9yaWVzXCJcbiAgKTtcblxuICByZXR1cm4gYnVpbGRDb250ZXh0UGF0aDtcbn1cblxuLyoqXG4gKiBFbnN1cmVzIG1vZHVsZSBmaWxlcyBleGlzdCBpbiB0aGUgYnVpbGQgY29udGV4dCBkaXJlY3RvcnlcbiAqIENyZWF0ZXMgZGVmYXVsdCBtb2R1bGUgZmlsZXMgaWYgdGhleSBkb24ndCBleGlzdFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVNb2R1bGVGaWxlc0V4aXN0KCkge1xuICBjb25zdCBhcHBEaXIgPSBnZXRNZXRlb3JBcHBEaXIoKTtcblxuICBjb25zdCBlbnYgPSB7XG4gICAgLi4uKGlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQoKSA/IHsgaXNEZXZlbG9wbWVudDogdHJ1ZSB9IDogeyBpc1Byb2R1Y3Rpb246IHRydWUgfSksXG4gICAgaXNOYXRpdmU6IGlzTWV0ZW9yQXBwTmF0aXZlKCksXG4gIH07XG4gIGNvbnN0IGNvbW1hbmRSb2xlID0gaXNNZXRlb3JBcHBSdW4oKVxuICAgID8geyByb2xlOiBGSUxFX1JPTEUucnVuIH1cbiAgICA6IGlzTWV0ZW9yQXBwQnVpbGQoKVxuICAgID8geyByb2xlOiBGSUxFX1JPTEUuYnVpbGQgfVxuICAgIDogeyByb2xlOiBGSUxFX1JPTEUucnVuIH07XG4gIGNvbnN0IGluaXRpYWxFbnRyeXBvaW50cyA9IGdldEluaXRpYWxFbnRyeXBvaW50cygpO1xuICBjb25zdCBtYWluQ2xpZW50RmlsZXMgPSB7XG4gICAgZW50cnlGaWxlOiBpbml0aWFsRW50cnlwb2ludHMubWFpbkNsaWVudCB8fCAnJyxcbiAgICBvdXRwdXRGaWxlOiBnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc0NsaWVudDogdHJ1ZSwgLi4uZW52LCByb2xlOiBGSUxFX1JPTEUub3V0cHV0LCBvbmx5RmlsZW5hbWU6IHRydWUgfSksXG4gIH07XG4gIGNvbnN0IG1haW5TZXJ2ZXJGaWxlcyA9IHtcbiAgICBlbnRyeUZpbGU6IGluaXRpYWxFbnRyeXBvaW50cy5tYWluU2VydmVyIHx8ICcnLFxuICAgIG91dHB1dEZpbGU6IGdldEJ1aWxkRmlsZVBhdGgoeyBpc01haW46IHRydWUsIGlzU2VydmVyOiB0cnVlLCAuLi5lbnYsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQsIG9ubHlGaWxlbmFtZTogdHJ1ZSB9KSxcbiAgfTtcbiAgY29uc3QgaXNUZXN0RWFnZXIgPVxuICAgIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0TW9kdWxlID09IG51bGwgJiZcbiAgICBpbml0aWFsRW50cnlwb2ludHMudGVzdENsaWVudCA9PSBudWxsICYmXG4gICAgaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RTZXJ2ZXIgPT0gbnVsbDtcbiAgY29uc3QgaXNUZXN0TW9kdWxlID0gaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RNb2R1bGUgIT0gbnVsbCB8fCBpc1Rlc3RFYWdlcjtcbiAgY29uc3QgdGVzdENsaWVudEZpbGVzID0ge1xuICAgIGVudHJ5RmlsZTogaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RDbGllbnQgfHwgJycsXG4gICAgb3V0cHV0RmlsZTogZ2V0QnVpbGRGaWxlUGF0aCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0TW9kdWxlLCBpc0NsaWVudDogdHJ1ZSwgcm9sZTogRklMRV9ST0xFLm91dHB1dCwgb25seUZpbGVuYW1lOiB0cnVlIH0pLFxuICAgIG1haW5FbnRyeUZpbGU6IG1haW5DbGllbnRGaWxlcy5lbnRyeUZpbGUsXG4gIH07XG4gIGNvbnN0IHRlc3RTZXJ2ZXJGaWxlcyA9IHtcbiAgICBlbnRyeUZpbGU6IGluaXRpYWxFbnRyeXBvaW50cy50ZXN0U2VydmVyIHx8ICcnLFxuICAgIG91dHB1dEZpbGU6IGdldEJ1aWxkRmlsZVBhdGgoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdE1vZHVsZSwgaXNTZXJ2ZXI6IHRydWUsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQsIG9ubHlGaWxlbmFtZTogdHJ1ZSB9KSxcbiAgICBtYWluRW50cnlGaWxlOiBtYWluU2VydmVyRmlsZXMuZW50cnlGaWxlLFxuICB9O1xuICBjb25zdCBpc1Rlc3RGdWxsQXBwID0gaXNNZXRlb3JBcHBUZXN0RnVsbEFwcCgpO1xuXG4gIGNvbnN0IG1vZHVsZUZpbGVzID0ge1xuICAgIC8qIE1haW4gbW9kdWxlIGZpbGVzIGZvciBjbGllbnQgYW5kIHNlcnZlciAqL1xuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc0NsaWVudDogdHJ1ZSwgLi4uZW52LCAuLi5jb21tYW5kUm9sZSB9KV06XG4gICAgICBnZXRCdWlsZEZpbGVDb250ZW50KHsgaXNNYWluOiB0cnVlLCBpc0NsaWVudDogdHJ1ZSwgLi4uZW52LCAuLi5jb21tYW5kUm9sZSwgLi4ubWFpbkNsaWVudEZpbGVzIH0pLFxuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc0NsaWVudDogdHJ1ZSwgLi4uZW52LCByb2xlOiBGSUxFX1JPTEUuZW50cnkgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzTWFpbjogdHJ1ZSwgaXNDbGllbnQ6IHRydWUsIC4uLmVudiwgcm9sZTogRklMRV9ST0xFLmVudHJ5LCAuLi5tYWluQ2xpZW50RmlsZXMgfSksXG4gICAgW2dldEJ1aWxkRmlsZVBhdGgoeyBpc01haW46IHRydWUsIGlzQ2xpZW50OiB0cnVlLCAuLi5lbnYsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzTWFpbjogdHJ1ZSwgaXNDbGllbnQ6IHRydWUsIC4uLmVudiwgcm9sZTogRklMRV9ST0xFLm91dHB1dCwgLi4ubWFpbkNsaWVudEZpbGVzIH0pLFxuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uZW52LCAuLi5jb21tYW5kUm9sZSB9KV06XG4gICAgICBnZXRCdWlsZEZpbGVDb250ZW50KHsgaXNNYWluOiB0cnVlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uZW52LCAuLi5jb21tYW5kUm9sZSwgLi4ubWFpblNlcnZlckZpbGVzIH0pLFxuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uZW52LCByb2xlOiBGSUxFX1JPTEUuZW50cnkgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzTWFpbjogdHJ1ZSwgaXNTZXJ2ZXI6IHRydWUsIC4uLmVudiwgcm9sZTogRklMRV9ST0xFLmVudHJ5LCAuLi5tYWluU2VydmVyRmlsZXMgfSksXG4gICAgW2dldEJ1aWxkRmlsZVBhdGgoeyBpc01haW46IHRydWUsIGlzU2VydmVyOiB0cnVlLCAuLi5lbnYsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzTWFpbjogdHJ1ZSwgaXNTZXJ2ZXI6IHRydWUsIC4uLmVudiwgcm9sZTogRklMRV9ST0xFLm91dHB1dCwgLi4ubWFpblNlcnZlckZpbGVzIH0pLFxuICAgIC8qIFRlc3QgbW9kdWxlIGZpbGVzIHdoZW4gdGVzdCBtb2R1bGUsIHRlc3QgbW9kdWxlIGZpbGVzIGZvciBjbGllbnQgYW5kIHNlcnZlciBhcmUgcHJlc2VudCBvciBlYWdlciBkaXNjb3ZlcnkgKi9cbiAgICBbZ2V0QnVpbGRGaWxlUGF0aCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc0NsaWVudDogdHJ1ZSwgLi4uY29tbWFuZFJvbGUgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc0NsaWVudDogdHJ1ZSwgLi4uY29tbWFuZFJvbGUsIC4uLnRlc3RDbGllbnRGaWxlcyB9KSxcbiAgICBbZ2V0QnVpbGRGaWxlUGF0aCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc0NsaWVudDogdHJ1ZSwgcm9sZTogRklMRV9ST0xFLmVudHJ5IH0pXTpcbiAgICAgIGdldEJ1aWxkRmlsZUNvbnRlbnQoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdEZ1bGxBcHAsIGlzVGVzdE1vZHVsZSwgaXNDbGllbnQ6IHRydWUsIHJvbGU6IEZJTEVfUk9MRS5lbnRyeSwgLi4udGVzdENsaWVudEZpbGVzIH0pLFxuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNUZXN0OiB0cnVlLCBpc1Rlc3RGdWxsQXBwLCBpc1Rlc3RNb2R1bGUsIGlzQ2xpZW50OiB0cnVlLCByb2xlOiBGSUxFX1JPTEUub3V0cHV0IH0pXTpcbiAgICAgIGdldEJ1aWxkRmlsZUNvbnRlbnQoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdEZ1bGxBcHAsIGlzVGVzdE1vZHVsZSwgaXNDbGllbnQ6IHRydWUsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQsIC4uLnRlc3RDbGllbnRGaWxlcyB9KSxcbiAgICBbZ2V0QnVpbGRGaWxlUGF0aCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uY29tbWFuZFJvbGUgfSldOlxuICAgICAgZ2V0QnVpbGRGaWxlQ29udGVudCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uY29tbWFuZFJvbGUsIC4uLnRlc3RTZXJ2ZXJGaWxlcyB9KSxcbiAgICBbZ2V0QnVpbGRGaWxlUGF0aCh7IGlzVGVzdDogdHJ1ZSwgaXNUZXN0RnVsbEFwcCwgaXNUZXN0TW9kdWxlLCBpc1NlcnZlcjogdHJ1ZSwgcm9sZTogRklMRV9ST0xFLmVudHJ5IH0pXTpcbiAgICAgIGdldEJ1aWxkRmlsZUNvbnRlbnQoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdEZ1bGxBcHAsIGlzVGVzdE1vZHVsZSwgaXNTZXJ2ZXI6IHRydWUsIHJvbGU6IEZJTEVfUk9MRS5lbnRyeSwgLi4udGVzdFNlcnZlckZpbGVzIH0pLFxuICAgIFtnZXRCdWlsZEZpbGVQYXRoKHsgaXNUZXN0OiB0cnVlLCBpc1Rlc3RGdWxsQXBwLCBpc1Rlc3RNb2R1bGUsIGlzU2VydmVyOiB0cnVlLCByb2xlOiBGSUxFX1JPTEUub3V0cHV0IH0pXTpcbiAgICAgIGdldEJ1aWxkRmlsZUNvbnRlbnQoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdEZ1bGxBcHAsIGlzVGVzdE1vZHVsZSwgaXNTZXJ2ZXI6IHRydWUsIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQsIC4uLnRlc3RTZXJ2ZXJGaWxlcyB9KSxcbiAgfTtcblxuICBPYmplY3QuZW50cmllcyhtb2R1bGVGaWxlcykuZm9yRWFjaCgoW2ZpbGVuYW1lLCBkZWZhdWx0Q29udGVudF0pID0+IHtcbiAgICAvLyAxLiBCdWlsZCBmdWxsIHBhdGggYW5kIGVuc3VyZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oYXBwRGlyLCBSU1BBQ0tfQlVJTERfQ09OVEVYVCwgZmlsZW5hbWUpO1xuICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ0Vycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGRpcmVjdG9yeSAke2Rpcn06ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIHJldHVybjsgLy8gc3RvcCBoZXJlIGlmIHdlIGNhbuKAmXQgbWFrZSB0aGUgZm9sZGVyXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gMi4gSWYgdGhlIGZpbGUgZXhpc3RzLCBjaGVjayBpdHMgY29udGVudHNcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgIGxldCBleGlzdGluZztcbiAgICAgIHRyeSB7XG4gICAgICAgIGV4aXN0aW5nID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ0Vycm9yKGBGYWlsZWQgdG8gcmVhZCBleGlzdGluZyBmaWxlICR7ZmlsZW5hbWV9OiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIDMuIElmIGl0IGRvZXNuJ3QgYWxyZWFkeSBzdGFydCB3aXRoIHRoZSBuZXcgZGVmYXVsdENvbnRlbnQsIG92ZXJ3cml0ZSBpdFxuICAgICAgaWYgKCFleGlzdGluZy5pbmNsdWRlcyhkZWZhdWx0Q29udGVudCkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBkZWZhdWx0Q29udGVudCwgJ3V0ZjgnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbG9nRXJyb3IoYEZhaWxlZCB0byByZXdyaXRlIG1vZHVsZSBmaWxlICR7ZmlsZW5hbWV9OiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDQuIElmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QgYXQgYWxsLCB3cml0ZSBpdCBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZGVmYXVsdENvbnRlbnQsICd1dGY4Jyk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbG9nRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgbW9kdWxlIGZpbGUgJHtmaWxlbmFtZX06ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBidWlsZCBmaWxlIHBhdGggYmFzZWQgb24gY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gQ29uZmlndXJhdGlvbiBvYmplY3QgY29udGFpbmluZyBidWlsZCBzZXR0aW5nc1xuICogQHJldHVybnMge3N0cmluZ30gVGhlIGJ1aWxkIGZpbGUgcGF0aCBvciBmaWxlbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVpbGRGaWxlUGF0aChjb25maWcpIHtcbiAgLy8gRGV0ZXJtaW5lIHRoZSBtb2R1bGUgcGFydCAoZGlyZWN0b3J5IG5hbWUpXG4gIGxldCBtb2R1bGUgPSAnJztcbiAgaWYgKGNvbmZpZz8uaXNUZXN0KSB7XG4gICAgbW9kdWxlID0gJ3Rlc3QnO1xuICB9IGVsc2UgaWYgKGNvbmZpZz8uaXNNYWluKSB7XG4gICAgbW9kdWxlID0gJ21haW4nO1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSBzaWRlIHBhcnQgKGZpcnN0IHBhcnQgb2YgZmlsZW5hbWUpXG4gIGxldCBzaWRlID0gJyc7XG4gIGlmIChjb25maWc/LmlzU2VydmVyKSB7XG4gICAgc2lkZSA9ICdzZXJ2ZXInO1xuICB9IGVsc2UgaWYgKGNvbmZpZz8uaXNDbGllbnQpIHtcbiAgICBzaWRlID0gJ2NsaWVudCc7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdGhlIGVudmlyb25tZW50IHBhcnQgKG9ubHkgZm9yIG5vbi10ZXN0IGZpbGVzKVxuICBsZXQgZW52ID0gJyc7XG4gIGlmICghY29uZmlnPy5pc1Rlc3QpIHtcbiAgICBpZiAoY29uZmlnPy5pc0RldmVsb3BtZW50KSB7XG4gICAgICBlbnYgPSAnZGV2JztcbiAgICB9IGVsc2UgaWYgKGNvbmZpZz8uaXNQcm9kdWN0aW9uKSB7XG4gICAgICBlbnYgPSAncHJvZCc7XG4gICAgfVxuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSByb2xlIHBhcnRcbiAgbGV0IHJvbGUgPSBjb25maWc/LnJvbGU7XG4gIGlmIChbRklMRV9ST0xFLnJ1biwgRklMRV9ST0xFLmJ1aWxkXS5pbmNsdWRlcyhyb2xlKSkge1xuICAgIHJvbGUgPSAnbWV0ZW9yJztcbiAgfSBlbHNlIGlmIChbRklMRV9ST0xFLm91dHB1dF0uaW5jbHVkZXMocm9sZSkpIHtcbiAgICByb2xlID0gJ3JzcGFjayc7XG4gIH1cblxuICAvLyA1LiBHZXQgZmlsZSBleHRlbnNpb24gKGRlZmF1bHQgdG8ganMpXG4gIGNvbnN0IGV4dGVuc2lvbiA9IGNvbmZpZz8uZXh0ZW5zaW9uIHx8ICdqcyc7XG5cbiAgLy8gNi4gQ29uc3RydWN0IHRoZSBmaWxlbmFtZToge3NpZGV9LXtyb2xlfS57ZXh0ZW5zaW9ufVxuICBjb25zdCBmaWxlbmFtZSA9IGAke3NpZGV9LSR7cm9sZX0uJHtleHRlbnNpb259YDtcblxuICAvLyBSZXR1cm4gZWl0aGVyIGp1c3QgdGhlIGZpbGVuYW1lIG9yIHRoZSBmdWxsIHBhdGhcbiAgaWYgKGNvbmZpZz8ub25seUZpbGVuYW1lKSB7XG4gICAgcmV0dXJuIGZpbGVuYW1lO1xuICB9IGVsc2Uge1xuICAgIC8vIEZ1bGwgcGF0aCBmb3JtYXQ6IHttb2R1bGV9Wy17ZW52fV0ve2ZpbGVuYW1lfVxuICAgIGNvbnN0IGVudlN1ZmZpeCA9IGVudiA/IGAtJHtlbnZ9YCA6ICcnO1xuICAgIHJldHVybiBgJHttb2R1bGV9JHtlbnZTdWZmaXh9LyR7ZmlsZW5hbWV9YDtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGFwcHJvcHJpYXRlIGJhbm5lciBiYXNlZCBvbiBmaWxlIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBDb25maWd1cmF0aW9uIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHNpZGUgLSBUaGUgc2lkZSAoY2xpZW50LCBzZXJ2ZXIsIHRlc3QpXG4gKiBAcGFyYW0ge3N0cmluZ30gZW52IC0gVGhlIGVudmlyb25tZW50IChkZXZlbG9wbWVudCwgcHJvZHVjdGlvbilcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb2R1bGUgLSBUaGUgbW9kdWxlIChtYWluLCB0ZXN0KVxuICogQHBhcmFtIHtzdHJpbmd9IHJvbGUgLSBUaGUgcm9sZSAoYnVpbGQsIGVudHJ5LCBydW4sIG91dHB1dClcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBiYW5uZXIgY29udGVudFxuICovXG5mdW5jdGlvbiBnZXRCYW5uZXIoY29uZmlnLCBzaWRlLCBlbnYsIG1vZHVsZSwgcm9sZSkge1xuICBjb25zdCBlbnZEaXNwbGF5ID0gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGVudiB8fCBtb2R1bGUpO1xuICBjb25zdCBzaWRlRGlzcGxheSA9IGNhcGl0YWxpemVGaXJzdExldHRlcihzaWRlKTtcblxuICAvLyBGb3IgdGVzdCBtb2RlLCB1c2UgdGhlIGV4aXN0aW5nIGJhbm5lcnNcbiAgaWYgKG1vZHVsZSA9PT0gJ3Rlc3QnKSB7XG4gICAgLy8gVGVzdCBmaWxlIGJhbm5lcnNcbiAgICBpZiAocm9sZSA9PT0gRklMRV9ST0xFLmVudHJ5KSB7XG4gICAgICBpZiAoIWNvbmZpZz8uZW50cnlGaWxlKSB7XG4gICAgICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tZW50cnkuanNcbiogQGRlc2NyaXB0aW9uIE5vIGNvZGUgZ2VuZXJhdGVkXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKaoSBSc3BhY2sgVGVzdCAke3NpZGVEaXNwbGF5fSBFbnRyeSAoJHtlbnZEaXNwbGF5fSlcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4oCiIFvilqAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBbICAgJHtzaWRlfS1yc3BhY2suanMgXSDilIDilIDilrYgWyAgICR7c2lkZX0tbWV0ZW9yLmpzIF1cbipcbiogVGhpcyBmaWxlIGlzIGVtcHR5IGJlY2F1c2UgXFxgbWV0ZW9yLnRlc3RNb2R1bGUke3NpZGUgPT09ICd0ZXN0JyA/ICcnIDogYC4ke3NpZGV9YH1cXGAgaXMgbm90IHNldCBpbiBwYWNrYWdlLmpzb24uXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gICAgICB9XG4gICAgICAvLyBGb3IgdGVzdCBtb2RlLCBpZiBzaWRlIGlzIGNsaWVudCBvciBzZXJ2ZXIsIGluY2x1ZGUgaXQgaW4gdGhlIHRpdGxlXG4gICAgICBjb25zdCB0ZXN0VHlwZSA9IHNpZGUgPT09ICd0ZXN0JyA/ICdUZXN0JyA6IGBUZXN0ICR7c2lkZURpc3BsYXl9YDtcbiAgICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tZW50cnkuanNcbiogQGRlc2NyaXB0aW9uIEVudHJ5IHBvaW50IGZvciBSc3BhY2sgdGVzdCBidWlsZCBwcm9jZXNzXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKaoSBSc3BhY2sgJHt0ZXN0VHlwZX0gRW50cnkgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBb4pagICR7c2lkZX0tZW50cnkuanMgXSDilIDilIDilrYgWyAgICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSBSc3BhY2sgdGVzdCBidWlsZC4gSXQgaW1wb3J0cyB5b3VyXG4qIE1ldGVvciBhcHAncyB0ZXN0IG1vZHVsZXMgc28gUnNwYWNrIGNhbiByZXNvbHZlIGV2ZXJ5IGRlcGVuZGVuY3kgYW5kXG4qIGdlbmVyYXRlIHRoZSBidW5kbGVkIG91dHB1dDogXFxgJHtzaWRlfS1yc3BhY2suanNcXGAuXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gICAgfVxuXG4gICAgaWYgKHJvbGUgPT09IEZJTEVfUk9MRS5vdXRwdXQpIHtcbiAgICAgIGlmICghY29uZmlnPy5lbnRyeUZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGAvKipcbiogQGZpbGUgJHtzaWRlfS1yc3BhY2suanNcbiogQGRlc2NyaXB0aW9uIE5vIGNvZGUgZ2VuZXJhdGVkXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKaoSBSc3BhY2sgVGVzdCAke3NpZGVEaXNwbGF5fSBBcHAgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBbICAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBb4pagICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyBlbXB0eSBiZWNhdXNlIFxcYG1ldGVvci50ZXN0TW9kdWxlJHtzaWRlID09PSAndGVzdCcgPyAnJyA6IGAuJHtzaWRlfWB9XFxgIGlzIG5vdCBzZXQgaW4gcGFja2FnZS5qc29uLlxuKlxuJHtBVVRPX0dFTkVSQVRFRF9XQVJOSU5HfVxuKi9gO1xuICAgICAgfVxuICAgICAgLy8gRm9yIHRlc3QgbW9kZSwgaWYgc2lkZSBpcyBjbGllbnQgb3Igc2VydmVyLCBpbmNsdWRlIGl0IGluIHRoZSB0aXRsZVxuICAgICAgY29uc3QgdGVzdFR5cGUgPSBzaWRlID09PSAndGVzdCcgPyAnVGVzdCcgOiBgVGVzdCAke3NpZGVEaXNwbGF5fWA7XG4gICAgICByZXR1cm4gYC8qKlxuKiBAZmlsZSAke3NpZGV9LXJzcGFjay5qc1xuKiBAZGVzY3JpcHRpb24gQnVuZGxlZCBvdXRwdXQgZ2VuZXJhdGVkIGJ5IFJzcGFjayBmb3IgdGVzdHNcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4pqhIFJzcGFjayAke3Rlc3RUeXBlfSBBcHAgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBbICAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBb4pagICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyB0aGUgYnVuZGxlIHRoYXQgUnNwYWNrIG91dHB1dHMgZm9yIHRlc3RzLiBJdCBjb250YWlucyBhbGwgb2ZcbiogeW91ciB0ZXN0IGNvZGUgaW4gb25lIG9wdGltaXplZCBmaWxlLiBOZXh0IHN0ZXAgaXMgbG9hZGluZyB0aGlzIGJ1bmRsZSB2aWFcbiogXFxgJHtzaWRlfS1tZXRlb3IuanNcXGAuXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gICAgfVxuXG4gICAgaWYgKHJvbGUgPT09IEZJTEVfUk9MRS5ydW4gfHwgcm9sZSA9PT0gRklMRV9ST0xFLmJ1aWxkKSB7XG4gICAgICBpZiAoIWNvbmZpZz8uZW50cnlGaWxlKSB7XG4gICAgICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tbWV0ZW9yLmpzXG4qIEBkZXNjcmlwdGlvbiBObyBjb2RlIGdlbmVyYXRlZFxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiDimITvuI8gTWV0ZW9yIFRlc3QgJHtzaWRlRGlzcGxheX0gQXBwICgke2VudkRpc3BsYXl9KVxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiDigKIgWyAgICR7c2lkZX0tZW50cnkuanMgXSDilIDilIDilrYgWyAgICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFvilqAgJHtzaWRlfS1tZXRlb3IuanMgXVxuKlxuKiBUaGlzIGZpbGUgaXMgZW1wdHkgYmVjYXVzZSBcXGBtZXRlb3IudGVzdE1vZHVsZSR7c2lkZSA9PT0gJ3Rlc3QnID8gJycgOiBgLiR7c2lkZX1gfVxcYCBpcyBub3Qgc2V0IGluIHBhY2thZ2UuanNvbi5cbipcbiR7QVVUT19HRU5FUkFURURfV0FSTklOR31cbiovYDtcbiAgICAgIH1cbiAgICAgIC8vIEZvciB0ZXN0IG1vZGUsIGlmIHNpZGUgaXMgY2xpZW50IG9yIHNlcnZlciwgaW5jbHVkZSBpdCBpbiB0aGUgdGl0bGVcbiAgICAgIGNvbnN0IHRlc3RUeXBlID0gc2lkZSA9PT0gJ3Rlc3QnID8gJ1Rlc3QnIDogYFRlc3QgJHtzaWRlRGlzcGxheX1gO1xuICAgICAgcmV0dXJuIGAvKipcbiogQGZpbGUgJHtzaWRlfS1tZXRlb3IuanNcbiogQGRlc2NyaXB0aW9uIE1ldGVvciBydW50aW1lIGZpbGUgdGhhdCBpbXBvcnRzIHRoZSBSc3BhY2sgdGVzdCBidW5kbGVcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4piE77iPIE1ldGVvciAke3Rlc3RUeXBlfSBBcHAgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBbICAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBbICAgJHtzaWRlfS1yc3BhY2suanMgXSDilIDilIDilrYgW+KWoCAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIERlZmluZWQgdW5kZXIgXFxgbWV0ZW9yLnRlc3RNb2R1bGUke3NpZGUgPT09ICd0ZXN0JyA/ICcnIDogYC4ke3NpZGV9YH1cXGAgaW4gcGFja2FnZS5qc29uLiBNZXRlb3IgbG9hZHMgdGhpc1xuKiBmaWxlIGF0IHJ1bnRpbWUgdG8gaW1wb3J0IHRoZSBSc3BhY2sgdGVzdCBidW5kbGUgKFxcYCR7c2lkZX0tcnNwYWNrLmpzXFxgKSBhbmRcbiogcnVuIHlvdXIgdGVzdHMuXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIEZvciBtYWluIG1vZHVsZXMgKG5vdCB0ZXN0IG1vZGUpLCB1c2UgdGhlIG5ldyB0ZW1wbGF0ZXNcbiAgLy8gRW50cnkgZmlsZXNcbiAgaWYgKHJvbGUgPT09IEZJTEVfUk9MRS5lbnRyeSkge1xuICAgIGlmICghY29uZmlnPy5lbnRyeUZpbGUpIHtcbiAgICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tZW50cnkuanNcbiogQGRlc2NyaXB0aW9uIE5vIGNvZGUgZ2VuZXJhdGVkXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIPCflIwgUnNwYWNrICR7c2lkZURpc3BsYXl9IEVudHJ5ICgke2VudkRpc3BsYXl9KVxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiDigKIgW+KWoCAke3NpZGV9LWVudHJ5LmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LXJzcGFjay5qcyBdIOKUgOKUgOKWtiBbICAgJHtzaWRlfS1tZXRlb3IuanMgXVxuKlxuKiBUaGlzIGZpbGUgaXMgZW1wdHkgYmVjYXVzZSBcXGBtZXRlb3IubWFpbk1vZHVsZS4ke3NpZGV9XFxgIGlzIG5vdCBzZXQgaW4gcGFja2FnZS5qc29uLlxuKlxuJHtBVVRPX0dFTkVSQVRFRF9XQVJOSU5HfVxuKi9gO1xuICAgIH1cbiAgICByZXR1cm4gYC8qKlxuKiBAZmlsZSAke3NpZGV9LWVudHJ5LmpzXG4qIEBkZXNjcmlwdGlvbiBFbnRyeSBwb2ludCBmb3IgUnNwYWNrIGJ1aWxkIHByb2Nlc3NcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog8J+UjCBSc3BhY2sgJHtzaWRlRGlzcGxheX0gRW50cnkgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBb4pagICR7c2lkZX0tZW50cnkuanMgXSDilIDilIDilrYgWyAgICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyB0aGUgZW50cnkgcG9pbnQgdGhhdCBSc3BhY2sgdXNlcyB0byBzdGFydCB0aGUgYnVpbGQgcHJvY2Vzcy5cbiogSXQgaW1wb3J0cyB0aGUgbW9kdWxlIGRlZmluZWQgaW4gXFxgbWV0ZW9yLm1haW5Nb2R1bGUuJHtzaWRlfVxcYCBpbnNpZGUgcGFja2FnZS5qc29uLlxuKiBGcm9tIGhlcmUsIFJzcGFjayBjYW4gdHJhY2UgdGhlIGVudGlyZSBkZXBlbmRlbmN5IGdyYXBoIG9mIHlvdXIgYXBwbGljYXRpb25cbiogYW5kIGdlbmVyYXRlIHRoZSBidW5kbGVkIG91dHB1dCAoXFxgJHtzaWRlfS1yc3BhY2suanNcXGApLlxuKlxuJHtBVVRPX0dFTkVSQVRFRF9XQVJOSU5HfVxuKi9gO1xuICB9XG5cbiAgLy8gUnNwYWNrIG91dHB1dCBmaWxlc1xuICBpZiAocm9sZSA9PT0gRklMRV9ST0xFLm91dHB1dCkge1xuICAgIGlmICghY29uZmlnPy5lbnRyeUZpbGUpIHtcbiAgICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tcnNwYWNrLmpzXG4qIEBkZXNjcmlwdGlvbiBObyBjb2RlIGdlbmVyYXRlZFxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiDimqEgUnNwYWNrICR7c2lkZURpc3BsYXl9IEFwcCAoJHtlbnZEaXNwbGF5fSlcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4oCiIFsgICAke3NpZGV9LWVudHJ5LmpzIF0g4pSA4pSA4pa2IFvilqAgJHtzaWRlfS1yc3BhY2suanMgXSDilIDilIDilrYgWyAgICR7c2lkZX0tbWV0ZW9yLmpzIF1cbipcbiogVGhpcyBmaWxlIGlzIGVtcHR5IGJlY2F1c2UgXFxgbWV0ZW9yLm1haW5Nb2R1bGUuJHtzaWRlfVxcYCBpcyBub3Qgc2V0IGluIHBhY2thZ2UuanNvbi5cbipcbiR7QVVUT19HRU5FUkFURURfV0FSTklOR31cbiovYDtcbiAgICB9XG4gICAgcmV0dXJuIGAvKipcbiogQGZpbGUgJHtzaWRlfS1yc3BhY2suanNcbiogQGRlc2NyaXB0aW9uIEJ1bmRsZWQgb3V0cHV0IGdlbmVyYXRlZCBieSBSc3BhY2tcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4pqhIFJzcGFjayAke3NpZGVEaXNwbGF5fSBBcHAgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBbICAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBb4pagICR7c2lkZX0tcnNwYWNrLmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyB0aGUgYnVuZGxlZCBvdXRwdXQgZ2VuZXJhdGVkIGJ5IFJzcGFjay5cbiogSXQgY29udGFpbnMgYWxsIGFwcGxpY2F0aW9uIGNvZGUgYW5kIGFzc2V0cyBjb21iaW5lZCBpbnRvIG9uZSBidWlsZC5cbiogSXQgaXMgbm90IHVzZWQgZGlyZWN0bHksIGJ1dCB3aWxsIGJlIGltcG9ydGVkIGJ5IHRoZSBNZXRlb3IgbWFpbiBtb2R1bGVcbiogZmlsZSAoXFxgJHtzaWRlfS1tZXRlb3IuanNcXGApIHNvIHRoYXQgTWV0ZW9yIHJ1bnMgdGhlIFJzcGFjayBidW5kbGUuXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gIH1cblxuICAvLyBNZXRlb3IgZmlsZXMgKHJ1biBvciBidWlsZCByb2xlKVxuICBpZiAocm9sZSA9PT0gRklMRV9ST0xFLnJ1biB8fCByb2xlID09PSBGSUxFX1JPTEUuYnVpbGQpIHtcbiAgICBpZiAoIWNvbmZpZz8uZW50cnlGaWxlKSB7XG4gICAgICByZXR1cm4gYC8qKlxuKiBAZmlsZSAke3NpZGV9LW1ldGVvci5qc1xuKiBAZGVzY3JpcHRpb24gTm8gY29kZSBnZW5lcmF0ZWRcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4piE77iPIE1ldGVvciAke3NpZGVEaXNwbGF5fSBBcHAgKCR7ZW52RGlzcGxheX0pXG4qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qIOKAoiBbICAgJHtzaWRlfS1lbnRyeS5qcyBdIOKUgOKUgOKWtiBbICAgJHtzaWRlfS1yc3BhY2suanMgXSDilIDilIDilrYgW+KWoCAke3NpZGV9LW1ldGVvci5qcyBdXG4qXG4qIFRoaXMgZmlsZSBpcyBlbXB0eSBiZWNhdXNlIFxcYG1ldGVvci5tYWluTW9kdWxlLiR7c2lkZX1cXGAgaXMgbm90IHNldCBpbiBwYWNrYWdlLmpzb24uXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gICAgfVxuICAgIHJldHVybiBgLyoqXG4qIEBmaWxlICR7c2lkZX0tbWV0ZW9yLmpzXG4qIEBkZXNjcmlwdGlvbiBNZXRlb3IgcnVudGltZSBmaWxlIHRoYXQgaW1wb3J0cyB0aGUgUnNwYWNrIGJ1bmRsZVxuKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKiDimITvuI8gTWV0ZW9yICR7c2lkZURpc3BsYXl9IEFwcCAoJHtlbnZEaXNwbGF5fSlcbiogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiog4oCiIFsgICAke3NpZGV9LWVudHJ5LmpzIF0g4pSA4pSA4pa2IFsgICAke3NpZGV9LXJzcGFjay5qcyBdIOKUgOKUgOKWtiBb4pagICR7c2lkZX0tbWV0ZW9yLmpzIF1cbipcbiogVGhpcyBmaWxlIG92ZXJyaWRlcyB0aGUgY29ycmVzcG9uZGluZyBcXGBtZXRlb3IubWFpbk1vZHVsZS4ke3NpZGV9XFxgIGVudHJ5IGluXG4qIHBhY2thZ2UuanNvbi4gTWV0ZW9yIGxvYWRzIGl0IGF0IHJ1bnRpbWUsIGFuZCBpdCBpbXBvcnRzIHRoZSBSc3BhY2tcbiogYnVuZGxlIChcXGAke3NpZGV9LXJzcGFjay5qc1xcYCkgc28gdGhlIGFwcGxpY2F0aW9uIGV4ZWN1dGVzIHVzaW5nIHRoZSBidWlsZFxuKiBwcm9kdWNlZCBieSBSc3BhY2suXG4qXG4ke0FVVE9fR0VORVJBVEVEX1dBUk5JTkd9XG4qL2A7XG4gIH1cblxuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgSE1SIGNvZGUgaWYgYXBwbGljYWJsZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIEhNUiBjb2RlIG9yIGVtcHR5IHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRIbXJDb2RlKGNvbmZpZywgcm9sZSkge1xuICBpZiAoIWNvbmZpZz8uZW50cnlGaWxlICYmICFjb25maWc/LmlzVGVzdCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGlmIChyb2xlID09PSBGSUxFX1JPTEUuZW50cnkgJiYgY29uZmlnPy5pc0NsaWVudCAmJiAhY29uZmlnPy5pc1Rlc3QpIHtcbiAgICByZXR1cm4gYC8qIEVuYWJsZXMgSE1SICovXG5pZiAobW9kdWxlLmhvdCkge1xuICBtb2R1bGUuaG90LmFjY2VwdCgpO1xufWA7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGltcG9ydCBjb250ZW50IGJhc2VkIG9uIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBpbXBvcnQgY29udGVudFxuICovXG5mdW5jdGlvbiBnZXRJbXBvcnRDb250ZW50KGNvbmZpZywgc2lkZSwgcm9sZSkge1xuICBpZiAoIWNvbmZpZz8uZW50cnlGaWxlICYmICFjb25maWc/LmlzVGVzdCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGlmIChyb2xlID09PSBGSUxFX1JPTEUuZW50cnkpIHtcbiAgICBpZiAoY29uZmlnPy5pc1Rlc3QpIHtcbiAgICAgIHJldHVybiBgJHtcbiAgICAgICAgY29uZmlnPy5pc1Rlc3RGdWxsQXBwICYmIGNvbmZpZz8ubWFpbkVudHJ5RmlsZVxuICAgICAgICAgID8gYC8qIExpbmsgdG8g8J+UjCBNZXRlb3IgJHtjYXBpdGFsaXplRmlyc3RMZXR0ZXIoXG4gICAgICAgICAgICAgIHNpZGVcbiAgICAgICAgICAgICl9IE1haW4gRW50cnkgKC0tZnVsbC1hcHAgbW9kZSkgKi9cbmltcG9ydCAnLi4vLi4vJHtjb25maWcubWFpbkVudHJ5RmlsZX0nO2BcbiAgICAgICAgICA6IFwiXCJcbiAgICAgIH1cbiR7XG4gIGNvbmZpZz8uZW50cnlGaWxlXG4gICAgPyBgXG4vKiBMaW5rIHRvIPCflIwgTWV0ZW9yICR7Y2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHNpZGUpfSBUZXN0IEVudHJ5ICovXG5pbXBvcnQgJy4uLy4uLyR7Y29uZmlnLmVudHJ5RmlsZX0nO2BcbiAgICA6IFwiXCJcbn1gO1xuICAgIH1cblxuICAgIGlmIChjb25maWc/LmVudHJ5RmlsZSkge1xuICAgICAgcmV0dXJuIGAvKiBMaW5rIHRvIPCflIwgTWV0ZW9yICR7Y2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHNpZGUpfSBFbnRyeSAqL1xuaW1wb3J0ICcuLi8uLi8ke2NvbmZpZz8uZW50cnlGaWxlfSc7YDtcbiAgICB9XG4gIH1cblxuICBpZiAoY29uZmlnPy5vdXRwdXRGaWxlICYmXG4gICAgKHJvbGUgPT09IEZJTEVfUk9MRS5idWlsZCB8fCBjb25maWc/LmlzUHJvZHVjdGlvbiB8fFxuICAgICAgKHJvbGUgPT09IEZJTEVfUk9MRS5ydW4gJiZcbiAgICAgICAgKGNvbmZpZz8uaXNTZXJ2ZXIgfHwgY29uZmlnPy5pc1Rlc3QgfHwgY29uZmlnPy5pc05hdGl2ZSkpKVxuICApIHtcbiAgICByZXR1cm4gYC8qIExpbmsgdG8g4pqhIFJzcGFjayAke2NhcGl0YWxpemVGaXJzdExldHRlcihzaWRlKX0gQXBwICovXG4ke1xuICAoaXNNZXRlb3JCbGF6ZVByb2plY3QoKSAmJiBjb25maWc/LmlzQ2xpZW50ICYmICcvLyBJbiBCbGF6ZSwgaW1wb3J0IGhhcHBlbnMgbGFzdCBzbyBIVE1MIGZpbGVzIHByZWxvYWQgZmlyc3QnKSB8fFxuICBgaW1wb3J0ICcuLyR7Y29uZmlnPy5vdXRwdXRGaWxlIHx8ICcnfSc7YFxufWA7XG4gIH1cblxuICBpZiAocm9sZSA9PT0gRklMRV9ST0xFLnJ1biAmJiBjb25maWc/LmlzU2VydmVyICYmICFjb25maWc/LmlzVGVzdCkge1xuICAgIHJldHVybiAnLyogTm8gbGluayB0byDimITvuI8gTWV0ZW9yIFNlcnZlciBBcHAgYXMgc2VydmVkIGJ5IEhNUiBzZXJ2ZXIgKi8nO1xuICB9XG5cbiAgaWYgKHJvbGUgPT09IEZJTEVfUk9MRS5ydW4gJiYgY29uZmlnPy5pc0NsaWVudCAmJiAhY29uZmlnPy5pc1Rlc3QpIHtcbiAgICByZXR1cm4gJy8qIE5vIGxpbmsgdG8g4pqhIFJzcGFjayBDbGllbnQgQXBwIGFzIHNlcnZlZCBieSBITVIgc2VydmVyICovJztcbiAgfVxuXG4gIGlmIChyb2xlID09PSBGSUxFX1JPTEUub3V0cHV0ICYmIGNvbmZpZz8uaXNDbGllbnQgJiYgIWNvbmZpZz8uaXNUZXN0KSB7XG4gICAgcmV0dXJuICcvKiBObyBjb2RlIGdlbmVyYXRlZCBhcyBzZXJ2ZWQgYnkgSE1SIHNlcnZlciAqLyc7XG4gIH1cblxuICBpZiAocm9sZSA9PT0gRklMRV9ST0xFLm91dHB1dCAmJiAoY29uZmlnPy5pc1NlcnZlciB8fCBjb25maWc/LmlzVGVzdCkpIHtcbiAgICByZXR1cm4gJy8qIENvZGUgZ2VuZXJhdGVkICovJztcbiAgfVxuXG4gIGlmIChyb2xlID09PSBGSUxFX1JPTEUuZW50cnkgJiYgY29uZmlnPy5pc1Rlc3QpIHtcbiAgICByZXR1cm4gJy8qIFRlc3RzIGF1dG9tYXRpY2FsbHkgaW1wb3J0ZWQgKi8nO1xuICB9XG5cbiAgcmV0dXJuICcnO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBidWlsZCBmaWxlIGNvbnRlbnQgYmFzZWQgb24gY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gQ29uZmlndXJhdGlvbiBvYmplY3RcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBidWlsZCBmaWxlIGNvbnRlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1aWxkRmlsZUNvbnRlbnQoY29uZmlnKSB7XG4gIC8vIEV4dHJhY3QgY29uZmlndXJhdGlvbiB2YWx1ZXNcbiAgY29uc3QgbW9kdWxlID0gY29uZmlnPy5pc1Rlc3QgPyAndGVzdCcgOiBjb25maWc/LmlzTWFpbiA/ICdtYWluJyA6ICcnO1xuICBjb25zdCBzaWRlID0gY29uZmlnPy5pc1Rlc3RNb2R1bGUgPyAndGVzdCcgOiBjb25maWc/LmlzU2VydmVyID8gJ3NlcnZlcicgOiBjb25maWc/LmlzQ2xpZW50ID8gJ2NsaWVudCcgOiAnJztcbiAgY29uc3QgZW52ID0gY29uZmlnPy5pc0RldmVsb3BtZW50ID8gJ2RldmVsb3BtZW50JyA6IGNvbmZpZz8uaXNQcm9kdWN0aW9uID8gJ3Byb2R1Y3Rpb24nIDogJyc7XG4gIGNvbnN0IHJvbGUgPSBjb25maWc/LnJvbGU7XG5cbiAgLy8gR2V0IGJhbm5lciBiYXNlZCBvbiBjb25maWd1cmF0aW9uXG4gIGNvbnN0IGJhbm5lciA9IGdldEJhbm5lcihjb25maWcsIHNpZGUsIGVudiwgbW9kdWxlLCByb2xlKTtcblxuICAvLyBHZXQgSE1SIGNvZGUgaWYgYXBwbGljYWJsZVxuICBjb25zdCBobXIgPSBnZXRIbXJDb2RlKGNvbmZpZywgcm9sZSk7XG5cbiAgLy8gR2V0IGltcG9ydCBjb250ZW50IGJhc2VkIG9uIGNvbmZpZ3VyYXRpb25cbiAgY29uc3QgaW1wb3J0Q29udGVudCA9IGdldEltcG9ydENvbnRlbnQoY29uZmlnLCBzaWRlLCByb2xlKTtcblxuICAvLyBDb21iaW5lIGFsbCBwYXJ0cyB0byBjcmVhdGUgdGhlIGZpbGUgY29udGVudFxuICByZXR1cm4gYCR7YmFubmVyfVxuJHtobXIgJiYgYFxuJHtobXJ9XG5gIHx8ICcnfVxuJHtpbXBvcnRDb250ZW50fVxuYDtcbn1cblxuLyoqXG4gKiBDbGVhbnMgdGhlIGJ1aWxkIGNvbnRleHQgZmlsZXMgb2YgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnRcbiAqIFJlbW92ZXMgYWxsIGJ1aWxkIGZpbGVzIGFuZCBkaXJlY3RvcmllcyBmb3IgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnRcbiAqIEFsc28gY2xlYW5zIF9idWlsZC0qIGZpbGVzIGZyb20gcHVibGljIGFuZCBwcml2YXRlIGZvbGRlcnNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5CdWlsZENvbnRleHRGaWxlcygpIHtcbiAgY29uc3QgYXBwRGlyID0gZ2V0TWV0ZW9yQXBwRGlyKCk7XG4gIGNvbnN0IGJ1aWxkQ29udGV4dFBhdGggPSBwYXRoLmpvaW4oYXBwRGlyLCBSU1BBQ0tfQlVJTERfQ09OVEVYVCk7XG5cbiAgLy8gT25seSBwcm9jZWVkIGlmIHRoZSBidWlsZCBjb250ZXh0IGRpcmVjdG9yeSBleGlzdHNcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGJ1aWxkQ29udGV4dFBhdGgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gR2V0IGN1cnJlbnQgZW52aXJvbm1lbnRcbiAgY29uc3QgZW52ID0ge1xuICAgIC4uLihpc01ldGVvckFwcERldmVsb3BtZW50KCkgPyB7IGlzRGV2ZWxvcG1lbnQ6IHRydWUgfSA6IHsgaXNQcm9kdWN0aW9uOiB0cnVlIH0pLFxuICAgIGlzTmF0aXZlOiBpc01ldGVvckFwcE5hdGl2ZSgpLFxuICB9O1xuXG4gIHRyeSB7XG4gICAgLy8gQ2xlYW4gbWFpbiBtb2R1bGUgZGlyZWN0b3JpZXNcbiAgICBjb25zdCBtYWluQ2xpZW50UGF0aCA9IHBhdGguZGlybmFtZShwYXRoLmpvaW4oYnVpbGRDb250ZXh0UGF0aCwgZ2V0QnVpbGRGaWxlUGF0aCh7IGlzTWFpbjogdHJ1ZSwgaXNDbGllbnQ6IHRydWUsIC4uLmVudiB9KSkpO1xuICAgIGNvbnN0IG1haW5TZXJ2ZXJQYXRoID0gcGF0aC5kaXJuYW1lKHBhdGguam9pbihidWlsZENvbnRleHRQYXRoLCBnZXRCdWlsZEZpbGVQYXRoKHsgaXNNYWluOiB0cnVlLCBpc1NlcnZlcjogdHJ1ZSwgLi4uZW52IH0pKSk7XG5cbiAgICAvLyBDbGVhbiB0ZXN0IG1vZHVsZSBkaXJlY3RvcmllcyBpZiB0aGV5IGV4aXN0XG4gICAgY29uc3QgdGVzdE1vZHVsZVBhdGggPSBwYXRoLmRpcm5hbWUocGF0aC5qb2luKGJ1aWxkQ29udGV4dFBhdGgsIGdldEJ1aWxkRmlsZVBhdGgoeyBpc1Rlc3Q6IHRydWUsIGlzVGVzdE1vZHVsZTogdHJ1ZSB9KSkpO1xuICAgIGNvbnN0IHRlc3RDbGllbnRQYXRoID0gcGF0aC5kaXJuYW1lKHBhdGguam9pbihidWlsZENvbnRleHRQYXRoLCBnZXRCdWlsZEZpbGVQYXRoKHsgaXNUZXN0OiB0cnVlLCBpc0NsaWVudDogdHJ1ZSB9KSkpO1xuICAgIGNvbnN0IHRlc3RTZXJ2ZXJQYXRoID0gcGF0aC5kaXJuYW1lKHBhdGguam9pbihidWlsZENvbnRleHRQYXRoLCBnZXRCdWlsZEZpbGVQYXRoKHsgaXNUZXN0OiB0cnVlLCBpc1NlcnZlcjogdHJ1ZSB9KSkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgU2V0IHRvIGVuc3VyZSB1bmlxdWUgZGlyZWN0b3J5IHBhdGhzXG4gICAgY29uc3QgdW5pcXVlRGlyUGF0aHMgPSBuZXcgU2V0KFttYWluQ2xpZW50UGF0aCwgbWFpblNlcnZlclBhdGgsIHRlc3RNb2R1bGVQYXRoLCB0ZXN0Q2xpZW50UGF0aCwgdGVzdFNlcnZlclBhdGhdKTtcblxuICAgIC8vIFJlbW92ZSBkaXJlY3RvcmllcyBpZiB0aGV5IGV4aXN0XG4gICAgWy4uLnVuaXF1ZURpclBhdGhzXS5mb3JFYWNoKGRpclBhdGggPT4ge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGlyUGF0aCkpIHtcbiAgICAgICAgZnMucm1TeW5jKGRpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENsZWFuIF9idWlsZC0qIGZpbGVzIGZyb20gcHVibGljIGFuZCBwcml2YXRlIGZvbGRlcnNcbiAgICBjb25zdCBwdWJsaWNEaXIgPSBwYXRoLmpvaW4oYXBwRGlyLCAncHVibGljJyk7XG4gICAgY29uc3QgcHJpdmF0ZURpciA9IHBhdGguam9pbihhcHBEaXIsICdwcml2YXRlJyk7XG5cbiAgICBbcHVibGljRGlyLCBwcml2YXRlRGlyXS5mb3JFYWNoKGRpciA9PiB7XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAoW1JTUEFDS19BU1NFVFNfQ09OVEVYVCwgUlNQQUNLX0NIVU5LU19DT05URVhULCBSU1BBQ0tfRE9DVE9SX0NPTlRFWFRdLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgICAgICAgIGZzLnJtU3luYyhmaWxlUGF0aCwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gQWxzbyByZW1vdmUgY2xpZW50LXJzcGFjay5qcyBmcm9tIHB1YmxpYyBkaXJlY3RvcnkgaWYgaXQgZXhpc3RzXG4gICAgICAgICAgaWYgKGRpciA9PT0gcHVibGljRGlyKSB7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRSc3BhY2tQYXRoID0gcGF0aC5qb2luKGRpciwgJ2NsaWVudC1yc3BhY2suanMnKTtcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGNsaWVudFJzcGFja1BhdGgpKSB7XG4gICAgICAgICAgICAgIGZzLnJtU3luYyhjbGllbnRSc3BhY2tQYXRoLCB7IGZvcmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbG9nRXJyb3IoYEZhaWxlZCB0byBjbGVhbiBfYnVpbGQtKiBmaWxlcyBmcm9tICR7ZGlyfTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKGBGYWlsZWQgdG8gY2xlYW4gYnVpbGQgY29udGV4dCBmaWxlczogJHtlcnJvci5tZXNzYWdlfWApO1xuICB9XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGUgcnNwYWNrLmNvbmZpZy5qcyBmaWxlIGV4aXN0cyBhdCB0aGUgcHJvamVjdCBsZXZlbFxuICogQ3JlYXRlcyB0aGUgZmlsZSBpZiBpdCBkb2Vzbid0IGV4aXN0IHdpdGggdGhlIHJlcXVpcmVkIHRlbXBsYXRlXG4gKiBXaWxsIG5vdCBjcmVhdGUgYSBuZXcgZmlsZSBpZiByc3BhY2suY29uZmlnLm1qcyBvciByc3BhY2suY29uZmlnLmNqcyBleGlzdHNcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFBhdGggdG8gdGhlIHJzcGFjay5jb25maWcgZmlsZSAoLmpzLCAubWpzLCBvciAuY2pzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlUnNwYWNrQ29uZmlnRXhpc3RzKCkge1xuICBjb25zdCBhcHBEaXIgPSBnZXRNZXRlb3JBcHBEaXIoKTtcblxuICAvLyBDaGVjayBpZiBhbnkgY29uZmlnIGZpbGUgYWxyZWFkeSBleGlzdHMgdXNpbmcgdGhlIGhlbHBlciBmdW5jdGlvblxuICBjb25zdCBleGlzdGluZ0NvbmZpZ1BhdGggPSBnZXRDdXN0b21Db25maWdGaWxlUGF0aChhcHBEaXIpO1xuICBpZiAoZXhpc3RpbmdDb25maWdQYXRoKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nQ29uZmlnUGF0aDtcbiAgfVxuXG4gIC8vIElmIG5vIGNvbmZpZyBmaWxlIGV4aXN0cywgd2UnbGwgY3JlYXRlIGEgLmpzIG9uZVxuICBjb25zdCBqc0NvbmZpZ1BhdGggPSBwYXRoLmpvaW4oYXBwRGlyLCAncnNwYWNrLmNvbmZpZy5qcycpO1xuXG4gIGNvbnN0IGNvbmZpZ1RlbXBsYXRlID0gYGNvbnN0IHsgZGVmaW5lQ29uZmlnIH0gPSByZXF1aXJlKCdAbWV0ZW9yanMvcnNwYWNrJyk7XG5cbi8qKlxuICogUnNwYWNrIGNvbmZpZ3VyYXRpb24gZm9yIE1ldGVvciBwcm9qZWN0cy5cbiAqXG4gKiBQcm92aWRlcyB0eXBlZCBmbGFncyBvbiB0aGUgXFxgTWV0ZW9yXFxgIG9iamVjdCwgc3VjaCBhczpcbiAqIC0gXFxgTWV0ZW9yLmlzQ2xpZW50XFxgIC8gXFxgTWV0ZW9yLmlzU2VydmVyXFxgXG4gKiAtIFxcYE1ldGVvci5pc0RldmVsb3BtZW50XFxgIC8gXFxgTWV0ZW9yLmlzUHJvZHVjdGlvblxcYFxuICogLSDigKZhbmQgb3RoZXIgZmxhZ3MgYXZhaWxhYmxlXG4gKlxuICogVXNlIHRoZXNlIGZsYWdzIHRvIGFkanVzdCB5b3VyIGJ1aWxkIHNldHRpbmdzIGJhc2VkIG9uIGVudmlyb25tZW50LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZUNvbmZpZyhNZXRlb3IgPT4ge1xuICByZXR1cm4ge307XG59KTtcbmA7XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKGpzQ29uZmlnUGF0aCkpIHtcbiAgICB0cnkge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqc0NvbmZpZ1BhdGgsIGNvbmZpZ1RlbXBsYXRlLCAndXRmOCcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dFcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSByc3BhY2suY29uZmlnLmpzIGZpbGU6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBqc0NvbmZpZ1BhdGg7XG59XG4iLCIvKipcbiAqIEBtb2R1bGUgcHJvY2Vzc2VzXG4gKiBAZGVzY3JpcHRpb24gRnVuY3Rpb25zIGZvciBtYW5hZ2luZyBSc3BhY2sgcHJvY2Vzc2VzXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuY29uc3Qge1xuICBzcGF3blByb2Nlc3MsXG4gIHN0b3BQcm9jZXNzLFxuICBpc1Byb2Nlc3NSdW5uaW5nXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL3Byb2Nlc3MnKTtcblxuY29uc3Qge1xuICBsb2dFcnJvcixcbiAgbG9nSW5mbyxcbiAgbG9nUmF3LFxuICBnZXRSdW5Mb2csXG59ID0gcmVxdWlyZShcIm1ldGVvci90b29scy1jb3JlL2xpYi9sb2dcIik7XG5cbmNvbnN0IHtcbiAgZ2V0TWV0ZW9yQXBwRGlyLFxuICBpc01ldGVvckFwcFRlc3QsXG4gIGlzTWV0ZW9yQXBwVGVzdEZ1bGxBcHAsXG4gIGlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQsXG4gIGlzTWV0ZW9yQXBwUHJvZHVjdGlvbixcbiAgaXNNZXRlb3JBcHBEZWJ1ZyxcbiAgaXNNZXRlb3JBcHBSdW4sXG4gIGlzTWV0ZW9yQXBwQnVpbGQsXG4gIGlzTWV0ZW9yQXBwTmF0aXZlLFxuICBpc01ldGVvckJsYXplUHJvamVjdCxcbiAgaXNNZXRlb3JCbGF6ZUhvdFByb2plY3QsXG4gIGdldE1ldGVvckluaXRpYWxBcHBFbnRyeXBvaW50cyxcbiAgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlLFxuICBpc01ldGVvckJ1bmRsZVZpc3VhbGl6ZXJQcm9qZWN0LFxuICBnZXRNZXRlb3JBcHBQb3J0LFxuICBpbmhlcml0TWV0ZW9yVG9vbE5vZGVGbGFncyxcbn0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvbWV0ZW9yJyk7XG5cbmNvbnN0IHtcbiAgY2hlY2tOcG1EZXBlbmRlbmN5RXhpc3RzLFxuICBnZXROcHhDb21tYW5kLFxuICBnZXROb2RlQmluRW52LFxuICBnZXRNb25vcmVwb1BhdGgsXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL25wbScpO1xuXG5jb25zdCB7XG4gIGdldEdsb2JhbFN0YXRlLFxuICBzZXRHbG9iYWxTdGF0ZVxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9nbG9iYWwtc3RhdGUnKTtcblxuY29uc3Qge1xuICBHTE9CQUxfU1RBVEVfS0VZUyxcbiAgUlNQQUNLX0NIVU5LU19DT05URVhULFxuICBSU1BBQ0tfQVNTRVRTX0NPTlRFWFQsXG4gIEZJTEVfUk9MRSxcbn0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5jb25zdCB7XG4gIGdldEJ1aWxkRmlsZVBhdGgsXG4gIGdldEJ1aWxkRmlsZUNvbnRlbnQsXG59ID0gcmVxdWlyZSgnLi9idWlsZC1jb250ZXh0Jyk7XG5cbmltcG9ydCB7XG4gIGxvZ0NvbXBpbGF0aW9uT3V0cHV0LFxuICBsb2dIbXJTZXJ2ZXJTdGFydGVkLFxuICBwYXJzZU1ldGVvclJzcGFja091dHB1dCxcbiAgc2hvdWxkTG9nVmVyYm9zZSxcbiAgc3RyaXBSc3BhY2tMYWJlbCxcbn0gZnJvbSBcIi4vbG9nZ2luZ1wiO1xuaW1wb3J0IHsgaXNNZXRlb3JBcHBQcm9maWxlIH0gZnJvbSBcIi4uLy4uL3Rvb2xzLWNvcmUvbGliL21ldGVvclwiO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldlNlcnZlclBvcnQgYmFzZWQgb24gcHJvY2Vzcy5lbnYuUE9SVFxuICogQmFzZSBwb3J0IGlzIDgwNzcsIGFuZCB3ZSBhZGQgdGhlIHN1bSBvZiB0aGUgZGlnaXRzIG9mIHByb2Nlc3MuZW52LlBPUlRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBjYWxjdWxhdGVkIGRldlNlcnZlclBvcnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZURldlNlcnZlclBvcnQoKSB7XG4gIGNvbnN0IHBvcnQgPSBnZXRNZXRlb3JBcHBQb3J0KCk7XG4gIGNvbnN0IGJhc2VQb3J0ID0gODA3NztcblxuICAvLyBTdW0gdGhlIGRpZ2l0cyBvZiB0aGUgcG9ydFxuICBjb25zdCBkaWdpdFN1bSA9IHBvcnQuc3BsaXQoJycpLnJlZHVjZSgoc3VtLCBkaWdpdCkgPT4gc3VtICsgcGFyc2VJbnQoZGlnaXQsIDEwKSwgMCk7XG5cbiAgcmV0dXJuIGJhc2VQb3J0ICsgZGlnaXRTdW07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgUnNkb2N0b3IgY2xpZW50IHBvcnQgYmFzZWQgb24gcHJvY2Vzcy5lbnYuUE9SVFxuICogQmFzZSBwb3J0IGlzIDg4ODUsIGFuZCB3ZSBhZGQgdGhlIHN1bSBvZiB0aGUgZGlnaXRzIG9mIHByb2Nlc3MuZW52LlBPUlRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBjYWxjdWxhdGVkIFJzZG9jdG9yIGNsaWVudCBwb3J0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVSc2RvY3RvckNsaWVudFBvcnQoKSB7XG4gIGNvbnN0IHBvcnQgPSBnZXRNZXRlb3JBcHBQb3J0KCk7XG4gIGNvbnN0IGJhc2VQb3J0ID0gODg4NTtcblxuICAvLyBTdW0gdGhlIGRpZ2l0cyBvZiB0aGUgcG9ydFxuICBjb25zdCBkaWdpdFN1bSA9IHBvcnQuc3BsaXQoJycpLnJlZHVjZSgoc3VtLCBkaWdpdCkgPT4gc3VtICsgcGFyc2VJbnQoZGlnaXQsIDEwKSwgMCk7XG5cbiAgcmV0dXJuIGJhc2VQb3J0ICsgZGlnaXRTdW07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgUnNkb2N0b3Igc2VydmVyIHBvcnQgYmFzZWQgb24gcHJvY2Vzcy5lbnYuUE9SVFxuICogQmFzZSBwb3J0IGlzIDg4ODUsIGFuZCB3ZSBhZGQgdGhlIHN1bSBvZiB0aGUgZGlnaXRzIG9mIHByb2Nlc3MuZW52LlBPUlQgKyAxXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgY2FsY3VsYXRlZCBSc2RvY3RvciBzZXJ2ZXIgcG9ydFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUnNkb2N0b3JTZXJ2ZXJQb3J0KCkge1xuICBjb25zdCBwb3J0ID0gZ2V0TWV0ZW9yQXBwUG9ydCgpO1xuICBjb25zdCBiYXNlUG9ydCA9IDg4ODU7XG5cbiAgLy8gU3VtIHRoZSBkaWdpdHMgb2YgdGhlIHBvcnRcbiAgY29uc3QgZGlnaXRTdW0gPSBwb3J0LnNwbGl0KCcnKS5yZWR1Y2UoKHN1bSwgZGlnaXQpID0+IHN1bSArIHBhcnNlSW50KGRpZ2l0LCAxMCksIDApO1xuXG4gIC8vIEFkZCAxIHRvIGRpZmZlcmVudGlhdGUgZnJvbSBjbGllbnQgcG9ydFxuICByZXR1cm4gYmFzZVBvcnQgKyBkaWdpdFN1bSArIDE7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGNoZWNrIGZvciBhIGZpbGUgd2l0aCBkaWZmZXJlbnQgZXh0ZW5zaW9ucyBpbiBvcmRlciBvZiBwcmlvcml0eVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VQYXRoIC0gVGhlIGJhc2UgZGlyZWN0b3J5IHBhdGggKHdpdGhvdXQgJ3JzcGFjay5jb25maWcnIGFuZCBleHRlbnNpb24pXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFRoZSBmdWxsIHBhdGggd2l0aCBleHRlbnNpb24gaWYgZm91bmQsIG51bGwgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXN0b21Db25maWdGaWxlUGF0aChiYXNlUGF0aCA9IGdldE1ldGVvckFwcERpcigpKSB7XG4gIGNvbnN0IGNvbmZpZ0Jhc2VQYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCAncnNwYWNrLmNvbmZpZycpO1xuXG4gIC8vIENoZWNrIGZvciAuanMgZXh0ZW5zaW9uIGZpcnN0IChoaWdoZXN0IHByaW9yaXR5KVxuICBjb25zdCBqc1BhdGggPSBgJHtjb25maWdCYXNlUGF0aH0uanNgO1xuICBpZiAoZnMuZXhpc3RzU3luYyhqc1BhdGgpKSB7XG4gICAgcmV0dXJuIGpzUGF0aDtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciAudHMgZXh0ZW5zaW9uIG5leHRcbiAgY29uc3QgdHNQYXRoID0gYCR7Y29uZmlnQmFzZVBhdGh9LnRzYDtcbiAgaWYgKGZzLmV4aXN0c1N5bmModHNQYXRoKSkge1xuICAgIHJldHVybiB0c1BhdGg7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgLm1qcyBleHRlbnNpb24gbmV4dFxuICBjb25zdCBtanNQYXRoID0gYCR7Y29uZmlnQmFzZVBhdGh9Lm1qc2A7XG4gIGlmIChmcy5leGlzdHNTeW5jKG1qc1BhdGgpKSB7XG4gICAgcmV0dXJuIG1qc1BhdGg7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgLmNqcyBleHRlbnNpb24gbGFzdFxuICBjb25zdCBjanNQYXRoID0gYCR7Y29uZmlnQmFzZVBhdGh9LmNqc2A7XG4gIGlmIChmcy5leGlzdHNTeW5jKGNqc1BhdGgpKSB7XG4gICAgcmV0dXJuIGNqc1BhdGg7XG4gIH1cblxuICAvLyBObyB2YWxpZCBjb25maWcgZmlsZSBmb3VuZCB3aXRoIGFueSBleHRlbnNpb25cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYXBwcm9wcmlhdGUgY29uZmlnIGZpbGUgbmFtZSBiYXNlZCBvbiBlbnZpcm9ubWVudFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIFJzcGFjayBjb25maWcgZmlsZVxuICogQHRocm93cyB7RXJyb3J9IElmIG5vIHZhbGlkIGNvbmZpZyBmaWxlIGlzIGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWdGaWxlUGF0aCgpIHtcbiAgLy8gQ2hlY2sgaWYgdGhlIGNvbmZpZyBmaWxlIGV4aXN0cyBhdCB0aGUgY3VycmVudCBwYXRoIHdpdGggYW55IG9mIHRoZSBzdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICBjb25zdCBkZWZhdWx0Q29uZmlnQmFzZVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcy9AbWV0ZW9yanMvcnNwYWNrJyk7XG4gIGNvbnN0IGRlZmF1bHRDb25maWdQYXRoID0gZ2V0Q3VzdG9tQ29uZmlnRmlsZVBhdGgoZGVmYXVsdENvbmZpZ0Jhc2VQYXRoKTtcbiAgaWYgKGRlZmF1bHRDb25maWdQYXRoKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRDb25maWdQYXRoO1xuICB9XG5cbiAgLy8gSWYgbm90IGZvdW5kLCBjaGVjayBpZiB3ZSdyZSBpbiBhIG1vbm9yZXBvIGFuZCBsb29rIGZvciBhbHRlcm5hdGl2ZSBjb25maWdcbiAgY29uc3QgbW9ub3JlcG9QYXRoID0gZ2V0TW9ub3JlcG9QYXRoKCk7XG4gIGlmIChtb25vcmVwb1BhdGgpIHtcbiAgICBjb25zdCBhbHRlcm5hdGl2ZUNvbmZpZ0Jhc2VQYXRoID0gcGF0aC5qb2luKG1vbm9yZXBvUGF0aCwgJ25vZGVfbW9kdWxlcy9AbWV0ZW9yanMvcnNwYWNrJyk7XG4gICAgY29uc3QgYWx0ZXJuYXRpdmVDb25maWdQYXRoID0gZ2V0Q3VzdG9tQ29uZmlnRmlsZVBhdGgoYWx0ZXJuYXRpdmVDb25maWdCYXNlUGF0aCk7XG4gICAgaWYgKGFsdGVybmF0aXZlQ29uZmlnUGF0aCkge1xuICAgICAgcmV0dXJuIGFsdGVybmF0aXZlQ29uZmlnUGF0aDtcbiAgICB9XG4gIH1cblxuICAvLyBJZiBubyBjb25maWcgZmlsZSBpcyBmb3VuZCwgdGhyb3cgYW4gZXJyb3Igd2l0aCBzdWdnZXN0aW9uIHRvIHJ1biBucG0gaW5zdGFsbFxuICBjb25zdCBpc1lhcm5Qcm9qID0gcHJvY2Vzcy5lbnYuWUFSTl9FTkFCTEVEID09PSAndHJ1ZSc7XG4gIGNvbnN0IGluc3RhbGxDb21tYW5kID0gaXNZYXJuUHJvaiA/ICd5YXJuIGluc3RhbGwnIDogJ25wbSBpbnN0YWxsJztcbiAgY29uc3QgaXNDSSA9ICEhKFxuICAgIHByb2Nlc3MuZW52LkNJIHx8ICAgICAgICAgICAgICAgICAgICAgIC8vIE1vc3QgQ0kgcHJvdmlkZXJzIChHaXRIdWIgQWN0aW9ucywgR2l0TGFiIENJLCBUcmF2aXMsIENpcmNsZUNJLCBCdWlsZGtpdGUsIERyb25lLCBTZW1hcGhvcmUsIGV0Yy4pXG4gICAgcHJvY2Vzcy5lbnYuR0lUSFVCX0FDVElPTlMgfHwgICAgICAgICAgLy8gR2l0SHViIEFjdGlvbnNcbiAgICBwcm9jZXNzLmVudi5KRU5LSU5TX1VSTCB8fCAgICAgICAgICAgICAvLyBKZW5raW5zXG4gICAgcHJvY2Vzcy5lbnYuVEVBTUNJVFlfVkVSU0lPTiB8fCAgICAgICAgLy8gVGVhbUNpdHlcbiAgICBwcm9jZXNzLmVudi5DT0RFQlVJTERfQlVJTERfQVJOIHx8ICAgICAvLyBBV1MgQ29kZUJ1aWxkXG4gICAgcHJvY2Vzcy5lbnYuQlVJTERFUl9PVVRQVVQgfHwgICAgICAgICAgIC8vIEdvb2dsZSBDbG91ZCBCdWlsZFxuICAgIHByb2Nlc3MuZW52LlRGX0JVSUxEIHx8ICAgICAgICAgICAgICAgIC8vIEF6dXJlIFBpcGVsaW5lc1xuICAgIHByb2Nlc3MuZW52LktVQkVSTkVURVNfU0VSVklDRV9IT1NUICAgIC8vIEt1YmVybmV0ZXNcbiAgKTtcbiAgbGV0IG1lc3NhZ2UgPVxuICAgIGBDb3VsZCBub3QgZmluZCByc3BhY2suY29uZmlnLmpzLCByc3BhY2suY29uZmlnLnRzLCByc3BhY2suY29uZmlnLm1qcywgb3IgcnNwYWNrLmNvbmZpZy5janMuXFxuXFxuYCArXG4gICAgYFRyeSBydW5uaW5nIFxcYG1ldGVvciB1cGRhdGUgLS1ucG1cXGAgZm9sbG93ZWQgYnkgXFxgJHtpbnN0YWxsQ29tbWFuZH1cXGAgaW4geW91ciBwcm9qZWN0IGRpcmVjdG9yeSBhbmQgdGhlbiByZS1ydW4gdGhlIGJ1aWxkLlxcbmAgK1xuICAgIGBUaGlzIHdpbGwgZW5zdXJlIEBtZXRlb3Jqcy9yc3BhY2sgaXMgaW5zdGFsbGVkIGNvcnJlY3RseS5gO1xuICBpZiAoaXNDSSkge1xuICAgIG1lc3NhZ2UgKz0gYFxcblxcbkl0IGxvb2tzIGxpa2UgeW91IGFyZSBydW5uaW5nIGluIGEgQ0kvRG9ja2VyIGVudmlyb25tZW50LlxcbmAgK1xuICAgICAgYE1ha2Ugc3VyZSB5b3VyIERvY2tlcmZpbGUgb3IgQ0kgcGlwZWxpbmUgcnVucyBcXGAobWV0ZW9yIHVwZGF0ZSAtLW5wbSAyPi9kZXYvbnVsbCB8fCB0cnVlKSAmJiAke2luc3RhbGxDb21tYW5kfVxcYCBiZWZvcmUgYnVpbGRpbmcuXFxuYCArXG4gICAgICBgU2VlOiBodHRwczovL2RvY3MubWV0ZW9yLmNvbS9hYm91dC9tb2Rlcm4tYnVpbGQtc3RhY2svcnNwYWNrLWJ1bmRsZXItaW50ZWdyYXRpb24uaHRtbCNkb2NrZXJgO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBhcHByb3ByaWF0ZSBSc3BhY2sgZW52aXJvbm1lbnQgdmFyaWFibGVzIGFuZCBjb21tYW5kIGxpbmUgYXJndW1lbnRzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzQ2xpZW50IC0gV2hldGhlciB0aGlzIGlzIGZvciBjbGllbnQtc2lkZSBidWlsZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzU2VydmVyIC0gV2hldGhlciB0aGlzIGlzIGZvciBzZXJ2ZXItc2lkZSBidWlsZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzVGVzdCAtIFdoZXRoZXIgdGhpcyBpcyBmb3IgdGVzdCBidWlsZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzVGVzdExpa2UgLSBXaGV0aGVyIHRlc3QgZW52cyBzaG91bGQgYmUgaW5oZXJpdGVkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3QgY29udGFpbmluZyBwYXJhbXMgKGNvbW1hbmQgbGluZSBhcmd1bWVudHMpIGFuZCBlbnZzIChlbnZpcm9ubWVudCB2YXJpYWJsZXMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSc3BhY2tFbnYoeyBpc0NsaWVudCwgaXNTZXJ2ZXIsIGlzVGVzdDogaW5Jc1Rlc3QsIGlzVGVzdExpa2U6IGluSXNUZXN0TGlrZSB9KSB7XG4gIGNvbnN0IFJTUEFDS19CVUlMRF9DT05URVhUID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKS5SU1BBQ0tfQlVJTERfQ09OVEVYVDtcblxuICBjb25zdCBpbml0aWFsRW50cnlwb2ludHMgPSBnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMoKTtcbiAgY29uc3QgaXNUZXN0ID0gaW5Jc1Rlc3QgIT0gbnVsbCA/IGluSXNUZXN0IDogaXNNZXRlb3JBcHBUZXN0KCk7XG4gIGNvbnN0IGlzVGVzdExpa2UgPSBpc1Rlc3QgfHwgaW5Jc1Rlc3RMaWtlO1xuICBjb25zdCBpc1Rlc3RFYWdlciA9XG4gICAgaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RNb2R1bGUgPT0gbnVsbCAmJlxuICAgIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0Q2xpZW50ID09IG51bGwgJiZcbiAgICBpbml0aWFsRW50cnlwb2ludHMudGVzdFNlcnZlciA9PSBudWxsO1xuICBjb25zdCBpc1Rlc3RNb2R1bGUgPSBpbml0aWFsRW50cnlwb2ludHMudGVzdE1vZHVsZSAhPSBudWxsIHx8IGlzVGVzdEVhZ2VyO1xuICBjb25zdCBpc1Rlc3RGdWxsQXBwID0gaXNNZXRlb3JBcHBUZXN0RnVsbEFwcCgpO1xuXG4gIGNvbnN0IG1vZHVsZSA9IGlzVGVzdCA/IHsgaXNUZXN0OiB0cnVlIH0gOiB7IGlzTWFpbjogdHJ1ZSB9O1xuICBjb25zdCBlbnYgPSBpc01ldGVvckFwcERldmVsb3BtZW50KClcbiAgICA/IHsgaXNEZXZlbG9wbWVudDogdHJ1ZSB9XG4gICAgOiB7IGlzUHJvZHVjdGlvbjogdHJ1ZSB9O1xuICBjb25zdCBzaWRlID0gaXNDbGllbnQgPyB7IGlzQ2xpZW50OiB0cnVlIH0gOiB7IGlzU2VydmVyOiB0cnVlIH07XG4gIGNvbnN0IGNvbW1hbmRSb2xlID0gaXNNZXRlb3JBcHBSdW4oKVxuICAgID8geyByb2xlOiBGSUxFX1JPTEUucnVuIH1cbiAgICA6IGlzTWV0ZW9yQXBwQnVpbGQoKVxuICAgICAgPyB7IHJvbGU6IEZJTEVfUk9MRS5idWlsZCB9XG4gICAgICA6IHsgcm9sZTogRklMRV9ST0xFLnJ1biB9O1xuXG4gIGNvbnN0IGVudHJ5S2V5ID0gYCR7aXNUZXN0ICYmIGlzVGVzdE1vZHVsZSA/ICd0ZXN0JyA6ICdtYWluJ30ke2lzQ2xpZW50ID8gJ0NsaWVudCcgOiAnU2VydmVyJ31gO1xuICBjb25zdCBpbnB1dEZpbGVQYXRoID0gaW5pdGlhbEVudHJ5cG9pbnRzW2VudHJ5S2V5XTtcbiAgY29uc3QgaXNUeXBlc2NyaXB0RW5hYmxlZCA9IHByb2Nlc3MuZW52Lk1FVEVPUl9UWVBFU0NSSVBUX0VOQUJMRUQgPT09ICd0cnVlJyB8fFxuICAgIGlucHV0RmlsZVBhdGg/LmVuZHNXaXRoKCcudHMnKSB8fFxuICAgIGlucHV0RmlsZVBhdGg/LmVuZHNXaXRoKCcudHN4Jyk7XG5cbiAgY29uc3QgaXNSZWFjdEVuYWJsZWQgPSBwcm9jZXNzLmVudi5NRVRFT1JfUkVBQ1RfRU5BQkxFRCA9PT0gJ3RydWUnO1xuICBjb25zdCBpc0FuZ3VsYXJFbmFibGVkID0gcHJvY2Vzcy5lbnYuTUVURU9SX0FOR1VMQVJfRU5BQkxFRCA9PT0gJ3RydWUnO1xuICBjb25zdCBpc1RzeEVuYWJsZWQgPSBpc1R5cGVzY3JpcHRFbmFibGVkICYmIChpbnB1dEZpbGVQYXRoPy5lbmRzV2l0aCgnLnRzeCcpIHx8IGlzUmVhY3RFbmFibGVkKTtcbiAgY29uc3QgaXNKc3hFbmFibGVkID0gIWlzVHlwZXNjcmlwdEVuYWJsZWQgJiYgKGlucHV0RmlsZVBhdGg/LmVuZHNXaXRoKCcuanN4JykgfHwgaXNSZWFjdEVuYWJsZWQpO1xuXG4gIGNvbnN0IGlzQmxhemVFbmFibGVkID0gaXNNZXRlb3JCbGF6ZVByb2plY3QoKTtcbiAgY29uc3QgaXNCbGF6ZUhvdEVuYWJsZWQgPSBpc01ldGVvckJsYXplSG90UHJvamVjdCgpO1xuICBjb25zdCBpc0J1bmRsZVZpc3VhbGl6ZXJFbmFibGVkID0gaXNNZXRlb3JCdW5kbGVWaXN1YWxpemVyUHJvamVjdCgpO1xuXG4gIGNvbnN0IGlzUHJvZmlsZSA9IGlzTWV0ZW9yQXBwUHJvZmlsZSgpO1xuXG4gIGNvbnN0IHN3Y0V4dGVybmFsSGVscGVycyA9IGNoZWNrTnBtRGVwZW5kZW5jeUV4aXN0cygnQHN3Yy9oZWxwZXJzJyk7XG5cbiAgY29uc3QgY29uZmlnUGF0aCA9IGdldENvbmZpZ0ZpbGVQYXRoKCk7XG4gIGNvbnN0IHByb2plY3RDb25maWdQYXRoID0gZ2V0Q3VzdG9tQ29uZmlnRmlsZVBhdGgoKTtcblxuICBjb25zdCBwYWlycyA9IFtcbiAgICBbXCJpc0RldmVsb3BtZW50XCIsIGlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQoKV0sXG4gICAgW1wiaXNQcm9kdWN0aW9uXCIsIGlzTWV0ZW9yQXBwUHJvZHVjdGlvbigpXSxcbiAgICBbXCJpc0RlYnVnXCIsIGlzTWV0ZW9yQXBwRGVidWcoKV0sXG4gICAgW1wiaXNWZXJib3NlXCIsIGlzTWV0ZW9yQXBwQ29uZmlnTW9kZXJuVmVyYm9zZSgpXSxcbiAgICAuLi4oKGlzUHJvZmlsZSAmJiBbW1wiaXNQcm9maWxlXCIsIGlzTWV0ZW9yQXBwUHJvZmlsZSgpXV0pIHx8IFtdKSxcbiAgICBbXCJpc1Rlc3RcIiwgaXNUZXN0XSxcbiAgICAuLi4oaXNUZXN0TGlrZSA/IFtbXCJpc1Rlc3RMaWtlXCIsIGlzVGVzdExpa2UgfHwgaXNUZXN0XV0gOiBbXSksXG4gICAgLi4uKChpc1Rlc3RMaWtlICYmIGlzVGVzdEZ1bGxBcHAgJiYgW1tcImlzVGVzdEZ1bGxBcHBcIiwgaXNUZXN0RnVsbEFwcF1dKSB8fFxuICAgICAgW10pLFxuICAgIC4uLigoaXNUZXN0TGlrZSAmJiBpc1Rlc3RNb2R1bGUgJiYgW1tcImlzVGVzdE1vZHVsZVwiLCBpc1Rlc3RNb2R1bGVdXSkgfHwgW10pLFxuICAgIC4uLigoaXNUZXN0TGlrZSAmJiBpc1Rlc3RFYWdlciAmJiBbW1wiaXNUZXN0RWFnZXJcIiwgaXNUZXN0RWFnZXJdXSkgfHwgW10pLFxuICAgIFtcImlzUnVuXCIsIGlzTWV0ZW9yQXBwUnVuKCldLFxuICAgIFtcImlzQnVpbGRcIiwgaXNNZXRlb3JBcHBCdWlsZCgpXSxcbiAgICBbXCJpc05hdGl2ZVwiLCBpc01ldGVvckFwcE5hdGl2ZSgpXSxcbiAgICBbXCJpc0NsaWVudFwiLCBpc0NsaWVudF0sXG4gICAgW1wiaXNTZXJ2ZXJcIiwgaXNTZXJ2ZXJdLFxuICAgIFtcbiAgICAgIFwiZW50cnlQYXRoXCIsXG4gICAgICBnZXRCdWlsZEZpbGVQYXRoKHtcbiAgICAgICAgLi4ubW9kdWxlLFxuICAgICAgICAuLi5lbnYsXG4gICAgICAgIC4uLnNpZGUsXG4gICAgICAgIGlzVGVzdE1vZHVsZSxcbiAgICAgICAgcm9sZTogRklMRV9ST0xFLmVudHJ5LFxuICAgICAgfSksXG4gICAgXSxcbiAgICBbXG4gICAgICBcIm91dHB1dFBhdGhcIixcbiAgICAgIGdldEJ1aWxkRmlsZVBhdGgoe1xuICAgICAgICAuLi5tb2R1bGUsXG4gICAgICAgIC4uLmVudixcbiAgICAgICAgLi4uc2lkZSxcbiAgICAgICAgaXNUZXN0TW9kdWxlLFxuICAgICAgICByb2xlOiBGSUxFX1JPTEUub3V0cHV0LFxuICAgICAgfSksXG4gICAgXSxcbiAgICBbXG4gICAgICBcIm91dHB1dEZpbGVuYW1lXCIsXG4gICAgICBnZXRCdWlsZEZpbGVQYXRoKHtcbiAgICAgICAgLi4uZW52LFxuICAgICAgICAuLi5zaWRlLFxuICAgICAgICBpc01haW46IHRydWUsXG4gICAgICAgIHJvbGU6IEZJTEVfUk9MRS5vdXRwdXQsXG4gICAgICAgIG9ubHlGaWxlbmFtZTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgW1xuICAgICAgXCJydW5QYXRoXCIsXG4gICAgICBnZXRCdWlsZEZpbGVQYXRoKHsgLi4ubW9kdWxlLCAuLi5lbnYsIC4uLnNpZGUsIC4uLmNvbW1hbmRSb2xlIH0pLFxuICAgIF0sXG4gICAgW1wiYnVpbGRDb250ZXh0XCIsIFJTUEFDS19CVUlMRF9DT05URVhUXSxcbiAgICBbXCJjaHVua3NDb250ZXh0XCIsIFJTUEFDS19DSFVOS1NfQ09OVEVYVF0sXG4gICAgW1wiYXNzZXRzQ29udGV4dFwiLCBSU1BBQ0tfQVNTRVRTX0NPTlRFWFRdLFxuICAgIFtcImRldlNlcnZlclBvcnRcIiwgcHJvY2Vzcy5lbnYuUlNQQUNLX0RFVlNFUlZFUl9QT1JUXSxcbiAgICBbXCJwcm9qZWN0Q29uZmlnUGF0aFwiLCBwcm9qZWN0Q29uZmlnUGF0aF0sXG4gICAgW1wiY29uZmlnUGF0aFwiLCBjb25maWdQYXRoXSxcbiAgICAuLi4oKGlzVGVzdCAmJlxuICAgICAgaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RDbGllbnQgJiZcbiAgICAgIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0U2VydmVyICYmIFtcbiAgICAgICAgW1widGVzdENsaWVudEVudHJ5XCIsIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0Q2xpZW50XSxcbiAgICAgICAgW1widGVzdFNlcnZlckVudHJ5XCIsIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0U2VydmVyXSxcbiAgICAgIF0pIHx8XG4gICAgICAoaXNUZXN0ICYmXG4gICAgICAgIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0TW9kdWxlICYmIFtcbiAgICAgICAgICBbXCJ0ZXN0RW50cnlcIiwgaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RNb2R1bGVdLFxuICAgICAgICBdKSB8fCBbXG4gICAgICAgIFtcIm1haW5DbGllbnRFbnRyeVwiLCBpbml0aWFsRW50cnlwb2ludHMubWFpbkNsaWVudF0sXG4gICAgICAgIFtcIm1haW5DbGllbnRIdG1sRW50cnlcIiwgaW5pdGlhbEVudHJ5cG9pbnRzLm1haW5DbGllbnRIdG1sXSxcbiAgICAgICAgW1wibWFpblNlcnZlckVudHJ5XCIsIGluaXRpYWxFbnRyeXBvaW50cy5tYWluU2VydmVyXSxcbiAgICAgIF0pLFxuICAgIC4uLigoc3djRXh0ZXJuYWxIZWxwZXJzICYmIFtbXCJzd2NFeHRlcm5hbEhlbHBlcnNcIiwgc3djRXh0ZXJuYWxIZWxwZXJzXV0pIHx8XG4gICAgICBbXSksXG4gICAgLi4uKChpc1JlYWN0RW5hYmxlZCAmJiBbW1wiaXNSZWFjdEVuYWJsZWRcIiwgaXNSZWFjdEVuYWJsZWRdXSkgfHwgW10pLFxuICAgIC4uLigoaXNCbGF6ZUVuYWJsZWQgJiYgW1tcImlzQmxhemVFbmFibGVkXCIsIGlzQmxhemVFbmFibGVkXV0pIHx8IFtdKSxcbiAgICAuLi4oKGlzQmxhemVIb3RFbmFibGVkICYmIFtbXCJpc0JsYXplSG90RW5hYmxlZFwiLCBpc0JsYXplSG90RW5hYmxlZF1dKSB8fFxuICAgICAgW10pLFxuICAgIC4uLigoaXNUeXBlc2NyaXB0RW5hYmxlZCAmJiBbXG4gICAgICBbXCJpc1R5cGVzY3JpcHRFbmFibGVkXCIsIGlzVHlwZXNjcmlwdEVuYWJsZWRdLFxuICAgIF0pIHx8XG4gICAgICBbXSksXG4gICAgLi4uKChpc0FuZ3VsYXJFbmFibGVkICYmIFtbXCJpc0FuZ3VsYXJFbmFibGVkXCIsIGlzQW5ndWxhckVuYWJsZWRdXSkgfHwgW10pLFxuICAgIC4uLigoaXNUc3hFbmFibGVkICYmIFtbXCJpc1RzeEVuYWJsZWRcIiwgaXNUc3hFbmFibGVkXV0pIHx8IFtdKSxcbiAgICAuLi4oKGlzSnN4RW5hYmxlZCAmJiBbW1wiaXNKc3hFbmFibGVkXCIsIGlzSnN4RW5hYmxlZF1dKSB8fCBbXSksXG4gICAgLi4uKChpc0J1bmRsZVZpc3VhbGl6ZXJFbmFibGVkICYmIFtcbiAgICAgIFtcImlzQnVuZGxlVmlzdWFsaXplckVuYWJsZWRcIiwgaXNCdW5kbGVWaXN1YWxpemVyRW5hYmxlZF0sXG4gICAgICBbXCJyc2RvY3RvckNsaWVudFBvcnRcIiwgcHJvY2Vzcy5lbnYuUlNET0NUT1JfQ0xJRU5UX1BPUlRdLFxuICAgICAgW1wicnNkb2N0b3JTZXJ2ZXJQb3J0XCIsIHByb2Nlc3MuZW52LlJTRE9DVE9SX1NFUlZFUl9QT1JUXSxcbiAgICBdKSB8fFxuICAgICAgW10pLFxuICBdLmZpbHRlcihCb29sZWFuKTtcblxuICAvLyBDcmVhdGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIG9iamVjdCB3aXRoIGJhbm5lck91dHB1dFxuICBjb25zdCBlbnZzID0ge1xuICAgIFJTUEFDS19CQU5ORVI6IEpTT04uc3RyaW5naWZ5KGdldEJ1aWxkRmlsZUNvbnRlbnQoeyAuLi5tb2R1bGUsIC4uLmVudiwgLi4uc2lkZSwgcm9sZTogRklMRV9ST0xFLm91dHB1dCB9KSlcbiAgfTtcblxuICAvLyBDcmVhdGUgcGFyYW1zIGZyb20gcGFpcnNcbiAgY29uc3QgcGFyYW1zID0gcGFpcnMuZmxhdE1hcCgoW2tleSwgdmFsXSkgPT4gW1xuICAgICctLWVudicsXG4gICAgYCR7a2V5fT0ke3ZhbH1gXG4gIF0pO1xuXG4gIHJldHVybiB7IHBhcmFtcywgZW52cyB9O1xufVxuXG4vKipcbiAqIFN0YXJ0cyBSc3BhY2sgZm9yIGNsaWVudCBpbiBzZXJ2ZSBtb2RlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIGNsaWVudCBzZXJ2ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5vbkNvbXBpbGUgLSBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBjb21waWxhdGlvbiBpcyBjb21wbGV0ZVxuICogQHJldHVybnMge09iamVjdH0gVGhlIGNsaWVudCBwcm9jZXNzIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRSc3BhY2tDbGllbnRTZXJ2ZShvcHRpb25zID0ge30pIHtcbiAgY29uc3QgeyBvbkNvbXBpbGUgfSA9IG9wdGlvbnM7XG4gIC8vIEdldCB0aGUgY3VycmVudCBjbGllbnQgcHJvY2VzcyBmcm9tIGdsb2JhbCBzdGF0ZVxuICBjb25zdCBjbGllbnRQcm9jZXNzID0gZ2V0R2xvYmFsU3RhdGUoR0xPQkFMX1NUQVRFX0tFWVMuQ0xJRU5UX1BST0NFU1MsIG51bGwpO1xuXG4gIC8vIFNraXAgaWYgY2xpZW50IHByb2Nlc3MgaXMgYWxyZWFkeSBydW5uaW5nXG4gIGlmIChjbGllbnRQcm9jZXNzICYmIGlzUHJvY2Vzc1J1bm5pbmcoY2xpZW50UHJvY2VzcykpIHtcbiAgICByZXR1cm4gY2xpZW50UHJvY2VzcztcbiAgfVxuXG4gIGNvbnN0IGFwcERpciA9IGdldE1ldGVvckFwcERpcigpO1xuICBjb25zdCBjb25maWdGaWxlID0gZ2V0Q29uZmlnRmlsZVBhdGgoKTtcbiAgY29uc3QgeyBwYXJhbXMsIGVudnMgfSA9IGdldFJzcGFja0Vudih7IGlzQ2xpZW50OiB0cnVlLCBpc1NlcnZlcjogZmFsc2UgfSk7XG4gIGNvbnN0IHsgY29tbWFuZCwgYXJncyB9ID0gZ2V0TnB4Q29tbWFuZChbJ3JzcGFjaycsICdzZXJ2ZScsICctLWNvbmZpZycsIGNvbmZpZ0ZpbGUsIC4uLnBhcmFtc10pO1xuICBjb25zdCBuZXdDbGllbnRQcm9jZXNzID0gc3Bhd25Qcm9jZXNzKFxuICAgIGNvbW1hbmQsXG4gICAgYXJncywge1xuICAgICAgY3dkOiBhcHBEaXIsXG4gICAgICBlbnY6IGluaGVyaXRNZXRlb3JUb29sTm9kZUZsYWdzKHsgLi4ucHJvY2Vzcy5lbnYsIC4uLmdldE5vZGVCaW5FbnYoKSwgLi4uZW52cyB9KSxcbiAgICAgIG9uU3Rkb3V0OiAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB7IGNsZWFuZWREYXRhLCBjb25maWcgfSA9IHBhcnNlTWV0ZW9yUnNwYWNrT3V0cHV0KGRhdGEpO1xuICAgICAgICBpZiAoY29uZmlnICYmICEhY29uZmlnPy5kZXZTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICBsb2dIbXJTZXJ2ZXJTdGFydGVkKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9uQ29tcGlsZSAmJiBjb25maWcgJiYgKGNvbmZpZz8uY29tcGlsYXRpb25Db3VudCB8fCAwKSA+IDApIHtcbiAgICAgICAgICBvbkNvbXBpbGUoY2xlYW5lZERhdGEsIGNvbmZpZyk7XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBjb25maWc/Lm5hbWU/LmluY2x1ZGVzKFwiY2xpZW50XCIpICYmXG4gICAgICAgICAgICAhY29uZmlnPy5oYXNFcnJvcnMgJiZcbiAgICAgICAgICAgIGNvbmZpZz8uaXNSZWJ1aWxkXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBnZXRSdW5Mb2coKT8ubG9nQ2xpZW50UmVzdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNsZWFuZWREYXRhKSByZXR1cm47XG4gICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICBsb2dJbmZvKGBbUnNwYWNrIENsaWVudF0gJHtjbGVhbmVkRGF0YX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dDb21waWxhdGlvbk91dHB1dChjbGVhbmVkRGF0YSwgJ2NsaWVudCcsIGNvbmZpZz8uc3RhdHNPdmVycmlkZWQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25TdGRlcnI6IChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY2xlYW5lZERhdGEgfSA9IHBhcnNlTWV0ZW9yUnNwYWNrT3V0cHV0KGRhdGEpO1xuICAgICAgICBpZiAoIWNsZWFuZWREYXRhKSByZXR1cm47XG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gRUFERFJJTlVTRSBlcnJvciBpbiBkZXZlbG9wbWVudCBtb2RlICh3aGljaCB3ZSB3YW50IHRvIGNvbXBsZXRlbHkgaWdub3JlKVxuICAgICAgICBpZiAoaXNNZXRlb3JBcHBEZXZlbG9wbWVudCgpICYmIGNsZWFuZWREYXRhLmluY2x1ZGVzKCdFQUREUklOVVNFJykpIHtcbiAgICAgICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgICAgICBsb2dFcnJvcihgW1JzcGFjayBDbGllbnQgRXJyb3JdICR7Y2xlYW5lZERhdGF9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ0Vycm9yKHN0cmlwUnNwYWNrTGFiZWwoY2xlYW5lZERhdGEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYWN0dWFsbHkgYW4gaW5mb3JtYXRpb25hbCBtZXNzYWdlIChsaWtlIHdlYnBhY2stZGV2LXNlcnZlciBtZXNzYWdlcylcbiAgICAgICAgaWYgKGNsZWFuZWREYXRhLmluY2x1ZGVzKCdMb29wYmFjazonKSB8fCBjbGVhbmVkRGF0YS5pbmNsdWRlcygnUHJvamVjdCBpcyBydW5uaW5nIGF0OicpKSB7XG4gICAgICAgICAgaWYgKHNob3VsZExvZ1ZlcmJvc2UoKSkge1xuICAgICAgICAgICAgbG9nSW5mbyhgW1JzcGFjayBDbGllbnRdICR7Y2xlYW5lZERhdGF9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ1JhdyhzdHJpcFJzcGFja0xhYmVsKGNsZWFuZWREYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgdGhlIFwibnBtIGVycm9yIGNvdWxkIG5vdCBkZXRlcm1pbmUgZXhlY3V0YWJsZSB0byBydW5cIiBlcnJvclxuICAgICAgICAgIGlmIChjbGVhbmVkRGF0YS5pbmNsdWRlcygnbnBtIGVycm9yIGNvdWxkIG5vdCBkZXRlcm1pbmUgZXhlY3V0YWJsZSB0byBydW4nKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSAnW1JzcGFjayBDbGllbnQgRXJyb3JdIFRyeSBydW5uaW5nIFwibWV0ZW9yIG5wbSBpbnN0YWxsXCIgdG8gZW5zdXJlIHJzcGFjayBpcyBhdmFpbGFibGUnO1xuICAgICAgICAgICAgaWYgKHNob3VsZExvZ1ZlcmJvc2UoKSkge1xuICAgICAgICAgICAgICBsb2dFcnJvcihlcnJvck1zZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2dFcnJvcignVHJ5IHJ1bm5pbmcgXCJtZXRlb3IgbnBtIGluc3RhbGxcIiB0byBlbnN1cmUgcnNwYWNrIGlzIGF2YWlsYWJsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNob3VsZExvZ1ZlcmJvc2UoKSkge1xuICAgICAgICAgICAgbG9nRXJyb3IoYFtSc3BhY2sgQ2xpZW50IEVycm9yXSAke2NsZWFuZWREYXRhfWApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dFcnJvcihzdHJpcFJzcGFja0xhYmVsKGNsZWFuZWREYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25FcnJvcjogKGVycikgPT4ge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBSc3BhY2sgRXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgICAgaWYgKHNob3VsZExvZ1ZlcmJvc2UoKSkge1xuICAgICAgICAgIGxvZ0Vycm9yKGVycm9yTXNnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgLy8gU3RvcmUgdGhlIG5ldyBwcm9jZXNzIGluIGdsb2JhbCBzdGF0ZVxuICBzZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5DTElFTlRfUFJPQ0VTUywgbmV3Q2xpZW50UHJvY2Vzcyk7XG5cbiAgcmV0dXJuIG5ld0NsaWVudFByb2Nlc3M7XG59XG5cbi8qKlxuICogU3RhcnRzIFJzcGFjayBmb3Igc2VydmVyIGluIGJ1aWxkIC0td2F0Y2ggbW9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25zIGZvciBzZXJ2ZXIgd2F0Y2hcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMub25Db21waWxlIC0gQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gY29tcGlsYXRpb24gaXMgY29tcGxldGVcbiAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBzZXJ2ZXIgcHJvY2VzcyBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0UnNwYWNrU2VydmVyV2F0Y2gob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgb25Db21waWxlIH0gPSBvcHRpb25zO1xuICAvLyBHZXQgdGhlIGN1cnJlbnQgc2VydmVyIHByb2Nlc3MgZnJvbSBnbG9iYWwgc3RhdGVcbiAgY29uc3Qgc2VydmVyUHJvY2VzcyA9IGdldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLlNFUlZFUl9QUk9DRVNTLCBudWxsKTtcblxuICAvLyBTa2lwIGlmIHNlcnZlciBwcm9jZXNzIGlzIGFscmVhZHkgcnVubmluZ1xuICBpZiAoc2VydmVyUHJvY2VzcyAmJiBpc1Byb2Nlc3NSdW5uaW5nKHNlcnZlclByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIHNlcnZlclByb2Nlc3M7XG4gIH1cblxuICBjb25zdCBhcHBEaXIgPSBnZXRNZXRlb3JBcHBEaXIoKTtcbiAgY29uc3QgY29uZmlnRmlsZSA9IGdldENvbmZpZ0ZpbGVQYXRoKCk7XG4gIGNvbnN0IHsgcGFyYW1zLCBlbnZzIH0gPSBnZXRSc3BhY2tFbnYoeyBpc0NsaWVudDogZmFsc2UsIGlzU2VydmVyOiB0cnVlIH0pO1xuICBjb25zdCB7IGNvbW1hbmQsIGFyZ3MgfSA9IGdldE5weENvbW1hbmQoWydyc3BhY2snLCAnYnVpbGQnLCAnLS13YXRjaCcsICctLWNvbmZpZycsIGNvbmZpZ0ZpbGUsIC4uLnBhcmFtc10pO1xuICBjb25zdCBuZXdTZXJ2ZXJQcm9jZXNzID0gc3Bhd25Qcm9jZXNzKFxuICAgIGNvbW1hbmQsXG4gICAgYXJncywge1xuICAgIGN3ZDogYXBwRGlyLFxuICAgIGVudjogaW5oZXJpdE1ldGVvclRvb2xOb2RlRmxhZ3MoeyAuLi5wcm9jZXNzLmVudiwgLi4uZ2V0Tm9kZUJpbkVudigpLCAuLi5lbnZzIH0pLFxuICAgIG9uU3Rkb3V0OiAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgeyBjbGVhbmVkRGF0YSwgY29uZmlnIH0gPSBwYXJzZU1ldGVvclJzcGFja091dHB1dChkYXRhKTtcbiAgICAgIGlmIChvbkNvbXBpbGUgJiYgY29uZmlnICYmIChjb25maWc/LmNvbXBpbGF0aW9uQ291bnQgfHwgMCkgPiAwKSB7XG4gICAgICAgIG9uQ29tcGlsZShjbGVhbmVkRGF0YSwgY29uZmlnKTtcbiAgICAgIH1cbiAgICAgIGlmICghY2xlYW5lZERhdGEpIHJldHVybjtcbiAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgbG9nSW5mbyhgW1JzcGFjayBTZXJ2ZXJdICR7Y2xlYW5lZERhdGF9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dDb21waWxhdGlvbk91dHB1dChjbGVhbmVkRGF0YSwgJ3NlcnZlcicsIGNvbmZpZz8uc3RhdHNPdmVycmlkZWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb25TdGRlcnI6IChkYXRhKSA9PiB7XG4gICAgICBjb25zdCB7IGNsZWFuZWREYXRhIH0gPSBwYXJzZU1ldGVvclJzcGFja091dHB1dChkYXRhKTtcbiAgICAgIGlmICghY2xlYW5lZERhdGEpIHJldHVybjtcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYWN0dWFsbHkgYW4gaW5mb3JtYXRpb25hbCBtZXNzYWdlIChsaWtlIHdlYnBhY2stZGV2LXNlcnZlciBtZXNzYWdlcylcbiAgICAgIGlmIChjbGVhbmVkRGF0YS5pbmNsdWRlcygnUHJvamVjdCBpcyBydW5uaW5nIGF0OicpKSB7XG4gICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICBsb2dJbmZvKGBbUnNwYWNrIFNlcnZlcl0gJHtjbGVhbmVkRGF0YX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dSYXcoc3RyaXBSc3BhY2tMYWJlbChjbGVhbmVkRGF0YSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIHRoZSBcIm5wbSBlcnJvciBjb3VsZCBub3QgZGV0ZXJtaW5lIGV4ZWN1dGFibGUgdG8gcnVuXCIgZXJyb3JcbiAgICAgICAgaWYgKGNsZWFuZWREYXRhLmluY2x1ZGVzKCducG0gZXJyb3IgY291bGQgbm90IGRldGVybWluZSBleGVjdXRhYmxlIHRvIHJ1bicpKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSAnW1JzcGFjayBTZXJ2ZXIgRXJyb3JdIFRyeSBydW5uaW5nIFwibWV0ZW9yIG5wbSBpbnN0YWxsXCIgdG8gZW5zdXJlIHJzcGFjayBpcyBhdmFpbGFibGUnO1xuICAgICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICAgIGxvZ0Vycm9yKGVycm9yTXNnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nRXJyb3IoJ1RyeSBydW5uaW5nIFwibWV0ZW9yIG5wbSBpbnN0YWxsXCIgdG8gZW5zdXJlIHJzcGFjayBpcyBhdmFpbGFibGUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgICAgbG9nRXJyb3IoYFtSc3BhY2sgU2VydmVyIEVycm9yXSAke2NsZWFuZWREYXRhfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ0Vycm9yKHN0cmlwUnNwYWNrTGFiZWwoY2xlYW5lZERhdGEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb25FcnJvcjogKGVycikgPT4ge1xuICAgICAgY29uc3QgZXJyb3JNc2cgPSBgUnNwYWNrIEVycm9yOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgIGxvZ0Vycm9yKGVycm9yTXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ0Vycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBTdG9yZSB0aGUgbmV3IHByb2Nlc3MgaW4gZ2xvYmFsIHN0YXRlXG4gIHNldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLlNFUlZFUl9QUk9DRVNTLCBuZXdTZXJ2ZXJQcm9jZXNzKTtcblxuICByZXR1cm4gbmV3U2VydmVyUHJvY2Vzcztcbn1cblxuLyoqXG4gKiBSdW5zIFJzcGFjayBidWlsZCBmb3IgYm90aCBjbGllbnQgYW5kIHNlcnZlciB3aXRob3V0IHdhdGNoIG1vZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGJ1aWxkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuaXNDbGllbnQgLSBXaGV0aGVyIHRoaXMgaXMgYSBjbGllbnQgYnVpbGRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5pc1NlcnZlciAtIFdoZXRoZXIgdGhpcyBpcyBhIHNlcnZlciBidWlsZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzVGVzdE1vZHVsZSAtIFdoZXRoZXIgdGhpcyBpcyBhIHRlc3QgbW9kdWxlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLm9uQ29tcGlsZSAtIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGNvbXBpbGF0aW9uIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMud2F0Y2ggLSBXaGV0aGVyIHRvIHJ1biBSc3BhY2sgaW4gd2F0Y2ggbW9kZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGJ1aWxkIGlzIGNvbXBsZXRlXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGJ1aWxkIHByb2Nlc3MgZmFpbHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blJzcGFja0J1aWxkKHsgaXNDbGllbnQsIGlzU2VydmVyLCBpc1Rlc3QsIGlzVGVzdE1vZHVsZSwgaXNUZXN0TGlrZSwgb25Db21waWxlLCB3YXRjaCwgbGFiZWwgPSAnQnVpbGQnIH0gPSB7fSkge1xuICBjb25zdCBhcHBEaXIgPSBnZXRNZXRlb3JBcHBEaXIoKTtcbiAgY29uc3QgY29uZmlnRmlsZSA9IGdldENvbmZpZ0ZpbGVQYXRoKCk7XG5cbiAgY29uc3QgZW5kcG9pbnQgPSBpc0NsaWVudCA/ICdDbGllbnQnIDogJ1NlcnZlcic7XG4gIC8vIFVzZSBhIHByb21pc2UgdG8gZW5zdXJlIE1ldGVvciB3YWl0cyB1bnRpbCBSc3BhY2sgZmluaXNoZXNcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB7IHBhcmFtcywgZW52cyB9ID0gZ2V0UnNwYWNrRW52KHsgaXNDbGllbnQsIGlzU2VydmVyLCBpc1Rlc3QsIGlzVGVzdE1vZHVsZSwgaXNUZXN0TGlrZSB9KTtcbiAgICBjb25zdCByc3BhY2tBcmdzID0gW1xuICAgICAgJ3JzcGFjaycsXG4gICAgICAnYnVpbGQnLFxuICAgICAgJy0tY29uZmlnJyxcbiAgICAgIGNvbmZpZ0ZpbGUsXG4gICAgICAuLi4od2F0Y2ggJiYgWyctLXdhdGNoJ10pIHx8IFtdLFxuICAgICAgLi4ucGFyYW1zLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgIGNvbnN0IHsgY29tbWFuZCwgYXJncyB9ID0gZ2V0TnB4Q29tbWFuZChyc3BhY2tBcmdzKTtcbiAgICBzcGF3blByb2Nlc3MoXG4gICAgICBjb21tYW5kLFxuICAgICAgYXJncyxcbiAgICAgIHtcbiAgICAgIGN3ZDogYXBwRGlyLFxuICAgICAgZW52OiBpbmhlcml0TWV0ZW9yVG9vbE5vZGVGbGFncyh7IC4uLnByb2Nlc3MuZW52LCAuLi5nZXROb2RlQmluRW52KCksIC4uLmVudnMgfSksXG4gICAgICBvblN0ZG91dDogKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgeyBjbGVhbmVkRGF0YSwgY29uZmlnIH0gPSBwYXJzZU1ldGVvclJzcGFja091dHB1dChkYXRhKTtcbiAgICAgICAgaWYgKG9uQ29tcGlsZSAmJiBjb25maWcgJiYgKGNvbmZpZz8uY29tcGlsYXRpb25Db3VudCB8fCAwKSA+IDApIHtcbiAgICAgICAgICBvbkNvbXBpbGUoY2xlYW5lZERhdGEsIGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjbGVhbmVkRGF0YSkgcmV0dXJuO1xuICAgICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgICAgbG9nSW5mbyhgW1JzcGFjayAke2xhYmVsfSAke2VuZHBvaW50fV0gJHtjbGVhbmVkRGF0YX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dDb21waWxhdGlvbk91dHB1dChjbGVhbmVkRGF0YSwgZW5kcG9pbnQudG9Mb3dlckNhc2UoKSwgY29uZmlnPy5zdGF0c092ZXJyaWRlZCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN0ZGVycjogKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgeyBjbGVhbmVkRGF0YSB9ID0gcGFyc2VNZXRlb3JSc3BhY2tPdXRwdXQoZGF0YSk7XG4gICAgICAgIGlmICghY2xlYW5lZERhdGEpIHJldHVybjtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhY3R1YWxseSBhbiBpbmZvcm1hdGlvbmFsIG1lc3NhZ2UgKGxpa2Ugd2VicGFjay1kZXYtc2VydmVyIG1lc3NhZ2VzKVxuICAgICAgICBpZiAoY2xlYW5lZERhdGEuaW5jbHVkZXMoJ1Byb2plY3QgaXMgcnVubmluZyBhdDonKSkge1xuICAgICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICAgIGxvZ0luZm8oYFtSc3BhY2sgJHtsYWJlbH0gJHtlbmRwb2ludH1dICR7Y2xlYW5lZERhdGF9YCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ1JhdyhzdHJpcFJzcGFja0xhYmVsKGNsZWFuZWREYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgdGhlIFwibnBtIGVycm9yIGNvdWxkIG5vdCBkZXRlcm1pbmUgZXhlY3V0YWJsZSB0byBydW5cIiBlcnJvclxuICAgICAgICAgIGlmIChjbGVhbmVkRGF0YS5pbmNsdWRlcygnbnBtIGVycm9yIGNvdWxkIG5vdCBkZXRlcm1pbmUgZXhlY3V0YWJsZSB0byBydW4nKSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgW1JzcGFjayAke2xhYmVsfSBFcnJvciAke2VuZHBvaW50fV0gVHJ5IHJ1bm5pbmcgXCJtZXRlb3IgbnBtIGluc3RhbGxcIiB0byBlbnN1cmUgcnNwYWNrIGlzIGF2YWlsYWJsZWA7XG4gICAgICAgICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgICAgICAgIGxvZ0Vycm9yKGVycm9yTXNnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxvZ0Vycm9yKGBUcnkgcnVubmluZyBcIm1ldGVvciBucG0gaW5zdGFsbFwiIHRvIGVuc3VyZSByc3BhY2sgaXMgYXZhaWxhYmxlYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2hvdWxkTG9nVmVyYm9zZSgpKSB7XG4gICAgICAgICAgICBsb2dFcnJvcihgW1JzcGFjayAke2xhYmVsfSBFcnJvciAke2VuZHBvaW50fV0gJHtjbGVhbmVkRGF0YX1gKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nRXJyb3Ioc3RyaXBSc3BhY2tMYWJlbChjbGVhbmVkRGF0YSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRXhpdDogKGNvZGUpID0+IHtcbiAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYFJzcGFjayAke2xhYmVsfSBmYWlsZWQgaW4gJHtlbmRwb2ludH0gd2l0aCBleGl0IGNvZGUgJHtjb2RlfWApO1xuICAgICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICAgIGxvZ0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dFcnJvcihgUnNwYWNrICR7bGFiZWx9IGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2NvZGV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChzaG91bGRMb2dWZXJib3NlKCkpIHtcbiAgICAgICAgICBsb2dFcnJvcihgUnNwYWNrICR7bGFiZWx9ICR7ZW5kcG9pbnR9IGVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ0Vycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ2xlYW5zIHVwIHByb2Nlc3NlcyB3aGVuIHRoZSBwbHVnaW4gaXMgc3RvcHBlZFxuICogU3RvcHMgYW55IHJ1bm5pbmcgY2xpZW50IGFuZCBzZXJ2ZXIgcHJvY2Vzc2VzIGFuZCBjbGVhcnMgdGhlaXIgZ2xvYmFsIHN0YXRlXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gIGNvbnN0IGNsaWVudFByb2Nlc3MgPSBnZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5DTElFTlRfUFJPQ0VTUywgbnVsbCk7XG4gIGlmIChjbGllbnRQcm9jZXNzKSB7XG4gICAgc3RvcFByb2Nlc3MoY2xpZW50UHJvY2Vzcyk7XG4gICAgc2V0R2xvYmFsU3RhdGUoR0xPQkFMX1NUQVRFX0tFWVMuQ0xJRU5UX1BST0NFU1MsIG51bGwpO1xuICB9XG5cbiAgY29uc3Qgc2VydmVyUHJvY2VzcyA9IGdldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLlNFUlZFUl9QUk9DRVNTLCBudWxsKTtcbiAgaWYgKHNlcnZlclByb2Nlc3MpIHtcbiAgICBzdG9wUHJvY2VzcyhzZXJ2ZXJQcm9jZXNzKTtcbiAgICBzZXRHbG9iYWxTdGF0ZShHTE9CQUxfU1RBVEVfS0VZUy5TRVJWRVJfUFJPQ0VTUywgbnVsbCk7XG4gIH1cbn1cbiIsIi8qKlxuICogQG1vZHVsZSBjb25maWdcbiAqIEBkZXNjcmlwdGlvbiBGdW5jdGlvbnMgZm9yIGNvbmZpZ3VyaW5nIE1ldGVvciBmb3IgUnNwYWNrXG4gKi9cbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgeyBsb2dJbmZvIH0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvbG9nJyk7XG5jb25zdCB7XG4gIGdldE1ldGVvckFwcEZpbGVzQW5kRm9sZGVycyxcbiAgc2V0TWV0ZW9yQXBwSWdub3JlLFxuICBzZXRNZXRlb3JBcHBFbnRyeXBvaW50cyxcbiAgc2V0TWV0ZW9yQXBwQ3VzdG9tU2NyaXB0VXJsLFxuICBpc01ldGVvckFwcERldmVsb3BtZW50LFxuICBpc01ldGVvckFwcFJ1bixcbiAgaXNNZXRlb3JBcHBCdWlsZCxcbiAgaXNNZXRlb3JBcHBOYXRpdmUsXG4gIGlzTWV0ZW9yQXBwRGVidWcsXG4gIGlzTWV0ZW9yQXBwVGVzdCxcbiAgaXNNZXRlb3JBcHBUZXN0RnVsbEFwcCxcbiAgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlLFxuICBpc01ldGVvckJsYXplUHJvamVjdCxcbiAgaXNNZXRlb3JMZXNzUHJvamVjdCxcbiAgaXNNZXRlb3JTY3NzUHJvamVjdCxcbiAgZ2V0TWV0ZW9yRW52UGFja2FnZURpcnMsXG4gIGdldE1ldGVvckFwcENvbmZpZyxcbiAgZ2V0TWV0ZW9yQXBwRGlyLFxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9tZXRlb3InKTtcbmNvbnN0IHsgYnVpbGRVbmlnbm9yZVBhdHRlcm5zIH0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvaWdub3JlJyk7XG5cbmltcG9ydCB7IGdldEluaXRpYWxFbnRyeXBvaW50cyB9IGZyb20gJy4vYnVpbGQtY29udGV4dCc7XG5cbmNvbnN0IHsgZW5zdXJlTW9kdWxlRmlsZXNFeGlzdCwgZ2V0QnVpbGRGaWxlUGF0aCB9ID0gcmVxdWlyZSgnLi9idWlsZC1jb250ZXh0Jyk7XG5jb25zdCB7IFJTUEFDS19CVUlMRF9DT05URVhULCBGSUxFX1JPTEUgfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGVudHJpZXMgZXhpc3QgaW4gLm1ldGVvcmlnbm9yZSBmaWxlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBlbnRyaWVzIC0gRW50cmllcyB0byBjaGVja1xuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0cyB3aXRoIGVudHJ5IGtleXMgYW5kIGJvb2xlYW4gdmFsdWVzXG4gKi9cbmZ1bmN0aW9uIGNoZWNrTWV0ZW9ySWdub3JlRXhhY3RFbnRyaWVzKGVudHJpZXMpIHtcbiAgY29uc3QgbWV0ZW9ySWdub3JlUGF0aCA9IHBhdGguam9pbihnZXRNZXRlb3JBcHBEaXIoKSwgJy5tZXRlb3JpZ25vcmUnKTtcbiAgY29uc3QgcmVzdWx0cyA9IHt9O1xuXG4gIC8vIEluaXRpYWxpemUgcmVzdWx0cyBvYmplY3Qgd2l0aCBmYWxzZSBmb3IgZWFjaCBlbnRyeVxuICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgIHJlc3VsdHNbZW50cnldID0gZmFsc2U7XG4gIH0pO1xuXG4gIC8vIENoZWNrIGlmIC5tZXRlb3JpZ25vcmUgZmlsZSBleGlzdHNcbiAgaWYgKCFmcy5leGlzdHNTeW5jKG1ldGVvcklnbm9yZVBhdGgpKSB7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvLyBSZWFkIHRoZSAubWV0ZW9yaWdub3JlIGZpbGVcbiAgdHJ5IHtcbiAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKG1ldGVvcklnbm9yZVBhdGgsICd1dGY4Jyk7XG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcblxuICAgIC8vIENoZWNrIGVhY2ggbGluZSBhZ2FpbnN0IGFsbCBlbnRyaWVzXG4gICAgbGluZXMuZm9yRWFjaChsaW5lID0+IHtcbiAgICAgIC8vIFNraXAgZW1wdHkgbGluZXMgYW5kIGNvbW1lbnRzXG4gICAgICBpZiAoIWxpbmUudHJpbSgpIHx8IGxpbmUudHJpbSgpLnN0YXJ0c1dpdGgoJyMnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyaW1tZWRMaW5lID0gbGluZS50cmltKCk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBleGFjdCBtYXRjaGVzXG4gICAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBpZiAodHJpbW1lZExpbmUgPT09IGVudHJ5KSB7XG4gICAgICAgICAgcmVzdWx0c1tlbnRyeV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiB0aGVyZSdzIGFuIGVycm9yIHJlYWRpbmcgdGhlIGZpbGUsIHJldHVybiB0aGUgaW5pdGlhbGl6ZWQgcmVzdWx0c1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBvZiBmaWxlIGV4dGVuc2lvbnMgdG8gaWdub3JlIGJhc2VkIG9uIHByb2plY3QgdHlwZVxuICogRm9yIEJsYXplIHByb2plY3RzLCBpdCBleGNsdWRlcyAuaHRtbCBhcyB1c2VkIGJ5IEJsYXplXG4gKiBGb3IgTGVzcyBwcm9qZWN0cywgaXQgZXhjbHVkZXMgLmxlc3MgZmlsZXNcbiAqIEZvciBTQ1NTIHByb2plY3RzLCBpdCBleGNsdWRlcyAuc2NzcyBmaWxlc1xuICogQHJldHVybnMge3N0cmluZ1tdfSBBcnJheSBvZiBmaWxlIGV4dGVuc2lvbnMgdG8gaWdub3JlXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVFeHRlbnNpb25zVG9JZ25vcmUoKSB7XG4gIGNvbnN0IGlzQW55Q29tcGlsZXJQcm9qZWN0ID1cbiAgICBpc01ldGVvckJsYXplUHJvamVjdCgpIHx8IGlzTWV0ZW9yTGVzc1Byb2plY3QoKSB8fCBpc01ldGVvclNjc3NQcm9qZWN0KCk7XG4gIGlmICghaXNBbnlDb21waWxlclByb2plY3QpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBhbGxGaWxlcyA9IGdsb2Iuc3luYygnKiovKicsIHtcbiAgICBub2RpcjogdHJ1ZSxcbiAgICBkb3Q6IHRydWUsXG4gICAgaWdub3JlOiBbJ25vZGVfbW9kdWxlcy8qKicsICcubWV0ZW9yLyoqJ10sXG4gIH0pO1xuICBjb25zdCBleGlzdGluZ0V4dHMgPSBBcnJheS5mcm9tKFxuICAgIG5ldyBTZXQoYWxsRmlsZXMubWFwKGYgPT4gcGF0aC5leHRuYW1lKGYpLnRvTG93ZXJDYXNlKCkpKSxcbiAgKTtcblxuICAvLyBCYXNlIGV4dGVuc2lvbnMgdG8gaWdub3JlXG4gIGNvbnN0IGJhc2VFeHRlbnNpb25zID0gW1xuICAgICcudHMnLFxuICAgICcudHN4JyxcbiAgICAnLmpzJyxcbiAgICAnLmpzeCcsXG4gICAgJy5tanMnLFxuICAgICcuY2pzJyxcbiAgICAnLmpzb24nLFxuICBdO1xuXG4gIC8vIEZpbHRlciBleGlzdGluZyBleHRlbnNpb25zIGJhc2VkIG9uIHByb2plY3QgdHlwZVxuICBsZXQgZmlsdGVyZWRFeHRzID0gZXhpc3RpbmdFeHRzO1xuXG4gIC8vIEZvciBCbGF6ZSBwcm9qZWN0cywgZXhjbHVkZSAuaHRtbCBmaWxlc1xuICBpZiAoaXNNZXRlb3JCbGF6ZVByb2plY3QoKSkge1xuICAgIGZpbHRlcmVkRXh0cyA9IGV4aXN0aW5nRXh0cy5maWx0ZXIoZXh0ID0+IGV4dCAhPT0gJy5odG1sJyk7XG4gIH1cblxuICAvLyBDaGVjayBmb3IgTGVzcyBwcm9qZWN0cyBhbmQgZXhjbHVkZSAubGVzcyBmaWxlc1xuICBpZiAoaXNNZXRlb3JMZXNzUHJvamVjdCgpKSB7XG4gICAgZmlsdGVyZWRFeHRzID0gZmlsdGVyZWRFeHRzLmZpbHRlcihleHQgPT4gZXh0ICE9PSAnLmxlc3MnKTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBTQ1NTIHByb2plY3RzIGFuZCBleGNsdWRlIC5zY3NzIGZpbGVzXG4gIGlmIChpc01ldGVvclNjc3NQcm9qZWN0KCkpIHtcbiAgICBmaWx0ZXJlZEV4dHMgPSBmaWx0ZXJlZEV4dHMuZmlsdGVyKGV4dCA9PiBleHQgIT09ICcuc2NzcycpO1xuICB9XG5cbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbLi4uYmFzZUV4dGVuc2lvbnMsIC4uLmZpbHRlcmVkRXh0c10pKS5maWx0ZXIoXG4gICAgZXh0ID0+IGV4dCAhPT0gJycsXG4gICk7XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBNZXRlb3Igc2V0dGluZ3MgZm9yIFJzcGFja1xuICogU2V0cyB1cCBmaWxlIGlnbm9yZXMsIGVudHJ5IHBvaW50cywgYW5kIGN1c3RvbSBzY3JpcHQgVVJMXG4gKiBDcmVhdGVzIG5lY2Vzc2FyeSBtb2R1bGUgZmlsZXMgYW5kIHdyaXRlcyBjb250ZW50IHRvIHRoZW1cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlTWV0ZW9yRm9yUnNwYWNrKCkge1xuICBjb25zdCBtZXRlb3JBcHBDb25maWcgPSBnZXRNZXRlb3JBcHBDb25maWcoKTtcbiAgY29uc3QgaW5pdGlhbEVudHJ5cG9pbnRzID0gZ2V0SW5pdGlhbEVudHJ5cG9pbnRzKCk7XG5cbiAgLy8gSWdub3JlIG5vZGVfbW9kdWxlcyB0byBwcmV2ZW50IE1ldGVvciBmcm9tIHByb2Nlc3NpbmcgdGhlbVxuICBjb25zdCBwcm9qZWN0Um9vdEZpbGVzQW5kRm9sZGVycyA9IGdldE1ldGVvckFwcEZpbGVzQW5kRm9sZGVycyh7XG4gICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgfSk7XG5cbiAgY29uc3QgaW5pdGlhbEVudHJ5cG9pbnRDb250ZXh0cyA9IFtcbiAgICBpbml0aWFsRW50cnlwb2ludHMubWFpbkNsaWVudCxcbiAgICBpbml0aWFsRW50cnlwb2ludHMubWFpblNlcnZlcixcbiAgXVxuICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAubWFwKGVudHJ5cG9pbnQgPT4gcGF0aC5kaXJuYW1lKGVudHJ5cG9pbnQpKTtcbiAgY29uc3QgaW5jbHVkZWREaXJzID0gWydwdWJsaWMnLCAncHJpdmF0ZScsICcubWV0ZW9yJywgUlNQQUNLX0JVSUxEX0NPTlRFWFRdO1xuICBjb25zdCBpZ25vcmVkRGlycyA9IHByb2plY3RSb290RmlsZXNBbmRGb2xkZXJzLmRpcmVjdG9yaWVzLmZpbHRlcihcbiAgICBkaXIgPT4gIWluY2x1ZGVkRGlycy5pbmNsdWRlcyhkaXIpLFxuICApO1xuXG4gIGNvbnN0IGVudlBhY2thZ2VEaXJzID0gZ2V0TWV0ZW9yRW52UGFja2FnZURpcnMoKS5tYXAoXG4gICAgZGlyID0+IHBhdGgubm9ybWFsaXplKGRpcik/LnNwbGl0KHBhdGguc2VwKT8uZmlsdGVyKEJvb2xlYW4pPy5bMF0sXG4gICk7XG4gIGxldCBleHRyYUZvbGRlcnNUb0lnbm9yZSA9IFtcbiAgICAuLi5pZ25vcmVkRGlyc1xuICAgICAgLmZpbHRlcihcbiAgICAgICAgZGlyID0+XG4gICAgICAgICAgIVtcbiAgICAgICAgICAgICdwdWJsaWMnLFxuICAgICAgICAgICAgJ3ByaXZhdGUnLFxuICAgICAgICAgICAgJy5tZXRlb3InLFxuICAgICAgICAgICAgJ3BhY2thZ2VzJyxcbiAgICAgICAgICAgIC4uLmVudlBhY2thZ2VEaXJzLFxuICAgICAgICAgICAgUlNQQUNLX0JVSUxEX0NPTlRFWFQsXG4gICAgICAgICAgXS5pbmNsdWRlcyhkaXIpLFxuICAgICAgKVxuICAgICAgLm1hcChkaXIgPT4gYCR7ZGlyfS8qKmApLFxuICBdO1xuICBsZXQgZXh0cmFGaWxlc1RvSWdub3JlID0gW107XG5cbiAgLy8gR2V0IGV4dGVuc2lvbnMgdG8gaWdub3JlIGJhc2VkIG9uIHByb2plY3QgdHlwZVxuICBjb25zdCBleHRlbnNpb25zVG9JZ25vcmUgPSBnZXRGaWxlRXh0ZW5zaW9uc1RvSWdub3JlKCk7XG4gIC8vIElmIHdlIGhhdmUgZXh0ZW5zaW9ucyB0byBpZ25vcmUsIGFwcGx5IHRoZW0gdG8gdGhlIGlnbm9yZWQgZGlyZWN0b3JpZXNcbiAgaWYgKGV4dGVuc2lvbnNUb0lnbm9yZS5sZW5ndGggPiAwKSB7XG4gICAgZXh0cmFGaWxlc1RvSWdub3JlID0gaWdub3JlZERpcnMuZmxhdE1hcChkaXIgPT5cbiAgICAgIGV4dGVuc2lvbnNUb0lnbm9yZS5tYXAoZXh0ID0+IGAke2Rpcn0vKiovKiR7ZXh0fWApLFxuICAgICk7XG4gICAgZXh0cmFGb2xkZXJzVG9JZ25vcmUgPSBbXTtcbiAgfVxuXG4gIC8vIFNraXAgQ1NTL0hUTUwgZmlsZXMgaW4gZW50cnlwb2ludCBjb250ZXh0c1xuICBleHRyYUZpbGVzVG9JZ25vcmUgPSBbXG4gICAgLi4uZXh0cmFGaWxlc1RvSWdub3JlLFxuICAgIC4uLmluaXRpYWxFbnRyeXBvaW50Q29udGV4dHMuZmxhdE1hcChlbnRyeXBvaW50ID0+IHtcbiAgICAgIGNvbnN0IGNzc1BhdHRlcm4gPSBgJHtlbnRyeXBvaW50fS8qLmNzc2A7XG4gICAgICBjb25zdCBodG1sUGF0dGVybiA9IGAke2VudHJ5cG9pbnR9LyouaHRtbGA7XG5cbiAgICAgIGNvbnN0IGNzc0ZpbGVzID0gZ2xvYi5zeW5jKGNzc1BhdHRlcm4pO1xuICAgICAgY29uc3QgaHRtbEZpbGVzID0gZ2xvYi5zeW5jKGh0bWxQYXR0ZXJuKTtcblxuICAgICAgY29uc3QgZW50cmllc1RvQ2hlY2sgPSBbXG4gICAgICAgIGNzc1BhdHRlcm4sXG4gICAgICAgIGh0bWxQYXR0ZXJuLFxuICAgICAgICAuLi5jc3NGaWxlcyxcbiAgICAgICAgLi4uaHRtbEZpbGVzXG4gICAgICBdO1xuXG4gICAgICBjb25zdCBlbnRyeVJlc3VsdHMgPSBjaGVja01ldGVvcklnbm9yZUV4YWN0RW50cmllcyhlbnRyaWVzVG9DaGVjayk7XG4gICAgICBjb25zdCBoYXNNYXRjaGluZ0Nzc1BhdHRlcm4gPSBlbnRyeVJlc3VsdHNbY3NzUGF0dGVybl07XG4gICAgICBjb25zdCBoYXNNYXRjaGluZ0h0bWxQYXR0ZXJuID0gZW50cnlSZXN1bHRzW2h0bWxQYXR0ZXJuXTtcbiAgICAgIGNvbnN0IGhhc0FueUNzc0ZpbGVJbk1ldGVvcklnbm9yZSA9IGNzc0ZpbGVzLnNvbWUoZmlsZSA9PiBlbnRyeVJlc3VsdHNbZmlsZV0pO1xuICAgICAgY29uc3QgaGFzQW55SHRtbEZpbGVJbk1ldGVvcklnbm9yZSA9IGh0bWxGaWxlcy5zb21lKGZpbGUgPT4gZW50cnlSZXN1bHRzW2ZpbGVdKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgIC8vIEhhbmRsZSBIVE1MIGZpbGVzXG4gICAgICBpZiAoaGFzQW55SHRtbEZpbGVJbk1ldGVvcklnbm9yZSkge1xuICAgICAgICAvLyBBZGQgaW5kaXZpZHVhbCBIVE1MIGZpbGVzIHRoYXQgYXJlIG5vdCBpbiBtZXRlb3JpZ25vcmVcbiAgICAgICAgaHRtbEZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgaWYgKCFlbnRyeVJlc3VsdHNbZmlsZV0pIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGAhJHtmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKCFoYXNNYXRjaGluZ0h0bWxQYXR0ZXJuKSB7XG4gICAgICAgIC8vIFNraXAgSFRNTCBwYXR0ZXJuIGlmIG5vdCBpbiBtZXRlb3JpZ25vcmVcbiAgICAgICAgcmVzdWx0LnB1c2goYCEke2h0bWxQYXR0ZXJufWApO1xuICAgICAgfVxuXG4gICAgICAvLyBIYW5kbGUgQ1NTIGZpbGVzXG4gICAgICBpZiAoaGFzQW55Q3NzRmlsZUluTWV0ZW9ySWdub3JlKSB7XG4gICAgICAgIC8vIEFkZCBpbmRpdmlkdWFsIENTUyBmaWxlcyB0aGF0IGFyZSBub3QgaW4gbWV0ZW9yaWdub3JlXG4gICAgICAgIGNzc0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgaWYgKCFlbnRyeVJlc3VsdHNbZmlsZV0pIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGAhJHtmaWxlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKCFoYXNNYXRjaGluZ0Nzc1BhdHRlcm4pIHtcbiAgICAgICAgLy8gU2tpcCBDU1MgcGF0dGVybiBpZiBub3QgaW4gbWV0ZW9yaWdub3JlXG4gICAgICAgIHJlc3VsdC5wdXNoKGAhJHtjc3NQYXR0ZXJufWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pLFxuICBdO1xuXG4gIGNvbnN0IHRlc3RJZ25vcmVQYXRoID0gYCR7UlNQQUNLX0JVSUxEX0NPTlRFWFR9LyR7cGF0aC5kaXJuYW1lKFxuICAgIGdldEJ1aWxkRmlsZVBhdGgoe1xuICAgICAgaXNUZXN0OiB0cnVlLFxuICAgIH0pLFxuICApfS8qKmA7XG4gIGNvbnN0IG90aGVyTWFpbklnbm9yZVBhdGggPVxuICAgIChpc01ldGVvckFwcERldmVsb3BtZW50KCkgJiZcbiAgICAgIGAke1JTUEFDS19CVUlMRF9DT05URVhUfS8ke3BhdGguZGlybmFtZShcbiAgICAgICAgZ2V0QnVpbGRGaWxlUGF0aCh7XG4gICAgICAgICAgaXNNYWluOiB0cnVlLFxuICAgICAgICAgIGlzUHJvZHVjdGlvbjogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICApfS8qKmApIHx8XG4gICAgYCR7UlNQQUNLX0JVSUxEX0NPTlRFWFR9LyR7cGF0aC5kaXJuYW1lKFxuICAgICAgZ2V0QnVpbGRGaWxlUGF0aCh7XG4gICAgICAgIGlzTWFpbjogdHJ1ZSxcbiAgICAgICAgaXNEZXZlbG9wbWVudDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICl9LyoqYDtcbiAgY29uc3QgZm9sZGVyc1RvSWdub3JlID0gW1xuICAgIC4uLigoaXNNZXRlb3JBcHBUZXN0KCkgJiYgW290aGVyTWFpbklnbm9yZVBhdGhdKSB8fCBbXG4gICAgICB0ZXN0SWdub3JlUGF0aCxcbiAgICAgIG90aGVyTWFpbklnbm9yZVBhdGgsXG4gICAgXSksXG4gICAgJ25vZGVfbW9kdWxlcy8qKicsXG4gICAgLi4uZXh0cmFGb2xkZXJzVG9JZ25vcmUsXG4gIF0uZmlsdGVyKEJvb2xlYW4pO1xuICBjb25zdCByb290RmlsZXNUb0lnbm9yZSA9IFtcbiAgICAuLi5wcm9qZWN0Um9vdEZpbGVzQW5kRm9sZGVycy5maWxlcy5maWx0ZXIoXG4gICAgICBmaWxlID0+XG4gICAgICAgICFbXG4gICAgICAgICAgJ3BhY2thZ2UuanNvbicsXG4gICAgICAgICAgJy5tZXRlb3JpZ25vcmUnLFxuICAgICAgICAgICd0c2NvbmZpZy5qc29uJyxcbiAgICAgICAgICAncG9zdGNzcy5jb25maWcuanMnLFxuICAgICAgICAgICdzY3NzLWNvbmZpZy5qc29uJyxcbiAgICAgICAgXS5pbmNsdWRlcyhmaWxlKSxcbiAgICApLFxuICBdO1xuICBjb25zdCBmaWxlc1RvSWdub3JlID0gWy4uLnJvb3RGaWxlc1RvSWdub3JlLCAuLi5leHRyYUZpbGVzVG9JZ25vcmVdO1xuICBjb25zdCB1bmlnbm9yZWRGaWxlc0FuZEZvbGRlcnMgPSBidWlsZFVuaWdub3JlUGF0dGVybnMoXG4gICAgbWV0ZW9yQXBwQ29uZmlnPy5tb2R1bGVzIHx8IFtdLFxuICAgIHsgc2tpcExldmVsOiAxIH0sXG4gICk7XG4gIGNvbnN0IG1ldGVvckFwcElnbm9yZXMgPSBgJHtmb2xkZXJzVG9JZ25vcmUuam9pbignICcpfSAke2ZpbGVzVG9JZ25vcmUuam9pbihcbiAgICAnICcsXG4gICl9ICR7dW5pZ25vcmVkRmlsZXNBbmRGb2xkZXJzLmpvaW4oJyAnKX1gLnRyaW0oKTtcbiAgc2V0TWV0ZW9yQXBwSWdub3JlKG1ldGVvckFwcElnbm9yZXMpO1xuXG4gIGlmIChpc01ldGVvckFwcERlYnVnKCkgfHwgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlKCkpIHtcbiAgICBsb2dJbmZvKGBbaV0gTWV0ZW9yIGFwcCBpZ25vcmVzOiAke21ldGVvckFwcElnbm9yZXN9YCk7XG4gIH1cblxuICBjb25zdCBlbnYgPSBpc01ldGVvckFwcERldmVsb3BtZW50KClcbiAgICA/IHsgaXNEZXZlbG9wbWVudDogdHJ1ZSB9XG4gICAgOiB7IGlzUHJvZHVjdGlvbjogdHJ1ZSB9O1xuICBjb25zdCBjb21tYW5kUm9sZSA9IGlzTWV0ZW9yQXBwUnVuKClcbiAgICA/IHsgcm9sZTogRklMRV9ST0xFLnJ1biB9XG4gICAgOiBpc01ldGVvckFwcEJ1aWxkKClcbiAgICA/IHsgcm9sZTogRklMRV9ST0xFLmJ1aWxkIH1cbiAgICA6IHsgcm9sZTogRklMRV9ST0xFLnJ1biB9O1xuICBjb25zdCBtYWluQ2xpZW50TW9kdWxlID0gZ2V0QnVpbGRGaWxlUGF0aCh7XG4gICAgaXNNYWluOiB0cnVlLFxuICAgIC4uLmVudixcbiAgICAuLi5jb21tYW5kUm9sZSxcbiAgICBpc0NsaWVudDogdHJ1ZSxcbiAgfSk7XG4gIGNvbnN0IG1haW5TZXJ2ZXJNb2R1bGUgPSBnZXRCdWlsZEZpbGVQYXRoKHtcbiAgICBpc01haW46IHRydWUsXG4gICAgLi4uZW52LFxuICAgIC4uLmNvbW1hbmRSb2xlLFxuICAgIGlzU2VydmVyOiB0cnVlLFxuICB9KTtcbiAgY29uc3QgaXNUZXN0RWFnZXIgPVxuICAgIGluaXRpYWxFbnRyeXBvaW50cy50ZXN0TW9kdWxlID09IG51bGwgJiZcbiAgICBpbml0aWFsRW50cnlwb2ludHMudGVzdENsaWVudCA9PSBudWxsICYmXG4gICAgaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RTZXJ2ZXIgPT0gbnVsbDtcbiAgY29uc3QgaXNUZXN0TW9kdWxlID0gaW5pdGlhbEVudHJ5cG9pbnRzLnRlc3RNb2R1bGUgIT0gbnVsbCB8fCBpc1Rlc3RFYWdlcjtcbiAgY29uc3QgdGVzdENsaWVudE1vZHVsZSA9IGdldEJ1aWxkRmlsZVBhdGgoe1xuICAgIGlzVGVzdDogdHJ1ZSxcbiAgICAuLi5lbnYsXG4gICAgLi4uY29tbWFuZFJvbGUsXG4gICAgaXNUZXN0TW9kdWxlLFxuICAgIGlzQ2xpZW50OiB0cnVlLFxuICB9KTtcbiAgY29uc3QgdGVzdFNlcnZlck1vZHVsZSA9IGdldEJ1aWxkRmlsZVBhdGgoe1xuICAgIGlzVGVzdDogdHJ1ZSxcbiAgICAuLi5lbnYsXG4gICAgLi4uY29tbWFuZFJvbGUsXG4gICAgaXNUZXN0TW9kdWxlLFxuICAgIGlzU2VydmVyOiB0cnVlLFxuICB9KTtcblxuICBsZXQgYXBwRW50cnlwb2ludHMgPSB7XG4gICAgbWFpbkNsaWVudDogYCR7UlNQQUNLX0JVSUxEX0NPTlRFWFR9LyR7bWFpbkNsaWVudE1vZHVsZX1gLFxuICAgIG1haW5TZXJ2ZXI6IGAke1JTUEFDS19CVUlMRF9DT05URVhUfS8ke21haW5TZXJ2ZXJNb2R1bGV9YCxcbiAgICAuLi4oKGlzVGVzdE1vZHVsZSAmJiB7XG4gICAgICB0ZXN0Q2xpZW50OiBgJHtSU1BBQ0tfQlVJTERfQ09OVEVYVH0vJHt0ZXN0Q2xpZW50TW9kdWxlfWAsXG4gICAgICB0ZXN0U2VydmVyOiBgJHtSU1BBQ0tfQlVJTERfQ09OVEVYVH0vJHt0ZXN0U2VydmVyTW9kdWxlfWAsXG4gICAgfSkgfHwge1xuICAgICAgdGVzdENsaWVudDogYCR7UlNQQUNLX0JVSUxEX0NPTlRFWFR9LyR7dGVzdENsaWVudE1vZHVsZX1gLFxuICAgICAgdGVzdFNlcnZlcjogYCR7UlNQQUNLX0JVSUxEX0NPTlRFWFR9LyR7dGVzdFNlcnZlck1vZHVsZX1gLFxuICAgIH0pLFxuICB9O1xuICBpZiAoaXNNZXRlb3JBcHBUZXN0RnVsbEFwcCgpKSB7XG4gICAgYXBwRW50cnlwb2ludHMgPSB7XG4gICAgICAuLi5hcHBFbnRyeXBvaW50cyxcbiAgICAgIG1haW5DbGllbnQ6IGAke1JTUEFDS19CVUlMRF9DT05URVhUfS8ke3Rlc3RDbGllbnRNb2R1bGV9YCxcbiAgICAgIG1haW5TZXJ2ZXI6IGAke1JTUEFDS19CVUlMRF9DT05URVhUfS8ke3Rlc3RTZXJ2ZXJNb2R1bGV9YCxcbiAgICB9O1xuICB9XG4gIC8vIFNldCBlbnRyeSBwb2ludHMgaW4gZW52aXJvbm1lbnQgdmFyaWFibGVzIGlmIHRoZXkgZXhpc3RcbiAgc2V0TWV0ZW9yQXBwRW50cnlwb2ludHMoYXBwRW50cnlwb2ludHMpO1xuXG4gIGlmIChpc01ldGVvckFwcERlYnVnKCkgfHwgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlKCkpIHtcbiAgICBsb2dJbmZvKGBbaV0gQXBwIGVudHJ5cG9pbnRzOiAke0pTT04uc3RyaW5naWZ5KGFwcEVudHJ5cG9pbnRzLCBudWxsLCAyKX1gKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSBtb2R1bGUgZmlsZXMgZXhpc3RcbiAgZW5zdXJlTW9kdWxlRmlsZXNFeGlzdCgpO1xuXG4gIC8vIFdyaXRlIGNvbnRlbnQgdG8gbW9kdWxlIGZpbGVzXG4gIGlmIChpc01ldGVvckFwcFJ1bigpICYmIGlzTWV0ZW9yQXBwRGV2ZWxvcG1lbnQoKSAmJiAhaXNNZXRlb3JBcHBOYXRpdmUoKSkge1xuICAgIGNvbnN0IGN1c3RvbVNjcmlwdFVybCA9IGAvX19yc3BhY2tfXy8ke2dldEJ1aWxkRmlsZVBhdGgoe1xuICAgICAgLi4uZW52LFxuICAgICAgaXNNYWluOiB0cnVlLFxuICAgICAgaXNDbGllbnQ6IHRydWUsXG4gICAgICByb2xlOiBGSUxFX1JPTEUub3V0cHV0LFxuICAgICAgb25seUZpbGVuYW1lOiB0cnVlLFxuICAgIH0pfWA7XG4gICAgc2V0TWV0ZW9yQXBwQ3VzdG9tU2NyaXB0VXJsKGN1c3RvbVNjcmlwdFVybCk7XG5cbiAgICBpZiAoaXNNZXRlb3JBcHBEZWJ1ZygpIHx8IGlzTWV0ZW9yQXBwQ29uZmlnTW9kZXJuVmVyYm9zZSgpKSB7XG4gICAgICBsb2dJbmZvKGBbaV0gQXBwIGN1c3RvbSBzY3JpcHQ6ICR7Y3VzdG9tU2NyaXB0VXJsfWApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFwcGxpZXMgZGVsZWdhdGVkIGV4dGVuc2lvbiBpZ25vcmUgcGF0dGVybnMgZm9yIGVudHJ5IGZvbGRlciBmaWxlcy5cbiAqIENhbGxlZCBhZnRlciByc3BhY2sncyBmaXJzdCBjb21waWxhdGlvbiByZXBvcnRzIHdoaWNoIGV4dGVuc2lvbnMgaXQgaGFuZGxlcy5cbiAqIFNpbmNlIE1ldGVvciBhd2FpdHMgcnNwYWNrIGNvbXBpbGF0aW9uIGJlZm9yZSBzY2FubmluZyBmaWxlcywgdGhlc2UgcGF0dGVybnNcbiAqIGFyZSBpbiBwbGFjZSBiZWZvcmUgTWV0ZW9yIHByb2Nlc3NlcyBhbnkgYXBwbGljYXRpb24gZmlsZXMuXG4gKlxuICogVXNlcyBnaXRpZ25vcmUgc2VtYW50aWNzOiBhIGxhdGVyIHBvc2l0aXZlIHBhdHRlcm4gKGNsaWVudC8qLmNzcykgb3ZlcnJpZGVzXG4gKiBhbiBlYXJsaWVyIG5lZ2F0aW9uICghY2xpZW50LyouY3NzKSB0aGF0IHdhcyBzZXQgaW4gY29uZmlndXJlTWV0ZW9yRm9yUnNwYWNrLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGV4dGVuc2lvbnMgLSBBcnJheSBvZiBleHRlbnNpb25zIGxpa2UgWycuY3NzJywgJy5sZXNzJ11cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RGVsZWdhdGVkRXh0ZW5zaW9ucyhleHRlbnNpb25zKSB7XG4gIGlmICghZXh0ZW5zaW9ucyB8fCBleHRlbnNpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIGNvbnN0IGluaXRpYWxFbnRyeXBvaW50cyA9IGdldEluaXRpYWxFbnRyeXBvaW50cygpO1xuICBjb25zdCBlbnRyeXBvaW50Q29udGV4dHMgPSBbXG4gICAgaW5pdGlhbEVudHJ5cG9pbnRzLm1haW5DbGllbnQsXG4gICAgaW5pdGlhbEVudHJ5cG9pbnRzLm1haW5TZXJ2ZXIsXG4gIF1cbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLm1hcChlbnRyeXBvaW50ID0+IHBhdGguZGlybmFtZShlbnRyeXBvaW50KSk7XG5cbiAgY29uc3QgaWdub3JlUGF0dGVybnMgPSBbXTtcbiAgZm9yIChjb25zdCBkaXIgb2YgZW50cnlwb2ludENvbnRleHRzKSB7XG4gICAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgICAgLy8gZXh0IGNvbWVzIGFzICcuY3NzJywgZ2xvYiBuZWVkcyAnKi5jc3MnXG4gICAgICBpZ25vcmVQYXR0ZXJucy5wdXNoKGAke2Rpcn0vKiR7ZXh0fWApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpZ25vcmVQYXR0ZXJucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gUmUtYXBwZW5kIG1ldGVvci5tb2R1bGVzIHVuaWdub3JlIHBhdHRlcm5zIGFmdGVyIHRoZSBkZWxlZ2F0aW9uIGlnbm9yZXNcbiAgICAvLyBzbyB0aGV5IHRha2UgcHJlY2VkZW5jZSAoZ2l0aWdub3JlIHNlbWFudGljczogbGFzdCBtYXRjaCB3aW5zKVxuICAgIGNvbnN0IG1ldGVvckFwcENvbmZpZyA9IGdldE1ldGVvckFwcENvbmZpZygpO1xuICAgIGNvbnN0IHVuaWdub3JlZEZpbGVzQW5kRm9sZGVycyA9IGJ1aWxkVW5pZ25vcmVQYXR0ZXJucyhcbiAgICAgIG1ldGVvckFwcENvbmZpZz8ubW9kdWxlcyB8fCBbXSxcbiAgICAgIHsgc2tpcExldmVsOiAxIH0sXG4gICAgKTtcblxuICAgIHNldE1ldGVvckFwcElnbm9yZShcbiAgICAgIFsuLi5pZ25vcmVQYXR0ZXJucywgLi4udW5pZ25vcmVkRmlsZXNBbmRGb2xkZXJzXS5qb2luKCcgJylcbiAgICApO1xuXG4gICAgaWYgKGlzTWV0ZW9yQXBwRGVidWcoKSB8fCBpc01ldGVvckFwcENvbmZpZ01vZGVyblZlcmJvc2UoKSkge1xuICAgICAgbG9nSW5mbyhgW2ldIFJzcGFjayBkZWxlZ2F0ZWQgZXh0ZW5zaW9uczogJHtleHRlbnNpb25zLmpvaW4oJywgJyl9IChpZ25vcmVkIGluIGVudHJ5IGZvbGRlcnMpXFxuICAgICR7cHJvY2Vzcy5lbnYuTUVURU9SX0lHTk9SRX1gKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogQG1vZHVsZSByc3BhY2tfcGx1Z2luXG4gKiBAZGVzY3JpcHRpb24gUnNwYWNrIFBsdWdpbiBmb3IgTWV0ZW9yXG4gKlxuICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIFJzcGFjayBwbHVnaW4uIEl0IG9yY2hlc3RyYXRlcyB0aGUgaW50ZWdyYXRpb25cbiAqIGJldHdlZW4gUnNwYWNrIGFuZCBNZXRlb3IgYnk6XG4gKiAxLiBFbnN1cmluZyBSc3BhY2sgYW5kIHJlbGF0ZWQgZGVwZW5kZW5jaWVzIGFyZSBpbnN0YWxsZWRcbiAqIDIuIFNldHRpbmcgdXAgdGhlIGJ1aWxkIGNvbnRleHQgZGlyZWN0b3J5XG4gKiAzLiBDb25maWd1cmluZyBNZXRlb3Igc2V0dGluZ3MgZm9yIFJzcGFja1xuICogNC4gU3RhcnRpbmcgUnNwYWNrIHByb2Nlc3NlcyBiYXNlZCBvbiB0aGUgTWV0ZW9yIGNvbW1hbmQgKHJ1biBvciBidWlsZClcbiAqIDUuIEhhbmRsaW5nIGNsZWFudXAgd2hlbiB0aGUgcGx1Z2luIGlzIHN0b3BwZWRcbiAqXG4gKiBUaGUgcGx1Z2luIHVzZXMgdG9wLWxldmVsIGF3YWl0IHRvIGVuc3VyZSBhc3luY2hyb25vdXMgb3BlcmF0aW9ucyBjb21wbGV0ZVxuICogYmVmb3JlIE1ldGVvciBjb250aW51ZXMgZXhlY3V0aW9uLlxuICovXG5cbi8vIEltcG9ydCBtb2R1bGVzIGZyb20gbGliXG5jb25zdCB7XG4gIEdMT0JBTF9TVEFURV9LRVlTLFxufSA9IHJlcXVpcmUoJy4vbGliL2NvbnN0YW50cycpO1xuXG5jb25zdCB7XG4gIGVuc3VyZVJzcGFja0luc3RhbGxlZCxcbiAgY2hlY2tSZWFjdEluc3RhbGxlZCxcbiAgY2hlY2tBbmd1bGFySW5zdGFsbGVkLFxuICBjaGVja1R5cGVzY3JpcHRJbnN0YWxsZWQsXG4gIGVuc3VyZVJzcGFja1JlYWN0SW5zdGFsbGVkLFxufSA9IHJlcXVpcmUoJy4vbGliL2RlcGVuZGVuY2llcycpO1xuXG5jb25zdCB7XG4gIGVuc3VyZVJzcGFja0J1aWxkQ29udGV4dEV4aXN0cyxcbiAgZW5zdXJlUnNwYWNrQ29uZmlnRXhpc3RzLFxuICBjbGVhbkJ1aWxkQ29udGV4dEZpbGVzLFxufSA9IHJlcXVpcmUoJy4vbGliL2J1aWxkLWNvbnRleHQnKTtcblxuY29uc3Qge1xuICBzdGFydFJzcGFja0NsaWVudFNlcnZlLFxuICBzdGFydFJzcGFja1NlcnZlcldhdGNoLFxuICBydW5Sc3BhY2tCdWlsZCxcbiAgY2xlYW51cCxcbiAgY2FsY3VsYXRlRGV2U2VydmVyUG9ydCxcbiAgY2FsY3VsYXRlUnNkb2N0b3JDbGllbnRQb3J0LFxuICBjYWxjdWxhdGVSc2RvY3RvclNlcnZlclBvcnQsXG4gIGdldENvbmZpZ0ZpbGVQYXRoLFxuICBnZXRDdXN0b21Db25maWdGaWxlUGF0aCxcbn0gPSByZXF1aXJlKCcuL2xpYi9wcm9jZXNzZXMnKTtcblxuY29uc3Qge1xuICBjb25maWd1cmVNZXRlb3JGb3JSc3BhY2tcbn0gPSByZXF1aXJlKCcuL2xpYi9jb25maWcnKTtcblxuY29uc3Qge1xuICBzZXR1cENvbXBpbGF0aW9uVHJhY2tpbmcsXG4gIHdhaXRGb3JGaXJzdENvbXBpbGF0aW9uLFxufSA9IHJlcXVpcmUoJy4vbGliL2NvbXBpbGF0aW9uJyk7XG5cbmNvbnN0IHtcbiAgZ2V0R2xvYmFsU3RhdGUsXG4gIHNldEdsb2JhbFN0YXRlXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL2dsb2JhbC1zdGF0ZScpO1xuXG5jb25zdCB7XG4gIGlzTWV0ZW9yQXBwUnVuLFxuICBpc01ldGVvckFwcEJ1aWxkLFxuICBpc01ldGVvckFwcFVwZGF0ZSxcbiAgZ2V0TWV0ZW9ySW5pdGlhbEFwcEVudHJ5cG9pbnRzLFxuICBnZXRNZXRlb3JBcHBFbnRyeXBvaW50cyxcbiAgaXNNZXRlb3JBcHBUZXN0LFxuICBpc01ldGVvckFwcFRlc3RXYXRjaCxcbiAgaXNNZXRlb3JBcHBEZXZlbG9wbWVudCxcbiAgaXNNZXRlb3JBcHBQcm9kdWN0aW9uLFxuICBpc01ldGVvckFwcERlYnVnLFxuICBpc01ldGVvckFwcENvbmZpZ01vZGVyblZlcmJvc2UsXG4gIGlzTWV0ZW9yQXBwTmF0aXZlLFxuICBpc01ldGVvckJ1bmRsZVZpc3VhbGl6ZXJQcm9qZWN0LFxufSA9IHJlcXVpcmUoJ21ldGVvci90b29scy1jb3JlL2xpYi9tZXRlb3InKTtcblxuY29uc3Qge1xuICBsb2dJbmZvLFxuICBsb2dFcnJvcixcbn0gPSByZXF1aXJlKCdtZXRlb3IvdG9vbHMtY29yZS9saWIvbG9nJyk7XG5cbmNvbnN0IHtcbiAgZ2V0TnB4Q29tbWFuZCxcbiAgZ2V0TnBtQ29tbWFuZCxcbiAgZ2V0WWFybkNvbW1hbmQsXG4gIGlzWWFyblByb2plY3QsXG59ID0gcmVxdWlyZSgnbWV0ZW9yL3Rvb2xzLWNvcmUvbGliL25wbScpO1xuY29uc3QgeyBoYXNNZXRlb3JBcHBDb25maWdBdXRvSW5zdGFsbERlcHMgfSA9IHJlcXVpcmUoXCIuLi90b29scy1jb3JlL2xpYi9tZXRlb3JcIik7XG5cbi8vIEdldCBlbnRyeSBwb2ludHMgZnJvbSBNZXRlb3IgY29uZmlndXJhdGlvblxubGV0IGluaXRpYWxFbnRyeXBvaW50cztcbmlmIChpc01ldGVvckFwcFJ1bigpIHx8IGlzTWV0ZW9yQXBwQnVpbGQoKSB8fCBpc01ldGVvckFwcFRlc3QoKSB8fCBpc01ldGVvckFwcFVwZGF0ZSgpKSB7XG4gIGluaXRpYWxFbnRyeXBvaW50cyA9IGdldE1ldGVvckluaXRpYWxBcHBFbnRyeXBvaW50cygpO1xuXG4gIC8vIENoZWNrIGlmIG1haW5DbGllbnQgYW5kIG1haW5TZXJ2ZXIgZXhpc3RcbiAgaWYgKCFpbml0aWFsRW50cnlwb2ludHM/Lm1haW5TZXJ2ZXIpIHtcbiAgICBsb2dFcnJvcihgXFxu4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAYCk7XG4gICAgbG9nRXJyb3IoYOKUgiDinYwgTWlzc2luZyBSZXF1aXJlZCBFbnRyeSBQb2ludHNgKTtcbiAgICBsb2dFcnJvcihg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAYCk7XG4gICAgbG9nRXJyb3IoYFlvdXIgcHJvamVjdCBpcyBtaXNzaW5nIHRoZSByZXF1aXJlZCBlbnRyeSBwb2ludHMgZm9yIFJzcGFjay5gKTtcbiAgICBsb2dFcnJvcihgUGxlYXNlIGFkZCB0aGUgZm9sbG93aW5nIHRvIHlvdXIgcGFja2FnZS5qc29uIGZpbGU6YCk7XG4gICAgbG9nRXJyb3IoYFxue1xuICBcIm1ldGVvclwiOiB7XG4gICAgXCJtYWluTW9kdWxlXCI6IHtcbiAgICAgIFwiY2xpZW50XCI6IFwiY2xpZW50L21haW4uanNcIixcbiAgICAgIFwic2VydmVyXCI6IFwic2VydmVyL21haW4uanNcIlxuICAgIH1cbiAgfVxufVxuYCk7XG4gICAgbG9nRXJyb3IoYE1ha2Ugc3VyZSB0byByZXBsYWNlIHRoZSBwYXRocyB3aXRoIHlvdXIgYWN0dWFsIGVudHJ5IHBvaW50IGZpbGVzLmApO1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJNaXNzaW5nIHJlcXVpcmVkIGVudHJ5IHBvaW50cy4gUGxlYXNlIGFkZCBtZXRlb3IubWFpbk1vZHVsZS5jbGllbnQgYW5kIG1ldGVvci5tYWluTW9kdWxlLnNlcnZlciBpbiB5b3VyIHBhY2thZ2UuanNvbiBmaWxlLlwiXG4gICAgKTtcbiAgfVxuXG4gIHNldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLklOSVRJQUxfRU5UUllQT05UUywgZ2V0TWV0ZW9yQXBwRW50cnlwb2ludHMoKSk7XG5cbiAgbGV0IGlzWWFyblByb2ogPSBwcm9jZXNzLmVudi5ZQVJOX0VOQUJMRUQgPT09ICd0cnVlJztcbiAgLy8gTWFpbiBlbnRyeSBwb2ludCAtIHVzaW5nIHRvcC1sZXZlbCBhd2FpdFxuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHRoZSBwcm9qZWN0IGlzIGEgWWFybiBwcm9qZWN0IGFuZCBzdG9yZSB0aGUgcmVzdWx0IGluIGVudmlyb25tZW50IHZhcmlhYmxlIGlmIG5vdCBhbHJlYWR5IHNldFxuICAgIGlmIChwcm9jZXNzLmVudi5ZQVJOX0VOQUJMRUQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaXNZYXJuUHJvaiA9IGlzWWFyblByb2plY3QoKTtcbiAgICAgIHByb2Nlc3MuZW52LllBUk5fRU5BQkxFRCA9IGlzWWFyblByb2ogPyAndHJ1ZScgOiAnZmFsc2UnO1xuICAgIH1cbiAgICBpZiAoaXNNZXRlb3JBcHBEZWJ1ZygpIHx8IGlzTWV0ZW9yQXBwQ29uZmlnTW9kZXJuVmVyYm9zZSgpKSB7XG4gICAgICBsb2dJbmZvKGBbaV0gTWV0ZW9yIE5weCBwcmVmaXg6ICR7Z2V0TnB4Q29tbWFuZChbXSk/LnByZWZpeH1gKTtcbiAgICAgIGxvZ0luZm8oYFtpXSBNZXRlb3IgTnBtIHByZWZpeDogJHtnZXROcG1Db21tYW5kKFtdKT8ucHJlZml4fWApO1xuICAgICAgaWYgKGlzWWFyblByb2opIHtcbiAgICAgICAgbG9nSW5mbyhgW2ldIE1ldGVvciBZYXJuIHByZWZpeDogJHtnZXRZYXJuQ29tbWFuZChbXSk/LnByZWZpeH1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDbGVhbiBidWlsZCBjb250ZXh0IGZpbGVzIG9ubHkgaWYgdGhleSBoYXZlbid0IGJlZW4gY2xlYW5lZCB5ZXRcbiAgICBpZiAoIWdldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLkJVSUxEX0NPTlRFWFRfRklMRVNfQ0xFQU5FRCkpIHtcbiAgICAgIGNsZWFuQnVpbGRDb250ZXh0RmlsZXMoKTtcbiAgICAgIHNldEdsb2JhbFN0YXRlKEdMT0JBTF9TVEFURV9LRVlTLkJVSUxEX0NPTlRFWFRfRklMRVNfQ0xFQU5FRCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gQXV0byBpbnN0YWxsIGRlcHMgKGJ5IGRlZmF1bHQgZW5hYmxlZClcbiAgICBpZiAoaGFzTWV0ZW9yQXBwQ29uZmlnQXV0b0luc3RhbGxEZXBzKCkpIHtcbiAgICAgIC8vIEVuc3VyZSBSc3BhY2sgaXMgaW5zdGFsbGVkXG4gICAgICBhd2FpdCBlbnN1cmVSc3BhY2tJbnN0YWxsZWQoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBSc3BhY2sgUmVhY3QgaXMgaW5zdGFsbGVkXG4gICAgaWYgKGNoZWNrUmVhY3RJbnN0YWxsZWQoKSkge1xuICAgICAgLy8gQXV0byBpbnN0YWxsIGRlcHMgKGJ5IGRlZmF1bHQgZW5hYmxlZClcbiAgICAgIGlmIChoYXNNZXRlb3JBcHBDb25maWdBdXRvSW5zdGFsbERlcHMoKSkge1xuICAgICAgICBhd2FpdCBlbnN1cmVSc3BhY2tSZWFjdEluc3RhbGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcihgUnNwYWNrIHBsdWdpbiBlcnJvcjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmlmIChpc01ldGVvckFwcFJ1bigpIHx8IGlzTWV0ZW9yQXBwQnVpbGQoKSB8fCBpc01ldGVvckFwcFRlc3QoKSkge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIEFuZ3VsYXIgaXMgaW5zdGFsbGVkXG4gICAgY2hlY2tBbmd1bGFySW5zdGFsbGVkKCk7XG5cbiAgICAvLyBDaGVjayBpZiBUeXBlU2NyaXB0IGlzIGluc3RhbGxlZFxuICAgIGNoZWNrVHlwZXNjcmlwdEluc3RhbGxlZCgpO1xuXG4gICAgLy8gRW5zdXJlIHRoZSBSc3BhY2sgYnVpbGQgY29udGV4dCBkaXJlY3RvcnkgZXhpc3RzXG4gICAgZW5zdXJlUnNwYWNrQnVpbGRDb250ZXh0RXhpc3RzKCk7XG5cbiAgICAvLyBFbnN1cmUgdGhlIHJzcGFjay5jb25maWcuanMgZmlsZSBleGlzdHMgYXQgdGhlIHByb2plY3QgbGV2ZWxcbiAgICBlbnN1cmVSc3BhY2tDb25maWdFeGlzdHMoKTtcblxuICAgIC8vIENvbmZpZ3VyZSBNZXRlb3Igc2V0dGluZ3MgZm9yIFJzcGFja1xuICAgIGNvbmZpZ3VyZU1ldGVvckZvclJzcGFjaygpO1xuXG4gICAgLy8gU2V0IG5hdGl2ZSBtb2RlIGZsYWcgc28gdGhlIHNlcnZlciBtb2R1bGUgY2FuIHNraXAgZGV2IHByb3h5IHNldHVwXG4gICAgaWYgKGlzTWV0ZW9yQXBwTmF0aXZlKCkpIHtcbiAgICAgIHByb2Nlc3MuZW52LlJTUEFDS19OQVRJVkUgPSAndHJ1ZSc7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGFuZCBzZXQgdGhlIGRldlNlcnZlclBvcnQgYXQgYm9vdFxuICAgIGlmICghcHJvY2Vzcy5lbnYuUlNQQUNLX0RFVlNFUlZFUl9QT1JUKSB7XG4gICAgICBwcm9jZXNzLmVudi5SU1BBQ0tfREVWU0VSVkVSX1BPUlQgPSBjYWxjdWxhdGVEZXZTZXJ2ZXJQb3J0KCk7XG4gICAgICBpZiAoaXNNZXRlb3JBcHBEZWJ1ZygpIHx8IGlzTWV0ZW9yQXBwQ29uZmlnTW9kZXJuVmVyYm9zZSgpKSB7XG4gICAgICAgIGxvZ0luZm8oYFtpXSBSc3BhY2sgRGV2U2VydmVyIFBvcnQ6ICR7cHJvY2Vzcy5lbnYuUlNQQUNLX0RFVlNFUlZFUl9QT1JUfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc01ldGVvckFwcERlYnVnKCkgfHwgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlKCkpIHtcbiAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBnZXRDb25maWdGaWxlUGF0aCgpO1xuICAgICAgbG9nSW5mbyhgW2ldIFJzcGFjayBkZWZhdWx0IGNvbmZpZzogJHtjb25maWdGaWxlfWApO1xuICAgICAgY29uc3QgcHJvamVjdENvbmZpZ0ZpbGUgPSBnZXRDdXN0b21Db25maWdGaWxlUGF0aCgpO1xuICAgICAgbG9nSW5mbyhgW2ldIFJzcGFjayBjdXN0b20gY29uZmlnOiAke3Byb2plY3RDb25maWdGaWxlfWApO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBhbmQgc2V0IHRoZSBSc2RvY3RvciBjbGllbnQgYW5kIHNlcnZlciBwb3J0cyBhdCBib290IG9ubHkgaWYgYnVuZGxlIHZpc3VhbGl6ZXIgaXMgZW5hYmxlZFxuICAgIGlmIChpc01ldGVvckJ1bmRsZVZpc3VhbGl6ZXJQcm9qZWN0KCkpIHtcbiAgICAgIGlmICghcHJvY2Vzcy5lbnYuUlNET0NUT1JfQ0xJRU5UX1BPUlQpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuUlNET0NUT1JfQ0xJRU5UX1BPUlQgPSBjYWxjdWxhdGVSc2RvY3RvckNsaWVudFBvcnQoKTtcbiAgICAgICAgaWYgKGlzTWV0ZW9yQXBwRGVidWcoKSB8fCBpc01ldGVvckFwcENvbmZpZ01vZGVyblZlcmJvc2UoKSkge1xuICAgICAgICAgIGxvZ0luZm8oYFtpXSBSc2RvY3RvciBDbGllbnQgUG9ydDogJHtwcm9jZXNzLmVudi5SU0RPQ1RPUl9DTElFTlRfUE9SVH1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXByb2Nlc3MuZW52LlJTRE9DVE9SX1NFUlZFUl9QT1JUKSB7XG4gICAgICAgIHByb2Nlc3MuZW52LlJTRE9DVE9SX1NFUlZFUl9QT1JUID0gY2FsY3VsYXRlUnNkb2N0b3JTZXJ2ZXJQb3J0KCk7XG4gICAgICAgIGlmIChpc01ldGVvckFwcERlYnVnKCkgfHwgaXNNZXRlb3JBcHBDb25maWdNb2Rlcm5WZXJib3NlKCkpIHtcbiAgICAgICAgICBsb2dJbmZvKGBbaV0gUnNkb2N0b3IgU2VydmVyIFBvcnQ6ICR7cHJvY2Vzcy5lbnYuUlNET0NUT1JfU0VSVkVSX1BPUlR9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciBjbGVhbnVwIGhhbmRsZXJcbiAgICBwcm9jZXNzLm9uKCdleGl0JywgY2xlYW51cCk7XG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgY2xlYW51cCgpO1xuICAgICAgcHJvY2Vzcy5leGl0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBXaGVuIHJ1bm5pbmcgYG1ldGVvciBydW5gIGNvbW1hbmRcbiAgICBpZiAoaXNNZXRlb3JBcHBSdW4oKSkge1xuICAgICAgLy8gU2V0dXAgY29tcGlsYXRpb24gdHJhY2tpbmcgYW5kIGNhbGxiYWNrc1xuICAgICAgY29uc3Qge1xuICAgICAgICBjbGllbnRGaXJzdENvbXBpbGUsXG4gICAgICAgIHNlcnZlckZpcnN0Q29tcGlsZSxcbiAgICAgICAgY2xpZW50Rmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgc2VydmVyRmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgb25Db21waWxlQ2xpZW50LFxuICAgICAgICBvbkNvbXBpbGVTZXJ2ZXIsXG4gICAgICB9ID0gc2V0dXBDb21waWxhdGlvblRyYWNraW5nKCk7XG5cbiAgICAgIC8vIEZvciAncnVuJyBjb21tYW5kLCBzdGFydCBSc3BhY2sgaW4gYXBwcm9wcmlhdGUgbW9kZXMgd2l0aCBkaXN0aW5jdCBjYWxsYmFja3NcbiAgICAgIGlmIChpc01ldGVvckFwcERldmVsb3BtZW50KCkgJiYgIWlzTWV0ZW9yQXBwTmF0aXZlKCkpIHtcbiAgICAgICAgaWYgKGluaXRpYWxFbnRyeXBvaW50cz8ubWFpbkNsaWVudCkge1xuICAgICAgICAgIHN0YXJ0UnNwYWNrQ2xpZW50U2VydmUoeyBvbkNvbXBpbGU6IG9uQ29tcGlsZUNsaWVudCB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5pdGlhbEVudHJ5cG9pbnRzPy5tYWluU2VydmVyKSB7XG4gICAgICAgICAgc3RhcnRSc3BhY2tTZXJ2ZXJXYXRjaCh7IG9uQ29tcGlsZTogb25Db21waWxlU2VydmVyIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzTWV0ZW9yQXBwUHJvZHVjdGlvbigpIHx8IGlzTWV0ZW9yQXBwTmF0aXZlKCkpIHtcbiAgICAgICAgaWYgKGluaXRpYWxFbnRyeXBvaW50cz8ubWFpbkNsaWVudCkge1xuICAgICAgICAgIHJ1blJzcGFja0J1aWxkKHtcbiAgICAgICAgICAgIGlzQ2xpZW50OiB0cnVlLFxuICAgICAgICAgICAgaXNTZXJ2ZXI6IGZhbHNlLFxuICAgICAgICAgICAgd2F0Y2g6IHRydWUsXG4gICAgICAgICAgICBvbkNvbXBpbGU6IG9uQ29tcGlsZUNsaWVudCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5pdGlhbEVudHJ5cG9pbnRzPy5tYWluU2VydmVyKSB7XG4gICAgICAgICAgcnVuUnNwYWNrQnVpbGQoe1xuICAgICAgICAgICAgaXNTZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgICBpc0NsaWVudDogZmFsc2UsXG4gICAgICAgICAgICB3YXRjaDogdHJ1ZSxcbiAgICAgICAgICAgIG9uQ29tcGlsZTogb25Db21waWxlU2VydmVyLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdhaXQgZm9yIGZpcnN0IGNvbXBpbGF0aW9uIHRvIGNvbXBsZXRlXG4gICAgICBjb25zdCB3YWl0VGFyZ2V0ID1cbiAgICAgICAgaW5pdGlhbEVudHJ5cG9pbnRzPy5tYWluQ2xpZW50ICYmIGluaXRpYWxFbnRyeXBvaW50cz8ubWFpblNlcnZlclxuICAgICAgICAgID8gJ2JvdGgnXG4gICAgICAgICAgOiAnc2VydmVyJztcbiAgICAgIGF3YWl0IHdhaXRGb3JGaXJzdENvbXBpbGF0aW9uKFxuICAgICAgICBjbGllbnRGaXJzdENvbXBpbGUsXG4gICAgICAgIHNlcnZlckZpcnN0Q29tcGlsZSxcbiAgICAgICAgY2xpZW50Rmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgc2VydmVyRmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgeyB0YXJnZXQ6IHdhaXRUYXJnZXQgfSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFdoZW4gcnVubmluZyBgbWV0ZW9yIHRlc3RgIGNvbW1hbmRcbiAgICB9IGVsc2UgaWYgKGlzTWV0ZW9yQXBwVGVzdCgpKSB7XG4gICAgICBjb25zdCBpbml0aWFsRW50cnlwb2ludHMgPSBnZXRNZXRlb3JJbml0aWFsQXBwRW50cnlwb2ludHMoKTtcblxuICAgICAgLy8gU2V0dXAgY29tcGlsYXRpb24gdHJhY2tpbmcgYW5kIGNhbGxiYWNrc1xuICAgICAgY29uc3Qge1xuICAgICAgICBjbGllbnRGaXJzdENvbXBpbGUsXG4gICAgICAgIHNlcnZlckZpcnN0Q29tcGlsZSxcbiAgICAgICAgY2xpZW50Rmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgc2VydmVyRmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgb25Db21waWxlQ2xpZW50LFxuICAgICAgICBvbkNvbXBpbGVTZXJ2ZXIsXG4gICAgICB9ID0gc2V0dXBDb21waWxhdGlvblRyYWNraW5nKCk7XG5cbiAgICAgIC8vIFdoZW4gdGVzdE1vZHVsZSBpcyBzcGVjaWZpZWQgZm9yIGNsaWVudCBvciBzZXJ2ZXIsIHJ1biBSc3BhY2sgY29uc2lkZXJpbmcgdGhvc2UgZmlsZXNcbiAgICAgIGlmIChpbml0aWFsRW50cnlwb2ludHM/LnRlc3RDbGllbnQgfHwgaW5pdGlhbEVudHJ5cG9pbnRzPy50ZXN0U2VydmVyKSB7XG4gICAgICAgIGlmIChpbml0aWFsRW50cnlwb2ludHM/LnRlc3RDbGllbnQpIHtcbiAgICAgICAgICBydW5Sc3BhY2tCdWlsZCh7XG4gICAgICAgICAgICBpc1Rlc3Q6IHRydWUsXG4gICAgICAgICAgICBpc0NsaWVudDogdHJ1ZSxcbiAgICAgICAgICAgIGlzU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgIHdhdGNoOiBpc01ldGVvckFwcFRlc3RXYXRjaCgpLFxuICAgICAgICAgICAgb25Db21waWxlOiBvbkNvbXBpbGVDbGllbnQsXG4gICAgICAgICAgICBsYWJlbDogJ1Rlc3QnLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluaXRpYWxFbnRyeXBvaW50cz8udGVzdFNlcnZlcikge1xuICAgICAgICAgIHJ1blJzcGFja0J1aWxkKHtcbiAgICAgICAgICAgIGlzVGVzdDogdHJ1ZSxcbiAgICAgICAgICAgIGlzQ2xpZW50OiBmYWxzZSxcbiAgICAgICAgICAgIGlzU2VydmVyOiB0cnVlLFxuICAgICAgICAgICAgd2F0Y2g6IGlzTWV0ZW9yQXBwVGVzdFdhdGNoKCksXG4gICAgICAgICAgICBvbkNvbXBpbGU6IG9uQ29tcGlsZVNlcnZlcixcbiAgICAgICAgICAgIGxhYmVsOiAnVGVzdCcsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXYWl0IGZvciBmaXJzdCBjb21waWxhdGlvbiB0byBjb21wbGV0ZVxuICAgICAgICBjb25zdCB3YWl0VGFyZ2V0ID1cbiAgICAgICAgICBpbml0aWFsRW50cnlwb2ludHM/LnRlc3RDbGllbnQgJiYgaW5pdGlhbEVudHJ5cG9pbnRzPy50ZXN0U2VydmVyXG4gICAgICAgICAgICA/ICdib3RoJ1xuICAgICAgICAgICAgOiAnc2VydmVyJztcbiAgICAgICAgYXdhaXQgd2FpdEZvckZpcnN0Q29tcGlsYXRpb24oXG4gICAgICAgICAgY2xpZW50Rmlyc3RDb21waWxlLFxuICAgICAgICAgIHNlcnZlckZpcnN0Q29tcGlsZSxcbiAgICAgICAgICBjbGllbnRGaXJzdENvbXBpbGVQcm9taXNlLFxuICAgICAgICAgIHNlcnZlckZpcnN0Q29tcGlsZVByb21pc2UsXG4gICAgICAgIHsgdGFyZ2V0OiB3YWl0VGFyZ2V0IH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gV2hlbiB0ZXN0TW9kdWxlIGlzIHNwZWNpZmllZCBhcyBhIHNpbmdsZSBmaWxlIG9yIG5vdCBzcGVjaWZpZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpbml0aWFsRW50cnlwb2ludHM/LnRlc3RNb2R1bGUpIHtcbiAgICAgICAgICBydW5Sc3BhY2tCdWlsZCh7XG4gICAgICAgICAgICBpc1Rlc3Q6IHRydWUsXG4gICAgICAgICAgICBpc1Rlc3RNb2R1bGU6IHRydWUsXG4gICAgICAgICAgICBpc0NsaWVudDogdHJ1ZSxcbiAgICAgICAgICAgIGlzU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgIHdhdGNoOiBpc01ldGVvckFwcFRlc3RXYXRjaCgpLFxuICAgICAgICAgICAgb25Db21waWxlOiBvbkNvbXBpbGVDbGllbnQsXG4gICAgICAgICAgICBsYWJlbDogJ1Rlc3QnLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJ1blJzcGFja0J1aWxkKHtcbiAgICAgICAgICBpc1Rlc3Q6IHRydWUsXG4gICAgICAgICAgaXNUZXN0TW9kdWxlOiB0cnVlLFxuICAgICAgICAgIGlzQ2xpZW50OiBmYWxzZSxcbiAgICAgICAgICBpc1NlcnZlcjogdHJ1ZSxcbiAgICAgICAgICB3YXRjaDogaXNNZXRlb3JBcHBUZXN0V2F0Y2goKSxcbiAgICAgICAgICBvbkNvbXBpbGU6IG9uQ29tcGlsZVNlcnZlcixcbiAgICAgICAgICBsYWJlbDogJ1Rlc3QnLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB3YWl0VGFyZ2V0ID0gaW5pdGlhbEVudHJ5cG9pbnRzPy50ZXN0TW9kdWxlID8gJ2JvdGgnIDogJ3NlcnZlcic7XG4gICAgICAgIGF3YWl0IHdhaXRGb3JGaXJzdENvbXBpbGF0aW9uKFxuICAgICAgICAgIGNsaWVudEZpcnN0Q29tcGlsZSxcbiAgICAgICAgICBzZXJ2ZXJGaXJzdENvbXBpbGUsXG4gICAgICAgICAgY2xpZW50Rmlyc3RDb21waWxlUHJvbWlzZSxcbiAgICAgICAgICBzZXJ2ZXJGaXJzdENvbXBpbGVQcm9taXNlLFxuICAgICAgICAgIHsgdGFyZ2V0OiB3YWl0VGFyZ2V0IH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2hlbiBydW5uaW5nIGBtZXRlb3IgYnVpbGRgIGNvbW1hbmRcbiAgICB9IGVsc2UgaWYgKGlzTWV0ZW9yQXBwQnVpbGQoKSkge1xuICAgICAgLy8gRm9yICdidWlsZCcgY29tbWFuZCwgcnVuIFJzcGFjayBidWlsZCB3aXRob3V0IHdhdGNoIG1vZGVcbiAgICAgIC8vIFJ1biBjbGllbnQgYW5kIHNlcnZlciBidWlsZHMgaW4gcGFyYWxsZWwgYW5kIHdhaXQgZm9yIGJvdGggdG8gY29tcGxldGVcbiAgICAgIGNvbnN0IHRhcmdldHNUb0J1aWxkID0gW1xuICAgICAgICBpbml0aWFsRW50cnlwb2ludHM/Lm1haW5DbGllbnQgJiZcbiAgICAgICAgICBydW5Sc3BhY2tCdWlsZCh7IGlzQ2xpZW50OiB0cnVlLCBpc1NlcnZlcjogZmFsc2UgfSksXG4gICAgICAgIGluaXRpYWxFbnRyeXBvaW50cz8ubWFpblNlcnZlciAmJlxuICAgICAgICAgIHJ1blJzcGFja0J1aWxkKHsgaXNTZXJ2ZXI6IHRydWUsIGlzQ2xpZW50OiBmYWxzZSB9KSxcbiAgICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodGFyZ2V0c1RvQnVpbGQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dFcnJvcihgUnNwYWNrIHBsdWdpbiBlcnJvcjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iXX0=
