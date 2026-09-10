import { describe, expect, it } from "vitest";
import { TEAM, type TeamMember } from "@/data/team";
import { t } from "@/lib/i18n";

describe("Team Section Data & Configuration", () => {
  it("defines exactly three core team members", () => {
    expect(TEAM).toHaveLength(3);
  });

  it("assigns valid image paths and initials for all team members", () => {
    for (const member of TEAM) {
      expect(member.name).toBeTruthy();
      expect(member.initials).toMatch(/^[A-Z]{2}$/);
      expect(member.tag).toBeTruthy();
      expect(member.image).toMatch(/^\/team\/[a-z-]+\.webp$/);
    }
  });

  it("has specific image paths matching each developer", () => {
    const daniyal = TEAM.find((m) => m.initials === "DH");
    const manu = TEAM.find((m) => m.initials === "MC");
    const rafli = TEAM.find((m) => m.initials === "RH");

    expect(daniyal).toBeDefined();
    expect(daniyal?.image).toBe("/team/daniyal.webp");

    expect(manu).toBeDefined();
    expect(manu?.image).toBe("/team/manu.webp");

    expect(rafli).toBeDefined();
    expect(rafli?.image).toBe("/team/rafli.webp");
  });

  it("ensures all copy keys exist and resolve properly in both 'en' and 'id'", () => {
    for (const member of TEAM) {
      const roleEn = t("en", member.roleKey);
      const roleId = t("id", member.roleKey);
      expect(roleEn).not.toBe(member.roleKey);
      expect(roleId).not.toBe(member.roleKey);

      const focusEn = t("en", member.focusKey);
      const focusId = t("id", member.focusKey);
      expect(focusEn).not.toBe(member.focusKey);
      expect(focusId).not.toBe(member.focusKey);

      const descEn = t("en", member.descKey);
      const descId = t("id", member.descKey);
      expect(descEn).not.toBe(member.descKey);
      expect(descId).not.toBe(member.descKey);
    }
  });
});
