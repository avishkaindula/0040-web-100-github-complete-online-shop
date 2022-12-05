const Product = require("../models/product.model");

async function addCartItem(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.body.productId);
  } catch (error) {
    next(error);
    return;
  }
  const cart = res.locals.cart;

  cart.addItem(product);
  req.session.cart = cart;

  res.status(201).json({
    message: "Cart updated",
    newTotalItems: cart.totalQuantity,
    // We can use this feature to update the number of items in the cart tab.
  });
  // 201 means successfully added data.
}

module.exports = {
  addCartItem: addCartItem,
};