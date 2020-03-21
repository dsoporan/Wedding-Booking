import React from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import NoImg from '../images/no-img.jpg';

//Mui
import Paper from '@material-ui/core/Paper';

//Icons
// import LocationOn from '@material-ui/icons/LocationOn';
// import LinkIcon from '@material-ui/icons/Link';
// import CalendarToday from '@material-ui/icons/CalendarToday';

const styles = {
    paper: {
        padding: 20
      },
    profile: {
        '& .image-wrapper': {
          textAlign: 'center',
          position: 'relative',
          '& button': {
            position: 'absolute',
            top: '80%',
            left: '70%'
          }
        },
        '& .profile-image': {
          width: 200,
          height: 200,
          objectFit: 'cover',
          maxWidth: '100%',
          borderRadius: '50%'
        },
        '& .profile-details': {
          textAlign: 'center',
          '& span, svg': {
            verticalAlign: 'middle'
          },
          '& a': {
            color: '#00bcd4'
          }
        },
        '& hr': {
          border: 'none',
          margin: '0 0 10px 0'
        },
        '& svg.button': {
          '&:hover': {
            cursor: 'pointer'
          }
        }
      },
    buttons: {
        textAlign: 'center',
        '& a': {
          margin: '20px 10px'
        }
      },
    username: {
        height: 20,
        backgroundColor: "#00bcd4",
        width: 60,
        margin: '0 auto 7px auto'
    },
    fullLine: {
        height: 15,
        backgroundColor: 'rgba(0,0,0, 0.6)',
        width: '100%',
        marginBottom: 10
    },
    halfLine: {
        height: 15,
        backgroundColor: 'rgba(0,0,0, 0.6)',
        width: '50%',
        marginBottom: 10
    },
    halfWrapper: {
        width: '150px',
        margin: 'auto'
    }
    
}

const ProfileSkeleton = (props) => {
    const {classes} = props;
    return (
        <Paper className={classes.paper}>
            <div className={classes.profile}>
                <div className="image-wrapper">
                    <img src={NoImg} alt="Profile" className="profile-image" />
                </div>
                <hr/>
                <div className="profile-details">
                    <div className={classes.username}/>
                    <hr/>
                    <div className={classes.fullLine}/>
                    <div className={classes.fullLine}/>
                    <hr/>
                    <div className={classes.halfWrapper}>
                    <div className={classes.fullLine}/>
                    {/* <LocationOn color="primary"/>
                    <span>Location</span> */}
                    <hr/>
                    <div className={classes.fullLine}/>
                    {/* <LinkIcon color="primary"/> https://website.com */}
                    <hr/>
                    <div className={classes.fullLine}/>
                    {/* <CalendarToday color="primary"/> Joined date */}
                    </div>
                </div>
            </div>
        </Paper>

    )
}

ProfileSkeleton.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ProfileSkeleton)
