const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const Order = mongoose.model('Order');


// Return total weight of each coffee sold
module.exports = {
  async getWeightSoldPerCoffee() {
    const allCoffeesPromise = Product.find().select({ _id: 1, name: 1, slug: 1 });
    const allCoffees = await allCoffeesPromise;

    // Group all the coffees
    let orderArray = [];
    for (var i = 0; i < allCoffees.length; i++) {
      const orderPromise = Order.find({ 
        'item.itemID': allCoffees[i]._id,
        orderFinalized: true,
        orderRoasted: true,
        orderShipped: true
      }).select({ item: 1, _id: 0 });
      const order = await orderPromise;

      orderArray.push(order);
    };

    // Filter out the items that have no orders
    const filteredArray = orderArray.filter(val => {
      return val.length >= 1;
    });
      
    let grouped = []
    
    // Work out the amount of each coffee sold
    for (var i = 0; i < filteredArray.length; i++) {
      // Initialize/Reset the counter
      let totalWeight = 0;
      for (var j = 0; j < filteredArray[i].length; j++) {
        if(filteredArray[i][j].item.bagSize === 'Regular') {
          totalWeight += (250 * filteredArray[i][j].item.qty); // Grams
        } else {
          totalWeight += (1000 * filteredArray[i][j].item.qty); // Grams
        } 
      }

      // If there are orders, add them to an array
      let coffeeID = filteredArray[i][0].item.itemID
      let coffeeName = filteredArray[i][0].item.itemName;
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