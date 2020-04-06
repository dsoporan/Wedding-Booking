import React, { Component, Fragment } from "react";
import {Link} from "react-router-dom";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import PostScream from '../scream/PostScream';
import Notifications from './Notifications';
// import LogoImage from '../../images/logo-mare.png';


//Material Design
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';

//Icons
import HomeIcon from '@material-ui/icons/Home';

export class Navbar extends Component {
  render() {

    const {authenticated, userType} = this.props; 

    return (
      <AppBar>
        <Toolbar className="nav-container">
          
          {authenticated ? (
              <Fragment>
                {userType && userType === 'Service Provider' ? (<PostScream/>) : null}
                <Link to='/bookings'>
                  <MyButton tip="Bookings">
                    <PlaylistAddCheckIcon/>
                  </MyButton>
                </Link>
                <Link to="/">
                <MyButton tip="Home">
                    <HomeIcon/>
                </MyButton>
                </Link>
                <Notifications/>
              </Fragment>
          ) : (
            <Fragment>
              <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                  Signup
                </Button>
            </Fragment>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

Navbar.propTypes = {
    authenticated : PropTypes.bool.isRequired,
    userType : PropTypes.string
}

const mapStateToProps = state => ({
  authenticated: state.user.authenticated,
  userType: state.user.credentials.userType
})

export default connect(mapStateToProps)(Navbar);
