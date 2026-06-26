// Generic helpers for self-referential (parent/child) collections such as
// Categories and (later) MenuItems. Kept dependency-free so any collection can
// reuse the same hierarchy logic.

type TreeNode = { id: string; parentId: string | null };

/**
 * Order a flat list hierarchically (each parent immediately followed by its
 * descendants) and attach a `depth` to each node for indented rendering.
 * Nodes whose parent is absent from the set are treated as roots, so a filtered
 * subset never silently disappears.
 */
export function orderTree<T extends TreeNode>(
  items: T[],
  compare: (a: T, b: T) => number = () => 0,
): Array<T & { depth: number }> {
  const ids = new Set(items.map((i) => i.id));
  const byParent = new Map<string, T[]>();
  for (const item of items) {
    const key = item.parentId && ids.has(item.parentId) ? item.parentId : "__root__";
    const list = byParent.get(key) ?? [];
    list.push(item);
    byParent.set(key, list);
  }

  const out: Array<T & { depth: number }> = [];
  const walk = (key: string, depth: number) => {
    const children = (byParent.get(key) ?? []).slice().sort(compare);
    for (const node of children) {
      out.push({ ...node, depth });
      walk(node.id, depth + 1);
    }
  };
  walk("__root__", 0);
  return out;
}

/** Collect the id of a node plus all of its descendants (for cycle prevention). */
export function descendantIds<T extends TreeNode>(items: T[], rootId: string): Set<string> {
  const byParent = new Map<string, T[]>();
  for (const item of items) {
    if (!item.parentId) continue;
    const list = byParent.get(item.parentId) ?? [];
    list.push(item);
    byParent.set(item.parentId, list);
  }
  const out = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const child of byParent.get(current) ?? []) {
      if (!out.has(child.id)) {
        out.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return out;
}

/** Depth of a node by walking its parent chain (for dropdown indentation). */
export function depthOf<T extends TreeNode>(items: T[], id: string): number {
  const byId = new Map(items.map((i) => [i.id, i]));
  let depth = 0;
  let cursor = byId.get(id);
  const seen = new Set<string>();
  while (cursor?.parentId && byId.has(cursor.parentId) && !seen.has(cursor.parentId)) {
    seen.add(cursor.parentId);
    cursor = byId.get(cursor.parentId);
    depth += 1;
  }
  return depth;
}
