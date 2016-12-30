/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';

const setPrototypeOf = (Object as any).setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}

function mediaQueriesSupported() {
  return 'matchMedia' in window && 'MediaQueryList' in window;

}
(<any>mediaQueriesSupported).message = 'MatchMedia';

/*
 * To test MatchMedia Media Queries we need to resize the browser window.
 * However according to the browser rules you cannot change the size of the current window.
 * The next best thing is to create a new window with window.open and then change its
 * size using window.resizeTo.
 *
 * Unfortunately opening and closing browser windows significantly
 * increases the overall test time.
 */

describe('MatchMedia', ifEnvSupports(mediaQueriesSupported, function() {

  let testZone: Zone;
  let mql: MediaQueryList;
  let originSize;

  beforeEach(function() {
    testZone = Zone.current.fork({name: 'matchMediaTest'});
    //window = window.open("","", "width=100, height=100");
    //if (window.matchMedia) {
    originSize = {width: window.innerWidth, height: window.innerHeight};
    window.resizeTo(100,200);
    console.log('originSize', originSize);
    console.log('currentSize', window.innerWidth, window.innerHeight);
      mql = window.matchMedia("(min-width: 500px)");
      // we set prototype here because the new created window is not
      // patched by zone, and since Firefox 7, we can't resize a window
      // or tab that wasn't created by window.open()
      //if (window['MediaQueryList']) {
       // setPrototypeOf(mql, window['MediaQueryList'].prototype);
      //}
      //console.log('after set prototype', mql);
   // }
  });

  afterEach(function() {
    window.resizeTo(originSize.width, originSize.height);
    window.close();
  });

  function isValidMql(mql: any) {
    try {
      return mql && mql.addListener && window.innerWidth !== originSize.width;
    } catch (err) {
      return false;
    }
  }

  it('should be in the correct zone', function(done) {
    testZone.run(function() {
      if (!isValidMql(mql)) {
        done();
        return;
      }
      console.log('should be in zone', mql, mql.addListener);
      mql.addListener(function() {
        expect(Zone.current.name).toBe(testZone.name);
        done();
      });
      window.resizeTo(600, 250);
    });
  });

  it('should allow adding of a callback', function(done) {
    if (!isValidMql(mql)) {
      done();
      return;
    }
    let log = '';
    mql.addListener(function() {
      log = 'changed';
    });

    window.resizeTo(600, 250);

    //allow some time for the browser to react to window size change
    setTimeout(function() {
      expect(log).toEqual('changed');
      done();
    }, 200);
  });

  it('should allow adding of multiple callbacks', function(done){
    console.log('should be in zone', mql, mql.addListener);
    if (!isValidMql(mql)) {
      done();
      return;
    }
    let log = '';
    mql.addListener(function() {
      log = 'changed';
    });

    mql.addListener(function() {
      log += ';secondchange';
    });

    window.resizeTo(600, 250);
    setTimeout(function() {
      expect(log).toEqual('changed;secondchange');
      done();
    }, 200);
  });

  it('should allow removal of a callback', function(done){
    if (!isValidMql(mql)) {
      done();
      return;
    }
    let log = '';
    let callback1 = function() {
      log += 'callback1';
    }

    let callback2 = function() {
      log += 'callback2';
    }

    mql.addListener(callback1);
    mql.addListener(callback2);
    mql.removeListener(callback1);

    window.resizeTo(600, 250);
    setTimeout(function() {
      expect(log).toEqual('callback2');
      done();
    }, 200);
  });

  it('should allow removal of multiple callbacks', function(done){
    if (!isValidMql(mql)) {
      done();
      return;
    }
    let log = '';
    let callback1 = function() {
      log += 'callback1';
    }

    let callback2 = function() {
      log += 'callback2';
    }

    mql.addListener(callback1);
    mql.addListener(callback2);
    mql.removeListener(callback1);
    mql.removeListener(callback2);

    window.resizeTo(600, 250);
    setTimeout(function() {
      expect(log).toEqual('');
      done();
    }, 200);
  });

  it('should not crash when trying to remove a non registered callback', function(done) {
    if (!isValidMql(mql)) {
      done();
      return;
    }
    let log = '';
    let callback1 = function() {
      log += 'callback1';
    }

    mql.addListener(callback1);

    mql.removeListener(function() {});

    window.resizeTo(600, 250);
    setTimeout(function() {
      expect(log).toEqual('callback1');
      done();
    }, 200);
  });
}));