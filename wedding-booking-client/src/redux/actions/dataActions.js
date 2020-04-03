import {SET_SCREAMS, LOADING_DATA, LIKE_SCREAM, UNLIKE_SCREAM, DELETE_SCREAM,
     LOADING_UI, POST_SCREAM, CLEAR_ERRORS, SET_ERRORS,STOP_LOADING_UI, SET_SCREAM, SUBMIT_COMMENT, EDIT_SCREAM} from '../types';
import axios from 'axios';

//Get all screams
export const getScreams = () => (dispatch) => {
    dispatch({type: LOADING_DATA});
    axios.get('/screams')
    .then(res => {
        dispatch({
            type: SET_SCREAMS,
            payload: res.data
        })
    })
    .catch(err =>{
        dispatch({
            type: SET_SCREAMS,
            payload: []
        })
    })
}

export const getScream = (screamId) => (dispatch) => {
    dispatch({type: LOADING_UI});
    axios.get(`/scream/${screamId}`)
    .then(res => {
        dispatch({
            type: SET_SCREAM,
            payload: res.data
        });
        dispatch({
            type: STOP_LOADING_UI
        });
    })
    .catch(err => console.log(err));
}

//Post a scream
export const postScream = (newScream, photos) => (dispatch) => {
    dispatch({type: LOADING_UI});
    axios.post('/scream', newScream)
    .then(res => {
        dispatch({
            type: POST_SCREAM,
            payload: res.data
        });
        dispatch(clearErrors());
        return res.data;
    })
    .then((res) => {
        console.log(res);
        console.log(photos);
        if (photos[0].length > 0){
            const formData = new FormData();
            photos[0].forEach((photo, index) => {
                formData.append('image' + index, photo, photo.name);
            })
            console.log(formData);
            dispatch(uploadMultipleImages(res.screamId, formData));
        }
    })
    .catch(err => {
        dispatch({
            type: SET_ERRORS,
            payload: err.response.data
        });
    })
}

export const uploadMultipleImages = (screamId, formData) => (dispatch) => {
    console.log(screamId)
    axios.post(`/scream/${screamId}/photos`, formData)
    .then(() => {
        dispatch(getScream(screamId));
    })
    .catch(err => {
        dispatch({
            type: SET_ERRORS,
            payload: err.response.data
        });
    })
}

//Like a scream
export const likeScream = (screamId) => dispatch => {
    axios.get(`/scream/${screamId}/like`)
    .then(res => {
        dispatch({
            type: LIKE_SCREAM,
            payload: res.data
        })
        
    })
    .catch(err => console.log(err))
}


//Unlike a scream
export const unlikeScream = (screamId) => dispatch => {
    axios.get(`/scream/${screamId}/unlike`)
    .then(res => {
        dispatch({
            type: UNLIKE_SCREAM,
            payload: res.data
        })
        
    })
    .catch(err => console.log(err))
}

export const submitComment = (screamId, commentData) => (dispatch) => {
    dispatch({type: LOADING_UI})
    axios.post(`/scream/${screamId}/comment`, commentData)
    .then(res => {
        dispatch({
            type: SUBMIT_COMMENT,
            payload: res.data
        })
        dispatch(clearErrors());
    })
    .catch(err => {
        dispatch({
            type: SET_ERRORS,
            payload: err.response.data
        })
    })
} 

export const editScream = (screamId, screamEdit) => (dispatch) => {
    dispatch({type: LOADING_UI})
    axios.post(`/scream/${screamId}/edit`, screamEdit)
    .then(res => {
        dispatch({
            type: EDIT_SCREAM,
            payload: res.data
        })
        dispatch(clearErrors());
    })
    .catch(err => {
        dispatch({
            type: SET_ERRORS,
            payload: err.response.data
        })
    })
} 

export const deleteScream = (screamId) => (dispatch) => {
    axios.delete(`/scream/${screamId}`)
    .then(() => {
        dispatch({
            type: DELETE_SCREAM,
            payload: screamId
            })
    })
    .catch(err => console.log(err));
}

export const getUserData = (username) => (dispatch) => {
    dispatch({type: LOADING_DATA});
    axios.get(`/user/${username}`)
    .then(res => {
        dispatch({
            type: SET_SCREAMS,
            payload: res.data.screams
        });
    })
    .catch(() => {
        dispatch({
            type: SET_SCREAMS,
            payload: null
        })
    })
}

export const clearErrors = () => (dispatch) => {
    dispatch({type: CLEAR_ERRORS});
}