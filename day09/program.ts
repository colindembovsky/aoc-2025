import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

let points: { x: number, y: number }[] = [];
for (let line of lines) {
    let [x, y] = line.split(",").map(Number);
    points.push({ x, y });
}

function area(pointA: { x: number, y: number }, pointB: { x: number, y: number }) {
    return (Math.abs(pointA.x - pointB.x) + 1) * (Math.abs(pointA.y - pointB.y) + 1);
}

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let maxArea = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const currentArea = area(points[i], points[j]);
            if (currentArea > maxArea) {
                maxArea = currentArea;
            }
        }
    }

    console.log(`The maximum area is ${maxArea}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    // Build horizontal and vertical segments from the boundary
    type Segment = { 
        x1: number, y1: number, 
        x2: number, y2: number, 
        isHorizontal: boolean 
    };
    
    const segments: Segment[] = [];
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const isHorizontal = p1.y === p2.y;
        segments.push({
            x1: Math.min(p1.x, p2.x),
            y1: Math.min(p1.y, p2.y),
            x2: Math.max(p1.x, p2.x),
            y2: Math.max(p1.y, p2.y),
            isHorizontal
        });
    }

    // Check if a point is inside the polygon using ray casting
    function isInsidePolygon(x: number, y: number): boolean {
        let crossings = 0;
        // Cast ray to the right (positive x direction)
        for (const seg of segments) {
            if (seg.isHorizontal) continue; // Only count vertical segments
            
            // Check if ray at height y intersects this vertical segment
            if (y > seg.y1 && y <= seg.y2) { // y is between segment endpoints
                if (x < seg.x1) { // Segment is to the right of point
                    crossings++;
                }
            }
        }
        return crossings % 2 === 1;
    }

    // Check if a segment intersects a rectangle (excluding boundaries that touch)
    function segmentCrossesRectangle(seg: Segment, minX: number, minY: number, maxX: number, maxY: number): boolean {
        if (seg.isHorizontal) {
            // Horizontal segment: y is constant at seg.y1
            // Check if it passes through the interior of the rectangle
            if (seg.y1 > minY && seg.y1 < maxY) {
                // Check if x range overlaps with interior of rectangle
                if (seg.x2 > minX && seg.x1 < maxX) {
                    return true;
                }
            }
        } else {
            // Vertical segment: x is constant at seg.x1
            // Check if it passes through the interior of the rectangle
            if (seg.x1 > minX && seg.x1 < maxX) {
                // Check if y range overlaps with interior of rectangle
                if (seg.y2 > minY && seg.y1 < maxY) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if a rectangle defined by two corner points is entirely filled with tiles
    function isRectangleFilled(p1: { x: number, y: number }, p2: { x: number, y: number }): boolean {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);

        // Check center point to see if the rectangle is inside
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        if (!isInsidePolygon(centerX, centerY)) {
            return false;
        }

        // Check if any boundary segment crosses through the interior of this rectangle
        for (const seg of segments) {
            if (segmentCrossesRectangle(seg, minX, minY, maxX, maxY)) {
                return false;
            }
        }

        return true;
    }

    let maxArea = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            if (isRectangleFilled(points[i], points[j])) {
                const currentArea = area(points[i], points[j]);
                if (currentArea > maxArea) {
                    maxArea = currentArea;
                }
            }
        }
    }

    console.log(`The maximum area is ${maxArea}`);
});