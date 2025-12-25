const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     descrption: String,
//     image: {
//         default:
//             "https://unsplash.com/photos/a-large-swimming-pool-surrounded-by-palm-trees-_pPHgeHz1uk",
//         type: String,
//         set: (v) => v === "" ? "https://unsplash.com/photos/a-large-swimming-pool-surrounded-by-palm-trees-_pPHgeHz1uk" : v,
//     },
//     price: Number,
//     location: String,
//     country: String,
//     // date: Number,
// });

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: [
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
        ],
        required: true
    }
});

// MIDDLEWARE - All reveiw delete when listing delete
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;