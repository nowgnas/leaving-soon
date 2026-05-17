import { describe, expect, it } from "vitest";
import { buildCleanupCutoff } from "../src/cleanup.js";

describe("cleanup policy", () => {
  it("keeps expired reports for 24 hours before deletion", () => {
    const cutoff = buildCleanupCutoff(new Date("2026-05-17T12:00:00.000Z"));

    expect(cutoff.toISOString()).toBe("2026-05-16T12:00:00.000Z");
  });
});
