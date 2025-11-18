import { connectDb } from "./config/db.js";
import express from "express";


import jwt from "jsonwebtoken";


import cors from "cors";
import "dotenv/config";

import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT;

connectDb();
//API CREATION
app.get("/", (req, res) => {
  res.send("Express App is running");
});





//api endpoints
app.use("/images", express.static(path.join(__dirname, "upload/images")));
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

// Utility function to add image URLs to products
const addImageUrlsToProducts = (products) => {
    return products.map(product => ({
        ...product.toObject(),
        image_url: `${process.env.BASE_URL || 'http://localhost:4000'}/images/${product.image}`
    }));
};

// New collection creation
app.get("/newcollection", async (req, res) => {
    try {
        let products = await Product.find({});

        const productsWithImageUrls = addImageUrlsToProducts(products);
        let newCollection = productsWithImageUrls.slice(-8);

        console.log("New collection fetched with image URLs", newCollection.length);
        res.send(newCollection);
    } catch (error) {
        console.error("Error fetching new collection:", error);
        res.status(500).send({ error: "Failed to fetch new collection" });
    }
});

// Creating endpoint for popular in women category
app.get("/popularinwomen", async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });

        const productsWithImageUrls = addImageUrlsToProducts(products);
        let popularInWomen = productsWithImageUrls.slice(-8);

        console.log("Popular in women fetched with image URLs", popularInWomen.length);
        res.send(popularInWomen);
    } catch (error) {
        console.error("Error fetching popular in women:", error);
        res.status(500).send({ error: "Failed to fetch popular women products" });
    }
});

// Fetch all products with image URLs
app.get("/products", async (req, res) => {
    try {
        let products = await Product.find({});
        const productsWithImageUrls = addImageUrlsToProducts(products);

        console.log("All products fetched with image URLs", productsWithImageUrls.length);
        res.send(productsWithImageUrls);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).send({ error: "Failed to fetch products" });
    }
});

// Fetch products by category with image URLs
app.get("/products/:category", async (req, res) => {
    try {
        const category = req.params.category;
        let products = await Product.find({ category: category });

        const productsWithImageUrls = addImageUrlsToProducts(products);

        console.log(`Products in ${category} category fetched with image URLs`, productsWithImageUrls.length);
        res.send(productsWithImageUrls);
    } catch (error) {
        console.error(`Error fetching ${req.params.category} products:`, error);
        res.status(500).send({ error: `Failed to fetch ${req.params.category} products` });
    }
});

// Fetch single product by ID with image URL
app.get("/product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: "Product not found" });
        }

        const productWithImageUrl = {
            ...product.toObject(),
            image_url: `${process.env.BASE_URL || 'http://localhost:4000'}/images/${product.image}`
        };

        console.log("Single product fetched with image URL", productWithImageUrl.name);
        res.send(productWithImageUrl);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ error: "Failed to fetch product" });
    }
});

// Fetch user middleware
const fetchUser = (req, res, next) => {
    const token = req.header("authToken");
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

// Enhanced cart endpoints with product details
app.post("/addtocart", fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });
        console.log("User data fetched for cart update", userData.email);

        userData.cartData[req.body.itemID] += 1;
        await User.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData }
        );

        res.send({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send({ error: "Failed to add item to cart" });
    }
});

// Endpoint for removing product from cart
app.post("/removefromcart", fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });
        console.log("User data fetched for cart update", userData.email);

        if (userData.cartData[req.body.itemID] > 0) {
            userData.cartData[req.body.itemID] -= 1;
        }

        await User.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData }
        );

        res.send({ success: true, message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).send({ error: "Failed to remove item from cart" });
    }
});

// Enhanced get cart data endpoint with product details and image URLs
app.post("/getcart", fetchUser, async (req, res) => {
    try {
        console.log("Fetch cart data request received for user:", req.user.id);
        let userData = await User.findOne({ _id: req.user.id });

        // Get cart items with product details
        const cartItems = [];
        for (const [productId, quantity] of Object.entries(userData.cartData)) {
            if (quantity > 0) {
                const product = await Product.findById(productId);
                if (product) {
                    cartItems.push({
                        product: {
                            ...product.toObject(),
                            image_url: `${process.env.BASE_URL || 'http://localhost:4000'}/images/${product.image}`
                        },
                        quantity: quantity
                    });
                }
            }
        }

        console.log("Cart data fetched with product details", cartItems.length);
        res.json({
            cartData: userData.cartData,
            cartItems: cartItems,
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).send({ error: "Failed to fetch cart data" });
    }
});

// Search products with image URLs
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).send({ error: "Search query is required" });
        }

        let products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        const productsWithImageUrls = addImageUrlsToProducts(products);

        console.log(`Search results for "${query}" with image URLs`, productsWithImageUrls.length);
        res.send(productsWithImageUrls);
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).send({ error: "Failed to search products" });
    }
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on Port " + port);
  } else {
    console.log("Error in running the server" + error);
  }
});
