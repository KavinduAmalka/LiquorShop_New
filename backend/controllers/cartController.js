import User from "../models/User.js";

// Update User CartData : /api/cart/update

export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems } = req.body;

    if (!cartItems || typeof cartItems !== 'object') {
      return res.status(400).json({ success: false, message: "Invalid cartItems" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { cartItems },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Cart updated successfully", cartItems: user.cartItems });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}