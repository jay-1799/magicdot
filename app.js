const express = require("express");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const util = require("util");
const client = require("prom-client"); // Import prom-client
const app = express();

const configRoutes = require("./routes");
const exphbars = require("express-handlebars");

var hbs = exphbars.create({});

hbs.handlebars.registerHelper("times", function (n, block) {
  var accum = "";
  for (var i = 0; i < n; ++i) {
    block.data.index = i;
    block.data.first = i === 0;
    block.data.last = i === n - 1;
    accum += block.fn(this);
  }
  return accum;
});

hbs.handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

const static = express.static(__dirname + "/public");
app.use("/public", static);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(
  session({
    name: "MagicdotSolar",
    secret: "Team09",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(fileUpload());

app.use("*", (req, res, next) => {
  console.log(
    `Log: Method: ${req.method} | URL: ${
      req.originalUrl
    } | Request Body: ${util.inspect(req.body, true, undefined)}`
  );
  next();
});

// Enable the collection of default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Define a custom histogram metric
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Add a route to expose metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Middleware to observe request duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("Your routes will be running on http://localhost:3000");
});
