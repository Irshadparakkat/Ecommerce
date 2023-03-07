const addBtn = document.getElementById('editbtn1')

const savebutton = document.getElementById('savebtn')



const nameField = document.getElementById('formName');

  const emailField = document.getElementById('formEmail');
  const phoneField = document.getElementById('formPhone');
  const stateField = document.getElementById('formState');
  const cityField = document.getElementById('formCity');
  const pinField = document.getElementById('formPin');
  const addressField = document.getElementById('formAddress');



function validateForm() {

    let state = false;
   
     
     const nameError = document.getElementById('nameError');
   
     const emailError = document.getElementById('emailError');
   
     const phoneError = document.getElementById('phoneError');
     const stateError = document.getElementById('stateError');
     const cityError = document.getElementById('cityError');
     const pinError = document.getElementById('pinError');
     const addressError = document.getElementById('addressError');
   
     if (nameField.value.length < 4) {
   
       nameError.innerHTML='Name must be at least 4 characters long'
   
       state = false;
     }else{
       nameError.innerHTML=' '
       
   
     }
     function validateEmail(email) {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       return emailRegex.test(email);
     }
   
   
     function validatePhoneNumber(phoneNumber) {
   
       const phoneRegex = /^\d{10}$/;
       return phoneRegex.test(phoneNumber); 
   
     }
     const phone = phoneField.value
   
     if (validateEmail(emailField.value)) {
       emailError.innerHTML = '';
   
   
     } else {
       emailError.innerHTML = 'Invalid email';
   
     }
     
     if (validatePhoneNumber(phoneField.value)) {
       phoneError.innerHTML = '';
   
   
     } else {
       phoneError.innerHTML = 'Invalid phone number';
   
     }
     
   
   if(stateField.value.length < 2){
   
     stateError.innerHTML='Please fill the field'
   
   
   }else{
     stateError.innerHTML=''
   }
   
   if(cityField.value.length<2){
     cityError.innerHTML='Please fill the field'
    
   
   }else{
     cityError.innerHTML=''
    
   }
   
   if(pinField.value.length!==6){
   
     pinError.innerHTML='please write correct pin';
   
   }else{
     pinError.innerHTML='';
   
   }
   
   
   if(addressField.length<8){
   
   addressError.innerHTML='Please write a valid address';
   
   
   }else{
     addressError.innerHTML=''
     state = true;
   }
   
   if(state === true ){
   
     savebutton.style.display ='block';
   
   }
   
     
   }
   
   const Addressform = document.getElementById('addressform');
   
   savebutton.addEventListener('click', (event) => {
     event.preventDefault();
   
     const formData = new FormData(Addressform);
   
     console.log("fetching");
   
     const data = {};
     formData.forEach((value, key) => {
       data[key] = value;
     });
   
     fetch('/addresspost', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(data)
     }).then(response => {
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       // The location.reload() function was moved outside of this function to ensure it is called after the response has been processed
       return response.json();
     })
     .then(data => {
       const name = data.name;
       console.log('Name:', name);
       // You can use window.location.reload() to reload the page after a successful request
       window.location.reload();
     })
     .catch(error => {
       console.error('There was a problem with the fetch operation:', error);
     });
   });