import React from 'react';
import { render } from '@testing-library/react';
import { loadImage, fromHWCToCHW } from '../image';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';

const imageSrc = 'https://fakeimg.pl/250x100';

describe('loadImage', () => {
    it('default', async () => {
        const imageElement = await loadImage(imageSrc);
        expect(imageElement).not.toBeUndefined();
    });
});

const TestCanvasImage = [
    [
        [1.0, 2, 3, 4],
        [1.0, 2, 3, 4],
        [1.0, 2, 3, 4],
    ],
    [
        [1.0, 2, 3, 4],
        [1.0, 2, 3, 4],
        [1.0, 2, 3, 4],
    ],
];
describe('fromHWCToCHW', () => {
    it('default', async () => {
        const height = TestCanvasImage.length;
        const width = TestCanvasImage[0].length;
        const result = fromHWCToCHW(TestCanvasImage.flat().flat(), {
            height: height,
            width: width,
        });
        expect(result.length).toBe(3 * height * width);

        const dataProcessed = ndarray(result, [1, 3, height, width]);
        ops.mulseq(dataProcessed, 255.0);
        // rba => 1,2,3. value * w * h.
        expect(ops.sum(dataProcessed.pick(0, 0, null, null))).toBe(1 * height * width);
        expect(ops.sum(dataProcessed.pick(0, 1, null, null))).toBe(2 * height * width);
        expect(ops.sum(dataProcessed.pick(0, 2, null, null))).toBe(3 * height * width);
    });
});
