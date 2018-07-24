/**
 * @copyright 2018-present, Charlike Mike Reagent (https://i.am.charlike.online)
 * @license Apache-2.0
 */

'use strict';

import test from 'asia';
import { normalizeOptions } from '../src/index';

test('foo bar', (t) => {
  t.ok(normalizeOptions());
});
