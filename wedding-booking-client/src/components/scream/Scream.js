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
import EditScream from './EditScream';
import LikeButton from './LikeButton';
import {connect} from 'react-redux';


//Icons
import ChatIcon from '@material-ui/icons/Chat'; 


//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import BookScream from './BookScream';

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
    },
    bodyText:{
        textAlign: 'justify'
    }
}

class Scream extends Component {

    checkDateIsNotBusy = (busyDates, date) => {
        let onlyDate = dayjs(date).format('YYYY-MM-DD');
        let isBusy = false;
        busyDates.forEach((dateB) => {
            let onlyDateB = dateB.split('T');

            if (onlyDate === onlyDateB[0]){
                isBusy = true;
            }
        })
        return isBusy;
    }

    render() {
        dayjs.extend(relativeTime);
        const {classes, dateTag, priceTag, categoryTag, scream : {name, price, category, busyDates, body, createdAt, userImage, username, screamId, likeCount, commentCount},
        user: {authenticated, credentials}} = this.props;
        let priceTagNo = parseInt(priceTag, 10);
        let priceNo = parseInt(price, 10);
        
        const deleteButton = authenticated && username === credentials.username ? (
            <DeleteScream screamId={screamId}/>
        ) : null

        const editButton = authenticated && username === credentials.username ? (
            <EditScream screamId={screamId} username={username} openDialog={this.props.openDialog}/>
        ) : null

        const goodScream = (((categoryTag === 'All' || categoryTag === category) && (dateTag.getTime() <= (new Date()).getTime() || (!this.checkDateIsNotBusy(busyDates, dateTag))) && (priceTag === '' || priceTagNo > priceNo)) || (!dateTag && !priceTag && !categoryTag)) ?
        (<Card className={classes.card}>
            <CardMedia image={userImage} title="Profile Picture" className={classes.image}/>
            <CardContent className={classes.content}>
                <Typography variant="h5" component={Link} to={`/users/${username}`} color="primary">{username}</Typography>
                <Typography variant="h6">{name}</Typography>
                {editButton}
                {deleteButton}
                <Typography variant="body2" color="textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                <Typography className={classes.bodyText} variant="body1">{body}</Typography>
                <Typography variant="h6">Price: {price} €</Typography>
                <LikeButton screamId={screamId}/>
                <span>{likeCount} Likes</span>
                <MyButton tip="Comments">
                    <ChatIcon color="primary"/>
                </MyButton>
                <span>{commentCount} Comments</span>
                {credentials.userType === 'Married To Be' ? (<BookScream screamId={screamId} date={dateTag && dateTag.toString()} price={price}/>) : null}
                <ScreamDialog screamId={screamId} username={username} openDialog={this.props.openDialog}/>
            </CardContent>
        </Card>) : null
            
        return (
            goodScream
        )
    }
}

Scream.propTypes = {
    user: PropTypes.object.isRequired,
    scream: PropTypes.object.isRequired,
    dateTag: PropTypes.object,
    priceTag: PropTypes.string,
    categoryTag: PropTypes.string,
    classes: PropTypes.object.isRequired,
    openDialog: PropTypes.bool
}

const mapStateToProps = state =>({
    user: state.user
})


export default connect(mapStateToProps)(withStyles(styles)(Scream));
