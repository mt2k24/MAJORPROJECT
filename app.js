/***************************************************
 * 1️⃣ LOAD ENV VARIABLES (ONLY IN DEVELOPMENT)
 ***************************************************/
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

/***************************************************
 * 2️⃣ IMPORT CORE PACKAGES
 ***************************************************/
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

/***************************************************
 * 3️⃣ IMPORT AUTH, SESSION & UTILITIES
 ***************************************************/
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // IMPORTANT for v6+
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

/***************************************************
 * 4️⃣ IMPORT ROUTES
 ***************************************************/
const listingRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

/***************************************************
 * 5️⃣ DATABASE CONFIG
 ***************************************************/
const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET || "devsecret";

/***************************************************
 * 6️⃣ CONNECT TO MONGODB & START SERVER
 * (Server starts ONLY after DB connection)
 ***************************************************/
mongoose.connect(dbUrl)
    .then(() => {
        console.log("✅ Connected to MongoDB");

        app.listen(8080, () => {
            console.log("🚀 Server running at http://localhost:8080/listings");
        });
    })
    .catch(err => {
        console.log("❌ MongoDB connection error:", err);
    });

/***************************************************
 * 7️⃣ EXPRESS APP CONFIGURATION
 ***************************************************/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Middlewares
app.use(express.urlencoded({ extended: true })); // form data
app.use(express.json()); // JSON requests
app.use(methodOverride("_method")); // PUT & DELETE
app.use(express.static(path.join(__dirname, "public")));

/***************************************************
 * 8️⃣ SESSION STORE (MONGODB)
 ***************************************************/
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.sessionSecret,
    },
    touchAfter: 24 * 3600, // update session once per day
});

store.on("error", function (err) {
    console.log("❌ SESSION STORE ERROR:", err);
});

/***************************************************
 * 9️⃣ SESSION CONFIGURATION
 ***************************************************/
const sessionOptions = {
    store,
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

/***************************************************
 * 🔟 PASSPORT AUTHENTICATION SETUP
 ***************************************************/
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/***************************************************
 * 1️⃣1️⃣ GLOBAL MIDDLEWARE (AVAILABLE IN ALL VIEWS)
 ***************************************************/
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // logged-in user
    next();
});

/***************************************************
 * 1️⃣2️⃣ ROUTES
 ***************************************************/
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

/***************************************************
 * 1️⃣3️⃣ HANDLE UNKNOWN ROUTES (404)
 ***************************************************/
app.all("/*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

/***************************************************
 * 1️⃣4️⃣ CENTRAL ERROR HANDLER
 ***************************************************/
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err });
});
