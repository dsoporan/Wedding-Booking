import React, { Component, Fragment } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import MyButton from '../../util/MyButton';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import {Link} from 'react-router-dom';
import BookScream from './BookScream';
import LikeButton from './LikeButton';




//Mui Stuff
import Button from '@material-ui/core/Button';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography  from '@material-ui/core/Typography'
import ChatIcon from '@material-ui/icons/Chat'; 



//select
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';


//MUI Pickers
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';


import {connect} from 'react-redux';
// import {bookScream} from '../../redux/actions/dataActions';

const styles = {
    progress: {
        position: "absolute",
    },
    suggestButton: {
        marginTop: '5px',
    },
    dialogContent: {
        padding: 20
    },
    closeButton: {
        position: 'absolute',
        left : '92%'
    },
    formControlSuggestion: {
        marginTop: 20
    },
    submitButton: {
        marginTop: 135
    },
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

class SuggestScreamDialog extends Component {

    state = {
        category: 'EventHall',
        loading: false,
        open: false,
        date: new Date(),
        price: '',
        location: false,
        music: false,
        photo: false,
        entertainment: false,
        others: false,
        suggestionType: 'suggested',
        screams: []
    };

    handleCheckedChange = (event) => {
        this.setState({[event.target.name]: event.target.checked});
        this.setState({screams: []});
    }

    handleOpen = () => {
        this.setState({open: true})
        this.setState({screams: []});
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
        this.setState({screams: []});
    }

    noneSelected = () => {
        this.setState({
            location: false,
            music: false,
            photo: false,
            entertainment: false,
            others: false,
        })
    }

    handleCategoryChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
        this.noneSelected();
        if (event.target.value === 'EventHall')
            this.setState({location: true});
        else if (event.target.value === 'Music')
            this.setState({music: true});
        else if (event.target.value === 'Photo & Video')
            this.setState({photo: true});
        else if (event.target.value === 'Entertainment')
            this.setState({entertainment: true});
        else if (event.target.value === 'Others')
            this.setState({others: true});  
    }

    handleDateChange = (date) => {
        this.setState({date: date.toISOString()});
        this.setState({screams: []});
    }
    
    handleClose = () => {
        this.setState({
            open: false,
            catgeory: 'EventHall',
            date: new Date(),
            price: '',
            location: false,
            music: false,
            photo: false,
            entertainment: false,
            others: false,
            suggestionType: 'suggested',
            screams: []})
    }

    

    handleSubmit = () => {
        this.setState({loading: true, screams: []});
        let criterias = {
            date: this.state.date,
            price: this.state.price,
            location: this.state.location,
            music: this.state.music,
            photo: this.state.photo,
            entertainment: this.state.entertainment,
            others: this.state.others,
            suggestionType: this.state.suggestionType
        }
        axios.post(`/screams/suggest`, criterias)
        .then(res => {
            this.setState({screams: res.data});
        })
        .catch(err => {
            console.error(err);
        })
        this.setState({loading: false});
    }

    render() {

        const {classes, UI: {loading}, user: {credentials}} = this.props;
        const error = [this.state.location, this.state.music, this.state.photo, this.state.entertainment, this.state.others].filter((v) => v).length < 1;
        const buttonSubmit = error ? (<Button variant="contained" disabled className={classes.submitButton}>
        Show me
      </Button>) : (<Button variant="contained" color="primary" onClick={this.handleSubmit} className={classes.submitButton} disabled={this.state.loading}>
            Show me
            {this.state.loading && (
                <CircularProgress size={30} className={classes.progress}/>
            )} 
        </Button>);
        const screamMarkup = this.state.screams.length > 0 ?(this.state.screams.map(scream => (
            <Card key={scream.screamId} className={classes.card}>
                <CardMedia image={scream.userImage} title="Profile Picture" className={classes.image}/>
                <CardContent className={classes.content}>
                    <Typography variant="h5" component={Link} to={`/users/${scream.username}`} color="primary">{scream.username}</Typography>
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
                    {credentials.userType === 'Married To Be' ? (<BookScream screamId={scream.screamId} date={this.state.date.toString()} price={scream.price}/>) : null}
                </CardContent>
            </Card>
            ))) : (<p>No available services</p>);

        const dialogMarkup = loading ? (
            <div className={classes.spinnerDiv}>
               <CircularProgress size={150} thickness={2}/>
            </div>
        ) : (
            <Grid container spacing={2}>
               <Grid item xs={4}>
                    <MuiPickersUtilsProvider name="date" utils={DateFnsUtils}>
                        <KeyboardDatePicker 
                        disablePast
                        name="date"
                        margin="normal"
                        format="MM/dd/yyyy"
                        value={this.state.date}
                        onChange={this.handleDateChange}
                        />
                    </MuiPickersUtilsProvider>
                    {buttonSubmit}
                    </Grid>
                    <Grid item xs={4}>
                        <TextField variant="outlined" name="price" type="text" label="Add a price" placeholder="Maximum Price" onChange={this.handleChange}/>

                        <FormControl name="suggestionType" className={classes.formControlSuggestion} fullWidth>
                                <InputLabel>Suggestion Type</InputLabel>
                                <Select name="suggestionType" value={this.state.suggestionType} onChange={this.handleChange}>
                                    <MenuItem value={'low'}>Lowest Price</MenuItem>
                                    <MenuItem value={'suggested'}>Suggested</MenuItem>
                                    <MenuItem value={'high'}>Higher Price</MenuItem>
                                </Select>
                            </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl name="category" className={classes.formControl}>
                        <InputLabel>Category</InputLabel>
                        <Select name="category" value={this.state.category} onChange={this.handleCategoryChange}>
                            <MenuItem value={'EventHall'}>Location / EventHall</MenuItem>
                            <MenuItem value={'Music'}>Music</MenuItem>
                            <MenuItem value={'Photo & Video'}>Photo & Video</MenuItem>
                            <MenuItem value={'Entertainment'}>Entertainment</MenuItem>
                            <MenuItem value={'Others'}>Others</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {screamMarkup}
            </Grid>
        );

        
        return (
            <Fragment>
                <Button variant="contained" color="primary" size="large" onClick={this.handleOpen} className={classes.suggestButton} startIcon={<EmojiObjectsIcon />}>
                    Suggest me a service!
                </Button>
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

SuggestScreamDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
}

const mapStateToProps = state =>({
    user: state.user,
    UI: state.UI
})

export default connect(mapStateToProps)(withStyles(styles)(SuggestScreamDialog));