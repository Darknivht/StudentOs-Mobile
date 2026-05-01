import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: "courses",
      columns: [
        { name: "user_id", type: "string" },
        { name: "title", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "color", type: "string", isOptional: true },
        { name: "emoji", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "notes",
      columns: [
        { name: "user_id", type: "string" },
        { name: "course_id", type: "string", isOptional: true },
        { name: "title", type: "string" },
        { name: "content", type: "string" },
        { name: "source", type: "string", isOptional: true },
        { name: "summary", type: "string", isOptional: true },
        { name: "source_type", type: "string" },
        { name: "file_url", type: "string", isOptional: true },
        { name: "original_filename", type: "string", isOptional: true },
        { name: "is_pinned", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "flashcards",
      columns: [
        { name: "user_id", type: "string" },
        { name: "course_id", type: "string", isOptional: true },
        { name: "note_id", type: "string", isOptional: true },
        { name: "front", type: "string" },
        { name: "back", type: "string" },
        { name: "ease_factor", type: "number" },
        { name: "interval_days", type: "number" },
        { name: "repetitions", type: "number" },
        { name: "next_review", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "users",
      columns: [
        { name: "supabase_id", type: "string" },
        { name: "email", type: "string" },
        { name: "display_name", type: "string" },
        { name: "subscription_tier", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "synced_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "sync_state",
      columns: [
        { name: "table_name", type: "string" },
        { name: "last_synced_at", type: "number" },
        { name: "pending_count", type: "number" },
      ],
    }),
  ],
});
