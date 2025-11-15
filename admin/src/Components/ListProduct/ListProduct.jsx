import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'
import EmojiPicker from 'emoji-picker-react';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/products/all-products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // For debugging
      
      // Handle the actual API response structure
      if (data && data.success && Array.isArray(data.products)) {
        setAllProducts(data.products);
        if (data.products.length > 0) {
          toast.success(`${data.products.length} products fetched successfully!`);
        } else {
          toast.info('No products found.');
        }
      } else if (data && Array.isArray(data.products)) {
        // Fallback: if products array exists but no success flag
        setAllProducts(data.products);
        if (data.products.length > 0) {
          toast.success(`${data.products.length} products fetched successfully!`);
        } else {
          toast.info('No products found.');
        }
      } else {
        throw new Error('Invalid data format: expected products array');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      setAllProducts([]); // Ensure it's always an array
      toast.error(`Failed to fetch products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {
    try {
      const response = await fetch('http://localhost:4000/api/products/remove-product', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove product');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Product removed successfully!');
        await fetchInfo(); // Refresh the list
      } else {
        throw new Error(result.message || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Failed to remove product. Please try again.');
    }
  }

  // Safe rendering function
  const renderProducts = () => {
    // Always ensure we're working with an array
    const productsToRender = Array.isArray(allproducts) ? allproducts : [];
    
    if (productsToRender.length === 0 && !loading && !error) {
      return (
        <div className="no-products">
          <p>No products available.</p>
        </div>
      );
    }

    return productsToRender.map((product, index) => (
      <div key={product.id || product._id || `product-${index}`} className="listproduct-format-main listproduct-format">
        
      
        <img className='list-product-product-icon' src={product.image || ''} alt='' />
        <p>{product.name || 'Unnamed Product'}</p>
        <p>${product.old_price || '0.00'}</p>
        <p>${product.new_price || '0.00'}</p>
        <p>{product.category || 'Uncategorized'}</p>
        <img 
          onClick={() => { remove_product(product.id || product._id) }} 
          src={cross_icon} 
          alt="Remove" 
          className="listproduct-remove-icon" 
          title="Remove product"
        />
      </div>
    ));
  }

  return (
    <div className='list-product'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <h1>All Products List</h1>
      
      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchInfo} className="retry-button">
            Retry
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="loading-indicator">
          Loading products...
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="listproduct-format-main">
           
            <p>Title</p>
            <p>Old Price</p>
            <p>New Price</p>
            <p>Category</p>
            <p>Remove</p>
          </div>
          
          <div className="listproduct-allproducts">
            <hr />
            {renderProducts()}
          </div>
        </>
      )}
    </div>
  );
}

export default ListProduct;