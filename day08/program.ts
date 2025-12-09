import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let NUMCONNECTIONS = 1000;
let lines = contents.split("\n");

// precompute
let points: { x: number, y: number, z: number }[] = [];
lines.forEach((line) => {
    let [x, y, z] = line.split(',').map(Number);
    points.push({ x, y, z });
});

// Union-Find for efficient circuit tracking
const parent: number[] = points.map((_, i) => i);
const rank: number[] = points.map(() => 0);

const find = (x: number): number => {
    if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
    return parent[x];
};

const union = (x: number, y: number): boolean => {
    const px = find(x), py = find(y);
    if (px === py) return false; // already in same circuit
    // union by rank
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
};

// Pre-compute all distances and sort
const edges: { i: number, j: number, d: number }[] = [];
for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
        const p1 = points[i], p2 = points[j];
        const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2);
        edges.push({ i, j, d });
    }
}
edges.sort((a, b) => a.d - b.d);

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    // Take first NUMCONNECTIONS edges (skip already-connected pairs)
    let connections = 0;
    for (const edge of edges) {
        if (connections >= NUMCONNECTIONS) break;
        union(edge.i, edge.j); // merge circuits (no-op if same circuit)
        connections++;
    }

    // Count circuit sizes
    const circuitSizes: Map<number, number> = new Map();
    for (let i = 0; i < points.length; i++) {
        const root = find(i);
        circuitSizes.set(root, (circuitSizes.get(root) || 0) + 1);
    }
    
    const sizes = [...circuitSizes.values()].sort((a, b) => b - a);
    const result = sizes.slice(0, 3).reduce((acc, s) => acc * s, 1);
    console.log(`Circuit sizes: ${sizes.join(', ')}`);
    console.log(`Result: ${result}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    // Reset Union-Find
    for (let i = 0; i < points.length; i++) {
        parent[i] = i;
        rank[i] = 0;
    }
    
    let lastEdge: { i: number, j: number, d: number } | null = null;
    let numCircuits = points.length;
    
    for (const edge of edges) {
        if (numCircuits === 1) break;
        if (union(edge.i, edge.j)) {
            numCircuits--;
            lastEdge = edge;
        }
    }
    
    if (lastEdge) {
        const p1 = points[lastEdge.i];
        const p2 = points[lastEdge.j];
        console.log(`Last connection: (${p1.x},${p1.y},${p1.z}) and (${p2.x},${p2.y},${p2.z})`);
        console.log(`Distance from wall: ${p1.x * p2.x}`);
    }
});