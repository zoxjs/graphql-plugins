import {Post} from './Post';


export const posts: Array<Post> = [
    {
        id: 1,
        user: 1,
        text: 'My first post',
        date: new Date(2018, 5, 6),
    },
    {
        id: 2,
        user: 1,
        text: 'My second post',
        date: new Date(2017, 4, 5),
    },
    {
        id: 3,
        user: 2,
        text: 'His first post post',
        date: new Date(2019, 6, 7),
    },
];
