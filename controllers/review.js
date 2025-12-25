const Listing = require("../models/listing");
const Review = require("../models/review");

//---- Post Review Route
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    console.log("new review saved");
    req.flash("success", "New Review Created!!");
    // res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!!");
    res.redirect(`/listings/${id}`);
};

module.exports.editReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { ...req.body.review },
    { new: true, runValidators: true }
  );

  res.json({ success: true, review: updatedReview });
};