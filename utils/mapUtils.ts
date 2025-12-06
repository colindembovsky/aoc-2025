export class GridMap<T> {
    constructor(protected lines: T[][]) { }

    get width(): number {
        return this.lines[0].length;
    }

    get height(): number {
        return this.lines.length;
    }

    clone(): GridMap<T> {
        return new GridMap<T>(this.lines.map(line => [...line]));
    }

    get(pos: Position): T | undefined {
        return this.getAt(pos.row, pos.col);
    }

    set(pos: Position, value: T) {
        this.setAt(pos.row, pos.col, value);
    }

    setAt(row: number, col: number, value: T) {
        if (row < 0 || row >= this.height) {
            throw new Error(`Invalid row ${row}`);
        }
        if (col < 0 || col >= this.width) {
            throw new Error(`Invalid col ${col}`);
        }
        this.lines[row][col] = value;
    }

    getAt(row: number, col: number): T | undefined {
        if (row < 0 || row >= this.height) {
            return undefined;
        }
        if (col < 0 || col >= this.width) {
            return undefined;
        }
        return this.lines[row][col];
    }

    swap(a: Position, b: Position) {
        let temp = this.get(a);
        this.set(a, this.get(b)!);
        this.set(b, temp!);
    }

    getAllPositionsWithValue(value: T): Position[] {
        let positions = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.getAt(row, col) === value) {
                    positions.push(new Position(row, col));
                }
            }
        }
        return positions;
    }

    toString(): string {
        return this.lines.map(line => line.join('')).join('\n');
    }
}

export class CharMap extends GridMap<string> {
    constructor(stringLines: string[]) {
        super(stringLines.map(line => line.split('')));
    }
}

export class DigitMap extends GridMap<number> {
    constructor(stringLines: string[]) {
        const numberLines = stringLines.map(line => 
            line.split('').map(char => {
                const num = parseInt(char, 10);
                if (isNaN(num)) {
                    throw new Error(`Invalid numeric character: ${char}`);
                }
                return num;
            })
        );
        super(numberLines);
    }
}

export class Direction {
    constructor(public row: number, public col: number) {}

    add(other: Direction) {
        return new Direction(this.row + other.row, this.col + other.col);
    }

    toString() {
        if (this.equals(Direction.up)) { return "up"; }
        if (this.equals(Direction.down)) { return "down"; }
        if (this.equals(Direction.left)) { return "left"; }
        if (this.equals(Direction.right)) { return "right"; }
        return `${this.row},${this.col}`;
    }
    
    reverse() { return new Direction(-this.row, -this.col); }
    turnLeft() { return new Direction(-this.col, this.row); }
    turnRight() { return new Direction(this.col, -this.row); }
    turnUp() { return new Direction(-this.row, this.col); }
    turnDown() { return new Direction(this.row, -this.col); }
    equals(other: Direction) { return this.row === other.row && this.col === other.col; }

    static up = new Direction(-1, 0);
    static down = new Direction(1, 0);
    static left = new Direction(0, -1);
    static right = new Direction(0, 1);
}

export class Position {
    constructor(public row: number, public col: number) {}
    
    static fromString(pos: string) {
        let [row, col] = pos.split(',').map(s => parseInt(s));
        return new Position(row, col);
    }

    toString() {
        return `${this.row},${this.col}`;
    }

    clone() { return new Position(this.row, this.col); }
    up() { return new Position(this.row - 1, this.col); }
    down() { return new Position(this.row + 1, this.col); }
    left() { return new Position(this.row, this.col - 1); }
    right() { return new Position(this.row, this.col + 1); }

    getNeighbors(minRow = 0, maxRow = Number.MAX_SAFE_INTEGER, minCol = 0, maxCol = Number.MAX_SAFE_INTEGER): Position[] {
        let possible = [this.up(), this.down(), this.left(), this.right()];
        return possible.filter(p => p.row >= minRow && p.row < maxRow && p.col >= minCol && p.col < maxCol);
    }

    getNeighborsIncludingDiagonal(minRow = 0, maxRow = Number.MAX_SAFE_INTEGER, minCol = 0, maxCol = Number.MAX_SAFE_INTEGER): Position[] {
        let possible = this.getNeighbors(minRow, maxRow, minCol, maxCol).concat([
            this.up().left(), this.up().right(),
            this.down().left(), this.down().right()
        ]);
        return possible.filter(p => p.row >= minRow && p.row < maxRow && p.col >= minCol && p.col < maxCol);
    }
    
    move(dir: Direction) {
        return new Position(this.row + dir.row, this.col + dir.col );
    }

    directionFrom(other: Position) {
        let [row, col] = [this.row - other.row, this.col - other.col];
        if (row > 1) { row = 1; }
        if (row < -1) { row = -1; }
        if (col > 1) { col = 1; }
        if (col < -1) { col = -1; }
        return new Direction(row, col);
    }

    equals(other: Position) {
        return this.row === other.row && this.col === other.col;
    }
}

export function dijkstra<T>(
    map: GridMap<T>,
    start: Position,
    end: Position,
    isWalkable: (value: T) => boolean
): { distance: number, path: Position[] } | undefined {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: Position | null } = {};
    const queue: Position[] = [];

    distances[start.toString()] = 0;
    queue.push(start);

    while (queue.length > 0) {
        queue.sort((a, b) => distances[a.toString()] - distances[b.toString()]);
        const current = queue.shift()!;

        if (current.equals(end)) {
            const path = [];
            let at: Position | null = current;
            while (at) {
                path.unshift(at);
                at = previous[at.toString()];
            }
            return { distance: distances[end.toString()], path };
        }

        const neighbors = current.getNeighbors(0, map.height, 0, map.width);
        for (const neighbor of neighbors) {
            const mapValue = map.get(neighbor);
            if (mapValue !== undefined && isWalkable(mapValue)) {
                const dist = distances[current.toString()] + 1;
                if (distances[neighbor.toString()] === undefined || dist < distances[neighbor.toString()]) {
                    distances[neighbor.toString()] = dist;
                    previous[neighbor.toString()] = current;
                    if (!queue.some(p => p.equals(neighbor))) {
                        queue.push(neighbor);
                    }
                }
            }
        }
    }

    return undefined;
}

// search algorithms:
//   breadth-first (bfs): find number of possible end points
//   depth-first (dfs): find number of possible paths to end point
//   dijkstra: find shortest path to end point