import { z } from "zod";

function parsePtBrMoney(value: unknown) {
  if (typeof value === "number") return value;
  return Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
}

export const saleSchema = z.object({
  date: z.string().min(1, "Informe a data."),
  recipeId: z.enum(["morango", "goiaba", "abacaxi"]),
  customer: z.string().trim().max(80, "Use no máximo 80 caracteres.").optional(),
  quantity: z.coerce.number().int().min(1, "Informe ao menos um pote."),
  unitPrice: z.preprocess(parsePtBrMoney, z.number().positive("Informe o preço por pote.")),
  unitCost: z.preprocess(parsePtBrMoney, z.number().min(0, "O custo não pode ser negativo.")),
});

export const costSchema = z.object({
  fruit: z.preprocess(parsePtBrMoney, z.number().min(0)),
  sugar: z.preprocess(parsePtBrMoney, z.number().min(0)),
  jars: z.preprocess(parsePtBrMoney, z.number().min(0)),
  extras: z.preprocess(parsePtBrMoney, z.number().min(0)),
  yield: z.coerce.number().int().min(1),
});

export type SaleInput = z.infer<typeof saleSchema>;
