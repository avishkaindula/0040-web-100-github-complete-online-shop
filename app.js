const path = require("path");
const express = require("express");
const csurf = require("csurf");
const expressSession = require("express-session");

const createSessionConfig = require("./config/session");
const db = require("./data/database");

const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const checkAuthStatusMiddleware = require("./middlewares/check-auth");
const protectRoutesMiddleware = require("./middlewares/protect-routes");
const cartMiddleware = require("./middlewares/cart");
const updateCartPricesMiddleware = require("./middlewares/update-cart-prices");
const notFoundMiddleware = require("./middlewares/not-found");

const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const baseRoutes = require("./routes/base.routes");
const adminRoutes = require("./routes/admin.routes");
const cartRoutes = require("./routes/cart.routes");
const ordersRoutes = require("./routes/orders.routes");

let port = 3000;

if (process.env.PORT) {
  port = process.env.PORT;
}

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/products/assets", express.static("product-data"));
// imageUrl in Product class in product.model.js starts with /products/assets
// Therefor, we can add a filter like this before express.static
// Now, only requests that starts with /products/assets will be handled by this static middleware.
// We've told express to look inside product-data folder for images.
// since there's a image folder inside product-data, the path will be now set as /products/assets/images
// That's the exact same url we wrote in Product class in product.model.js file.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));

app.use(csurf());

app.use(cartMiddleware);
app.use(updateCartPricesMiddleware);

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);
app.use(productsRoutes);
app.use("/cart", cartRoutes);
// app.use(protectRoutesMiddleware);
// We can add protectRoutesMiddleware as second parameter values for the
// following app.use() methods.
app.use("/orders", protectRoutesMiddleware, ordersRoutes);
app.use("/admin", protectRoutesMiddleware, adminRoutes);
// This will act as a filter
// Only paths that start with /admin will make it into the admin.routes rote configuration.
// So we don't wanna add /admin in the routes we create on admin.routes.js file.
// But we still need to add /admin in the links we create on ejs files.

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(function () {
    app.listen(port);
  })
  .catch(function (error) {
    console.log("Failed to connect to the database!");
    console.log(error);
  });
