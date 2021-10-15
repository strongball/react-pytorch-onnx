// import 'jest-canvas-mock';
import React from 'react';

class MyImage extends Image {
    constructor(...args: any[]) {
        super(...args);
        setTimeout(() => {
            (this as any).onload(); // simulate success
        }, 100);
    }
}
global.Image = MyImage;
