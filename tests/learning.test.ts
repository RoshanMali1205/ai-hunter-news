import assert from "node:assert/strict";
import test from "node:test";
import { LEARNING_ITEMS, LEARNING_ROLES } from "../src/data/learning";

test("learning items have unique ids, https URLs and at least one role", () => {
  const ids = LEARNING_ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate learning id");
  for (const item of LEARNING_ITEMS) {
    assert.match(item.url, /^https:\/\//, `${item.id} must use https`);
    assert.ok(item.roles.length > 0, `${item.id} has no roles`);
    assert.ok(item.note.length > 20, `${item.id} needs a note`);
  }
});

test("every role has a suggested path made of existing items for that role", () => {
  for (const role of LEARNING_ROLES) {
    assert.ok(role.path.length >= 3, `${role.id} path is too short`);
    for (const id of role.path) {
      const item = LEARNING_ITEMS.find((candidate) => candidate.id === id);
      assert.ok(item, `${role.id} path references missing item ${id}`);
      assert.ok(item.roles.includes(role.id), `${id} is in the ${role.id} path but not tagged for that role`);
    }
  }
});

test("retired certifications stay out of the list", () => {
  // Checked on the provider pages: these were retired and replaced.
  const retired = ["AI-102", "AI-900", "DP-100"];
  for (const item of LEARNING_ITEMS) assert.ok(!retired.includes(item.examCode ?? ""), `${item.title} uses a retired exam`);
});
