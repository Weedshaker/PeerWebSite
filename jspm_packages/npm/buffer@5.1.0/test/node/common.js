/* */ 
(function(process) {
  'use strict';
  const assert = require('assert');
  const mustCallChecks = [];
  function runCallChecks(exitCode) {
    if (exitCode !== 0)
      return;
    const failed = mustCallChecks.filter(function(context) {
      if ('minimum' in context) {
        context.messageSegment = `at least ${context.minimum}`;
        return context.actual < context.minimum;
      } else {
        context.messageSegment = `exactly ${context.exact}`;
        return context.actual !== context.exact;
      }
    });
    failed.forEach(function(context) {
      console.log('Mismatched %s function calls. Expected %s, actual %d.', context.name, context.messageSegment, context.actual);
      console.log(context.stack.split('\n').slice(2).join('\n'));
    });
    if (failed.length)
      process.exit(1);
  }
  exports.mustCall = function(fn, exact) {
    return _mustCallInner(fn, exact, 'exact');
  };
  function _mustCallInner(fn, criteria = 1, field) {
    if (process._exiting)
      throw new Error('Cannot use common.mustCall*() in process exit handler');
    if (typeof fn === 'number') {
      criteria = fn;
      fn = noop;
    } else if (fn === undefined) {
      fn = noop;
    }
    if (typeof criteria !== 'number')
      throw new TypeError(`Invalid ${field} value: ${criteria}`);
    const context = {
      [field]: criteria,
      actual: 0,
      stack: (new Error()).stack,
      name: fn.name || '<anonymous>'
    };
    if (mustCallChecks.length === 0)
      process.on('exit', runCallChecks);
    mustCallChecks.push(context);
    return function() {
      context.actual++;
      return fn.apply(this, arguments);
    };
  }
  exports.printSkipMessage = function(msg) {};
  exports.expectsError = function expectsError(fn, settings, exact) {
    if (typeof fn !== 'function') {
      exact = settings;
      settings = fn;
      fn = undefined;
    }
    function innerFn(error) {
      if ('type' in settings) {
        const type = settings.type;
        if (type !== Error && !Error.isPrototypeOf(type)) {
          throw new TypeError('`settings.type` must inherit from `Error`');
        }
        assert(error instanceof type, `${error.name} is not instance of ${type.name}`);
        let typeName = error.constructor.name;
        if (typeName === 'NodeError' && type.name !== 'NodeError') {
          typeName = Object.getPrototypeOf(error.constructor).name;
        }
        assert.strictEqual(typeName, type.name);
      }
      if ('message' in settings) {
        const message = settings.message;
        if (typeof message === 'string') {
          assert.strictEqual(error.message, message);
        } else {
          assert(message.test(error.message), `${error.message} does not match ${message}`);
        }
      }
      if ('name' in settings) {
        assert.strictEqual(error.name, settings.name);
      }
      if (error.constructor.name === 'AssertionError') {
        ['generatedMessage', 'actual', 'expected', 'operator'].forEach((key) => {
          if (key in settings) {
            const actual = error[key];
            const expected = settings[key];
            assert.strictEqual(actual, expected, `${key}: expected ${expected}, not ${actual}`);
          }
        });
      }
      return true;
    }
    if (fn) {
      assert.throws(fn, innerFn);
      return;
    }
    return exports.mustCall(innerFn, exact);
  };
})(require('process'));
