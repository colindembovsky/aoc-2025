import { loadInput, dayName, Difficulty } from "../utils/readUtils";
import { timedExecute } from "../utils/miscUtils";

let day = dayName(__dirname);
let contents = loadInput(__dirname, Difficulty.HARD);
let lines = contents.split("\n");

class Machine {
    targetLights = "";
    startLights: string = "";
    buttons: number[][] = [];
    targetJoltage: number[] = [];
    startJoltage: number[] = [];

    constructor(line: string) {
        let parts = line.split(" ");
        this.targetLights = parts[0].slice(1, -1);
        this.startLights = ".".repeat(this.targetLights.length);
        for (let i = 1; i < parts.length - 1; i++) {
            let button = parts[i].slice(1, -1).split(",").map(Number);
            this.buttons.push(button);
        }
        this.targetJoltage = parts[parts.length - 1].slice(1, -1).split(",").map(Number);
        this.startJoltage = new Array(this.targetJoltage.length).fill(0);
    }

    pressLightsButton(lights: string, buttonIndex: number): string {
        let result = lights;
        const button = this.buttons[buttonIndex];
        for (const j of button) {
            result = result.substring(0, j) + (result[j] === "." ? "#" : ".") + result.substring(j + 1);
        }
        return result;
    }

    pressJoltageButton(joltage: number[], buttonIndex: number): number[] {
        let result = joltage;
        const button = this.buttons[buttonIndex];
        for (const j of button) {
            joltage[j] += 1;
        }
        return result;
    }

    setLights() {
        // BFS to find minimum presses - guarantees shortest path
        const visited = new Set<string>();
        const queue: { lights: string; presses: number }[] = [];
        
        queue.push({ lights: this.startLights, presses: 0 });
        visited.add(this.startLights);

        while (queue.length > 0) {
            const { lights, presses } = queue.shift()!;

            if (lights === this.targetLights) {
                return presses;
            }

            for (let i = 0; i < this.buttons.length; i++) {
                const newLights = this.pressLightsButton(lights, i);
                
                if (!visited.has(newLights)) {
                    visited.add(newLights);
                    queue.push({ lights: newLights, presses: presses + 1 });
                }
            }
        }

        return -1; // No solution found
    }

