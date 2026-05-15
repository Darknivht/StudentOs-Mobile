/**
 * Batch fix for CSS variable usage in React Native
 * Run: npx ts-node scripts/fix-css-vars.ts
 */
import * as fs from "fs";
import * as path from "path";

const HSL_VAR = /hsl\(var\(--([a-zA-Z0-9-]+)\)\)/g;
const GRADIENT_CLASS = /bg-gradient-to-br\s+from-.*\s+via-.*\s+to-.*/g;
const FALLBACK_COLORS: Record<string, string> = {
  "--muted-foreground": "#94A3B8",
  "--background": "#0B1220",
  "--foreground": "#FFFFFF",
  "--primary": "#6D28D9",
  "--primary-foreground": "#FFFFFF",
  "--border": "#1F2937",
  "--card": "#111827",
  "--card-foreground": "#F1F5F9",
  "--input": "#1E293B",
  "--ring": "#6D28D9",
  "--secondary": "#22C55E",
  "--accent": "#1E293B",
  "--muted": "#1F2937",
  "--destructive": "#EF4444",
};

const files = process.argv.slice(2);

for (const file of files) {
  const fullPath = path.resolve(file);
  const content = fs.readFileSync(fullPath, "utf-8");
  let newContent = content;
  
  newContent = newContent.replace(HSL_VAR, (match, varName) => {
    const color = FALLBACK_COLORS[`--${varName}`] || "#94A3B8";
    return `"${color}"`;
  });
  
  // Replace Tailwind gradient classes with React Native compatible ones
  newContent = newContent.replace(GRADIENT_CLASS, (match) => {
    // Map gradient classes to the color object
    return "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700";
  });

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, "utf-8");
    console.log(`Updated: ${file}`);
  }
}
