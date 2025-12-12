import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);

const SHAPE_SIZE = 3;

class Shape {
    constructor(public index: number, public shape: number[][]) {
    }

    rotate90(): Shape {
        const newShape: number[][] = [];
        for (let c = 0; c < SHAPE_SIZE; c++) {
            const newRow: number[] = [];
            for (let r = SHAPE_SIZE - 1; r >= 0; r--) {
                newRow.push(this.shape[r][c]);
            }
            newShape.push(newRow);
        }
        return new Shape(this.index, newShape);
    }

    flipHorizontal(): Shape {
        let newShape: number[][] = this.shape.map(row => row.slice().reverse());
        return new Shape(this.index, newShape);
    }

    getOrientations(): Shape[] {
        const orientations: Shape[] = [];
        
        let currentShape: Shape = this;
        for (let i = 0; i < 4; i++) {
            orientations.push(currentShape);
            currentShape = currentShape.rotate90();
        }
        currentShape = this.flipHorizontal();
        for (let i = 0; i < 4; i++) {
            orientations.push(currentShape);
            currentShape = currentShape.rotate90();
        }
        
        return orientations;
    }
}

// split lines into groups of lines by empty lines
let shapeLines = contents.split("\n\n").map(group => group.split("\n"));
// the last group is the map, so pop it off
let regionLines = shapeLines.pop()!;
let regions = new Map<number, { width: number, height: number, shapeCounts: number[] }>();
regionLines.forEach((line, i) => {
    let [grid, nums] = line.split(": ");
    let [width, height] = grid.split("x").map(n => parseInt(n));
    let shapeCounts = nums.split(" ").map(n => parseInt(n));
    regions.set(i, { width, height, shapeCounts });
});

let shapes = new Map<number, Shape>();
shapeLines.map(g => {
    let index = parseInt(g[0].split(":")[0]);
    let shapeNums: number[][] = [];
    for (let i = 1; i < g.length; i++) {
        shapeNums.push(g[i].split("").map(c => c === "#" ? 1 : 0));
    }
    shapes.set(index, new Shape(index, shapeNums));
});

// Pre-computed shape data for fast placement checks (all shapes are 3x3)
interface PlacementData {
    cells: number[];  // encoded as r * SHAPE_SIZE + c for each filled cell
}

function precomputePlacements(shape: Shape): PlacementData[] {
    const placements: PlacementData[] = [];
    const seen = new Set<string>();
    
    for (const orientation of shape.getOrientations()) {
        const cells: number[] = [];
        for (let r = 0; r < SHAPE_SIZE; r++) {
            for (let c = 0; c < SHAPE_SIZE; c++) {
                if (orientation.shape[r][c] === 1) {
                    cells.push(r * SHAPE_SIZE + c);  // encode as r*3+c (0-8)
                }
            }
        }
        
        // Deduplicate orientations
        const key = cells.join(",");
        if (!seen.has(key)) {
            seen.add(key);
            placements.push({ cells });
        }
    }
    return placements;
}

