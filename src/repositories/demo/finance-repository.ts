/**
 * Demo Finance Repository
 */
import type { Transaction, TransactionListParams, CreateTransactionInput, UpdateTransactionInput, FinanceTotals, ListResult } from "@/repositories/interfaces";
import type { FinanceRepository } from "@/repositories/interfaces";
import { transactions as initialTransactions } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoFinanceRepository implements FinanceRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("transactions")) {
      this.storage.set("transactions", initialTransactions);
    }
  }

  async list(clubId: string, params?: TransactionListParams): Promise<ListResult<Transaction>> {
    let data = this.storage.get<Transaction[]>("transactions", undefined, [])
      .filter((t) => t.clubId === clubId);

    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter((t) => 
        t.keterangan.toLowerCase().includes(search) ||
        t.kategori.toLowerCase().includes(search)
      );
    }

    if (params?.type) {
      data = data.filter((t) => t.tipe === params.type);
    }

    if (params?.category) {
      data = data.filter((t) => t.kategori === params.category);
    }

    const offset = params?.offset || 0;
    const limit = params?.limit || 20;

    return {
      data: data.slice(offset, offset + limit),
      total: data.length,
      hasMore: offset + limit < data.length,
    };
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.storage.get<Transaction[]>("transactions", undefined, [])
      .find((t) => t.id === id) || null;
  }

  async create(clubId: string, input: CreateTransactionInput): Promise<Transaction> {
    const allTransactions = this.storage.get<Transaction[]>("transactions", undefined, []);
    const newTx: Transaction = {
      id: `tx${Date.now()}`,
      clubId,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTransactions.push(newTx);
    this.storage.set("transactions", allTransactions);
    return newTx;
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const allTransactions = this.storage.get<Transaction[]>("transactions", undefined, []);
    const index = allTransactions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Transaction not found");
    const old = allTransactions[index]!;
    const updated: Transaction = {
      id: old.id,
      clubId: old.clubId,
      tanggal: input.tanggal ?? old.tanggal,
      tipe: input.tipe ?? old.tipe,
      jumlah: input.jumlah ?? old.jumlah,
      kategori: input.kategori ?? old.kategori,
      keterangan: input.keterangan ?? old.keterangan,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTransactions[index] = updated;
    this.storage.set("transactions", allTransactions);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allTransactions = this.storage.get<Transaction[]>("transactions", undefined, []);
    const index = allTransactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      allTransactions.splice(index, 1);
      this.storage.set("transactions", allTransactions);
    }
  }

  async getTotals(clubId: string): Promise<FinanceTotals> {
    const transactions = this.storage.get<Transaction[]>("transactions", undefined, [])
      .filter((t) => t.clubId === clubId);

    let masuk = 0, keluar = 0;
    for (const t of transactions) {
      if (t.tipe === "masuk") masuk += t.jumlah;
      else keluar += t.jumlah;
    }

    return { masuk, keluar, saldo: masuk - keluar };
  }

  async getBalance(clubId: string): Promise<number> {
    const totals = await this.getTotals(clubId);
    return totals.saldo;
  }
}
