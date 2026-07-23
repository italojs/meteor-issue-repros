//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


Package["core-runtime"].queue("blaze-hot",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Template = Package['templating-runtime'].Template;
var Promise = Package.promise.Promise;
var HTML = Package.htmljs.HTML;
var Spacebars = Package.spacebars.Spacebars;

var require = meteorInstall({"node_modules":{"meteor":{"blaze-hot":{"hot.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/blaze-hot/hot.js                                                                    //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
let Blaze;module.link('meteor/blaze',{Blaze(v){Blaze=v}},0);let Templates;module.link('meteor/templating-runtime',{Template(v){Templates=v}},1);let UpdateAll;module.link('./update-templates.js',{UpdateAll(v){UpdateAll=v}},2);


let importedTemplating = new WeakMap();
let currentModule = {
    id: null
};
const SourceModule = Symbol();
function patchTemplate(Template1) {
    const oldRegisterHelper = Template1.registerHelper;
    Template1.registerHelper = function(name, func) {
        func[SourceModule] = currentModule.id;
        oldRegisterHelper(name, func);
    };
    const oldOnCreated = Template1.prototype.onCreated;
    Template1.prototype.onCreated = function(cb) {
        if (cb) {
            cb[SourceModule] = currentModule.id;
        }
        return oldOnCreated.call(this, cb);
    };
    const oldOnRendered = Template1.prototype.onRendered;
    Template1.prototype.onRendered = function(cb) {
        if (cb) {
            cb[SourceModule] = currentModule.id;
        }
        return oldOnRendered.call(this, cb);
    };
    const oldOnDestroyed = Template1.prototype.onDestroyed;
    Template1.prototype.onDestroyed = function(cb) {
        if (cb) {
            cb[SourceModule] = currentModule.id;
        }
        return oldOnDestroyed.call(this, cb);
    };
    const oldHelpers = Template1.prototype.helpers;
    Template1.prototype.helpers = function(dict) {
        if (typeof dict === 'object') {
            for(let k in dict){
                if (dict[k]) {
                    dict[k][SourceModule] = currentModule.id;
                }
            }
        }
        return oldHelpers.call(this, dict);
    };
    const oldEvents = Template1.prototype.events;
    Template1.prototype.events = function(eventMap) {
        const result = oldEvents.call(this, eventMap);
        this.__eventMaps[this.__eventMaps.length - 1][SourceModule] = currentModule.id;
        return result;
    };
}
function cleanTemplate(template, moduleId) {
    let usedModule = false;
    if (!template || !Blaze.isTemplate(template)) {
        return usedModule;
    }
    function cleanArray(array) {
        for(let i = array.length - 1; i >= 0; i--){
            let item = array[i];
            if (item && item[SourceModule] === moduleId) {
                usedModule = true;
                array.splice(i, 1);
            }
        }
    }
    cleanArray(template._callbacks.created);
    cleanArray(template._callbacks.rendered);
    cleanArray(template._callbacks.destroyed);
    cleanArray(template.__eventMaps);
    Object.keys(template.__helpers).forEach((key)=>{
        if (template.__helpers[key] && template.__helpers[key][SourceModule] === moduleId) {
            usedModule = true;
            delete template.__helpers[key];
        }
    });
    return usedModule;
}
function shouldAccept(module1) {
    if (!importedTemplating.get(module1)) {
        return false;
    }
    if (!module1.exports) {
        return true;
    }
    return Object.keys(module1.exports).filter((key)=>key !== '__esModule').length === 0;
}
if (module.hot) {
    patchTemplate(Blaze.Template);
    module.hot.onRequire({
        before (module1) {
            if (module1.id === '/node_modules/meteor/blaze.js' || module1.id === '/node_modules/meteor/templating.js') {
                importedTemplating.set(currentModule, true);
            }
            let previousModule = currentModule;
            currentModule = module1;
            return previousModule;
        },
        after (module1, previousModule) {
            if (shouldAccept(module1)) {
                module1.hot.accept();
                module1.hot.dispose(()=>{
                    Object.keys(Templates).forEach((templateName)=>{
                        let template = Templates[templateName];
                        let usedByModule = cleanTemplate(template, module1.id);
                        if (usedByModule) {
                            Template._applyHmrChanges(templateName);
                        }
                    });
                    Object.values(Blaze._globalHelpers).forEach((helper)=>{
                        if (helper && helper[SourceModule] === module1.id) {
                            Template._applyHmrChanges(UpdateAll);
                        }
                    });
                });
            }
            currentModule = previousModule;
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////

},"update-templates.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/blaze-hot/update-templates.js                                                       //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
module.export({UpdateAll:()=>UpdateAll},true);const UpdateAll = Symbol('update all templates');
let renderedTemplates = {};
let overrideTemplateContentBlock = null;
let overrideTemplateElseBlock = null;
const oldConstructView = Template.prototype.constructView;
Template.prototype.constructView = function(...args) {
    let view = oldConstructView.apply(this, args);
    let templateName = this.viewName;
    view.onViewCreated(function() {
        renderedTemplates[templateName] = renderedTemplates[templateName] || [];
        renderedTemplates[templateName].push(view);
    });
    view.onViewDestroyed(function() {
        const index = renderedTemplates[templateName].indexOf(view);
        if (index > -1) {
            renderedTemplates[templateName].splice(index, 1);
        }
    });
    if (overrideTemplateContentBlock) {
        view.templateContentBlock = overrideTemplateContentBlock;
        overrideTemplateContentBlock = null;
    }
    if (overrideTemplateElseBlock) {
        view.templateElseBlock = overrideTemplateElseBlock;
        overrideTemplateElseBlock = null;
    }
    return view;
};
let updateRootViews = Template._applyHmrChanges;
let timeout = null;
let lastUpdateFailed = false;
let modifiedTemplates = new Set();
let templateViewPrefix = 'Template.';
// Overrides the default _applyHmrChanges with one that updates the specific
// views for modified templates instead of updating everything.
Template._applyHmrChanges = function(templateName = UpdateAll) {
    if (templateName === UpdateAll || lastUpdateFailed) {
        lastUpdateFailed = false;
        clearTimeout(timeout);
        updateRootViews();
        return;
    } else {
        modifiedTemplates.add(templateName);
    }
    if (timeout) {
        return;
    }
    timeout = setTimeout(()=>{
        for(let i = 0; i < Template.__pendingReplacement.length; i++){
            delete Template[Template.__pendingReplacement[i]];
        }
        Template.__pendingReplacement = [];
        timeout = null;
        modifiedTemplates.forEach((templateName)=>{
            modifiedTemplates.delete(templateName);
            let viewName = templateName;
            if (!(viewName in renderedTemplates)) {
                viewName = templateViewPrefix + viewName;
            } else {
                console.error('[Blaze HMR] Error: view name does not start with Template');
                return;
            }
            if (!(viewName in renderedTemplates)) {
                return;
            }
            let views = renderedTemplates[viewName];
            renderedTemplates[viewName] = [];
            while(views.length > 0){
                let view = views.pop();
                // find first parent template that isn't a content block
                while(!view.template || view.templateContentBlock || view.templateElseBlock){
                    if (!view.parentView) {
                        console.log('[Blaze HMR] Unable to update template', viewName);
                        return;
                    }
                    view = view.parentView;
                }
                if (!view.isRendered) {
                    continue;
                }
                // TODO: this can be removed if we don't update a view, and then update
                // one of its children (we only need to update the parent).
                Package.tracker.Tracker.flush();
                let parent = view.parentView;
                let parentElement = view._domrange.parentElement;
                let next = view._domrange.lastNode().nextSibling;
                let nextComment = null;
                if (!next) {
                    // percolate:momentum requires a next node to show the new nodes
                    next = nextComment = document.createComment('Blaze HMR Placeholder');
                    parentElement.insertBefore(nextComment, null);
                }
                if (!parent) {
                    // TODO: we only need to update a single root view
                    return updateRootViews();
                }
                if (view.templateContentBlock) {
                    overrideTemplateContentBlock = view.templateContentBlock;
                }
                if (view.templateElseBlock) {
                    overrideTemplateElseBlock = view.templateElseBlock;
                }
                // Since there is a parent range, Blaze will not automatically
                // detach the dom range.
                view._domrange.detach();
                view._domrange.destroy();
                let newView;
                try {
                    newView = Blaze.render(Template[view.template.viewName.slice('Template.'.length)], parentElement, next, parent);
                } catch (error) {
                    console.log('[Blaze HMR] Error re-rending template:');
                    console.error(error);
                    lastUpdateFailed = true;
                }
                let index = parent._domrange.members.findIndex((member)=>{
                    return member && member.view === view;
                });
                if (newView) {
                    parent._domrange.members.splice(index, 1, newView._domrange);
                } else {
                    parent._domrange.members.splice(index, 1);
                }
                if (nextComment) {
                    parentElement.removeChild(nextComment);
                }
            }
        });
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////////

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
    "/node_modules/meteor/blaze-hot/hot.js",
    "/node_modules/meteor/blaze-hot/update-templates.js"
  ]
}});
