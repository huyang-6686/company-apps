export function createDefaultExpandedGroups(): Set<string> {
  return new Set<string>();
}

export function toggleNavigationGroup(
  expandedGroups: ReadonlySet<string>,
  groupLabel: string,
): Set<string> {
  const next = new Set(expandedGroups);
  if (next.has(groupLabel)) {
    next.delete(groupLabel);
  } else {
    next.add(groupLabel);
  }
  return next;
}
