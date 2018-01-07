/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

import {n, patchMethod, q, r, zoneSymbol} from './utils';

const taskSymbol = zoneSymbol('zoneTask');

interface TimerOptions extends TaskData {
  handleId: number;
  args: any[];
}

export function patchTimer(window: any, setName: string, cancelName: string, nameSuffix: string) {
  let setNative: Function = null;
  let clearNative: Function = null;
  setName += nameSuffix;
  cancelName += nameSuffix;

  const tasksByHandleId: {[id: number]: Task} = {};

  function scheduleTask(task: Task) {
    const data = <TimerOptions>task.data;
    function timer() {
      try {
        task.invoke.apply(this, arguments);
      } finally {
        if (task.data && task.data.isPeriodic) {
          // issue-934, task will be cancelled
          // even it is a periodic task such as
          // setInterval
          return;
        }
        // q is 'number' string
        if (typeof data.handleId === q) {
          // in non-nodejs env, we remove timerId
          // from local cache
          delete tasksByHandleId[data.handleId];
        } else if (data.handleId) {
          // Node returns complex objects as handleIds
          // we remove task reference from timer object
          (data.handleId as any)[taskSymbol] = null;
        }
      }
    }
    data.args[0] = timer;
    data.handleId = setNative.apply(window, data.args);
    return task;
  }

  function clearTask(task: Task) {
    return clearNative((<TimerOptions>task.data).handleId);
  }

  setNative =
      patchMethod(window, setName, (delegate: Function) => function(self: any, args: any[]) {
        // n is 'function' string
        if (typeof args[0] === n) {
          // Zone.current
          const zone = (Zone as any).c;
          const options: TimerOptions = {
            handleId: null,
            isPeriodic: nameSuffix === 'Interval',
            delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 : null,
            args: args
          };
          // Zone.scheduleMacroTask
          const task = (zone as any).sc(setName, args[0], options, scheduleTask, clearTask);
          if (!task) {
            return task;
          }
          // Node.js must additionally support the ref and unref functions.
          const handle: any = (<TimerOptions>task.data).handleId;
          // q is 'number' string
          if (typeof handle === q) {
            // for non nodejs env, we save handleId: task
            // mapping in local cache for clearTimeout
            tasksByHandleId[handle] = task;
          } else if (handle) {
            // for nodejs env, we save task
            // reference in timerId Object for clearTimeout
            handle[taskSymbol] = task;
          }

          // check whether handle is null, because some polyfill or browser
          // may return undefined from setTimeout/setInterval/setImmediate/requestAnimationFrame
          // n is 'function' string
          if (handle && handle.ref && handle.unref && typeof handle.ref === n &&
              typeof handle.unref === n) {
            (<any>task).ref = (<any>handle).ref.bind(handle);
            (<any>task).unref = (<any>handle).unref.bind(handle);
          }
          // q is 'number' string
          if (typeof handle === q || handle) {
            return handle;
          }
          return task;
        } else {
          // cause an error by calling it directly.
          return delegate.apply(window, args);
        }
      });

  clearNative =
      patchMethod(window, cancelName, (delegate: Function) => function(self: any, args: any[]) {
        const id = args[0];
        let task: Task;
        // q is 'number' string
        if (typeof id === q) {
          // non nodejs env.
          task = tasksByHandleId[id];
        } else {
          // nodejs env.
          task = id && id[taskSymbol];
          // other environments.
          if (!task) {
            task = id;
          }
        }
        // r is 'string'
        if (task && typeof task.type === r) {
          if (task.state !== 'notScheduled' &&
              (task.cancelFn && task.data.isPeriodic || task.runCount === 0)) {
            // q is 'number' string
            if (typeof id === q) {
              delete tasksByHandleId[id];
            } else if (id) {
              id[taskSymbol] = null;
            }
            // Do not cancel already canceled functions
            // zone.cancelTask
            (task.zone as any).ct(task);
          }
        } else {
          // cause an error by calling it directly.
          delegate.apply(window, args);
        }
      });
}
