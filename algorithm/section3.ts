function findCombinations(l: number, t: number): number[][] {
    const result: number[][] = [];
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const n = digits.length;

    for (let i = 0; i < (1 << n); i++) {
        const combination: number[] = [];
        let sum = 0;

        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                combination.push(digits[j]);
                sum += digits[j];
            }
        }

        if (combination.length === l && sum === t) {
            result.push(combination);
        }
    }

    return result.filter((combo, index) => {
        return result.findIndex(c => c.sort().toString() === combo.sort().toString()) === index;
    });
}

console.log(findCombinations(3, 6));
console.log(findCombinations(3, 8));
console.log(findCombinations(4, 5));
