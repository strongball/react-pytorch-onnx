import { Avatar, List, ListItemAvatar, ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { TopkResult } from '../utils/fns';
import ImageNetClassname from '../classname.json';

interface Props {
    topkResults: TopkResult[];
}
const ResultList: React.FC<Props> = (props) => {
    const { topkResults } = props;
    return (
        <List>
            {topkResults.map((item, index) => (
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
    );
};
export default ResultList;
