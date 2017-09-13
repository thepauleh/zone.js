/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('mediasource', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  if (!global['MediaSource']) {
    return;
  }

  const eventTargetAddEventListener = EventTarget.prototype.addEventListener;

  api.patchMethod(global['MediaSource'], 'addSourceBuffer', (delegate: Function, delegateName: string, name: string) =>
    function (self: any, args: any[]) {
    const sourceBuffer = delegate.apply(self, args);
    if (sourceBuffer) {
      if (sourceBuffer.addEventListener && sourceBuffer.addEventListener !== eventTargetAddEventListener) {
        // not patched, try to patch addEventListener
        api.patchEventTarget(global, [sourceBuffer]);
      }
    }
    return sourceBuffer;
  });

});
