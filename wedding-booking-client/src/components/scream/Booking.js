import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import Typography  from '@material-ui/core/Typography'
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
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
    },
    bodyText:{
        textAlign: 'justify'
    }
}

class Booking extends Component {

    render() {
        const {booking, classes} = this.props;
        const{screams} = this.props.data;
        let goodBooking = null;
        if (screams.length > 0){
            let index = screams.findIndex((scream) => scream.screamId === booking.screamId);
            let scream = screams[index];
            goodBooking = (<Card className={classes.card}>
                <CardMedia image={scream.userImage} title="Profile Picture" className={classes.image}/>
                <CardContent className={classes.content}>
                    <Typography variant="h5" color="primary">{dayjs(booking.date).format('DD MMMM YYYY')}</Typography>
                    <Typography variant="h6">{scream.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{dayjs(scream.createdAt).fromNow()}</Typography>
                    <Typography className={classes.bodyText} variant="body1">{scream.body}</Typography>
                    <Typography variant="h6">Price: {scream.price} €</Typography>
                    <LikeButton screamId={scream.screamId}/>
                    <span>{scream.likeCount} Likes</span>
                    <MyButton tip="Comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{scream.commentCount} Comments</span>
                </CardContent>
            </Card>);
        }
        return (goodBooking);
    }
}

Booking.propTypes = {
    booking: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

const mapStateToProps = state =>({
    data: state.data
})


export default connect(mapStateToProps)(withStyles(styles)(Booking));
