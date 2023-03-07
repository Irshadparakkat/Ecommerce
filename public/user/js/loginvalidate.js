///login form validation


const loginemail= document.getElementById('emailid')

const emailErr = document.getElementById('email-err')

const loginpassword = document.getElementById('pwdid')

const passworderror = document.getElementById('pswd-err')

const signinbtn = document.getElementById('signin')


loginemail.addEventListener('input',validatesignEmail)


loginpassword.addEventListener('input',passwordvalidate)





function validatesignEmail(){

    if (validateEmail(loginemail.value)) {

        emailErr.innerHTML = ''
    
    }

        else{

            emailErr.innerHTML = 'Invalid email';

        }
}

function passwordvalidate(){


    if(is_valid_password(loginpassword.value)){
        // If the password is valid, proceed with login

        passworderror.innerHTML=''

signinbtn.style.display='block'


    } else {
        // If the password is not valid, show an error message

        passworderror.innerHTML='"Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one digit"'

    }
}

function is_valid_password(password) {
    // Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return passwordRegex.test(password);
  }
  
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}