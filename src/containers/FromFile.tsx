import React, { useEffect, useState, useRef } from 'react';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    makeStyles,
    createStyles,
    Grid,
} from '@material-ui/core';
import ResultList from '../components/ResultList';

import { canvasToArray, drawImageToCanvas, fromHWCToCHW, ImageSize } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';
import { loadModel } from '../utils/onnx';
import { useOnnx } from '../hooks/onnx';

const useStyles = makeStyles(() =>
    createStyles({
        progress: {
            position: 'absolute',
            top: '50%',
            left: '50%',
        },
        viewCenter: {
            textAlign: 'center',
        },
        view: {
            background: '#efefef',
        },
    })
);

const imageOptions: ImageSize = {
    width: 224,
    height: 224,
};
interface Props {}
const FileContainer: React.FC<Props> = (props) => {
    const classes = useStyles();
    const [url, setURL] = useState<string>();

    const [modelPath, setModelPath] = useState<string | File>(process.env.PUBLIC_URL + '/mobilenet_v3_small.onnx');

    const { canvasRef, loading, predit, topkResults } = useOnnx({
        model: modelPath,
        imageOptions,
    });

    useEffect(() => {
        (async () => {
            if (!url) {
                return;
            }
            await drawImageToCanvas(url, { imageSize: imageOptions, canvas: canvasRef.current! });
            predit();
        })();
    }, [url]);

    const modelInputRef = useRef<HTMLInputElement>(null);
    const handlePickModel = () => {
        modelInputRef.current?.click();
    };
    const modelInputChange = async (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        setModelPath(files[0]);
    };

    const imageInputRef = useRef<HTMLInputElement>(null);
    const handlePickImage = () => {
        imageInputRef.current?.click();
    };
    const inputChange = (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        setURL(URL.createObjectURL(files[0]));
    };

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
                <Card>
                    <CardActions>
                        <Button size="small" color="primary" variant="contained" onClick={handlePickImage}>
                            上傳圖片
                            <input
                                ref={imageInputRef}
                                style={{ display: 'none' }}
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={(e) => inputChange(e.target?.files as any as File[])}
                            />
                        </Button>
                        <Button size="small" color="secondary" variant="contained" onClick={handlePickModel}>
                            更換模型
                            <input
                                ref={modelInputRef}
                                style={{ display: 'none' }}
                                type="file"
                                onChange={(e) => modelInputChange(e.target?.files as any as File[])}
                            />
                        </Button>
                    </CardActions>
                    <CardContent className={classes.viewCenter}>
                        {loading && (
                            <div className={classes.progress}>
                                <CircularProgress />
                            </div>
                        )}
                        <canvas ref={canvasRef} className={classes.view} width="224" height="224" />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <ResultList topkResults={topkResults} />
                </Card>
            </Grid>
        </Grid>
    );
};
export default FileContainer;
