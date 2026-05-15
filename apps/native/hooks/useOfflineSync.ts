import { useState, useCallback, useEffect } from "react";
import { openSQLiteDB } from "../services/sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

interface QueuedMutation {
  id: number;
  table_name: string;
  operation: "insert" | "update" | "delete";
  payload: string;
  conflict_strategy: "server_wins" | "client_wins" | "prompt";
}

export function useOfflineSync() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const init = useCallback(async () => {
    const database = await openSQLiteDB();
    setDb(database);
    return database;
  }, []);

  const addToQueue = useCallback(async (
    table_name: string,
    operation: string,
    payload: Record<string, any>
  ) => {
    if (operation !== "insert" && operation !== "update" && operation !== "delete") {
      throw new Error("Invalid operation");
    }
    const database = db || await init();
    await database.runAsync(
      `INSERT INTO sync_queue (table_name, operation, payload) VALUES (?, ?, ?);`,
      [table_name, operation, JSON.stringify(payload)]
    );
    setUnsyncedCount((prev) => prev + 1);
  }, [db, init]);

  const getQueue = useCallback(async (): Promise<QueuedMutation[]> => {
    const database = db || await init();
    const results = await database.getAllAsync(
      "SELECT * FROM sync_queue ORDER BY created_at ASC;"
    );
    return (results as unknown as any[]).map((row) => ({
      id: row.id,
      table_name: row.table_name,
      operation: row.operation,
      payload: row.payload,
      conflict_strategy: row.conflict_strategy,
    })) as QueuedMutation[];
  }, [db, init]);

  const flushQueue = useCallback(async () => {
    if (!db) return;
    setIsSyncing(true);

    try {
      const queue = await getQueue();

      for (const item of queue) {
        console.log(`Syncing: ${item.operation} on ${item.table_name}`, JSON.parse(item.payload));
        await db.runAsync("DELETE FROM sync_queue WHERE id = ?;", [item.id]);
      }

      const remaining = await db.getAllAsync(
        "SELECT COUNT(*) as count FROM sync_queue;"
      );
      setUnsyncedCount(((remaining as unknown as any[])[0]?.count || 0) as number);
      setLastSyncAt(new Date().toISOString());
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [db, getQueue]);

  const clearQueue = useCallback(async () => {
    if (!db) return;
    await db.execAsync("DELETE FROM sync_queue;");
    setUnsyncedCount(0);
  }, [db]);

  useEffect(() => {
    init();
  }, [init]);

  return { unsyncedCount, lastSyncAt, isSyncing, addToQueue, getQueue, flushQueue, clearQueue };
}

export function useOfflineState() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  const checkOnline = useCallback(async () => {
    try {
      const response = await fetch("https://www.google.com/generate_204", { method: "HEAD", mode: "no-cors" });
      return response.status === 204;
    } catch {
      return false;
    }
  }, []);

  const toggleOfflineMode = useCallback(() => {
    setIsOffline((prev) => {
      const newState = !prev;
      setShowOfflineBanner(newState);
      return newState;
    });
  }, []);

  return { isOffline, showOfflineBanner, checkOnline, toggleOfflineMode };
}
