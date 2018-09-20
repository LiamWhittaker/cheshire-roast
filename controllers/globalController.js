const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const Order = mongoose.model('Order');


// Return total weight of each coffee sold
module.exports = {
  async getWeightSoldPerCoffee() {
    const allCoffeesPromise = Product.find().select({ _id: 1 });
    const allCoffees = await allCoffeesPromise;
  
    // Group all the coffees that need to be roasted
    let orderArray = [];
    for (var i = 0; i < allCoffees.length; i++) {
      const orderPromise = Order.find({ 
        'item.itemID': allCoffees[i],
        orderFinalized: true,
        orderRoasted: true,
        orderShipped: true
      }).select({ item: 1, _id: 0 });
      const order = await orderPromise;
      orderArray.push(order);
    };
    let grouped = []
    
    // Work out the amount of each coffee sold
    for (var i = 0; i < orderArray.length; i++) {
      // Initialize/Reset the counter
      let totalWeight = 0;
  
      for (var j = 0; j < orderArray[i].length; j++) {
        if(orderArray[i][j].item.bagSize === 'Regular') {
          totalWeight += (250 * orderArray[i][j].item.qty); // Grams
        } else {
          totalWeight += (1000 * orderArray[i][j].item.qty); // Grams
        }
      }
      // If there are no orders for a coffee in the DB, break out of the loop and don't display it
      if(!orderArray[i][0]) break;
  
      // If there are orders, add them to an array
      let coffeeID = orderArray[i][0].item.itemID;
      let coffeeName = orderArray[i][0].item.itemName;
      grouped.push(new Object ({ coffeeID, coffeeName, totalWeight}));
    }
    
    // Sort descending
    const sorted = grouped.sort(function (a, b) {
      return b.totalWeight - a.totalWeight;
    });
    
    return sorted;
    // Delicious spaghetti :)
  },

  
} 