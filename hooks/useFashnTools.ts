"use client";

import { useState, useEffect } from "react";
import { AIToolType, CREDIT_COST } from "@/constants/ai";
import { apiClient } from "@/lib/apiFetch";

// Maps tool_key (from DB) → AIToolType (frontend enum)
const TOOL_KEY_TO_AI_TYPE: Record<string, AIToolType> = {
  product_to_model: AIToolType.PRODUCT_TO_MODEL,
  try_on:           AIToolType.TRY_ON,
  try_on_max:       AIToolType.TRY_ON,       // same slot as try_on (v1.6)
  model_swap:       AIToolType.MODEL_SWAP,
  face_to_model:    AIToolType.FACE_TO_MODEL,
  edit_image:       AIToolType.EDIT,
  model_create:     AIToolType.CREATE_MODEL,
  image_to_video:   AIToolType.IMAGE_TO_VIDEO,
  reframe:          AIToolType.REFRAME,
  remove_background: AIToolType.REMOVE_BG,
  // upscale is not a Fashn tool — CREDIT_COST fallback keeps its value
};

export interface FashnToolEntry {
  tool_key: string;
  model_name: string;
  display_name: string;
  base_credit: number;
  output_type: 'image' | 'video';
  use_case: string | null;
}

// Module-level cache — survives re-renders and page navigation within the session
let _cache: FashnToolEntry[] | null = null;
let _promise: Promise<FashnToolEntry[]> | null = null;

function fetchTools(): Promise<FashnToolEntry[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = apiClient
    .get('/api/workflow/tools')
    .then((res) => {
      const tools: FashnToolEntry[] = res.data.success ? res.data.data : [];
      _cache = tools;
      return tools;
    })
    .catch(() => {
      _promise = null; // allow retry on next render
      return [] as FashnToolEntry[];
    });
  return _promise;
}

/**
 * Returns credits keyed by AIToolType, falling back to CREDIT_COST for
 * tools not in DB (e.g. UPSCALE). Updates once DB data arrives.
 */
export function useFashnToolCredits(): Record<AIToolType, number> {
  const [credits, setCredits] = useState<Record<AIToolType, number>>(CREDIT_COST);

  useEffect(() => {
    if (_cache) {
      setCredits(buildCredits(_cache));
      return;
    }
    fetchTools().then((tools) => {
      if (tools.length > 0) setCredits(buildCredits(tools));
    });
  }, []);

  return credits;
}

/**
 * Returns the raw tool list — useful for display purposes (names, types).
 */
export function useFashnTools(): FashnToolEntry[] {
  const [tools, setTools] = useState<FashnToolEntry[]>(_cache ?? []);

  useEffect(() => {
    if (_cache) { setTools(_cache); return; }
    fetchTools().then((t) => { if (t.length > 0) setTools(t); });
  }, []);

  return tools;
}

function buildCredits(tools: FashnToolEntry[]): Record<AIToolType, number> {
  const result = { ...CREDIT_COST };
  for (const t of tools) {
    const aiType = TOOL_KEY_TO_AI_TYPE[t.tool_key];
    if (aiType !== undefined) {
      // Keep the minimum between existing value and new — try_on_max overlaps try_on
      if (t.tool_key === 'try_on_max') continue; // skip; try_on has lower base credit
      result[aiType] = t.base_credit;
    }
  }
  return result;
}
