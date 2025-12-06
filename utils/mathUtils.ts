export function gcd(a: number, b: number): number {
    if (b === 0) return a;
    return gcd(b, a % b);
}

export function extendedGcd(a: number, b: number): [number, number, number] {
    if (b === 0) return [a, 1, 0];
    const [gcd, x1, y1] = extendedGcd(b, a % b);
    return [gcd, y1, x1 - Math.floor(a / b) * y1];
}

export function lcm(numbers: number[]) {
    let lcm = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        lcm = (lcm * numbers[i]) / gcd(lcm, numbers[i]);
    }
    return lcm;
}