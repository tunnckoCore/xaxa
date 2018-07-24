#!/usr/bin/env node

/**
 * @copyright 2018-present, Charlike Mike Reagent (https://i.am.charlike.online)
 * @license Apache-2.0
 */

'use strict';

const proc = require('process');
const arrayify = require('arrayify');
const { CLIEngine } = require('eslint');
const getStdin = require('get-stdin');
const esm = require('esm');
const mri = require('mri');

const esmRequire = esm(module);
const { normalizeOptions, lintText, lintFiles } = esmRequire('./src/index');
const { input, exit, warnings, extensions, reporter } = normalizeOptions();

const argv = mri(proc.argv.slice(2), {
  default: {
    stdin: false,
    exit,
    input,
    reporter,
    warnings,
    extensions,
  },
  string: ['reporter'],
  boolean: ['exit', 'warnings', 'stdin'],
  array: ['extensions', 'input'],
  alias: {
    x: 'extensions',
    w: 'warnings',
    R: 'reporter',
  },
});

const patterns = arrayify(argv._.length ? argv._ : argv.input).filter(Boolean);
const onerror = (err) => {
  console.error(err.stack);
  proc.exit(1);
};

if (argv.stdin) {
  getStdin()
    .then(async (str) => {
      const report = await lintText(str, argv);

      return report.results[0].output;
    })
    .then(console.log)
    .catch(onerror);
} else {
  lintFiles(patterns, argv)
    .then((report) => {
      if (
        report.results.length > 0 &&
        report.errorCount === 0 &&
        report.warningCount > 0 &&
        !argv.warnings
      ) {
        console.log(
          `No linting errors found, but there are ${
            report.warningCount
          } warnings!`,
        );
        console.log('Try running `xaxa --warnings` to see them.');
        proc.exit(0);
      }

      const output = argv.warnings
        ? report.format(report.results)
        : report.format(CLIEngine.getErrorResults(report.results));

      if (report.errorCount && !!argv.exit) {
        console.error(output);
        proc.exit(1);
      } else {
        console.log(output);
        proc.exit(0);
      }

      return report;
    })
    .catch(onerror);
}
