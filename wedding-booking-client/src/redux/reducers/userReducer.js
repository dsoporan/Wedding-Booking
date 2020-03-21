import {SET_AUTHENTICATED, SET_UNAUTHENTICATED, SET_USER, LOADING_USER, LIKE_SCREAM, UNLIKE_SCREAM, MARK_NOTIFICATIONS_READ} from '../types';

const initialState = {
    authenticated: false,
    loading: false,
    credentials: {},
    likes: [],
    notifications: []
};

export default function(state = initialState, action){
    switch(action.type){
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: true
            };
        case SET_UNAUTHENTICATED:
            return initialState;
        case SET_USER:
            return {
                authenticated: true,
                loading: false,
                ...action.payload
            };
        case LOADING_USER:
            return {
                ...state,
                loading: true
            }
        case LIKE_SCREAM:
            return {
                ...state,
                likes: [
                    ...state.likes,
                    {
                        username: state.credentials.username,
                        screamId: action.payload.screamId
                    }
                ]
            }
        case UNLIKE_SCREAM:
            return {
                ...state,
                likes: state.likes.filter(like => like.screamId !== action.payload.screamId)
            }
        case MARK_NOTIFICATIONS_READ:
            state.notifications.forEach(notification => notification.read = true);
            return {
                ...state
            }
        default:
            return state;
    }
}