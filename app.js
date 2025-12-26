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
const MongoStore = require("connect-mongo").default;
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
 * 5️⃣ DATABASE & SECRET CONFIG
 ***************************************************/
const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET || "devsecret";
const port = process.env.PORT || 8080;

/***************************************************
 * 6️⃣ DATABASE CONNECTION & SERVER START
 ***************************************************/
mongoose.connect(dbUrl)
    .then(() => {
        console.log("✅ Connected to MongoDB");

        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/***************************************************
 * 8️⃣ SESSION STORE (MONGODB)
 ***************************************************/
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: sessionSecret,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("❌ SESSION STORE ERROR:", err);
});

/***************************************************
 * 9️⃣ SESSION CONFIGURATION
 ***************************************************/
const sessionOptions = {
    store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.use(session(sessionOptions));
app.use(flash());

/***************************************************
 * 🔟 PASSPORT AUTHENTICATION
 ***************************************************/
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/***************************************************
 * 1️⃣1️⃣ GLOBAL VARIABLES (ALL EJS FILES)
 ***************************************************/
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

/***************************************************
 * 1️⃣2️⃣ ROOT ROUTE
 ***************************************************/
app.get("/", (req, res) => {
    res.redirect("/listings");
});

/***************************************************
 * 1️⃣3️⃣ ROUTES
 ***************************************************/
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

/***************************************************
 * 1️⃣4️⃣ HANDLE 404 (EXPRESS v5 SAFE)
 ***************************************************/
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

/***************************************************
 * 1️⃣5️⃣ CENTRAL ERROR HANDLER
 ***************************************************/
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err });
});
