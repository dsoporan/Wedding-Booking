import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../../util/MyButton';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import ImageUploader from 'react-images-upload';

//Select
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


//Redux
import {connect} from 'react-redux';
import {postScream, clearErrors} from '../../redux/actions/dataActions';

const styles = {
    textField: {
        margin: '10px auto 10px auto',
    },
    formControl: {
        margin: '10px 20px 10px auto',
        minWidth: 120,

    },
    submitButton: {
        position: 'relative',
        float: 'right',
        marginTop: 10,
        marginBottom: 10,
    },
    progressSpinner: {
        position: 'absolute'
    },
    closeButton: {
        position: 'absolute',
        left: '91%',
        top: '3%'
    },
    divText: {
        marginTop: '10px',
    },
    dayPicker: {
        display: 'flow-root'
    }
}

class PostScream extends Component{
    state = {
        open: false,
        name: '',
        body: '',
        category: 'Others',
        price: '',
        busyDates: [],
        photos: [],
        errors: {}
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.UI.errors){
            this.setState({
                errors: nextProps.UI.errors
            });
        }
        if(!nextProps.UI.errors && !nextProps.UI.loading){
            this.setState({ name: '',
            body: '',
            category: 'Others',
            price: '',
            busyDates: [],
            photos: [], 
            open:false, 
            errors: {}});
        }
    }

    handleOpen = () => {
        this.setState({open:true});
    }
    handleClose = () => {
        this.props.clearErrors();
        this.setState({open:false, errors: {}});
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.postScream({
            name: this.state.name,
            body: this.state.body,
            category: this.state.category,
            price: this.state.price,
            busyDates: this.state.busyDates,
        }, this.state.photos);
        
    }

    handleDayClick = (day, { selected }) => {
        const { busyDates } = this.state;
        if (selected) {
          const selectedIndex = busyDates.findIndex(selectedDay =>
            DateUtils.isSameDay(selectedDay, day)
          );
          busyDates.splice(selectedIndex, 1);
        } else {
          busyDates.push(day);
        }
        console.log(busyDates);
        this.setState({ busyDates });
      }
    onDrop = (picture) => {
        const {photos} = this.state;
        photos.push(picture);
        this.setState({photos});
    }

    render(){
        const {errors} = this.state;
        const {classes, UI: {loading}} = this.props;
        return (
            <Fragment>
                <MyButton onClick={this.handleOpen} tip="New Post">
                    <AddIcon/>
                </MyButton>
                <Dialog open={this.state.open} onClose={this.handleClose} fullWidth maxWidth="sm">
                    <MyButton tip="Close" onClick={this.handleClose} tipClassName={classes.closeButton}>
                        <CloseIcon/>
                    </MyButton>
                    <DialogTitle>
                        New post
                    </DialogTitle>
                    <DialogContent>
                        <form onSubmit={this.handleSubmit}>
                            <TextField name="name" type="text" label="Add a name" placeholder="Post Name" error={errors.name ? true : false}
                            helperText={errors.name} className={classes.textField} onChange={this.handleChange} fullWidth/>
                            <TextField name="body" type="text" label="Add a post" multiline rows="3" placeholder="New Post" error={errors.body ? true : false}
                            helperText={errors.body} className={classes.textField} onChange={this.handleChange} fullWidth/>
                            <FormControl name="category" className={classes.formControl}>
                                <InputLabel>Category</InputLabel>
                                <Select name="category" value={this.state.category} onChange={this.handleChange}>
                                    <MenuItem value={'EventHall'}>Location / EventHall</MenuItem>
                                    <MenuItem value={'Music'}>Music</MenuItem>
                                    <MenuItem value={'Entertainment'}>Entertainment</MenuItem>
                                    <MenuItem value={'Others'}>Others</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField name="price" type="text" label="Price" placeholder="€" error={errors.price ? true : false}
                            helperText={errors.price} className={classes.textField} onChange={this.handleChange}/>
                            <br/>
                            <div className={classes.divText}>
                            <span>Choose the dates that you are not available:</span>
                            </div>
                            <br/>
                            <DayPicker className={classes.dayPicker} disabledDays={{ before: new Date() }} selectedDays={this.state.busyDates} onDayClick={this.handleDayClick}/>
                            <br/>
                            <ImageUploader withPreview={true} withIcon={true} buttonText='Choose images' onChange={this.onDrop} label="Upload maximum 5 images" imgExtension={['.jpg', '.png']} maxFileSize={5242880}/>
                         <Button type="submit" variant="contained" color="primary" className={classes.submitButton} disabled={loading}>
                             Submit
                             {loading && (
                                 <CircularProgress size={30} className={classes.progressSpinner}/>
                             )}
                         </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </Fragment>

        )
    }
}

PostScream.propTypes = {
    postScream: PropTypes.func.isRequired,
    UI:PropTypes.object.isRequired,
    clearErrors: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    UI: state.UI
})

export default connect(mapStateToProps, {postScream, clearErrors})(withStyles(styles)(PostScream));