import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { toCsvCell } from '../server/acessibilidadeService.js';
import {
  createApiKey,
  authenticateApiKey,
  getUsageStats,
  listApiKeys,
  logRequest,
  registerCompany,
} from '../server/b2bService.js';

const formulaPrefixes = ['=', '+', '-', '@', '\t=', '\r=', '\n='];
for (const value of formulaPrefixes) {
  const safeCell = toCsvCell(value);
  assert.ok(safeCell.startsWith('"\'') && safeCell.endsWith('"'), `CSV formula prefix was not neutralized: ${JSON.stringify(value)}`);
}
assert.equal(toCsvCell('plain text'), '"plain text"');
assert.equal(toCsvCell('text "with quotes"'), '"text ""with quotes"""');

const unique = randomUUID();
const companyA = registerCompany(`Test A ${unique}`, `security-a-${unique}@example.test`, 'SecurityTestPass123');
const companyB = registerCompany(`Test B ${unique}`, `security-b-${unique}@example.test`, 'SecurityTestPass123');
const keyA = createApiKey('Security test key A', companyA.id);
const keyB = createApiKey('Security test key B', companyB.id);
assert.equal(keyA.rateLimit, 60);
assert.equal(keyA.requestsLimitToday, 100);
assert.equal(authenticateApiKey(keyA.key)?.id, keyA.id);

logRequest(keyA.id, '/security-test', '00000000', 200, 12, 'test');
logRequest(keyA.id, '/security-test', '00000000', 500, 24, 'test');

const statsA = getUsageStats(companyA.id);
const statsB = getUsageStats(companyB.id);
assert.equal(statsA.totalRequestsToday, 1);
assert.equal(statsA.recentLogs.length, 2);
assert.equal(statsB.totalRequestsToday, 0);
assert.equal(statsB.recentLogs.length, 0);
assert.ok(listApiKeys(companyA.id).some((key) => key.id === keyA.id));
assert.ok(!listApiKeys(companyA.id).some((key) => key.id === keyB.id));
assert.ok(listApiKeys(companyA.id).every((key) => key.key !== keyA.key));

console.log('Security tests passed: CSV formula neutralization and company-scoped metrics/API keys.');
