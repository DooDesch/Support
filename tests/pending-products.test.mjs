import assert from "node:assert/strict";
import test from "node:test";
import { withPendingProducts } from "../lib/pending-products.ts";

test("only the seven declared Cabin products get metadata without private lookups", () => {
  const products = withPendingProducts([]);
  assert.equal(products.length, 7);
  assert.deepEqual(products.map((repo) => repo.name), [
    "TheCabinGame-ModSettings", "TheCabinGame-ClearRules", "TheCabinGame-EscapeFix",
    "TheCabinGame-GraphicsProfiles", "TheCabinGame-ShortEvents", "TheCabinGame-FastTurns",
    "TheCabinGame-Rejoin",
  ]);
  assert.ok(products.every((repo) => repo.pendingCatalog && repo.stars === null));
});

test("public metadata supersedes a pending entry and keeps its normal issue target", () => {
  const published = {
    name: "TheCabinGame-ModSettings", fullName: "DooDesch-Mods/TheCabinGame-ModSettings",
    description: "Published source", url: "https://github.com/DooDesch-Mods/TheCabinGame-ModSettings",
    stars: 4, language: "Lua",
  };
  const other = {
    name: "Palworld-Palvolve", fullName: "DooDesch-Mods/Palworld-Palvolve",
    description: "Palvolve", url: "https://github.com/DooDesch-Mods/Palworld-Palvolve",
    stars: 10, language: "Lua",
  };
  const products = withPendingProducts([published, other]);
  assert.equal(products.filter((repo) => repo.fullName === published.fullName).length, 1);
  assert.equal(products[0], published);
  assert.equal(products[1], other);
  assert.equal(products[0].pendingCatalog, undefined);
});
