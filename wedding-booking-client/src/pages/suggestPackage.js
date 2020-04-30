import React, { Component, Fragment } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Profile from '../components/profile/Profile';
import BookScream from '../components/scream/BookScream';



//Mui Stuff
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


//select
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

//table
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

//MUI Pickers
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';


import {connect} from 'react-redux';
import {suggestPackageScreams, clearErrors} from '../redux/actions/dataActions';

const styles = {
    budget: {
        textAlign: 'center'
    },
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
    formControl: {
        marginTop: 60
    },
    formControlSuggestion: {
        marginTop: 10
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
    },
    table: {
        minWidth: 650,
    },
    tableContainer: {
        marginTop: 25,
        padding: 15,
    }
}

class suggestPackage extends Component {

    state = {
        loading: false,
        open: false,
        date: new Date().toISOString(),
        price: '',
        location: true,
        music: false,
        photo: false,
        entertainment: false,
        others: false,
        suggestionType: 'suggested',
        error: {},
        errors: {}
    };
    componentWillReceiveProps(nextProps){
        if(nextProps.UI.errors){
            this.setState({errors: nextProps.UI.errors});
        }
    }

    handleCheckedChange = (event) => {
        this.setState({[event.target.name]: event.target.checked});
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
        this.setState({errors: {}});
        this.props.clearErrors();
    }

    handleDateChange = (date) => {
        this.setState({date: date.toISOString()});
        this.setState({errors: {}});
        this.props.clearErrors();
    }
    

    handleSubmit = () => {
        // this.setState({loading: true, screams: []});
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
        this.props.suggestPackageScreams(criterias);
        
    }

    render() {

        const {classes, user: {authenticated, credentials}, UI: {loading}, data: {package: pkg}} = this.props;   
        const {errors} = this.state;
        const firstPackage = pkg.length > 0 ? pkg[0] : null;
        const secondPackage = pkg.length > 0 ? pkg[1] : null;
        const error = [this.state.location, this.state.music, this.state.photo, this.state.entertainment, this.state.others].filter((v) => v).length < 1;
        const buttonSubmit = error ? (<Button variant="contained" disabled className={classes.submitButton}>
        Show me
      </Button>) : (<Button variant="contained" color="primary" onClick={this.handleSubmit} className={classes.submitButton} disabled={loading}>
            Show me
            {loading && (
                <CircularProgress size={30} className={classes.progress}/>
            )} 
        </Button>);

        const table = Object.keys(errors).length === 0  && firstPackage && secondPackage ? (
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead className={classes.head}>
                        <TableRow>
                            <TableCell><Button color="primary">Top</Button></TableCell>
                            <TableCell align="right"><Button color="primary">Name</Button></TableCell>
                            <TableCell align="right"><Button color="primary">Description</Button></TableCell>
                            <TableCell align="right"><Button color="primary">Category</Button></TableCell>
                            <TableCell align="right"><Button color="primary">Price</Button></TableCell>
                            <TableCell align="right"><Button color="primary">Book it</Button></TableCell>
                     </TableRow>
                    </TableHead>
                    <TableBody>
                    {firstPackage.map((scream) => (
                        <TableRow key={scream.createdAt} className={classes.choice} selected>
                        <TableCell component="th" scope="row">
                            {1}
                        </TableCell>
                        <TableCell align="right">{scream.name}</TableCell>
                        <TableCell align="right" className={classes.bodyText}>{scream.body}</TableCell>
                        <TableCell align="right">{scream.category}</TableCell>
                        <TableCell align="right">{scream.price}</TableCell>
                        {authenticated && credentials.userType === 'Married To Be' ? (<TableCell align="right">
                            <BookScream screamId={scream.screamId} date={this.state.date} price={scream.price}/>
                            </TableCell>) : null}
                        </TableRow>
                    ))}

                    {secondPackage && secondPackage.map((scream) => (
                        <TableRow key={scream.createdAt}>
                        <TableCell component="th" scope="row">
                            {2}
                        </TableCell>
                        <TableCell align="right">{scream.name}</TableCell>
                        <TableCell align="right" className={classes.bodyText}>{scream.body}</TableCell>
                        <TableCell align="right">{scream.category}</TableCell>
                        <TableCell align="right">{scream.price}</TableCell>
                        {authenticated && credentials.userType === 'Married To Be' ? (<TableCell align="right">
                            <BookScream screamId={scream.screamId} date={this.state.date} price={scream.price}/>
                            </TableCell>) : null}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        ) : (<p>{errors.error}</p>);

        return (
            <Fragment>
            <Grid container spacing={2}>
               <Grid item xs={3} className={classes.smallGrid}>
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

                    <FormControl required error={error} component="fieldset" className={classes.formControl}>
                    <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={this.state.location} onChange={this.handleCheckedChange} name="location" color="primary" />}
                        label="Location / EventHall"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={this.state.music} onChange={this.handleCheckedChange} name="music" color="primary"/>}
                        label="Music"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={this.state.photo} onChange={this.handleCheckedChange} name="photo" color="primary"/>}
                        label="Photo & Video"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={this.state.entertainment} onChange={this.handleCheckedChange} name="entertainment" color="primary" />}
                        label="Entertainment"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={this.state.others} onChange={this.handleCheckedChange} name="others" color="primary" />}
                        label="Others"
                    />
                    </FormGroup>
                    {error && (<FormHelperText>Choose at least one!</FormHelperText>)}
                </FormControl>
                {buttonSubmit}
                </Grid>
                <Grid item xs={3} className={classes.budget}>
                    <TextField variant="outlined" name="price" type="text" label="Maximum Budget" placeholder="Maximum Budget" className={classes.budget} onChange={this.handleChange}/>
                </Grid>
                <Grid item xs={2} className={classes.smallGrid}>
                    <FormControl name="suggestionType" className={classes.formControlSuggestion} fullWidth>
                                <InputLabel>Suggestion Type</InputLabel>
                                <Select name="suggestionType" value={this.state.suggestionType} onChange={this.handleChange}>
                                    <MenuItem value={'low'}>Lowest Price</MenuItem>
                                    <MenuItem value={'suggested'}>Suggested</MenuItem>
                                    <MenuItem value={'high'}>Higher Price</MenuItem>
                                </Select>
                    </FormControl>
                </Grid>
                <Grid item sm={4} xs={12}>
                        <Profile/>
                </Grid>
            </Grid>
            {table}
            </Fragment>
        )
    }
}

suggestPackage.propTypes = {
    classes: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    suggestPackageScreams: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired,
}

const mapStateToProps = state =>({
    user: state.user,
    UI: state.UI,
    data: state.data
})

export default connect(mapStateToProps, {suggestPackageScreams, clearErrors})(withStyles(styles)(suggestPackage));