import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import Scream from '../components/scream/Scream';
import Profile from '../components/profile/Profile';
import PropTypes from 'prop-types';
import ScreamSkeleton from '../util/ScreamSkeleton';

//MUI stuff
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

//MUI Pickers
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';
  



import {connect} from 'react-redux';
import {getScreams} from '../redux/actions/dataActions';

class home extends Component {

    state = {
        date: new Date(),
        price: '',
        category: 'All'
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleDateChange = (date) => {
        this.setState({date: date});
    }

    componentDidMount(){
        this.props.getScreams();
    }
    render() {
        const {screams, loading} = this.props.data;
        let recentScreamsMarkup = !loading ? (screams.length !== 0 ? (
        screams.map(scream => <Scream dateTag={this.state.date} priceTag={this.state.price} categoryTag={this.state.category} key={scream.screamId} scream={scream}/>)) : (<h2>No Posts Yet!</h2>)
        ) : <ScreamSkeleton/>
        return (
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
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
                    </Grid>
                    <Grid item xs={3}>
                    <TextField variant="outlined" name="price" type="text" label="Add a price" placeholder="Maximum Price" onChange={this.handleChange}/>
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl variant="outlined">
                        <InputLabel htmlFor="outlined-age-native-simple">Category</InputLabel>
                        <Select name="category" native value={this.state.category} onChange={this.handleChange} label="Category">
                        <option value="All">All</option>
                        <option value="EventHall">Location / EventHall</option>
                        <option value="Music">Music</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Others">Others</option>
                        </Select>
                    </FormControl>
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item sm={8} xs={12}>
                        {recentScreamsMarkup}
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <Profile/>
                    </Grid>
                </Grid>
            </div>
        )
  }
}

home.propTypes = {
    getScreams: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapToStateProps = state => ({
    data: state.data
})

export default connect(mapToStateProps, {getScreams})(home);