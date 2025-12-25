const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),

    // 🔴 PRICE NUMBER hona chahiye (string nahi)
    price: Joi.number().required().min(0),

    // 🔴 CATEGORY MUST BE INSIDE listing
    category: Joi.string()
      .valid(
        "beach",
        "camping",
        "castles",
        "mountain",
        "arctic",
        "vineyards",
        "domes",
        "design",
        "aframes",
        "treehouses",
        "luxury",
        "trending",
        "lakefront",
        "tinyhomes",
        "bedbreakfast"
      )
      .required(),

    image: Joi.any() // multer file handle karega
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
