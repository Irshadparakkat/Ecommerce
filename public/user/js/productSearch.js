const searchInput = document.getElementById('search-input');
const productsSection = document.querySelector('.isotope-grid');

searchInput.addEventListener('keyup', () => {
  const searchTerm = searchInput.value;
  fetch(`/search?term=${searchTerm}`)
    .then(response => response.json())
    .then(response => {
      const products = response.products;
      let html = '';
      products.forEach(product => {
        html += `
          <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item women">
            <div class="block2">
              <div class="block2-pic hov-img0">
                <img src="/productupload/${product.images[0]}" alt="IMG-PRODUCT">
                <a href="/productview/${product.name}" class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04" title="View Product ${product.name}">
                  View
                </a>
              </div>
              <div class="block2-txt flex-w flex-t p-t-14">
                <div class="block2-txt-child1 flex-col-l">
                  <a href="/productview/${product.name}" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">${product.name}</a>
                  <s>$${(product.price * 0.45 + product.price).toFixed(2)}</s>
                  <span class="stext-105 cl3">$${product.price}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      productsSection.innerHTML = html;
    });
});
