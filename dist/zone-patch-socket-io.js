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
Zone.__load_patch('socketio', function (global, Zone, api) {
    Zone[Zone.__symbol__('socketio')] = function patchSocketIO(io) {
        // io is being mixed with Emitter.prototype, so we can patchEventTargetMethods
        // with io.prototype
        api.patchEventTarget(global, [io.Socket.prototype], {
            useG: false,
            chkDup: false,
            rt: true,
            diff: function (task, delegate) {
                return task.callback === delegate;
            }
        });
        io.Socket.prototype.on = io.Socket.prototype.addEventListener;
        io.Socket.prototype.off = io.Socket.prototype.removeListener =
            io.Socket.prototype.removeAllListeners = io.Socket.prototype.removeEventListener;
    };
});

})));
