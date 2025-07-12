export function sameElementsSorted<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
}