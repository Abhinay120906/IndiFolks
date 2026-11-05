import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ART_FORM_GROUPS, ART_FORMS, ART_CATEGORIES, STATE_NAMES,
  normalizeState, categoryForArt, artMatches, isValidCustomValue
} from './artistCatalog.js';

test('registration catalogue contains every Indian state and union territory',()=>{
  assert.equal(STATE_NAMES.length,36);
  assert.equal(new Set(STATE_NAMES).size,36);
  assert.ok(STATE_NAMES.includes('Andhra Pradesh'));
  assert.ok(STATE_NAMES.includes('Ladakh'));
  assert.ok(STATE_NAMES.includes('Dadra and Nagar Haveli and Daman and Diu'));
});

test('major homepage categories cover niche Indian art forms',()=>{
  assert.equal(ART_CATEGORIES.length,6);
  assert.ok(ART_FORMS.includes('Burrakatha'));
  assert.equal(categoryForArt('Kathak'), 'Classical Dance');
  assert.equal(categoryForArt('Baul Music'), 'Folk Music');
  assert.equal(categoryForArt('Kathputli'),'Theatre & Puppetry');
  assert.equal(categoryForArt('Kalamkari'),'Traditional Arts');
  assert.equal(categoryForArt('Burrakatha'),'Theatre & Puppetry');
  assert.ok(ART_FORM_GROUPS['Classical Dance'].includes('Bharatanatyam'));
});

test('legacy city and spelling entries resolve into the right state filter',()=>{
  assert.equal(normalizeState('Vizag'), 'Andhra Pradesh');
  assert.equal(normalizeState('kolkata'), 'West Bengal');
  assert.equal(normalizeState('Bangalore'), 'Karnataka');
  assert.equal(normalizeState(' ORISSA '), 'Odisha');
  assert.equal(normalizeState(' Tamil Nadu  '), 'Tamil Nadu');
  assert.equal(normalizeState('Other region'), 'Other region');
});

test('broad and exact filters match registered traditions',()=>{
  assert.equal(artMatches('Bharatanatyam', 'Classical Dance'),true);
  assert.equal(artMatches('Baul Music','Folk Music'),true);
  assert.equal(artMatches('Baul Music','Baul'),true);
  assert.equal(artMatches('Garba', 'Folk Dance'),true);
  assert.equal(artMatches('Garba', 'Classical Dance'),false);
  assert.equal(artMatches('Burrakatha','Theatre & Puppetry'),true);
  assert.equal(artMatches('Unique Village Performance','Other'),true);
  assert.equal(artMatches('Kathak','Other'),false);
});

test('custom values are accepted but placeholder and blank answers rejected',()=>{
  assert.equal(isValidCustomValue('Traditional bamboo puppetry'),true);
  assert.equal(isValidCustomValue('Other'),false);
  assert.equal(isValidCustomValue('  '),false);
  assert.equal(isValidCustomValue('All Art Forms'),false);
});
