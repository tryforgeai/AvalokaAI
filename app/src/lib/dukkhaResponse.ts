import type { DukkhaMapping } from "./dukkhaMapper";
import { responseMovePriority, responseVariants } from "../data/responseVariants";

export function buildDukkhaResponse(mapping: DukkhaMapping, input = ""): string[] | undefined {
  const move = responseMovePriority.find((candidate) => mapping.responseMoves.includes(candidate));
  if (!move) return undefined;

  const variants = responseVariants[move];
  if (!variants || variants.length === 0) return undefined;

  return variants[variantIndex(`${move}:${input}`, variants.length)];
}

function variantIndex(seed: string, modulo: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % modulo;
}
