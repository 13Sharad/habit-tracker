process.env.TZ = 'UTC';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f191e810c19729de860ea';
const NOW = Date.UTC(2026, 10, 24, 12);
const DAY = 86400000;

const { ObjectId } = require('mongodb');

class FixedDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : [NOW]));
  }
  static now() { return NOW; }
}

async function loadRoute(rows) {
  let query;
  const db = {
    collection(name) {
      assert.equal(name, 'completions');
      return {
        find(filter) {
          query = filter;
          const matching = rows.filter(row =>
            filter.userId instanceof ObjectId && row.userId.equals(filter.userId)
          );
          return {
            sort() {
              matching.sort((a, b) => b.date - a.date);
              return {
                limit(count) {
                  return { async toArray() { return matching.slice(0, count); } };
                }
              };
            }
          };
        }
      };
    }
  };
  const context = vm.createContext({ Date: FixedDate, Response, console, process: { env: { JWT_SECRET: 'synthetic-test-only' } } });
  const source = fs.readFileSync(path.join(__dirname, '../src/app/api/habits/streak/route.js'), 'utf8');
  const route = new vm.SourceTextModule(source, { context });
  await route.link(async specifier => {
    let exports;
    if (specifier === '@/lib/mongodb') exports = { default: Promise.resolve({ db: () => db }) };
    else if (specifier === 'jsonwebtoken') exports = { default: { verify: () => ({ sub: USER_ID }) } };
    else if (specifier === 'mongodb') exports = { ObjectId };
    else throw new Error(`Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context });
  });
  await route.evaluate();
  return { GET: route.namespace.GET, getQuery: () => query };
}

function completion(daysAgo, done = true, userId = USER_ID) {
  const midnight = new Date(NOW).setHours(0, 0, 0, 0);
  return { userId: new ObjectId(userId), date: new Date(midnight - daysAgo * DAY), done };
}

async function getStreak(rows) {
  const route = await loadRoute(rows);
  const request = { headers: new Headers({ authorization: 'Bearer synthetic-token' }) };
  const response = await route.GET(request);
  assert.equal(response.status, 200);
  return { body: await response.json(), query: route.getQuery() };
}

test('finds BSON ObjectId completion records for the authenticated user', async () => {
  const { body, query } = await getStreak([completion(0), completion(1), completion(2)]);
  assert.equal(body.streak, 3);
  assert.ok(query.userId instanceof ObjectId);
  assert.equal(query.userId.toHexString(), USER_ID);
});

test('does not include another user completion', async () => {
  const { body } = await getStreak([completion(0), completion(1, true, OTHER_ID)]);
  assert.equal(body.streak, 1);
});

test('returns zero when no completion records exist', async () => {
  const { body } = await getStreak([]);
  assert.equal(body.streak, 0);
});

test('stops counting at an incomplete day', async () => {
  const { body } = await getStreak([completion(0), completion(1, false), completion(2)]);
  assert.equal(body.streak, 1);
});
