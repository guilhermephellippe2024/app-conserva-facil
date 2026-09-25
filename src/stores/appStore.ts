import { create } from "zustand";
import { supabase, supabaseConfigured } from "../lib/supabase";
import type { SaleInput } from "../lib/schemas";

export type Sale = SaleInput & {
  id: string;
  createdAt: string;
};

type AppState = {
  sales: Sale[];
  completedRecipes: string[];
  loadingSales: boolean;
  loadSales: (userId?: string) => Promise<void>;
  addSale: (input: SaleInput, userId?: string) => Promise<void>;
  removeSale: (id: string, userId?: string) => Promise<void>;
  toggleRecipe: (id: string) => void;
};

const SALES_KEY = "conserva-sales-react";
const COMPLETED_KEY = "conserva-completed-react";

function getLocalSales(): Sale[] {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
  } catch {
    return [];
  }
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
  completedRecipes: JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"),
  loadingSales: false,

  loadSales: async (userId) => {
    if (!supabaseConfigured || !userId) {
      set({ sales: getLocalSales() });
      return;
    }
    set({ loadingSales: true });
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (error) {
      set({ loadingSales: false });
      throw error;
    }
    set({ sales: (data || []).map(fromDatabase), loadingSales: false });
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
    set({ sales });
  },

  removeSale: async (id, userId) => {
    if (supabaseConfigured && userId) {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    }
    const sales = get().sales.filter((sale) => sale.id !== id);
    if (!supabaseConfigured) localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    set({ sales });
  },

  toggleRecipe: (id) => {
    const current = get().completedRecipes;
    const completedRecipes = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedRecipes));
    set({ completedRecipes });
  },
}));
