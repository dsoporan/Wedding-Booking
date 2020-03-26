import React, { Component } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';



//MUI Stuff
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

//redux
import {connect} from 'react-redux';
import {submitComment, getScreams} from '../../redux/actions/dataActions'; 

const styles = {
    button: {
        marginTop: 10,
        marginBottom: 5
    },
    progressSpinner: {
        position: 'absolute'
    },
}

export class CommentForm extends Component {
    state = {
        body: '',
        errors: {},
        submitted: false
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.UI.errors){
            this.setState({errors: nextProps.UI.errors});
        }
        if(!nextProps.UI.errors && !nextProps.UI.loading){
            this.setState({body: ''});
        }
    }

    handleChange = (event) => {
        this.setState({[event.target.name] : event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.submitComment(this.props.screamId, {body: this.state.body});
        // this.props.getScreams();
    }

    render() {
        const {classes, authenticated, UI: {loading}} = this.props;
        const errors = this.state.errors;

        const commentFormMarkup = authenticated ? (
            <Grid item sm={12} style={{textAlign: 'center'}}>
                <form onSubmit={this.handleSubmit}>
                    <TextField name="body" type="text" label="Comment on post" error={errors.comment ? true : false}
                     helperText={errors.comment} value={this.state.body} onChange={this.handleChange} fullWidth className={classes.textField}/>

                    <Button type="submit" variant="contained" color="primary" className={classes.button}>
                        Submit
                        {loading && (
                                 <CircularProgress size={30} className={classes.progressSpinner}/>
                             )}
                    </Button>
                </form>
                <hr className={classes.visibleSeparator}/>
            </Grid>
        ) : null
        return commentFormMarkup;
    }
}

CommentForm.propTypes = {
    submitComment : PropTypes.func.isRequired,
    getScreams : PropTypes.func.isRequired,
    UI: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    screamId: PropTypes.string.isRequired,
    authenticated: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    UI: state.UI,
    authenticated: state.user.authenticated
})

export default connect(mapStateToProps, {submitComment, getScreams})(withStyles(styles)(CommentForm));
