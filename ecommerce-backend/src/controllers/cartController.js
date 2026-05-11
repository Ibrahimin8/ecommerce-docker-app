const { Cart, CartItem, Product } = require('../models');


// GET current user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD item to cart (This was likely missing!)
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Find or create cart for user
    let [cart] = await Cart.findOrCreate({ where: { userId: req.user.id } });

    // Add item to cart
    const item = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity: quantity || 1
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REMOVE item from cart
//REMOVE SINGLE ITEM FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const deleted = await CartItem.destroy({
      where: { cartId: cart.id, productId: productId }
    });

    if (deleted) {
      res.status(200).json({ message: "Item removed from cart" });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. CLEAR ENTIRE CART
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ where: { userId } });

    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};