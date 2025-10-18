import React from 'react';
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>
           An e-commerce website is an online platform that facilitates
           buying and selling of products or services over the internet and
           serves as a virtual marketplace where businesses and individuals can 
           showcace their products, interact with customer and conduct all 
           transactions without the need for physical presence. E-commerce 
           websites  have gained immense popularity due to their conven
           accessibility and the global reach they offer.
        </p>
        <p>
            E-commerce websites  typicaly display products or services as 
            detailed descriptions, images, prices and any available variation
            (e.g. sizes, colors). Each product usually has its own description 
            with relevant information.
        </p>
      </div>
    </div>
  );
}

export default DescriptionBox;
