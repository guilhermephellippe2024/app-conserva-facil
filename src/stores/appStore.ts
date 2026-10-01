import { create } from "zustand";
import { supabase, supabaseConfigured } from "../lib/supabase";
import type { SaleInput } from "../lib/schemas";

export type Sale = SaleInput & { id: string; createdAt: string; };

type AppState = {
  sales: Sale[];
  globalRecipeSales: Record<string, number>;
  completedRecipes: string[];
  loadingSales: boolean;
  loadingGlobalSales: boolean;
  loadSales: (userId?: string) => Promise<void>;
  loadGlobalRecipeSales: (userId?: string) => Promise<void>;
  addSale: (input: SaleInput, userId?: string) => Promise<void>;
  removeSale: (id: string, userId?: string) => Promise<void>;
  toggleRecipe: (id: string) => void;
};

const SALES_KEY = "conserva-sales-react";
const COMPLETED_KEY = "conserva-completed-react";

function getLocalSales(): Sale[] {
  try { return JSON.parse(localStorage.getItem(SALES_KEY) || "[]"); }
  catch { return []; }
}

function localRecipeTotals() {
  return getLocalSales().reduce<Record<string, number>>((totals, sale) => {
    totals[sale.recipeId] = (totals[sale.recipeId] || 0) + 1;
    return totals;
  }, {});
}

function fromDatabase(row: Record<string, unknown>): Sale {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    date: String(row.sale_date),
    recipeId: row.recipe_id as Sale["recipeId"],
    customer: String(row.customer_name || ""),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    unitCost: Number(row.unit_cost),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  sales: getLocalSales(),
  globalRecipeSales: localRecipeTotals(),
  completedRecipes: JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"),
  loadingSales: false,
  loadingGlobalSales: false,

  loadSales: async (userId) => {
    if (!supabaseConfigured || !userId) { set({ sales: getLocalSales() }); return; }
    set({ loadingSales: true });
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (error) { set({ loadingSales: false }); throw error; }
    set({ sales: (data || []).map(fromDatabase), loadingSales: false });
  },

  loadGlobalRecipeSales: async (userId) => {
    if (!supabaseConfigured || !userId) { set({ globalRecipeSales: localRecipeTotals() }); return; }
    set({ loadingGlobalSales: true });
    const { data, error } = await supabase.rpc("get_global_recipe_sales");
    if (error) { set({ loadingGlobalSales: false }); throw error; }
    const rows = (data || []) as Array<{ recipe_id: string; sale_count: number | string }>;
    const totals = rows.reduce<Record<string, number>>((result, row) => {
      result[String(row.recipe_id)] = Number(row.sale_count) || 0;
      return result;
    }, {});
    set({ globalRecipeSales: totals, loadingGlobalSales: false });
  },

  addSale: async (input, userId) => {
    if (supabaseConfigured && userId) {
      const { data, error } = await supabase.from("sales").insert({
        user_id: userId,
        sale_date: input.date,
        recipe_id: input.recipeId,
        customer_name: input.customer || null,
        quantity: input.quantity,
        unit_price: input.unitPrice,
        unit_cost: input.unitCost,
      }).select().single();
      if (error) throw error;
      set({ sales: [fromDatabase(data), ...get().sales] });
      return;
    }
    const sale: Sale = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const sales = [sale, ...get().sales];
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    set({ sales, globalRecipeSales: localRecipeTotals() });
  },

  removeSale: async (id, userId) => {
    if (supabaseConfigured && userId) {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    }
    const sales = get().sales.filter((sale) => sale.id !== id);
    if (!supabaseConfigured) {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
      set({ globalRecipeSales: localRecipeTotals() });
    }
    set({ sales });
  },

  toggleRecipe: (id) => {
    const current = get().completedRecipes;
    const completedRecipes = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedRecipes));
    set({ completedRecipes });
  },
}));
