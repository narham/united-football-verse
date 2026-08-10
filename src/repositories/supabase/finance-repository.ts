/**
 * Supabase Finance Repository (Transactions)
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages financial transactions (income and expenses).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Transaction,
  TransactionListParams,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceTotals,
  ListResult,
  FinanceRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of FinanceRepository
 */
export class SupabaseFinanceRepository implements FinanceRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List transactions
   */
  async list(
    clubId: string,
    params?: TransactionListParams
  ): Promise<ListResult<Transaction>> {
    try {
      let query = this.supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("organization_id", this.organizationId);

      // Apply type filter
      if (params?.type) {
        query = query.eq("type", this.mapTypeToDatabase(params.type));
      }

      // Apply category filter
      if (params?.category) {
        query = query.eq("category", this.mapCategoryToDatabase(params.category));
      }

      // Apply date range
      if (params?.startDate) {
        query = query.gte("date", params.startDate);
      }
      if (params?.endDate) {
        query = query.lte("date", params.endDate);
      }

      // Apply sorting
      query = query.order("date", { ascending: false });

      // Apply pagination
      const offset = params?.offset || 0;
      const limit = params?.limit || 20;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const total = count || data?.length || 0;
      return {
        data: (data || []).map((t) => this.mapFromDatabase(t)),
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("Failed to list transactions:", error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await this.supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      console.error("Failed to fetch transaction:", error);
      throw error;
    }
  }

  /**
   * Create transaction
   */
  async create(clubId: string, input: CreateTransactionInput): Promise<Transaction> {
    try {
      const id = crypto.randomUUID();

      const { data, error } = await this.supabase
        .from("transactions")
        .insert({
          id,
          organization_id: this.organizationId,
          date: input.tanggal,
          type: this.mapTypeToDatabase(input.tipe),
          amount: Math.abs(input.jumlah), // Store absolute value
          category: this.mapCategoryToDatabase(input.kategori),
          description: input.keterangan || undefined,
          status: "RECORDED",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.tanggal !== undefined) payload.date = input.tanggal;
      if (input.tipe !== undefined) payload.type = this.mapTypeToDatabase(input.tipe);
      if (input.jumlah !== undefined) payload.amount = Math.abs(input.jumlah);
      if (input.kategori !== undefined) payload.category = this.mapCategoryToDatabase(input.kategori);
      if (input.keterangan !== undefined) payload.description = input.keterangan;

      const { data, error } = await this.supabase
        .from("transactions")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Transaction not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw error;
    }
  }

  /**
   * Delete transaction (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("transactions")
        .update({
          status: "ARCHIVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("organization_id", this.organizationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  }

  /**
   * Get financial totals (income, expenses, balance)
   */
  async getTotals(clubId: string): Promise<FinanceTotals> {
    try {
      const { data, error } = await this.supabase
        .from("transactions")
        .select("*")
        .eq("organization_id", this.organizationId)
        .neq("status", "ARCHIVED");

      if (error) {
        throw error;
      }

      let masuk = 0, keluar = 0;

      for (const txn of data || []) {
        if (txn.type === "INCOME") {
          masuk += txn.amount;
        } else if (txn.type === "EXPENSE") {
          keluar += txn.amount;
        }
      }

      return {
        masuk,
        keluar,
        saldo: masuk - keluar,
      };
    } catch (error) {
      console.error("Failed to get totals:", error);
      throw error;
    }
  }

  /**
   * Get current balance
   */
  async getBalance(clubId: string): Promise<number> {
    try {
      const totals = await this.getTotals(clubId);
      return totals.saldo;
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Map transaction type to database format
   */
  private mapTypeToDatabase(type: string): string {
    const typeMap: Record<string, string> = {
      "masuk": "INCOME",
      "keluar": "EXPENSE",
      "INCOME": "INCOME",
      "EXPENSE": "EXPENSE",
    };
    return typeMap[type] || type;
  }

  /**
   * Map transaction type from database format
   */
  private mapTypeFromDatabase(type: string): "masuk" | "keluar" {
    const typeMap: Record<string, any> = {
      "INCOME": "masuk",
      "EXPENSE": "keluar",
    };
    return typeMap[type] || "masuk";
  }

  /**
   * Map category to database format
   */
  private mapCategoryToDatabase(category: string): string {
    const categoryMap: Record<string, string> = {
      "SPP": "SPP",
      "Registration": "REGISTRATION",
      "Pendaftaran": "REGISTRATION",
      "Tournament": "TOURNAMENT",
      "Turnamen": "TOURNAMENT",
      "Equipment": "EQUIPMENT",
      "Peralatan": "EQUIPMENT",
      "Operational": "OPERATIONAL",
      "Operasional": "OPERATIONAL",
      "Other": "OTHER",
      "Lainnya": "OTHER",
      // Database format (if already mapped)
      "REGISTRATION": "REGISTRATION",
      "TOURNAMENT": "TOURNAMENT",
      "EQUIPMENT": "EQUIPMENT",
      "OPERATIONAL": "OPERATIONAL",
      "OTHER": "OTHER",
    };
    return categoryMap[category] || category;
  }

  /**
   * Map category from database format
   */
  private mapCategoryFromDatabase(category: string): string {
    const categoryMap: Record<string, string> = {
      "SPP": "SPP",
      "REGISTRATION": "Registration",
      "TOURNAMENT": "Tournament",
      "EQUIPMENT": "Equipment",
      "OPERATIONAL": "Operational",
      "OTHER": "Other",
    };
    return categoryMap[category] || category;
  }

  /**
   * Map database format to application format
   */
  private mapFromDatabase(row: any): Transaction {
    return {
      id: row.id,
      clubId: this.organizationId,
      tanggal: row.date,
      tipe: this.mapTypeFromDatabase(row.type),
      jumlah: row.amount,
      kategori: this.mapCategoryFromDatabase(row.category),
      keterangan: row.description || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
