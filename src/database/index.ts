import { Database } from "@nozbe/watermelondb";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { schema } from "./schema";
import { migrations } from "./migrations";
import { Course, Note, Flashcard, User, SyncState } from "./models";

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Course, Note, Flashcard, User, SyncState],
  migrations,
});

export { Course, Note, Flashcard, User, SyncState };