    setJoltage() {
        // Build coefficient matrix: coeff[i][j] = how much button j adds to joltage position i
        const numPositions = this.targetJoltage.length;
        const numButtons = this.buttons.length;
        
        const coeff: number[][] = [];
        for (let i = 0; i < numPositions; i++) {
            coeff.push(new Array(numButtons).fill(0));
        }
        
        for (let btnIdx = 0; btnIdx < numButtons; btnIdx++) {
            for (const pos of this.buttons[btnIdx]) {
                if (pos < numPositions) {
                    coeff[pos][btnIdx] += 1;
                }
            }
        }
        
        const target = [...this.targetJoltage];
        
        // Use Gaussian elimination with BigInt for exact arithmetic
        // Create augmented matrix using BigInt
        const aug: bigint[][] = [];
        for (let i = 0; i < numPositions; i++) {
            aug.push([...coeff[i].map(x => BigInt(x)), BigInt(target[i])]);
        }
        
        const rows = aug.length;
        const cols = aug[0].length;
        const pivotCols: number[] = [];
        let pivotRow = 0;
        
        // Forward elimination (to row echelon form)
        for (let col = 0; col < numButtons && pivotRow < rows; col++) {
            // Find non-zero pivot
            let foundPivot = -1;
            for (let row = pivotRow; row < rows; row++) {
                if (aug[row][col] !== 0n) {
                    foundPivot = row;
                    break;
                }
            }
            
            if (foundPivot === -1) continue;
            
            // Swap rows
            [aug[pivotRow], aug[foundPivot]] = [aug[foundPivot], aug[pivotRow]];
            pivotCols.push(col);
            
            // Eliminate below using integer operations
            for (let row = pivotRow + 1; row < rows; row++) {
                if (aug[row][col] !== 0n) {
                    const pivotVal = aug[pivotRow][col];
                    const rowVal = aug[row][col];
                    for (let j = 0; j < cols; j++) {
                        aug[row][j] = aug[row][j] * pivotVal - aug[pivotRow][j] * rowVal;
                    }
                    // Reduce by GCD
                    let g = 0n;
                    for (let j = 0; j < cols; j++) {
                        g = gcd(g, aug[row][j] < 0n ? -aug[row][j] : aug[row][j]);
                    }
                    if (g > 1n) {
                        for (let j = 0; j < cols; j++) {
                            aug[row][j] /= g;
                        }
                    }
                }
            }
            pivotRow++;
        }
        
        // Check for inconsistency
        for (let row = pivotRow; row < rows; row++) {
            let allZero = true;
            for (let col = 0; col < numButtons; col++) {
                if (aug[row][col] !== 0n) {
                    allZero = false;
                    break;
                }
            }
            if (allZero && aug[row][cols - 1] !== 0n) {
                return -1; // Inconsistent system
            }
        }
        
        // Find free variables
        const pivotSet = new Set(pivotCols);
        const freeVars: number[] = [];
        for (let col = 0; col < numButtons; col++) {
            if (!pivotSet.has(col)) {
                freeVars.push(col);
            }
        }
        
        // Helper function to solve given free variable values
        const solveWithFreeVars = (freeValues: bigint[]): bigint[] | null => {
            const solution: bigint[] = new Array(numButtons).fill(0n);
            
            // Set free variables
            for (let i = 0; i < freeVars.length; i++) {
                solution[freeVars[i]] = freeValues[i];
            }
            
            // Back substitution for pivot variables
            for (let i = pivotCols.length - 1; i >= 0; i--) {
                const row = i;
                const col = pivotCols[i];
                
                let sum = aug[row][cols - 1];
                for (let j = col + 1; j < numButtons; j++) {
                    sum -= aug[row][j] * solution[j];
                }
                
                if (aug[row][col] === 0n) return null;
                if (sum % aug[row][col] !== 0n) return null;
                
                solution[col] = sum / aug[row][col];
                if (solution[col] < 0n) return null;
            }
            
            // Verify solution
            for (let pos = 0; pos < numPositions; pos++) {
                let sum = 0n;
                for (let btn = 0; btn < numButtons; btn++) {
                    sum += BigInt(coeff[pos][btn]) * solution[btn];
                }
                if (sum !== BigInt(target[pos])) return null;
            }
            
            return solution;
        };
        
        // If no free variables, solve directly
        if (freeVars.length === 0) {
            const sol = solveWithFreeVars([]);
            if (sol === null) return -1;
            return Number(sol.reduce((a, b) => a + b, 0n));
        }
        
        // Calculate upper bounds for free variables
        const maxFree: number[] = [];
        for (const fv of freeVars) {
            let maxVal = 500; // Default cap
            for (let pos = 0; pos < numPositions; pos++) {
                if (coeff[pos][fv] > 0) {
                    maxVal = Math.min(maxVal, Math.floor(target[pos] / coeff[pos][fv]));
                }
            }
            maxFree.push(maxVal);
        }
        
        // Search over free variables
        let minTotal = BigInt(Number.MAX_SAFE_INTEGER);
        
        const search = (idx: number, freeValues: bigint[], currentSum: bigint): void => {
            if (currentSum >= minTotal) return;
            
            if (idx === freeVars.length) {
                const sol = solveWithFreeVars(freeValues);
                if (sol !== null) {
                    const total = sol.reduce((a, b) => a + b, 0n);
                    if (total < minTotal) {
                        minTotal = total;
                    }
                }
                return;
            }
            
            for (let val = 0; val <= maxFree[idx]; val++) {
                if (currentSum + BigInt(val) >= minTotal) break;
                freeValues[idx] = BigInt(val);
                search(idx + 1, freeValues, currentSum + BigInt(val));
            }
        };
        
        search(0, new Array(freeVars.length).fill(0n), 0n);
        
        return minTotal === BigInt(Number.MAX_SAFE_INTEGER) ? -1 : Number(minTotal);
    }
}

function gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

console.log(`==== ${day}: PART 1 ====`);
timedExecute(() => {
    let total = 0;
    for (let line of lines) {
        let machine = new Machine(line);
        total += machine.setLights();
    }   
    console.log(`Minimum button presses to reach target lights: ${total}`);
});

console.log(`==== ${day}: PART 2 ====`);
timedExecute(() => {
    let total = 0;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let machine = new Machine(line);
        let result = machine.setJoltage();
        if (result === -1) {
            console.log(`No solution found for machine ${i}: ${line.substring(0, 50)}...`);
            return;
        }
        total += result;
    }   
    console.log(`Minimum button presses to reach target joltage: ${total}`);
});