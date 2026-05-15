const { Cart, CartItem, Product } = require('../models');

// 1. GET USER'S CART
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

    // If no cart exists yet, return an empty items array to prevent frontend crashes
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. ADD / UPDATE ITEM (Handles grouping identical items)
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let [cart] = await Cart.findOrCreate({ where: { userId: req.user.id } });

    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });

    if (item) {
      item.quantity += (quantity || 1);
      if (item.quantity <= 0) {
        await item.destroy();
        return res.status(200).json({ message: "Item removed" });
      }
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: quantity || 1
      });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. REMOVE SINGLE PRODUCT TYPE
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.destroy({ where: { cartId: cart.id, productId: req.params.productId } });
    res.status(200).json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. CLEAR CART (Used after successful Checkout)
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};