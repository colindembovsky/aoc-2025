export function timedExecute(fn: () => void) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const timeTaken = end - start;
    
    if (timeTaken > 1000) {
        console.log(`Time taken: ${(timeTaken / 1000).toFixed(2)}s`);
    } else {
        console.log(`Time taken: ${timeTaken.toFixed(2)}ms`);
    }
    console.log();
}

export class PriorityQueue<T> {
    private items: [number, T][] = [];

    enqueue(item: T, priority: number) {
        this.items.push([priority, item]);
        this.items.sort((a, b) => a[0] - b[0]);
    }

    dequeue(): T | undefined {
        return this.items.shift()?.[1];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}