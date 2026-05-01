import { schemaMigrations, addColumns } from "@nozbe/watermelondb/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "notes",
          columns: [
            { name: "summary", type: "string", isOptional: true },
            { name: "source_type", type: "string" },
            { name: "file_url", type: "string", isOptional: true },
            { name: "original_filename", type: "string", isOptional: true },
            { name: "is_pinned", type: "boolean" },
          ],
        }),
      ],
    },
  ],
});
