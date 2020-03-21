import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Typography  from '@material-ui/core/Typography'
import {Link} from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import DeleteScream from './DeleteScream';
import ScreamDialog from './ScreamDialog';
import LikeButton from './LikeButton';
import {connect} from 'react-redux';


//Icons
import ChatIcon from '@material-ui/icons/Chat'; 


//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const styles = {
    card: {
        position: 'relative',
        display: 'flex',
        marginBottom: 20,
    },
    image: {
        minWidth: 200,
    },
    content: {
        padding: 25,
        objectFit: 'cover'
    }
}

class Scream extends Component {
    
    
    render() {
        dayjs.extend(relativeTime);
        const {classes, scream : {body, createdAt, userImage, username, screamId, likeCount, commentCount},
        user: {authenticated, credentials}} = this.props;
        
        const deleteButton = authenticated && username === credentials.username ? (
            <DeleteScream screamId={screamId}/>
        ) : null
        return (
            <Card className={classes.card}>
                <CardMedia image={userImage} title="Profile Picture" className={classes.image}/>
                <CardContent className={classes.content}>
                    <Typography variant="h5" component={Link} to={`/users/${username}`} color="primary">{username}</Typography>
                    {deleteButton}
                    <Typography variant="body2" color="textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography variant="body1">{body}</Typography>
                    <LikeButton screamId={screamId}/>
                    <span>{likeCount} Likes</span>
                    <MyButton tip="Comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{commentCount} Comments</span>
                    <ScreamDialog screamId={screamId} username={username} openDialog={this.props.openDialog}/>
                </CardContent>
            </Card>
        )
    }
}

Scream.propTypes = {
    user: PropTypes.object.isRequired,
    scream: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    openDialog: PropTypes.bool
}

const mapStateToProps = state =>({
    user: state.user
})


export default connect(mapStateToProps)(withStyles(styles)(Scream));
