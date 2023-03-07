async function addtoCart(productId, size) {
    try {
        const response = await fetch("/addtocart", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId,
                size,
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                location.assign("/login");
            } else {
                throw new Error(`Request failed with status code ${response.status}`);
            }
        }

        const data = await response.json();
        if (data.status) {
            location.assign("/cart");
        } else {
            if (data.error == "Not authorized") {

                location.assign("/login")
            } else {
                alert(data.error);
                location.reload();
            }
        }
    } catch (error) {
        console.error(error);
    }
}




// delete from the wishlist 

const trashButtons = document.querySelectorAll('.trash-icon');

trashButtons.forEach(trashButton => {
  trashButton.addEventListener('click', () => {
    const wishlistRow = trashButton.closest('tr');
    const itemName = wishlistRow.dataset.id;
  
    fetch(`/wishlist/${itemName}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response;
    })
    .then(() => {
      wishlistRow.remove();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
});
