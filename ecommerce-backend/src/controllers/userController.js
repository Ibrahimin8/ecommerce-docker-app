const { User, Cart, Order, Review, Sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// 1. GET USER PROFILE (Includes Cart and Orders)
// 1. GET USER PROFILE (Fixed Alias Mismatch)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, 
      include: [
        // Sequelize is strict: If the model is 'Cart', the alias must match
        { model: Cart, as: 'Cart' }, 
        { model: Order, as: 'Orders' }
      ]
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    // If you get the same error for 'Orders', change it to 'Order' or check your model
    res.status(500).json({ error: error.message });
  }
};
// 2. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ name, email });
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. GET ALL USERS (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. DELETE USER (Admin or Account Owner)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin' && req.user.role !== 'administrator') {
      return res.status(403).json({ message: "Not authorized to delete this account" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy(); 
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. GET AVAILABLE ROLES (Admin Only - Dynamic for Dropdown)
exports.getAvailableRoles = async (req, res) => {
  try {
    // This uses the Sequelize import we fixed at the top
    const roles = await User.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('role')), 'role']]
    });
    
    const rolesList = roles.map(r => r.role);
    
    // Default fallback if database is fresh
    if (rolesList.length === 0) return res.json(['user', 'administrator']);

    res.json(rolesList);
  } catch (error) {
    console.error("Roles List Error:", error);
    res.status(500).json({ message: "Error fetching roles" });
  }
};

// 6. UPDATE USER ROLE (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ role });
    res.status(200).json({ message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. ADMIN CREATE USER/ADMIN


exports.adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2. Hash the password manually
    // Generate a salt (10 rounds is standard)
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user with the HASHED password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Store the hashed version, not the plain text
      role: role || 'user'
    });

    // Remove password from response
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // 1. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 2. Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
