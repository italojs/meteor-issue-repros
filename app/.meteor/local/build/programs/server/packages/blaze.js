Package["core-runtime"].queue("blaze",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var ECMAScript = Package.ecmascript.ECMAScript;
var HTML = Package.htmljs.HTML;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Blaze, UI, Handlebars;

var require = meteorInstall({"node_modules":{"meteor":{"blaze":{"preamble.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/preamble.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * @namespace Blaze
 * @summary The namespace for all Blaze-related methods and classes.
 */ Blaze = {};
// Utility to HTML-escape a string.  Included for legacy reasons.
// TODO: Should be replaced with _.escape once underscore is upgraded to a newer
//       version which escapes ` (backtick) as well. Underscore 1.5.2 does not.
Blaze._escape = function() {
    const escape_map = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
        "`": "&#x60;",
        /* IE allows backtick-delimited attributes?? */ "&": "&amp;"
    };
    const escape_one = function(c) {
        return escape_map[c];
    };
    return function(x) {
        return x.replace(/[&<>"'`]/g, escape_one);
    };
}();
Blaze._warn = function(msg) {
    msg = 'Warning: ' + msg;
    if (typeof console !== 'undefined' && console.warn) {
        console.warn(msg);
    }
};
const nativeBind = Function.prototype.bind;
// An implementation of _.bind which allows better optimization.
// See: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
if (nativeBind) {
    Blaze._bind = function(...args) {
        const [func, obj, ...rest] = args;
        if (args.length === 2) {
            return nativeBind.call(func, obj);
        }
        return nativeBind.apply(func, [
            obj,
            ...rest
        ]);
    };
} else {
    // A slower but backwards compatible version.
    Blaze._bind = function(objA, objB) {
        objA.bind(objB);
    };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"exceptions.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/exceptions.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let debugFunc;
// We call into user code in many places, and it's nice to catch exceptions
// propagated from user code immediately so that the whole system doesn't just
// break.  Catching exceptions is easy; reporting them is hard.  This helper
// reports exceptions.
//
// Usage:
//
// ```
// try {
//   // ... someStuff ...
// } catch (e) {
//   reportUIException(e);
// }
// ```
//
// An optional second argument overrides the default message.
// Set this to `true` to cause `reportException` to throw
// the next exception rather than reporting it.  This is
// useful in unit tests that test error messages.
Blaze._throwNextException = false;
Blaze._reportException = function(e, msg) {
    if (Blaze._throwNextException) {
        Blaze._throwNextException = false;
        throw e;
    }
    if (!debugFunc) // adapted from Tracker
    debugFunc = function() {
        return typeof Meteor !== "undefined" ? Meteor._debug : typeof console !== "undefined" && console.log ? console.log : function() {};
    };
    // In Chrome, `e.stack` is a multiline string that starts with the message
    // and contains a stack trace.  Furthermore, `console.log` makes it clickable.
    // `console.log` supplies the space between the two arguments.
    debugFunc()(msg || 'Exception caught in template:', e.stack || e.message || e);
};
// It's meant to be used in `Promise` chains to report the error while not
// "swallowing" it (i.e., the chain will still reject).
Blaze._reportExceptionAndThrow = function(error) {
    Blaze._reportException(error);
    throw error;
};
Blaze._wrapCatchingExceptions = function(f, where) {
    if (typeof f !== 'function') return f;
    return function(...args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            Blaze._reportException(e, 'Exception in ' + where + ':');
        }
    };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"view.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/view.js                                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let HTML;module.link('meteor/htmljs',{HTML(v){HTML=v}},0);/// [new] Blaze.View([name], renderMethod)
///
/// Blaze.View is the building block of reactive DOM.  Views have
/// the following features:
///
/// * lifecycle callbacks - Views are created, rendered, and destroyed,
///   and callbacks can be registered to fire when these things happen.
///
/// * parent pointer - A View points to its parentView, which is the
///   View that caused it to be rendered.  These pointers form a
///   hierarchy or tree of Views.
///
/// * render() method - A View's render() method specifies the DOM
///   (or HTML) content of the View.  If the method establishes
///   reactive dependencies, it may be re-run.
///
/// * a DOMRange - If a View is rendered to DOM, its position and
///   extent in the DOM are tracked using a DOMRange object.
///
/// When a View is constructed by calling Blaze.View, the View is
/// not yet considered "created."  It doesn't have a parentView yet,
/// and no logic has been run to initialize the View.  All real
/// work is deferred until at least creation time, when the onViewCreated
/// callbacks are fired, which happens when the View is "used" in
/// some way that requires it to be rendered.
///
/// ...more lifecycle stuff
///
/// `name` is an optional string tag identifying the View.  The only
/// time it's used is when looking in the View tree for a View of a
/// particular name; for example, data contexts are stored on Views
/// of name "with".  Names are also useful when debugging, so in
/// general it's good for functions that create Views to set the name.
/// Views associated with templates have names of the form "Template.foo".

/**
 * A binding is either `undefined` (pending), `{ error }` (rejected), or
 * `{ value }` (resolved). Synchronous values are immediately resolved (i.e.,
 * `{ value }` is used). The other states are reserved for asynchronous bindings
 * (i.e., values wrapped with `Promise`s).
 * @typedef {{ error: unknown } | { value: unknown } | undefined} Binding
 */ /**
 * @class
 * @summary Constructor for a View, which represents a reactive region of DOM.
 * @locus Client
 * @param {String} [name] Optional.  A name for this type of View.  See [`view.name`](#view_name).
 * @param {Function} renderFunction A function that returns [*renderable content*](#Renderable-Content).  In this function, `this` is bound to the View.
 */ Blaze.View = function(name, render) {
    if (!(this instanceof Blaze.View)) // called without `new`
    return new Blaze.View(name, render);
    if (typeof name === 'function') {
        // omitted "name" argument
        render = name;
        name = '';
    }
    this.name = name;
    this._render = render;
    this._callbacks = {
        created: null,
        rendered: null,
        destroyed: null
    };
    // Setting all properties here is good for readability,
    // and also may help Chrome optimize the code by keeping
    // the View object from changing shape too much.
    this.isCreated = false;
    this._isCreatedForExpansion = false;
    this.isRendered = false;
    this._isAttached = false;
    this.isDestroyed = false;
    this._isInRender = false;
    this.parentView = null;
    this._domrange = null;
    // This flag is normally set to false except for the cases when view's parent
    // was generated as part of expanding some syntactic sugar expressions or
    // methods.
    // Ex.: Blaze.renderWithData is an equivalent to creating a view with regular
    // Blaze.render and wrapping it into {{#with data}}{{/with}} view. Since the
    // users don't know anything about these generated parent views, Blaze needs
    // this information to be available on views to make smarter decisions. For
    // example: removing the generated parent view with the view on Blaze.remove.
    this._hasGeneratedParent = false;
    // Bindings accessible to children views (via view.lookup('name')) within the
    // closest template view.
    /** @type {Record<string, ReactiveVar<Binding>>} */ this._scopeBindings = {};
    this.renderCount = 0;
};
Blaze.View.prototype._render = function() {
    return null;
};
Blaze.View.prototype.onViewCreated = function(cb) {
    this._callbacks.created = this._callbacks.created || [];
    this._callbacks.created.push(cb);
};
Blaze.View.prototype._onViewRendered = function(cb) {
    this._callbacks.rendered = this._callbacks.rendered || [];
    this._callbacks.rendered.push(cb);
};
Blaze.View.prototype.onViewReady = function(cb) {
    const self = this;
    const fire = function() {
        Tracker.afterFlush(function() {
            if (!self.isDestroyed) {
                Blaze._withCurrentView(self, function() {
                    cb.call(self);
                });
            }
        });
    };
    self._onViewRendered(function onViewRendered() {
        if (self.isDestroyed) return;
        if (!self._domrange.attached) self._domrange.onAttached(fire);
        else fire();
    });
};
Blaze.View.prototype.onViewDestroyed = function(cb) {
    this._callbacks.destroyed = this._callbacks.destroyed || [];
    this._callbacks.destroyed.push(cb);
};
Blaze.View.prototype.removeViewDestroyedListener = function(cb) {
    const destroyed = this._callbacks.destroyed;
    if (!destroyed) return;
    const index = destroyed.lastIndexOf(cb);
    if (index !== -1) {
        // XXX You'd think the right thing to do would be splice, but _fireCallbacks
        // gets sad if you remove callbacks while iterating over the list.  Should
        // change this to use callback-hook or EventEmitter or something else that
        // properly supports removal.
        destroyed[index] = null;
    }
};
/// View#autorun(func)
///
/// Sets up a Tracker autorun that is "scoped" to this View in two
/// important ways: 1) Blaze.currentView is automatically set
/// on every re-run, and 2) the autorun is stopped when the
/// View is destroyed.  As with Tracker.autorun, the first run of
/// the function is immediate, and a Computation object that can
/// be used to stop the autorun is returned.
///
/// View#autorun is meant to be called from View callbacks like
/// onViewCreated, or from outside the rendering process.  It may not
/// be called before the onViewCreated callbacks are fired (too early),
/// or from a render() method (too confusing).
///
/// Typically, autoruns that update the state
/// of the View (as in Blaze.With) should be started from an onViewCreated
/// callback.  Autoruns that update the DOM should be started
/// from either onViewCreated (guarded against the absence of
/// view._domrange), or onViewReady.
Blaze.View.prototype.autorun = function(f, _inViewScope, displayName) {
    const self = this;
    // The restrictions on when View#autorun can be called are in order
    // to avoid bad patterns, like creating a Blaze.View and immediately
    // calling autorun on it.  A freshly created View is not ready to
    // have logic run on it; it doesn't have a parentView, for example.
    // It's when the View is materialized or expanded that the onViewCreated
    // handlers are fired and the View starts up.
    //
    // Letting the render() method call `this.autorun()` is problematic
    // because of re-render.  The best we can do is to stop the old
    // autorun and start a new one for each render, but that's a pattern
    // we try to avoid internally because it leads to helpers being
    // called extra times, in the case where the autorun causes the
    // view to re-render (and thus the autorun to be torn down and a
    // new one established).
    //
    // We could lift these restrictions in various ways.  One interesting
    // idea is to allow you to call `view.autorun` after instantiating
    // `view`, and automatically wrap it in `view.onViewCreated`, deferring
    // the autorun so that it starts at an appropriate time.  However,
    // then we can't return the Computation object to the caller, because
    // it doesn't exist yet.
    if (!self.isCreated) {
        throw new Error("View#autorun must be called from the created callback at the earliest");
    }
    if (this._isInRender) {
        throw new Error("Can't call View#autorun from inside render(); try calling it from the created or rendered callback");
    }
    const templateInstanceFunc = Blaze.Template._currentTemplateInstanceFunc;
    const func = function viewAutorun(c) {
        return Blaze._withCurrentView(_inViewScope || self, function() {
            return Blaze.Template._withTemplateInstanceFunc(templateInstanceFunc, function() {
                return f.call(self, c);
            });
        });
    };
    // Give the autorun function a better name for debugging and profiling.
    // The `displayName` property is not part of the spec but browsers like Chrome
    // and Firefox prefer it in debuggers over the name function was declared by.
    func.displayName = (self.name || 'anonymous') + ':' + (displayName || 'anonymous');
    const comp = Tracker.autorun(func);
    const stopComputation = function() {
        comp.stop();
    };
    self.onViewDestroyed(stopComputation);
    comp.onStop(function() {
        self.removeViewDestroyedListener(stopComputation);
    });
    return comp;
};
Blaze.View.prototype._errorIfShouldntCallSubscribe = function() {
    const self = this;
    if (!self.isCreated) {
        throw new Error("View#subscribe must be called from the created callback at the earliest");
    }
    if (self._isInRender) {
        throw new Error("Can't call View#subscribe from inside render(); try calling it from the created or rendered callback");
    }
    if (self.isDestroyed) {
        throw new Error("Can't call View#subscribe from inside the destroyed callback, try calling it inside created or rendered.");
    }
};
/**
 * Just like Blaze.View#autorun, but with Meteor.subscribe instead of
 * Tracker.autorun. Stop the subscription when the view is destroyed.
 * @return {SubscriptionHandle} A handle to the subscription so that you can
 * see if it is ready, or stop it manually
 */ Blaze.View.prototype.subscribe = function(args, options) {
    const self = this;
    options = options || {};
    self._errorIfShouldntCallSubscribe();
    let subHandle;
    if (options.connection) {
        subHandle = options.connection.subscribe.apply(options.connection, args);
    } else {
        subHandle = Meteor.subscribe.apply(Meteor, args);
    }
    self.onViewDestroyed(function() {
        subHandle.stop();
    });
    return subHandle;
};
Blaze.View.prototype.firstNode = function() {
    if (!this._isAttached) throw new Error("View must be attached before accessing its DOM");
    return this._domrange.firstNode();
};
Blaze.View.prototype.lastNode = function() {
    if (!this._isAttached) throw new Error("View must be attached before accessing its DOM");
    return this._domrange.lastNode();
};
Blaze._fireCallbacks = function(view, which) {
    Blaze._withCurrentView(view, function() {
        Tracker.nonreactive(function fireCallbacks() {
            const cbs = view._callbacks[which];
            for(let i = 0, N = cbs && cbs.length; i < N; i++)cbs[i] && cbs[i].call(view);
        });
    });
};
Blaze._createView = function(view, parentView, forExpansion) {
    if (view.isCreated) throw new Error("Can't render the same View twice");
    view.parentView = parentView || null;
    view.isCreated = true;
    if (forExpansion) view._isCreatedForExpansion = true;
    Blaze._fireCallbacks(view, 'created');
};
const doFirstRender = function(view, initialContent) {
    const domrange = new Blaze._DOMRange(initialContent);
    view._domrange = domrange;
    domrange.view = view;
    view.isRendered = true;
    Blaze._fireCallbacks(view, 'rendered');
    let teardownHook = null;
    domrange.onAttached(function attached(range, element) {
        view._isAttached = true;
        teardownHook = Blaze._DOMBackend.Teardown.onElementTeardown(element, function teardown() {
            Blaze._destroyView(view, true);
        });
    });
    // tear down the teardown hook
    view.onViewDestroyed(function() {
        if (teardownHook) teardownHook.stop();
        teardownHook = null;
    });
    return domrange;
};
// Take an uncreated View `view` and create and render it to DOM,
// setting up the autorun that updates the View.  Returns a new
// DOMRange, which has been associated with the View.
//
// The private arguments `_workStack` and `_intoArray` are passed in
// by Blaze._materializeDOM and are only present for recursive calls
// (when there is some other _materializeView on the stack).  If
// provided, then we avoid the mutual recursion of calling back into
// Blaze._materializeDOM so that deep View hierarchies don't blow the
// stack.  Instead, we push tasks onto workStack for the initial
// rendering and subsequent setup of the View, and they are done after
// we return.  When there is a _workStack, we do not return the new
// DOMRange, but instead push it into _intoArray from a _workStack
// task.
Blaze._materializeView = function(view, parentView, _workStack, _intoArray) {
    Blaze._createView(view, parentView);
    let domrange;
    let lastHtmljs;
    // We don't expect to be called in a Computation, but just in case,
    // wrap in Tracker.nonreactive.
    Tracker.nonreactive(function() {
        view.autorun(function doRender(c) {
            // `view.autorun` sets the current view.
            view.renderCount = view.renderCount + 1;
            view._isInRender = true;
            // Any dependencies that should invalidate this Computation come
            // from this line:
            const htmljs = view._render();
            view._isInRender = false;
            if (!c.firstRun && !Blaze._isContentEqual(lastHtmljs, htmljs)) {
                Tracker.nonreactive(function doMaterialize() {
                    // re-render
                    const rangesAndNodes = Blaze._materializeDOM(htmljs, [], view);
                    domrange.setMembers(rangesAndNodes);
                    Blaze._fireCallbacks(view, 'rendered');
                });
            }
            lastHtmljs = htmljs;
            // Causes any nested views to stop immediately, not when we call
            // `setMembers` the next time around the autorun.  Otherwise,
            // helpers in the DOM tree to be replaced might be scheduled
            // to re-run before we have a chance to stop them.
            Tracker.onInvalidate(function() {
                if (domrange) {
                    domrange.destroyMembers();
                }
            });
        }, undefined, 'materialize');
        // first render.  lastHtmljs is the first htmljs.
        let initialContents;
        if (!_workStack) {
            initialContents = Blaze._materializeDOM(lastHtmljs, [], view);
            domrange = doFirstRender(view, initialContents);
            initialContents = null; // help GC because we close over this scope a lot
        } else {
            // We're being called from Blaze._materializeDOM, so to avoid
            // recursion and save stack space, provide a description of the
            // work to be done instead of doing it.  Tasks pushed onto
            // _workStack will be done in LIFO order after we return.
            // The work will still be done within a Tracker.nonreactive,
            // because it will be done by some call to Blaze._materializeDOM
            // (which is always called in a Tracker.nonreactive).
            initialContents = [];
            // push this function first so that it happens last
            _workStack.push(function() {
                domrange = doFirstRender(view, initialContents);
                initialContents = null; // help GC because of all the closures here
                _intoArray.push(domrange);
            });
            // now push the task that calculates initialContents
            _workStack.push(Blaze._bind(Blaze._materializeDOM, null, lastHtmljs, initialContents, view, _workStack));
        }
    });
    if (!_workStack) {
        return domrange;
    } else {
        return null;
    }
};
// Expands a View to HTMLjs, calling `render` recursively on all
// Views and evaluating any dynamic attributes.  Calls the `created`
// callback, but not the `materialized` or `rendered` callbacks.
// Destroys the view immediately, unless called in a Tracker Computation,
// in which case the view will be destroyed when the Computation is
// invalidated.  If called in a Tracker Computation, the result is a
// reactive string; that is, the Computation will be invalidated
// if any changes are made to the view or subviews that might affect
// the HTML.
Blaze._expandView = function(view, parentView) {
    Blaze._createView(view, parentView, true);
    view._isInRender = true;
    const htmljs = Blaze._withCurrentView(view, function() {
        return view._render();
    });
    view._isInRender = false;
    const result = Blaze._expand(htmljs, view);
    if (Tracker.active) {
        Tracker.onInvalidate(function() {
            Blaze._destroyView(view);
        });
    } else {
        Blaze._destroyView(view);
    }
    return result;
};
// Options: `parentView`
Blaze._HTMLJSExpander = HTML.TransformingVisitor.extend();
Blaze._HTMLJSExpander.def({
    visitObject: function(x) {
        if (x instanceof Blaze.Template) x = x.constructView();
        if (x instanceof Blaze.View) return Blaze._expandView(x, this.parentView);
        // this will throw an error; other objects are not allowed!
        return HTML.TransformingVisitor.prototype.visitObject.call(this, x);
    },
    visitAttributes: function(attrs) {
        // expand dynamic attributes
        if (typeof attrs === 'function') attrs = Blaze._withCurrentView(this.parentView, attrs);
        // call super (e.g. for case where `attrs` is an array)
        return HTML.TransformingVisitor.prototype.visitAttributes.call(this, attrs);
    },
    visitAttribute: function(name, value, tag) {
        // expand attribute values that are functions.  Any attribute value
        // that contains Views must be wrapped in a function.
        if (typeof value === 'function') value = Blaze._withCurrentView(this.parentView, value);
        return HTML.TransformingVisitor.prototype.visitAttribute.call(this, name, value, tag);
    }
});
// Return Blaze.currentView, but only if it is being rendered
// (i.e. we are in its render() method).
const currentViewIfRendering = function() {
    const view = Blaze.currentView;
    return view && view._isInRender ? view : null;
};
Blaze._expand = function(htmljs, parentView) {
    parentView = parentView || currentViewIfRendering();
    return new Blaze._HTMLJSExpander({
        parentView: parentView
    }).visit(htmljs);
};
Blaze._expandAttributes = function(attrs, parentView) {
    parentView = parentView || currentViewIfRendering();
    const expanded = new Blaze._HTMLJSExpander({
        parentView: parentView
    }).visitAttributes(attrs);
    return expanded || {};
};
Blaze._destroyView = function(view, _skipNodes) {
    if (view.isDestroyed) return;
    view.isDestroyed = true;
    // Destroy views and elements recursively.  If _skipNodes,
    // only recurse up to views, not elements, for the case where
    // the backend (jQuery) is recursing over the elements already.
    if (view._domrange) view._domrange.destroyMembers(_skipNodes);
    // XXX: fire callbacks after potential members are destroyed
    // otherwise it's tracker.flush will cause the above line will
    // not be called and their views won't be destroyed
    // Involved issues: DOMRange "Must be attached" error, mem leak
    Blaze._fireCallbacks(view, 'destroyed');
};
Blaze._destroyNode = function(node) {
    if (node.nodeType === 1) Blaze._DOMBackend.Teardown.tearDownElement(node);
};
// Are the HTMLjs entities `a` and `b` the same?  We could be
// more elaborate here but the point is to catch the most basic
// cases.
Blaze._isContentEqual = function(a, b) {
    if (a instanceof HTML.Raw) {
        return b instanceof HTML.Raw && a.value === b.value;
    } else if (a == null) {
        return b == null;
    } else {
        return a === b && (typeof a === 'number' || typeof a === 'boolean' || typeof a === 'string');
    }
};
/**
 * @summary The View corresponding to the current template helper, event handler, callback, or autorun.  If there isn't one, `null`.
 * @locus Client
 * @type {Blaze.View}
 */ Blaze.currentView = null;
/**
 * @template T
 * @param {Blaze.View} view
 * @param {function(): T} func
 * @returns {T}
 */ Blaze._withCurrentView = function(view, func) {
    const oldView = Blaze.currentView;
    try {
        Blaze.currentView = view;
        return func();
    } finally{
        Blaze.currentView = oldView;
    }
};
// Blaze.render publicly takes a View or a Template.
// Privately, it takes any HTMLJS (extended with Views and Templates)
// except null or undefined, or a function that returns any extended
// HTMLJS.
const checkRenderContent = function(content) {
    if (content === null) throw new Error("Can't render null");
    if (typeof content === 'undefined') throw new Error("Can't render undefined");
    if (content instanceof Blaze.View || content instanceof Blaze.Template || typeof content === 'function') return;
    try {
        // Throw if content doesn't look like HTMLJS at the top level
        // (i.e. verify that this is an HTML.Tag, or an array,
        // or a primitive, etc.)
        (new HTML.Visitor).visit(content);
    } catch (e) {
        // Make error message suitable for public API
        throw new Error("Expected Template or View");
    }
};
// For Blaze.render and Blaze.toHTML, take content and
// wrap it in a View, unless it's a single View or
// Template already.
const contentAsView = function(content) {
    checkRenderContent(content);
    if (content instanceof Blaze.Template) {
        return content.constructView();
    } else if (content instanceof Blaze.View) {
        return content;
    } else {
        let func = content;
        if (typeof func !== 'function') {
            func = function() {
                return content;
            };
        }
        return Blaze.View('render', func);
    }
};
// For Blaze.renderWithData and Blaze.toHTMLWithData, wrap content
// in a function, if necessary, so it can be a content arg to
// a Blaze.With.
const contentAsFunc = function(content) {
    checkRenderContent(content);
    if (typeof content !== 'function') {
        return function() {
            return content;
        };
    } else {
        return content;
    }
};
Blaze.__rootViews = [];
/**
 * @summary Renders a template or View to DOM nodes and inserts it into the DOM, returning a rendered [View](#Blaze-View) which can be passed to [`Blaze.remove`](#Blaze-remove).
 * @locus Client
 * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object to render.  If a template, a View object is [constructed](#template_constructview).  If a View, it must be an unrendered View, which becomes a rendered View and is returned.
 * @param {DOMNode} parentNode The node that will be the parent of the rendered template.  It must be an Element node.
 * @param {DOMNode} [nextNode] Optional. If provided, must be a child of <em>parentNode</em>; the template will be inserted before this node. If not provided, the template will be inserted as the last child of parentNode.
 * @param {Blaze.View} [parentView] Optional. If provided, it will be set as the rendered View's [`parentView`](#view_parentview).
 */ Blaze.render = function(content, parentElement, nextNode, parentView) {
    if (!parentElement) {
        Blaze._warn("Blaze.render without a parent element is deprecated. " + "You must specify where to insert the rendered content.");
    }
    if (nextNode instanceof Blaze.View) {
        // handle omitted nextNode
        parentView = nextNode;
        nextNode = null;
    }
    // parentElement must be a DOM node. in particular, can't be the
    // result of a call to `$`. Can't check if `parentElement instanceof
    // Node` since 'Node' is undefined in IE8.
    if (parentElement && typeof parentElement.nodeType !== 'number') throw new Error("'parentElement' must be a DOM node");
    if (nextNode && typeof nextNode.nodeType !== 'number') throw new Error("'nextNode' must be a DOM node");
    parentView = parentView || currentViewIfRendering();
    const view = contentAsView(content);
    // TODO: this is only needed in development
    if (!parentView) {
        view.onViewCreated(function() {
            Blaze.__rootViews.push(view);
        });
        view.onViewDestroyed(function() {
            let index = Blaze.__rootViews.indexOf(view);
            if (index > -1) {
                Blaze.__rootViews.splice(index, 1);
            }
        });
    }
    Blaze._materializeView(view, parentView);
    if (parentElement) {
        view._domrange.attach(parentElement, nextNode);
    }
    return view;
};
Blaze.insert = function(view, parentElement, nextNode) {
    Blaze._warn("Blaze.insert has been deprecated.  Specify where to insert the " + "rendered content in the call to Blaze.render.");
    if (!(view && view._domrange instanceof Blaze._DOMRange)) throw new Error("Expected template rendered with Blaze.render");
    view._domrange.attach(parentElement, nextNode);
};
/**
 * @summary Renders a template or View to DOM nodes with a data context.  Otherwise identical to `Blaze.render`.
 * @locus Client
 * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object to render.
 * @param {Object|Function} data The data context to use, or a function returning a data context.  If a function is provided, it will be reactively re-run.
 * @param {DOMNode} parentNode The node that will be the parent of the rendered template.  It must be an Element node.
 * @param {DOMNode} [nextNode] Optional. If provided, must be a child of <em>parentNode</em>; the template will be inserted before this node. If not provided, the template will be inserted as the last child of parentNode.
 * @param {Blaze.View} [parentView] Optional. If provided, it will be set as the rendered View's [`parentView`](#view_parentview).
 */ Blaze.renderWithData = function(content, data, parentElement, nextNode, parentView) {
    // We defer the handling of optional arguments to Blaze.render.  At this point,
    // `nextNode` may actually be `parentView`.
    return Blaze.render(Blaze._TemplateWith(data, contentAsFunc(content)), parentElement, nextNode, parentView);
};
/**
 * @summary Removes a rendered View from the DOM, stopping all reactive updates and event listeners on it. Also destroys the Blaze.Template instance associated with the view.
 * @locus Client
 * @param {Blaze.View} renderedView The return value from `Blaze.render` or `Blaze.renderWithData`, or the `view` property of a Blaze.Template instance. Calling `Blaze.remove(Template.instance().view)` from within a template event handler will destroy the view as well as that template and trigger the template's `onDestroyed` handlers.
 */ Blaze.remove = function(view) {
    if (!(view && view._domrange instanceof Blaze._DOMRange)) throw new Error("Expected template rendered with Blaze.render");
    while(view){
        if (!view.isDestroyed) {
            const range = view._domrange;
            range.destroy();
            if (range.attached && !range.parentRange) {
                range.detach();
            }
        }
        view = view._hasGeneratedParent && view.parentView;
    }
};
/**
 * @summary Renders a template or View to a string of HTML.
 * @locus Client
 * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object from which to generate HTML.
 */ Blaze.toHTML = function(content, parentView) {
    parentView = parentView || currentViewIfRendering();
    return HTML.toHTML(Blaze._expandView(contentAsView(content), parentView));
};
/**
 * @summary Renders a template or View to HTML with a data context.  Otherwise identical to `Blaze.toHTML`.
 * @locus Client
 * @param {Template|Blaze.View} templateOrView The template (e.g. `Template.myTemplate`) or View object from which to generate HTML.
 * @param {Object|Function} data The data context to use, or a function returning a data context.
 */ Blaze.toHTMLWithData = function(content, data, parentView) {
    parentView = parentView || currentViewIfRendering();
    return HTML.toHTML(Blaze._expandView(Blaze._TemplateWith(data, contentAsFunc(content)), parentView));
};
Blaze._toText = function(htmljs, parentView, textMode) {
    if (typeof htmljs === 'function') throw new Error("Blaze._toText doesn't take a function, just HTMLjs");
    if (parentView != null && !(parentView instanceof Blaze.View)) {
        // omitted parentView argument
        textMode = parentView;
        parentView = null;
    }
    parentView = parentView || currentViewIfRendering();
    if (!textMode) throw new Error("textMode required");
    if (!(textMode === HTML.TEXTMODE.STRING || textMode === HTML.TEXTMODE.RCDATA || textMode === HTML.TEXTMODE.ATTRIBUTE)) throw new Error("Unknown textMode: " + textMode);
    return HTML.toText(Blaze._expand(htmljs, parentView), textMode);
};
/**
 * @summary Returns the current data context, or the data context that was used when rendering a particular DOM element or View from a Meteor template.
 * @locus Client
 * @param {DOMElement|Blaze.View} [elementOrView] Optional.  An element that was rendered by a Meteor, or a View.
 */ Blaze.getData = function(elementOrView) {
    var _theWith_dataVar_get;
    let theWith;
    if (!elementOrView) {
        theWith = Blaze.getView('with');
    } else if (elementOrView instanceof Blaze.View) {
        const view = elementOrView;
        theWith = view.name === 'with' ? view : Blaze.getView(view, 'with');
    } else if (typeof elementOrView.nodeType === 'number') {
        if (elementOrView.nodeType !== 1) throw new Error("Expected DOM element");
        theWith = Blaze.getView(elementOrView, 'with');
    } else {
        throw new Error("Expected DOM element or View");
    }
    return theWith ? (_theWith_dataVar_get = theWith.dataVar.get()) === null || _theWith_dataVar_get === void 0 ? void 0 : _theWith_dataVar_get.value : null;
};
// For back-compat
Blaze.getElementData = function(element) {
    Blaze._warn("Blaze.getElementData has been deprecated.  Use " + "Blaze.getData(element) instead.");
    if (element.nodeType !== 1) throw new Error("Expected DOM element");
    return Blaze.getData(element);
};
// Both arguments are optional.
/**
 * @summary Gets either the current View, or the View enclosing the given DOM element.
 * @locus Client
 * @param {DOMElement} [element] Optional.  If specified, the View enclosing `element` is returned.
 */ Blaze.getView = function(elementOrView, _viewName) {
    let viewName = _viewName;
    if (typeof elementOrView === 'string') {
        // omitted elementOrView; viewName present
        viewName = elementOrView;
        elementOrView = null;
    }
    // We could eventually shorten the code by folding the logic
    // from the other methods into this method.
    if (!elementOrView) {
        return Blaze._getCurrentView(viewName);
    } else if (elementOrView instanceof Blaze.View) {
        return Blaze._getParentView(elementOrView, viewName);
    } else if (typeof elementOrView.nodeType === 'number') {
        return Blaze._getElementView(elementOrView, viewName);
    } else {
        throw new Error("Expected DOM element or View");
    }
};
// Gets the current view or its nearest ancestor of name
// `name`.
Blaze._getCurrentView = function(name) {
    let view = Blaze.currentView;
    // Better to fail in cases where it doesn't make sense
    // to use Blaze._getCurrentView().  There will be a current
    // view anywhere it does.  You can check Blaze.currentView
    // if you want to know whether there is one or not.
    if (!view) throw new Error("There is no current view");
    if (name) {
        while(view && view.name !== name)view = view.parentView;
        return view || null;
    } else {
        // Blaze._getCurrentView() with no arguments just returns
        // Blaze.currentView.
        return view;
    }
};
Blaze._getParentView = function(view, name) {
    let v = view.parentView;
    if (name) {
        while(v && v.name !== name)v = v.parentView;
    }
    return v || null;
};
Blaze._getElementView = function(elem, name) {
    let range = Blaze._DOMRange.forElement(elem);
    let view = null;
    while(range && !view){
        view = range.view || null;
        if (!view) {
            if (range.parentRange) range = range.parentRange;
            else range = Blaze._DOMRange.forElement(range.parentElement);
        }
    }
    if (name) {
        while(view && view.name !== name)view = view.parentView;
        return view || null;
    } else {
        return view;
    }
};
Blaze._addEventMap = function(view, eventMap, thisInHandler) {
    thisInHandler = thisInHandler || null;
    const handles = [];
    if (!view._domrange) throw new Error("View must have a DOMRange");
    view._domrange.onAttached(function attached_eventMaps(range, element) {
        Object.keys(eventMap).forEach(function(spec) {
            let handler = eventMap[spec];
            const clauses = spec.split(/,\s+/);
            // iterate over clauses of spec, e.g. ['click .foo', 'click .bar']
            clauses.forEach(function(clause) {
                const parts = clause.split(/\s+/);
                if (parts.length === 0) return;
                const newEvents = parts.shift();
                const selector = parts.join(' ');
                handles.push(Blaze._EventSupport.listen(element, newEvents, selector, function(...args) {
                    const [evt] = args;
                    if (!range.containsElement(evt.currentTarget, selector, newEvents)) return null;
                    const handlerThis = thisInHandler || this;
                    const handlerArgs = args;
                    return Blaze._withCurrentView(view, function() {
                        return handler.apply(handlerThis, handlerArgs);
                    });
                }, range, function(r) {
                    return r.parentRange;
                }));
            });
        });
    });
    view.onViewDestroyed(function() {
        handles.forEach(function(h) {
            h.stop();
        });
        handles.length = 0;
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"builtins.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/builtins.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let has;module.link('lodash.has',{default(v){has=v}},0);let isObject;module.link('lodash.isobject',{default(v){isObject=v}},1);

Blaze._calculateCondition = function(cond) {
    if (HTML.isArray(cond) && cond.length === 0) return false;
    return !!cond;
};
/**
 * @summary Constructs a View that renders content with a data context.
 * @locus Client
 * @param {Object|Function} data An object to use as the data context, or a function returning such an object.  If a
 *   function is provided, it will be reactively re-run.
 * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
 */ Blaze.With = function(data, contentFunc) {
    const view = Blaze.View('with', contentFunc);
    view.dataVar = null;
    view.onViewCreated(()=>{
        view.dataVar = _createBinding(view, data, 'setData');
    });
    return view;
};
/**
 * @summary Shallow compare of two bindings.
 * @param {Binding} x
 * @param {Binding} y
 */ function _isEqualBinding(x, y) {
    if (typeof x === 'object' && typeof y === 'object') {
        return x.error === y.error && ReactiveVar._isEqual(x.value, y.value);
    } else {
        return ReactiveVar._isEqual(x, y);
    }
}
/**
 * @template T
 * @param {T} x
 * @returns {T}
 */ function _identity(x) {
    return x;
}
/**
 * Attaches a single binding to the instantiated view.
 * @template T, U
 * @param {ReactiveVar<U>} reactiveVar Target view.
 * @param {Promise<T> | T} value Bound value.
 * @param {function(T): U} [mapper] Maps the computed value before store.
 */ function _setBindingValue(reactiveVar, value, mapper = _identity) {
    if (value && typeof value.then === 'function') {
        value.then((value)=>reactiveVar.set({
                value: mapper(value)
            }), (error)=>reactiveVar.set({
                error
            }));
    } else {
        reactiveVar.set({
            value: mapper(value)
        });
    }
}
/**
 * @template T, U
 * @param {Blaze.View} view Target view.
 * @param {Promise<T> | T | function(): (Promise<T> | T)} binding Binding value or its getter.
 * @param {string} [displayName] Autorun's display name.
 * @param {function(T): U} [mapper] Maps the computed value before store.
 * @returns {ReactiveVar<U>}
 */ function _createBinding(view, binding, displayName, mapper) {
    const reactiveVar = new ReactiveVar(undefined, _isEqualBinding);
    if (typeof binding === 'function') {
        view.autorun(()=>_setBindingValue(reactiveVar, binding(), mapper), view.parentView, displayName);
    } else {
        _setBindingValue(reactiveVar, binding, mapper);
    }
    return reactiveVar;
}
/**
 * Attaches bindings to the instantiated view.
 * @param {Object} bindings A dictionary of bindings, each binding name
 * corresponds to a value or a function that will be reactively re-run.
 * @param {Blaze.View} view The target.
 */ Blaze._attachBindingsToView = function(bindings, view) {
    view.onViewCreated(function() {
        Object.entries(bindings).forEach(function([name, binding]) {
            view._scopeBindings[name] = _createBinding(view, binding);
        });
    });
};
/**
 * @summary Constructs a View setting the local lexical scope in the block.
 * @param {Function} bindings Dictionary mapping names of bindings to
 * values or computations to reactively re-run.
 * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
 */ Blaze.Let = function(bindings, contentFunc) {
    var view = Blaze.View('let', contentFunc);
    Blaze._attachBindingsToView(bindings, view);
    return view;
};
/**
 * @summary Constructs a View that renders content conditionally.
 * @locus Client
 * @param {Function} conditionFunc A function to reactively re-run.  Whether the result is truthy or falsy determines
 *   whether `contentFunc` or `elseFunc` is shown.  An empty array is considered falsy.
 * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
 * @param {Function} [elseFunc] Optional.  A Function that returns [*renderable content*](#Renderable-Content).  If no
 *   `elseFunc` is supplied, no content is shown in the "else" case.
 */ Blaze.If = function(conditionFunc, contentFunc, elseFunc, _not) {
    const view = Blaze.View(_not ? 'unless' : 'if', function() {
        // Render only if the binding has a value, i.e., it's either synchronous or
        // has resolved. Rejected `Promise`s are NOT rendered.
        const condition = view.__conditionVar.get();
        if (condition && 'value' in condition) {
            return condition.value ? contentFunc() : elseFunc ? elseFunc() : null;
        }
        return null;
    });
    view.__conditionVar = null;
    view.onViewCreated(()=>{
        view.__conditionVar = _createBinding(view, conditionFunc, 'condition', // Store only the actual condition.
        (value)=>!Blaze._calculateCondition(value) !== !_not);
    });
    return view;
};
/**
 * @summary An inverted [`Blaze.If`](#Blaze-If).
 * @locus Client
 * @param {Function} conditionFunc A function to reactively re-run.  If the result is falsy, `contentFunc` is shown,
 *   otherwise `elseFunc` is shown.  An empty array is considered falsy.
 * @param {Function} contentFunc A Function that returns [*renderable content*](#Renderable-Content).
 * @param {Function} [elseFunc] Optional.  A Function that returns [*renderable content*](#Renderable-Content).  If no
 *   `elseFunc` is supplied, no content is shown in the "else" case.
 */ Blaze.Unless = function(conditionFunc, contentFunc, elseFunc) {
    return Blaze.If(conditionFunc, contentFunc, elseFunc, true);
};
/**
 * @summary Constructs a View that renders `contentFunc` for each item in a sequence.
 * @locus Client
 * @param {Function} argFunc A function to reactively re-run. The function can
 * return one of two options:
 *
 * 1. An object with two fields: '_variable' and '_sequence'. Each iterates over
 *   '_sequence', it may be a Cursor, an array, null, or undefined. Inside the
 *   Each body you will be able to get the current item from the sequence using
 *   the name specified in the '_variable' field.
 *
 * 2. Just a sequence (Cursor, array, null, or undefined) not wrapped into an
 *   object. Inside the Each body, the current item will be set as the data
 *   context.
 * @param {Function} contentFunc A Function that returns  [*renderable
 * content*](#Renderable-Content).
 * @param {Function} [elseFunc] A Function that returns [*renderable
 * content*](#Renderable-Content) to display in the case when there are no items
 * in the sequence.
 */ Blaze.Each = function(argFunc, contentFunc, elseFunc) {
    const eachView = Blaze.View('each', function() {
        const subviews = this.initialSubviews;
        this.initialSubviews = null;
        if (this._isCreatedForExpansion) {
            this.expandedValueDep = new Tracker.Dependency;
            this.expandedValueDep.depend();
        }
        return subviews;
    });
    eachView.initialSubviews = [];
    eachView.numItems = 0;
    eachView.inElseMode = false;
    eachView.stopHandle = null;
    eachView.contentFunc = contentFunc;
    eachView.elseFunc = elseFunc;
    eachView.argVar = undefined;
    eachView.variableName = null;
    // update the @index value in the scope of all subviews in the range
    const updateIndices = function(from, to) {
        if (to === undefined) {
            to = eachView.numItems - 1;
        }
        for(let i = from; i <= to; i++){
            const view = eachView._domrange.members[i].view;
            view._scopeBindings['@index'].set({
                value: i
            });
        }
    };
    eachView.onViewCreated(function() {
        // We evaluate `argFunc` in `Tracker.autorun` to ensure `Blaze.currentView`
        // is always set when it runs.
        eachView.argVar = _createBinding(eachView, // Unwrap a sequence reactively (`{{#each x in xs}}`).
        ()=>{
            let maybeSequence = argFunc();
            if (isObject(maybeSequence) && has(maybeSequence, '_sequence')) {
                eachView.variableName = maybeSequence._variable || null;
                maybeSequence = maybeSequence._sequence;
            }
            return maybeSequence;
        }, 'collection');
        eachView.stopHandle = ObserveSequence.observe(function() {
            var _eachView_argVar_get;
            return (_eachView_argVar_get = eachView.argVar.get()) === null || _eachView_argVar_get === void 0 ? void 0 : _eachView_argVar_get.value;
        }, {
            addedAt: function(id, item, index) {
                Tracker.nonreactive(function() {
                    let newItemView;
                    if (eachView.variableName) {
                        // new-style #each (as in {{#each item in items}})
                        // doesn't create a new data context
                        newItemView = Blaze.View('item', eachView.contentFunc);
                    } else {
                        newItemView = Blaze.With(item, eachView.contentFunc);
                    }
                    eachView.numItems++;
                    const bindings = {};
                    bindings['@index'] = index;
                    if (eachView.variableName) {
                        bindings[eachView.variableName] = item;
                    }
                    Blaze._attachBindingsToView(bindings, newItemView);
                    if (eachView.expandedValueDep) {
                        eachView.expandedValueDep.changed();
                    } else if (eachView._domrange) {
                        if (eachView.inElseMode) {
                            eachView._domrange.removeMember(0);
                            eachView.inElseMode = false;
                        }
                        const range = Blaze._materializeView(newItemView, eachView);
                        eachView._domrange.addMember(range, index);
                        updateIndices(index);
                    } else {
                        eachView.initialSubviews.splice(index, 0, newItemView);
                    }
                });
            },
            removedAt: function(id, item, index) {
                Tracker.nonreactive(function() {
                    eachView.numItems--;
                    if (eachView.expandedValueDep) {
                        eachView.expandedValueDep.changed();
                    } else if (eachView._domrange) {
                        eachView._domrange.removeMember(index);
                        updateIndices(index);
                        if (eachView.elseFunc && eachView.numItems === 0) {
                            eachView.inElseMode = true;
                            eachView._domrange.addMember(Blaze._materializeView(Blaze.View('each_else', eachView.elseFunc), eachView), 0);
                        }
                    } else {
                        eachView.initialSubviews.splice(index, 1);
                    }
                });
            },
            changedAt: function(id, newItem, oldItem, index) {
                Tracker.nonreactive(function() {
                    if (eachView.expandedValueDep) {
                        eachView.expandedValueDep.changed();
                    } else {
                        let itemView;
                        if (eachView._domrange) {
                            itemView = eachView._domrange.getMember(index).view;
                        } else {
                            itemView = eachView.initialSubviews[index];
                        }
                        if (eachView.variableName) {
                            itemView._scopeBindings[eachView.variableName].set({
                                value: newItem
                            });
                        } else {
                            itemView.dataVar.set({
                                value: newItem
                            });
                        }
                    }
                });
            },
            movedTo: function(id, item, fromIndex, toIndex) {
                Tracker.nonreactive(function() {
                    if (eachView.expandedValueDep) {
                        eachView.expandedValueDep.changed();
                    } else if (eachView._domrange) {
                        eachView._domrange.moveMember(fromIndex, toIndex);
                        updateIndices(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex));
                    } else {
                        const subviews = eachView.initialSubviews;
                        const itemView = subviews[fromIndex];
                        subviews.splice(fromIndex, 1);
                        subviews.splice(toIndex, 0, itemView);
                    }
                });
            }
        });
        if (eachView.elseFunc && eachView.numItems === 0) {
            eachView.inElseMode = true;
            eachView.initialSubviews[0] = Blaze.View('each_else', eachView.elseFunc);
        }
    });
    eachView.onViewDestroyed(function() {
        if (eachView.stopHandle) eachView.stopHandle.stop();
    });
    return eachView;
};
/**
 * Create a new `Blaze.Let` view that unwraps the given value.
 * @param {unknown} value
 * @returns {Blaze.View}
 */ Blaze._Await = function(value) {
    return Blaze.Let({
        value
    }, Blaze._AwaitContent);
};
Blaze._AwaitContent = function() {
    var _Blaze_currentView__scopeBindings_value_get;
    return (_Blaze_currentView__scopeBindings_value_get = Blaze.currentView._scopeBindings.value.get()) === null || _Blaze_currentView__scopeBindings_value_get === void 0 ? void 0 : _Blaze_currentView__scopeBindings_value_get.value;
};
Blaze._TemplateWith = function(arg, contentFunc) {
    let w;
    let argFunc = arg;
    if (typeof arg !== 'function') {
        argFunc = function() {
            return arg;
        };
    }
    // This is a little messy.  When we compile `{{> Template.contentBlock}}`, we
    // wrap it in Blaze._InOuterTemplateScope in order to skip the intermediate
    // parent Views in the current template.  However, when there's an argument
    // (`{{> Template.contentBlock arg}}`), the argument needs to be evaluated
    // in the original scope.  There's no good order to nest
    // Blaze._InOuterTemplateScope and Blaze._TemplateWith to achieve this,
    // so we wrap argFunc to run it in the "original parentView" of the
    // Blaze._InOuterTemplateScope.
    //
    // To make this better, reconsider _InOuterTemplateScope as a primitive.
    // Longer term, evaluate expressions in the proper lexical scope.
    const wrappedArgFunc = function() {
        let viewToEvaluateArg = null;
        if (w.parentView && w.parentView.name === 'InOuterTemplateScope') {
            viewToEvaluateArg = w.parentView.originalParentView;
        }
        if (viewToEvaluateArg) {
            return Blaze._withCurrentView(viewToEvaluateArg, argFunc);
        } else {
            return argFunc();
        }
    };
    const wrappedContentFunc = function() {
        let content = contentFunc.call(this);
        // Since we are generating the Blaze._TemplateWith view for the
        // user, set the flag on the child view.  If `content` is a template,
        // construct the View so that we can set the flag.
        if (content instanceof Blaze.Template) {
            content = content.constructView();
        }
        if (content instanceof Blaze.View) {
            content._hasGeneratedParent = true;
        }
        return content;
    };
    w = Blaze.With(wrappedArgFunc, wrappedContentFunc);
    w.__isTemplateWith = true;
    return w;
};
Blaze._InOuterTemplateScope = function(templateView, contentFunc) {
    const view = Blaze.View('InOuterTemplateScope', contentFunc);
    let parentView = templateView.parentView;
    // Hack so that if you call `{{> foo bar}}` and it expands into
    // `{{#with bar}}{{> foo}}{{/with}}`, and then `foo` is a template
    // that inserts `{{> Template.contentBlock}}`, the data context for
    // `Template.contentBlock` is not `bar` but the one enclosing that.
    if (parentView.__isTemplateWith) parentView = parentView.parentView;
    view.onViewCreated(function() {
        this.originalParentView = this.parentView;
        this.parentView = parentView;
        this.__childDoesntStartNewLexicalScope = true;
    });
    return view;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lookup.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/lookup.js                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let has;module.link('lodash.has',{default(v){has=v}},0);
/** @param {function(Binding): boolean} fn */ function _createBindingsHelper(fn) {
    /** @param {string[]} names */ return (...names)=>{
        const view = Blaze.currentView;
        // There's either zero arguments (i.e., check all bindings) or an additional
        // "hash" argument that we have to ignore.
        names = names.length === 0 ? Object.keys(view._scopeBindings) : names.slice(0, -1);
        return names.some((name)=>{
            const binding = _lexicalBindingLookup(view, name);
            if (!binding) {
                throw new Error(`Binding for "${name}" was not found.`);
            }
            return fn(binding.get());
        });
    };
}
Blaze._globalHelpers = {
    /** @summary Check whether any of the given bindings (or all if none given) is still pending. */ '@pending': _createBindingsHelper((binding)=>binding === undefined),
    /** @summary Check whether any of the given bindings (or all if none given) has rejected. */ '@rejected': _createBindingsHelper((binding)=>!!binding && 'error' in binding),
    /** @summary Check whether any of the given bindings (or all if none given) has resolved. */ '@resolved': _createBindingsHelper((binding)=>!!binding && 'value' in binding)
};
// Documented as Template.registerHelper.
// This definition also provides back-compat for `UI.registerHelper`.
Blaze.registerHelper = function(name, func) {
    Blaze._globalHelpers[name] = func;
};
// Also documented as Template.deregisterHelper
Blaze.deregisterHelper = function(name) {
    delete Blaze._globalHelpers[name];
};
const bindIfIsFunction = function(x, target) {
    if (typeof x !== 'function') return x;
    return Blaze._bind(x, target);
};
// If `x` is a function, binds the value of `this` for that function
// to the current data context.
const bindDataContext = function(x) {
    if (typeof x === 'function') {
        return function(...args) {
            let data = Blaze.getData();
            if (data == null) data = {};
            return x.apply(data, args);
        };
    }
    return x;
};
Blaze._OLDSTYLE_HELPER = {};
Blaze._getTemplateHelper = function(template, name, tmplInstanceFunc) {
    // XXX COMPAT WITH 0.9.3
    let isKnownOldStyleHelper = false;
    if (template.__helpers.has(name)) {
        const helper = template.__helpers.get(name);
        if (helper === Blaze._OLDSTYLE_HELPER) {
            isKnownOldStyleHelper = true;
        } else if (helper != null) {
            const printName = `${template.viewName} ${name}`;
            return wrapHelper(bindDataContext(helper), tmplInstanceFunc, printName);
        } else {
            return null;
        }
    }
    // old-style helper
    if (name in template) {
        // Only warn once per helper
        if (!isKnownOldStyleHelper) {
            template.__helpers.set(name, Blaze._OLDSTYLE_HELPER);
            if (!template._NOWARN_OLDSTYLE_HELPERS) {
                Blaze._warn('Assigning helper with `' + template.viewName + '.' + name + ' = ...` is deprecated.  Use `' + template.viewName + '.helpers(...)` instead.');
            }
        }
        if (template[name] != null) {
            return wrapHelper(bindDataContext(template[name]), tmplInstanceFunc);
        }
    }
    return null;
};
const wrapHelper = function(f, templateFunc, name = 'template helper') {
    if (typeof f !== "function") {
        return f;
    }
    return function(...args) {
        const self = this;
        return Blaze.Template._withTemplateInstanceFunc(templateFunc, function() {
            return Blaze._wrapCatchingExceptions(f, name).apply(self, args);
        });
    };
};
function _lexicalKeepGoing(currentView) {
    if (!currentView.parentView) {
        return undefined;
    }
    if (!currentView.__startsNewLexicalScope) {
        return currentView.parentView;
    }
    if (currentView.parentView.__childDoesntStartNewLexicalScope) {
        return currentView.parentView;
    }
    // in the case of {{> Template.contentBlock data}} the contentBlock loses the lexical scope of it's parent, wheras {{> Template.contentBlock}} it does not
    // this is because a #with sits between the include InOuterTemplateScope
    if (currentView.parentView.name === "with" && currentView.parentView.parentView && currentView.parentView.parentView.__childDoesntStartNewLexicalScope) {
        return currentView.parentView;
    }
    return undefined;
}
function _lexicalBindingLookup(view, name) {
    let currentView = view;
    // walk up the views stopping at a Spacebars.include or Template view that
    // doesn't have an InOuterTemplateScope view as a parent
    do {
        // skip block helpers views
        // if we found the binding on the scope, return it
        if (has(currentView._scopeBindings, name)) {
            return currentView._scopeBindings[name];
        }
    }while (currentView = _lexicalKeepGoing(currentView))
    return null;
}
Blaze._lexicalBindingLookup = function(view, name) {
    const binding = _lexicalBindingLookup(view, name);
    return binding && (()=>{
        var _binding_get;
        return (_binding_get = binding.get()) === null || _binding_get === void 0 ? void 0 : _binding_get.value;
    });
};
// templateInstance argument is provided to be available for possible
// alternative implementations of this function by 3rd party packages.
Blaze._getTemplate = function(name, templateInstance) {
    if (name in Blaze.Template && Blaze.Template[name] instanceof Blaze.Template) {
        return Blaze.Template[name];
    }
    return null;
};
Blaze._getGlobalHelper = function(name, templateInstance) {
    if (Blaze._globalHelpers[name] != null) {
        const printName = `global helper ${name}`;
        return wrapHelper(bindDataContext(Blaze._globalHelpers[name]), templateInstance, printName);
    }
    return null;
};
// Looks up a name, like "foo" or "..", as a helper of the
// current template; the name of a template; a global helper;
// or a property of the data context.  Called on the View of
// a template (i.e. a View with a `.template` property,
// where the helpers are).  Used for the first name in a
// "path" in a template tag, like "foo" in `{{foo.bar}}` or
// ".." in `{{frobulate ../blah}}`.
//
// Returns a function, a non-function value, or null.  If
// a function is found, it is bound appropriately.
//
// NOTE: This function must not establish any reactive
// dependencies itself.  If there is any reactivity in the
// value, lookup should return a function.
Blaze.View.prototype.lookup = function(name, _options) {
    const template = this.template;
    const lookupTemplate = _options && _options.template;
    let helper;
    let binding;
    let boundTmplInstance;
    let foundTemplate;
    if (this.templateInstance) {
        boundTmplInstance = Blaze._bind(this.templateInstance, this);
    }
    // 0. looking up the parent data context with the special "../" syntax
    if (/^\./.test(name)) {
        // starts with a dot. must be a series of dots which maps to an
        // ancestor of the appropriate height.
        if (!/^(\.)+$/.test(name)) throw new Error("id starting with dot must be a series of dots");
        return Blaze._parentData(name.length - 1, true);
    }
    // 1. look up a helper on the current template
    if (template && (helper = Blaze._getTemplateHelper(template, name, boundTmplInstance)) != null) {
        return helper;
    }
    // 2. look up a binding by traversing the lexical view hierarchy inside the
    // current template
    if (template && (binding = Blaze._lexicalBindingLookup(Blaze.currentView, name)) != null) {
        return binding;
    }
    // 3. look up a template by name
    if (lookupTemplate && (foundTemplate = Blaze._getTemplate(name, boundTmplInstance)) != null) {
        return foundTemplate;
    }
    // 4. look up a global helper
    helper = Blaze._getGlobalHelper(name, boundTmplInstance);
    if (helper != null) {
        return helper;
    }
    // 5. look up in a data context
    return function(...args) {
        const isCalledAsFunction = args.length > 0;
        const data = Blaze.getData();
        const x = data && data[name];
        if (!x) {
            if (lookupTemplate) {
                throw new Error("No such template: " + name);
            } else if (isCalledAsFunction) {
                throw new Error("No such function: " + name);
            } else if (name.charAt(0) === '@' && (x === null || x === undefined)) {
                // Throw an error if the user tries to use a `@directive`
                // that doesn't exist.  We don't implement all directives
                // from Handlebars, so there's a potential for confusion
                // if we fail silently.  On the other hand, we want to
                // throw late in case some app or package wants to provide
                // a missing directive.
                throw new Error("Unsupported directive: " + name);
            }
        }
        if (!data) {
            return null;
        }
        if (typeof x !== 'function') {
            if (isCalledAsFunction) {
                throw new Error("Can't call non-function: " + x);
            }
            return x;
        }
        return x.apply(data, args);
    };
};
// Implement Spacebars' {{../..}}.
// @param height {Number} The number of '..'s
Blaze._parentData = function(height, _functionWrapped) {
    var _theWith_dataVar_get;
    // If height is null or undefined, we default to 1, the first parent.
    if (height == null) {
        height = 1;
    }
    let theWith = Blaze.getView('with');
    for(let i = 0; i < height && theWith; i++){
        theWith = Blaze.getView(theWith, 'with');
    }
    if (!theWith) return null;
    if (_functionWrapped) return function() {
        var _theWith_dataVar_get;
        return (_theWith_dataVar_get = theWith.dataVar.get()) === null || _theWith_dataVar_get === void 0 ? void 0 : _theWith_dataVar_get.value;
    };
    return (_theWith_dataVar_get = theWith.dataVar.get()) === null || _theWith_dataVar_get === void 0 ? void 0 : _theWith_dataVar_get.value;
};
Blaze.View.prototype.lookupTemplate = function(name) {
    return this.lookup(name, {
        template: true
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/template.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let isObject;module.link('lodash.isobject',{default(v){isObject=v}},0);let isFunction;module.link('lodash.isfunction',{default(v){isFunction=v}},1);let has;module.link('lodash.has',{default(v){has=v}},2);let isEmpty;module.link('lodash.isempty',{default(v){isEmpty=v}},3);



// [new] Blaze.Template([viewName], renderFunction)
//
// `Blaze.Template` is the class of templates, like `Template.foo` in
// Meteor, which is `instanceof Template`.
//
// `viewKind` is a string that looks like "Template.foo" for templates
// defined by the compiler.
/**
 * @class
 * @summary Constructor for a Template, which is used to construct Views with particular name and content.
 * @locus Client
 * @param {String} [viewName] Optional.  A name for Views constructed by this Template.  See [`view.name`](#view_name).
 * @param {Function} renderFunction A function that returns [*renderable content*](#Renderable-Content).  This function is used as the `renderFunction` for Views constructed by this Template.
 */ Blaze.Template = function(viewName, renderFunction) {
    if (!(this instanceof Blaze.Template)) // called without `new`
    return new Blaze.Template(viewName, renderFunction);
    if (typeof viewName === 'function') {
        // omitted "viewName" argument
        renderFunction = viewName;
        viewName = '';
    }
    if (typeof viewName !== 'string') throw new Error("viewName must be a String (or omitted)");
    if (typeof renderFunction !== 'function') throw new Error("renderFunction must be a function");
    this.viewName = viewName;
    this.renderFunction = renderFunction;
    this.__helpers = new HelperMap;
    this.__eventMaps = [];
    this._callbacks = {
        created: [],
        rendered: [],
        destroyed: []
    };
};
const Template = Blaze.Template;
const HelperMap = function() {};
HelperMap.prototype.get = function(name) {
    return this[' ' + name];
};
HelperMap.prototype.set = function(name, helper) {
    this[' ' + name] = helper;
};
HelperMap.prototype.has = function(name) {
    return typeof this[' ' + name] !== 'undefined';
};
/**
 * @summary Returns true if `value` is a template object like `Template.myTemplate`.
 * @locus Client
 * @param {Any} value The value to test.
 */ Blaze.isTemplate = function(t) {
    return t instanceof Blaze.Template;
};
/**
 * @name  onCreated
 * @instance
 * @memberOf Template
 * @summary Register a function to be called when an instance of this template is created.
 * @param {Function} callback A function to be added as a callback.
 * @locus Client
 * @importFromPackage templating
 */ Template.prototype.onCreated = function(cb) {
    this._callbacks.created.push(cb);
};
/**
 * @name  onRendered
 * @instance
 * @memberOf Template
 * @summary Register a function to be called when an instance of this template is inserted into the DOM.
 * @param {Function} callback A function to be added as a callback.
 * @locus Client
 * @importFromPackage templating
 */ Template.prototype.onRendered = function(cb) {
    this._callbacks.rendered.push(cb);
};
/**
 * @name  onDestroyed
 * @instance
 * @memberOf Template
 * @summary Register a function to be called when an instance of this template is removed from the DOM and destroyed.
 * @param {Function} callback A function to be added as a callback.
 * @locus Client
 * @importFromPackage templating
 */ Template.prototype.onDestroyed = function(cb) {
    this._callbacks.destroyed.push(cb);
};
Template.prototype._getCallbacks = function(which) {
    const self = this;
    let callbacks = self[which] ? [
        self[which]
    ] : [];
    // Fire all callbacks added with the new API (Template.onRendered())
    // as well as the old-style callback (e.g. Template.rendered) for
    // backwards-compatibility.
    callbacks = callbacks.concat(self._callbacks[which]);
    return callbacks;
};
const fireCallbacks = function(callbacks, template) {
    Template._withTemplateInstanceFunc(function() {
        return template;
    }, function() {
        for(let i = 0, N = callbacks.length; i < N; i++){
            callbacks[i].call(template);
        }
    });
};
Template.prototype.constructView = function(contentFunc, elseFunc) {
    const self = this;
    const view = Blaze.View(self.viewName, self.renderFunction);
    view.template = self;
    view.templateContentBlock = contentFunc ? new Template('(contentBlock)', contentFunc) : null;
    view.templateElseBlock = elseFunc ? new Template('(elseBlock)', elseFunc) : null;
    if (self.__eventMaps || typeof self.events === 'object') {
        view._onViewRendered(function() {
            if (view.renderCount !== 1) return;
            if (!self.__eventMaps.length && typeof self.events === "object") {
                // Provide limited back-compat support for `.events = {...}`
                // syntax.  Pass `template.events` to the original `.events(...)`
                // function.  This code must run only once per template, in
                // order to not bind the handlers more than once, which is
                // ensured by the fact that we only do this when `__eventMaps`
                // is falsy, and we cause it to be set now.
                Template.prototype.events.call(self, self.events);
            }
            self.__eventMaps.forEach(function(m) {
                Blaze._addEventMap(view, m, view);
            });
        });
    }
    view._templateInstance = new Blaze.TemplateInstance(view);
    view.templateInstance = function() {
        // Update data, firstNode, and lastNode, and return the TemplateInstance
        // object.
        const inst = view._templateInstance;
        /**
     * @instance
     * @memberOf Blaze.TemplateInstance
     * @name  data
     * @summary The data context of this instance's latest invocation.
     * @locus Client
     */ inst.data = Blaze.getData(view);
        if (view._domrange && !view.isDestroyed) {
            inst.firstNode = view._domrange.firstNode();
            inst.lastNode = view._domrange.lastNode();
        } else {
            // on 'created' or 'destroyed' callbacks we don't have a DomRange
            inst.firstNode = null;
            inst.lastNode = null;
        }
        return inst;
    };
    /**
   * @name  created
   * @instance
   * @memberOf Template
   * @summary Provide a callback when an instance of a template is created.
   * @locus Client
   * @deprecated in 1.1
   */ // To avoid situations when new callbacks are added in between view
    // instantiation and event being fired, decide on all callbacks to fire
    // immediately and then fire them on the event.
    const createdCallbacks = self._getCallbacks('created');
    view.onViewCreated(function() {
        fireCallbacks(createdCallbacks, view.templateInstance());
    });
    /**
   * @name  rendered
   * @instance
   * @memberOf Template
   * @summary Provide a callback when an instance of a template is rendered.
   * @locus Client
   * @deprecated in 1.1
   */ const renderedCallbacks = self._getCallbacks('rendered');
    view.onViewReady(function() {
        fireCallbacks(renderedCallbacks, view.templateInstance());
    });
    /**
   * @name  destroyed
   * @instance
   * @memberOf Template
   * @summary Provide a callback when an instance of a template is destroyed.
   * @locus Client
   * @deprecated in 1.1
   */ const destroyedCallbacks = self._getCallbacks('destroyed');
    view.onViewDestroyed(function() {
        fireCallbacks(destroyedCallbacks, view.templateInstance());
    });
    return view;
};
/**
 * @class
 * @summary The class for template instances
 * @param {Blaze.View} view
 * @instanceName template
 */ Blaze.TemplateInstance = function(view) {
    if (!(this instanceof Blaze.TemplateInstance)) // called without `new`
    return new Blaze.TemplateInstance(view);
    if (!(view instanceof Blaze.View)) throw new Error("View required");
    view._templateInstance = this;
    /**
   * @name view
   * @memberOf Blaze.TemplateInstance
   * @instance
   * @summary The [View](../api/blaze.html#Blaze-View) object for this invocation of the template.
   * @locus Client
   * @type {Blaze.View}
   */ this.view = view;
    this.data = null;
    /**
   * @name firstNode
   * @memberOf Blaze.TemplateInstance
   * @instance
   * @summary The first top-level DOM node in this template instance.
   * @locus Client
   * @type {DOMNode}
   */ this.firstNode = null;
    /**
   * @name lastNode
   * @memberOf Blaze.TemplateInstance
   * @instance
   * @summary The last top-level DOM node in this template instance.
   * @locus Client
   * @type {DOMNode}
   */ this.lastNode = null;
    // This dependency is used to identify state transitions in
    // _subscriptionHandles which could cause the result of
    // TemplateInstance#subscriptionsReady to change. Basically this is triggered
    // whenever a new subscription handle is added or when a subscription handle
    // is removed and they are not ready.
    this._allSubsReadyDep = new Tracker.Dependency();
    this._allSubsReady = false;
    this._subscriptionHandles = {};
};
/**
 * @summary Find all elements matching `selector` in this template instance, and return them as a JQuery object.
 * @locus Client
 * @param {String} selector The CSS selector to match, scoped to the template contents.
 * @returns {DOMNode[]}
 */ Blaze.TemplateInstance.prototype.$ = function(selector) {
    const view = this.view;
    if (!view._domrange) throw new Error("Can't use $ on template instance with no DOM");
    return view._domrange.$(selector);
};
/**
 * @summary Find all elements matching `selector` in this template instance.
 * @locus Client
 * @param {String} selector The CSS selector to match, scoped to the template contents.
 * @returns {DOMElement[]}
 */ Blaze.TemplateInstance.prototype.findAll = function(selector) {
    return Array.prototype.slice.call(this.$(selector));
};
/**
 * @summary Find one element matching `selector` in this template instance.
 * @locus Client
 * @param {String} selector The CSS selector to match, scoped to the template contents.
 * @returns {DOMElement}
 */ Blaze.TemplateInstance.prototype.find = function(selector) {
    const result = this.$(selector);
    return result[0] || null;
};
/**
 * @summary A version of [Tracker.autorun](https://docs.meteor.com/api/tracker.html#Tracker-autorun) that is stopped when the template is destroyed.
 * @locus Client
 * @param {Function} runFunc The function to run. It receives one argument: a Tracker.Computation object.
 */ Blaze.TemplateInstance.prototype.autorun = function(f) {
    return this.view.autorun(f);
};
/**
 * @summary A version of [Meteor.subscribe](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe) that is stopped
 * when the template is destroyed.
 * @return {SubscriptionHandle} The subscription handle to the newly made
 * subscription. Call `handle.stop()` to manually stop the subscription, or
 * `handle.ready()` to find out if this particular subscription has loaded all
 * of its inital data.
 * @locus Client
 * @param {String} name Name of the subscription.  Matches the name of the
 * server's `publish()` call.
 * @param {Any} [arg1,arg2...] Optional arguments passed to publisher function
 * on server.
 * @param {Function|Object} [options] If a function is passed instead of an
 * object, it is interpreted as an `onReady` callback.
 * @param {Function} [options.onReady] Passed to [`Meteor.subscribe`](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe).
 * @param {Function} [options.onStop] Passed to [`Meteor.subscribe`](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe).
 * @param {DDP.Connection} [options.connection] The connection on which to make the
 * subscription.
 */ Blaze.TemplateInstance.prototype.subscribe = function(...args) {
    const self = this;
    const subHandles = self._subscriptionHandles;
    // Duplicate logic from Meteor.subscribe
    let options = {};
    if (args.length) {
        const lastParam = args[args.length - 1];
        // Match pattern to check if the last arg is an options argument
        const lastParamOptionsPattern = {
            onReady: Match.Optional(Function),
            // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use
            // onStop with an error callback instead.
            onError: Match.Optional(Function),
            onStop: Match.Optional(Function),
            connection: Match.Optional(Match.Any)
        };
        if (isFunction(lastParam)) {
            options.onReady = args.pop();
        } else if (lastParam && !isEmpty(lastParam) && Match.test(lastParam, lastParamOptionsPattern)) {
            options = args.pop();
        }
    }
    let subHandle;
    const oldStopped = options.onStop;
    options.onStop = function(error) {
        // When the subscription is stopped, remove it from the set of tracked
        // subscriptions to avoid this list growing without bound
        delete subHandles[subHandle.subscriptionId];
        // Removing a subscription can only change the result of subscriptionsReady
        // if we are not ready (that subscription could be the one blocking us being
        // ready).
        if (!self._allSubsReady) {
            self._allSubsReadyDep.changed();
        }
        if (oldStopped) {
            oldStopped(error);
        }
    };
    const { onReady, onError, onStop, connection } = options;
    const callbacks = {
        onReady,
        onError,
        onStop
    };
    // The callbacks are passed as the last item in the arguments array passed to
    // View#subscribe
    args.push(callbacks);
    // View#subscribe takes the connection as one of the options in the last
    // argument
    subHandle = self.view.subscribe.call(self.view, args, {
        connection: connection
    });
    if (!has(subHandles, subHandle.subscriptionId)) {
        subHandles[subHandle.subscriptionId] = subHandle;
        // Adding a new subscription will always cause us to transition from ready
        // to not ready, but if we are already not ready then this can't make us
        // ready.
        if (self._allSubsReady) {
            self._allSubsReadyDep.changed();
        }
    }
    return subHandle;
};
/**
 * @summary A reactive function that returns true when all of the subscriptions
 * called with [this.subscribe](#TemplateInstance-subscribe) are ready.
 * @return {Boolean} True if all subscriptions on this template instance are
 * ready.
 */ Blaze.TemplateInstance.prototype.subscriptionsReady = function() {
    this._allSubsReadyDep.depend();
    this._allSubsReady = Object.values(this._subscriptionHandles).every((handle)=>{
        return handle.ready();
    });
    return this._allSubsReady;
};
/**
 * @summary Specify template helpers available to this template.
 * @locus Client
 * @param {Object} helpers Dictionary of helper functions by name.
 * @importFromPackage templating
 */ Template.prototype.helpers = function(dict) {
    if (!isObject(dict)) {
        throw new Error("Helpers dictionary has to be an object");
    }
    for(let k in dict)this.__helpers.set(k, dict[k]);
};
const canUseGetters = function() {
    if (Object.defineProperty) {
        let obj = {};
        try {
            Object.defineProperty(obj, "self", {
                get: function() {
                    return obj;
                }
            });
        } catch (e) {
            return false;
        }
        return obj.self === obj;
    }
    return false;
}();
if (canUseGetters) {
    // Like Blaze.currentView but for the template instance. A function
    // rather than a value so that not all helpers are implicitly dependent
    // on the current template instance's `data` property, which would make
    // them dependent on the data context of the template inclusion.
    let currentTemplateInstanceFunc = null;
    // If getters are supported, define this property with a getter function
    // to make it effectively read-only, and to work around this bizarre JSC
    // bug: https://github.com/meteor/meteor/issues/9926
    Object.defineProperty(Template, "_currentTemplateInstanceFunc", {
        get: function() {
            return currentTemplateInstanceFunc;
        }
    });
    Template._withTemplateInstanceFunc = function(templateInstanceFunc, func) {
        if (typeof func !== 'function') {
            throw new Error("Expected function, got: " + func);
        }
        const oldTmplInstanceFunc = currentTemplateInstanceFunc;
        try {
            currentTemplateInstanceFunc = templateInstanceFunc;
            return func();
        } finally{
            currentTemplateInstanceFunc = oldTmplInstanceFunc;
        }
    };
} else {
    // If getters are not supported, just use a normal property.
    Template._currentTemplateInstanceFunc = null;
    Template._withTemplateInstanceFunc = function(templateInstanceFunc, func) {
        if (typeof func !== 'function') {
            throw new Error("Expected function, got: " + func);
        }
        const oldTmplInstanceFunc = Template._currentTemplateInstanceFunc;
        try {
            Template._currentTemplateInstanceFunc = templateInstanceFunc;
            return func();
        } finally{
            Template._currentTemplateInstanceFunc = oldTmplInstanceFunc;
        }
    };
}
/**
 * @summary Specify event handlers for this template.
 * @locus Client
 * @param {EventMap} eventMap Event handlers to associate with this template.
 * @importFromPackage templating
 */ Template.prototype.events = function(eventMap) {
    if (!isObject(eventMap)) {
        throw new Error("Event map has to be an object");
    }
    const template = this;
    let eventMap2 = {};
    for(let k in eventMap){
        eventMap2[k] = function(k, v) {
            return function(...args) {
                const view = this; // passed by EventAugmenter
                const [event] = args;
                // Exiting the current computation to avoid creating unnecessary
                // and unexpected reactive dependencies with Templates data
                // or any other reactive dependencies defined in event handlers
                return Tracker.nonreactive(function() {
                    let data = Blaze.getData(event.currentTarget);
                    if (data == null) data = {};
                    const tmplInstanceFunc = Blaze._bind(view.templateInstance, view);
                    args.splice(1, 0, tmplInstanceFunc());
                    return Template._withTemplateInstanceFunc(tmplInstanceFunc, function() {
                        return v.apply(data, args);
                    });
                });
            };
        }(k, eventMap[k]);
    }
    template.__eventMaps.push(eventMap2);
};
/**
 * @function
 * @name instance
 * @memberOf Template
 * @summary The [template instance](#Template-instances) corresponding to the current template helper, event handler, callback, or autorun.  If there isn't one, `null`.
 * @locus Client
 * @returns {Blaze.TemplateInstance}
 * @importFromPackage templating
 */ Template.instance = function() {
    return Template._currentTemplateInstanceFunc && Template._currentTemplateInstanceFunc();
};
// Note: Template.currentData() is documented to take zero arguments,
// while Blaze.getData takes up to one.
/**
 * @summary
 *
 * - Inside an `onCreated`, `onRendered`, or `onDestroyed` callback, returns
 * the data context of the template.
 * - Inside an event handler, returns the data context of the template on which
 * this event handler was defined.
 * - Inside a helper, returns the data context of the DOM node where the helper
 * was used.
 *
 * Establishes a reactive dependency on the result.
 * @locus Client
 * @function
 * @importFromPackage templating
 */ Template.currentData = Blaze.getData;
/**
 * @summary Accesses other data contexts that enclose the current data context.
 * @locus Client
 * @function
 * @param {Integer} [numLevels] The number of levels beyond the current data context to look. Defaults to 1.
 * @importFromPackage templating
 */ Template.parentData = Blaze._parentData;
/**
 * @summary Defines a [helper function](#Template-helpers) which can be used from all templates.
 * @locus Client
 * @function
 * @param {String} name The name of the helper function you are defining.
 * @param {Function} function The helper function itself.
 * @importFromPackage templating
 */ Template.registerHelper = Blaze.registerHelper;
/**
 * @summary Removes a global [helper function](#Template-helpers).
 * @locus Client
 * @function
 * @param {String} name The name of the helper function you are defining.
 * @importFromPackage templating
 */ Template.deregisterHelper = Blaze.deregisterHelper;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"backcompat.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/blaze/backcompat.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
UI = Blaze;
Blaze.ReactiveVar = ReactiveVar;
UI._templateInstance = Blaze.Template.instance;
Handlebars = {};
Handlebars.registerHelper = Blaze.registerHelper;
Handlebars._escape = Blaze._escape;
// Return these from {{...}} helpers to achieve the same as returning
// strings from {{{...}}} helpers
Handlebars.SafeString = function(string) {
    this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
    return this.string.toString();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.has":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.has/package.json                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.has",
  "version": "4.5.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.has/index.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isobject/package.json                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isobject/index.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isfunction":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isfunction/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isfunction",
  "version": "3.0.9"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isfunction/index.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isempty/package.json                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/blaze/node_modules/lodash.isempty/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Blaze: Blaze,
      UI: UI,
      Handlebars: Handlebars
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/blaze/preamble.js",
    "/node_modules/meteor/blaze/exceptions.js",
    "/node_modules/meteor/blaze/view.js",
    "/node_modules/meteor/blaze/builtins.js",
    "/node_modules/meteor/blaze/lookup.js",
    "/node_modules/meteor/blaze/template.js",
    "/node_modules/meteor/blaze/backcompat.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/blaze.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYmxhemUvcHJlYW1ibGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL2V4Y2VwdGlvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL3ZpZXcuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL2J1aWx0aW5zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9ibGF6ZS9sb29rdXAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2JsYXplL3RlbXBsYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9ibGF6ZS9iYWNrY29tcGF0LmpzIl0sIm5hbWVzIjpbIkJsYXplIiwiX2VzY2FwZSIsImVzY2FwZV9tYXAiLCJlc2NhcGVfb25lIiwiYyIsIngiLCJyZXBsYWNlIiwiX3dhcm4iLCJtc2ciLCJjb25zb2xlIiwid2FybiIsIm5hdGl2ZUJpbmQiLCJGdW5jdGlvbiIsInByb3RvdHlwZSIsImJpbmQiLCJfYmluZCIsImFyZ3MiLCJmdW5jIiwib2JqIiwicmVzdCIsImxlbmd0aCIsImNhbGwiLCJhcHBseSIsIm9iakEiLCJvYmpCIiwiZGVidWdGdW5jIiwiX3Rocm93TmV4dEV4Y2VwdGlvbiIsIl9yZXBvcnRFeGNlcHRpb24iLCJlIiwiTWV0ZW9yIiwiX2RlYnVnIiwibG9nIiwic3RhY2siLCJtZXNzYWdlIiwiX3JlcG9ydEV4Y2VwdGlvbkFuZFRocm93IiwiZXJyb3IiLCJfd3JhcENhdGNoaW5nRXhjZXB0aW9ucyIsImYiLCJ3aGVyZSIsIlZpZXciLCJuYW1lIiwicmVuZGVyIiwiX3JlbmRlciIsIl9jYWxsYmFja3MiLCJjcmVhdGVkIiwicmVuZGVyZWQiLCJkZXN0cm95ZWQiLCJpc0NyZWF0ZWQiLCJfaXNDcmVhdGVkRm9yRXhwYW5zaW9uIiwiaXNSZW5kZXJlZCIsIl9pc0F0dGFjaGVkIiwiaXNEZXN0cm95ZWQiLCJfaXNJblJlbmRlciIsInBhcmVudFZpZXciLCJfZG9tcmFuZ2UiLCJfaGFzR2VuZXJhdGVkUGFyZW50IiwiX3Njb3BlQmluZGluZ3MiLCJyZW5kZXJDb3VudCIsIm9uVmlld0NyZWF0ZWQiLCJjYiIsInB1c2giLCJfb25WaWV3UmVuZGVyZWQiLCJvblZpZXdSZWFkeSIsInNlbGYiLCJmaXJlIiwiVHJhY2tlciIsImFmdGVyRmx1c2giLCJfd2l0aEN1cnJlbnRWaWV3Iiwib25WaWV3UmVuZGVyZWQiLCJhdHRhY2hlZCIsIm9uQXR0YWNoZWQiLCJvblZpZXdEZXN0cm95ZWQiLCJyZW1vdmVWaWV3RGVzdHJveWVkTGlzdGVuZXIiLCJpbmRleCIsImxhc3RJbmRleE9mIiwiYXV0b3J1biIsIl9pblZpZXdTY29wZSIsImRpc3BsYXlOYW1lIiwiRXJyb3IiLCJ0ZW1wbGF0ZUluc3RhbmNlRnVuYyIsIlRlbXBsYXRlIiwiX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyIsInZpZXdBdXRvcnVuIiwiX3dpdGhUZW1wbGF0ZUluc3RhbmNlRnVuYyIsImNvbXAiLCJzdG9wQ29tcHV0YXRpb24iLCJzdG9wIiwib25TdG9wIiwiX2Vycm9ySWZTaG91bGRudENhbGxTdWJzY3JpYmUiLCJzdWJzY3JpYmUiLCJvcHRpb25zIiwic3ViSGFuZGxlIiwiY29ubmVjdGlvbiIsImZpcnN0Tm9kZSIsImxhc3ROb2RlIiwiX2ZpcmVDYWxsYmFja3MiLCJ2aWV3Iiwid2hpY2giLCJub25yZWFjdGl2ZSIsImZpcmVDYWxsYmFja3MiLCJjYnMiLCJpIiwiTiIsIl9jcmVhdGVWaWV3IiwiZm9yRXhwYW5zaW9uIiwiZG9GaXJzdFJlbmRlciIsImluaXRpYWxDb250ZW50IiwiZG9tcmFuZ2UiLCJfRE9NUmFuZ2UiLCJ0ZWFyZG93bkhvb2siLCJyYW5nZSIsImVsZW1lbnQiLCJfRE9NQmFja2VuZCIsIlRlYXJkb3duIiwib25FbGVtZW50VGVhcmRvd24iLCJ0ZWFyZG93biIsIl9kZXN0cm95VmlldyIsIl9tYXRlcmlhbGl6ZVZpZXciLCJfd29ya1N0YWNrIiwiX2ludG9BcnJheSIsImxhc3RIdG1sanMiLCJkb1JlbmRlciIsImh0bWxqcyIsImZpcnN0UnVuIiwiX2lzQ29udGVudEVxdWFsIiwiZG9NYXRlcmlhbGl6ZSIsInJhbmdlc0FuZE5vZGVzIiwiX21hdGVyaWFsaXplRE9NIiwic2V0TWVtYmVycyIsIm9uSW52YWxpZGF0ZSIsImRlc3Ryb3lNZW1iZXJzIiwidW5kZWZpbmVkIiwiaW5pdGlhbENvbnRlbnRzIiwiX2V4cGFuZFZpZXciLCJyZXN1bHQiLCJfZXhwYW5kIiwiYWN0aXZlIiwiX0hUTUxKU0V4cGFuZGVyIiwiSFRNTCIsIlRyYW5zZm9ybWluZ1Zpc2l0b3IiLCJleHRlbmQiLCJkZWYiLCJ2aXNpdE9iamVjdCIsImNvbnN0cnVjdFZpZXciLCJ2aXNpdEF0dHJpYnV0ZXMiLCJhdHRycyIsInZpc2l0QXR0cmlidXRlIiwidmFsdWUiLCJ0YWciLCJjdXJyZW50Vmlld0lmUmVuZGVyaW5nIiwiY3VycmVudFZpZXciLCJ2aXNpdCIsIl9leHBhbmRBdHRyaWJ1dGVzIiwiZXhwYW5kZWQiLCJfc2tpcE5vZGVzIiwiX2Rlc3Ryb3lOb2RlIiwibm9kZSIsIm5vZGVUeXBlIiwidGVhckRvd25FbGVtZW50IiwiYSIsImIiLCJSYXciLCJvbGRWaWV3IiwiY2hlY2tSZW5kZXJDb250ZW50IiwiY29udGVudCIsIlZpc2l0b3IiLCJjb250ZW50QXNWaWV3IiwiY29udGVudEFzRnVuYyIsIl9fcm9vdFZpZXdzIiwicGFyZW50RWxlbWVudCIsIm5leHROb2RlIiwiaW5kZXhPZiIsInNwbGljZSIsImF0dGFjaCIsImluc2VydCIsInJlbmRlcldpdGhEYXRhIiwiZGF0YSIsIl9UZW1wbGF0ZVdpdGgiLCJyZW1vdmUiLCJkZXN0cm95IiwicGFyZW50UmFuZ2UiLCJkZXRhY2giLCJ0b0hUTUwiLCJ0b0hUTUxXaXRoRGF0YSIsIl90b1RleHQiLCJ0ZXh0TW9kZSIsIlRFWFRNT0RFIiwiU1RSSU5HIiwiUkNEQVRBIiwiQVRUUklCVVRFIiwidG9UZXh0IiwiZ2V0RGF0YSIsImVsZW1lbnRPclZpZXciLCJ0aGVXaXRoIiwiZ2V0VmlldyIsImRhdGFWYXIiLCJnZXQiLCJnZXRFbGVtZW50RGF0YSIsIl92aWV3TmFtZSIsInZpZXdOYW1lIiwiX2dldEN1cnJlbnRWaWV3IiwiX2dldFBhcmVudFZpZXciLCJfZ2V0RWxlbWVudFZpZXciLCJ2IiwiZWxlbSIsImZvckVsZW1lbnQiLCJfYWRkRXZlbnRNYXAiLCJldmVudE1hcCIsInRoaXNJbkhhbmRsZXIiLCJoYW5kbGVzIiwiYXR0YWNoZWRfZXZlbnRNYXBzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzcGVjIiwiaGFuZGxlciIsImNsYXVzZXMiLCJzcGxpdCIsImNsYXVzZSIsInBhcnRzIiwibmV3RXZlbnRzIiwic2hpZnQiLCJzZWxlY3RvciIsImpvaW4iLCJfRXZlbnRTdXBwb3J0IiwibGlzdGVuIiwiZXZ0IiwiY29udGFpbnNFbGVtZW50IiwiY3VycmVudFRhcmdldCIsImhhbmRsZXJUaGlzIiwiaGFuZGxlckFyZ3MiLCJyIiwiaCIsImhhcyIsIl9jYWxjdWxhdGVDb25kaXRpb24iLCJjb25kIiwiaXNBcnJheSIsIldpdGgiLCJjb250ZW50RnVuYyIsIl9jcmVhdGVCaW5kaW5nIiwiX2lzRXF1YWxCaW5kaW5nIiwieSIsIlJlYWN0aXZlVmFyIiwiX2lzRXF1YWwiLCJfaWRlbnRpdHkiLCJfc2V0QmluZGluZ1ZhbHVlIiwicmVhY3RpdmVWYXIiLCJtYXBwZXIiLCJ0aGVuIiwic2V0IiwiYmluZGluZyIsIl9hdHRhY2hCaW5kaW5nc1RvVmlldyIsImJpbmRpbmdzIiwiZW50cmllcyIsIkxldCIsIklmIiwiY29uZGl0aW9uRnVuYyIsImVsc2VGdW5jIiwiX25vdCIsImNvbmRpdGlvbiIsIl9fY29uZGl0aW9uVmFyIiwiVW5sZXNzIiwiRWFjaCIsImFyZ0Z1bmMiLCJlYWNoVmlldyIsInN1YnZpZXdzIiwiaW5pdGlhbFN1YnZpZXdzIiwiZXhwYW5kZWRWYWx1ZURlcCIsIkRlcGVuZGVuY3kiLCJkZXBlbmQiLCJudW1JdGVtcyIsImluRWxzZU1vZGUiLCJzdG9wSGFuZGxlIiwiYXJnVmFyIiwidmFyaWFibGVOYW1lIiwidXBkYXRlSW5kaWNlcyIsImZyb20iLCJ0byIsIm1lbWJlcnMiLCJtYXliZVNlcXVlbmNlIiwiaXNPYmplY3QiLCJfdmFyaWFibGUiLCJfc2VxdWVuY2UiLCJPYnNlcnZlU2VxdWVuY2UiLCJvYnNlcnZlIiwiYWRkZWRBdCIsImlkIiwiaXRlbSIsIm5ld0l0ZW1WaWV3IiwiY2hhbmdlZCIsInJlbW92ZU1lbWJlciIsImFkZE1lbWJlciIsInJlbW92ZWRBdCIsImNoYW5nZWRBdCIsIm5ld0l0ZW0iLCJvbGRJdGVtIiwiaXRlbVZpZXciLCJnZXRNZW1iZXIiLCJtb3ZlZFRvIiwiZnJvbUluZGV4IiwidG9JbmRleCIsIm1vdmVNZW1iZXIiLCJNYXRoIiwibWluIiwibWF4IiwiX0F3YWl0IiwiX0F3YWl0Q29udGVudCIsImFyZyIsInciLCJ3cmFwcGVkQXJnRnVuYyIsInZpZXdUb0V2YWx1YXRlQXJnIiwib3JpZ2luYWxQYXJlbnRWaWV3Iiwid3JhcHBlZENvbnRlbnRGdW5jIiwiX19pc1RlbXBsYXRlV2l0aCIsIl9Jbk91dGVyVGVtcGxhdGVTY29wZSIsInRlbXBsYXRlVmlldyIsIl9fY2hpbGREb2VzbnRTdGFydE5ld0xleGljYWxTY29wZSIsIl9jcmVhdGVCaW5kaW5nc0hlbHBlciIsImZuIiwibmFtZXMiLCJzbGljZSIsInNvbWUiLCJfbGV4aWNhbEJpbmRpbmdMb29rdXAiLCJfZ2xvYmFsSGVscGVycyIsInJlZ2lzdGVySGVscGVyIiwiZGVyZWdpc3RlckhlbHBlciIsImJpbmRJZklzRnVuY3Rpb24iLCJ0YXJnZXQiLCJiaW5kRGF0YUNvbnRleHQiLCJfT0xEU1RZTEVfSEVMUEVSIiwiX2dldFRlbXBsYXRlSGVscGVyIiwidGVtcGxhdGUiLCJ0bXBsSW5zdGFuY2VGdW5jIiwiaXNLbm93bk9sZFN0eWxlSGVscGVyIiwiX19oZWxwZXJzIiwiaGVscGVyIiwicHJpbnROYW1lIiwid3JhcEhlbHBlciIsIl9OT1dBUk5fT0xEU1RZTEVfSEVMUEVSUyIsInRlbXBsYXRlRnVuYyIsIl9sZXhpY2FsS2VlcEdvaW5nIiwiX19zdGFydHNOZXdMZXhpY2FsU2NvcGUiLCJfZ2V0VGVtcGxhdGUiLCJ0ZW1wbGF0ZUluc3RhbmNlIiwiX2dldEdsb2JhbEhlbHBlciIsImxvb2t1cCIsIl9vcHRpb25zIiwibG9va3VwVGVtcGxhdGUiLCJib3VuZFRtcGxJbnN0YW5jZSIsImZvdW5kVGVtcGxhdGUiLCJ0ZXN0IiwiX3BhcmVudERhdGEiLCJpc0NhbGxlZEFzRnVuY3Rpb24iLCJjaGFyQXQiLCJoZWlnaHQiLCJfZnVuY3Rpb25XcmFwcGVkIiwicmVuZGVyRnVuY3Rpb24iLCJIZWxwZXJNYXAiLCJfX2V2ZW50TWFwcyIsImlzVGVtcGxhdGUiLCJ0Iiwib25DcmVhdGVkIiwib25SZW5kZXJlZCIsIm9uRGVzdHJveWVkIiwiX2dldENhbGxiYWNrcyIsImNhbGxiYWNrcyIsImNvbmNhdCIsInRlbXBsYXRlQ29udGVudEJsb2NrIiwidGVtcGxhdGVFbHNlQmxvY2siLCJldmVudHMiLCJtIiwiX3RlbXBsYXRlSW5zdGFuY2UiLCJUZW1wbGF0ZUluc3RhbmNlIiwiaW5zdCIsImNyZWF0ZWRDYWxsYmFja3MiLCJyZW5kZXJlZENhbGxiYWNrcyIsImRlc3Ryb3llZENhbGxiYWNrcyIsIl9hbGxTdWJzUmVhZHlEZXAiLCJfYWxsU3Vic1JlYWR5IiwiX3N1YnNjcmlwdGlvbkhhbmRsZXMiLCIkIiwiZmluZEFsbCIsIkFycmF5IiwiZmluZCIsInN1YkhhbmRsZXMiLCJsYXN0UGFyYW0iLCJsYXN0UGFyYW1PcHRpb25zUGF0dGVybiIsIm9uUmVhZHkiLCJNYXRjaCIsIk9wdGlvbmFsIiwib25FcnJvciIsIkFueSIsImlzRnVuY3Rpb24iLCJwb3AiLCJpc0VtcHR5Iiwib2xkU3RvcHBlZCIsInN1YnNjcmlwdGlvbklkIiwic3Vic2NyaXB0aW9uc1JlYWR5IiwidmFsdWVzIiwiZXZlcnkiLCJoYW5kbGUiLCJyZWFkeSIsImhlbHBlcnMiLCJkaWN0IiwiayIsImNhblVzZUdldHRlcnMiLCJkZWZpbmVQcm9wZXJ0eSIsImN1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyIsIm9sZFRtcGxJbnN0YW5jZUZ1bmMiLCJldmVudE1hcDIiLCJldmVudCIsImluc3RhbmNlIiwiY3VycmVudERhdGEiLCJwYXJlbnREYXRhIiwiVUkiLCJIYW5kbGViYXJzIiwiU2FmZVN0cmluZyIsInN0cmluZyIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7OztDQUdDLEdBQ0RBLFFBQVEsQ0FBQztBQUVULGlFQUFpRTtBQUNqRSxnRkFBZ0Y7QUFDaEYsK0VBQStFO0FBQy9FQSxNQUFNQyxPQUFPLEdBQUk7SUFDZixNQUFNQyxhQUFhO1FBQ2pCLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUFVLDZDQUE2QyxHQUM1RCxLQUFLO0lBQ1A7SUFDQSxNQUFNQyxhQUFhLFNBQVNDLENBQUM7UUFDM0IsT0FBT0YsVUFBVSxDQUFDRSxFQUFFO0lBQ3RCO0lBRUEsT0FBTyxTQUFVQyxDQUFDO1FBQ2hCLE9BQU9BLEVBQUVDLE9BQU8sQ0FBQyxhQUFhSDtJQUNoQztBQUNGO0FBRUFILE1BQU1PLEtBQUssR0FBRyxTQUFVQyxHQUFHO0lBQ3pCQSxNQUFNLGNBQWNBO0lBRXBCLElBQUssT0FBT0MsWUFBWSxlQUFnQkEsUUFBUUMsSUFBSSxFQUFFO1FBQ3BERCxRQUFRQyxJQUFJLENBQUNGO0lBQ2Y7QUFDRjtBQUVBLE1BQU1HLGFBQWFDLFNBQVNDLFNBQVMsQ0FBQ0MsSUFBSTtBQUUxQyxnRUFBZ0U7QUFDaEUsK0ZBQStGO0FBQy9GLElBQUlILFlBQVk7SUFDZFgsTUFBTWUsS0FBSyxHQUFHLFNBQVUsR0FBR0MsSUFBSTtRQUM3QixNQUFNLENBQUNDLE1BQU1DLEtBQUssR0FBR0MsS0FBSyxHQUFHSDtRQUM3QixJQUFJQSxLQUFLSSxNQUFNLEtBQUssR0FBRztZQUNyQixP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QVUsQ0FBQ25aLFNBQVMsQ0FBQ3FaLFFBQVEsR0FBRztJQUN6QyxPQUFPLElBQUksQ0FBQ0QsTUFBTSxDQUFDQyxRQUFRO0FBQzdCIiwiZmlsZSI6Ii9wYWNrYWdlcy9ibGF6ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG5hbWVzcGFjZSBCbGF6ZVxuICogQHN1bW1hcnkgVGhlIG5hbWVzcGFjZSBmb3IgYWxsIEJsYXplLXJlbGF0ZWQgbWV0aG9kcyBhbmQgY2xhc3Nlcy5cbiAqL1xuQmxhemUgPSB7fTtcblxuLy8gVXRpbGl0eSB0byBIVE1MLWVzY2FwZSBhIHN0cmluZy4gIEluY2x1ZGVkIGZvciBsZWdhY3kgcmVhc29ucy5cbi8vIFRPRE86IFNob3VsZCBiZSByZXBsYWNlZCB3aXRoIF8uZXNjYXBlIG9uY2UgdW5kZXJzY29yZSBpcyB1cGdyYWRlZCB0byBhIG5ld2VyXG4vLyAgICAgICB2ZXJzaW9uIHdoaWNoIGVzY2FwZXMgYCAoYmFja3RpY2spIGFzIHdlbGwuIFVuZGVyc2NvcmUgMS41LjIgZG9lcyBub3QuXG5CbGF6ZS5fZXNjYXBlID0gKGZ1bmN0aW9uKCkge1xuICBjb25zdCBlc2NhcGVfbWFwID0ge1xuICAgIFwiPFwiOiBcIiZsdDtcIixcbiAgICBcIj5cIjogXCImZ3Q7XCIsXG4gICAgJ1wiJzogXCImcXVvdDtcIixcbiAgICBcIidcIjogXCImI3gyNztcIixcbiAgICBcIi9cIjogXCImI3gyRjtcIixcbiAgICBcImBcIjogXCImI3g2MDtcIiwgLyogSUUgYWxsb3dzIGJhY2t0aWNrLWRlbGltaXRlZCBhdHRyaWJ1dGVzPz8gKi9cbiAgICBcIiZcIjogXCImYW1wO1wiXG4gIH07XG4gIGNvbnN0IGVzY2FwZV9vbmUgPSBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGVzY2FwZV9tYXBbY107XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHgucmVwbGFjZSgvWyY8PlwiJ2BdL2csIGVzY2FwZV9vbmUpO1xuICB9O1xufSkoKTtcblxuQmxhemUuX3dhcm4gPSBmdW5jdGlvbiAobXNnKSB7XG4gIG1zZyA9ICdXYXJuaW5nOiAnICsgbXNnO1xuXG4gIGlmICgodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSAmJiBjb25zb2xlLndhcm4pIHtcbiAgICBjb25zb2xlLndhcm4obXNnKTtcbiAgfVxufTtcblxuY29uc3QgbmF0aXZlQmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kO1xuXG4vLyBBbiBpbXBsZW1lbnRhdGlvbiBvZiBfLmJpbmQgd2hpY2ggYWxsb3dzIGJldHRlciBvcHRpbWl6YXRpb24uXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzLW1hbmFnaW5nLWFyZ3VtZW50c1xuaWYgKG5hdGl2ZUJpbmQpIHtcbiAgQmxhemUuX2JpbmQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIGNvbnN0IFtmdW5jLCBvYmosIC4uLnJlc3RdID0gYXJnc1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgcmV0dXJuIG5hdGl2ZUJpbmQuY2FsbChmdW5jLCBvYmopO1xuICAgIH1cblxuICAgIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIFtvYmosIC4uLnJlc3RdKTtcbiAgfTtcbn1cbmVsc2Uge1xuICAvLyBBIHNsb3dlciBidXQgYmFja3dhcmRzIGNvbXBhdGlibGUgdmVyc2lvbi5cbiAgQmxhemUuX2JpbmQgPSBmdW5jdGlvbihvYmpBLCBvYmpCKSB7XG4gICAgb2JqQS5iaW5kKG9iakIpO1xuICB9O1xufVxuIiwibGV0IGRlYnVnRnVuYztcblxuLy8gV2UgY2FsbCBpbnRvIHVzZXIgY29kZSBpbiBtYW55IHBsYWNlcywgYW5kIGl0J3MgbmljZSB0byBjYXRjaCBleGNlcHRpb25zXG4vLyBwcm9wYWdhdGVkIGZyb20gdXNlciBjb2RlIGltbWVkaWF0ZWx5IHNvIHRoYXQgdGhlIHdob2xlIHN5c3RlbSBkb2Vzbid0IGp1c3Rcbi8vIGJyZWFrLiAgQ2F0Y2hpbmcgZXhjZXB0aW9ucyBpcyBlYXN5OyByZXBvcnRpbmcgdGhlbSBpcyBoYXJkLiAgVGhpcyBoZWxwZXJcbi8vIHJlcG9ydHMgZXhjZXB0aW9ucy5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyBgYGBcbi8vIHRyeSB7XG4vLyAgIC8vIC4uLiBzb21lU3R1ZmYgLi4uXG4vLyB9IGNhdGNoIChlKSB7XG4vLyAgIHJlcG9ydFVJRXhjZXB0aW9uKGUpO1xuLy8gfVxuLy8gYGBgXG4vL1xuLy8gQW4gb3B0aW9uYWwgc2Vjb25kIGFyZ3VtZW50IG92ZXJyaWRlcyB0aGUgZGVmYXVsdCBtZXNzYWdlLlxuXG4vLyBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gY2F1c2UgYHJlcG9ydEV4Y2VwdGlvbmAgdG8gdGhyb3dcbi8vIHRoZSBuZXh0IGV4Y2VwdGlvbiByYXRoZXIgdGhhbiByZXBvcnRpbmcgaXQuICBUaGlzIGlzXG4vLyB1c2VmdWwgaW4gdW5pdCB0ZXN0cyB0aGF0IHRlc3QgZXJyb3IgbWVzc2FnZXMuXG5CbGF6ZS5fdGhyb3dOZXh0RXhjZXB0aW9uID0gZmFsc2U7XG5cbkJsYXplLl9yZXBvcnRFeGNlcHRpb24gPSBmdW5jdGlvbiAoZSwgbXNnKSB7XG4gIGlmIChCbGF6ZS5fdGhyb3dOZXh0RXhjZXB0aW9uKSB7XG4gICAgQmxhemUuX3Rocm93TmV4dEV4Y2VwdGlvbiA9IGZhbHNlO1xuICAgIHRocm93IGU7XG4gIH1cblxuICBpZiAoISBkZWJ1Z0Z1bmMpXG4gICAgLy8gYWRhcHRlZCBmcm9tIFRyYWNrZXJcbiAgICBkZWJ1Z0Z1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKHR5cGVvZiBNZXRlb3IgIT09IFwidW5kZWZpbmVkXCIgPyBNZXRlb3IuX2RlYnVnIDpcbiAgICAgICAgICAgICAgKCh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIikgJiYgY29uc29sZS5sb2cgPyBjb25zb2xlLmxvZyA6XG4gICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7fSkpO1xuICAgIH07XG5cbiAgLy8gSW4gQ2hyb21lLCBgZS5zdGFja2AgaXMgYSBtdWx0aWxpbmUgc3RyaW5nIHRoYXQgc3RhcnRzIHdpdGggdGhlIG1lc3NhZ2VcbiAgLy8gYW5kIGNvbnRhaW5zIGEgc3RhY2sgdHJhY2UuICBGdXJ0aGVybW9yZSwgYGNvbnNvbGUubG9nYCBtYWtlcyBpdCBjbGlja2FibGUuXG4gIC8vIGBjb25zb2xlLmxvZ2Agc3VwcGxpZXMgdGhlIHNwYWNlIGJldHdlZW4gdGhlIHR3byBhcmd1bWVudHMuXG4gIGRlYnVnRnVuYygpKG1zZyB8fCAnRXhjZXB0aW9uIGNhdWdodCBpbiB0ZW1wbGF0ZTonLCBlLnN0YWNrIHx8IGUubWVzc2FnZSB8fCBlKTtcbn07XG5cbi8vIEl0J3MgbWVhbnQgdG8gYmUgdXNlZCBpbiBgUHJvbWlzZWAgY2hhaW5zIHRvIHJlcG9ydCB0aGUgZXJyb3Igd2hpbGUgbm90XG4vLyBcInN3YWxsb3dpbmdcIiBpdCAoaS5lLiwgdGhlIGNoYWluIHdpbGwgc3RpbGwgcmVqZWN0KS5cbkJsYXplLl9yZXBvcnRFeGNlcHRpb25BbmRUaHJvdyA9IGZ1bmN0aW9uIChlcnJvcikge1xuICBCbGF6ZS5fcmVwb3J0RXhjZXB0aW9uKGVycm9yKTtcbiAgdGhyb3cgZXJyb3I7XG59O1xuXG5CbGF6ZS5fd3JhcENhdGNoaW5nRXhjZXB0aW9ucyA9IGZ1bmN0aW9uIChmLCB3aGVyZSkge1xuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIGY7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIEJsYXplLl9yZXBvcnRFeGNlcHRpb24oZSwgJ0V4Y2VwdGlvbiBpbiAnICsgd2hlcmUgKyAnOicpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLy8gW25ld10gQmxhemUuVmlldyhbbmFtZV0sIHJlbmRlck1ldGhvZClcbi8vL1xuLy8vIEJsYXplLlZpZXcgaXMgdGhlIGJ1aWxkaW5nIGJsb2NrIG9mIHJlYWN0aXZlIERPTS4gIFZpZXdzIGhhdmVcbi8vLyB0aGUgZm9sbG93aW5nIGZlYXR1cmVzOlxuLy8vXG4vLy8gKiBsaWZlY3ljbGUgY2FsbGJhY2tzIC0gVmlld3MgYXJlIGNyZWF0ZWQsIHJlbmRlcmVkLCBhbmQgZGVzdHJveWVkLFxuLy8vICAgYW5kIGNhbGxiYWNrcyBjYW4gYmUgcmVnaXN0ZXJlZCB0byBmaXJlIHdoZW4gdGhlc2UgdGhpbmdzIGhhcHBlbi5cbi8vL1xuLy8vICogcGFyZW50IHBvaW50ZXIgLSBBIFZpZXcgcG9pbnRzIHRvIGl0cyBwYXJlbnRWaWV3LCB3aGljaCBpcyB0aGVcbi8vLyAgIFZpZXcgdGhhdCBjYXVzZWQgaXQgdG8gYmUgcmVuZGVyZWQuICBUaGVzZSBwb2ludGVycyBmb3JtIGFcbi8vLyAgIGhpZXJhcmNoeSBvciB0cmVlIG9mIFZpZXdzLlxuLy8vXG4vLy8gKiByZW5kZXIoKSBtZXRob2QgLSBBIFZpZXcncyByZW5kZXIoKSBtZXRob2Qgc3BlY2lmaWVzIHRoZSBET01cbi8vLyAgIChvciBIVE1MKSBjb250ZW50IG9mIHRoZSBWaWV3LiAgSWYgdGhlIG1ldGhvZCBlc3RhYmxpc2hlc1xuLy8vICAgcmVhY3RpdmUgZGVwZW5kZW5jaWVzLCBpdCBtYXkgYmUgcmUtcnVuLlxuLy8vXG4vLy8gKiBhIERPTVJhbmdlIC0gSWYgYSBWaWV3IGlzIHJlbmRlcmVkIHRvIERPTSwgaXRzIHBvc2l0aW9uIGFuZFxuLy8vICAgZXh0ZW50IGluIHRoZSBET00gYXJlIHRyYWNrZWQgdXNpbmcgYSBET01SYW5nZSBvYmplY3QuXG4vLy9cbi8vLyBXaGVuIGEgVmlldyBpcyBjb25zdHJ1Y3RlZCBieSBjYWxsaW5nIEJsYXplLlZpZXcsIHRoZSBWaWV3IGlzXG4vLy8gbm90IHlldCBjb25zaWRlcmVkIFwiY3JlYXRlZC5cIiAgSXQgZG9lc24ndCBoYXZlIGEgcGFyZW50VmlldyB5ZXQsXG4vLy8gYW5kIG5vIGxvZ2ljIGhhcyBiZWVuIHJ1biB0byBpbml0aWFsaXplIHRoZSBWaWV3LiAgQWxsIHJlYWxcbi8vLyB3b3JrIGlzIGRlZmVycmVkIHVudGlsIGF0IGxlYXN0IGNyZWF0aW9uIHRpbWUsIHdoZW4gdGhlIG9uVmlld0NyZWF0ZWRcbi8vLyBjYWxsYmFja3MgYXJlIGZpcmVkLCB3aGljaCBoYXBwZW5zIHdoZW4gdGhlIFZpZXcgaXMgXCJ1c2VkXCIgaW5cbi8vLyBzb21lIHdheSB0aGF0IHJlcXVpcmVzIGl0IHRvIGJlIHJlbmRlcmVkLlxuLy8vXG4vLy8gLi4ubW9yZSBsaWZlY3ljbGUgc3R1ZmZcbi8vL1xuLy8vIGBuYW1lYCBpcyBhbiBvcHRpb25hbCBzdHJpbmcgdGFnIGlkZW50aWZ5aW5nIHRoZSBWaWV3LiAgVGhlIG9ubHlcbi8vLyB0aW1lIGl0J3MgdXNlZCBpcyB3aGVuIGxvb2tpbmcgaW4gdGhlIFZpZXcgdHJlZSBmb3IgYSBWaWV3IG9mIGFcbi8vLyBwYXJ0aWN1bGFyIG5hbWU7IGZvciBleGFtcGxlLCBkYXRhIGNvbnRleHRzIGFyZSBzdG9yZWQgb24gVmlld3Ncbi8vLyBvZiBuYW1lIFwid2l0aFwiLiAgTmFtZXMgYXJlIGFsc28gdXNlZnVsIHdoZW4gZGVidWdnaW5nLCBzbyBpblxuLy8vIGdlbmVyYWwgaXQncyBnb29kIGZvciBmdW5jdGlvbnMgdGhhdCBjcmVhdGUgVmlld3MgdG8gc2V0IHRoZSBuYW1lLlxuLy8vIFZpZXdzIGFzc29jaWF0ZWQgd2l0aCB0ZW1wbGF0ZXMgaGF2ZSBuYW1lcyBvZiB0aGUgZm9ybSBcIlRlbXBsYXRlLmZvb1wiLlxuaW1wb3J0IHsgSFRNTCB9IGZyb20gJ21ldGVvci9odG1sanMnO1xuXG4vKipcbiAqIEEgYmluZGluZyBpcyBlaXRoZXIgYHVuZGVmaW5lZGAgKHBlbmRpbmcpLCBgeyBlcnJvciB9YCAocmVqZWN0ZWQpLCBvclxuICogYHsgdmFsdWUgfWAgKHJlc29sdmVkKS4gU3luY2hyb25vdXMgdmFsdWVzIGFyZSBpbW1lZGlhdGVseSByZXNvbHZlZCAoaS5lLixcbiAqIGB7IHZhbHVlIH1gIGlzIHVzZWQpLiBUaGUgb3RoZXIgc3RhdGVzIGFyZSByZXNlcnZlZCBmb3IgYXN5bmNocm9ub3VzIGJpbmRpbmdzXG4gKiAoaS5lLiwgdmFsdWVzIHdyYXBwZWQgd2l0aCBgUHJvbWlzZWBzKS5cbiAqIEB0eXBlZGVmIHt7IGVycm9yOiB1bmtub3duIH0gfCB7IHZhbHVlOiB1bmtub3duIH0gfCB1bmRlZmluZWR9IEJpbmRpbmdcbiAqL1xuXG4vKipcbiAqIEBjbGFzc1xuICogQHN1bW1hcnkgQ29uc3RydWN0b3IgZm9yIGEgVmlldywgd2hpY2ggcmVwcmVzZW50cyBhIHJlYWN0aXZlIHJlZ2lvbiBvZiBET00uXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gW25hbWVdIE9wdGlvbmFsLiAgQSBuYW1lIGZvciB0aGlzIHR5cGUgb2YgVmlldy4gIFNlZSBbYHZpZXcubmFtZWBdKCN2aWV3X25hbWUpLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVuZGVyRnVuY3Rpb24gQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS4gIEluIHRoaXMgZnVuY3Rpb24sIGB0aGlzYCBpcyBib3VuZCB0byB0aGUgVmlldy5cbiAqL1xuQmxhemUuVmlldyA9IGZ1bmN0aW9uIChuYW1lLCByZW5kZXIpIHtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBCbGF6ZS5WaWV3KSlcbiAgICAvLyBjYWxsZWQgd2l0aG91dCBgbmV3YFxuICAgIHJldHVybiBuZXcgQmxhemUuVmlldyhuYW1lLCByZW5kZXIpO1xuXG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIG9taXR0ZWQgXCJuYW1lXCIgYXJndW1lbnRcbiAgICByZW5kZXIgPSBuYW1lO1xuICAgIG5hbWUgPSAnJztcbiAgfVxuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLl9yZW5kZXIgPSByZW5kZXI7XG5cbiAgdGhpcy5fY2FsbGJhY2tzID0ge1xuICAgIGNyZWF0ZWQ6IG51bGwsXG4gICAgcmVuZGVyZWQ6IG51bGwsXG4gICAgZGVzdHJveWVkOiBudWxsXG4gIH07XG5cbiAgLy8gU2V0dGluZyBhbGwgcHJvcGVydGllcyBoZXJlIGlzIGdvb2QgZm9yIHJlYWRhYmlsaXR5LFxuICAvLyBhbmQgYWxzbyBtYXkgaGVscCBDaHJvbWUgb3B0aW1pemUgdGhlIGNvZGUgYnkga2VlcGluZ1xuICAvLyB0aGUgVmlldyBvYmplY3QgZnJvbSBjaGFuZ2luZyBzaGFwZSB0b28gbXVjaC5cbiAgdGhpcy5pc0NyZWF0ZWQgPSBmYWxzZTtcbiAgdGhpcy5faXNDcmVhdGVkRm9yRXhwYW5zaW9uID0gZmFsc2U7XG4gIHRoaXMuaXNSZW5kZXJlZCA9IGZhbHNlO1xuICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2U7XG4gIHRoaXMuaXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgdGhpcy5faXNJblJlbmRlciA9IGZhbHNlO1xuICB0aGlzLnBhcmVudFZpZXcgPSBudWxsO1xuICB0aGlzLl9kb21yYW5nZSA9IG51bGw7XG4gIC8vIFRoaXMgZmxhZyBpcyBub3JtYWxseSBzZXQgdG8gZmFsc2UgZXhjZXB0IGZvciB0aGUgY2FzZXMgd2hlbiB2aWV3J3MgcGFyZW50XG4gIC8vIHdhcyBnZW5lcmF0ZWQgYXMgcGFydCBvZiBleHBhbmRpbmcgc29tZSBzeW50YWN0aWMgc3VnYXIgZXhwcmVzc2lvbnMgb3JcbiAgLy8gbWV0aG9kcy5cbiAgLy8gRXguOiBCbGF6ZS5yZW5kZXJXaXRoRGF0YSBpcyBhbiBlcXVpdmFsZW50IHRvIGNyZWF0aW5nIGEgdmlldyB3aXRoIHJlZ3VsYXJcbiAgLy8gQmxhemUucmVuZGVyIGFuZCB3cmFwcGluZyBpdCBpbnRvIHt7I3dpdGggZGF0YX19e3svd2l0aH19IHZpZXcuIFNpbmNlIHRoZVxuICAvLyB1c2VycyBkb24ndCBrbm93IGFueXRoaW5nIGFib3V0IHRoZXNlIGdlbmVyYXRlZCBwYXJlbnQgdmlld3MsIEJsYXplIG5lZWRzXG4gIC8vIHRoaXMgaW5mb3JtYXRpb24gdG8gYmUgYXZhaWxhYmxlIG9uIHZpZXdzIHRvIG1ha2Ugc21hcnRlciBkZWNpc2lvbnMuIEZvclxuICAvLyBleGFtcGxlOiByZW1vdmluZyB0aGUgZ2VuZXJhdGVkIHBhcmVudCB2aWV3IHdpdGggdGhlIHZpZXcgb24gQmxhemUucmVtb3ZlLlxuICB0aGlzLl9oYXNHZW5lcmF0ZWRQYXJlbnQgPSBmYWxzZTtcbiAgLy8gQmluZGluZ3MgYWNjZXNzaWJsZSB0byBjaGlsZHJlbiB2aWV3cyAodmlhIHZpZXcubG9va3VwKCduYW1lJykpIHdpdGhpbiB0aGVcbiAgLy8gY2xvc2VzdCB0ZW1wbGF0ZSB2aWV3LlxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIFJlYWN0aXZlVmFyPEJpbmRpbmc+Pn0gKi9cbiAgdGhpcy5fc2NvcGVCaW5kaW5ncyA9IHt9O1xuXG4gIHRoaXMucmVuZGVyQ291bnQgPSAwO1xufTtcblxuQmxhemUuVmlldy5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG51bGw7IH07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLm9uVmlld0NyZWF0ZWQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgdGhpcy5fY2FsbGJhY2tzLmNyZWF0ZWQgPSB0aGlzLl9jYWxsYmFja3MuY3JlYXRlZCB8fCBbXTtcbiAgdGhpcy5fY2FsbGJhY2tzLmNyZWF0ZWQucHVzaChjYik7XG59O1xuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5fb25WaWV3UmVuZGVyZWQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgdGhpcy5fY2FsbGJhY2tzLnJlbmRlcmVkID0gdGhpcy5fY2FsbGJhY2tzLnJlbmRlcmVkIHx8IFtdO1xuICB0aGlzLl9jYWxsYmFja3MucmVuZGVyZWQucHVzaChjYik7XG59O1xuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5vblZpZXdSZWFkeSA9IGZ1bmN0aW9uIChjYikge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgY29uc3QgZmlyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBUcmFja2VyLmFmdGVyRmx1c2goZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCEgc2VsZi5pc0Rlc3Ryb3llZCkge1xuICAgICAgICBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHNlbGYsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjYi5jYWxsKHNlbGYpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgc2VsZi5fb25WaWV3UmVuZGVyZWQoZnVuY3Rpb24gb25WaWV3UmVuZGVyZWQoKSB7XG4gICAgaWYgKHNlbGYuaXNEZXN0cm95ZWQpXG4gICAgICByZXR1cm47XG4gICAgaWYgKCEgc2VsZi5fZG9tcmFuZ2UuYXR0YWNoZWQpXG4gICAgICBzZWxmLl9kb21yYW5nZS5vbkF0dGFjaGVkKGZpcmUpO1xuICAgIGVsc2VcbiAgICAgIGZpcmUoKTtcbiAgfSk7XG59O1xuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5vblZpZXdEZXN0cm95ZWQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgdGhpcy5fY2FsbGJhY2tzLmRlc3Ryb3llZCA9IHRoaXMuX2NhbGxiYWNrcy5kZXN0cm95ZWQgfHwgW107XG4gIHRoaXMuX2NhbGxiYWNrcy5kZXN0cm95ZWQucHVzaChjYik7XG59O1xuQmxhemUuVmlldy5wcm90b3R5cGUucmVtb3ZlVmlld0Rlc3Ryb3llZExpc3RlbmVyID0gZnVuY3Rpb24gKGNiKSB7XG4gIGNvbnN0IGRlc3Ryb3llZCA9IHRoaXMuX2NhbGxiYWNrcy5kZXN0cm95ZWQ7XG4gIGlmICghIGRlc3Ryb3llZClcbiAgICByZXR1cm47XG4gIGNvbnN0IGluZGV4ID0gZGVzdHJveWVkLmxhc3RJbmRleE9mKGNiKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIC8vIFhYWCBZb3UnZCB0aGluayB0aGUgcmlnaHQgdGhpbmcgdG8gZG8gd291bGQgYmUgc3BsaWNlLCBidXQgX2ZpcmVDYWxsYmFja3NcbiAgICAvLyBnZXRzIHNhZCBpZiB5b3UgcmVtb3ZlIGNhbGxiYWNrcyB3aGlsZSBpdGVyYXRpbmcgb3ZlciB0aGUgbGlzdC4gIFNob3VsZFxuICAgIC8vIGNoYW5nZSB0aGlzIHRvIHVzZSBjYWxsYmFjay1ob29rIG9yIEV2ZW50RW1pdHRlciBvciBzb21ldGhpbmcgZWxzZSB0aGF0XG4gICAgLy8gcHJvcGVybHkgc3VwcG9ydHMgcmVtb3ZhbC5cbiAgICBkZXN0cm95ZWRbaW5kZXhdID0gbnVsbDtcbiAgfVxufTtcblxuLy8vIFZpZXcjYXV0b3J1bihmdW5jKVxuLy8vXG4vLy8gU2V0cyB1cCBhIFRyYWNrZXIgYXV0b3J1biB0aGF0IGlzIFwic2NvcGVkXCIgdG8gdGhpcyBWaWV3IGluIHR3b1xuLy8vIGltcG9ydGFudCB3YXlzOiAxKSBCbGF6ZS5jdXJyZW50VmlldyBpcyBhdXRvbWF0aWNhbGx5IHNldFxuLy8vIG9uIGV2ZXJ5IHJlLXJ1biwgYW5kIDIpIHRoZSBhdXRvcnVuIGlzIHN0b3BwZWQgd2hlbiB0aGVcbi8vLyBWaWV3IGlzIGRlc3Ryb3llZC4gIEFzIHdpdGggVHJhY2tlci5hdXRvcnVuLCB0aGUgZmlyc3QgcnVuIG9mXG4vLy8gdGhlIGZ1bmN0aW9uIGlzIGltbWVkaWF0ZSwgYW5kIGEgQ29tcHV0YXRpb24gb2JqZWN0IHRoYXQgY2FuXG4vLy8gYmUgdXNlZCB0byBzdG9wIHRoZSBhdXRvcnVuIGlzIHJldHVybmVkLlxuLy8vXG4vLy8gVmlldyNhdXRvcnVuIGlzIG1lYW50IHRvIGJlIGNhbGxlZCBmcm9tIFZpZXcgY2FsbGJhY2tzIGxpa2Vcbi8vLyBvblZpZXdDcmVhdGVkLCBvciBmcm9tIG91dHNpZGUgdGhlIHJlbmRlcmluZyBwcm9jZXNzLiAgSXQgbWF5IG5vdFxuLy8vIGJlIGNhbGxlZCBiZWZvcmUgdGhlIG9uVmlld0NyZWF0ZWQgY2FsbGJhY2tzIGFyZSBmaXJlZCAodG9vIGVhcmx5KSxcbi8vLyBvciBmcm9tIGEgcmVuZGVyKCkgbWV0aG9kICh0b28gY29uZnVzaW5nKS5cbi8vL1xuLy8vIFR5cGljYWxseSwgYXV0b3J1bnMgdGhhdCB1cGRhdGUgdGhlIHN0YXRlXG4vLy8gb2YgdGhlIFZpZXcgKGFzIGluIEJsYXplLldpdGgpIHNob3VsZCBiZSBzdGFydGVkIGZyb20gYW4gb25WaWV3Q3JlYXRlZFxuLy8vIGNhbGxiYWNrLiAgQXV0b3J1bnMgdGhhdCB1cGRhdGUgdGhlIERPTSBzaG91bGQgYmUgc3RhcnRlZFxuLy8vIGZyb20gZWl0aGVyIG9uVmlld0NyZWF0ZWQgKGd1YXJkZWQgYWdhaW5zdCB0aGUgYWJzZW5jZSBvZlxuLy8vIHZpZXcuX2RvbXJhbmdlKSwgb3Igb25WaWV3UmVhZHkuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5hdXRvcnVuID0gZnVuY3Rpb24gKGYsIF9pblZpZXdTY29wZSwgZGlzcGxheU5hbWUpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gVGhlIHJlc3RyaWN0aW9ucyBvbiB3aGVuIFZpZXcjYXV0b3J1biBjYW4gYmUgY2FsbGVkIGFyZSBpbiBvcmRlclxuICAvLyB0byBhdm9pZCBiYWQgcGF0dGVybnMsIGxpa2UgY3JlYXRpbmcgYSBCbGF6ZS5WaWV3IGFuZCBpbW1lZGlhdGVseVxuICAvLyBjYWxsaW5nIGF1dG9ydW4gb24gaXQuICBBIGZyZXNobHkgY3JlYXRlZCBWaWV3IGlzIG5vdCByZWFkeSB0b1xuICAvLyBoYXZlIGxvZ2ljIHJ1biBvbiBpdDsgaXQgZG9lc24ndCBoYXZlIGEgcGFyZW50VmlldywgZm9yIGV4YW1wbGUuXG4gIC8vIEl0J3Mgd2hlbiB0aGUgVmlldyBpcyBtYXRlcmlhbGl6ZWQgb3IgZXhwYW5kZWQgdGhhdCB0aGUgb25WaWV3Q3JlYXRlZFxuICAvLyBoYW5kbGVycyBhcmUgZmlyZWQgYW5kIHRoZSBWaWV3IHN0YXJ0cyB1cC5cbiAgLy9cbiAgLy8gTGV0dGluZyB0aGUgcmVuZGVyKCkgbWV0aG9kIGNhbGwgYHRoaXMuYXV0b3J1bigpYCBpcyBwcm9ibGVtYXRpY1xuICAvLyBiZWNhdXNlIG9mIHJlLXJlbmRlci4gIFRoZSBiZXN0IHdlIGNhbiBkbyBpcyB0byBzdG9wIHRoZSBvbGRcbiAgLy8gYXV0b3J1biBhbmQgc3RhcnQgYSBuZXcgb25lIGZvciBlYWNoIHJlbmRlciwgYnV0IHRoYXQncyBhIHBhdHRlcm5cbiAgLy8gd2UgdHJ5IHRvIGF2b2lkIGludGVybmFsbHkgYmVjYXVzZSBpdCBsZWFkcyB0byBoZWxwZXJzIGJlaW5nXG4gIC8vIGNhbGxlZCBleHRyYSB0aW1lcywgaW4gdGhlIGNhc2Ugd2hlcmUgdGhlIGF1dG9ydW4gY2F1c2VzIHRoZVxuICAvLyB2aWV3IHRvIHJlLXJlbmRlciAoYW5kIHRodXMgdGhlIGF1dG9ydW4gdG8gYmUgdG9ybiBkb3duIGFuZCBhXG4gIC8vIG5ldyBvbmUgZXN0YWJsaXNoZWQpLlxuICAvL1xuICAvLyBXZSBjb3VsZCBsaWZ0IHRoZXNlIHJlc3RyaWN0aW9ucyBpbiB2YXJpb3VzIHdheXMuICBPbmUgaW50ZXJlc3RpbmdcbiAgLy8gaWRlYSBpcyB0byBhbGxvdyB5b3UgdG8gY2FsbCBgdmlldy5hdXRvcnVuYCBhZnRlciBpbnN0YW50aWF0aW5nXG4gIC8vIGB2aWV3YCwgYW5kIGF1dG9tYXRpY2FsbHkgd3JhcCBpdCBpbiBgdmlldy5vblZpZXdDcmVhdGVkYCwgZGVmZXJyaW5nXG4gIC8vIHRoZSBhdXRvcnVuIHNvIHRoYXQgaXQgc3RhcnRzIGF0IGFuIGFwcHJvcHJpYXRlIHRpbWUuICBIb3dldmVyLFxuICAvLyB0aGVuIHdlIGNhbid0IHJldHVybiB0aGUgQ29tcHV0YXRpb24gb2JqZWN0IHRvIHRoZSBjYWxsZXIsIGJlY2F1c2VcbiAgLy8gaXQgZG9lc24ndCBleGlzdCB5ZXQuXG4gIGlmICghIHNlbGYuaXNDcmVhdGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVmlldyNhdXRvcnVuIG11c3QgYmUgY2FsbGVkIGZyb20gdGhlIGNyZWF0ZWQgY2FsbGJhY2sgYXQgdGhlIGVhcmxpZXN0XCIpO1xuICB9XG4gIGlmICh0aGlzLl9pc0luUmVuZGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBWaWV3I2F1dG9ydW4gZnJvbSBpbnNpZGUgcmVuZGVyKCk7IHRyeSBjYWxsaW5nIGl0IGZyb20gdGhlIGNyZWF0ZWQgb3IgcmVuZGVyZWQgY2FsbGJhY2tcIik7XG4gIH1cblxuICBjb25zdCB0ZW1wbGF0ZUluc3RhbmNlRnVuYyA9IEJsYXplLlRlbXBsYXRlLl9jdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmM7XG5cbiAgY29uc3QgZnVuYyA9IGZ1bmN0aW9uIHZpZXdBdXRvcnVuKGMpIHtcbiAgICByZXR1cm4gQmxhemUuX3dpdGhDdXJyZW50VmlldyhfaW5WaWV3U2NvcGUgfHwgc2VsZiwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEJsYXplLlRlbXBsYXRlLl93aXRoVGVtcGxhdGVJbnN0YW5jZUZ1bmMoXG4gICAgICAgIHRlbXBsYXRlSW5zdGFuY2VGdW5jLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGYuY2FsbChzZWxmLCBjKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2l2ZSB0aGUgYXV0b3J1biBmdW5jdGlvbiBhIGJldHRlciBuYW1lIGZvciBkZWJ1Z2dpbmcgYW5kIHByb2ZpbGluZy5cbiAgLy8gVGhlIGBkaXNwbGF5TmFtZWAgcHJvcGVydHkgaXMgbm90IHBhcnQgb2YgdGhlIHNwZWMgYnV0IGJyb3dzZXJzIGxpa2UgQ2hyb21lXG4gIC8vIGFuZCBGaXJlZm94IHByZWZlciBpdCBpbiBkZWJ1Z2dlcnMgb3ZlciB0aGUgbmFtZSBmdW5jdGlvbiB3YXMgZGVjbGFyZWQgYnkuXG4gIGZ1bmMuZGlzcGxheU5hbWUgPVxuICAgIChzZWxmLm5hbWUgfHwgJ2Fub255bW91cycpICsgJzonICsgKGRpc3BsYXlOYW1lIHx8ICdhbm9ueW1vdXMnKTtcbiAgY29uc3QgY29tcCA9IFRyYWNrZXIuYXV0b3J1bihmdW5jKTtcblxuICBjb25zdCBzdG9wQ29tcHV0YXRpb24gPSBmdW5jdGlvbiAoKSB7IGNvbXAuc3RvcCgpOyB9O1xuICBzZWxmLm9uVmlld0Rlc3Ryb3llZChzdG9wQ29tcHV0YXRpb24pO1xuICBjb21wLm9uU3RvcChmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5yZW1vdmVWaWV3RGVzdHJveWVkTGlzdGVuZXIoc3RvcENvbXB1dGF0aW9uKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbXA7XG59O1xuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5fZXJyb3JJZlNob3VsZG50Q2FsbFN1YnNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCEgc2VsZi5pc0NyZWF0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWaWV3I3N1YnNjcmliZSBtdXN0IGJlIGNhbGxlZCBmcm9tIHRoZSBjcmVhdGVkIGNhbGxiYWNrIGF0IHRoZSBlYXJsaWVzdFwiKTtcbiAgfVxuICBpZiAoc2VsZi5faXNJblJlbmRlcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNhbGwgVmlldyNzdWJzY3JpYmUgZnJvbSBpbnNpZGUgcmVuZGVyKCk7IHRyeSBjYWxsaW5nIGl0IGZyb20gdGhlIGNyZWF0ZWQgb3IgcmVuZGVyZWQgY2FsbGJhY2tcIik7XG4gIH1cbiAgaWYgKHNlbGYuaXNEZXN0cm95ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIFZpZXcjc3Vic2NyaWJlIGZyb20gaW5zaWRlIHRoZSBkZXN0cm95ZWQgY2FsbGJhY2ssIHRyeSBjYWxsaW5nIGl0IGluc2lkZSBjcmVhdGVkIG9yIHJlbmRlcmVkLlwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBKdXN0IGxpa2UgQmxhemUuVmlldyNhdXRvcnVuLCBidXQgd2l0aCBNZXRlb3Iuc3Vic2NyaWJlIGluc3RlYWQgb2ZcbiAqIFRyYWNrZXIuYXV0b3J1bi4gU3RvcCB0aGUgc3Vic2NyaXB0aW9uIHdoZW4gdGhlIHZpZXcgaXMgZGVzdHJveWVkLlxuICogQHJldHVybiB7U3Vic2NyaXB0aW9uSGFuZGxlfSBBIGhhbmRsZSB0byB0aGUgc3Vic2NyaXB0aW9uIHNvIHRoYXQgeW91IGNhblxuICogc2VlIGlmIGl0IGlzIHJlYWR5LCBvciBzdG9wIGl0IG1hbnVhbGx5XG4gKi9cbkJsYXplLlZpZXcucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChhcmdzLCBvcHRpb25zKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBzZWxmLl9lcnJvcklmU2hvdWxkbnRDYWxsU3Vic2NyaWJlKCk7XG5cbiAgbGV0IHN1YkhhbmRsZTtcbiAgaWYgKG9wdGlvbnMuY29ubmVjdGlvbikge1xuICAgIHN1YkhhbmRsZSA9IG9wdGlvbnMuY29ubmVjdGlvbi5zdWJzY3JpYmUuYXBwbHkob3B0aW9ucy5jb25uZWN0aW9uLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBzdWJIYW5kbGUgPSBNZXRlb3Iuc3Vic2NyaWJlLmFwcGx5KE1ldGVvciwgYXJncyk7XG4gIH1cblxuICBzZWxmLm9uVmlld0Rlc3Ryb3llZChmdW5jdGlvbiAoKSB7XG4gICAgc3ViSGFuZGxlLnN0b3AoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHN1YkhhbmRsZTtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLmZpcnN0Tm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCEgdGhpcy5faXNBdHRhY2hlZClcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWaWV3IG11c3QgYmUgYXR0YWNoZWQgYmVmb3JlIGFjY2Vzc2luZyBpdHMgRE9NXCIpO1xuXG4gIHJldHVybiB0aGlzLl9kb21yYW5nZS5maXJzdE5vZGUoKTtcbn07XG5cbkJsYXplLlZpZXcucHJvdG90eXBlLmxhc3ROb2RlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoISB0aGlzLl9pc0F0dGFjaGVkKVxuICAgIHRocm93IG5ldyBFcnJvcihcIlZpZXcgbXVzdCBiZSBhdHRhY2hlZCBiZWZvcmUgYWNjZXNzaW5nIGl0cyBET01cIik7XG5cbiAgcmV0dXJuIHRoaXMuX2RvbXJhbmdlLmxhc3ROb2RlKCk7XG59O1xuXG5CbGF6ZS5fZmlyZUNhbGxiYWNrcyA9IGZ1bmN0aW9uICh2aWV3LCB3aGljaCkge1xuICBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHZpZXcsIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uIGZpcmVDYWxsYmFja3MoKSB7XG4gICAgICBjb25zdCBjYnMgPSB2aWV3Ll9jYWxsYmFja3Nbd2hpY2hdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIE4gPSAoY2JzICYmIGNicy5sZW5ndGgpOyBpIDwgTjsgaSsrKVxuICAgICAgICBjYnNbaV0gJiYgY2JzW2ldLmNhbGwodmlldyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuQmxhemUuX2NyZWF0ZVZpZXcgPSBmdW5jdGlvbiAodmlldywgcGFyZW50VmlldywgZm9yRXhwYW5zaW9uKSB7XG4gIGlmICh2aWV3LmlzQ3JlYXRlZClcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZW5kZXIgdGhlIHNhbWUgVmlldyB0d2ljZVwiKTtcblxuICB2aWV3LnBhcmVudFZpZXcgPSAocGFyZW50VmlldyB8fCBudWxsKTtcbiAgdmlldy5pc0NyZWF0ZWQgPSB0cnVlO1xuICBpZiAoZm9yRXhwYW5zaW9uKVxuICAgIHZpZXcuX2lzQ3JlYXRlZEZvckV4cGFuc2lvbiA9IHRydWU7XG5cbiAgQmxhemUuX2ZpcmVDYWxsYmFja3ModmlldywgJ2NyZWF0ZWQnKTtcbn07XG5cbmNvbnN0IGRvRmlyc3RSZW5kZXIgPSBmdW5jdGlvbiAodmlldywgaW5pdGlhbENvbnRlbnQpIHtcbiAgY29uc3QgZG9tcmFuZ2UgPSBuZXcgQmxhemUuX0RPTVJhbmdlKGluaXRpYWxDb250ZW50KTtcbiAgdmlldy5fZG9tcmFuZ2UgPSBkb21yYW5nZTtcbiAgZG9tcmFuZ2UudmlldyA9IHZpZXc7XG4gIHZpZXcuaXNSZW5kZXJlZCA9IHRydWU7XG4gIEJsYXplLl9maXJlQ2FsbGJhY2tzKHZpZXcsICdyZW5kZXJlZCcpO1xuXG4gIGxldCB0ZWFyZG93bkhvb2sgPSBudWxsO1xuXG4gIGRvbXJhbmdlLm9uQXR0YWNoZWQoZnVuY3Rpb24gYXR0YWNoZWQocmFuZ2UsIGVsZW1lbnQpIHtcbiAgICB2aWV3Ll9pc0F0dGFjaGVkID0gdHJ1ZTtcblxuICAgIHRlYXJkb3duSG9vayA9IEJsYXplLl9ET01CYWNrZW5kLlRlYXJkb3duLm9uRWxlbWVudFRlYXJkb3duKFxuICAgICAgZWxlbWVudCwgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgICAgIEJsYXplLl9kZXN0cm95Vmlldyh2aWV3LCB0cnVlIC8qIF9za2lwTm9kZXMgKi8pO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vIHRlYXIgZG93biB0aGUgdGVhcmRvd24gaG9va1xuICB2aWV3Lm9uVmlld0Rlc3Ryb3llZChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRlYXJkb3duSG9vaykgdGVhcmRvd25Ib29rLnN0b3AoKTtcbiAgICB0ZWFyZG93bkhvb2sgPSBudWxsO1xuICB9KTtcblxuICByZXR1cm4gZG9tcmFuZ2U7XG59O1xuXG4vLyBUYWtlIGFuIHVuY3JlYXRlZCBWaWV3IGB2aWV3YCBhbmQgY3JlYXRlIGFuZCByZW5kZXIgaXQgdG8gRE9NLFxuLy8gc2V0dGluZyB1cCB0aGUgYXV0b3J1biB0aGF0IHVwZGF0ZXMgdGhlIFZpZXcuICBSZXR1cm5zIGEgbmV3XG4vLyBET01SYW5nZSwgd2hpY2ggaGFzIGJlZW4gYXNzb2NpYXRlZCB3aXRoIHRoZSBWaWV3LlxuLy9cbi8vIFRoZSBwcml2YXRlIGFyZ3VtZW50cyBgX3dvcmtTdGFja2AgYW5kIGBfaW50b0FycmF5YCBhcmUgcGFzc2VkIGluXG4vLyBieSBCbGF6ZS5fbWF0ZXJpYWxpemVET00gYW5kIGFyZSBvbmx5IHByZXNlbnQgZm9yIHJlY3Vyc2l2ZSBjYWxsc1xuLy8gKHdoZW4gdGhlcmUgaXMgc29tZSBvdGhlciBfbWF0ZXJpYWxpemVWaWV3IG9uIHRoZSBzdGFjaykuICBJZlxuLy8gcHJvdmlkZWQsIHRoZW4gd2UgYXZvaWQgdGhlIG11dHVhbCByZWN1cnNpb24gb2YgY2FsbGluZyBiYWNrIGludG9cbi8vIEJsYXplLl9tYXRlcmlhbGl6ZURPTSBzbyB0aGF0IGRlZXAgVmlldyBoaWVyYXJjaGllcyBkb24ndCBibG93IHRoZVxuLy8gc3RhY2suICBJbnN0ZWFkLCB3ZSBwdXNoIHRhc2tzIG9udG8gd29ya1N0YWNrIGZvciB0aGUgaW5pdGlhbFxuLy8gcmVuZGVyaW5nIGFuZCBzdWJzZXF1ZW50IHNldHVwIG9mIHRoZSBWaWV3LCBhbmQgdGhleSBhcmUgZG9uZSBhZnRlclxuLy8gd2UgcmV0dXJuLiAgV2hlbiB0aGVyZSBpcyBhIF93b3JrU3RhY2ssIHdlIGRvIG5vdCByZXR1cm4gdGhlIG5ld1xuLy8gRE9NUmFuZ2UsIGJ1dCBpbnN0ZWFkIHB1c2ggaXQgaW50byBfaW50b0FycmF5IGZyb20gYSBfd29ya1N0YWNrXG4vLyB0YXNrLlxuQmxhemUuX21hdGVyaWFsaXplVmlldyA9IGZ1bmN0aW9uICh2aWV3LCBwYXJlbnRWaWV3LCBfd29ya1N0YWNrLCBfaW50b0FycmF5KSB7XG4gIEJsYXplLl9jcmVhdGVWaWV3KHZpZXcsIHBhcmVudFZpZXcpO1xuXG4gIGxldCBkb21yYW5nZTtcbiAgbGV0IGxhc3RIdG1sanM7XG4gIC8vIFdlIGRvbid0IGV4cGVjdCB0byBiZSBjYWxsZWQgaW4gYSBDb21wdXRhdGlvbiwgYnV0IGp1c3QgaW4gY2FzZSxcbiAgLy8gd3JhcCBpbiBUcmFja2VyLm5vbnJlYWN0aXZlLlxuICBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uICgpIHtcbiAgICB2aWV3LmF1dG9ydW4oZnVuY3Rpb24gZG9SZW5kZXIoYykge1xuICAgICAgLy8gYHZpZXcuYXV0b3J1bmAgc2V0cyB0aGUgY3VycmVudCB2aWV3LlxuICAgICAgdmlldy5yZW5kZXJDb3VudCA9IHZpZXcucmVuZGVyQ291bnQgKyAxO1xuICAgICAgdmlldy5faXNJblJlbmRlciA9IHRydWU7XG4gICAgICAvLyBBbnkgZGVwZW5kZW5jaWVzIHRoYXQgc2hvdWxkIGludmFsaWRhdGUgdGhpcyBDb21wdXRhdGlvbiBjb21lXG4gICAgICAvLyBmcm9tIHRoaXMgbGluZTpcbiAgICAgIGNvbnN0IGh0bWxqcyA9IHZpZXcuX3JlbmRlcigpO1xuICAgICAgdmlldy5faXNJblJlbmRlciA9IGZhbHNlO1xuXG4gICAgICBpZiAoISBjLmZpcnN0UnVuICYmICEgQmxhemUuX2lzQ29udGVudEVxdWFsKGxhc3RIdG1sanMsIGh0bWxqcykpIHtcbiAgICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiBkb01hdGVyaWFsaXplKCkge1xuICAgICAgICAgIC8vIHJlLXJlbmRlclxuICAgICAgICAgIGNvbnN0IHJhbmdlc0FuZE5vZGVzID0gQmxhemUuX21hdGVyaWFsaXplRE9NKGh0bWxqcywgW10sIHZpZXcpO1xuICAgICAgICAgIGRvbXJhbmdlLnNldE1lbWJlcnMocmFuZ2VzQW5kTm9kZXMpO1xuICAgICAgICAgIEJsYXplLl9maXJlQ2FsbGJhY2tzKHZpZXcsICdyZW5kZXJlZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGxhc3RIdG1sanMgPSBodG1sanM7XG5cbiAgICAgIC8vIENhdXNlcyBhbnkgbmVzdGVkIHZpZXdzIHRvIHN0b3AgaW1tZWRpYXRlbHksIG5vdCB3aGVuIHdlIGNhbGxcbiAgICAgIC8vIGBzZXRNZW1iZXJzYCB0aGUgbmV4dCB0aW1lIGFyb3VuZCB0aGUgYXV0b3J1bi4gIE90aGVyd2lzZSxcbiAgICAgIC8vIGhlbHBlcnMgaW4gdGhlIERPTSB0cmVlIHRvIGJlIHJlcGxhY2VkIG1pZ2h0IGJlIHNjaGVkdWxlZFxuICAgICAgLy8gdG8gcmUtcnVuIGJlZm9yZSB3ZSBoYXZlIGEgY2hhbmNlIHRvIHN0b3AgdGhlbS5cbiAgICAgIFRyYWNrZXIub25JbnZhbGlkYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRvbXJhbmdlKSB7XG4gICAgICAgICAgZG9tcmFuZ2UuZGVzdHJveU1lbWJlcnMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgdW5kZWZpbmVkLCAnbWF0ZXJpYWxpemUnKTtcblxuICAgIC8vIGZpcnN0IHJlbmRlci4gIGxhc3RIdG1sanMgaXMgdGhlIGZpcnN0IGh0bWxqcy5cbiAgICBsZXQgaW5pdGlhbENvbnRlbnRzO1xuICAgIGlmICghIF93b3JrU3RhY2spIHtcbiAgICAgIGluaXRpYWxDb250ZW50cyA9IEJsYXplLl9tYXRlcmlhbGl6ZURPTShsYXN0SHRtbGpzLCBbXSwgdmlldyk7XG4gICAgICBkb21yYW5nZSA9IGRvRmlyc3RSZW5kZXIodmlldywgaW5pdGlhbENvbnRlbnRzKTtcbiAgICAgIGluaXRpYWxDb250ZW50cyA9IG51bGw7IC8vIGhlbHAgR0MgYmVjYXVzZSB3ZSBjbG9zZSBvdmVyIHRoaXMgc2NvcGUgYSBsb3RcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UncmUgYmVpbmcgY2FsbGVkIGZyb20gQmxhemUuX21hdGVyaWFsaXplRE9NLCBzbyB0byBhdm9pZFxuICAgICAgLy8gcmVjdXJzaW9uIGFuZCBzYXZlIHN0YWNrIHNwYWNlLCBwcm92aWRlIGEgZGVzY3JpcHRpb24gb2YgdGhlXG4gICAgICAvLyB3b3JrIHRvIGJlIGRvbmUgaW5zdGVhZCBvZiBkb2luZyBpdC4gIFRhc2tzIHB1c2hlZCBvbnRvXG4gICAgICAvLyBfd29ya1N0YWNrIHdpbGwgYmUgZG9uZSBpbiBMSUZPIG9yZGVyIGFmdGVyIHdlIHJldHVybi5cbiAgICAgIC8vIFRoZSB3b3JrIHdpbGwgc3RpbGwgYmUgZG9uZSB3aXRoaW4gYSBUcmFja2VyLm5vbnJlYWN0aXZlLFxuICAgICAgLy8gYmVjYXVzZSBpdCB3aWxsIGJlIGRvbmUgYnkgc29tZSBjYWxsIHRvIEJsYXplLl9tYXRlcmlhbGl6ZURPTVxuICAgICAgLy8gKHdoaWNoIGlzIGFsd2F5cyBjYWxsZWQgaW4gYSBUcmFja2VyLm5vbnJlYWN0aXZlKS5cbiAgICAgIGluaXRpYWxDb250ZW50cyA9IFtdO1xuICAgICAgLy8gcHVzaCB0aGlzIGZ1bmN0aW9uIGZpcnN0IHNvIHRoYXQgaXQgaGFwcGVucyBsYXN0XG4gICAgICBfd29ya1N0YWNrLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICBkb21yYW5nZSA9IGRvRmlyc3RSZW5kZXIodmlldywgaW5pdGlhbENvbnRlbnRzKTtcbiAgICAgICAgaW5pdGlhbENvbnRlbnRzID0gbnVsbDsgLy8gaGVscCBHQyBiZWNhdXNlIG9mIGFsbCB0aGUgY2xvc3VyZXMgaGVyZVxuICAgICAgICBfaW50b0FycmF5LnB1c2goZG9tcmFuZ2UpO1xuICAgICAgfSk7XG4gICAgICAvLyBub3cgcHVzaCB0aGUgdGFzayB0aGF0IGNhbGN1bGF0ZXMgaW5pdGlhbENvbnRlbnRzXG4gICAgICBfd29ya1N0YWNrLnB1c2goQmxhemUuX2JpbmQoQmxhemUuX21hdGVyaWFsaXplRE9NLCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0SHRtbGpzLCBpbml0aWFsQ29udGVudHMsIHZpZXcsIF93b3JrU3RhY2spKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghIF93b3JrU3RhY2spIHtcbiAgICByZXR1cm4gZG9tcmFuZ2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbi8vIEV4cGFuZHMgYSBWaWV3IHRvIEhUTUxqcywgY2FsbGluZyBgcmVuZGVyYCByZWN1cnNpdmVseSBvbiBhbGxcbi8vIFZpZXdzIGFuZCBldmFsdWF0aW5nIGFueSBkeW5hbWljIGF0dHJpYnV0ZXMuICBDYWxscyB0aGUgYGNyZWF0ZWRgXG4vLyBjYWxsYmFjaywgYnV0IG5vdCB0aGUgYG1hdGVyaWFsaXplZGAgb3IgYHJlbmRlcmVkYCBjYWxsYmFja3MuXG4vLyBEZXN0cm95cyB0aGUgdmlldyBpbW1lZGlhdGVseSwgdW5sZXNzIGNhbGxlZCBpbiBhIFRyYWNrZXIgQ29tcHV0YXRpb24sXG4vLyBpbiB3aGljaCBjYXNlIHRoZSB2aWV3IHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gdGhlIENvbXB1dGF0aW9uIGlzXG4vLyBpbnZhbGlkYXRlZC4gIElmIGNhbGxlZCBpbiBhIFRyYWNrZXIgQ29tcHV0YXRpb24sIHRoZSByZXN1bHQgaXMgYVxuLy8gcmVhY3RpdmUgc3RyaW5nOyB0aGF0IGlzLCB0aGUgQ29tcHV0YXRpb24gd2lsbCBiZSBpbnZhbGlkYXRlZFxuLy8gaWYgYW55IGNoYW5nZXMgYXJlIG1hZGUgdG8gdGhlIHZpZXcgb3Igc3Vidmlld3MgdGhhdCBtaWdodCBhZmZlY3Rcbi8vIHRoZSBIVE1MLlxuQmxhemUuX2V4cGFuZFZpZXcgPSBmdW5jdGlvbiAodmlldywgcGFyZW50Vmlldykge1xuICBCbGF6ZS5fY3JlYXRlVmlldyh2aWV3LCBwYXJlbnRWaWV3LCB0cnVlIC8qZm9yRXhwYW5zaW9uKi8pO1xuXG4gIHZpZXcuX2lzSW5SZW5kZXIgPSB0cnVlO1xuICBjb25zdCBodG1sanMgPSBCbGF6ZS5fd2l0aEN1cnJlbnRWaWV3KHZpZXcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdmlldy5fcmVuZGVyKCk7XG4gIH0pO1xuICB2aWV3Ll9pc0luUmVuZGVyID0gZmFsc2U7XG5cbiAgY29uc3QgcmVzdWx0ID0gQmxhemUuX2V4cGFuZChodG1sanMsIHZpZXcpO1xuXG4gIGlmIChUcmFja2VyLmFjdGl2ZSkge1xuICAgIFRyYWNrZXIub25JbnZhbGlkYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgIEJsYXplLl9kZXN0cm95Vmlldyh2aWV3KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBCbGF6ZS5fZGVzdHJveVZpZXcodmlldyk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gT3B0aW9uczogYHBhcmVudFZpZXdgXG5CbGF6ZS5fSFRNTEpTRXhwYW5kZXIgPSBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IuZXh0ZW5kKCk7XG5CbGF6ZS5fSFRNTEpTRXhwYW5kZXIuZGVmKHtcbiAgdmlzaXRPYmplY3Q6IGZ1bmN0aW9uICh4KSB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSlcbiAgICAgIHggPSB4LmNvbnN0cnVjdFZpZXcoKTtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEJsYXplLlZpZXcpXG4gICAgICByZXR1cm4gQmxhemUuX2V4cGFuZFZpZXcoeCwgdGhpcy5wYXJlbnRWaWV3KTtcblxuICAgIC8vIHRoaXMgd2lsbCB0aHJvdyBhbiBlcnJvcjsgb3RoZXIgb2JqZWN0cyBhcmUgbm90IGFsbG93ZWQhXG4gICAgcmV0dXJuIEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5wcm90b3R5cGUudmlzaXRPYmplY3QuY2FsbCh0aGlzLCB4KTtcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMpIHtcbiAgICAvLyBleHBhbmQgZHluYW1pYyBhdHRyaWJ1dGVzXG4gICAgaWYgKHR5cGVvZiBhdHRycyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIGF0dHJzID0gQmxhemUuX3dpdGhDdXJyZW50Vmlldyh0aGlzLnBhcmVudFZpZXcsIGF0dHJzKTtcblxuICAgIC8vIGNhbGwgc3VwZXIgKGUuZy4gZm9yIGNhc2Ugd2hlcmUgYGF0dHJzYCBpcyBhbiBhcnJheSlcbiAgICByZXR1cm4gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLnByb3RvdHlwZS52aXNpdEF0dHJpYnV0ZXMuY2FsbCh0aGlzLCBhdHRycyk7XG4gIH0sXG4gIHZpc2l0QXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHRhZykge1xuICAgIC8vIGV4cGFuZCBhdHRyaWJ1dGUgdmFsdWVzIHRoYXQgYXJlIGZ1bmN0aW9ucy4gIEFueSBhdHRyaWJ1dGUgdmFsdWVcbiAgICAvLyB0aGF0IGNvbnRhaW5zIFZpZXdzIG11c3QgYmUgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICB2YWx1ZSA9IEJsYXplLl93aXRoQ3VycmVudFZpZXcodGhpcy5wYXJlbnRWaWV3LCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLnByb3RvdHlwZS52aXNpdEF0dHJpYnV0ZS5jYWxsKFxuICAgICAgdGhpcywgbmFtZSwgdmFsdWUsIHRhZyk7XG4gIH1cbn0pO1xuXG4vLyBSZXR1cm4gQmxhemUuY3VycmVudFZpZXcsIGJ1dCBvbmx5IGlmIGl0IGlzIGJlaW5nIHJlbmRlcmVkXG4vLyAoaS5lLiB3ZSBhcmUgaW4gaXRzIHJlbmRlcigpIG1ldGhvZCkuXG5jb25zdCBjdXJyZW50Vmlld0lmUmVuZGVyaW5nID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB2aWV3ID0gQmxhemUuY3VycmVudFZpZXc7XG4gIHJldHVybiAodmlldyAmJiB2aWV3Ll9pc0luUmVuZGVyKSA/IHZpZXcgOiBudWxsO1xufTtcblxuQmxhemUuX2V4cGFuZCA9IGZ1bmN0aW9uIChodG1sanMsIHBhcmVudFZpZXcpIHtcbiAgcGFyZW50VmlldyA9IHBhcmVudFZpZXcgfHwgY3VycmVudFZpZXdJZlJlbmRlcmluZygpO1xuICByZXR1cm4gKG5ldyBCbGF6ZS5fSFRNTEpTRXhwYW5kZXIoXG4gICAge3BhcmVudFZpZXc6IHBhcmVudFZpZXd9KSkudmlzaXQoaHRtbGpzKTtcbn07XG5cbkJsYXplLl9leHBhbmRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGF0dHJzLCBwYXJlbnRWaWV3KSB7XG4gIHBhcmVudFZpZXcgPSBwYXJlbnRWaWV3IHx8IGN1cnJlbnRWaWV3SWZSZW5kZXJpbmcoKTtcbiAgY29uc3QgZXhwYW5kZWQgPSAobmV3IEJsYXplLl9IVE1MSlNFeHBhbmRlcihcbiAgICB7cGFyZW50VmlldzogcGFyZW50Vmlld30pKS52aXNpdEF0dHJpYnV0ZXMoYXR0cnMpO1xuICByZXR1cm4gZXhwYW5kZWQgfHwge307XG59O1xuXG5CbGF6ZS5fZGVzdHJveVZpZXcgPSBmdW5jdGlvbiAodmlldywgX3NraXBOb2Rlcykge1xuICBpZiAodmlldy5pc0Rlc3Ryb3llZClcbiAgICByZXR1cm47XG4gIHZpZXcuaXNEZXN0cm95ZWQgPSB0cnVlO1xuXG5cbiAgLy8gRGVzdHJveSB2aWV3cyBhbmQgZWxlbWVudHMgcmVjdXJzaXZlbHkuICBJZiBfc2tpcE5vZGVzLFxuICAvLyBvbmx5IHJlY3Vyc2UgdXAgdG8gdmlld3MsIG5vdCBlbGVtZW50cywgZm9yIHRoZSBjYXNlIHdoZXJlXG4gIC8vIHRoZSBiYWNrZW5kIChqUXVlcnkpIGlzIHJlY3Vyc2luZyBvdmVyIHRoZSBlbGVtZW50cyBhbHJlYWR5LlxuXG4gIGlmICh2aWV3Ll9kb21yYW5nZSkgdmlldy5fZG9tcmFuZ2UuZGVzdHJveU1lbWJlcnMoX3NraXBOb2Rlcyk7XG5cbiAgLy8gWFhYOiBmaXJlIGNhbGxiYWNrcyBhZnRlciBwb3RlbnRpYWwgbWVtYmVycyBhcmUgZGVzdHJveWVkXG4gIC8vIG90aGVyd2lzZSBpdCdzIHRyYWNrZXIuZmx1c2ggd2lsbCBjYXVzZSB0aGUgYWJvdmUgbGluZSB3aWxsXG4gIC8vIG5vdCBiZSBjYWxsZWQgYW5kIHRoZWlyIHZpZXdzIHdvbid0IGJlIGRlc3Ryb3llZFxuICAvLyBJbnZvbHZlZCBpc3N1ZXM6IERPTVJhbmdlIFwiTXVzdCBiZSBhdHRhY2hlZFwiIGVycm9yLCBtZW0gbGVha1xuXG4gIEJsYXplLl9maXJlQ2FsbGJhY2tzKHZpZXcsICdkZXN0cm95ZWQnKTtcbn07XG5cbkJsYXplLl9kZXN0cm95Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIGlmIChub2RlLm5vZGVUeXBlID09PSAxKVxuICAgIEJsYXplLl9ET01CYWNrZW5kLlRlYXJkb3duLnRlYXJEb3duRWxlbWVudChub2RlKTtcbn07XG5cbi8vIEFyZSB0aGUgSFRNTGpzIGVudGl0aWVzIGBhYCBhbmQgYGJgIHRoZSBzYW1lPyAgV2UgY291bGQgYmVcbi8vIG1vcmUgZWxhYm9yYXRlIGhlcmUgYnV0IHRoZSBwb2ludCBpcyB0byBjYXRjaCB0aGUgbW9zdCBiYXNpY1xuLy8gY2FzZXMuXG5CbGF6ZS5faXNDb250ZW50RXF1YWwgPSBmdW5jdGlvbiAoYSwgYikge1xuICBpZiAoYSBpbnN0YW5jZW9mIEhUTUwuUmF3KSB7XG4gICAgcmV0dXJuIChiIGluc3RhbmNlb2YgSFRNTC5SYXcpICYmIChhLnZhbHVlID09PSBiLnZhbHVlKTtcbiAgfSBlbHNlIGlmIChhID09IG51bGwpIHtcbiAgICByZXR1cm4gKGIgPT0gbnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChhID09PSBiKSAmJlxuICAgICAgKCh0eXBlb2YgYSA9PT0gJ251bWJlcicpIHx8ICh0eXBlb2YgYSA9PT0gJ2Jvb2xlYW4nKSB8fFxuICAgICAgICh0eXBlb2YgYSA9PT0gJ3N0cmluZycpKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBUaGUgVmlldyBjb3JyZXNwb25kaW5nIHRvIHRoZSBjdXJyZW50IHRlbXBsYXRlIGhlbHBlciwgZXZlbnQgaGFuZGxlciwgY2FsbGJhY2ssIG9yIGF1dG9ydW4uICBJZiB0aGVyZSBpc24ndCBvbmUsIGBudWxsYC5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEB0eXBlIHtCbGF6ZS5WaWV3fVxuICovXG5CbGF6ZS5jdXJyZW50VmlldyA9IG51bGw7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7QmxhemUuVmlld30gdmlld1xuICogQHBhcmFtIHtmdW5jdGlvbigpOiBUfSBmdW5jXG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuQmxhemUuX3dpdGhDdXJyZW50VmlldyA9IGZ1bmN0aW9uICh2aWV3LCBmdW5jKSB7XG4gIGNvbnN0IG9sZFZpZXcgPSBCbGF6ZS5jdXJyZW50VmlldztcbiAgdHJ5IHtcbiAgICBCbGF6ZS5jdXJyZW50VmlldyA9IHZpZXc7XG4gICAgcmV0dXJuIGZ1bmMoKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBCbGF6ZS5jdXJyZW50VmlldyA9IG9sZFZpZXc7XG4gIH1cbn07XG5cbi8vIEJsYXplLnJlbmRlciBwdWJsaWNseSB0YWtlcyBhIFZpZXcgb3IgYSBUZW1wbGF0ZS5cbi8vIFByaXZhdGVseSwgaXQgdGFrZXMgYW55IEhUTUxKUyAoZXh0ZW5kZWQgd2l0aCBWaWV3cyBhbmQgVGVtcGxhdGVzKVxuLy8gZXhjZXB0IG51bGwgb3IgdW5kZWZpbmVkLCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbnkgZXh0ZW5kZWRcbi8vIEhUTUxKUy5cbmNvbnN0IGNoZWNrUmVuZGVyQ29udGVudCA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gIGlmIChjb250ZW50ID09PSBudWxsKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbmRlciBudWxsXCIpO1xuICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICd1bmRlZmluZWQnKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbmRlciB1bmRlZmluZWRcIik7XG5cbiAgaWYgKChjb250ZW50IGluc3RhbmNlb2YgQmxhemUuVmlldykgfHxcbiAgICAgIChjb250ZW50IGluc3RhbmNlb2YgQmxhemUuVGVtcGxhdGUpIHx8XG4gICAgICAodHlwZW9mIGNvbnRlbnQgPT09ICdmdW5jdGlvbicpKVxuICAgIHJldHVybjtcblxuICB0cnkge1xuICAgIC8vIFRocm93IGlmIGNvbnRlbnQgZG9lc24ndCBsb29rIGxpa2UgSFRNTEpTIGF0IHRoZSB0b3AgbGV2ZWxcbiAgICAvLyAoaS5lLiB2ZXJpZnkgdGhhdCB0aGlzIGlzIGFuIEhUTUwuVGFnLCBvciBhbiBhcnJheSxcbiAgICAvLyBvciBhIHByaW1pdGl2ZSwgZXRjLilcbiAgICAobmV3IEhUTUwuVmlzaXRvcikudmlzaXQoY29udGVudCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBNYWtlIGVycm9yIG1lc3NhZ2Ugc3VpdGFibGUgZm9yIHB1YmxpYyBBUElcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBUZW1wbGF0ZSBvciBWaWV3XCIpO1xuICB9XG59O1xuXG4vLyBGb3IgQmxhemUucmVuZGVyIGFuZCBCbGF6ZS50b0hUTUwsIHRha2UgY29udGVudCBhbmRcbi8vIHdyYXAgaXQgaW4gYSBWaWV3LCB1bmxlc3MgaXQncyBhIHNpbmdsZSBWaWV3IG9yXG4vLyBUZW1wbGF0ZSBhbHJlYWR5LlxuY29uc3QgY29udGVudEFzVmlldyA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gIGNoZWNrUmVuZGVyQ29udGVudChjb250ZW50KTtcblxuICBpZiAoY29udGVudCBpbnN0YW5jZW9mIEJsYXplLlRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQuY29uc3RydWN0VmlldygpO1xuICB9IGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBCbGF6ZS5WaWV3KSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGZ1bmMgPSBjb250ZW50O1xuICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gQmxhemUuVmlldygncmVuZGVyJywgZnVuYyk7XG4gIH1cbn07XG5cbi8vIEZvciBCbGF6ZS5yZW5kZXJXaXRoRGF0YSBhbmQgQmxhemUudG9IVE1MV2l0aERhdGEsIHdyYXAgY29udGVudFxuLy8gaW4gYSBmdW5jdGlvbiwgaWYgbmVjZXNzYXJ5LCBzbyBpdCBjYW4gYmUgYSBjb250ZW50IGFyZyB0b1xuLy8gYSBCbGF6ZS5XaXRoLlxuY29uc3QgY29udGVudEFzRnVuYyA9IGZ1bmN0aW9uIChjb250ZW50KSB7XG4gIGNoZWNrUmVuZGVyQ29udGVudChjb250ZW50KTtcblxuICBpZiAodHlwZW9mIGNvbnRlbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxufTtcblxuQmxhemUuX19yb290Vmlld3MgPSBbXTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZW5kZXJzIGEgdGVtcGxhdGUgb3IgVmlldyB0byBET00gbm9kZXMgYW5kIGluc2VydHMgaXQgaW50byB0aGUgRE9NLCByZXR1cm5pbmcgYSByZW5kZXJlZCBbVmlld10oI0JsYXplLVZpZXcpIHdoaWNoIGNhbiBiZSBwYXNzZWQgdG8gW2BCbGF6ZS5yZW1vdmVgXSgjQmxhemUtcmVtb3ZlKS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7VGVtcGxhdGV8QmxhemUuVmlld30gdGVtcGxhdGVPclZpZXcgVGhlIHRlbXBsYXRlIChlLmcuIGBUZW1wbGF0ZS5teVRlbXBsYXRlYCkgb3IgVmlldyBvYmplY3QgdG8gcmVuZGVyLiAgSWYgYSB0ZW1wbGF0ZSwgYSBWaWV3IG9iamVjdCBpcyBbY29uc3RydWN0ZWRdKCN0ZW1wbGF0ZV9jb25zdHJ1Y3R2aWV3KS4gIElmIGEgVmlldywgaXQgbXVzdCBiZSBhbiB1bnJlbmRlcmVkIFZpZXcsIHdoaWNoIGJlY29tZXMgYSByZW5kZXJlZCBWaWV3IGFuZCBpcyByZXR1cm5lZC5cbiAqIEBwYXJhbSB7RE9NTm9kZX0gcGFyZW50Tm9kZSBUaGUgbm9kZSB0aGF0IHdpbGwgYmUgdGhlIHBhcmVudCBvZiB0aGUgcmVuZGVyZWQgdGVtcGxhdGUuICBJdCBtdXN0IGJlIGFuIEVsZW1lbnQgbm9kZS5cbiAqIEBwYXJhbSB7RE9NTm9kZX0gW25leHROb2RlXSBPcHRpb25hbC4gSWYgcHJvdmlkZWQsIG11c3QgYmUgYSBjaGlsZCBvZiA8ZW0+cGFyZW50Tm9kZTwvZW0+OyB0aGUgdGVtcGxhdGUgd2lsbCBiZSBpbnNlcnRlZCBiZWZvcmUgdGhpcyBub2RlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IGNoaWxkIG9mIHBhcmVudE5vZGUuXG4gKiBAcGFyYW0ge0JsYXplLlZpZXd9IFtwYXJlbnRWaWV3XSBPcHRpb25hbC4gSWYgcHJvdmlkZWQsIGl0IHdpbGwgYmUgc2V0IGFzIHRoZSByZW5kZXJlZCBWaWV3J3MgW2BwYXJlbnRWaWV3YF0oI3ZpZXdfcGFyZW50dmlldykuXG4gKi9cbkJsYXplLnJlbmRlciA9IGZ1bmN0aW9uIChjb250ZW50LCBwYXJlbnRFbGVtZW50LCBuZXh0Tm9kZSwgcGFyZW50Vmlldykge1xuICBpZiAoISBwYXJlbnRFbGVtZW50KSB7XG4gICAgQmxhemUuX3dhcm4oXCJCbGF6ZS5yZW5kZXIgd2l0aG91dCBhIHBhcmVudCBlbGVtZW50IGlzIGRlcHJlY2F0ZWQuIFwiICtcbiAgICAgICAgICAgICAgICBcIllvdSBtdXN0IHNwZWNpZnkgd2hlcmUgdG8gaW5zZXJ0IHRoZSByZW5kZXJlZCBjb250ZW50LlwiKTtcbiAgfVxuXG4gIGlmIChuZXh0Tm9kZSBpbnN0YW5jZW9mIEJsYXplLlZpZXcpIHtcbiAgICAvLyBoYW5kbGUgb21pdHRlZCBuZXh0Tm9kZVxuICAgIHBhcmVudFZpZXcgPSBuZXh0Tm9kZTtcbiAgICBuZXh0Tm9kZSA9IG51bGw7XG4gIH1cblxuICAvLyBwYXJlbnRFbGVtZW50IG11c3QgYmUgYSBET00gbm9kZS4gaW4gcGFydGljdWxhciwgY2FuJ3QgYmUgdGhlXG4gIC8vIHJlc3VsdCBvZiBhIGNhbGwgdG8gYCRgLiBDYW4ndCBjaGVjayBpZiBgcGFyZW50RWxlbWVudCBpbnN0YW5jZW9mXG4gIC8vIE5vZGVgIHNpbmNlICdOb2RlJyBpcyB1bmRlZmluZWQgaW4gSUU4LlxuICBpZiAocGFyZW50RWxlbWVudCAmJiB0eXBlb2YgcGFyZW50RWxlbWVudC5ub2RlVHlwZSAhPT0gJ251bWJlcicpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiJ3BhcmVudEVsZW1lbnQnIG11c3QgYmUgYSBET00gbm9kZVwiKTtcbiAgaWYgKG5leHROb2RlICYmIHR5cGVvZiBuZXh0Tm9kZS5ub2RlVHlwZSAhPT0gJ251bWJlcicpIC8vICduZXh0Tm9kZScgaXMgb3B0aW9uYWxcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCInbmV4dE5vZGUnIG11c3QgYmUgYSBET00gbm9kZVwiKTtcblxuICBwYXJlbnRWaWV3ID0gcGFyZW50VmlldyB8fCBjdXJyZW50Vmlld0lmUmVuZGVyaW5nKCk7XG5cbiAgY29uc3QgdmlldyA9IGNvbnRlbnRBc1ZpZXcoY29udGVudCk7XG5cbiAgLy8gVE9ETzogdGhpcyBpcyBvbmx5IG5lZWRlZCBpbiBkZXZlbG9wbWVudFxuICBpZiAoIXBhcmVudFZpZXcpIHtcbiAgICB2aWV3Lm9uVmlld0NyZWF0ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgQmxhemUuX19yb290Vmlld3MucHVzaCh2aWV3KTtcbiAgICB9KTtcblxuICAgIHZpZXcub25WaWV3RGVzdHJveWVkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBpbmRleCA9IEJsYXplLl9fcm9vdFZpZXdzLmluZGV4T2Yodmlldyk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBCbGF6ZS5fX3Jvb3RWaWV3cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgQmxhemUuX21hdGVyaWFsaXplVmlldyh2aWV3LCBwYXJlbnRWaWV3KTtcbiAgaWYgKHBhcmVudEVsZW1lbnQpIHtcbiAgICB2aWV3Ll9kb21yYW5nZS5hdHRhY2gocGFyZW50RWxlbWVudCwgbmV4dE5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIHZpZXc7XG59O1xuXG5CbGF6ZS5pbnNlcnQgPSBmdW5jdGlvbiAodmlldywgcGFyZW50RWxlbWVudCwgbmV4dE5vZGUpIHtcbiAgQmxhemUuX3dhcm4oXCJCbGF6ZS5pbnNlcnQgaGFzIGJlZW4gZGVwcmVjYXRlZC4gIFNwZWNpZnkgd2hlcmUgdG8gaW5zZXJ0IHRoZSBcIiArXG4gICAgICAgICAgICAgIFwicmVuZGVyZWQgY29udGVudCBpbiB0aGUgY2FsbCB0byBCbGF6ZS5yZW5kZXIuXCIpO1xuXG4gIGlmICghICh2aWV3ICYmICh2aWV3Ll9kb21yYW5nZSBpbnN0YW5jZW9mIEJsYXplLl9ET01SYW5nZSkpKVxuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIHRlbXBsYXRlIHJlbmRlcmVkIHdpdGggQmxhemUucmVuZGVyXCIpO1xuXG4gIHZpZXcuX2RvbXJhbmdlLmF0dGFjaChwYXJlbnRFbGVtZW50LCBuZXh0Tm9kZSk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbmRlcnMgYSB0ZW1wbGF0ZSBvciBWaWV3IHRvIERPTSBub2RlcyB3aXRoIGEgZGF0YSBjb250ZXh0LiAgT3RoZXJ3aXNlIGlkZW50aWNhbCB0byBgQmxhemUucmVuZGVyYC5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7VGVtcGxhdGV8QmxhemUuVmlld30gdGVtcGxhdGVPclZpZXcgVGhlIHRlbXBsYXRlIChlLmcuIGBUZW1wbGF0ZS5teVRlbXBsYXRlYCkgb3IgVmlldyBvYmplY3QgdG8gcmVuZGVyLlxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRhdGEgVGhlIGRhdGEgY29udGV4dCB0byB1c2UsIG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgZGF0YSBjb250ZXh0LiAgSWYgYSBmdW5jdGlvbiBpcyBwcm92aWRlZCwgaXQgd2lsbCBiZSByZWFjdGl2ZWx5IHJlLXJ1bi5cbiAqIEBwYXJhbSB7RE9NTm9kZX0gcGFyZW50Tm9kZSBUaGUgbm9kZSB0aGF0IHdpbGwgYmUgdGhlIHBhcmVudCBvZiB0aGUgcmVuZGVyZWQgdGVtcGxhdGUuICBJdCBtdXN0IGJlIGFuIEVsZW1lbnQgbm9kZS5cbiAqIEBwYXJhbSB7RE9NTm9kZX0gW25leHROb2RlXSBPcHRpb25hbC4gSWYgcHJvdmlkZWQsIG11c3QgYmUgYSBjaGlsZCBvZiA8ZW0+cGFyZW50Tm9kZTwvZW0+OyB0aGUgdGVtcGxhdGUgd2lsbCBiZSBpbnNlcnRlZCBiZWZvcmUgdGhpcyBub2RlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IGNoaWxkIG9mIHBhcmVudE5vZGUuXG4gKiBAcGFyYW0ge0JsYXplLlZpZXd9IFtwYXJlbnRWaWV3XSBPcHRpb25hbC4gSWYgcHJvdmlkZWQsIGl0IHdpbGwgYmUgc2V0IGFzIHRoZSByZW5kZXJlZCBWaWV3J3MgW2BwYXJlbnRWaWV3YF0oI3ZpZXdfcGFyZW50dmlldykuXG4gKi9cbkJsYXplLnJlbmRlcldpdGhEYXRhID0gZnVuY3Rpb24gKGNvbnRlbnQsIGRhdGEsIHBhcmVudEVsZW1lbnQsIG5leHROb2RlLCBwYXJlbnRWaWV3KSB7XG4gIC8vIFdlIGRlZmVyIHRoZSBoYW5kbGluZyBvZiBvcHRpb25hbCBhcmd1bWVudHMgdG8gQmxhemUucmVuZGVyLiAgQXQgdGhpcyBwb2ludCxcbiAgLy8gYG5leHROb2RlYCBtYXkgYWN0dWFsbHkgYmUgYHBhcmVudFZpZXdgLlxuICByZXR1cm4gQmxhemUucmVuZGVyKEJsYXplLl9UZW1wbGF0ZVdpdGgoZGF0YSwgY29udGVudEFzRnVuYyhjb250ZW50KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsIG5leHROb2RlLCBwYXJlbnRWaWV3KTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmVtb3ZlcyBhIHJlbmRlcmVkIFZpZXcgZnJvbSB0aGUgRE9NLCBzdG9wcGluZyBhbGwgcmVhY3RpdmUgdXBkYXRlcyBhbmQgZXZlbnQgbGlzdGVuZXJzIG9uIGl0LiBBbHNvIGRlc3Ryb3lzIHRoZSBCbGF6ZS5UZW1wbGF0ZSBpbnN0YW5jZSBhc3NvY2lhdGVkIHdpdGggdGhlIHZpZXcuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0JsYXplLlZpZXd9IHJlbmRlcmVkVmlldyBUaGUgcmV0dXJuIHZhbHVlIGZyb20gYEJsYXplLnJlbmRlcmAgb3IgYEJsYXplLnJlbmRlcldpdGhEYXRhYCwgb3IgdGhlIGB2aWV3YCBwcm9wZXJ0eSBvZiBhIEJsYXplLlRlbXBsYXRlIGluc3RhbmNlLiBDYWxsaW5nIGBCbGF6ZS5yZW1vdmUoVGVtcGxhdGUuaW5zdGFuY2UoKS52aWV3KWAgZnJvbSB3aXRoaW4gYSB0ZW1wbGF0ZSBldmVudCBoYW5kbGVyIHdpbGwgZGVzdHJveSB0aGUgdmlldyBhcyB3ZWxsIGFzIHRoYXQgdGVtcGxhdGUgYW5kIHRyaWdnZXIgdGhlIHRlbXBsYXRlJ3MgYG9uRGVzdHJveWVkYCBoYW5kbGVycy5cbiAqL1xuQmxhemUucmVtb3ZlID0gZnVuY3Rpb24gKHZpZXcpIHtcbiAgaWYgKCEgKHZpZXcgJiYgKHZpZXcuX2RvbXJhbmdlIGluc3RhbmNlb2YgQmxhemUuX0RPTVJhbmdlKSkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgdGVtcGxhdGUgcmVuZGVyZWQgd2l0aCBCbGF6ZS5yZW5kZXJcIik7XG5cbiAgd2hpbGUgKHZpZXcpIHtcbiAgICBpZiAoISB2aWV3LmlzRGVzdHJveWVkKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHZpZXcuX2RvbXJhbmdlO1xuICAgICAgcmFuZ2UuZGVzdHJveSgpO1xuXG4gICAgICBpZiAocmFuZ2UuYXR0YWNoZWQgJiYgISByYW5nZS5wYXJlbnRSYW5nZSkge1xuICAgICAgICByYW5nZS5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2aWV3ID0gdmlldy5faGFzR2VuZXJhdGVkUGFyZW50ICYmIHZpZXcucGFyZW50VmlldztcbiAgfVxufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZW5kZXJzIGEgdGVtcGxhdGUgb3IgVmlldyB0byBhIHN0cmluZyBvZiBIVE1MLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtUZW1wbGF0ZXxCbGF6ZS5WaWV3fSB0ZW1wbGF0ZU9yVmlldyBUaGUgdGVtcGxhdGUgKGUuZy4gYFRlbXBsYXRlLm15VGVtcGxhdGVgKSBvciBWaWV3IG9iamVjdCBmcm9tIHdoaWNoIHRvIGdlbmVyYXRlIEhUTUwuXG4gKi9cbkJsYXplLnRvSFRNTCA9IGZ1bmN0aW9uIChjb250ZW50LCBwYXJlbnRWaWV3KSB7XG4gIHBhcmVudFZpZXcgPSBwYXJlbnRWaWV3IHx8IGN1cnJlbnRWaWV3SWZSZW5kZXJpbmcoKTtcblxuICByZXR1cm4gSFRNTC50b0hUTUwoQmxhemUuX2V4cGFuZFZpZXcoY29udGVudEFzVmlldyhjb250ZW50KSwgcGFyZW50VmlldykpO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZW5kZXJzIGEgdGVtcGxhdGUgb3IgVmlldyB0byBIVE1MIHdpdGggYSBkYXRhIGNvbnRleHQuICBPdGhlcndpc2UgaWRlbnRpY2FsIHRvIGBCbGF6ZS50b0hUTUxgLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtUZW1wbGF0ZXxCbGF6ZS5WaWV3fSB0ZW1wbGF0ZU9yVmlldyBUaGUgdGVtcGxhdGUgKGUuZy4gYFRlbXBsYXRlLm15VGVtcGxhdGVgKSBvciBWaWV3IG9iamVjdCBmcm9tIHdoaWNoIHRvIGdlbmVyYXRlIEhUTUwuXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGF0YSBUaGUgZGF0YSBjb250ZXh0IHRvIHVzZSwgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgYSBkYXRhIGNvbnRleHQuXG4gKi9cbkJsYXplLnRvSFRNTFdpdGhEYXRhID0gZnVuY3Rpb24gKGNvbnRlbnQsIGRhdGEsIHBhcmVudFZpZXcpIHtcbiAgcGFyZW50VmlldyA9IHBhcmVudFZpZXcgfHwgY3VycmVudFZpZXdJZlJlbmRlcmluZygpO1xuXG4gIHJldHVybiBIVE1MLnRvSFRNTChCbGF6ZS5fZXhwYW5kVmlldyhCbGF6ZS5fVGVtcGxhdGVXaXRoKFxuICAgIGRhdGEsIGNvbnRlbnRBc0Z1bmMoY29udGVudCkpLCBwYXJlbnRWaWV3KSk7XG59O1xuXG5CbGF6ZS5fdG9UZXh0ID0gZnVuY3Rpb24gKGh0bWxqcywgcGFyZW50VmlldywgdGV4dE1vZGUpIHtcbiAgaWYgKHR5cGVvZiBodG1sanMgPT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQmxhemUuX3RvVGV4dCBkb2Vzbid0IHRha2UgYSBmdW5jdGlvbiwganVzdCBIVE1ManNcIik7XG5cbiAgaWYgKChwYXJlbnRWaWV3ICE9IG51bGwpICYmICEgKHBhcmVudFZpZXcgaW5zdGFuY2VvZiBCbGF6ZS5WaWV3KSkge1xuICAgIC8vIG9taXR0ZWQgcGFyZW50VmlldyBhcmd1bWVudFxuICAgIHRleHRNb2RlID0gcGFyZW50VmlldztcbiAgICBwYXJlbnRWaWV3ID0gbnVsbDtcbiAgfVxuICBwYXJlbnRWaWV3ID0gcGFyZW50VmlldyB8fCBjdXJyZW50Vmlld0lmUmVuZGVyaW5nKCk7XG5cbiAgaWYgKCEgdGV4dE1vZGUpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwidGV4dE1vZGUgcmVxdWlyZWRcIik7XG4gIGlmICghICh0ZXh0TW9kZSA9PT0gSFRNTC5URVhUTU9ERS5TVFJJTkcgfHxcbiAgICAgICAgIHRleHRNb2RlID09PSBIVE1MLlRFWFRNT0RFLlJDREFUQSB8fFxuICAgICAgICAgdGV4dE1vZGUgPT09IEhUTUwuVEVYVE1PREUuQVRUUklCVVRFKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRleHRNb2RlOiBcIiArIHRleHRNb2RlKTtcblxuICByZXR1cm4gSFRNTC50b1RleHQoQmxhemUuX2V4cGFuZChodG1sanMsIHBhcmVudFZpZXcpLCB0ZXh0TW9kZSk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIGN1cnJlbnQgZGF0YSBjb250ZXh0LCBvciB0aGUgZGF0YSBjb250ZXh0IHRoYXQgd2FzIHVzZWQgd2hlbiByZW5kZXJpbmcgYSBwYXJ0aWN1bGFyIERPTSBlbGVtZW50IG9yIFZpZXcgZnJvbSBhIE1ldGVvciB0ZW1wbGF0ZS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7RE9NRWxlbWVudHxCbGF6ZS5WaWV3fSBbZWxlbWVudE9yVmlld10gT3B0aW9uYWwuICBBbiBlbGVtZW50IHRoYXQgd2FzIHJlbmRlcmVkIGJ5IGEgTWV0ZW9yLCBvciBhIFZpZXcuXG4gKi9cbkJsYXplLmdldERhdGEgPSBmdW5jdGlvbiAoZWxlbWVudE9yVmlldykge1xuICBsZXQgdGhlV2l0aDtcblxuICBpZiAoISBlbGVtZW50T3JWaWV3KSB7XG4gICAgdGhlV2l0aCA9IEJsYXplLmdldFZpZXcoJ3dpdGgnKTtcbiAgfSBlbHNlIGlmIChlbGVtZW50T3JWaWV3IGluc3RhbmNlb2YgQmxhemUuVmlldykge1xuICAgIGNvbnN0IHZpZXcgPSBlbGVtZW50T3JWaWV3O1xuICAgIHRoZVdpdGggPSAodmlldy5uYW1lID09PSAnd2l0aCcgPyB2aWV3IDpcbiAgICAgICAgICAgICAgIEJsYXplLmdldFZpZXcodmlldywgJ3dpdGgnKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVsZW1lbnRPclZpZXcubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKGVsZW1lbnRPclZpZXcubm9kZVR5cGUgIT09IDEpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBET00gZWxlbWVudFwiKTtcbiAgICB0aGVXaXRoID0gQmxhemUuZ2V0VmlldyhlbGVtZW50T3JWaWV3LCAnd2l0aCcpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIERPTSBlbGVtZW50IG9yIFZpZXdcIik7XG4gIH1cblxuICByZXR1cm4gdGhlV2l0aCA/IHRoZVdpdGguZGF0YVZhci5nZXQoKT8udmFsdWUgOiBudWxsO1xufTtcblxuLy8gRm9yIGJhY2stY29tcGF0XG5CbGF6ZS5nZXRFbGVtZW50RGF0YSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIEJsYXplLl93YXJuKFwiQmxhemUuZ2V0RWxlbWVudERhdGEgaGFzIGJlZW4gZGVwcmVjYXRlZC4gIFVzZSBcIiArXG4gICAgICAgICAgICAgIFwiQmxhemUuZ2V0RGF0YShlbGVtZW50KSBpbnN0ZWFkLlwiKTtcblxuICBpZiAoZWxlbWVudC5ub2RlVHlwZSAhPT0gMSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBET00gZWxlbWVudFwiKTtcblxuICByZXR1cm4gQmxhemUuZ2V0RGF0YShlbGVtZW50KTtcbn07XG5cbi8vIEJvdGggYXJndW1lbnRzIGFyZSBvcHRpb25hbC5cblxuLyoqXG4gKiBAc3VtbWFyeSBHZXRzIGVpdGhlciB0aGUgY3VycmVudCBWaWV3LCBvciB0aGUgVmlldyBlbmNsb3NpbmcgdGhlIGdpdmVuIERPTSBlbGVtZW50LlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtET01FbGVtZW50fSBbZWxlbWVudF0gT3B0aW9uYWwuICBJZiBzcGVjaWZpZWQsIHRoZSBWaWV3IGVuY2xvc2luZyBgZWxlbWVudGAgaXMgcmV0dXJuZWQuXG4gKi9cbkJsYXplLmdldFZpZXcgPSBmdW5jdGlvbiAoZWxlbWVudE9yVmlldywgX3ZpZXdOYW1lKSB7XG4gIGxldCB2aWV3TmFtZSA9IF92aWV3TmFtZTtcblxuICBpZiAoKHR5cGVvZiBlbGVtZW50T3JWaWV3KSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyBvbWl0dGVkIGVsZW1lbnRPclZpZXc7IHZpZXdOYW1lIHByZXNlbnRcbiAgICB2aWV3TmFtZSA9IGVsZW1lbnRPclZpZXc7XG4gICAgZWxlbWVudE9yVmlldyA9IG51bGw7XG4gIH1cblxuICAvLyBXZSBjb3VsZCBldmVudHVhbGx5IHNob3J0ZW4gdGhlIGNvZGUgYnkgZm9sZGluZyB0aGUgbG9naWNcbiAgLy8gZnJvbSB0aGUgb3RoZXIgbWV0aG9kcyBpbnRvIHRoaXMgbWV0aG9kLlxuICBpZiAoISBlbGVtZW50T3JWaWV3KSB7XG4gICAgcmV0dXJuIEJsYXplLl9nZXRDdXJyZW50Vmlldyh2aWV3TmFtZSk7XG4gIH0gZWxzZSBpZiAoZWxlbWVudE9yVmlldyBpbnN0YW5jZW9mIEJsYXplLlZpZXcpIHtcbiAgICByZXR1cm4gQmxhemUuX2dldFBhcmVudFZpZXcoZWxlbWVudE9yVmlldywgdmlld05hbWUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50T3JWaWV3Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBCbGF6ZS5fZ2V0RWxlbWVudFZpZXcoZWxlbWVudE9yVmlldywgdmlld05hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIERPTSBlbGVtZW50IG9yIFZpZXdcIik7XG4gIH1cbn07XG5cbi8vIEdldHMgdGhlIGN1cnJlbnQgdmlldyBvciBpdHMgbmVhcmVzdCBhbmNlc3RvciBvZiBuYW1lXG4vLyBgbmFtZWAuXG5CbGF6ZS5fZ2V0Q3VycmVudFZpZXcgPSBmdW5jdGlvbiAobmFtZSkge1xuICBsZXQgdmlldyA9IEJsYXplLmN1cnJlbnRWaWV3O1xuICAvLyBCZXR0ZXIgdG8gZmFpbCBpbiBjYXNlcyB3aGVyZSBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgLy8gdG8gdXNlIEJsYXplLl9nZXRDdXJyZW50VmlldygpLiAgVGhlcmUgd2lsbCBiZSBhIGN1cnJlbnRcbiAgLy8gdmlldyBhbnl3aGVyZSBpdCBkb2VzLiAgWW91IGNhbiBjaGVjayBCbGF6ZS5jdXJyZW50Vmlld1xuICAvLyBpZiB5b3Ugd2FudCB0byBrbm93IHdoZXRoZXIgdGhlcmUgaXMgb25lIG9yIG5vdC5cbiAgaWYgKCEgdmlldylcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBjdXJyZW50IHZpZXdcIik7XG5cbiAgaWYgKG5hbWUpIHtcbiAgICB3aGlsZSAodmlldyAmJiB2aWV3Lm5hbWUgIT09IG5hbWUpXG4gICAgICB2aWV3ID0gdmlldy5wYXJlbnRWaWV3O1xuICAgIHJldHVybiB2aWV3IHx8IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgLy8gQmxhemUuX2dldEN1cnJlbnRWaWV3KCkgd2l0aCBubyBhcmd1bWVudHMganVzdCByZXR1cm5zXG4gICAgLy8gQmxhemUuY3VycmVudFZpZXcuXG4gICAgcmV0dXJuIHZpZXc7XG4gIH1cbn07XG5cbkJsYXplLl9nZXRQYXJlbnRWaWV3ID0gZnVuY3Rpb24gKHZpZXcsIG5hbWUpIHtcbiAgbGV0IHYgPSB2aWV3LnBhcmVudFZpZXc7XG5cbiAgaWYgKG5hbWUpIHtcbiAgICB3aGlsZSAodiAmJiB2Lm5hbWUgIT09IG5hbWUpXG4gICAgICB2ID0gdi5wYXJlbnRWaWV3O1xuICB9XG5cbiAgcmV0dXJuIHYgfHwgbnVsbDtcbn07XG5cbkJsYXplLl9nZXRFbGVtZW50VmlldyA9IGZ1bmN0aW9uIChlbGVtLCBuYW1lKSB7XG4gIGxldCByYW5nZSA9IEJsYXplLl9ET01SYW5nZS5mb3JFbGVtZW50KGVsZW0pO1xuICBsZXQgdmlldyA9IG51bGw7XG4gIHdoaWxlIChyYW5nZSAmJiAhIHZpZXcpIHtcbiAgICB2aWV3ID0gKHJhbmdlLnZpZXcgfHwgbnVsbCk7XG4gICAgaWYgKCEgdmlldykge1xuICAgICAgaWYgKHJhbmdlLnBhcmVudFJhbmdlKVxuICAgICAgICByYW5nZSA9IHJhbmdlLnBhcmVudFJhbmdlO1xuICAgICAgZWxzZVxuICAgICAgICByYW5nZSA9IEJsYXplLl9ET01SYW5nZS5mb3JFbGVtZW50KHJhbmdlLnBhcmVudEVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChuYW1lKSB7XG4gICAgd2hpbGUgKHZpZXcgJiYgdmlldy5uYW1lICE9PSBuYW1lKVxuICAgICAgdmlldyA9IHZpZXcucGFyZW50VmlldztcbiAgICByZXR1cm4gdmlldyB8fCBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2aWV3O1xuICB9XG59O1xuXG5CbGF6ZS5fYWRkRXZlbnRNYXAgPSBmdW5jdGlvbiAodmlldywgZXZlbnRNYXAsIHRoaXNJbkhhbmRsZXIpIHtcbiAgdGhpc0luSGFuZGxlciA9ICh0aGlzSW5IYW5kbGVyIHx8IG51bGwpO1xuICBjb25zdCBoYW5kbGVzID0gW107XG5cbiAgaWYgKCEgdmlldy5fZG9tcmFuZ2UpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVmlldyBtdXN0IGhhdmUgYSBET01SYW5nZVwiKTtcblxuICB2aWV3Ll9kb21yYW5nZS5vbkF0dGFjaGVkKGZ1bmN0aW9uIGF0dGFjaGVkX2V2ZW50TWFwcyhyYW5nZSwgZWxlbWVudCkge1xuICAgIE9iamVjdC5rZXlzKGV2ZW50TWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgICBsZXQgaGFuZGxlciA9IGV2ZW50TWFwW3NwZWNdO1xuICAgICAgY29uc3QgY2xhdXNlcyA9IHNwZWMuc3BsaXQoLyxcXHMrLyk7XG4gICAgICAvLyBpdGVyYXRlIG92ZXIgY2xhdXNlcyBvZiBzcGVjLCBlLmcuIFsnY2xpY2sgLmZvbycsICdjbGljayAuYmFyJ11cbiAgICAgIGNsYXVzZXMuZm9yRWFjaChmdW5jdGlvbiAoY2xhdXNlKSB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gY2xhdXNlLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5ld0V2ZW50cyA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gcGFydHMuam9pbignICcpO1xuICAgICAgICBoYW5kbGVzLnB1c2goQmxhemUuX0V2ZW50U3VwcG9ydC5saXN0ZW4oXG4gICAgICAgICAgZWxlbWVudCwgbmV3RXZlbnRzLCBzZWxlY3RvcixcbiAgICAgICAgICBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgY29uc3QgW2V2dF0gPSBhcmdzXG4gICAgICAgICAgICBpZiAoISByYW5nZS5jb250YWluc0VsZW1lbnQoZXZ0LmN1cnJlbnRUYXJnZXQsIHNlbGVjdG9yLCBuZXdFdmVudHMpKVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJUaGlzID0gdGhpc0luSGFuZGxlciB8fCB0aGlzO1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlckFyZ3MgPSBhcmdzO1xuICAgICAgICAgICAgcmV0dXJuIEJsYXplLl93aXRoQ3VycmVudFZpZXcodmlldywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5hcHBseShoYW5kbGVyVGhpcywgaGFuZGxlckFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByYW5nZSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHJldHVybiByLnBhcmVudFJhbmdlO1xuICAgICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICB2aWV3Lm9uVmlld0Rlc3Ryb3llZChmdW5jdGlvbiAoKSB7XG4gICAgaGFuZGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChoKSB7XG4gICAgICBoLnN0b3AoKTtcbiAgICB9KTtcbiAgICBoYW5kbGVzLmxlbmd0aCA9IDA7XG4gIH0pO1xufTtcbiIsImltcG9ydCBoYXMgZnJvbSAnbG9kYXNoLmhhcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoLmlzb2JqZWN0JztcblxuQmxhemUuX2NhbGN1bGF0ZUNvbmRpdGlvbiA9IGZ1bmN0aW9uIChjb25kKSB7XG4gIGlmIChIVE1MLmlzQXJyYXkoY29uZCkgJiYgY29uZC5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuICEhY29uZDtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0cyBhIFZpZXcgdGhhdCByZW5kZXJzIGNvbnRlbnQgd2l0aCBhIGRhdGEgY29udGV4dC5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkYXRhIEFuIG9iamVjdCB0byB1c2UgYXMgdGhlIGRhdGEgY29udGV4dCwgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgc3VjaCBhbiBvYmplY3QuICBJZiBhXG4gKiAgIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCB3aWxsIGJlIHJlYWN0aXZlbHkgcmUtcnVuLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29udGVudEZ1bmMgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS5cbiAqL1xuQmxhemUuV2l0aCA9IGZ1bmN0aW9uIChkYXRhLCBjb250ZW50RnVuYykge1xuICBjb25zdCB2aWV3ID0gQmxhemUuVmlldygnd2l0aCcsIGNvbnRlbnRGdW5jKTtcblxuICB2aWV3LmRhdGFWYXIgPSBudWxsO1xuICB2aWV3Lm9uVmlld0NyZWF0ZWQoKCkgPT4ge1xuICAgIHZpZXcuZGF0YVZhciA9IF9jcmVhdGVCaW5kaW5nKHZpZXcsIGRhdGEsICdzZXREYXRhJyk7XG4gIH0pO1xuXG4gIHJldHVybiB2aWV3O1xufTtcblxuXG4vKipcbiAqIEBzdW1tYXJ5IFNoYWxsb3cgY29tcGFyZSBvZiB0d28gYmluZGluZ3MuXG4gKiBAcGFyYW0ge0JpbmRpbmd9IHhcbiAqIEBwYXJhbSB7QmluZGluZ30geVxuICovXG5mdW5jdGlvbiBfaXNFcXVhbEJpbmRpbmcoeCwgeSkge1xuICBpZiAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHR5cGVvZiB5ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB4LmVycm9yID09PSB5LmVycm9yICYmIFJlYWN0aXZlVmFyLl9pc0VxdWFsKHgudmFsdWUsIHkudmFsdWUpO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBSZWFjdGl2ZVZhci5faXNFcXVhbCh4LCB5KTtcbiAgfVxufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHhcbiAqIEByZXR1cm5zIHtUfVxuICovXG5mdW5jdGlvbiBfaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhIHNpbmdsZSBiaW5kaW5nIHRvIHRoZSBpbnN0YW50aWF0ZWQgdmlldy5cbiAqIEB0ZW1wbGF0ZSBULCBVXG4gKiBAcGFyYW0ge1JlYWN0aXZlVmFyPFU+fSByZWFjdGl2ZVZhciBUYXJnZXQgdmlldy5cbiAqIEBwYXJhbSB7UHJvbWlzZTxUPiB8IFR9IHZhbHVlIEJvdW5kIHZhbHVlLlxuICogQHBhcmFtIHtmdW5jdGlvbihUKTogVX0gW21hcHBlcl0gTWFwcyB0aGUgY29tcHV0ZWQgdmFsdWUgYmVmb3JlIHN0b3JlLlxuICovXG5mdW5jdGlvbiBfc2V0QmluZGluZ1ZhbHVlKHJlYWN0aXZlVmFyLCB2YWx1ZSwgbWFwcGVyID0gX2lkZW50aXR5KSB7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhbHVlLnRoZW4oXG4gICAgICB2YWx1ZSA9PiByZWFjdGl2ZVZhci5zZXQoeyB2YWx1ZTogbWFwcGVyKHZhbHVlKSB9KSxcbiAgICAgIGVycm9yID0+IHJlYWN0aXZlVmFyLnNldCh7IGVycm9yIH0pLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgcmVhY3RpdmVWYXIuc2V0KHsgdmFsdWU6IG1hcHBlcih2YWx1ZSkgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVCwgVVxuICogQHBhcmFtIHtCbGF6ZS5WaWV3fSB2aWV3IFRhcmdldCB2aWV3LlxuICogQHBhcmFtIHtQcm9taXNlPFQ+IHwgVCB8IGZ1bmN0aW9uKCk6IChQcm9taXNlPFQ+IHwgVCl9IGJpbmRpbmcgQmluZGluZyB2YWx1ZSBvciBpdHMgZ2V0dGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFtkaXNwbGF5TmFtZV0gQXV0b3J1bidzIGRpc3BsYXkgbmFtZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IFV9IFttYXBwZXJdIE1hcHMgdGhlIGNvbXB1dGVkIHZhbHVlIGJlZm9yZSBzdG9yZS5cbiAqIEByZXR1cm5zIHtSZWFjdGl2ZVZhcjxVPn1cbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZUJpbmRpbmcodmlldywgYmluZGluZywgZGlzcGxheU5hbWUsIG1hcHBlcikge1xuICBjb25zdCByZWFjdGl2ZVZhciA9IG5ldyBSZWFjdGl2ZVZhcih1bmRlZmluZWQsIF9pc0VxdWFsQmluZGluZyk7XG4gIGlmICh0eXBlb2YgYmluZGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZpZXcuYXV0b3J1bihcbiAgICAgICgpID0+IF9zZXRCaW5kaW5nVmFsdWUocmVhY3RpdmVWYXIsIGJpbmRpbmcoKSwgbWFwcGVyKSxcbiAgICAgIHZpZXcucGFyZW50VmlldyxcbiAgICAgIGRpc3BsYXlOYW1lLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgX3NldEJpbmRpbmdWYWx1ZShyZWFjdGl2ZVZhciwgYmluZGluZywgbWFwcGVyKTtcbiAgfVxuXG4gIHJldHVybiByZWFjdGl2ZVZhcjtcbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBiaW5kaW5ncyB0byB0aGUgaW5zdGFudGlhdGVkIHZpZXcuXG4gKiBAcGFyYW0ge09iamVjdH0gYmluZGluZ3MgQSBkaWN0aW9uYXJ5IG9mIGJpbmRpbmdzLCBlYWNoIGJpbmRpbmcgbmFtZVxuICogY29ycmVzcG9uZHMgdG8gYSB2YWx1ZSBvciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSByZWFjdGl2ZWx5IHJlLXJ1bi5cbiAqIEBwYXJhbSB7QmxhemUuVmlld30gdmlldyBUaGUgdGFyZ2V0LlxuICovXG5CbGF6ZS5fYXR0YWNoQmluZGluZ3NUb1ZpZXcgPSBmdW5jdGlvbiAoYmluZGluZ3MsIHZpZXcpIHtcbiAgdmlldy5vblZpZXdDcmVhdGVkKGZ1bmN0aW9uICgpIHtcbiAgICBPYmplY3QuZW50cmllcyhiaW5kaW5ncykuZm9yRWFjaChmdW5jdGlvbiAoW25hbWUsIGJpbmRpbmddKSB7XG4gICAgICB2aWV3Ll9zY29wZUJpbmRpbmdzW25hbWVdID0gX2NyZWF0ZUJpbmRpbmcodmlldywgYmluZGluZyk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBDb25zdHJ1Y3RzIGEgVmlldyBzZXR0aW5nIHRoZSBsb2NhbCBsZXhpY2FsIHNjb3BlIGluIHRoZSBibG9jay5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGJpbmRpbmdzIERpY3Rpb25hcnkgbWFwcGluZyBuYW1lcyBvZiBiaW5kaW5ncyB0b1xuICogdmFsdWVzIG9yIGNvbXB1dGF0aW9ucyB0byByZWFjdGl2ZWx5IHJlLXJ1bi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbnRlbnRGdW5jIEEgRnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZSBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuXG4gKi9cbkJsYXplLkxldCA9IGZ1bmN0aW9uIChiaW5kaW5ncywgY29udGVudEZ1bmMpIHtcbiAgdmFyIHZpZXcgPSBCbGF6ZS5WaWV3KCdsZXQnLCBjb250ZW50RnVuYyk7XG4gIEJsYXplLl9hdHRhY2hCaW5kaW5nc1RvVmlldyhiaW5kaW5ncywgdmlldyk7XG5cbiAgcmV0dXJuIHZpZXc7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IENvbnN0cnVjdHMgYSBWaWV3IHRoYXQgcmVuZGVycyBjb250ZW50IGNvbmRpdGlvbmFsbHkuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb25kaXRpb25GdW5jIEEgZnVuY3Rpb24gdG8gcmVhY3RpdmVseSByZS1ydW4uICBXaGV0aGVyIHRoZSByZXN1bHQgaXMgdHJ1dGh5IG9yIGZhbHN5IGRldGVybWluZXNcbiAqICAgd2hldGhlciBgY29udGVudEZ1bmNgIG9yIGBlbHNlRnVuY2AgaXMgc2hvd24uICBBbiBlbXB0eSBhcnJheSBpcyBjb25zaWRlcmVkIGZhbHN5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29udGVudEZ1bmMgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtlbHNlRnVuY10gT3B0aW9uYWwuICBBIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGUgY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLiAgSWYgbm9cbiAqICAgYGVsc2VGdW5jYCBpcyBzdXBwbGllZCwgbm8gY29udGVudCBpcyBzaG93biBpbiB0aGUgXCJlbHNlXCIgY2FzZS5cbiAqL1xuQmxhemUuSWYgPSBmdW5jdGlvbiAoY29uZGl0aW9uRnVuYywgY29udGVudEZ1bmMsIGVsc2VGdW5jLCBfbm90KSB7XG4gIGNvbnN0IHZpZXcgPSBCbGF6ZS5WaWV3KF9ub3QgPyAndW5sZXNzJyA6ICdpZicsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBSZW5kZXIgb25seSBpZiB0aGUgYmluZGluZyBoYXMgYSB2YWx1ZSwgaS5lLiwgaXQncyBlaXRoZXIgc3luY2hyb25vdXMgb3JcbiAgICAvLyBoYXMgcmVzb2x2ZWQuIFJlamVjdGVkIGBQcm9taXNlYHMgYXJlIE5PVCByZW5kZXJlZC5cbiAgICBjb25zdCBjb25kaXRpb24gPSB2aWV3Ll9fY29uZGl0aW9uVmFyLmdldCgpO1xuICAgIGlmIChjb25kaXRpb24gJiYgJ3ZhbHVlJyBpbiBjb25kaXRpb24pIHtcbiAgICAgIHJldHVybiBjb25kaXRpb24udmFsdWUgPyBjb250ZW50RnVuYygpIDogKGVsc2VGdW5jID8gZWxzZUZ1bmMoKSA6IG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9KTtcblxuICB2aWV3Ll9fY29uZGl0aW9uVmFyID0gbnVsbDtcbiAgdmlldy5vblZpZXdDcmVhdGVkKCgpID0+IHtcbiAgICB2aWV3Ll9fY29uZGl0aW9uVmFyID0gX2NyZWF0ZUJpbmRpbmcoXG4gICAgICB2aWV3LFxuICAgICAgY29uZGl0aW9uRnVuYyxcbiAgICAgICdjb25kaXRpb24nLFxuICAgICAgLy8gU3RvcmUgb25seSB0aGUgYWN0dWFsIGNvbmRpdGlvbi5cbiAgICAgIHZhbHVlID0+ICFCbGF6ZS5fY2FsY3VsYXRlQ29uZGl0aW9uKHZhbHVlKSAhPT0gIV9ub3QsXG4gICAgKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHZpZXc7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEFuIGludmVydGVkIFtgQmxhemUuSWZgXSgjQmxhemUtSWYpLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZGl0aW9uRnVuYyBBIGZ1bmN0aW9uIHRvIHJlYWN0aXZlbHkgcmUtcnVuLiAgSWYgdGhlIHJlc3VsdCBpcyBmYWxzeSwgYGNvbnRlbnRGdW5jYCBpcyBzaG93bixcbiAqICAgb3RoZXJ3aXNlIGBlbHNlRnVuY2AgaXMgc2hvd24uICBBbiBlbXB0eSBhcnJheSBpcyBjb25zaWRlcmVkIGZhbHN5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29udGVudEZ1bmMgQSBGdW5jdGlvbiB0aGF0IHJldHVybnMgWypyZW5kZXJhYmxlIGNvbnRlbnQqXSgjUmVuZGVyYWJsZS1Db250ZW50KS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtlbHNlRnVuY10gT3B0aW9uYWwuICBBIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBbKnJlbmRlcmFibGUgY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpLiAgSWYgbm9cbiAqICAgYGVsc2VGdW5jYCBpcyBzdXBwbGllZCwgbm8gY29udGVudCBpcyBzaG93biBpbiB0aGUgXCJlbHNlXCIgY2FzZS5cbiAqL1xuQmxhemUuVW5sZXNzID0gZnVuY3Rpb24gKGNvbmRpdGlvbkZ1bmMsIGNvbnRlbnRGdW5jLCBlbHNlRnVuYykge1xuICByZXR1cm4gQmxhemUuSWYoY29uZGl0aW9uRnVuYywgY29udGVudEZ1bmMsIGVsc2VGdW5jLCB0cnVlIC8qX25vdCovKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0cyBhIFZpZXcgdGhhdCByZW5kZXJzIGBjb250ZW50RnVuY2AgZm9yIGVhY2ggaXRlbSBpbiBhIHNlcXVlbmNlLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXJnRnVuYyBBIGZ1bmN0aW9uIHRvIHJlYWN0aXZlbHkgcmUtcnVuLiBUaGUgZnVuY3Rpb24gY2FuXG4gKiByZXR1cm4gb25lIG9mIHR3byBvcHRpb25zOlxuICpcbiAqIDEuIEFuIG9iamVjdCB3aXRoIHR3byBmaWVsZHM6ICdfdmFyaWFibGUnIGFuZCAnX3NlcXVlbmNlJy4gRWFjaCBpdGVyYXRlcyBvdmVyXG4gKiAgICdfc2VxdWVuY2UnLCBpdCBtYXkgYmUgYSBDdXJzb3IsIGFuIGFycmF5LCBudWxsLCBvciB1bmRlZmluZWQuIEluc2lkZSB0aGVcbiAqICAgRWFjaCBib2R5IHlvdSB3aWxsIGJlIGFibGUgdG8gZ2V0IHRoZSBjdXJyZW50IGl0ZW0gZnJvbSB0aGUgc2VxdWVuY2UgdXNpbmdcbiAqICAgdGhlIG5hbWUgc3BlY2lmaWVkIGluIHRoZSAnX3ZhcmlhYmxlJyBmaWVsZC5cbiAqXG4gKiAyLiBKdXN0IGEgc2VxdWVuY2UgKEN1cnNvciwgYXJyYXksIG51bGwsIG9yIHVuZGVmaW5lZCkgbm90IHdyYXBwZWQgaW50byBhblxuICogICBvYmplY3QuIEluc2lkZSB0aGUgRWFjaCBib2R5LCB0aGUgY3VycmVudCBpdGVtIHdpbGwgYmUgc2V0IGFzIHRoZSBkYXRhXG4gKiAgIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb250ZW50RnVuYyBBIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyAgWypyZW5kZXJhYmxlXG4gKiBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZWxzZUZ1bmNdIEEgRnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZVxuICogY29udGVudCpdKCNSZW5kZXJhYmxlLUNvbnRlbnQpIHRvIGRpc3BsYXkgaW4gdGhlIGNhc2Ugd2hlbiB0aGVyZSBhcmUgbm8gaXRlbXNcbiAqIGluIHRoZSBzZXF1ZW5jZS5cbiAqL1xuQmxhemUuRWFjaCA9IGZ1bmN0aW9uIChhcmdGdW5jLCBjb250ZW50RnVuYywgZWxzZUZ1bmMpIHtcbiAgY29uc3QgZWFjaFZpZXcgPSBCbGF6ZS5WaWV3KCdlYWNoJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHN1YnZpZXdzID0gdGhpcy5pbml0aWFsU3Vidmlld3M7XG4gICAgdGhpcy5pbml0aWFsU3Vidmlld3MgPSBudWxsO1xuICAgIGlmICh0aGlzLl9pc0NyZWF0ZWRGb3JFeHBhbnNpb24pIHtcbiAgICAgIHRoaXMuZXhwYW5kZWRWYWx1ZURlcCA9IG5ldyBUcmFja2VyLkRlcGVuZGVuY3k7XG4gICAgICB0aGlzLmV4cGFuZGVkVmFsdWVEZXAuZGVwZW5kKCk7XG4gICAgfVxuICAgIHJldHVybiBzdWJ2aWV3cztcbiAgfSk7XG4gIGVhY2hWaWV3LmluaXRpYWxTdWJ2aWV3cyA9IFtdO1xuICBlYWNoVmlldy5udW1JdGVtcyA9IDA7XG4gIGVhY2hWaWV3LmluRWxzZU1vZGUgPSBmYWxzZTtcbiAgZWFjaFZpZXcuc3RvcEhhbmRsZSA9IG51bGw7XG4gIGVhY2hWaWV3LmNvbnRlbnRGdW5jID0gY29udGVudEZ1bmM7XG4gIGVhY2hWaWV3LmVsc2VGdW5jID0gZWxzZUZ1bmM7XG4gIGVhY2hWaWV3LmFyZ1ZhciA9IHVuZGVmaW5lZDtcbiAgZWFjaFZpZXcudmFyaWFibGVOYW1lID0gbnVsbDtcblxuICAvLyB1cGRhdGUgdGhlIEBpbmRleCB2YWx1ZSBpbiB0aGUgc2NvcGUgb2YgYWxsIHN1YnZpZXdzIGluIHRoZSByYW5nZVxuICBjb25zdCB1cGRhdGVJbmRpY2VzID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gICAgaWYgKHRvID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRvID0gZWFjaFZpZXcubnVtSXRlbXMgLSAxO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSBmcm9tOyBpIDw9IHRvOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBlYWNoVmlldy5fZG9tcmFuZ2UubWVtYmVyc1tpXS52aWV3O1xuICAgICAgdmlldy5fc2NvcGVCaW5kaW5nc1snQGluZGV4J10uc2V0KHsgdmFsdWU6IGkgfSk7XG4gICAgfVxuICB9O1xuXG4gIGVhY2hWaWV3Lm9uVmlld0NyZWF0ZWQoZnVuY3Rpb24gKCkge1xuICAgIC8vIFdlIGV2YWx1YXRlIGBhcmdGdW5jYCBpbiBgVHJhY2tlci5hdXRvcnVuYCB0byBlbnN1cmUgYEJsYXplLmN1cnJlbnRWaWV3YFxuICAgIC8vIGlzIGFsd2F5cyBzZXQgd2hlbiBpdCBydW5zLlxuICAgIGVhY2hWaWV3LmFyZ1ZhciA9IF9jcmVhdGVCaW5kaW5nKFxuICAgICAgZWFjaFZpZXcsXG4gICAgICAvLyBVbndyYXAgYSBzZXF1ZW5jZSByZWFjdGl2ZWx5IChge3sjZWFjaCB4IGluIHhzfX1gKS5cbiAgICAgICgpID0+IHtcbiAgICAgICAgbGV0IG1heWJlU2VxdWVuY2UgPSBhcmdGdW5jKCk7XG4gICAgICAgIGlmIChpc09iamVjdChtYXliZVNlcXVlbmNlKSAmJiBoYXMobWF5YmVTZXF1ZW5jZSwgJ19zZXF1ZW5jZScpKSB7XG4gICAgICAgICAgZWFjaFZpZXcudmFyaWFibGVOYW1lID0gbWF5YmVTZXF1ZW5jZS5fdmFyaWFibGUgfHwgbnVsbDtcbiAgICAgICAgICBtYXliZVNlcXVlbmNlID0gbWF5YmVTZXF1ZW5jZS5fc2VxdWVuY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heWJlU2VxdWVuY2U7XG4gICAgICB9LFxuICAgICAgJ2NvbGxlY3Rpb24nLFxuICAgICk7XG5cbiAgICBlYWNoVmlldy5zdG9wSGFuZGxlID0gT2JzZXJ2ZVNlcXVlbmNlLm9ic2VydmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGVhY2hWaWV3LmFyZ1Zhci5nZXQoKT8udmFsdWU7XG4gICAgfSwge1xuICAgICAgYWRkZWRBdDogZnVuY3Rpb24gKGlkLCBpdGVtLCBpbmRleCkge1xuICAgICAgICBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBsZXQgbmV3SXRlbVZpZXc7XG4gICAgICAgICAgaWYgKGVhY2hWaWV3LnZhcmlhYmxlTmFtZSkge1xuICAgICAgICAgICAgLy8gbmV3LXN0eWxlICNlYWNoIChhcyBpbiB7eyNlYWNoIGl0ZW0gaW4gaXRlbXN9fSlcbiAgICAgICAgICAgIC8vIGRvZXNuJ3QgY3JlYXRlIGEgbmV3IGRhdGEgY29udGV4dFxuICAgICAgICAgICAgbmV3SXRlbVZpZXcgPSBCbGF6ZS5WaWV3KCdpdGVtJywgZWFjaFZpZXcuY29udGVudEZ1bmMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdJdGVtVmlldyA9IEJsYXplLldpdGgoaXRlbSwgZWFjaFZpZXcuY29udGVudEZ1bmMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVhY2hWaWV3Lm51bUl0ZW1zKys7XG5cbiAgICAgICAgICBjb25zdCBiaW5kaW5ncyA9IHt9O1xuICAgICAgICAgIGJpbmRpbmdzWydAaW5kZXgnXSA9IGluZGV4O1xuICAgICAgICAgIGlmIChlYWNoVmlldy52YXJpYWJsZU5hbWUpIHtcbiAgICAgICAgICAgIGJpbmRpbmdzW2VhY2hWaWV3LnZhcmlhYmxlTmFtZV0gPSBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICBCbGF6ZS5fYXR0YWNoQmluZGluZ3NUb1ZpZXcoYmluZGluZ3MsIG5ld0l0ZW1WaWV3KTtcblxuICAgICAgICAgIGlmIChlYWNoVmlldy5leHBhbmRlZFZhbHVlRGVwKSB7XG4gICAgICAgICAgICBlYWNoVmlldy5leHBhbmRlZFZhbHVlRGVwLmNoYW5nZWQoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVhY2hWaWV3Ll9kb21yYW5nZSkge1xuICAgICAgICAgICAgaWYgKGVhY2hWaWV3LmluRWxzZU1vZGUpIHtcbiAgICAgICAgICAgICAgZWFjaFZpZXcuX2RvbXJhbmdlLnJlbW92ZU1lbWJlcigwKTtcbiAgICAgICAgICAgICAgZWFjaFZpZXcuaW5FbHNlTW9kZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IEJsYXplLl9tYXRlcmlhbGl6ZVZpZXcobmV3SXRlbVZpZXcsIGVhY2hWaWV3KTtcbiAgICAgICAgICAgIGVhY2hWaWV3Ll9kb21yYW5nZS5hZGRNZW1iZXIocmFuZ2UsIGluZGV4KTtcbiAgICAgICAgICAgIHVwZGF0ZUluZGljZXMoaW5kZXgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlYWNoVmlldy5pbml0aWFsU3Vidmlld3Muc3BsaWNlKGluZGV4LCAwLCBuZXdJdGVtVmlldyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZW1vdmVkQXQ6IGZ1bmN0aW9uIChpZCwgaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZWFjaFZpZXcubnVtSXRlbXMtLTtcbiAgICAgICAgICBpZiAoZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcCkge1xuICAgICAgICAgICAgZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcC5jaGFuZ2VkKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlYWNoVmlldy5fZG9tcmFuZ2UpIHtcbiAgICAgICAgICAgIGVhY2hWaWV3Ll9kb21yYW5nZS5yZW1vdmVNZW1iZXIoaW5kZXgpO1xuICAgICAgICAgICAgdXBkYXRlSW5kaWNlcyhpbmRleCk7XG4gICAgICAgICAgICBpZiAoZWFjaFZpZXcuZWxzZUZ1bmMgJiYgZWFjaFZpZXcubnVtSXRlbXMgPT09IDApIHtcbiAgICAgICAgICAgICAgZWFjaFZpZXcuaW5FbHNlTW9kZSA9IHRydWU7XG4gICAgICAgICAgICAgIGVhY2hWaWV3Ll9kb21yYW5nZS5hZGRNZW1iZXIoXG4gICAgICAgICAgICAgICAgQmxhemUuX21hdGVyaWFsaXplVmlldyhcbiAgICAgICAgICAgICAgICAgIEJsYXplLlZpZXcoJ2VhY2hfZWxzZScsZWFjaFZpZXcuZWxzZUZ1bmMpLFxuICAgICAgICAgICAgICAgICAgZWFjaFZpZXcpLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWFjaFZpZXcuaW5pdGlhbFN1YnZpZXdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBjaGFuZ2VkQXQ6IGZ1bmN0aW9uIChpZCwgbmV3SXRlbSwgb2xkSXRlbSwgaW5kZXgpIHtcbiAgICAgICAgVHJhY2tlci5ub25yZWFjdGl2ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXApIHtcbiAgICAgICAgICAgIGVhY2hWaWV3LmV4cGFuZGVkVmFsdWVEZXAuY2hhbmdlZCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgaXRlbVZpZXc7XG4gICAgICAgICAgICBpZiAoZWFjaFZpZXcuX2RvbXJhbmdlKSB7XG4gICAgICAgICAgICAgIGl0ZW1WaWV3ID0gZWFjaFZpZXcuX2RvbXJhbmdlLmdldE1lbWJlcihpbmRleCkudmlldztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGl0ZW1WaWV3ID0gZWFjaFZpZXcuaW5pdGlhbFN1YnZpZXdzW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlYWNoVmlldy52YXJpYWJsZU5hbWUpIHtcbiAgICAgICAgICAgICAgaXRlbVZpZXcuX3Njb3BlQmluZGluZ3NbZWFjaFZpZXcudmFyaWFibGVOYW1lXS5zZXQoeyB2YWx1ZTogbmV3SXRlbSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGl0ZW1WaWV3LmRhdGFWYXIuc2V0KHsgdmFsdWU6IG5ld0l0ZW0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBtb3ZlZFRvOiBmdW5jdGlvbiAoaWQsIGl0ZW0sIGZyb21JbmRleCwgdG9JbmRleCkge1xuICAgICAgICBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcCkge1xuICAgICAgICAgICAgZWFjaFZpZXcuZXhwYW5kZWRWYWx1ZURlcC5jaGFuZ2VkKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlYWNoVmlldy5fZG9tcmFuZ2UpIHtcbiAgICAgICAgICAgIGVhY2hWaWV3Ll9kb21yYW5nZS5tb3ZlTWVtYmVyKGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgICAgICAgICB1cGRhdGVJbmRpY2VzKFxuICAgICAgICAgICAgICBNYXRoLm1pbihmcm9tSW5kZXgsIHRvSW5kZXgpLCBNYXRoLm1heChmcm9tSW5kZXgsIHRvSW5kZXgpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3Vidmlld3MgPSBlYWNoVmlldy5pbml0aWFsU3Vidmlld3M7XG4gICAgICAgICAgICBjb25zdCBpdGVtVmlldyA9IHN1YnZpZXdzW2Zyb21JbmRleF07XG4gICAgICAgICAgICBzdWJ2aWV3cy5zcGxpY2UoZnJvbUluZGV4LCAxKTtcbiAgICAgICAgICAgIHN1YnZpZXdzLnNwbGljZSh0b0luZGV4LCAwLCBpdGVtVmlldyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChlYWNoVmlldy5lbHNlRnVuYyAmJiBlYWNoVmlldy5udW1JdGVtcyA9PT0gMCkge1xuICAgICAgZWFjaFZpZXcuaW5FbHNlTW9kZSA9IHRydWU7XG4gICAgICBlYWNoVmlldy5pbml0aWFsU3Vidmlld3NbMF0gPVxuICAgICAgICBCbGF6ZS5WaWV3KCdlYWNoX2Vsc2UnLCBlYWNoVmlldy5lbHNlRnVuYyk7XG4gICAgfVxuICB9KTtcblxuICBlYWNoVmlldy5vblZpZXdEZXN0cm95ZWQoZnVuY3Rpb24gKCkge1xuICAgIGlmIChlYWNoVmlldy5zdG9wSGFuZGxlKVxuICAgICAgZWFjaFZpZXcuc3RvcEhhbmRsZS5zdG9wKCk7XG4gIH0pO1xuXG4gIHJldHVybiBlYWNoVmlldztcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGBCbGF6ZS5MZXRgIHZpZXcgdGhhdCB1bndyYXBzIHRoZSBnaXZlbiB2YWx1ZS5cbiAqIEBwYXJhbSB7dW5rbm93bn0gdmFsdWVcbiAqIEByZXR1cm5zIHtCbGF6ZS5WaWV3fVxuICovXG5CbGF6ZS5fQXdhaXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIEJsYXplLkxldCh7IHZhbHVlIH0sIEJsYXplLl9Bd2FpdENvbnRlbnQpO1xufTtcblxuQmxhemUuX0F3YWl0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIEJsYXplLmN1cnJlbnRWaWV3Ll9zY29wZUJpbmRpbmdzLnZhbHVlLmdldCgpPy52YWx1ZTtcbn07XG5cbkJsYXplLl9UZW1wbGF0ZVdpdGggPSBmdW5jdGlvbiAoYXJnLCBjb250ZW50RnVuYykge1xuICBsZXQgdztcblxuICBsZXQgYXJnRnVuYyA9IGFyZztcbiAgaWYgKHR5cGVvZiBhcmcgIT09ICdmdW5jdGlvbicpIHtcbiAgICBhcmdGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICB9XG5cbiAgLy8gVGhpcyBpcyBhIGxpdHRsZSBtZXNzeS4gIFdoZW4gd2UgY29tcGlsZSBge3s+IFRlbXBsYXRlLmNvbnRlbnRCbG9ja319YCwgd2VcbiAgLy8gd3JhcCBpdCBpbiBCbGF6ZS5fSW5PdXRlclRlbXBsYXRlU2NvcGUgaW4gb3JkZXIgdG8gc2tpcCB0aGUgaW50ZXJtZWRpYXRlXG4gIC8vIHBhcmVudCBWaWV3cyBpbiB0aGUgY3VycmVudCB0ZW1wbGF0ZS4gIEhvd2V2ZXIsIHdoZW4gdGhlcmUncyBhbiBhcmd1bWVudFxuICAvLyAoYHt7PiBUZW1wbGF0ZS5jb250ZW50QmxvY2sgYXJnfX1gKSwgdGhlIGFyZ3VtZW50IG5lZWRzIHRvIGJlIGV2YWx1YXRlZFxuICAvLyBpbiB0aGUgb3JpZ2luYWwgc2NvcGUuICBUaGVyZSdzIG5vIGdvb2Qgb3JkZXIgdG8gbmVzdFxuICAvLyBCbGF6ZS5fSW5PdXRlclRlbXBsYXRlU2NvcGUgYW5kIEJsYXplLl9UZW1wbGF0ZVdpdGggdG8gYWNoaWV2ZSB0aGlzLFxuICAvLyBzbyB3ZSB3cmFwIGFyZ0Z1bmMgdG8gcnVuIGl0IGluIHRoZSBcIm9yaWdpbmFsIHBhcmVudFZpZXdcIiBvZiB0aGVcbiAgLy8gQmxhemUuX0luT3V0ZXJUZW1wbGF0ZVNjb3BlLlxuICAvL1xuICAvLyBUbyBtYWtlIHRoaXMgYmV0dGVyLCByZWNvbnNpZGVyIF9Jbk91dGVyVGVtcGxhdGVTY29wZSBhcyBhIHByaW1pdGl2ZS5cbiAgLy8gTG9uZ2VyIHRlcm0sIGV2YWx1YXRlIGV4cHJlc3Npb25zIGluIHRoZSBwcm9wZXIgbGV4aWNhbCBzY29wZS5cbiAgY29uc3Qgd3JhcHBlZEFyZ0Z1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHZpZXdUb0V2YWx1YXRlQXJnID0gbnVsbDtcbiAgICBpZiAody5wYXJlbnRWaWV3ICYmIHcucGFyZW50Vmlldy5uYW1lID09PSAnSW5PdXRlclRlbXBsYXRlU2NvcGUnKSB7XG4gICAgICB2aWV3VG9FdmFsdWF0ZUFyZyA9IHcucGFyZW50Vmlldy5vcmlnaW5hbFBhcmVudFZpZXc7XG4gICAgfVxuICAgIGlmICh2aWV3VG9FdmFsdWF0ZUFyZykge1xuICAgICAgcmV0dXJuIEJsYXplLl93aXRoQ3VycmVudFZpZXcodmlld1RvRXZhbHVhdGVBcmcsIGFyZ0Z1bmMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYXJnRnVuYygpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB3cmFwcGVkQ29udGVudEZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBjb250ZW50RnVuYy5jYWxsKHRoaXMpO1xuXG4gICAgLy8gU2luY2Ugd2UgYXJlIGdlbmVyYXRpbmcgdGhlIEJsYXplLl9UZW1wbGF0ZVdpdGggdmlldyBmb3IgdGhlXG4gICAgLy8gdXNlciwgc2V0IHRoZSBmbGFnIG9uIHRoZSBjaGlsZCB2aWV3LiAgSWYgYGNvbnRlbnRgIGlzIGEgdGVtcGxhdGUsXG4gICAgLy8gY29uc3RydWN0IHRoZSBWaWV3IHNvIHRoYXQgd2UgY2FuIHNldCB0aGUgZmxhZy5cbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIEJsYXplLlRlbXBsYXRlKSB7XG4gICAgICBjb250ZW50ID0gY29udGVudC5jb25zdHJ1Y3RWaWV3KCk7XG4gICAgfVxuICAgIGlmIChjb250ZW50IGluc3RhbmNlb2YgQmxhemUuVmlldykge1xuICAgICAgY29udGVudC5faGFzR2VuZXJhdGVkUGFyZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGVudDtcbiAgfTtcblxuICB3ID0gQmxhemUuV2l0aCh3cmFwcGVkQXJnRnVuYywgd3JhcHBlZENvbnRlbnRGdW5jKTtcbiAgdy5fX2lzVGVtcGxhdGVXaXRoID0gdHJ1ZTtcbiAgcmV0dXJuIHc7XG59O1xuXG5CbGF6ZS5fSW5PdXRlclRlbXBsYXRlU2NvcGUgPSBmdW5jdGlvbiAodGVtcGxhdGVWaWV3LCBjb250ZW50RnVuYykge1xuICBjb25zdCB2aWV3ID0gQmxhemUuVmlldygnSW5PdXRlclRlbXBsYXRlU2NvcGUnLCBjb250ZW50RnVuYyk7XG4gIGxldCBwYXJlbnRWaWV3ID0gdGVtcGxhdGVWaWV3LnBhcmVudFZpZXc7XG5cbiAgLy8gSGFjayBzbyB0aGF0IGlmIHlvdSBjYWxsIGB7ez4gZm9vIGJhcn19YCBhbmQgaXQgZXhwYW5kcyBpbnRvXG4gIC8vIGB7eyN3aXRoIGJhcn19e3s+IGZvb319e3svd2l0aH19YCwgYW5kIHRoZW4gYGZvb2AgaXMgYSB0ZW1wbGF0ZVxuICAvLyB0aGF0IGluc2VydHMgYHt7PiBUZW1wbGF0ZS5jb250ZW50QmxvY2t9fWAsIHRoZSBkYXRhIGNvbnRleHQgZm9yXG4gIC8vIGBUZW1wbGF0ZS5jb250ZW50QmxvY2tgIGlzIG5vdCBgYmFyYCBidXQgdGhlIG9uZSBlbmNsb3NpbmcgdGhhdC5cbiAgaWYgKHBhcmVudFZpZXcuX19pc1RlbXBsYXRlV2l0aClcbiAgICBwYXJlbnRWaWV3ID0gcGFyZW50Vmlldy5wYXJlbnRWaWV3O1xuXG4gIHZpZXcub25WaWV3Q3JlYXRlZChmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcmlnaW5hbFBhcmVudFZpZXcgPSB0aGlzLnBhcmVudFZpZXc7XG4gICAgdGhpcy5wYXJlbnRWaWV3ID0gcGFyZW50VmlldztcbiAgICB0aGlzLl9fY2hpbGREb2VzbnRTdGFydE5ld0xleGljYWxTY29wZSA9IHRydWU7XG4gIH0pO1xuICByZXR1cm4gdmlldztcbn07XG5cbiIsImltcG9ydCBoYXMgZnJvbSAnbG9kYXNoLmhhcyc7XG5cbi8qKiBAcGFyYW0ge2Z1bmN0aW9uKEJpbmRpbmcpOiBib29sZWFufSBmbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZUJpbmRpbmdzSGVscGVyKGZuKSB7XG4gIC8qKiBAcGFyYW0ge3N0cmluZ1tdfSBuYW1lcyAqL1xuICByZXR1cm4gKC4uLm5hbWVzKSA9PiB7XG4gICAgY29uc3QgdmlldyA9IEJsYXplLmN1cnJlbnRWaWV3O1xuXG4gICAgLy8gVGhlcmUncyBlaXRoZXIgemVybyBhcmd1bWVudHMgKGkuZS4sIGNoZWNrIGFsbCBiaW5kaW5ncykgb3IgYW4gYWRkaXRpb25hbFxuICAgIC8vIFwiaGFzaFwiIGFyZ3VtZW50IHRoYXQgd2UgaGF2ZSB0byBpZ25vcmUuXG4gICAgbmFtZXMgPSBuYW1lcy5sZW5ndGggPT09IDBcbiAgICAgIC8vIFRPRE86IFNob3VsZCB3ZSB3YWxrIHVwIHRoZSBiaW5kaW5ncyBoZXJlP1xuICAgICAgPyBPYmplY3Qua2V5cyh2aWV3Ll9zY29wZUJpbmRpbmdzKVxuICAgICAgOiBuYW1lcy5zbGljZSgwLCAtMSk7XG5cbiAgICByZXR1cm4gbmFtZXMuc29tZShuYW1lID0+IHtcbiAgICAgIGNvbnN0IGJpbmRpbmcgPSBfbGV4aWNhbEJpbmRpbmdMb29rdXAodmlldywgbmFtZSk7XG4gICAgICBpZiAoIWJpbmRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCaW5kaW5nIGZvciBcIiR7bmFtZX1cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oYmluZGluZy5nZXQoKSk7XG4gICAgfSk7XG4gIH07XG59XG5cbkJsYXplLl9nbG9iYWxIZWxwZXJzID0ge1xuICAvKiogQHN1bW1hcnkgQ2hlY2sgd2hldGhlciBhbnkgb2YgdGhlIGdpdmVuIGJpbmRpbmdzIChvciBhbGwgaWYgbm9uZSBnaXZlbikgaXMgc3RpbGwgcGVuZGluZy4gKi9cbiAgJ0BwZW5kaW5nJzogX2NyZWF0ZUJpbmRpbmdzSGVscGVyKGJpbmRpbmcgPT4gYmluZGluZyA9PT0gdW5kZWZpbmVkKSxcbiAgLyoqIEBzdW1tYXJ5IENoZWNrIHdoZXRoZXIgYW55IG9mIHRoZSBnaXZlbiBiaW5kaW5ncyAob3IgYWxsIGlmIG5vbmUgZ2l2ZW4pIGhhcyByZWplY3RlZC4gKi9cbiAgJ0ByZWplY3RlZCc6IF9jcmVhdGVCaW5kaW5nc0hlbHBlcihiaW5kaW5nID0+ICEhYmluZGluZyAmJiAnZXJyb3InIGluIGJpbmRpbmcpLFxuICAvKiogQHN1bW1hcnkgQ2hlY2sgd2hldGhlciBhbnkgb2YgdGhlIGdpdmVuIGJpbmRpbmdzIChvciBhbGwgaWYgbm9uZSBnaXZlbikgaGFzIHJlc29sdmVkLiAqL1xuICAnQHJlc29sdmVkJzogX2NyZWF0ZUJpbmRpbmdzSGVscGVyKGJpbmRpbmcgPT4gISFiaW5kaW5nICYmICd2YWx1ZScgaW4gYmluZGluZyksXG59O1xuXG4vLyBEb2N1bWVudGVkIGFzIFRlbXBsYXRlLnJlZ2lzdGVySGVscGVyLlxuLy8gVGhpcyBkZWZpbml0aW9uIGFsc28gcHJvdmlkZXMgYmFjay1jb21wYXQgZm9yIGBVSS5yZWdpc3RlckhlbHBlcmAuXG5CbGF6ZS5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uIChuYW1lLCBmdW5jKSB7XG4gIEJsYXplLl9nbG9iYWxIZWxwZXJzW25hbWVdID0gZnVuYztcbn07XG5cbi8vIEFsc28gZG9jdW1lbnRlZCBhcyBUZW1wbGF0ZS5kZXJlZ2lzdGVySGVscGVyXG5CbGF6ZS5kZXJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSkge1xuICBkZWxldGUgQmxhemUuX2dsb2JhbEhlbHBlcnNbbmFtZV07XG59O1xuXG5jb25zdCBiaW5kSWZJc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHgsIHRhcmdldCkge1xuICBpZiAodHlwZW9mIHggIT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHg7XG4gIHJldHVybiBCbGF6ZS5fYmluZCh4LCB0YXJnZXQpO1xufTtcblxuLy8gSWYgYHhgIGlzIGEgZnVuY3Rpb24sIGJpbmRzIHRoZSB2YWx1ZSBvZiBgdGhpc2AgZm9yIHRoYXQgZnVuY3Rpb25cbi8vIHRvIHRoZSBjdXJyZW50IGRhdGEgY29udGV4dC5cbmNvbnN0IGJpbmREYXRhQ29udGV4dCA9IGZ1bmN0aW9uICh4KSB7XG4gIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgbGV0IGRhdGEgPSBCbGF6ZS5nZXREYXRhKCk7XG4gICAgICBpZiAoZGF0YSA9PSBudWxsKVxuICAgICAgICBkYXRhID0ge307XG4gICAgICByZXR1cm4geC5hcHBseShkYXRhLCBhcmdzKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuQmxhemUuX09MRFNUWUxFX0hFTFBFUiA9IHt9O1xuXG5CbGF6ZS5fZ2V0VGVtcGxhdGVIZWxwZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIG5hbWUsIHRtcGxJbnN0YW5jZUZ1bmMpIHtcbiAgLy8gWFhYIENPTVBBVCBXSVRIIDAuOS4zXG4gIGxldCBpc0tub3duT2xkU3R5bGVIZWxwZXIgPSBmYWxzZTtcblxuICBpZiAodGVtcGxhdGUuX19oZWxwZXJzLmhhcyhuYW1lKSkge1xuICAgIGNvbnN0IGhlbHBlciA9IHRlbXBsYXRlLl9faGVscGVycy5nZXQobmFtZSk7XG4gICAgaWYgKGhlbHBlciA9PT0gQmxhemUuX09MRFNUWUxFX0hFTFBFUikge1xuICAgICAgaXNLbm93bk9sZFN0eWxlSGVscGVyID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGhlbHBlciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBwcmludE5hbWUgPSBgJHt0ZW1wbGF0ZS52aWV3TmFtZX0gJHtuYW1lfWA7XG4gICAgICByZXR1cm4gd3JhcEhlbHBlcihiaW5kRGF0YUNvbnRleHQoaGVscGVyKSwgdG1wbEluc3RhbmNlRnVuYywgcHJpbnROYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gb2xkLXN0eWxlIGhlbHBlclxuICBpZiAobmFtZSBpbiB0ZW1wbGF0ZSkge1xuICAgIC8vIE9ubHkgd2FybiBvbmNlIHBlciBoZWxwZXJcbiAgICBpZiAoISBpc0tub3duT2xkU3R5bGVIZWxwZXIpIHtcbiAgICAgIHRlbXBsYXRlLl9faGVscGVycy5zZXQobmFtZSwgQmxhemUuX09MRFNUWUxFX0hFTFBFUik7XG4gICAgICBpZiAoISB0ZW1wbGF0ZS5fTk9XQVJOX09MRFNUWUxFX0hFTFBFUlMpIHtcbiAgICAgICAgQmxhemUuX3dhcm4oJ0Fzc2lnbmluZyBoZWxwZXIgd2l0aCBgJyArIHRlbXBsYXRlLnZpZXdOYW1lICsgJy4nICtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSArICcgPSAuLi5gIGlzIGRlcHJlY2F0ZWQuICBVc2UgYCcgKyB0ZW1wbGF0ZS52aWV3TmFtZSArXG4gICAgICAgICAgICAgICAgICAgICcuaGVscGVycyguLi4pYCBpbnN0ZWFkLicpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGVtcGxhdGVbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHdyYXBIZWxwZXIoYmluZERhdGFDb250ZXh0KHRlbXBsYXRlW25hbWVdKSwgdG1wbEluc3RhbmNlRnVuYyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5jb25zdCB3cmFwSGVscGVyID0gZnVuY3Rpb24gKGYsIHRlbXBsYXRlRnVuYywgbmFtZSA9ICd0ZW1wbGF0ZSBoZWxwZXInKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIGY7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBCbGF6ZS5UZW1wbGF0ZS5fd2l0aFRlbXBsYXRlSW5zdGFuY2VGdW5jKHRlbXBsYXRlRnVuYywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEJsYXplLl93cmFwQ2F0Y2hpbmdFeGNlcHRpb25zKGYsIG5hbWUpLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xufTtcblxuZnVuY3Rpb24gX2xleGljYWxLZWVwR29pbmcoY3VycmVudFZpZXcpIHtcbiAgaWYgKCFjdXJyZW50Vmlldy5wYXJlbnRWaWV3KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoIWN1cnJlbnRWaWV3Ll9fc3RhcnRzTmV3TGV4aWNhbFNjb3BlKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRWaWV3LnBhcmVudFZpZXc7XG4gIH1cbiAgaWYgKGN1cnJlbnRWaWV3LnBhcmVudFZpZXcuX19jaGlsZERvZXNudFN0YXJ0TmV3TGV4aWNhbFNjb3BlKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRWaWV3LnBhcmVudFZpZXc7XG4gIH1cblxuICAvLyBpbiB0aGUgY2FzZSBvZiB7ez4gVGVtcGxhdGUuY29udGVudEJsb2NrIGRhdGF9fSB0aGUgY29udGVudEJsb2NrIGxvc2VzIHRoZSBsZXhpY2FsIHNjb3BlIG9mIGl0J3MgcGFyZW50LCB3aGVyYXMge3s+IFRlbXBsYXRlLmNvbnRlbnRCbG9ja319IGl0IGRvZXMgbm90XG4gIC8vIHRoaXMgaXMgYmVjYXVzZSBhICN3aXRoIHNpdHMgYmV0d2VlbiB0aGUgaW5jbHVkZSBJbk91dGVyVGVtcGxhdGVTY29wZVxuICBpZiAoY3VycmVudFZpZXcucGFyZW50Vmlldy5uYW1lID09PSBcIndpdGhcIiAmJiBjdXJyZW50Vmlldy5wYXJlbnRWaWV3LnBhcmVudFZpZXcgJiYgY3VycmVudFZpZXcucGFyZW50Vmlldy5wYXJlbnRWaWV3Ll9fY2hpbGREb2VzbnRTdGFydE5ld0xleGljYWxTY29wZSkge1xuICAgIHJldHVybiBjdXJyZW50Vmlldy5wYXJlbnRWaWV3O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9sZXhpY2FsQmluZGluZ0xvb2t1cCh2aWV3LCBuYW1lKSB7XG4gIGxldCBjdXJyZW50VmlldyA9IHZpZXc7XG5cbiAgLy8gd2FsayB1cCB0aGUgdmlld3Mgc3RvcHBpbmcgYXQgYSBTcGFjZWJhcnMuaW5jbHVkZSBvciBUZW1wbGF0ZSB2aWV3IHRoYXRcbiAgLy8gZG9lc24ndCBoYXZlIGFuIEluT3V0ZXJUZW1wbGF0ZVNjb3BlIHZpZXcgYXMgYSBwYXJlbnRcbiAgZG8ge1xuICAgIC8vIHNraXAgYmxvY2sgaGVscGVycyB2aWV3c1xuICAgIC8vIGlmIHdlIGZvdW5kIHRoZSBiaW5kaW5nIG9uIHRoZSBzY29wZSwgcmV0dXJuIGl0XG4gICAgaWYgKGhhcyhjdXJyZW50Vmlldy5fc2NvcGVCaW5kaW5ncywgbmFtZSkpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Vmlldy5fc2NvcGVCaW5kaW5nc1tuYW1lXTtcbiAgICB9XG4gIH0gd2hpbGUgKGN1cnJlbnRWaWV3ID0gX2xleGljYWxLZWVwR29pbmcoY3VycmVudFZpZXcpKTtcblxuICByZXR1cm4gbnVsbDtcbn1cblxuQmxhemUuX2xleGljYWxCaW5kaW5nTG9va3VwID0gZnVuY3Rpb24gKHZpZXcsIG5hbWUpIHtcbiAgY29uc3QgYmluZGluZyA9IF9sZXhpY2FsQmluZGluZ0xvb2t1cCh2aWV3LCBuYW1lKTtcbiAgcmV0dXJuIGJpbmRpbmcgJiYgKCgpID0+IGJpbmRpbmcuZ2V0KCk/LnZhbHVlKTtcbn07XG5cbi8vIHRlbXBsYXRlSW5zdGFuY2UgYXJndW1lbnQgaXMgcHJvdmlkZWQgdG8gYmUgYXZhaWxhYmxlIGZvciBwb3NzaWJsZVxuLy8gYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb25zIG9mIHRoaXMgZnVuY3Rpb24gYnkgM3JkIHBhcnR5IHBhY2thZ2VzLlxuQmxhemUuX2dldFRlbXBsYXRlID0gZnVuY3Rpb24gKG5hbWUsIHRlbXBsYXRlSW5zdGFuY2UpIHtcbiAgaWYgKChuYW1lIGluIEJsYXplLlRlbXBsYXRlKSAmJiAoQmxhemUuVGVtcGxhdGVbbmFtZV0gaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSkpIHtcbiAgICByZXR1cm4gQmxhemUuVGVtcGxhdGVbbmFtZV07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5CbGF6ZS5fZ2V0R2xvYmFsSGVscGVyID0gZnVuY3Rpb24gKG5hbWUsIHRlbXBsYXRlSW5zdGFuY2UpIHtcbiAgaWYgKEJsYXplLl9nbG9iYWxIZWxwZXJzW25hbWVdICE9IG51bGwpIHtcbiAgICBjb25zdCBwcmludE5hbWUgPSBgZ2xvYmFsIGhlbHBlciAke25hbWV9YDtcbiAgICByZXR1cm4gd3JhcEhlbHBlcihiaW5kRGF0YUNvbnRleHQoQmxhemUuX2dsb2JhbEhlbHBlcnNbbmFtZV0pLCB0ZW1wbGF0ZUluc3RhbmNlLCBwcmludE5hbWUpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLy8gTG9va3MgdXAgYSBuYW1lLCBsaWtlIFwiZm9vXCIgb3IgXCIuLlwiLCBhcyBhIGhlbHBlciBvZiB0aGVcbi8vIGN1cnJlbnQgdGVtcGxhdGU7IHRoZSBuYW1lIG9mIGEgdGVtcGxhdGU7IGEgZ2xvYmFsIGhlbHBlcjtcbi8vIG9yIGEgcHJvcGVydHkgb2YgdGhlIGRhdGEgY29udGV4dC4gIENhbGxlZCBvbiB0aGUgVmlldyBvZlxuLy8gYSB0ZW1wbGF0ZSAoaS5lLiBhIFZpZXcgd2l0aCBhIGAudGVtcGxhdGVgIHByb3BlcnR5LFxuLy8gd2hlcmUgdGhlIGhlbHBlcnMgYXJlKS4gIFVzZWQgZm9yIHRoZSBmaXJzdCBuYW1lIGluIGFcbi8vIFwicGF0aFwiIGluIGEgdGVtcGxhdGUgdGFnLCBsaWtlIFwiZm9vXCIgaW4gYHt7Zm9vLmJhcn19YCBvclxuLy8gXCIuLlwiIGluIGB7e2Zyb2J1bGF0ZSAuLi9ibGFofX1gLlxuLy9cbi8vIFJldHVybnMgYSBmdW5jdGlvbiwgYSBub24tZnVuY3Rpb24gdmFsdWUsIG9yIG51bGwuICBJZlxuLy8gYSBmdW5jdGlvbiBpcyBmb3VuZCwgaXQgaXMgYm91bmQgYXBwcm9wcmlhdGVseS5cbi8vXG4vLyBOT1RFOiBUaGlzIGZ1bmN0aW9uIG11c3Qgbm90IGVzdGFibGlzaCBhbnkgcmVhY3RpdmVcbi8vIGRlcGVuZGVuY2llcyBpdHNlbGYuICBJZiB0aGVyZSBpcyBhbnkgcmVhY3Rpdml0eSBpbiB0aGVcbi8vIHZhbHVlLCBsb29rdXAgc2hvdWxkIHJldHVybiBhIGZ1bmN0aW9uLlxuQmxhemUuVmlldy5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKG5hbWUsIF9vcHRpb25zKSB7XG4gIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcbiAgY29uc3QgbG9va3VwVGVtcGxhdGUgPSBfb3B0aW9ucyAmJiBfb3B0aW9ucy50ZW1wbGF0ZTtcbiAgbGV0IGhlbHBlcjtcbiAgbGV0IGJpbmRpbmc7XG4gIGxldCBib3VuZFRtcGxJbnN0YW5jZTtcbiAgbGV0IGZvdW5kVGVtcGxhdGU7XG5cbiAgaWYgKHRoaXMudGVtcGxhdGVJbnN0YW5jZSkge1xuICAgIGJvdW5kVG1wbEluc3RhbmNlID0gQmxhemUuX2JpbmQodGhpcy50ZW1wbGF0ZUluc3RhbmNlLCB0aGlzKTtcbiAgfVxuXG4gIC8vIDAuIGxvb2tpbmcgdXAgdGhlIHBhcmVudCBkYXRhIGNvbnRleHQgd2l0aCB0aGUgc3BlY2lhbCBcIi4uL1wiIHN5bnRheFxuICBpZiAoL15cXC4vLnRlc3QobmFtZSkpIHtcbiAgICAvLyBzdGFydHMgd2l0aCBhIGRvdC4gbXVzdCBiZSBhIHNlcmllcyBvZiBkb3RzIHdoaWNoIG1hcHMgdG8gYW5cbiAgICAvLyBhbmNlc3RvciBvZiB0aGUgYXBwcm9wcmlhdGUgaGVpZ2h0LlxuICAgIGlmICghL14oXFwuKSskLy50ZXN0KG5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWQgc3RhcnRpbmcgd2l0aCBkb3QgbXVzdCBiZSBhIHNlcmllcyBvZiBkb3RzXCIpO1xuXG4gICAgcmV0dXJuIEJsYXplLl9wYXJlbnREYXRhKG5hbWUubGVuZ3RoIC0gMSwgdHJ1ZSAvKl9mdW5jdGlvbldyYXBwZWQqLyk7XG5cbiAgfVxuXG4gIC8vIDEuIGxvb2sgdXAgYSBoZWxwZXIgb24gdGhlIGN1cnJlbnQgdGVtcGxhdGVcbiAgaWYgKHRlbXBsYXRlICYmICgoaGVscGVyID0gQmxhemUuX2dldFRlbXBsYXRlSGVscGVyKHRlbXBsYXRlLCBuYW1lLCBib3VuZFRtcGxJbnN0YW5jZSkpICE9IG51bGwpKSB7XG4gICAgcmV0dXJuIGhlbHBlcjtcbiAgfVxuXG4gIC8vIDIuIGxvb2sgdXAgYSBiaW5kaW5nIGJ5IHRyYXZlcnNpbmcgdGhlIGxleGljYWwgdmlldyBoaWVyYXJjaHkgaW5zaWRlIHRoZVxuICAvLyBjdXJyZW50IHRlbXBsYXRlXG4gIGlmICh0ZW1wbGF0ZSAmJiAoYmluZGluZyA9IEJsYXplLl9sZXhpY2FsQmluZGluZ0xvb2t1cChCbGF6ZS5jdXJyZW50VmlldywgbmFtZSkpICE9IG51bGwpIHtcbiAgICByZXR1cm4gYmluZGluZztcbiAgfVxuXG4gIC8vIDMuIGxvb2sgdXAgYSB0ZW1wbGF0ZSBieSBuYW1lXG4gIGlmIChsb29rdXBUZW1wbGF0ZSAmJiAoKGZvdW5kVGVtcGxhdGUgPSBCbGF6ZS5fZ2V0VGVtcGxhdGUobmFtZSwgYm91bmRUbXBsSW5zdGFuY2UpKSAhPSBudWxsKSkge1xuICAgIHJldHVybiBmb3VuZFRlbXBsYXRlO1xuICB9XG5cbiAgLy8gNC4gbG9vayB1cCBhIGdsb2JhbCBoZWxwZXJcbiAgaGVscGVyID0gQmxhemUuX2dldEdsb2JhbEhlbHBlcihuYW1lLCBib3VuZFRtcGxJbnN0YW5jZSk7XG4gIGlmIChoZWxwZXIgIT0gbnVsbCkge1xuICAgIHJldHVybiBoZWxwZXI7XG4gIH1cblxuICAvLyA1LiBsb29rIHVwIGluIGEgZGF0YSBjb250ZXh0XG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIGNvbnN0IGlzQ2FsbGVkQXNGdW5jdGlvbiA9IChhcmdzLmxlbmd0aCA+IDApO1xuICAgIGNvbnN0IGRhdGEgPSBCbGF6ZS5nZXREYXRhKCk7XG4gICAgY29uc3QgeCA9IGRhdGEgJiYgZGF0YVtuYW1lXTtcbiAgICBpZiAoISB4KSB7XG4gICAgICBpZiAobG9va3VwVGVtcGxhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gc3VjaCB0ZW1wbGF0ZTogXCIgKyBuYW1lKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNDYWxsZWRBc0Z1bmN0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggZnVuY3Rpb246IFwiICsgbmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSAnQCcgJiYgKCh4ID09PSBudWxsKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoeCA9PT0gdW5kZWZpbmVkKSkpIHtcbiAgICAgICAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgdGhlIHVzZXIgdHJpZXMgdG8gdXNlIGEgYEBkaXJlY3RpdmVgXG4gICAgICAgIC8vIHRoYXQgZG9lc24ndCBleGlzdC4gIFdlIGRvbid0IGltcGxlbWVudCBhbGwgZGlyZWN0aXZlc1xuICAgICAgICAvLyBmcm9tIEhhbmRsZWJhcnMsIHNvIHRoZXJlJ3MgYSBwb3RlbnRpYWwgZm9yIGNvbmZ1c2lvblxuICAgICAgICAvLyBpZiB3ZSBmYWlsIHNpbGVudGx5LiAgT24gdGhlIG90aGVyIGhhbmQsIHdlIHdhbnQgdG9cbiAgICAgICAgLy8gdGhyb3cgbGF0ZSBpbiBjYXNlIHNvbWUgYXBwIG9yIHBhY2thZ2Ugd2FudHMgdG8gcHJvdmlkZVxuICAgICAgICAvLyBhIG1pc3NpbmcgZGlyZWN0aXZlLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBkaXJlY3RpdmU6IFwiICsgbmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghIGRhdGEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHggIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChpc0NhbGxlZEFzRnVuY3Rpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBub24tZnVuY3Rpb246IFwiICsgeCk7XG4gICAgICB9XG4gICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgcmV0dXJuIHguYXBwbHkoZGF0YSwgYXJncyk7XG4gIH07XG59O1xuXG4vLyBJbXBsZW1lbnQgU3BhY2ViYXJzJyB7ey4uLy4ufX0uXG4vLyBAcGFyYW0gaGVpZ2h0IHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgJy4uJ3NcbkJsYXplLl9wYXJlbnREYXRhID0gZnVuY3Rpb24gKGhlaWdodCwgX2Z1bmN0aW9uV3JhcHBlZCkge1xuICAvLyBJZiBoZWlnaHQgaXMgbnVsbCBvciB1bmRlZmluZWQsIHdlIGRlZmF1bHQgdG8gMSwgdGhlIGZpcnN0IHBhcmVudC5cbiAgaWYgKGhlaWdodCA9PSBudWxsKSB7XG4gICAgaGVpZ2h0ID0gMTtcbiAgfVxuICBsZXQgdGhlV2l0aCA9IEJsYXplLmdldFZpZXcoJ3dpdGgnKTtcbiAgZm9yIChsZXQgaSA9IDA7IChpIDwgaGVpZ2h0KSAmJiB0aGVXaXRoOyBpKyspIHtcbiAgICB0aGVXaXRoID0gQmxhemUuZ2V0Vmlldyh0aGVXaXRoLCAnd2l0aCcpO1xuICB9XG5cbiAgaWYgKCEgdGhlV2l0aClcbiAgICByZXR1cm4gbnVsbDtcbiAgaWYgKF9mdW5jdGlvbldyYXBwZWQpXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoZVdpdGguZGF0YVZhci5nZXQoKT8udmFsdWU7IH07XG4gIHJldHVybiB0aGVXaXRoLmRhdGFWYXIuZ2V0KCk/LnZhbHVlO1xufTtcblxuXG5CbGF6ZS5WaWV3LnByb3RvdHlwZS5sb29rdXBUZW1wbGF0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiB0aGlzLmxvb2t1cChuYW1lLCB7dGVtcGxhdGU6dHJ1ZX0pO1xufTtcbiIsImltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2guaXNvYmplY3QnO1xuaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnbG9kYXNoLmlzZnVuY3Rpb24nO1xuaW1wb3J0IGhhcyBmcm9tICdsb2Rhc2guaGFzJztcbmltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcblxuLy8gW25ld10gQmxhemUuVGVtcGxhdGUoW3ZpZXdOYW1lXSwgcmVuZGVyRnVuY3Rpb24pXG4vL1xuLy8gYEJsYXplLlRlbXBsYXRlYCBpcyB0aGUgY2xhc3Mgb2YgdGVtcGxhdGVzLCBsaWtlIGBUZW1wbGF0ZS5mb29gIGluXG4vLyBNZXRlb3IsIHdoaWNoIGlzIGBpbnN0YW5jZW9mIFRlbXBsYXRlYC5cbi8vXG4vLyBgdmlld0tpbmRgIGlzIGEgc3RyaW5nIHRoYXQgbG9va3MgbGlrZSBcIlRlbXBsYXRlLmZvb1wiIGZvciB0ZW1wbGF0ZXNcbi8vIGRlZmluZWQgYnkgdGhlIGNvbXBpbGVyLlxuXG4vKipcbiAqIEBjbGFzc1xuICogQHN1bW1hcnkgQ29uc3RydWN0b3IgZm9yIGEgVGVtcGxhdGUsIHdoaWNoIGlzIHVzZWQgdG8gY29uc3RydWN0IFZpZXdzIHdpdGggcGFydGljdWxhciBuYW1lIGFuZCBjb250ZW50LlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtTdHJpbmd9IFt2aWV3TmFtZV0gT3B0aW9uYWwuICBBIG5hbWUgZm9yIFZpZXdzIGNvbnN0cnVjdGVkIGJ5IHRoaXMgVGVtcGxhdGUuICBTZWUgW2B2aWV3Lm5hbWVgXSgjdmlld19uYW1lKS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlbmRlckZ1bmN0aW9uIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIFsqcmVuZGVyYWJsZSBjb250ZW50Kl0oI1JlbmRlcmFibGUtQ29udGVudCkuICBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgYXMgdGhlIGByZW5kZXJGdW5jdGlvbmAgZm9yIFZpZXdzIGNvbnN0cnVjdGVkIGJ5IHRoaXMgVGVtcGxhdGUuXG4gKi9cbkJsYXplLlRlbXBsYXRlID0gZnVuY3Rpb24gKHZpZXdOYW1lLCByZW5kZXJGdW5jdGlvbikge1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIEJsYXplLlRlbXBsYXRlKSlcbiAgICAvLyBjYWxsZWQgd2l0aG91dCBgbmV3YFxuICAgIHJldHVybiBuZXcgQmxhemUuVGVtcGxhdGUodmlld05hbWUsIHJlbmRlckZ1bmN0aW9uKTtcblxuICBpZiAodHlwZW9mIHZpZXdOYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gb21pdHRlZCBcInZpZXdOYW1lXCIgYXJndW1lbnRcbiAgICByZW5kZXJGdW5jdGlvbiA9IHZpZXdOYW1lO1xuICAgIHZpZXdOYW1lID0gJyc7XG4gIH1cbiAgaWYgKHR5cGVvZiB2aWV3TmFtZSAhPT0gJ3N0cmluZycpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwidmlld05hbWUgbXVzdCBiZSBhIFN0cmluZyAob3Igb21pdHRlZClcIik7XG4gIGlmICh0eXBlb2YgcmVuZGVyRnVuY3Rpb24gIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwicmVuZGVyRnVuY3Rpb24gbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuXG4gIHRoaXMudmlld05hbWUgPSB2aWV3TmFtZTtcbiAgdGhpcy5yZW5kZXJGdW5jdGlvbiA9IHJlbmRlckZ1bmN0aW9uO1xuXG4gIHRoaXMuX19oZWxwZXJzID0gbmV3IEhlbHBlck1hcDtcbiAgdGhpcy5fX2V2ZW50TWFwcyA9IFtdO1xuXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHtcbiAgICBjcmVhdGVkOiBbXSxcbiAgICByZW5kZXJlZDogW10sXG4gICAgZGVzdHJveWVkOiBbXVxuICB9O1xufTtcbmNvbnN0IFRlbXBsYXRlID0gQmxhemUuVGVtcGxhdGU7XG5cbmNvbnN0IEhlbHBlck1hcCA9IGZ1bmN0aW9uICgpIHt9O1xuSGVscGVyTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gdGhpc1snICcrbmFtZV07XG59O1xuSGVscGVyTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAobmFtZSwgaGVscGVyKSB7XG4gIHRoaXNbJyAnK25hbWVdID0gaGVscGVyO1xufTtcbkhlbHBlck1hcC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuICh0eXBlb2YgdGhpc1snICcrbmFtZV0gIT09ICd1bmRlZmluZWQnKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmV0dXJucyB0cnVlIGlmIGB2YWx1ZWAgaXMgYSB0ZW1wbGF0ZSBvYmplY3QgbGlrZSBgVGVtcGxhdGUubXlUZW1wbGF0ZWAuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0FueX0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gKi9cbkJsYXplLmlzVGVtcGxhdGUgPSBmdW5jdGlvbiAodCkge1xuICByZXR1cm4gKHQgaW5zdGFuY2VvZiBCbGF6ZS5UZW1wbGF0ZSk7XG59O1xuXG4vKipcbiAqIEBuYW1lICBvbkNyZWF0ZWRcbiAqIEBpbnN0YW5jZVxuICogQG1lbWJlck9mIFRlbXBsYXRlXG4gKiBAc3VtbWFyeSBSZWdpc3RlciBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGFuIGluc3RhbmNlIG9mIHRoaXMgdGVtcGxhdGUgaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEEgZnVuY3Rpb24gdG8gYmUgYWRkZWQgYXMgYSBjYWxsYmFjay5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLnByb3RvdHlwZS5vbkNyZWF0ZWQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgdGhpcy5fY2FsbGJhY2tzLmNyZWF0ZWQucHVzaChjYik7XG59O1xuXG4vKipcbiAqIEBuYW1lICBvblJlbmRlcmVkXG4gKiBAaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhbiBpbnN0YW5jZSBvZiB0aGlzIHRlbXBsYXRlIGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEEgZnVuY3Rpb24gdG8gYmUgYWRkZWQgYXMgYSBjYWxsYmFjay5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLnByb3RvdHlwZS5vblJlbmRlcmVkID0gZnVuY3Rpb24gKGNiKSB7XG4gIHRoaXMuX2NhbGxiYWNrcy5yZW5kZXJlZC5wdXNoKGNiKTtcbn07XG5cbi8qKlxuICogQG5hbWUgIG9uRGVzdHJveWVkXG4gKiBAaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhbiBpbnN0YW5jZSBvZiB0aGlzIHRlbXBsYXRlIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NIGFuZCBkZXN0cm95ZWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBBIGZ1bmN0aW9uIHRvIGJlIGFkZGVkIGFzIGEgY2FsbGJhY2suXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5wcm90b3R5cGUub25EZXN0cm95ZWQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgdGhpcy5fY2FsbGJhY2tzLmRlc3Ryb3llZC5wdXNoKGNiKTtcbn07XG5cblRlbXBsYXRlLnByb3RvdHlwZS5fZ2V0Q2FsbGJhY2tzID0gZnVuY3Rpb24gKHdoaWNoKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBsZXQgY2FsbGJhY2tzID0gc2VsZlt3aGljaF0gPyBbc2VsZlt3aGljaF1dIDogW107XG4gIC8vIEZpcmUgYWxsIGNhbGxiYWNrcyBhZGRlZCB3aXRoIHRoZSBuZXcgQVBJIChUZW1wbGF0ZS5vblJlbmRlcmVkKCkpXG4gIC8vIGFzIHdlbGwgYXMgdGhlIG9sZC1zdHlsZSBjYWxsYmFjayAoZS5nLiBUZW1wbGF0ZS5yZW5kZXJlZCkgZm9yXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5LlxuICBjYWxsYmFja3MgPSBjYWxsYmFja3MuY29uY2F0KHNlbGYuX2NhbGxiYWNrc1t3aGljaF0pO1xuICByZXR1cm4gY2FsbGJhY2tzO1xufTtcblxuY29uc3QgZmlyZUNhbGxiYWNrcyA9IGZ1bmN0aW9uIChjYWxsYmFja3MsIHRlbXBsYXRlKSB7XG4gIFRlbXBsYXRlLl93aXRoVGVtcGxhdGVJbnN0YW5jZUZ1bmMoXG4gICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGVtcGxhdGU7IH0sXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgZm9yIChsZXQgaSA9IDAsIE4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgTjsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrc1tpXS5jYWxsKHRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9KTtcbn07XG5cblRlbXBsYXRlLnByb3RvdHlwZS5jb25zdHJ1Y3RWaWV3ID0gZnVuY3Rpb24gKGNvbnRlbnRGdW5jLCBlbHNlRnVuYykge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgY29uc3QgdmlldyA9IEJsYXplLlZpZXcoc2VsZi52aWV3TmFtZSwgc2VsZi5yZW5kZXJGdW5jdGlvbik7XG4gIHZpZXcudGVtcGxhdGUgPSBzZWxmO1xuXG4gIHZpZXcudGVtcGxhdGVDb250ZW50QmxvY2sgPSAoXG4gICAgY29udGVudEZ1bmMgPyBuZXcgVGVtcGxhdGUoJyhjb250ZW50QmxvY2spJywgY29udGVudEZ1bmMpIDogbnVsbCk7XG4gIHZpZXcudGVtcGxhdGVFbHNlQmxvY2sgPSAoXG4gICAgZWxzZUZ1bmMgPyBuZXcgVGVtcGxhdGUoJyhlbHNlQmxvY2spJywgZWxzZUZ1bmMpIDogbnVsbCk7XG5cbiAgaWYgKHNlbGYuX19ldmVudE1hcHMgfHwgdHlwZW9mIHNlbGYuZXZlbnRzID09PSAnb2JqZWN0Jykge1xuICAgIHZpZXcuX29uVmlld1JlbmRlcmVkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh2aWV3LnJlbmRlckNvdW50ICE9PSAxKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGlmICghIHNlbGYuX19ldmVudE1hcHMubGVuZ3RoICYmIHR5cGVvZiBzZWxmLmV2ZW50cyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAvLyBQcm92aWRlIGxpbWl0ZWQgYmFjay1jb21wYXQgc3VwcG9ydCBmb3IgYC5ldmVudHMgPSB7Li4ufWBcbiAgICAgICAgLy8gc3ludGF4LiAgUGFzcyBgdGVtcGxhdGUuZXZlbnRzYCB0byB0aGUgb3JpZ2luYWwgYC5ldmVudHMoLi4uKWBcbiAgICAgICAgLy8gZnVuY3Rpb24uICBUaGlzIGNvZGUgbXVzdCBydW4gb25seSBvbmNlIHBlciB0ZW1wbGF0ZSwgaW5cbiAgICAgICAgLy8gb3JkZXIgdG8gbm90IGJpbmQgdGhlIGhhbmRsZXJzIG1vcmUgdGhhbiBvbmNlLCB3aGljaCBpc1xuICAgICAgICAvLyBlbnN1cmVkIGJ5IHRoZSBmYWN0IHRoYXQgd2Ugb25seSBkbyB0aGlzIHdoZW4gYF9fZXZlbnRNYXBzYFxuICAgICAgICAvLyBpcyBmYWxzeSwgYW5kIHdlIGNhdXNlIGl0IHRvIGJlIHNldCBub3cuXG4gICAgICAgIFRlbXBsYXRlLnByb3RvdHlwZS5ldmVudHMuY2FsbChzZWxmLCBzZWxmLmV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX19ldmVudE1hcHMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICBCbGF6ZS5fYWRkRXZlbnRNYXAodmlldywgbSwgdmlldyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZpZXcuX3RlbXBsYXRlSW5zdGFuY2UgPSBuZXcgQmxhemUuVGVtcGxhdGVJbnN0YW5jZSh2aWV3KTtcbiAgdmlldy50ZW1wbGF0ZUluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFVwZGF0ZSBkYXRhLCBmaXJzdE5vZGUsIGFuZCBsYXN0Tm9kZSwgYW5kIHJldHVybiB0aGUgVGVtcGxhdGVJbnN0YW5jZVxuICAgIC8vIG9iamVjdC5cbiAgICBjb25zdCBpbnN0ID0gdmlldy5fdGVtcGxhdGVJbnN0YW5jZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBtZW1iZXJPZiBCbGF6ZS5UZW1wbGF0ZUluc3RhbmNlXG4gICAgICogQG5hbWUgIGRhdGFcbiAgICAgKiBAc3VtbWFyeSBUaGUgZGF0YSBjb250ZXh0IG9mIHRoaXMgaW5zdGFuY2UncyBsYXRlc3QgaW52b2NhdGlvbi5cbiAgICAgKiBAbG9jdXMgQ2xpZW50XG4gICAgICovXG4gICAgaW5zdC5kYXRhID0gQmxhemUuZ2V0RGF0YSh2aWV3KTtcblxuICAgIGlmICh2aWV3Ll9kb21yYW5nZSAmJiAhdmlldy5pc0Rlc3Ryb3llZCkge1xuICAgICAgaW5zdC5maXJzdE5vZGUgPSB2aWV3Ll9kb21yYW5nZS5maXJzdE5vZGUoKTtcbiAgICAgIGluc3QubGFzdE5vZGUgPSB2aWV3Ll9kb21yYW5nZS5sYXN0Tm9kZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvbiAnY3JlYXRlZCcgb3IgJ2Rlc3Ryb3llZCcgY2FsbGJhY2tzIHdlIGRvbid0IGhhdmUgYSBEb21SYW5nZVxuICAgICAgaW5zdC5maXJzdE5vZGUgPSBudWxsO1xuICAgICAgaW5zdC5sYXN0Tm9kZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3Q7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuYW1lICBjcmVhdGVkXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyT2YgVGVtcGxhdGVcbiAgICogQHN1bW1hcnkgUHJvdmlkZSBhIGNhbGxiYWNrIHdoZW4gYW4gaW5zdGFuY2Ugb2YgYSB0ZW1wbGF0ZSBpcyBjcmVhdGVkLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqIEBkZXByZWNhdGVkIGluIDEuMVxuICAgKi9cbiAgLy8gVG8gYXZvaWQgc2l0dWF0aW9ucyB3aGVuIG5ldyBjYWxsYmFja3MgYXJlIGFkZGVkIGluIGJldHdlZW4gdmlld1xuICAvLyBpbnN0YW50aWF0aW9uIGFuZCBldmVudCBiZWluZyBmaXJlZCwgZGVjaWRlIG9uIGFsbCBjYWxsYmFja3MgdG8gZmlyZVxuICAvLyBpbW1lZGlhdGVseSBhbmQgdGhlbiBmaXJlIHRoZW0gb24gdGhlIGV2ZW50LlxuICBjb25zdCBjcmVhdGVkQ2FsbGJhY2tzID0gc2VsZi5fZ2V0Q2FsbGJhY2tzKCdjcmVhdGVkJyk7XG4gIHZpZXcub25WaWV3Q3JlYXRlZChmdW5jdGlvbiAoKSB7XG4gICAgZmlyZUNhbGxiYWNrcyhjcmVhdGVkQ2FsbGJhY2tzLCB2aWV3LnRlbXBsYXRlSW5zdGFuY2UoKSk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBAbmFtZSAgcmVuZGVyZWRcbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICAgKiBAc3VtbWFyeSBQcm92aWRlIGEgY2FsbGJhY2sgd2hlbiBhbiBpbnN0YW5jZSBvZiBhIHRlbXBsYXRlIGlzIHJlbmRlcmVkLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqIEBkZXByZWNhdGVkIGluIDEuMVxuICAgKi9cbiAgY29uc3QgcmVuZGVyZWRDYWxsYmFja3MgPSBzZWxmLl9nZXRDYWxsYmFja3MoJ3JlbmRlcmVkJyk7XG4gIHZpZXcub25WaWV3UmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIGZpcmVDYWxsYmFja3MocmVuZGVyZWRDYWxsYmFja3MsIHZpZXcudGVtcGxhdGVJbnN0YW5jZSgpKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEBuYW1lICBkZXN0cm95ZWRcbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICAgKiBAc3VtbWFyeSBQcm92aWRlIGEgY2FsbGJhY2sgd2hlbiBhbiBpbnN0YW5jZSBvZiBhIHRlbXBsYXRlIGlzIGRlc3Ryb3llZC5cbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAZGVwcmVjYXRlZCBpbiAxLjFcbiAgICovXG4gIGNvbnN0IGRlc3Ryb3llZENhbGxiYWNrcyA9IHNlbGYuX2dldENhbGxiYWNrcygnZGVzdHJveWVkJyk7XG4gIHZpZXcub25WaWV3RGVzdHJveWVkKGZ1bmN0aW9uICgpIHtcbiAgICBmaXJlQ2FsbGJhY2tzKGRlc3Ryb3llZENhbGxiYWNrcywgdmlldy50ZW1wbGF0ZUluc3RhbmNlKCkpO1xuICB9KTtcblxuICByZXR1cm4gdmlldztcbn07XG5cbi8qKlxuICogQGNsYXNzXG4gKiBAc3VtbWFyeSBUaGUgY2xhc3MgZm9yIHRlbXBsYXRlIGluc3RhbmNlc1xuICogQHBhcmFtIHtCbGF6ZS5WaWV3fSB2aWV3XG4gKiBAaW5zdGFuY2VOYW1lIHRlbXBsYXRlXG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UgPSBmdW5jdGlvbiAodmlldykge1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIEJsYXplLlRlbXBsYXRlSW5zdGFuY2UpKVxuICAgIC8vIGNhbGxlZCB3aXRob3V0IGBuZXdgXG4gICAgcmV0dXJuIG5ldyBCbGF6ZS5UZW1wbGF0ZUluc3RhbmNlKHZpZXcpO1xuXG4gIGlmICghICh2aWV3IGluc3RhbmNlb2YgQmxhemUuVmlldykpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVmlldyByZXF1aXJlZFwiKTtcblxuICB2aWV3Ll90ZW1wbGF0ZUluc3RhbmNlID0gdGhpcztcblxuICAvKipcbiAgICogQG5hbWUgdmlld1xuICAgKiBAbWVtYmVyT2YgQmxhemUuVGVtcGxhdGVJbnN0YW5jZVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHN1bW1hcnkgVGhlIFtWaWV3XSguLi9hcGkvYmxhemUuaHRtbCNCbGF6ZS1WaWV3KSBvYmplY3QgZm9yIHRoaXMgaW52b2NhdGlvbiBvZiB0aGUgdGVtcGxhdGUuXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICogQHR5cGUge0JsYXplLlZpZXd9XG4gICAqL1xuICB0aGlzLnZpZXcgPSB2aWV3O1xuICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAbmFtZSBmaXJzdE5vZGVcbiAgICogQG1lbWJlck9mIEJsYXplLlRlbXBsYXRlSW5zdGFuY2VcbiAgICogQGluc3RhbmNlXG4gICAqIEBzdW1tYXJ5IFRoZSBmaXJzdCB0b3AtbGV2ZWwgRE9NIG5vZGUgaW4gdGhpcyB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAdHlwZSB7RE9NTm9kZX1cbiAgICovXG4gIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcblxuICAvKipcbiAgICogQG5hbWUgbGFzdE5vZGVcbiAgICogQG1lbWJlck9mIEJsYXplLlRlbXBsYXRlSW5zdGFuY2VcbiAgICogQGluc3RhbmNlXG4gICAqIEBzdW1tYXJ5IFRoZSBsYXN0IHRvcC1sZXZlbCBET00gbm9kZSBpbiB0aGlzIHRlbXBsYXRlIGluc3RhbmNlLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqIEB0eXBlIHtET01Ob2RlfVxuICAgKi9cbiAgdGhpcy5sYXN0Tm9kZSA9IG51bGw7XG5cbiAgLy8gVGhpcyBkZXBlbmRlbmN5IGlzIHVzZWQgdG8gaWRlbnRpZnkgc3RhdGUgdHJhbnNpdGlvbnMgaW5cbiAgLy8gX3N1YnNjcmlwdGlvbkhhbmRsZXMgd2hpY2ggY291bGQgY2F1c2UgdGhlIHJlc3VsdCBvZlxuICAvLyBUZW1wbGF0ZUluc3RhbmNlI3N1YnNjcmlwdGlvbnNSZWFkeSB0byBjaGFuZ2UuIEJhc2ljYWxseSB0aGlzIGlzIHRyaWdnZXJlZFxuICAvLyB3aGVuZXZlciBhIG5ldyBzdWJzY3JpcHRpb24gaGFuZGxlIGlzIGFkZGVkIG9yIHdoZW4gYSBzdWJzY3JpcHRpb24gaGFuZGxlXG4gIC8vIGlzIHJlbW92ZWQgYW5kIHRoZXkgYXJlIG5vdCByZWFkeS5cbiAgdGhpcy5fYWxsU3Vic1JlYWR5RGVwID0gbmV3IFRyYWNrZXIuRGVwZW5kZW5jeSgpO1xuICB0aGlzLl9hbGxTdWJzUmVhZHkgPSBmYWxzZTtcblxuICB0aGlzLl9zdWJzY3JpcHRpb25IYW5kbGVzID0ge307XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEZpbmQgYWxsIGVsZW1lbnRzIG1hdGNoaW5nIGBzZWxlY3RvcmAgaW4gdGhpcyB0ZW1wbGF0ZSBpbnN0YW5jZSwgYW5kIHJldHVybiB0aGVtIGFzIGEgSlF1ZXJ5IG9iamVjdC5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBUaGUgQ1NTIHNlbGVjdG9yIHRvIG1hdGNoLCBzY29wZWQgdG8gdGhlIHRlbXBsYXRlIGNvbnRlbnRzLlxuICogQHJldHVybnMge0RPTU5vZGVbXX1cbiAqL1xuQmxhemUuVGVtcGxhdGVJbnN0YW5jZS5wcm90b3R5cGUuJCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICBjb25zdCB2aWV3ID0gdGhpcy52aWV3O1xuICBpZiAoISB2aWV3Ll9kb21yYW5nZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCB1c2UgJCBvbiB0ZW1wbGF0ZSBpbnN0YW5jZSB3aXRoIG5vIERPTVwiKTtcbiAgcmV0dXJuIHZpZXcuX2RvbXJhbmdlLiQoc2VsZWN0b3IpO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBGaW5kIGFsbCBlbGVtZW50cyBtYXRjaGluZyBgc2VsZWN0b3JgIGluIHRoaXMgdGVtcGxhdGUgaW5zdGFuY2UuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgVGhlIENTUyBzZWxlY3RvciB0byBtYXRjaCwgc2NvcGVkIHRvIHRoZSB0ZW1wbGF0ZSBjb250ZW50cy5cbiAqIEByZXR1cm5zIHtET01FbGVtZW50W119XG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLmZpbmRBbGwgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuJChzZWxlY3RvcikpO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBGaW5kIG9uZSBlbGVtZW50IG1hdGNoaW5nIGBzZWxlY3RvcmAgaW4gdGhpcyB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBUaGUgQ1NTIHNlbGVjdG9yIHRvIG1hdGNoLCBzY29wZWQgdG8gdGhlIHRlbXBsYXRlIGNvbnRlbnRzLlxuICogQHJldHVybnMge0RPTUVsZW1lbnR9XG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgY29uc3QgcmVzdWx0ID0gdGhpcy4kKHNlbGVjdG9yKTtcbiAgcmV0dXJuIHJlc3VsdFswXSB8fCBudWxsO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBIHZlcnNpb24gb2YgW1RyYWNrZXIuYXV0b3J1bl0oaHR0cHM6Ly9kb2NzLm1ldGVvci5jb20vYXBpL3RyYWNrZXIuaHRtbCNUcmFja2VyLWF1dG9ydW4pIHRoYXQgaXMgc3RvcHBlZCB3aGVuIHRoZSB0ZW1wbGF0ZSBpcyBkZXN0cm95ZWQuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBydW5GdW5jIFRoZSBmdW5jdGlvbiB0byBydW4uIEl0IHJlY2VpdmVzIG9uZSBhcmd1bWVudDogYSBUcmFja2VyLkNvbXB1dGF0aW9uIG9iamVjdC5cbiAqL1xuQmxhemUuVGVtcGxhdGVJbnN0YW5jZS5wcm90b3R5cGUuYXV0b3J1biA9IGZ1bmN0aW9uIChmKSB7XG4gIHJldHVybiB0aGlzLnZpZXcuYXV0b3J1bihmKTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQSB2ZXJzaW9uIG9mIFtNZXRlb3Iuc3Vic2NyaWJlXShodHRwczovL2RvY3MubWV0ZW9yLmNvbS9hcGkvcHVic3ViLmh0bWwjTWV0ZW9yLXN1YnNjcmliZSkgdGhhdCBpcyBzdG9wcGVkXG4gKiB3aGVuIHRoZSB0ZW1wbGF0ZSBpcyBkZXN0cm95ZWQuXG4gKiBAcmV0dXJuIHtTdWJzY3JpcHRpb25IYW5kbGV9IFRoZSBzdWJzY3JpcHRpb24gaGFuZGxlIHRvIHRoZSBuZXdseSBtYWRlXG4gKiBzdWJzY3JpcHRpb24uIENhbGwgYGhhbmRsZS5zdG9wKClgIHRvIG1hbnVhbGx5IHN0b3AgdGhlIHN1YnNjcmlwdGlvbiwgb3JcbiAqIGBoYW5kbGUucmVhZHkoKWAgdG8gZmluZCBvdXQgaWYgdGhpcyBwYXJ0aWN1bGFyIHN1YnNjcmlwdGlvbiBoYXMgbG9hZGVkIGFsbFxuICogb2YgaXRzIGluaXRhbCBkYXRhLlxuICogQGxvY3VzIENsaWVudFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgc3Vic2NyaXB0aW9uLiAgTWF0Y2hlcyB0aGUgbmFtZSBvZiB0aGVcbiAqIHNlcnZlcidzIGBwdWJsaXNoKClgIGNhbGwuXG4gKiBAcGFyYW0ge0FueX0gW2FyZzEsYXJnMi4uLl0gT3B0aW9uYWwgYXJndW1lbnRzIHBhc3NlZCB0byBwdWJsaXNoZXIgZnVuY3Rpb25cbiAqIG9uIHNlcnZlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBbb3B0aW9uc10gSWYgYSBmdW5jdGlvbiBpcyBwYXNzZWQgaW5zdGVhZCBvZiBhblxuICogb2JqZWN0LCBpdCBpcyBpbnRlcnByZXRlZCBhcyBhbiBgb25SZWFkeWAgY2FsbGJhY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5vblJlYWR5XSBQYXNzZWQgdG8gW2BNZXRlb3Iuc3Vic2NyaWJlYF0oaHR0cHM6Ly9kb2NzLm1ldGVvci5jb20vYXBpL3B1YnN1Yi5odG1sI01ldGVvci1zdWJzY3JpYmUpLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub25TdG9wXSBQYXNzZWQgdG8gW2BNZXRlb3Iuc3Vic2NyaWJlYF0oaHR0cHM6Ly9kb2NzLm1ldGVvci5jb20vYXBpL3B1YnN1Yi5odG1sI01ldGVvci1zdWJzY3JpYmUpLlxuICogQHBhcmFtIHtERFAuQ29ubmVjdGlvbn0gW29wdGlvbnMuY29ubmVjdGlvbl0gVGhlIGNvbm5lY3Rpb24gb24gd2hpY2ggdG8gbWFrZSB0aGVcbiAqIHN1YnNjcmlwdGlvbi5cbiAqL1xuQmxhemUuVGVtcGxhdGVJbnN0YW5jZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgY29uc3Qgc3ViSGFuZGxlcyA9IHNlbGYuX3N1YnNjcmlwdGlvbkhhbmRsZXM7XG5cbiAgLy8gRHVwbGljYXRlIGxvZ2ljIGZyb20gTWV0ZW9yLnN1YnNjcmliZVxuICBsZXQgb3B0aW9ucyA9IHt9O1xuICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICBjb25zdCBsYXN0UGFyYW0gPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG5cbiAgICAvLyBNYXRjaCBwYXR0ZXJuIHRvIGNoZWNrIGlmIHRoZSBsYXN0IGFyZyBpcyBhbiBvcHRpb25zIGFyZ3VtZW50XG4gICAgY29uc3QgbGFzdFBhcmFtT3B0aW9uc1BhdHRlcm4gPSB7XG4gICAgICBvblJlYWR5OiBNYXRjaC5PcHRpb25hbChGdW5jdGlvbiksXG4gICAgICAvLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSBvbkVycm9yIHVzZWQgdG8gZXhpc3QsIGJ1dCBub3cgd2UgdXNlXG4gICAgICAvLyBvblN0b3Agd2l0aCBhbiBlcnJvciBjYWxsYmFjayBpbnN0ZWFkLlxuICAgICAgb25FcnJvcjogTWF0Y2guT3B0aW9uYWwoRnVuY3Rpb24pLFxuICAgICAgb25TdG9wOiBNYXRjaC5PcHRpb25hbChGdW5jdGlvbiksXG4gICAgICBjb25uZWN0aW9uOiBNYXRjaC5PcHRpb25hbChNYXRjaC5BbnkpXG4gICAgfTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGxhc3RQYXJhbSkpIHtcbiAgICAgIG9wdGlvbnMub25SZWFkeSA9IGFyZ3MucG9wKCk7XG4gICAgfSBlbHNlIGlmIChsYXN0UGFyYW0gJiYgISBpc0VtcHR5KGxhc3RQYXJhbSkgJiYgTWF0Y2gudGVzdChsYXN0UGFyYW0sIGxhc3RQYXJhbU9wdGlvbnNQYXR0ZXJuKSkge1xuICAgICAgb3B0aW9ucyA9IGFyZ3MucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IHN1YkhhbmRsZTtcbiAgY29uc3Qgb2xkU3RvcHBlZCA9IG9wdGlvbnMub25TdG9wO1xuICBvcHRpb25zLm9uU3RvcCA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIC8vIFdoZW4gdGhlIHN1YnNjcmlwdGlvbiBpcyBzdG9wcGVkLCByZW1vdmUgaXQgZnJvbSB0aGUgc2V0IG9mIHRyYWNrZWRcbiAgICAvLyBzdWJzY3JpcHRpb25zIHRvIGF2b2lkIHRoaXMgbGlzdCBncm93aW5nIHdpdGhvdXQgYm91bmRcbiAgICBkZWxldGUgc3ViSGFuZGxlc1tzdWJIYW5kbGUuc3Vic2NyaXB0aW9uSWRdO1xuXG4gICAgLy8gUmVtb3ZpbmcgYSBzdWJzY3JpcHRpb24gY2FuIG9ubHkgY2hhbmdlIHRoZSByZXN1bHQgb2Ygc3Vic2NyaXB0aW9uc1JlYWR5XG4gICAgLy8gaWYgd2UgYXJlIG5vdCByZWFkeSAodGhhdCBzdWJzY3JpcHRpb24gY291bGQgYmUgdGhlIG9uZSBibG9ja2luZyB1cyBiZWluZ1xuICAgIC8vIHJlYWR5KS5cbiAgICBpZiAoISBzZWxmLl9hbGxTdWJzUmVhZHkpIHtcbiAgICAgIHNlbGYuX2FsbFN1YnNSZWFkeURlcC5jaGFuZ2VkKCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFN0b3BwZWQpIHtcbiAgICAgIG9sZFN0b3BwZWQoZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCB7IG9uUmVhZHksIG9uRXJyb3IsIG9uU3RvcCwgY29ubmVjdGlvbiB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2FsbGJhY2tzID0geyBvblJlYWR5LCBvbkVycm9yLCBvblN0b3AgfTtcblxuICAvLyBUaGUgY2FsbGJhY2tzIGFyZSBwYXNzZWQgYXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgYXJndW1lbnRzIGFycmF5IHBhc3NlZCB0b1xuICAvLyBWaWV3I3N1YnNjcmliZVxuICBhcmdzLnB1c2goY2FsbGJhY2tzKTtcblxuICAvLyBWaWV3I3N1YnNjcmliZSB0YWtlcyB0aGUgY29ubmVjdGlvbiBhcyBvbmUgb2YgdGhlIG9wdGlvbnMgaW4gdGhlIGxhc3RcbiAgLy8gYXJndW1lbnRcbiAgc3ViSGFuZGxlID0gc2VsZi52aWV3LnN1YnNjcmliZS5jYWxsKHNlbGYudmlldywgYXJncywge1xuICAgIGNvbm5lY3Rpb246IGNvbm5lY3Rpb25cbiAgfSk7XG5cbiAgaWYgKCFoYXMoc3ViSGFuZGxlcywgc3ViSGFuZGxlLnN1YnNjcmlwdGlvbklkKSkge1xuICAgIHN1YkhhbmRsZXNbc3ViSGFuZGxlLnN1YnNjcmlwdGlvbklkXSA9IHN1YkhhbmRsZTtcblxuICAgIC8vIEFkZGluZyBhIG5ldyBzdWJzY3JpcHRpb24gd2lsbCBhbHdheXMgY2F1c2UgdXMgdG8gdHJhbnNpdGlvbiBmcm9tIHJlYWR5XG4gICAgLy8gdG8gbm90IHJlYWR5LCBidXQgaWYgd2UgYXJlIGFscmVhZHkgbm90IHJlYWR5IHRoZW4gdGhpcyBjYW4ndCBtYWtlIHVzXG4gICAgLy8gcmVhZHkuXG4gICAgaWYgKHNlbGYuX2FsbFN1YnNSZWFkeSkge1xuICAgICAgc2VsZi5fYWxsU3Vic1JlYWR5RGVwLmNoYW5nZWQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3ViSGFuZGxlO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBIHJlYWN0aXZlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIHdoZW4gYWxsIG9mIHRoZSBzdWJzY3JpcHRpb25zXG4gKiBjYWxsZWQgd2l0aCBbdGhpcy5zdWJzY3JpYmVdKCNUZW1wbGF0ZUluc3RhbmNlLXN1YnNjcmliZSkgYXJlIHJlYWR5LlxuICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBhbGwgc3Vic2NyaXB0aW9ucyBvbiB0aGlzIHRlbXBsYXRlIGluc3RhbmNlIGFyZVxuICogcmVhZHkuXG4gKi9cbkJsYXplLlRlbXBsYXRlSW5zdGFuY2UucHJvdG90eXBlLnN1YnNjcmlwdGlvbnNSZWFkeSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fYWxsU3Vic1JlYWR5RGVwLmRlcGVuZCgpO1xuICB0aGlzLl9hbGxTdWJzUmVhZHkgPSBPYmplY3QudmFsdWVzKHRoaXMuX3N1YnNjcmlwdGlvbkhhbmRsZXMpLmV2ZXJ5KChoYW5kbGUpID0+IHtcbiAgICByZXR1cm4gaGFuZGxlLnJlYWR5KCk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLl9hbGxTdWJzUmVhZHk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFNwZWNpZnkgdGVtcGxhdGUgaGVscGVycyBhdmFpbGFibGUgdG8gdGhpcyB0ZW1wbGF0ZS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWxwZXJzIERpY3Rpb25hcnkgb2YgaGVscGVyIGZ1bmN0aW9ucyBieSBuYW1lLlxuICogQGltcG9ydEZyb21QYWNrYWdlIHRlbXBsYXRpbmdcbiAqL1xuVGVtcGxhdGUucHJvdG90eXBlLmhlbHBlcnMgPSBmdW5jdGlvbiAoZGljdCkge1xuICBpZiAoIWlzT2JqZWN0KGRpY3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSGVscGVycyBkaWN0aW9uYXJ5IGhhcyB0byBiZSBhbiBvYmplY3RcIik7XG4gIH1cblxuICBmb3IgKGxldCBrIGluIGRpY3QpIHRoaXMuX19oZWxwZXJzLnNldChrLCBkaWN0W2tdKTtcbn07XG5cbmNvbnN0IGNhblVzZUdldHRlcnMgPSAoZnVuY3Rpb24gKCkge1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgbGV0IG9iaiA9IHt9O1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBcInNlbGZcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9iajsgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gb2JqLnNlbGYgPT09IG9iajtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KSgpO1xuXG5pZiAoY2FuVXNlR2V0dGVycykge1xuICAvLyBMaWtlIEJsYXplLmN1cnJlbnRWaWV3IGJ1dCBmb3IgdGhlIHRlbXBsYXRlIGluc3RhbmNlLiBBIGZ1bmN0aW9uXG4gIC8vIHJhdGhlciB0aGFuIGEgdmFsdWUgc28gdGhhdCBub3QgYWxsIGhlbHBlcnMgYXJlIGltcGxpY2l0bHkgZGVwZW5kZW50XG4gIC8vIG9uIHRoZSBjdXJyZW50IHRlbXBsYXRlIGluc3RhbmNlJ3MgYGRhdGFgIHByb3BlcnR5LCB3aGljaCB3b3VsZCBtYWtlXG4gIC8vIHRoZW0gZGVwZW5kZW50IG9uIHRoZSBkYXRhIGNvbnRleHQgb2YgdGhlIHRlbXBsYXRlIGluY2x1c2lvbi5cbiAgbGV0IGN1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyA9IG51bGw7XG5cbiAgLy8gSWYgZ2V0dGVycyBhcmUgc3VwcG9ydGVkLCBkZWZpbmUgdGhpcyBwcm9wZXJ0eSB3aXRoIGEgZ2V0dGVyIGZ1bmN0aW9uXG4gIC8vIHRvIG1ha2UgaXQgZWZmZWN0aXZlbHkgcmVhZC1vbmx5LCBhbmQgdG8gd29yayBhcm91bmQgdGhpcyBiaXphcnJlIEpTQ1xuICAvLyBidWc6IGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy85OTI2XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUZW1wbGF0ZSwgXCJfY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmM7XG4gICAgfVxuICB9KTtcblxuICBUZW1wbGF0ZS5fd2l0aFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gZnVuY3Rpb24gKHRlbXBsYXRlSW5zdGFuY2VGdW5jLCBmdW5jKSB7XG4gICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBmdW5jdGlvbiwgZ290OiBcIiArIGZ1bmMpO1xuICAgIH1cbiAgICBjb25zdCBvbGRUbXBsSW5zdGFuY2VGdW5jID0gY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jO1xuICAgIHRyeSB7XG4gICAgICBjdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMgPSB0ZW1wbGF0ZUluc3RhbmNlRnVuYztcbiAgICAgIHJldHVybiBmdW5jKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGN1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuYyA9IG9sZFRtcGxJbnN0YW5jZUZ1bmM7XG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgLy8gSWYgZ2V0dGVycyBhcmUgbm90IHN1cHBvcnRlZCwganVzdCB1c2UgYSBub3JtYWwgcHJvcGVydHkuXG4gIFRlbXBsYXRlLl9jdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMgPSBudWxsO1xuXG4gIFRlbXBsYXRlLl93aXRoVGVtcGxhdGVJbnN0YW5jZUZ1bmMgPSBmdW5jdGlvbiAodGVtcGxhdGVJbnN0YW5jZUZ1bmMsIGZ1bmMpIHtcbiAgICBpZiAodHlwZW9mIGZ1bmMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIGZ1bmN0aW9uLCBnb3Q6IFwiICsgZnVuYyk7XG4gICAgfVxuICAgIGNvbnN0IG9sZFRtcGxJbnN0YW5jZUZ1bmMgPSBUZW1wbGF0ZS5fY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jO1xuICAgIHRyeSB7XG4gICAgICBUZW1wbGF0ZS5fY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gdGVtcGxhdGVJbnN0YW5jZUZ1bmM7XG4gICAgICByZXR1cm4gZnVuYygpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBUZW1wbGF0ZS5fY3VycmVudFRlbXBsYXRlSW5zdGFuY2VGdW5jID0gb2xkVG1wbEluc3RhbmNlRnVuYztcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQHN1bW1hcnkgU3BlY2lmeSBldmVudCBoYW5kbGVycyBmb3IgdGhpcyB0ZW1wbGF0ZS5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBwYXJhbSB7RXZlbnRNYXB9IGV2ZW50TWFwIEV2ZW50IGhhbmRsZXJzIHRvIGFzc29jaWF0ZSB3aXRoIHRoaXMgdGVtcGxhdGUuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5wcm90b3R5cGUuZXZlbnRzID0gZnVuY3Rpb24gKGV2ZW50TWFwKSB7XG4gIGlmICghaXNPYmplY3QoZXZlbnRNYXApKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXZlbnQgbWFwIGhhcyB0byBiZSBhbiBvYmplY3RcIik7XG4gIH1cblxuICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXM7XG4gIGxldCBldmVudE1hcDIgPSB7fTtcbiAgZm9yIChsZXQgayBpbiBldmVudE1hcCkge1xuICAgIGV2ZW50TWFwMltrXSA9IChmdW5jdGlvbiAoaywgdikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzOyAvLyBwYXNzZWQgYnkgRXZlbnRBdWdtZW50ZXJcbiAgICAgICAgY29uc3QgW2V2ZW50XSA9IGFyZ3M7XG4gICAgICAgIC8vIEV4aXRpbmcgdGhlIGN1cnJlbnQgY29tcHV0YXRpb24gdG8gYXZvaWQgY3JlYXRpbmcgdW5uZWNlc3NhcnlcbiAgICAgICAgLy8gYW5kIHVuZXhwZWN0ZWQgcmVhY3RpdmUgZGVwZW5kZW5jaWVzIHdpdGggVGVtcGxhdGVzIGRhdGFcbiAgICAgICAgLy8gb3IgYW55IG90aGVyIHJlYWN0aXZlIGRlcGVuZGVuY2llcyBkZWZpbmVkIGluIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIHJldHVybiBUcmFja2VyLm5vbnJlYWN0aXZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBsZXQgZGF0YSA9IEJsYXplLmdldERhdGEoZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkgZGF0YSA9IHt9O1xuICAgICAgICAgIGNvbnN0IHRtcGxJbnN0YW5jZUZ1bmMgPSBCbGF6ZS5fYmluZCh2aWV3LnRlbXBsYXRlSW5zdGFuY2UsIHZpZXcpO1xuICAgICAgICAgIGFyZ3Muc3BsaWNlKDEsIDAsIHRtcGxJbnN0YW5jZUZ1bmMoKSk7XG4gICAgICAgICAgcmV0dXJuIFRlbXBsYXRlLl93aXRoVGVtcGxhdGVJbnN0YW5jZUZ1bmModG1wbEluc3RhbmNlRnVuYywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHYuYXBwbHkoZGF0YSwgYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KShrLCBldmVudE1hcFtrXSk7XG4gIH1cblxuICB0ZW1wbGF0ZS5fX2V2ZW50TWFwcy5wdXNoKGV2ZW50TWFwMik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgaW5zdGFuY2VcbiAqIEBtZW1iZXJPZiBUZW1wbGF0ZVxuICogQHN1bW1hcnkgVGhlIFt0ZW1wbGF0ZSBpbnN0YW5jZV0oI1RlbXBsYXRlLWluc3RhbmNlcykgY29ycmVzcG9uZGluZyB0byB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoZWxwZXIsIGV2ZW50IGhhbmRsZXIsIGNhbGxiYWNrLCBvciBhdXRvcnVuLiAgSWYgdGhlcmUgaXNuJ3Qgb25lLCBgbnVsbGAuXG4gKiBAbG9jdXMgQ2xpZW50XG4gKiBAcmV0dXJucyB7QmxhemUuVGVtcGxhdGVJbnN0YW5jZX1cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gVGVtcGxhdGUuX2N1cnJlbnRUZW1wbGF0ZUluc3RhbmNlRnVuY1xuICAgICYmIFRlbXBsYXRlLl9jdXJyZW50VGVtcGxhdGVJbnN0YW5jZUZ1bmMoKTtcbn07XG5cbi8vIE5vdGU6IFRlbXBsYXRlLmN1cnJlbnREYXRhKCkgaXMgZG9jdW1lbnRlZCB0byB0YWtlIHplcm8gYXJndW1lbnRzLFxuLy8gd2hpbGUgQmxhemUuZ2V0RGF0YSB0YWtlcyB1cCB0byBvbmUuXG5cbi8qKlxuICogQHN1bW1hcnlcbiAqXG4gKiAtIEluc2lkZSBhbiBgb25DcmVhdGVkYCwgYG9uUmVuZGVyZWRgLCBvciBgb25EZXN0cm95ZWRgIGNhbGxiYWNrLCByZXR1cm5zXG4gKiB0aGUgZGF0YSBjb250ZXh0IG9mIHRoZSB0ZW1wbGF0ZS5cbiAqIC0gSW5zaWRlIGFuIGV2ZW50IGhhbmRsZXIsIHJldHVybnMgdGhlIGRhdGEgY29udGV4dCBvZiB0aGUgdGVtcGxhdGUgb24gd2hpY2hcbiAqIHRoaXMgZXZlbnQgaGFuZGxlciB3YXMgZGVmaW5lZC5cbiAqIC0gSW5zaWRlIGEgaGVscGVyLCByZXR1cm5zIHRoZSBkYXRhIGNvbnRleHQgb2YgdGhlIERPTSBub2RlIHdoZXJlIHRoZSBoZWxwZXJcbiAqIHdhcyB1c2VkLlxuICpcbiAqIEVzdGFibGlzaGVzIGEgcmVhY3RpdmUgZGVwZW5kZW5jeSBvbiB0aGUgcmVzdWx0LlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5jdXJyZW50RGF0YSA9IEJsYXplLmdldERhdGE7XG5cbi8qKlxuICogQHN1bW1hcnkgQWNjZXNzZXMgb3RoZXIgZGF0YSBjb250ZXh0cyB0aGF0IGVuY2xvc2UgdGhlIGN1cnJlbnQgZGF0YSBjb250ZXh0LlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0ludGVnZXJ9IFtudW1MZXZlbHNdIFRoZSBudW1iZXIgb2YgbGV2ZWxzIGJleW9uZCB0aGUgY3VycmVudCBkYXRhIGNvbnRleHQgdG8gbG9vay4gRGVmYXVsdHMgdG8gMS5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSB0ZW1wbGF0aW5nXG4gKi9cblRlbXBsYXRlLnBhcmVudERhdGEgPSBCbGF6ZS5fcGFyZW50RGF0YTtcblxuLyoqXG4gKiBAc3VtbWFyeSBEZWZpbmVzIGEgW2hlbHBlciBmdW5jdGlvbl0oI1RlbXBsYXRlLWhlbHBlcnMpIHdoaWNoIGNhbiBiZSB1c2VkIGZyb20gYWxsIHRlbXBsYXRlcy5cbiAqIEBsb2N1cyBDbGllbnRcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGhlbHBlciBmdW5jdGlvbiB5b3UgYXJlIGRlZmluaW5nLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb24gVGhlIGhlbHBlciBmdW5jdGlvbiBpdHNlbGYuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5yZWdpc3RlckhlbHBlciA9IEJsYXplLnJlZ2lzdGVySGVscGVyO1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlbW92ZXMgYSBnbG9iYWwgW2hlbHBlciBmdW5jdGlvbl0oI1RlbXBsYXRlLWhlbHBlcnMpLlxuICogQGxvY3VzIENsaWVudFxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgaGVscGVyIGZ1bmN0aW9uIHlvdSBhcmUgZGVmaW5pbmcuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgdGVtcGxhdGluZ1xuICovXG5UZW1wbGF0ZS5kZXJlZ2lzdGVySGVscGVyID0gQmxhemUuZGVyZWdpc3RlckhlbHBlcjtcbiIsIlVJID0gQmxhemU7XG5cbkJsYXplLlJlYWN0aXZlVmFyID0gUmVhY3RpdmVWYXI7XG5VSS5fdGVtcGxhdGVJbnN0YW5jZSA9IEJsYXplLlRlbXBsYXRlLmluc3RhbmNlO1xuXG5IYW5kbGViYXJzID0ge307XG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gQmxhemUucmVnaXN0ZXJIZWxwZXI7XG5cbkhhbmRsZWJhcnMuX2VzY2FwZSA9IEJsYXplLl9lc2NhcGU7XG5cbi8vIFJldHVybiB0aGVzZSBmcm9tIHt7Li4ufX0gaGVscGVycyB0byBhY2hpZXZlIHRoZSBzYW1lIGFzIHJldHVybmluZ1xuLy8gc3RyaW5ncyBmcm9tIHt7ey4uLn19fSBoZWxwZXJzXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG4iXX0=
