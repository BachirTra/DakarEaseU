import { supabase } from "@/lib/supabase";
import type { GuidedSearchInput } from "@/features/housing/schemas/guidedSearchSchemas";
import type { MatchListingsArgs } from "@dakareaseu/types";

export function toMatchListingsArgs(input: GuidedSearchInput): MatchListingsArgs {
  return {
    p_type: input.type,
    p_budget: input.budget,
    p_school_id: input.schoolId,
    p_district: input.district,
    p_furnished: input.furnished,
    p_coloc: input.coloc,
    p_months: input.months,
  };
}

export async function createGuidedSearchRequest(params: {
  userId: string;
  input: GuidedSearchInput;
}) {
  const { input } = params;
  const { data, error } = await supabase
    .from("guided_search_requests")
    .insert({
      user_id: params.userId,
      housing_type: input.type,
      school_id: input.schoolId,
      district: input.district,
      budget: input.budget,
      duration_months: input.months,
      furnished_pref: input.furnished,
      coloc_pref: input.coloc,
      status: "open",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
