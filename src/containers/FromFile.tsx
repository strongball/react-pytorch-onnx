import React, { useEffect, useState, useRef } from 'react';
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
} from '@material-ui/core';

import { canvasToArray, drawImageToCanvas, fromHWCToCHW, ImageSize } from '../utils/image';
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
const HomeContainer: React.FC<Props> = (props) => {
    const classes = useStyles();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [url, setURL] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [topkResult, setTopkResult] = useState<TopkResult[]>([]);

    const sessionPromise = useRef<Promise<InferenceSession>>(
        loadModel(process.env.PUBLIC_URL + '/mobilenet_v3_small.onnx')
    );
    useEffect(() => {
        (async () => {
            if (!url) {
                return;
            }
            if (!sessionPromise.current) {
                alert('沒有選擇模型!');
                return;
            }
            setLoading(true);
            try {
                const session = await sessionPromise.current;
                const canvas = await drawImageToCanvas(url, { imageSize: imageOptions, canvas: canvasRef.current! });
                const arrImage = canvasToArray(canvas);
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
        sessionPromise.current = loadModel(files[0]);
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
        <Grid container spacing={2} justify="center">
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
                                onChange={(e) => inputChange((e.target?.files as any) as File[])}
                            />
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
                        <canvas ref={canvasRef} className={classes.view} width="224" height="224" />
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
