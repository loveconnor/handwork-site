import assert from 'node:assert/strict';
import { slug } from './slug.js';
assert.equal(slug('  Release   Notes  '), 'release-notes');
assert.equal(slug('API Reference'), 'api-reference');
console.log('2 tests passed');
