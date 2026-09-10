import type { CopyKey } from "@/lib/i18n";

export interface TeamMember {
  name: string;
  initials: string;
  roleKey: CopyKey;
  focusKey: CopyKey;
  descKey: CopyKey;
  tag: string;
  image?: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Daniyal Hafidz Prasetyo",
    initials: "DH",
    roleKey: "about.team.member1.role",
    focusKey: "about.team.member1.focus",
    descKey: "about.team.member1.desc",
    tag: "Lead & Architecture",
    image: "/team/daniyal.webp",
  },
  {
    name: "Manu Caimpiyana Bhimasena",
    initials: "MC",
    roleKey: "about.team.member2.role",
    focusKey: "about.team.member2.focus",
    descKey: "about.team.member2.desc",
    tag: "Frontend & Design",
    image: "/team/manu.webp",
  },
  {
    name: "Rafli Halomoan",
    initials: "RH",
    roleKey: "about.team.member3.role",
    focusKey: "about.team.member3.focus",
    descKey: "about.team.member3.desc",
    tag: "Knowledge Base & QA",
    image: "/team/rafli.webp",
  },
];
