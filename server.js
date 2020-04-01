const path = require("path");
const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
var fs = require("fs");
require("dotenv/config");
var bodyParser = require("body-parser");
const utils = require("./utils");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./secrets.json");

const templateEmail = fs.readFileSync("./templateEmail.html", "utf8", function(
  err,
  data
) {
  if (err) throw err;
  return data;
});

const doc = new GoogleSpreadsheet(
  "1jeqOOVfeyvs7_WVe_ChXWBE_KurCOFlufae0c0i0nKw"
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const port = 5000;

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key
  });
}

accessSpreadsheet();

const app = express();
app.use(express.static(path.join(__dirname, "build")));
app.use(cors());
app.options("*", cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

async function addOrderToSheet(order, date) {
  await doc.loadInfo();

  // create a sheet and set the header row
  const contacts = await doc.sheetsByIndex[0];
  const orders = await doc.sheetsByIndex[1];

  // append rows
  const contactRows = await contacts.addRow([
    order.company,
    order.email,
    order.website,
    order.cartTotal.productQuantity,
    order.cartTotal.totalPrice,
    order.shipping_fullName,
    order.shipping_phone,
    order.shipping_streetAddress,
    order.shipping_address_city,
    order.shipping_address_state,
    order.shipping_address_zip,
    order.shipping_address_country,
    order.billing_fullName,
    order.billing_phone,
    order.billing_streetAddress,
    order.billing_address_city,
    order.billing_address_state,
    order.billing_address_zip,
    order.billing_address_country,
    date
  ]);
  const company = order.company;
  const email = order.email;
  const products = [];
  order.cartProducts.map(cp => {
    const title = cp.title;
    const price = cp.price;
    const quantity = cp.quantity;
    const total = price * quantity;
    const sku = cp.SKU;
    return products.push([company, email, sku, title, price, quantity, total]);
  });

  const itemsRows = await orders.addRows(products);
}

app.get("/api/products", (req, res) => {
  console.log("Recevied request");
  res.sendFile(path.join(__dirname, "data", "products.json"));
});

app.post("/api/email", async (req, res, next) => {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  const html = createEmail(templateEmail, req.body, date);

  const msg = {
    to: req.body.email,
    from: "lpcovid19@logisticsplus.net",
    subject: "Purchase Order with Logistics Plus",
    html: html
  };

  const msg2 = {
    to: "moustafaelhadary96@gmail.com",
    from: "lpcovid19@logisticsplus.net",
    subject: "Purchase Order with Logistics Plus",
    html: html
  };

  sgMail.send(msg);
  sgMail.send(msg2);
  addOrderToSheet(req.body, date);

  res.json(msg);
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(5000, () => {
  console.log(`listening on port ${port}.`);
});

function createEmail(template, order, date) {
  template = template.replace("[#Website#]", order.website);
  template = template.replace("[#Company#]", order.company);
  template = template.replace("[#Email#]", order.email);
  template = template.replace("[#Date#]", date);

  template = template.replace("[#BillingFullName#]", order.billing_fullName);
  template = template.replace(
    "[#BillingStreetAddress#]",
    order.billing_streetAddress
  );
  template = template.replace(
    "[#BillingStreetCity#]",
    order.billing_address_city
  );
  template = template.replace(
    "[#BillingStreetState#]",
    order.billing_address_state
  );
  template = template.replace(
    "[#BillingStreetZip#]",
    order.billing_address_zip
  );
  template = template.replace(
    "[#BillingStreetCountry#]",
    order.billing_address_country
  );
  template = template.replace("[#BillingPhone#]", order.billing_phone);

  template = template.replace("[#ShippingFullName#]", order.shipping_fullName);
  template = template.replace(
    "[#ShippingStreetAddress#]",
    order.shipping_streetAddress
  );
  template = template.replace(
    "[#ShippingStreetCity#]",
    order.shipping_address_city
  );
  template = template.replace(
    "[#ShippingStreetState#]",
    order.shipping_address_state
  );
  template = template.replace(
    "[#ShippingStreetZip#]",
    order.shipping_address_zip
  );
  template = template.replace(
    "[#ShippingStreetCountry#]",
    order.shipping_address_country
  );
  template = template.replace("[#ShippingPhone#]", order.shipping_phone);

  var productWrapper = template.substring(
    template.lastIndexOf("[#ProductsWrapperStart#]"),
    template.lastIndexOf("[#ProductsWrapperEnd#]")
  );

  productWrapper = productWrapper.replace("[#ProductsWrapperStart#]", "");
  productWrapper = productWrapper.replace("[#ProductsWrapperEnd#]", "");

  var products = "";
  order.cartProducts.map(cp => {
    var total = cp.quantity * cp.price;
    var localWrapper = productWrapper;
    localWrapper = localWrapper.replace("[#itemImage#]", cp.mainImage);
    localWrapper = localWrapper.replace("[#itemTitle#]", cp.title);
    localWrapper = localWrapper.replace(
      "[#itemQuantity#]",
      utils.numberWithCommas(cp.quantity)
    );
    localWrapper = localWrapper.replace(
      "[#itemPrice#]",
      utils.formatPrice(cp.price)
    );
    localWrapper = localWrapper.replace(
      "[#itemTotal#]",
      utils.formatPrice(total)
    );
    products += localWrapper;
  });

  template = template.replace("[#ProductsWrapperStart#]", products);
  template = template.replace(productWrapper, "");
  template = template.replace("[#ProductsWrapperEnd#]", "");

  template = template.replace(
    "[#CartTotalProductQuantity#]",
    utils.numberWithCommas(order.cartTotal.productQuantity)
  );
  template = template.replace(
    "[#CartTotalProductPrice#]",
    utils.numberWithCommas(order.cartTotal.totalPrice)
  );

  return template;
}
