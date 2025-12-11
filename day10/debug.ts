const line = "[..#..##.#] (2,3,4,5,6,7,8) (1,4,6) (0,1,2,3,4) (0,1,2,3,5,6,8) (0,1,2,3,4,6,8) (4,8) (1,2,7) (0,1,2,3,4,7,8) (1,2,4) (1,2,4,5,8) (1,2,4,5,7,8) {159,223,228,172,217,44,33,48,69}";
const parts = line.split(" ");
const buttons: number[][] = [];
for (let i = 1; i < parts.length - 1; i++) {
    buttons.push(parts[i].slice(1, -1).split(",").map(Number));
}
const target = parts[parts.length - 1].slice(1, -1).split(",").map(Number);
console.log('Buttons:', buttons.length);
console.log('Target positions:', target.length);
const numPositions = target.length;
const numButtons = buttons.length;

const coeff: number[][] = [];
for (let i = 0; i < numPositions; i++) {
    coeff.push(new Array(numButtons).fill(0));
}
for (let btnIdx = 0; btnIdx < numButtons; btnIdx++) {
    for (const pos of buttons[btnIdx]) {
        if (pos < numPositions) {
            coeff[pos][btnIdx] += 1;
        }
    }
}

// Create augmented matrix
const aug: number[][] = [];
for (let i = 0; i < numPositions; i++) {
    aug.push([...coeff[i], target[i]]);
}

console.log('Initial augmented matrix:');
aug.forEach((row, i) => console.log(i, ':', row));

// Gaussian elimination
const rows = aug.length;
const cols = aug[0].length;
const pivotCols: number[] = [];
let pivotRow = 0;

for (let col = 0; col < numButtons && pivotRow < rows; col++) {
    let maxRow = -1;
    for (let row = pivotRow; row < rows; row++) {
        if (aug[row][col] !== 0) {
            if (maxRow === -1 || Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
                maxRow = row;
            }
        }
    }
    
    if (maxRow === -1) {
        console.log('No pivot found for col', col);
        continue;
    }
    
    [aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]];
    pivotCols.push(col);
    console.log('Pivot col', col, 'at row', pivotRow);
    
    for (let row = 0; row < rows; row++) {
        if (row !== pivotRow && aug[row][col] !== 0) {
            const factor = aug[row][col] / aug[pivotRow][col];
            for (let j = 0; j < cols; j++) {
                aug[row][j] -= factor * aug[pivotRow][j];
            }
        }
    }
    pivotRow++;
}

console.log('\nReduced matrix:');
aug.forEach((row, i) => console.log(i, ':', row.map(x => Math.round(x * 1000) / 1000)));
console.log('Pivot cols:', pivotCols);

// Find free variables
const pivotSet = new Set(pivotCols);
const freeVars: number[] = [];
for (let col = 0; col < numButtons; col++) {
    if (!pivotSet.has(col)) {
        freeVars.push(col);
    }
}
console.log('Free vars:', freeVars);

// Check for inconsistency
for (let row = pivotRow; row < rows; row++) {
    let allZero = true;
    for (let col = 0; col < numButtons; col++) {
        if (Math.abs(aug[row][col]) > 1e-9) {
            allZero = false;
            break;
        }
    }
    if (allZero && Math.abs(aug[row][cols - 1]) > 1e-9) {
        console.log('INCONSISTENT at row', row, ':', aug[row]);
    }
}

// If no free variables, solve directly
if (freeVars.length === 0) {
    const solution = new Array(numButtons).fill(0);
    for (let i = 0; i < pivotCols.length; i++) {
        const col = pivotCols[i];
        const val = aug[i][cols - 1] / aug[i][col];
        console.log('Solving pivot col', col, ': val =', val);
        const rounded = Math.round(val);
        if (Math.abs(val - rounded) > 1e-6 || rounded < 0) {
            console.log('INVALID: not integer or negative');
        }
        solution[col] = rounded;
    }
    console.log('Solution:', solution);
    console.log('Total:', solution.reduce((a, b) => a + b, 0));
}
