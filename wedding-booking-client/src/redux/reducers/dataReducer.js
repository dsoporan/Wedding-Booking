import {SET_PACKAGE, SET_SCREAMS, LIKE_SCREAM, UNLIKE_SCREAM, LOADING_DATA, DELETE_SCREAM, POST_SCREAM, SET_SCREAM, SUBMIT_COMMENT, EDIT_SCREAM, BOOK_SCREAM} from '../types';

const initialState = {
    screams: [],
    scream: {},
    package: [],
    loading: false
}

export default function(state = initialState, action){
    switch(action.type){
        case LOADING_DATA:
            return {
                ...state,
                loading:true
            }
        case SET_SCREAMS:
            return{
                ...state,
                screams: action.payload,
                loading: false
            }
        case SET_SCREAM:
            return{
                ...state,
                scream: action.payload
            }
        case LIKE_SCREAM:
        case UNLIKE_SCREAM:
            let index = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
            state.screams[index] = action.payload;
            if(state.scream.screamId === action.payload.screamId){
                let commentsAll = state.scream.comments;
                state.scream = action.payload;
                state.scream.comments = commentsAll;
            }
            return {
                ...state
            }
        case DELETE_SCREAM:
            let indexDel = state.screams.findIndex((scream) => scream.screamId === action.payload);
            state.screams.splice(indexDel, 1);
            return {
                ...state,
            }
        case EDIT_SCREAM:
            let indexEdit = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
            if(state.scream.screamId === action.payload.screamId){
                state.scream.body = action.payload.body;
                state.scream.name = action.payload.name;
                state.scream.price = action.payload.price;
                state.scream.busyDates = action.payload.busyDates;
            }
            state.screams[indexEdit] = state.scream;
            return {
                ...state
            }
        case BOOK_SCREAM:
            let indexBook = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
            state.screams[indexBook].busyDates.push(action.payload.date);
            return {
                ...state
            }
        case POST_SCREAM:
            return {
                ...state,
                screams: [
                    action.payload,
                    ...state.screams
                ]
            }
        case SUBMIT_COMMENT:
            let indexComm = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
            state.screams[indexComm].commentCount = action.payload.commentCount;
            state.scream.commentCount = action.payload.commentCount;
            return {
                ...state,
                screams: state.screams,
                scream: {
                    ...state.scream,
                    comments: [
                        action.payload,
                        ...state.scream.comments
                    ]
                }
            }
        case SET_PACKAGE:
            return {
                ...state,
                package: action.payload,
                loading: false
            }
        default:
            return state;
    }
}