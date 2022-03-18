import { InferenceSession } from 'onnxruntime-web';

export async function loadModel(path: File | string) {
    const data = typeof path === 'string' ? path : await path.arrayBuffer();
    const session = await InferenceSession.create(data as any, {
        executionProviders: ['wasm'],
    });
    return session;
}
