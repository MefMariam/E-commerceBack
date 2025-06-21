const express = require('express');

const {
   getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getProductByAdmin,
    updateProduct
   
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();
// Create a new product route
router.post('/', protect, admin, createProduct);
// Get all products route
router.get('/', getProducts);

router.get('/admin', protect, admin, getProductByAdmin);
// Get a product by ID route
router.get('/:productId', getProductById);

router.delete('/:productId', protect, admin,deleteProduct); 

router.put('/:productId', protect, admin, updateProduct);

module.exports = router;