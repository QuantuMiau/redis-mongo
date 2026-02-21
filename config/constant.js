// TTL PARA REDIS
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 60;

// claves de redis
const CACHE_KEYS = {
  PRODUCT_ALL: "products:all",
};

module.exports = {
  CACHE_TTL,
  CACHE_KEYS,
};
