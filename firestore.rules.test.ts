import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

test('firestore.rules enforces rules_version 2 and default deny catch-all', () => {
  assert.match(rulesText, /^rules_version = '2';/m);
  assert.match(rulesText, /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
});

test('every collection in firebase-blueprint.json has an explicit match block in firestore.rules', () => {
  const paths = Object.keys(blueprint.firestore);
  for (const collectionPath of paths) {
    const collectionName = collectionPath.split('/')[1];
    assert.ok(
      rulesText.includes(`match /${collectionName}/`),
      `Missing match block for collection ${collectionName}`
    );
  }
});

test('email_verified == true is mandated and no blanket isSignedIn list queries exist on PII collections', () => {
  assert.match(rulesText, /request\.auth\.token\.email_verified == true/);
  const piiCollections = [
    'users',
    'appointments',
    'packageBookings',
    'inquiries',
    'feedback',
    'notifications',
    'jobApplications',
    'reports',
  ];
  for (const col of piiCollections) {
    const matchIndex = rulesText.indexOf(`match /${col}/`);
    assert.ok(matchIndex !== -1, `Missing PII collection ${col}`);
    const blockSnippet = rulesText.slice(matchIndex, matchIndex + 700);
    assert.ok(
      !blockSnippet.includes('allow list: if isSignedIn()'),
      `Insecure blanket list rule in ${col}`
    );
  }
});

test('atomic slot lock and appointment bidirectional existsAfter / getAfter checks are present', () => {
  assert.match(rulesText, /existsAfter\(\/databases\/\$\(database\)\/documents\/appointmentSlots\//);
  assert.match(rulesText, /getAfter\(\/databases\/\$\(database\)\/documents\/appointments\//);
});
