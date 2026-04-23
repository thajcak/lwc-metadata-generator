import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildXMLFromState } from '../js/xmlGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readFixtures() {
  const fixtureFiles = fs.readdirSync(__dirname).filter((entry) => entry.endsWith('.json'));
  return fixtureFiles.map((fileName) => {
    const filePath = path.join(__dirname, fileName);
    const raw = fs.readFileSync(filePath, 'utf8');
    return { fileName, fixture: JSON.parse(raw) };
  });
}

function assertIncludes(haystack, expectedItems = [], label) {
  expectedItems.forEach((item) => {
    if (!haystack.includes(item)) {
      throw new Error(`${label} missing expected snippet: ${item}`);
    }
  });
}

function assertNotIncludes(haystack, unexpectedItems = [], label) {
  unexpectedItems.forEach((item) => {
    if (haystack.includes(item)) {
      throw new Error(`${label} unexpectedly contains snippet: ${item}`);
    }
  });
}

function assertWarningSets(actualWarnings, fixture) {
  const expectedWarnings = fixture.expectedWarnings;
  if (Array.isArray(expectedWarnings)) {
    const normalizedActual = [...actualWarnings].sort();
    const normalizedExpected = [...expectedWarnings].sort();
    if (JSON.stringify(normalizedActual) !== JSON.stringify(normalizedExpected)) {
      throw new Error(`warnings mismatch\nexpected: ${JSON.stringify(normalizedExpected)}\nactual: ${JSON.stringify(normalizedActual)}`);
    }
    return;
  }

  assertIncludes(
    actualWarnings.join('\n'),
    fixture.expectedWarningsContains || [],
    'warnings'
  );
}

function runFixture({ fileName, fixture }) {
  const result = buildXMLFromState(fixture.input);
  assertIncludes(result.xml, fixture.expectedXmlContains || [], 'xml');
  assertNotIncludes(result.xml, fixture.expectedXmlNotContains || [], 'xml');
  assertWarningSets(result.warnings, fixture);
  console.log(`PASS ${fileName}: ${fixture.name}`);
}

function main() {
  const fixtures = readFixtures();
  fixtures.forEach(runFixture);
  console.log(`\n${fixtures.length} fixture(s) passed.`);
}

main();
