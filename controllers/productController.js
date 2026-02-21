const Product = require("../models/product");
const { redisClient } = require("../config/redis");
const { CACHE_TTL, CACHE_KEYS } = require("../config/constant");

// obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    // primero intentamos obtener los productos de redis
    const cachedProducts = await redisClient.get(CACHE_KEYS.PRODUCT_ALL);

    if (cachedProducts) {
      // si hay productos en cache los parseamos y los retornamos
      console.log("🐸 productos obtenidos de Redis");
      const products = JSON.parse(cachedProducts);
      return res.status(200).json({ success: true, products });
    }

    // si no hay cache, consultamos en MongoDB
    const products = await Product.find().lean();

    // almacenamos en redis con TTL
    try {
      await redisClient.setEx(
        CACHE_KEYS.PRODUCT_ALL,
        CACHE_TTL,
        JSON.stringify(products),
      );
      console.log("🐸 productos almacenados en Redis");
    } catch (err) {
      console.error("No se pudo guardar en cache Redis:", err.message);
    }

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
};

// crear producto (minimo funcional)
const createProduct = async (req, res) => {
  try {
    const { nombre, precio, categoria, stock } = req.body;
    const product = new Product({ nombre, precio, categoria, stock });
    await product.save();

    // invalidar cache de lista
    try {
      await redisClient.del(CACHE_KEYS.PRODUCT_ALL);
    } catch (err) {
      console.error("No se pudo eliminar cache en Redis:", err.message);
    }

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error creando producto" });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
};
