export type PGParamCategory = "card" | "identifier" | "status" | "dcc";

export interface PGParam {
  name: string;
  description: string;
  category: PGParamCategory;
  example?: string;
  notes?: string;
}
