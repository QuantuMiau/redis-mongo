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

// obtener producto por id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `products:${id}`;

    // intentar cache por id
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log(`🐸 producto ${id} obtenido desde Redis`);
        const product = JSON.parse(cached);
        return res
          .status(200)
          .json({ success: true, product, source: "redis" });
      }
    } catch (err) {
      console.error("Error leyendo cache por id:", err.message);
      // continuamos a consultar Mongo
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // guardar en cache por id
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));
      console.log(`🐸 producto ${id} almacenado en Redis`);
    } catch (err) {
      console.error("No se pudo guardar producto en cache Redis:", err.message);
    }

    return res.status(200).json({ success: true, product, source: "mongo" });
  } catch (error) {
    console.error(error);
    // si ObjectId inválido mongoose lanza CastError
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Id inválido" });
    }
    return res.status(500).json({ success: false, message: "Error interno" });
  }
};

// actualizar producto por id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // invalidar cache de lista
    try {
      await redisClient.del(CACHE_KEYS.PRODUCT_ALL);
    } catch (err) {
      console.error("No se pudo eliminar cache en Redis:", err.message);
    }

    // invalidar/actualizar cache por id
    try {
      const cacheKey = `products:${id}`;
      // actualizar cache con nuevo valor
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));
    } catch (err) {
      console.error(
        "No se pudo actualizar cache por id en Redis:",
        err.message,
      );
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Id inválido" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error actualizando producto" });
  }
};

// eliminar producto por id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // invalidar cache de lista
    try {
      await redisClient.del(CACHE_KEYS.PRODUCT_ALL);
    } catch (err) {
      console.error("No se pudo eliminar cache en Redis:", err.message);
    }

    // eliminar cache por id
    try {
      const cacheKey = `products:${id}`;
      await redisClient.del(cacheKey);
    } catch (err) {
      console.error("No se pudo eliminar cache por id en Redis:", err.message);
    }

    return res
      .status(200)
      .json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Id inválido" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error eliminando producto" });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
