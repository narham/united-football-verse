/**
 * Demo Storage - localStorage-backed persistence for demo repositories
 * Namespace: bolaID.demo.{entity}
 * Used for simulating CRUD with session persistence
 */

const STORAGE_PREFIX = "bolaID.demo";

export interface StorageConfig {
  prefix?: string;
  debug?: boolean;
}

/**
 * Centralized localStorage helper with namespace support
 */
export class DemoStorage {
  private prefix: string;
  private debug: boolean;

  constructor(config?: StorageConfig) {
    this.prefix = config?.prefix || STORAGE_PREFIX;
    this.debug = config?.debug || false;
  }

  /**
   * Get key with namespace prefix
   */
  private getKey(entity: string, subKey?: string): string {
    if (subKey) {
      return `${this.prefix}.${entity}.${subKey}`;
    }
    return `${this.prefix}.${entity}`;
  }

  /**
   * Set data in localStorage
   */
  public set<T>(entity: string, data: T, subKey?: string): void {
    try {
      const key = this.getKey(entity, subKey);
      const json = JSON.stringify(data);
      localStorage.setItem(key, json);
      if (this.debug) {
        console.log(`[DemoStorage] Set ${key}`, data);
      }
    } catch (e) {
      console.error(`[DemoStorage] Error setting ${entity}:`, e);
    }
  }

  /**
   * Get data from localStorage with proper overloading
   */
  public get<T>(entity: string): T | null;
  public get<T>(entity: string, subKey: string | undefined): T | null;
  public get<T>(entity: string, subKey: string | undefined, defaultValue: T): T;
  public get<T>(entity: string, subKey?: string, defaultValue?: T): T | null {
    try {
      const key = this.getKey(entity, subKey);
      const json = localStorage.getItem(key);
      if (!json) {
        return (defaultValue ?? null) as T | null;
      }
      const data = JSON.parse(json) as T;
      if (this.debug) {
        console.log(`[DemoStorage] Get ${key}`, data);
      }
      return data;
    } catch (e) {
      console.error(`[DemoStorage] Error getting ${entity}:`, e);
      return (defaultValue ?? null) as T | null;
    }
  }

  /**
   * Check if data exists
   */
  public has(entity: string, subKey?: string): boolean {
    const key = this.getKey(entity, subKey);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Remove data from localStorage
   */
  public remove(entity: string, subKey?: string): void {
    try {
      const key = this.getKey(entity, subKey);
      localStorage.removeItem(key);
      if (this.debug) {
        console.log(`[DemoStorage] Removed ${key}`);
      }
    } catch (e) {
      console.error(`[DemoStorage] Error removing ${entity}:`, e);
    }
  }

  /**
   * Clear all data with given prefix
   */
  public clear(entity?: string): void {
    try {
      const keys = Object.keys(localStorage);
      const prefix = entity ? this.getKey(entity) : this.prefix;

      for (const key of keys) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
          if (this.debug) {
            console.log(`[DemoStorage] Cleared ${key}`);
          }
        }
      }
    } catch (e) {
      console.error(`[DemoStorage] Error clearing storage:`, e);
    }
  }

  /**
   * Get all keys for an entity
   */
  public getKeys(entity: string): string[] {
    try {
      const keys = Object.keys(localStorage);
      const prefix = this.getKey(entity);
      return keys.filter((k) => k.startsWith(prefix));
    } catch (e) {
      console.error(`[DemoStorage] Error getting keys:`, e);
      return [];
    }
  }

  /**
   * Initialize entity storage with default data
   */
  public initialize<T>(entity: string, defaultData: T): T {
    if (!this.has(entity)) {
      this.set(entity, defaultData);
      return defaultData;
    }
    return this.get<T>(entity) || defaultData;
  }
}

/**
 * Factory function for creating storage instance
 */
export function createDemoStorage(config?: StorageConfig): DemoStorage {
  return new DemoStorage(config);
}

/**
 * Global storage instance (singleton)
 */
let globalStorage: DemoStorage | null = null;

export function getDemoStorage(config?: StorageConfig): DemoStorage {
  if (!globalStorage) {
    globalStorage = new DemoStorage(config);
  }
  return globalStorage;
}

/**
 * Reset all demo data (utility for settings)
 */
export function resetAllDemoData(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    const keys = Object.keys(localStorage);
    const demoKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
    for (const key of demoKeys) {
      localStorage.removeItem(key);
    }
    console.log(`[DemoStorage] Reset ${demoKeys.length} keys`);
  }
}
