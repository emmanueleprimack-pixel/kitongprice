import { cart } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";


export function renderPaymentSummary() {
  let productPrice = 0;
  let shippingPrice = 0;
  
  

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPrice += product.price * cartItem.quantity
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
     shippingPrice = productPrice * 0.12;
   

    
  });

   productPrice = Math.round(productPrice);
   shippingPrice = Math.round(shippingPrice);

  console.log(productPrice);
  console.log(shippingPrice);
  
   const totalBeforeTax = productPrice + shippingPrice;
  const tax = totalBeforeTax * 0;
  const total = Math.round (totalBeforeTax + tax);

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
        Order Summary
      </div>

      <div class="payment-summary-row">
        <div>Items (3):</div>
        <div class="payment-summary-money">Tsh ${productPrice}/=</div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money">Tsh ${shippingPrice}/=</div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">Tsh ${totalBeforeTax}/=</div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (0%):</div>
        <div class="payment-summary-money">Tsh ${tax}</div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">Tsh ${total}/=</div>
      </div>

      <button class="place-order-button button-primary">
        Place your order
      </button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;
}