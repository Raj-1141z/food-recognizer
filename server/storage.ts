import { db } from "./db";
import {
  scans,
  type InsertScan,
  type Scan,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScans(): Promise<Scan[]>;
}

export class DatabaseStorage implements IStorage {
  async createScan(scan: InsertScan): Promise<Scan> {
    const [created] = await db
      .insert(scans)
      .values(scan)
      .returning();
    return created;
  }

  async getScans(): Promise<Scan[]> {
    return await db.select().from(scans).orderBy(desc(scans.createdAt));
  }
}

export const storage = new DatabaseStorage();
