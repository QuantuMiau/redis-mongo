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
      log("🐸 productos obtenidos de Redis");
      return res.status(200).json({});
    }
  } catch (error) {}
};
