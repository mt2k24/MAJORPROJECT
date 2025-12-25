// index.js (seed script)
const mongoose = require("mongoose");
const initData = require("./data.js"); // adjust if your file name/path differs
const Listing = require("../models/listing.js"); // adjust path if necessary

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Owners to cycle through (as hex strings)
const owners = [
  "693c2e7cdeb2f533559cb890",
  "693c2e97deb2f533559cb897",
  "693c2ebcdeb2f533559cb89e",
];

async function main() {
  try {
    // connect (no deprecated options)
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    // clean collection
    await Listing.deleteMany({});
    console.log("Cleared Listings collection");

    // prepare and assign owners round-robin (use new ObjectId(...))
    const prepared = initData.data.map((obj, idx) => {
      // shallow copy to avoid mutating original file
      const copy = { ...obj };

      // ensure image object stays intact (if it exists)
      if (copy.image && typeof copy.image === "object") {
        copy.image = { ...copy.image };
      }

      // create a real ObjectId instance
      const ownerHex = owners[idx % owners.length];
      copy.owner = new mongoose.Types.ObjectId(ownerHex);

      return copy;
    });

    // insert and log each title -> owner mapping
    const inserted = await Listing.insertMany(prepared);
    console.log(`Inserted ${inserted.length} listings.`);

    inserted.forEach((doc) => {
      console.log(`- "${doc.title}" -> owner: ${doc.owner.toString()}`);
    });

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

// run
main();
