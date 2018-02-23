/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch("customize-root", function (global, Zone, api) {
    // add a helper utility to let user to customize root zone
    // this is not by design, and will not be included in future
    // tc39 zone proposal, it just for test and may change in the future
    var customizeRootZone = global[api.symbol("customizeRootZone")];
    if (!customizeRootZone) {
        return;
    }
    var currentDesc = Object.getOwnPropertyDescriptor(Zone, "current");
    if (!currentDesc) {
        return;
    }
    var currentDescGet = currentDesc.get;
    if (!currentDescGet) {
        return;
    }
    var rootZone = Zone.root;
    Object.defineProperty(Zone, "current", {
        configurable: true,
        enumerable: true,
        get: function () {
            var currentZone = currentDescGet.apply(this, arguments);
            if (currentZone === rootZone) {
                return customizeRootZone;
            }
            return currentZone;
        }
    });
});

})));
