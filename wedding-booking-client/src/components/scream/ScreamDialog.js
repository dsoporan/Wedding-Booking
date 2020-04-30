import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../../util/MyButton';
import dayjs from 'dayjs';
import {Link} from 'react-router-dom';
import Comments from './Comments'
import CommentForm from './CommentForm';

import { Slide } from 'react-slideshow-image';

//MUI stuff
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LikeButton from './LikeButton';
//Icons
import CloseIcon from '@material-ui/icons/Close';
import UnfoldMore from '@material-ui/icons/UnfoldMore';
import ChatIcon from '@material-ui/icons/Chat';

//redux
import {connect} from 'react-redux';
import {getScream, clearErrors, getScreams, getUserData} from '../../redux/actions/dataActions';

const styles = {
    invisibleSeparator: {
        border: 'none',
        margin: 10
    },
    profileImage: {
        maxWidth: 200,
        height: 200,
        borderRadius: '50%',
        objectFit: 'cover'
    },
    dialogContent: {
        padding: 20
    },
    closeButton: {
        position: 'absolute',
        left : '90%'
    },
    expandButton: {
        position: 'absolute',
        left: '90%'
    },
    spinnerDiv: {
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    visibleSeparator: {
        width: '100%',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        marginBottom: 20
    },
    slide: {
        objectFit: 'cover',
        width: '100%',
        height: '300px'
    },
    photosPost: {
        minWidth: '100%',
        height: 300,
        objectFit: 'cover'
    },
    bodyText:{
        textAlign: 'justify'
    }
}

class ScreamDialog extends Component{
    state = {
        open: false,
        oldPath: '',
        newPath: ''
    };

    componentDidMount(){
        if(this.props.openDialog){
            this.handleOpen();
        }
    }

    handleOpen = () => {
        let oldPath = window.location.pathname;

        const {username, screamId} = this.props;
        let newPath = `/users/${username}/scream/${screamId}`;

        if(oldPath === newPath){
            oldPath = `/users/${username}`;
        }
        window.history.pushState(null, null, newPath);

        this.setState({open:true, oldPath, newPath});
        this.props.getScream(this.props.screamId);
    }

    handleClose = () => {
        this.setState({open:false});   
        window.history.pushState(null, null, this.state.oldPath);
        if (this.state.oldPath === '/')
            this.props.getScreams();
        this.props.clearErrors();
    }

    render(){
        
        const properties = {
            duration: 5000,
            transitionDuration: 500,
            infinite: true,
            indicators: true,
            arrows: true,
            pauseOnHover: true,
        }
        const {classes, scream : {photos, name, category, price, screamId, body, createdAt, likeCount, commentCount, userImage, username, comments},
         UI: {loading}} = this.props;

         const dialogMarkup = loading ? (
             <div className={classes.spinnerDiv}>
                <CircularProgress size={150} thickness={2}/>
             </div>
         ) : (
             <Grid container spacing={4}>
                 <Grid item sm={5}>
                     <img src={userImage} alt="Profile" className={classes.profileImage}/>
                 </Grid>
                 <Grid item sm={7}>
                    <Typography component={Link} color="primary" variant="h5" to={`/users/${username}`}>
                        {username}
                    </Typography>
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {dayjs(createdAt).format('h:mm a, MMMM DD YYYY')}
                    </Typography>
                    <hr className={classes.invisibleSeparator}/>
                    <Typography className={classes.bodyText} variant="body1">
                        {body}
                    </Typography>
                    <Typography variant="body1">Category: {category}</Typography>
                    <Typography variant="h6">Price: {price} €</Typography>
                    <LikeButton screamId={screamId}/>
                    <span>{likeCount} Likes</span>
                    <MyButton tip="Comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{commentCount} Comments</span>
                 </Grid>
                 {photos && (
                     <Slide className={classes.slide} {...properties}>
                         {photos.map((photo) => {return(
                            <div key={photo} className="each-slide">
                                <img className={classes.photosPost} src={photo} alt="Presentation"/>
                            </div>
                         )})}
                    </Slide>
                 )}
                 <hr className={classes.visibleSeparator}/>
                 <CommentForm screamId={screamId}/>
                 <Comments comments={comments}/>
             </Grid>
         )

         return (
             <Fragment>
                 <MyButton onClick={this.handleOpen} tip="Expand Post" tipClassName={classes.expandButton}>
                     <UnfoldMore color="primary"/>
                 </MyButton>
                 <Dialog open={this.state.open} onClose={this.handleClose} fullWidth maxWidth="sm">
                    <MyButton tip="Close" onClick={this.handleClose} tipClassName={classes.closeButton}>
                        <CloseIcon/>
                    </MyButton>
                    <DialogContent className={classes.dialogContent}>
                        {dialogMarkup}
                    </DialogContent>
                 </Dialog>
             </Fragment>
         )
    }
}

ScreamDialog.propTypes = {
    clearErrors: PropTypes.func.isRequired,
    getScream: PropTypes.func.isRequired,
    getScreams: PropTypes.func.isRequired,
    getUserData: PropTypes.func.isRequired,
    screamId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    scream: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    scream: state.data.scream,
    UI: state.UI
});

const mapActionsToProps = {
    getScreams,
    getScream,
    clearErrors,
    getUserData,
};

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(ScreamDialog));