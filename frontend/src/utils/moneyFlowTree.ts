import type { MoneyFlowNode } from '@/types/moneyFlow';
export type MoneyFlowViewDepth = 1 | 2 | 3 | 'all';
export interface FlatMoneyFlowNode {
    node: MoneyFlowNode;
    depth: number;
    path: string[];
}
export function countDescendants(node: MoneyFlowNode): number {
    return (node.children ?? []).reduce((total, child) => total + 1 + countDescendants(child), 0);
}
export function flattenMoneyFlowNodes(root: MoneyFlowNode, visibleRoot?: MoneyFlowNode): FlatMoneyFlowNode[] {
    const source = visibleRoot ?? root;
    const items: FlatMoneyFlowNode[] = [];
    function walk(node: MoneyFlowNode, depth: number, path: string[]) {
        items.push({ node, depth, path });
        for (const child of node.children ?? []) {
            walk(child, depth + 1, [...path, node.id]);
        }
    }
    walk(source, 0, []);
    return items;
}
export function getMaxLevel(node: MoneyFlowNode): number {
    const children = node.children ?? [];
    if (children.length === 0) {
        return node.level;
    }
    return Math.max(node.level, ...children.map(getMaxLevel));
}
function shouldExpandChildren(node: MoneyFlowNode, maxLevel: number, expandedBranches: ReadonlySet<string>): boolean {
    if (!node.children?.length) {
        return false;
    }
    if (expandedBranches.has(node.id)) {
        return true;
    }
    if (maxLevel >= 99) {
        return true;
    }
    return node.level < maxLevel;
}
export function filterMoneyFlowTree(node: MoneyFlowNode, maxLevel: number, expandedBranches: ReadonlySet<string>): MoneyFlowNode {
    const expandChildren = shouldExpandChildren(node, maxLevel, expandedBranches);
    return {
        ...node,
        children: expandChildren
            ? (node.children ?? []).map((child) => filterMoneyFlowTree(child, maxLevel, expandedBranches))
            : undefined,
    };
}
export function resolveViewDepth(depth: MoneyFlowViewDepth): number {
    if (depth === 'all') {
        return 99;
    }
    return depth;
}
export function getLevelLabel(level: number): string {
    return `F${level}`;
}
export function countNodesByLevel(items: FlatMoneyFlowNode[]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const { node } of items) {
        counts[node.level] = (counts[node.level] ?? 0) + 1;
    }
    return counts;
}
export function filterFlatMoneyFlowNodes(items: FlatMoneyFlowNode[], options: {
    query?: string;
    level?: number | 'all';
}): FlatMoneyFlowNode[] {
    const normalizedQuery = options.query?.trim().toLowerCase() ?? '';
    return items.filter(({ node }) => {
        if (options.level !== undefined && options.level !== 'all' && node.level !== options.level) {
            return false;
        }
        if (!normalizedQuery) {
            return true;
        }
        const haystack = [
            node.fullName,
            node.cif,
            node.accountNumber,
            getLevelLabel(node.level),
        ].join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
    });
}
export function resolveRevealViewDepth(targetLevel: number): MoneyFlowViewDepth {
    if (targetLevel >= 3) {
        return 'all';
    }
    return Math.max(1, targetLevel) as MoneyFlowViewDepth;
}
export function findMoneyFlowNode(root: MoneyFlowNode, nodeId: string): FlatMoneyFlowNode | null {
    const items = flattenMoneyFlowNodes(root);
    return items.find((item) => item.node.id === nodeId) ?? null;
}
export function getNodePath(root: MoneyFlowNode, nodeId: string): MoneyFlowNode[] {
    const path: MoneyFlowNode[] = [];
    function walk(node: MoneyFlowNode): boolean {
        path.push(node);
        if (node.id === nodeId) {
            return true;
        }
        for (const child of node.children ?? []) {
            if (walk(child)) {
                return true;
            }
        }
        path.pop();
        return false;
    }
    return walk(root) ? path : [];
}
export function collectNodeIds(root: MoneyFlowNode): Set<string> {
    return new Set(flattenMoneyFlowNodes(root).map((item) => item.node.id));
}
