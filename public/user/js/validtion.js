
const first_name = document.getElementById('fname')

const ferror = document.getElementById('fError')

const last_name = document.getElementById('lname')
const lerror = document.getElementById('lError')


const email = document.getElementById('email')
const emailerror = document.getElementById('eError')

const phoneField = document.getElementById('phone')

const phoneError = document.getElementById('PhoneError')

const passwordField = document.getElementById('pwd')
const passwordError = document.getElementById('PwdError')



const signupbtn = document.getElementById('signupid')

let visibility = 0

first_name.addEventListener('input', formvalidatename);
last_name.addEventListener('input', formvalidatename);
email.addEventListener('input', formvalidateEmail);
phoneField.addEventListener('input', formvalidatePhone);
passwordField.addEventListener('input', formvalidatePassword);


function formvalidatePassword() {

    const passwordErrors = validatePassword(passwordField.value);
    if (passwordErrors.length === 0) {
        passwordError.innerHTML = '';
        if(visibility>5){

            visibility=5
        }else{
        visibility++

    }
    } else {
        passwordError.innerHTML = passwordErrors.join('<br>');

        if(visibility>0){
            visibility--
        }else{
            visibility=0
        }
    }
    if (visibility > 0) {

        signupbtn.style.display = 'block'

    } else {
        signupbtn.style.display = 'none'
    
    }

}


function validatePassword(password) {
    const errors = [];

    if (password.length < 6) {
        errors.push('Password should be at least 6 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password should include at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password should include at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password should include at least one digit');
    }

    if (!/\W/.test(password)) {
        errors.push('Password should include at least one special character');
    }

    return errors;
}



function formvalidatePhone() {


    if (validatePhoneNumber(phoneField.value)) {
        phoneError.innerHTML = '';

        if(visibility>5){

            visibility=5
        }else{
        visibility++

    }

    } else {
        phoneError.innerHTML = 'Invalid phone number';


        if(visibility>0){
            visibility--
        }else{
            visibility=0
        }
    }

    function validatePhoneNumber(phoneNumber) {

        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phoneNumber);

    }


}


function formvalidateEmail() {

    if (validateEmail(email.value)) {

        emailerror.innerHTML = '';
        if(visibility>5){

            visibility=5
        }else{
        visibility++

    }

    } else {
        emailerror.innerHTML = 'Invalid email';

        if(visibility>0){
            visibility--
        }else{
            visibility=0
        }


    }

    
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function formvalidatename() {

    if (first_name.value.length < 4) {
        ferror.innerText = "please enter a valid name"
    if(visibility>0){
        visibility--
    }else{
        visibility=0
    }
    }
    else {
        ferror.innerText = " "

        if(visibility>5){

            visibility=5
        }else{
        visibility++

    }

    }

    if (last_name.value.length < 3) {
        lerror.innerText = "please enter a valid name"
    }
    else {
        lerror.innerText = " "

        visibility++
    }

}



