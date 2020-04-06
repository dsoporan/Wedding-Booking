import React from 'react';
import { Component } from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import jwtDecode from 'jwt-decode';
import AuthRoute from './util/AuthRoute';

//Redux
import {Provider} from 'react-redux';
import store from './redux/store';
import {SET_AUTHENTICATED} from "./redux/types";
import {logoutUser, getUserData} from './redux/actions/userActions'; 

//Pages
import home from './pages/home';
import bookings from './pages/bookings';
import login from './pages/login'
import signup from './pages/signup'
import Navbar from './components/layout/Navbar';
import user from './pages/user';
import axios from 'axios';

const theme = createMuiTheme({
  palette:{
    primary: {
      light: '#33c9dc',
      main: "#00bcd4",
      dark: '#008394',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff6333',
      main: "#ff3d00",
      dark: '#b22a00',
      contrastText: '#fff'
    }
  },
  typography: {
    useNextVariants: true
  }
})

const token = localStorage.FBIdToken;
if(token){
  const decodedToken = jwtDecode(token);
  if(decodedToken.exp * 1000 < Date.now()){
    store.dispatch(logoutUser());
    window.location.href = '/login';
  }
  else{
    store.dispatch({type: SET_AUTHENTICATED});
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render(){
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
        <Router>
        <Navbar/>
          <div className="container">
            <Switch>
              <Route exact path='/' component={home}/>
              <Route exact path='/bookings' component={bookings}/>
              <AuthRoute exact path='/login' component={login}/>
              <AuthRoute exact path='/signup' component={signup}/>
              <Route exact path='/users/:username' component={user}/>
              <Route exact path='/users/:username/scream/:screamId' component={user}/> 
            </Switch>
          </div>
        </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
