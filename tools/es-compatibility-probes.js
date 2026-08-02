(function (root, factory) {
  var probes = factory();
  if (typeof module === 'object' && module.exports) module.exports = probes;
  if (root) root.ArcluneESProbes = probes;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SYNTAX_TESTS = [
    ['ES5', '"use strict"; return true;'],
    ['ES2015', 'const add = (a, b = 1) => a + b; return add(1) === 2;'],
    ['ES2016', 'return 2 ** 3 === 8;'],
    ['ES2017', 'async function f(){ await 1; } return true;'],
    ['ES2018', 'const {a, ...rest} = {a: 1, b: 2}; async function* g(){ yield 1; } return a === 1 && rest.b === 2;'],
    ['ES2019', 'try { throw 1; } catch { return true; }'],
    ['ES2020', 'const value = ({a: null})?.a ?? 7; return typeof 1n === "bigint" && value === 7;'],
    ['ES2021', 'let value = 0; value ||= 1; return value === 1 && 1_000 === 1000;'],
    ['ES2022', 'class A { #value = 1; static { this.ready = true; } get(){ return this.#value; } } return new A().get() === 1 && A.ready;']
  ];

  var API_TESTS = [
    ['ES2015', function (host) { return typeof host.Promise === 'function' && typeof host.Map === 'function'; }],
    ['ES2016', function () { return typeof Array.prototype.includes === 'function'; }],
    ['ES2017', function (host) { return typeof host.Object.values === 'function'; }],
    ['ES2018', function (host) { return typeof host.Promise.prototype.finally === 'function'; }],
    ['ES2019', function () { return typeof Array.prototype.flat === 'function'; }],
    ['ES2020', function (host) { return typeof host.Promise.allSettled === 'function'; }],
    ['ES2021', function () { return typeof String.prototype.replaceAll === 'function'; }],
    ['ES2022', function () { return typeof Array.prototype.at === 'function'; }],
    ['ES2023', function () { return typeof Array.prototype.toSorted === 'function' && typeof Array.prototype.findLast === 'function'; }],
    ['ES2024', function (host) { return typeof host.Object.groupBy === 'function' && typeof host.Promise.withResolvers === 'function'; }]
  ];

  function evaluateSyntax(source) {
    try { return Function(source)() === true; } catch (error) { return false; }
  }

  function runTests(tests, evaluator) {
    return tests.map(function (test) {
      return { name: test[0], supported: evaluator(test[1]) };
    });
  }

  function continuousEdition(results) {
    var edition = 'trước ES5';
    for (var index = 0; index < results.length; index += 1) {
      if (!results[index].supported) break;
      edition = results[index].name;
    }
    return edition;
  }

  function chromiumMajor(userAgent) {
    var match = /(?:Chrome|Chromium|CriOS)\/(\d+)/.exec(userAgent || '');
    return match ? Number(match[1]) : null;
  }

  function run(host) {
    var runtime = host || globalThis;
    var userAgent = runtime.navigator && runtime.navigator.userAgent || 'không có navigator.userAgent';
    var syntax = runTests(SYNTAX_TESTS, evaluateSyntax);
    var apis = runTests(API_TESTS, function (test) {
      try { return test(runtime) === true; } catch (error) { return false; }
    });
    return {
      userAgent: userAgent,
      chromiumMajor: chromiumMajor(userAgent),
      syntax: syntax,
      apis: apis,
      syntaxEdition: continuousEdition(syntax),
      apiEdition: continuousEdition(apis)
    };
  }

  return { chromiumMajor: chromiumMajor, continuousEdition: continuousEdition, run: run };
}));
