import React from 'react';
import { HashRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { AppBar, Container, Toolbar, Typography, Button, createStyles, makeStyles, Theme } from '@material-ui/core';

import FromCameraContainer from './containers/FromCamera';
import FromFileContainer from './containers/FromFile';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            flexGrow: 1,
        },
        body: {
            marginTop: theme.spacing(2),
        },
    })
);
const App: React.FC = () => {
    const classes = useStyles();
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <AppBar position="relative">
                <Toolbar>
                    <Typography className={classes.title} variant="h6" color="inherit" noWrap>
                        React Onnx
                    </Typography>
                    <nav>
                        <Button component={Link} color="inherit" to="/file">
                            從檔案
                        </Button>
                        <Button component={Link} color="inherit" to="/camera">
                            從相機
                        </Button>
                    </nav>
                </Toolbar>
            </AppBar>
            <Container className={classes.body}>
                <Switch>
                    <Route path="/" exact component={FromFileContainer} />
                    <Route path="/file" exact component={FromFileContainer} />
                    <Route path="/camera" exact component={FromCameraContainer} />
                </Switch>
            </Container>
        </Router>
    );
};

export default App;
