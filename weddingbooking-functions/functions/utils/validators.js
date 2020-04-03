
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx))
        return true;
    return false;
}

const isEmpty = (string) => {
    if(string.trim() === '')
        return true;
    return false;
}

exports.validateSignupData = (data) => {
    let errors = {};
 
    if(isEmpty(data.email)){
        errors.email = 'Must not be empty';
    }
    else if (!isEmail(data.email)){
        errors.email = "Must be a valid email address";
    }
 
    if(isEmpty(data.password))
         errors.password = "Must not be empty";
     
     if(data.password !== data.confirmPassword)
         errors.confirmPassword = "Passwords does not match";
 
     if(isEmpty(data.username))
         errors.username = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) 
        errors.email = 'Must not be empty';
    if (isEmpty(data.password)) 
        errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }

}


exports.validatePostAdding = (data) => {
    let errors = {}
    if (isEmpty(data.name))
        errors.name = 'Must not be empty';
    if (isEmpty(data.body))
        errors.body = 'Must not be empty';
    if (isEmpty(data.price))
        errors.price = 'Must not be empty';
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validatePostEdit = (data) => {
    let errors = {}
    if (isEmpty(data.name))
        errors.name = 'Must not be empty';
    if (isEmpty(data.body))
        errors.body = 'Must not be empty';
    if (isEmpty(data.price))
        errors.price = 'Must not be empty';
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {}

    if(!isEmpty(data.bio.trim()))
        userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
        if(data.website.trim().substring(0,4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        }
        else
            userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim()))
        userDetails.location = data.location;
    if(!isEmpty(data.phone.trim()))
        userDetails.phone = data.phone;
    
    return userDetails;
}
