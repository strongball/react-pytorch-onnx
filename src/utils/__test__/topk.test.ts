import { topk } from '../fns';

describe('topk', () => {
    it('default', async () => {
        const case1 = new Float32Array([0.5, 0.2, 0.7, 0.9, 0.8, 0.1, 0.75, 0.65]);
        const result = topk(case1);
        const indexes = result.map((item) => item.index);
        expect(indexes).toEqual([3, 4, 6, 2, 7]);
    });
    it('with k', async () => {
        const case1 = new Float32Array([0.5, 0.2, 0.7, 0.9, 0.8, 0.1, 0.75, 0.65]);
        const result = topk(case1, 2);
        expect(result.length).toBe(2);
    });
});
