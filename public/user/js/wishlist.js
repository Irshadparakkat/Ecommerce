

async function addWishList(productId) {
    try {
      const response = await fetch('/addtowishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: productId })
      });
  
      const data = await response.json();
      
      if (data.added) {
        console.log("Added to wishlist");
        const wishlistBtn = document.getElementById(`wishlist-btn-${productId}`);
        
       
        wishlistBtn.innerHTML = `
        <img class="icon-heart2 dis-block trans-04 " src="/user/images/icons/icon-heart-02.png" alt="ICON">
        `
        Swal.fire({
          icon: 'success',
          title: 'Item added to wishlist!',
          showConfirmButton: false,
          timer: 1500
        });


      } else if (data.removed) {
        const wishlistBtn = document.getElementById(`wishlist-btn-${productId}`);
  
      
        wishlistBtn.innerHTML = `
      <img class="icon-heart trans-04" src="/user/images/icons/icon-heart-01.png" alt="ICON">
    `



    Swal.fire({
      icon: 'success',
      title: 'Item removed from wishlist!',
      showConfirmButton: false,
      timer: 1500
    });

   
      }
    } catch (error) {
      console.error(error);
    }
  }
  