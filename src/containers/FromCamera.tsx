import React, { useState, useRef, useEffect } from 'react';
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
    IconButton,
    Box,
} from '@material-ui/core';
import { CameraRounded } from '@material-ui/icons';
import ResultList from '../components/ResultList';

import { canvasToArray, fromHWCToCHW, ImageSize, coverDrawToCanvas } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';
import { loadModel } from '../utils/onnx';

import ImageNetClassname from '../classname.json';
import { useOnnx } from '../hooks/onnx';

const useStyles = makeStyles(() =>
    createStyles({
        progress: {
            position: 'absolute',
            top: '50%',
            left: '50%',
        },
        viewCenter: {
            position: 'relative',
            textAlign: 'center',
        },
        view: {
            background: '#efefef',
        },
        captureControl: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            bottom: 12,
            left: 0,
            right: 0,
        },
        cameraIcon: { background: 'white', border: '2px rgba(0,0,0,.2) solid' },
    })
);

const imageOptions: ImageSize = {
    width: 224,
    height: 224,
};

interface Props {}
const HomeContainer: React.FC<Props> = (props) => {
    const classes = useStyles();

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoStreamRef = useRef<MediaStream>();

    const [modelPath, setModelPath] = useState<string | File>(process.env.PUBLIC_URL + '/mobilenet_v3_small.onnx');

    const { canvasRef, loading, predit, topkResults } = useOnnx({
        model: modelPath,
        imageOptions,
    });

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

    const captureVideo = () => {
        if (videoRef.current && canvasRef.current) {
            coverDrawToCanvas(videoRef.current, canvasRef.current, {
                sourceSize: {
                    width: videoRef.current.videoWidth,
                    height: videoRef.current.videoHeight,
                },
                targetSize: {
                    width: canvasRef.current.width,
                    height: canvasRef.current.height,
                },
            });
            predit();
        }
    };
    const startTracking = async () => {
        if (videoRef.current && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    width: 480,
                    height: 360,
                    facingMode: 'environment',
                    aspectRatio: 1,
                },
            });
            videoRef.current.srcObject = stream;
            videoStreamRef.current = stream;
        }
    };
    const stopTracking = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject = null;
        }
        if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach((track) => track.stop());
        }
    };
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);
    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
                <Card>
                    <CardActions>
                        <Button size="small" color="primary" variant="contained" onClick={() => startTracking()}>
                            開始錄影
                        </Button>
                        <Button size="small" color="secondary" variant="contained" onClick={handlePickModel}>
                            更換模型
                            <input
                                ref={modelInputRef}
                                style={{ display: 'none' }}
                                type="file"
                                onChange={(e) => modelInputChange(e.target?.files as any as File[])}
                            ></input>
                        </Button>
                    </CardActions>
                    <CardContent className={classes.viewCenter}>
                        {loading && (
                            <div className={classes.progress}>
                                <CircularProgress />
                            </div>
                        )}
                        <Box position="relative">
                            <video
                                style={{ border: '1px rgba(0,0,0,.4) solid' }}
                                ref={videoRef}
                                autoPlay
                                width="224"
                                height="224"
                            ></video>
                            <canvas style={{ display: 'none' }} ref={canvasRef} id="canvas" width="224" height="224" />
                            <div className={classes.captureControl}>
                                <IconButton
                                    className={classes.cameraIcon}
                                    aria-label="capture"
                                    onClick={() => captureVideo()}
                                >
                                    <CameraRounded />
                                </IconButton>
                            </div>
                        </Box>
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
export default HomeContainer;
