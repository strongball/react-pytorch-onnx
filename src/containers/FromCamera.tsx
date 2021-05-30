import React, { useState, useRef, useEffect } from 'react';
import { Tensor, InferenceSession } from 'onnxjs';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    makeStyles,
    createStyles,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
} from '@material-ui/core';
import { PlayArrow, Camera } from '@material-ui/icons';
import { canvasToArray, fromHWCToCHW, ImageSize, coverDrawToCanvas } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';
import { loadModel } from '../utils/onnx';

import ImageNetClassname from '../classname.json';

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
            bottom: 0,
            left: 0,
            right: 0,
        },
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [recordLoading, setRecordLoading] = useState<boolean>(false);

    const [topkResult, setTopkResult] = useState<TopkResult[]>([]);

    const sessionPromise = useRef<Promise<InferenceSession>>(
        loadModel(process.env.PUBLIC_URL + '/mobilenet_v3_small.onnx')
    );

    const modelInputRef = useRef<HTMLInputElement>(null);
    const handlePickModel = () => {
        modelInputRef.current?.click();
    };
    const modelInputChange = async (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        sessionPromise.current = loadModel(files[0]);
    };

    const predit = async () => {
        if (!canvasRef.current) {
            return;
        }
        if (!sessionPromise.current) {
            alert('沒有選擇模型!');
            return;
        }
        setLoading(true);
        try {
            console.log('start pred');
            const session = await sessionPromise.current;
            const arrImage = canvasToArray(canvasRef.current);
            const imageCHW = fromHWCToCHW(arrImage, imageOptions);
            const inputTensor = new Tensor(imageCHW, 'float32', [1, 3, 224, 224]);
            const outputMap = await session.run([inputTensor]);
            const output: Float32Array = outputMap.values().next().value.data;
            const topk5 = topk(output);
            setTopkResult(topk5);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
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
        setRecordLoading(true);
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
        setRecordLoading(false);
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
            console.log('call');
        };
    }, []);
    return (
        <Grid container spacing={2} justify="center">
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
                                onChange={(e) => modelInputChange((e.target?.files as any) as File[])}
                            ></input>
                        </Button>
                    </CardActions>
                    <CardContent className={classes.viewCenter}>
                        {loading && (
                            <div className={classes.progress}>
                                <CircularProgress />
                            </div>
                        )}
                        <video ref={videoRef} autoPlay width="224" height="224"></video>
                        <canvas style={{ display: 'none' }} ref={canvasRef} id="canvas" width="224" height="224" />
                        <div className={classes.captureControl}>
                            <IconButton aria-label="capture" onClick={() => captureVideo()}>
                                <Camera />
                            </IconButton>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <List>
                        {topkResult.map((item, index) => (
                            <ListItem key={item.index}>
                                <ListItemAvatar>
                                    <Avatar>{index + 1}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={ImageNetClassname[item.index.toString() as '0']}
                                    secondary={`(${(item.value * 100).toFixed(2)}%)`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Card>
            </Grid>
        </Grid>
    );
};
export default HomeContainer;
