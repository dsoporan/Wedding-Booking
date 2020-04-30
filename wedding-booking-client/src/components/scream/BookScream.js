import React, { Component, Fragment } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';


//Mui Stuff
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';

import {connect} from 'react-redux';
import {bookScream} from '../../redux/actions/dataActions';

const styles = {
    bookButton: {
        marginLeft: 20,
        minWidth: 92,
    },
}

class BookScream extends Component {

    state = {
        open: false
    };

    handleOpen = () => {
        this.setState({open: true})
    }
    
    handleClose = () => {
        this.setState({open: false})
    }

    bookScreamOpen = () => {
        const {user, date, screamId} = this.props;
        const dateTransformed = (new Date(date)).toISOString();
        this.props.bookScream(screamId, {
            username: user.credentials.username,
            date: dateTransformed
            });
        this.setState({open: false});
    }

    render() {

        const {classes, date, price} = this.props;
        return (
            <Fragment>
                <Button variant="contained" color="primary" onClick={this.handleOpen} className={classes.bookButton}> 
                BOOK IT
                </Button>
                <Dialog open={this.state.open} onClose={this.handleClose} fullWidth maxWidth="sm">
                    <DialogTitle>
                        Are you sure you want to book this service in {dayjs(new Date(date)).format('DD MMMM YYYY')} for {price}€?
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.bookScreamOpen} color="primary">
                            Book
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        )
    }
}

BookScream.propTypes = {
    bookScream: PropTypes.func.isRequired,
    screamId: PropTypes.string.isRequired,
    date: PropTypes.string,
    price: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
}

const mapStateToProps = state =>({
    user: state.user
})

export default connect(mapStateToProps, {bookScream})(withStyles(styles)(BookScream));