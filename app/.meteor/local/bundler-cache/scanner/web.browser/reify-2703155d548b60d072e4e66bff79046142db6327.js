module.export({_:()=>_object_spread});let _define_property;module.link("./_define_property.js",{_(v){_define_property=v}},0);

function _object_spread(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);

        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(
                Object.getOwnPropertySymbols(source).filter(function(sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                })
            );
        }

        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }

    return target;
}

