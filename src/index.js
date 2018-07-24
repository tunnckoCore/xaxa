/**
 * @copyright 2018-present, Charlike Mike Reagent (https://i.am.charlike.online)
 * @license Apache-2.0
 */

import os from 'os';
import path from 'path';
import xaxa from 'eslint-config-xaxa';
import arrayify from 'arrayify';
import { CLIEngine } from 'eslint';

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/bower_components/**',
  'flow-typed/**',
  'coverage/**',
  '{tmp,temp}/**',
  '**/*.min.js',
  '**/bundle.js',
  'vendor/**',
  'dist/**',
];

const DEFAULT_INPUTS = ['src', 'test'];
const DEFAULT_EXTENSIONS = ['js', 'jsx', 'mjs', 'ts', 'tsx'];

export function normalizeOptions(options) {
  const opts = Object.assign(
    {
      exit: true,
      warnings: false,
      reporter: 'codeframe',
      input: DEFAULT_INPUTS,
      ignore: DEFAULT_IGNORE,
      extensions: DEFAULT_EXTENSIONS,
    },
    options,
    {
      fix: true,
      cache: true,
      cacheLocation: path.join(os.homedir() || os.tmpdir(), '.xaxa-cache'),
      reportUnusedDisableDirectives: true,
      useEslintrc: false,
      baseConfig: xaxa,
    },
  );

  opts.input = arrayify(opts.input);
  opts.ignore = DEFAULT_IGNORE.concat(arrayify(opts.ignore));
  opts.extensions = arrayify(opts.extensions);

  return opts;
}

export function lint(name) {
  return (value, options) => {
    const opts = normalizeOptions(options);

    const engine = new CLIEngine(opts);
    const fn = name === 'files' ? engine.executeOnFiles : engine.executeOnText;
    const report = fn.call(engine, value);

    report.format = engine.getFormatter(opts.reporter);

    if (name === 'files') {
      CLIEngine.outputFixes(report);
    }

    return report;
  };
}

export async function lintText(code, options) {
  return lint('text')(code, options);
}

export async function lintFiles(patterns, options) {
  return lint('files')(patterns, options);
}
