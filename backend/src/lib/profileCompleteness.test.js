import test from 'node:test';
import assert from 'node:assert/strict';
import { profileCompleteness } from './profileCompleteness.js';

const fullProfile = {
  name: 'IndiFolks Artist', specialty: 'Folk dance', state: 'West Bengal',
  bio: 'Traditional performer', experience: '5 years', price: 1500,
  story: 'An artistic story', profileImage: 'https://example.com/avatar.jpg',
  gallery: [{ url: 'https://example.com/gallery.jpg' }]
};

test('empty profile reports actual missing fields, not a misleading completed profile', () => {
  const c = profileCompleteness({});
  assert.equal(c.score, 0);
  assert.equal(c.completed, 0);
  assert.equal(c.missing.length, c.total);
});

test('saved artist profile fields determine exact completeness percentage', () => {
  const c = profileCompleteness(fullProfile);
  assert.equal(c.score, 100);
  assert.equal(c.completed, 9);
  assert.deepEqual(c.missing, []);
});

test('optional gallery and avatar are independently counted', () => {
  const c = profileCompleteness({ ...fullProfile, gallery: [], profileImage: '' });
  assert.equal(c.completed, 7);
  assert.equal(c.score, 78);
  assert.deepEqual(c.missing, ['profile photo', 'performance gallery']);
});

test('blank text and zero price do not count as complete', () => {
  const c = profileCompleteness({ ...fullProfile, bio: '  ', price: 0 });
  assert.deepEqual(c.missing, ['bio', 'performance price']);
});
