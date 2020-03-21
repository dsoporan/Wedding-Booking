import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import AppIcon from '../images/logo-mare.png';
import {Link} from 'react-router-dom' ;

//Mui imports
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
// import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
//Redux
import {connect} from 'react-redux';
import {signupUser} from '../redux/actions/userActions';

const styles = {
    form: {
        textAlign: 'center'
      },
      image: {
          margin: '20px auto 20px auto',
          maxWidth: '200px',
          maxHeight: '200px'
      },
      textField: {
          margin: '10px auto 10px auto',
      },
      button: {
          marginTop: 20,
          position: 'relative'
      },
      customError: {
          color: 'red',
          fontSize: "0.8rem",
          marginTop: 10,
      },
      progress: {
          position: "absolute",
      }
};

class signup extends Component {
    constructor(){
        super();
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            errors: {} 
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.UI.errors){
            this.setState({errors: nextProps.UI.errors});
        }
    }

    handleSubmit = (event) => {
       event.preventDefault();
       this.setState({
           loading: true
       })
       const newUserData = {
           email: this.state.email,
           password: this.state.password,
           confirmPassword: this.state.confirmPassword,
           username: this.state.username
       }
       this.props.signupUser(newUserData, this.props.history);
    }

    handleChange= (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        const {classes, UI : {loading}} = this.props;
        const {errors} = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm/>
                <Grid item sm>
                    <img src={AppIcon} alt="logo" className={classes.image}/>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField id='email' name='email' type='email' label='Email' className={classes.textField}
                           helperText={errors.email} error={errors.email ? true : false}  value={this.state.email} onChange={this.handleChange} fullWidth/>
                        <TextField id='password' name='password' type='password' label='Password' className={classes.textField}
                            helperText={errors.password} error={errors.password ? true : false}  value={this.state.password} onChange={this.handleChange} fullWidth/>
                        <TextField id='confirmPassword' name='confirmPassword' type='password' label='Confirm Password' className={classes.textField}
                            helperText={errors.confirmPassword} error={errors.confirmPassword ? true : false}  value={this.state.confirmPassword} onChange={this.handleChange} fullWidth/>
                        <TextField id='username' name='username' type='text' label='Username' className={classes.textField}
                            helperText={errors.username} error={errors.username ? true : false}  value={this.state.username} onChange={this.handleChange} fullWidth/>
                        
                        {errors.general && (
                            <Typography variant='body2' className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )}
                        <Button type="submit" variant='contained' color="primary" className={classes.button}
                        disabled={loading}>
                        Signup
                        {loading && (
                            <CircularProgress size={30} className={classes.progress}/>
                        )} 
                        </Button>
                        <br/><br/>
                        <small>Already have an account ? Login <Link to="/login">here</Link></small>
                    </form>
                </Grid>
                <Grid item sm/>
            </Grid>
        )
  }
}

signup.propTypes = {
    classes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    UI:  PropTypes.object.isRequired,
    signupUser:  PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
})

export default connect(mapStateToProps, {signupUser})(withStyles(styles)(signup));