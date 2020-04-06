import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../../util/MyButton';
import TextField from '@material-ui/core/TextField';

//MUI stuff
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import Button from '@material-ui/core/Button';

//Icons
import CloseIcon from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';

//redux
import {connect} from 'react-redux';
import {getScream, editScream, clearErrors} from '../../redux/actions/dataActions';

const styles = {
    closeButton: {
        position: 'absolute',
        left : '90%'
    },
    editButton: {
        position: 'absolute',
        left: '84%',
        top: '10%',
    },
    dialogContent: {
        padding: 20
    },
    spinnerDiv: {
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    divText: {
        marginTop: '10px',
    },
    invisibleSeparator: {
        border: 'none',
        margin: 10
    },
}

class EditScream extends Component {

    state = {
        open: false,
        oldPath: '',
        newPath: '',
        name: '',
        body: '',
        price: '',
        busyDates: [],
        errors: {}
    };

    componentDidMount(){
        if(this.props.openDialog){
            this.handleOpen();
        }
    }

    componentWillReceiveProps(){
        const {scream : {name, body, price, busyDates}} = this.props;
        this.setState({
            name: name,
            body: body, 
            price: price, 
            busyDates: busyDates});

    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.editScream(this.props.screamId, {
            name: this.state.name,
            body: this.state.body,
            price: this.state.price,
            busyDates: this.state.busyDates,
        });
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
        window.history.pushState(null, null, this.state.oldPath);
        this.setState({open:false});
        this.props.clearErrors();
    }

    handleDayClick = (day, { selected }) => {
        const { busyDates } = this.state;
        if (selected) {
          const selectedIndex = busyDates.findIndex(selectedDay =>
            Date.parse(selectedDay) === Date.parse(day)
          );
          busyDates.splice(selectedIndex, 1);
        } else {
          busyDates.push(day);
        }
        this.setState({ busyDates });
      }


    render() {
        const {errors} = this.state;
        const {classes, UI: {loading}} = this.props;
        let transformDate = [];
        if (this.state.busyDates){
            this.state.busyDates.forEach(date => {
                transformDate.push(new Date(date));   
            })
        }

         const dialogMarkup = loading ? (
             <div className={classes.spinnerDiv}>
                <CircularProgress size={150} thickness={2}/>
             </div>
         ) : (
            <form onSubmit={this.handleSubmit}>
                <TextField name="name" type="text" label="Edit Name" placeholder="Edit Name" value={this.state.name} error={errors.name ? true : false}
                helperText={errors.name} className={classes.textField} onChange={this.handleChange} fullWidth/>
                <hr className={classes.invisibleSeparator}/>
                <TextField name="body" type="text" label="Edit Body" multiline rows="3" placeholder="Edit Body" value={this.state.body} error={errors.body ? true : false}
                helperText={errors.body} className={classes.textField} onChange={this.handleChange} fullWidth/>
                <hr className={classes.invisibleSeparator}/>
                <TextField name="price" type="text" label="Edit Price" placeholder="€" value={this.state.price} error={errors.price ? true : false}
                helperText={errors.price} className={classes.textField} onChange={this.handleChange}/>
                <hr className={classes.invisibleSeparator}/>
                <div className={classes.divText}>
                    <span>Choose the dates that you are not available:</span>
                </div>
                <hr className={classes.invisibleSeparator}/>
                <DayPicker className={classes.dayPicker} disabledDays={{ before: new Date() }} selectedDays={transformDate} onDayClick={this.handleDayClick}/>
                <hr className={classes.invisibleSeparator}/>
                <Button type="submit" variant="contained" color="primary" className={classes.submitButton} disabled={loading}>
                Submit
                {loading && (
                    <CircularProgress size={30} className={classes.progressSpinner}/>
                )}
                </Button>
            </form>
         )


         return (
            <Fragment>
                 <MyButton onClick={this.handleOpen} tip="Edit Post" tipClassName={classes.editButton}>
                     <Edit color="primary"/>
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

EditScream.propTypes = {
    clearErrors: PropTypes.func.isRequired,
    getScream: PropTypes.func.isRequired,
    editScream: PropTypes.func.isRequired,
    screamId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    scream: PropTypes.object.isRequired
}



const mapStateToProps = (state) => ({
    scream: state.data.scream,
    UI: state.UI
});

const mapActionsToProps = {
    getScream,
    editScream,
    clearErrors,
};

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(EditScream));
