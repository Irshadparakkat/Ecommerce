const changeQuantity = (cartItemId, productId, quantity, size) => {

  const fieldqty = document.querySelector(`tr[data-product-id="${productId}"][data-product-size="${size}"] input[id="myfield"]`);


    const checkqty = parseInt(fieldqty.value) + parseInt(quantity);

    
  
    if (checkqty < 1) {
      removefromcart(productId,size);
    } else {
  
      fetch('/updatecart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cartItemId,
            productId,
            quantity,
            size
          })
        })
        .then(response => response.json())
        .then(data => {
          try {
            if (data.success) {
  
              const cartTotal = data.cartTotal;
              const subtotal = data.subtotal;
  
              // Update the cart total
              document.getElementById('subtotal').innerHTML = cartTotal;
  
              // Update the total for the specific cart item
              const itemTotalEl = document.querySelector(`tr[data-product-id="${productId}"][data-product-size="${size}"] td[name="total"]`);
              itemTotalEl.innerHTML = ` ${subtotal}`;
  
              const itemMessage = document.querySelector(`tr[data-product-id="${productId}"][data-product-size="${size}"] h6[id="message"]`);
  
              itemMessage.innerHTML = "";

              const checkoutBtn = document.getElementById('checkingout');
              checkoutBtn.style.display = 'block'
  
              payable(0);
  
              coupenCode = document.getElementById('validcoupen').value;
  
              if (coupenCode) {
                coupenpost(coupenCode)
              }
  
            } else {
            
              const itemMessage = document.querySelector(`tr[data-product-id="${productId}"][data-product-size="${size}"] h6[id="message"]`);
  
              const checkoutBtn = document.getElementById('checkingout');
              itemMessage.innerHTML = data.message;

              checkoutBtn.style.display = 'none';

              const cartTotal = data.cartTotal;
              const subtotal = data.subtotal;
  
              // Update the cart total
              document.getElementById('subtotal').innerHTML = cartTotal;
  
              // Update the total for the specific cart item
              const itemTotalEl = document.querySelector(`tr[data-product-id="${productId}"][data-product-size="${size}"] td[name="total"]`);
              itemTotalEl.innerHTML = ` ${subtotal}`;
  
  
              payable(0);
            }
          } catch (error) {
            console.error(error);
          }
        })
        .catch(error => console.error(error));
    }
  };

  const removeButtons = document.querySelectorAll('[id^="delete-"]');

removeButtons.forEach(button => {
  button.addEventListener("click", function(event) {
    event.preventDefault();
    const [_, id, size] = button.id.split('-');
    removefromcart(id, size);
  });
});

async function removefromcart(id, size) {
  await fetch(`/removefromcart`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productid: id, size })
  })
  .then(response => {
    if (response.status === 400) {
      return response.json().then(data => {
        alert(data.message)
      })
    } else {
      const rowToRemove = document.querySelector(`tr[data-product-id="${id}"][data-product-size="${size}"]`);
      rowToRemove.remove();
      return response.json();
    }
  })
  .then(data => {
    const cartTotal = data.cartTotal;
    document.getElementById('subtotal').innerHTML = cartTotal;

    payable(0)
    if (cartTotal === 0) {
      window.location.reload();
    }
  })
  .catch(error => {
    console.error(error);
  })
}

  

  
  

async function coupenpost(coupenCode){

	const response = await fetch('/coupenpost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupenCode})
  });
  const data = await response.json();
  if (response.ok) {

	const discount = data.discount

	const message = data.message

	document.getElementById('Discount').innerHTML=discount;

document.getElementById('coupen').innerHTML=message
document.getElementById('coupenerr').innerHTML=""


payable(discount);


  } else {
	document.getElementById('coupen').innerHTML=""

	document.getElementById('Discount').innerHTML="";

	document.getElementById('coupenerr').innerHTML=data.error;

	payable(0);

  }
}


async function applycoupen(){

	const validcoupen = document.getElementById('validcoupen').value

	const response =await fetch('/applyingcoupen',{
		method : 'POST' ,
		headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ validcoupen })
	})
	const data = await response.json();
  if (response.ok) {

	document.getElementById('coupenerr').innerHTML=""

document.getElementById('coupen').innerHTML=data.message

document.getElementById('Discount').innerHTML=data.discount;


  } else {

	document.getElementById('coupen').innerHTML=""

	document.getElementById('coupenerr').innerHTML=data.error

  }
}

function payable(discount) {


	const TotalAmount = document.getElementById('subtotal').innerHTML
 
 
  const tax = 0.18 * TotalAmount;

  console.log(tax);
 
  const payableAmount = (parseInt(TotalAmount) + tax - discount).toFixed(0);

  document.getElementById('Payable').innerHTML = payableAmount;
}



const addBtn = document.getElementById('editbtn1')

const addingbtn =document.getElementById('show-adding')

const addressform = document.getElementById('addressfrm');


const savebutton = document.getElementById('savebtn')


addBtn.addEventListener('click',() => {

  addingbtn.style.display='non';

  addressform.style.display='block';

})

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


var ordersuccessbtn = document.getElementById('ordersuccess')

const orderButton = document.getElementById("myButton");

orderButton.addEventListener('click',(event)=>{
  event.preventDefault();
  const coupon = document.getElementById('validcoupen').value;
  const totalamt = document.getElementById('Payable').textContent; 

  const paymentSelector = document.getElementById('payment-selector');
  const paymentType = paymentSelector.value;

  const index = $('input[type="radio"][name="address"]:checked').val();

  const selectedAddress = document.querySelector('input[name="address"]:checked').value;
  fetch("/makepurchase",{
    method:'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coupon, totalamt, paymentType, index })
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to make purchase');
    }
    return response.json();
  })
  .then((data) => {
    if (data.cod) {
      document.getElementById('order').style.display = "none";
      ordersuccessbtn.click();
     
    } else if (data.Paypal) {
      document.getElementById('order').style.display = "none"; 
      ordersuccessbtn.click();

    } else {
      throw new Error('Unknown response received');
    }
  })
  .catch((error) => {
    console.error(error);
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = error;
    errorDiv.style.display = "block";

  });
});

