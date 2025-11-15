import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }

    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]: e.target.value});
    }

    // Reset form function
    const resetForm = () => {
        setProductDetails({
            name: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: ""
        });
        setImage(false);
    }

    const addProduct = async () => {
        // Validation
        if (!productDetails.name || !productDetails.old_price || !productDetails.new_price || !image) {
            toast.error('Please fill all fields and select an image', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            console.log(productDetails);
            let responseData;
            let product = { ...productDetails };

            let formData = new FormData();
            formData.append('product', image);

            // Upload image
            const uploadResponse = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });

            responseData = await uploadResponse.json();

            if (responseData.success) {
                product.image = responseData.image_url;
                console.log(product);
                
                // Add product to database
                const addProductResponse = await fetch('http://localhost:4000/api/products/add-product', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                const result = await addProductResponse.json();
                
                if (result.success) {
                    toast.success('Product Added Successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        onClose: resetForm // Reset form after toast closes
                    });
                } else {
                    toast.error('Failed to add product', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }
            } else {
                toast.error('Image upload failed', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('An error occurred while adding the product', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='add-product'>
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
            />
            
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input 
                    value={productDetails.name} 
                    onChange={changeHandler} 
                    type="text" 
                    name='name' 
                    placeholder='Type here'
                    disabled={isLoading}
                />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input 
                        value={productDetails.old_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='old_price' 
                        placeholder='Type here' 
                        disabled={isLoading}
                    />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input 
                        value={productDetails.new_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='new_price' 
                        placeholder='Type here' 
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select 
                    value={productDetails.category} 
                    onChange={changeHandler} 
                    name="category" 
                    className='add-product-selector'
                    disabled={isLoading}
                >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kids</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img 
                        src={image ? URL.createObjectURL(image) : upload_area} 
                        alt="" 
                        className='addproduct-thumbnail-img'
                    />
                </label>
                <input 
                    onChange={imageHandler} 
                    type="file" 
                    name='image' 
                    id='file-input' 
                    hidden 
                    disabled={isLoading}
                />
            </div>
            <button 
                onClick={addProduct} 
                className='addproduct-btn'
                disabled={isLoading}
            >
                {isLoading ? 'Adding...' : 'ADD'}
            </button>
            
            {/* Optional: Add a reset button for manual reset */}
            <button 
                type="button"
                onClick={resetForm}
                className='addproduct-btn reset-btn'
                disabled={isLoading}
                style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
            >
                Reset
            </button>
        </div>
    );
}

export default AddProduct;