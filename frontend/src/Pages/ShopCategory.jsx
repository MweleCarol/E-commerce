import React, { useContext } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Items/Item';

const ShopCategory = (props) => {
  const { all_product, loading } = useContext(ShopContext);

  // Add safety check - if all_product is undefined, use empty array
  const safeProducts = all_product || [];

  // Filter products by category
  const categoryProducts = safeProducts.filter(
    (product) => product.category === props.category
  );

  if (loading) {
    return <div className='shop-category'>Loading products...</div>;
  }

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{Math.min(12, categoryProducts.length)}</span> out of {categoryProducts.length} products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {categoryProducts.length > 0 ? (
          categoryProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image_url}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <div className="no-products">No products found in this category.</div>
        )}
      </div>

      {categoryProducts.length > 0 && (
        <div className="shopcategory-loadmore">
          Explore More
        </div>
      )}
    </div>
  );
};

export default ShopCategory;