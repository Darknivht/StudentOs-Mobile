export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface FillBlank {
  sentence: string;
  blank: string;
  hint: string;
}

export interface ConceptNode {
  id: string;
  label: string;
}

export interface ConceptConnection {
  from: string;
  to: string;
  label?: string;
}

export interface ConceptMap {
  nodes: ConceptNode[];
  connections: ConceptConnection[];
}

export function extractJsonFromAI(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];

  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];

  return raw.trim();
}

export function parseFillBlanksResponse(raw: string): FillBlank[] {
  try {
    const jsonStr = extractJsonFromAI(raw);
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed)) {
      return parsed.map(validateFillBlank).filter(Boolean) as FillBlank[];
    }
    if (parsed?.blanks && Array.isArray(parsed.blanks)) {
      return parsed.blanks.map(validateFillBlank).filter(Boolean) as FillBlank[];
    }
    if (parsed?.fill_blanks && Array.isArray(parsed.fill_blanks)) {
      return parsed.fill_blanks.map(validateFillBlank).filter(Boolean) as FillBlank[];
    }
    return [];
  } catch {
    return [];
  }
}

function validateFillBlank(item: any): FillBlank | null {
  if (!item || typeof item !== "object") return null;
  if (!item.sentence || !item.blank) return null;
  return {
    sentence: String(item.sentence),
    blank: String(item.blank),
    hint: item.hint ? String(item.hint) : "",
  };
}

export function parseConceptMapResponse(raw: string): ConceptMap {
  try {
    const jsonStr = extractJsonFromAI(raw);
    const parsed = JSON.parse(jsonStr);

    const nodes: ConceptNode[] = [];
    const connections: ConceptConnection[] = [];

    if (parsed?.nodes && Array.isArray(parsed.nodes)) {
      parsed.nodes.forEach((n: any) => {
        if (n.id && n.label) {
          nodes.push({ id: String(n.id), label: String(n.label) });
        }
      });
    }

    if (parsed?.connections && Array.isArray(parsed.connections)) {
      parsed.connections.forEach((c: any) => {
        if (c.from && c.to) {
          connections.push({
            from: String(c.from),
            to: String(c.to),
            label: c.label ? String(c.label) : undefined,
          });
        }
      });
    } else if (parsed?.edges && Array.isArray(parsed.edges)) {
      parsed.edges.forEach((c: any) => {
        if (c.from && c.to) {
          connections.push({
            from: String(c.from),
            to: String(c.to),
            label: c.label ? String(c.label) : undefined,
          });
        }
      });
    }

    return { nodes, connections };
  } catch {
    return { nodes: [], connections: [] };
  }
}
