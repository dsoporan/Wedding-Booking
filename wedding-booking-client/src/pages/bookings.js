import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import Profile from '../components/profile/Profile';
import PropTypes from 'prop-types';
import ScreamSkeleton from '../util/ScreamSkeleton';
import Booking from '../components/scream/Booking';

import {connect} from 'react-redux';


class bookings extends Component {

    render() {
        const {bookings, loading} = this.props.user;
        let recentBookingsMarkup = !loading ? (bookings && bookings.length !== 0 ? (
        bookings.map(booking => <Booking key={booking.createdAt} booking={booking}/>)) : (<h2>No Bookings Yet!</h2>)
        ) : <ScreamSkeleton/>
        return (
            <div>      
                <Grid container spacing={4}>
                    <Grid item sm={8} xs={12}>
                        {recentBookingsMarkup}
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <Profile/>
                    </Grid>
                </Grid>
            </div>
        )
  }
}

bookings.propTypes = {
    user: PropTypes.object.isRequired
}

const mapToStateProps = state => ({
    user: state.user,
})

export default connect(mapToStateProps)(bookings);