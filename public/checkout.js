document.getElementById("submit").addEventListener("click", stripeCheckout);
function stripeCheckout() {
  var stripe = Stripe(event.target.getAttribute('pk'));
  stripe.redirectToCheckout({sessionId: event.target.getAttribute('sessionID')}).then(function (result) {
    if (result.error) {
      var errmsg = document.getElementById("checkoutError");
      errmsg.textContent = result.error.message;
    }
  });
}