import { config } from "./config";
import type { GroupId, UIType } from "./types";

export interface GroupSpec {
  group: GroupId;
  ui_order: [UIType, UIType];
  question_order: [string, string];
  interrupt_in: UIType;
}

const TWO_GROUP: GroupSpec[] = [
  { group: "G1", ui_order: ["basic", "structured"], question_order: ["A1", "B1"], interrupt_in: "basic" },
  { group: "G2", ui_order: ["structured", "basic"], question_order: ["A1", "B1"], interrupt_in: "structured" },
];

const FOUR_GROUP: GroupSpec[] = [
  { group: "G1", ui_order: ["basic", "structured"], question_order: ["A1", "B1"], interrupt_in: "basic" },
  { group: "G2", ui_order: ["basic", "structured"], question_order: ["A1", "B1"], interrupt_in: "structured" },
  { group: "G3", ui_order: ["structured", "basic"], question_order: ["A1", "B1"], interrupt_in: "basic" },
  { group: "G4", ui_order: ["structured", "basic"], question_order: ["A1", "B1"], interrupt_in: "structured" },
];

export function getGroupSpecs(): GroupSpec[] {
  return config.COUNTERBALANCE_GROUPS === 4 ? FOUR_GROUP : TWO_GROUP;
}

/** 참가자 ID를 해시해서 그룹 결정 (균등 분배) */
export function assignGroup(participant_id: string): GroupSpec {
  const specs = getGroupSpecs();
  let h = 0;
  for (let i = 0; i < participant_id.length; i++) {
    h = (h * 31 + participant_id.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % specs.length;
  return specs[idx];
}

export function generateParticipantId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const r = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `P-${yyyy}${mm}${dd}-${r}`;
}
