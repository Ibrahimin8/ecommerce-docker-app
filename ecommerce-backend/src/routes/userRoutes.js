const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 1. Static paths FIRST
router.get('/profile', verifyToken, userController.getProfile);
router.get('/roles/list', verifyToken, isAdmin, userController.getAvailableRoles);
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

// 2. Parameterized paths LAST
// This matches: PATCH http://localhost:5003/api/users/9/role
router.patch('/:id/role', verifyToken, isAdmin, userController.updateUserRole);

// This matches: DELETE http://localhost:5003/api/users/9
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

// Add this to your userRoutes.js
router.post('/admin-create', verifyToken, isAdmin, userController.adminCreateUser);
// userRoutes.js
router.patch('/profile', verifyToken, userController.updateProfile); // Matches the frontend API.patch

router.put('/change-password', verifyToken, userController.changePassword); // Matches the frontend API.put
module.exports = router;