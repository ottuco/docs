// Shared by the extract-* scripts: resolve an OpenAPI node against components.schemas.

/**
 * Recursively resolve all $ref references in a schema object.
 * Tracks visited refs to avoid infinite circular reference loops.
 */
export function resolveRefs(
  node: any,
  allSchemas: Record<string, any>,
  visited: Set<string> = new Set()
): any {
  if (node === null || node === undefined) return node;
  if (typeof node !== "object") return node;

  // Handle $ref
  if (node.$ref) {
    const refPath = node.$ref as string;
    // Extract schema name from "#/components/schemas/SchemaName"
    const match = refPath.match(/^#\/components\/schemas\/(.+)$/);
    if (!match) return node;

    const schemaName = match[1];

    // Circular reference protection
    if (visited.has(schemaName)) {
      return {
        type: "object",
        description: `(circular reference to ${schemaName})`,
      };
    }

    const refSchema = allSchemas[schemaName];
    if (!refSchema) {
      console.warn(`  Warning: $ref to '${schemaName}' not found in spec`);
      return node;
    }

    visited.add(schemaName);
    const resolved = resolveRefs(
      JSON.parse(JSON.stringify(refSchema)),
      allSchemas,
      visited
    );
    visited.delete(schemaName);
    return resolved;
  }

  // Handle allOf — merge all items
  if (Array.isArray(node.allOf)) {
    const merged: any = {};
    for (const item of node.allOf) {
      const resolved = resolveRefs(item, allSchemas, visited);
      // Merge properties
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties };
      }
      // Merge required arrays
      if (resolved.required) {
        merged.required = [
          ...new Set([...(merged.required || []), ...resolved.required]),
        ];
      }
      // Copy other fields (type, description, etc.) from the resolved item
      for (const key of Object.keys(resolved)) {
        if (key !== "properties" && key !== "required" && key !== "allOf") {
          merged[key] = resolved[key];
        }
      }
    }
    // Also copy non-allOf fields from the original node (like description)
    for (const key of Object.keys(node)) {
      if (key !== "allOf" && !(key in merged)) {
        merged[key] = resolveRefs(node[key], allSchemas, visited);
      }
    }
    return merged;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    return node.map((item) => resolveRefs(item, allSchemas, visited));
  }

  // Handle plain objects — recurse into each key
  const result: any = {};
  for (const [key, value] of Object.entries(node)) {
    result[key] = resolveRefs(value, allSchemas, visited);
  }
  return result;
}
