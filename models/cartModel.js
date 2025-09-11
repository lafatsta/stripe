/* Cart Model to be used to add items into cart, keep track of quanities, price and totals for integration with Stripe*/
module.exports = function (currentCart) {
    if(currentCart != null){
        this.items=currentCart.items;
        this.itemsInCart=currentCart.itemsInCart;
        this.cartTotal=currentCart.cartTotal;        
    }else{
        this.items= {};
        this.itemsInCart=0;
        this.cartTotal=0; 
    }

    this.add = function(productID, item) {
        // Prevent prototype pollution via dangerous keys
        if (productID === '__proto__' || productID === 'constructor' || productID === 'prototype') {
            return;
        }
        var itemToAdd = this.items[productID];
        if(itemToAdd == null){
            var newItem = {item: item, quantity:0, totalCost:0}
            itemToAdd = newItem;
            this.items[productID]= newItem;
        }
        itemToAdd.quantity++;
        itemToAdd.totalCost = itemToAdd.item.price * itemToAdd.quantity;
        this.itemsInCart++;
        this.cartTotal += item.price;
    }
}