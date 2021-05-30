import { InferenceSession } from 'onnxjs';

export async function loadModel(path: Blob | string) {
    const session = new InferenceSession({});
    await session.loadModel(path as string);
    return session;
}
