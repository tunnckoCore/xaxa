#!/usr/bin/env node

const proc = require('process');
const path = require('path');
const mri = require('mri');
const arrayify = require('arrayify');
const { CLIEngine } = require('eslint');

const argv = mri(proc.argv.slice(2), {
  default: {
    fix: true,
    exit: true,
    warnings: false,
    reporter: 'codeframe',
    input: ['src', 'test'],
    extensions: ['.mjs', '.js'],
  },
  array: ['extensions'],
  alias: {
    x: 'extensions',
    w: 'warnings',
    r: 'require',
    R: 'reporter',
  },
});

if (argv.require) {
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  require(argv.require);
}

const filename = (proc.mainModule && proc.mainModule.filename) || __filename;
const dirname = path.dirname(filename);

// TODO: expose as API
const cli = new CLIEngine({
  useEslintrc: false,
  cache: true,
  fix: argv.fix,
  reportUnusedDisableDirectives: true,
  configFile: path.join(dirname, 'index.js'),
  extensions: arrayify(argv.extensions),
  ignore: argv.ignore,
});

const patterns = arrayify(argv._.length ? argv._ : argv.input).filter(Boolean);

const report = cli.executeOnFiles(patterns);

if (report.results.length === 0) {
  console.error('Error: no files to lint. Try adding "-x .mjs -x .js" flags');
  proc.exit(1);
}

if (report.results.length > 0 && report.warningCount > 0 && !argv.warnings) {
  CLIEngine.outputFixes(report);
  console.log(
    `No linting errors found, but there are ${report.warningCount} warnings!`,
  );
  console.log('Try running `xaxa --warnings` to see them.');
  proc.exit(0);
}

const format = cli.getFormatter(argv.reporter);

CLIEngine.outputFixes(report);

const output = argv.warnings
  ? format(report.results)
  : format(CLIEngine.getErrorResults(report.results));

if (report.errorCount && !!argv.exit) {
  console.error(output);
  proc.exit(1);
} else {
  console.log(output);
  proc.exit(0);
}