function checkShapesFitRegion(region: { width: number, height: number, shapeCounts: number[] }, shapes: Map<number, Shape>): boolean {
    const { width, height, shapeCounts } = region;
    
    // Build list of shapes to place, sorted by size (largest first for better pruning)
    const shapesToPlace: { shapeIndex: number, placements: PlacementData[], cellCount: number }[] = [];
    for (let i = 0; i < shapeCounts.length; i++) {
        const count = shapeCounts[i];
        if (count > 0) {
            const shape = shapes.get(i);
            if (!shape) continue;
            const placements = precomputePlacements(shape);
            const cellCount = placements[0]?.cells.length ?? 0;
            for (let j = 0; j < count; j++) {
                shapesToPlace.push({ shapeIndex: i, placements, cellCount });
            }
        }
    }
    
    // Sort by cell count descending, then by shapeIndex to keep identical shapes together
    shapesToPlace.sort((a, b) => {
        if (b.cellCount !== a.cellCount) return b.cellCount - a.cellCount;
        return a.shapeIndex - b.shapeIndex;
    });
    
    // Use a Set for O(1) collision detection
    const occupied = new Set<number>();
    const totalCells = width * height;
    
    // Calculate total cells needed
    const totalNeeded = shapesToPlace.reduce((sum, s) => sum + s.cellCount, 0);
    if (totalNeeded > totalCells) return false;
    
    // Pre-calculate remaining cells for each position to avoid repeated computation
    const remainingCellsFrom: number[] = new Array(shapesToPlace.length + 1);
    remainingCellsFrom[shapesToPlace.length] = 0;
    for (let i = shapesToPlace.length - 1; i >= 0; i--) {
        remainingCellsFrom[i] = remainingCellsFrom[i + 1] + shapesToPlace[i].cellCount;
    }
    
    function canPlace(placement: PlacementData, startRow: number, startCol: number): boolean {
        if (startRow + SHAPE_SIZE > height || startCol + SHAPE_SIZE > width) return false;
        for (const encoded of placement.cells) {
            const r = Math.floor(encoded / SHAPE_SIZE);
            const c = encoded % SHAPE_SIZE;
            if (occupied.has((startRow + r) * width + (startCol + c))) return false;
        }
        return true;
    }
    
    function place(placement: PlacementData, startRow: number, startCol: number): number[] {
        const placed: number[] = [];
        for (const encoded of placement.cells) {
            const r = Math.floor(encoded / SHAPE_SIZE);
            const c = encoded % SHAPE_SIZE;
            const gridIdx = (startRow + r) * width + (startCol + c);
            occupied.add(gridIdx);
            placed.push(gridIdx);
        }
        return placed;
    }
    
    function unplace(placed: number[]): void {
        for (const idx of placed) {
            occupied.delete(idx);
        }
    }
    
    // Symmetry breaking: for identical consecutive shapes, enforce lexicographic ordering
    // minPos encodes the minimum (orientationIdx, row, col) for same-type shapes
    function solve(shapeIdx: number, minOrientationIdx: number, minRow: number, minCol: number): boolean {
        if (shapeIdx >= shapesToPlace.length) return true;
        
        const { placements, shapeIndex } = shapesToPlace[shapeIdx];
        
        // Prune: not enough space left
        if (totalCells - occupied.size < remainingCellsFrom[shapeIdx]) return false;
        
        // Check if next shape is same type (for symmetry breaking)
        const nextIsSameShape = shapeIdx + 1 < shapesToPlace.length && 
                               shapesToPlace[shapeIdx + 1].shapeIndex === shapeIndex;
        
        // Try each orientation (starting from minOrientationIdx for same-shape symmetry breaking)
        for (let oi = minOrientationIdx; oi < placements.length; oi++) {
            const placement = placements[oi];
            const rowStart = (oi === minOrientationIdx) ? minRow : 0;
            
            for (let row = rowStart; row <= height - SHAPE_SIZE; row++) {
                const colStart = (oi === minOrientationIdx && row === minRow) ? minCol : 0;
                
                for (let col = colStart; col <= width - SHAPE_SIZE; col++) {
                    if (canPlace(placement, row, col)) {
                        const placed = place(placement, row, col);
                        
                        // Pass constraints to next shape if it's the same type
                        const nextOi = nextIsSameShape ? oi : 0;
                        const nextRow = nextIsSameShape ? row : 0;
                        const nextCol = nextIsSameShape ? col : 0;
                        
                        if (solve(shapeIdx + 1, nextOi, nextRow, nextCol)) return true;
                        unplace(placed);
                    }
                }
            }
        }
        return false;
    }
    
    return solve(0, 0, 0, 0);
}


console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let canFitCount = 0;
    regions.forEach((region, regionIndex) => {
        //console.log(`Region ${regionIndex} (${region.width}x${region.height}):`);
        const canFit = checkShapesFitRegion(region, shapes);
        //console.log(`  Can fit shapes: ${canFit}`);
        if (canFit) canFitCount++;
    });
    console.log(`Total regions that can fit shapes: ${canFitCount}`);
});