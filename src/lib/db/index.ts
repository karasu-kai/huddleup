import { useSupabaseDb } from "@/lib/supabase/admin";

export function getDbMode(): "supabase" | "local" {
  return useSupabaseDb() ? "supabase" : "local";
}

export { readDb, writeDb, generateInviteCode } from "./local";
