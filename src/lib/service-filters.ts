import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/**
 * Схемы фильтров списков услуг.
 *
 * Лежали тремя копиями — в tours.tsx, hiking.tsx и transfers.tsx, — и во всех
 * трёх в списке категорий не хватало `getaround`. Из-за этого плитка
 * «Gauja Get-around» на главной вела на /tours?category=getaround, валидатор
 * параметр отбрасывал, и фильтр молча не применялся.
 *
 * Список категорий берётся из enum базы, а не переписывается руками: добавится
 * шестая категория — перечисление разъедется само, и TypeScript это покажет.
 */
export const ENTER_GAUJA_CATEGORIES = [
  "action",
  "nature",
  "history",
  "culture",
  "getaround",
] as const satisfies readonly Database["public"]["Enums"]["enter_gauja_category"][];

export const categorySearchSchema = z.enum(ENTER_GAUJA_CATEGORIES).optional();
export const difficultySearchSchema = z.enum(["easy", "medium", "hard"]).optional();

export const serviceListSearchSchema = z.object({
  category: categorySearchSchema,
  difficulty: difficultySearchSchema,
});

