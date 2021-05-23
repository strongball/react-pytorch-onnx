export interface TopkResult {
    index: number;
    value: number;
}
export function topk(data: Float32Array, k = 5) {
    return Array.from(data)
        .map<TopkResult>((value, index) => ({
            index,
            value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, k);
}
