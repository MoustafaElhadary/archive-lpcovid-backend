const path = require("path");
const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
require("dotenv/config");
var bodyParser = require("body-parser");

const utils = require("./utils");

const port = process.env.PORT || 3421;

const app = express();
app.use(cors());
app.options("*", cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.get("/api/products", (req, res) => {
  console.log("Recevied request");
  res.sendFile(path.join(__dirname, "data", "products.json"));
});

app.listen(port, () => {
  console.log(`[products] API listening on port ${port}.`);
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/api/email", (req, res, next) => {
  console.log(req.body);
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  var products = "";
  req.body.cartProducts.map(cp => {
    var total = cp.quantity * cp.price;
    products += `
 
  <tr>
                                <td style="border: 1px solid #ccc; padding: 10px 14px;">
                                    <img src="${
                                      cp.mainImage
                                    }" alt="" height="50">
                                </td>
                                <td style="border: 1px solid #ccc; padding: 10px 14px;">${
                                  cp.title
                                }</td>
                                <td style="border: 1px solid #ccc; padding: 10px 14px; text-align: right;">${utils.numberWithCommas(
                                  cp.quantity
                                )}
                                </td>
                                <td style="border: 1px solid #ccc; padding: 10px 14px; text-align: right;">$${utils.formatPrice(
                                  cp.price
                                )}
                                </td>
                                <td style="border: 1px solid #ccc; padding: 10px 14px; text-align: right;">$${utils.formatPrice(
                                  total
                                )}
                                </td>
                            </tr>
  `;
  });

  var html = `
  <html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
    <title>Purchase Order Details</title>
    <link href="http://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet" type="text/css">
</head>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0"
    style="width: 100%; min-width: 600px; background-color: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">

    <table style="font-family: Lato, Arial, sans-serif; font-size: 14px; border: 0; width: 100%; color: #000;"
        border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff">
        <tbody>
            <tr>
                <td
                    style="text-align: left; border-top: #3081df 8px solid; background: #fff; border-bottom: #3081df 4px solid; padding: 20px;">
                    <h1 style="display: block; padding: 0 0 0 25px; margin: 0;">
                        <span class="logo"
                            style="display: inline-block; width: 140px; height: 24px; padding-bottom: 20px;">
                            <img src="https://www.logisticsplus.net/wp-content/themes/LogisticsPlus/library/images/logistics_plus.png"
                                height="50" alt="logo" />
                        </span>
                        
                    </h1>
                    <strong style="float: right; font-size: 13px; padding-right: 20px; line-height: 25px;"></strong>
                </td>
            </tr>
            <tr>
                <td style="height: 40px;">
                    &nbsp;
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <h2
                        style="float: left; font-family: Lato, Arial, sans-serif; font-size: 19px; font-weight: bold; color: #3181DF; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0;">
                        PURCHASE ORDER
                    </h2>
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <table style="width: 100%; border: 0; vertical-align: top; table-layout: fixed;">
                        <tbody>
                            <tr>
                                <td style="vertical-align: top;" width="50%">
                                    <table style="border: 0;">
                                        <tbody>
                                            <tr>
                                                <td><strong>Company:</strong> ${
                                                  req.body.company
                                                }  ${req.body.website} </td>
                                            </tr>
                                            
                                            <tr>
                                                <td><strong>Email:</strong> ${
                                                  req.body.email
                                                }</td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </td>
                                <td style="vertical-align: top;" width="50%">
                                    <table style="border: 0;">
                                        <tbody>
                                            <tr>
                                                <td><strong>DATE ISSUED:</strong> ${date}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <hr style="height: 0; border: 0; border-top: #ccc 1px solid;">
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <table style="width: 100%; border: 0; vertical-align: top; table-layout: fixed;">
                        <tbody>
                            <tr>

                                <td style="vertical-align: top;" width="50%">
                                    <h2
                                        style="float: left; font-family: Lato, Arial, sans-serif; font-size: 19px; font-weight: bold; color: #3181DF; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 20px;">
                                        BILL TO
                                    </h2>
                                    <table style="width: 100%; border: 0; vertical-align: top;">
                                        <tbody>
                                        <tr style="word-break: break-word;">
                                        <td>${req.body.billing_fullName}</td>
                                    </tr>
                                        <tr style="word-break: break-word;">
                                        <td>${
                                          req.body.billing_streetAddress
                                        }</td>
                                    </tr>
                                    <tr style="word-break: break-word;">
                                        <td>${req.body.billing_address_city}, ${
    req.body.billing_address_state
  },
                                            ${req.body.billing_address_zip}, ${
    req.body.billing_address_country
  }</td>
                                    </tr>
                                    
                                    <tr style="word-break: break-all;">
                                        <td>${req.body.billing_phone}</td>
                                    </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style="vertical-align: top;" width="50%">
                                    <h2
                                        style="float: left; font-family: Lato, Arial, sans-serif; font-size: 19px; font-weight: bold; color: #3181DF; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 20px;">
                                        SHIP TO
                                    </h2>
                                    <table style="width: 100%; border: 0; vertical-align: top;">
                                        <tbody>
                                        <tr style="word-break: break-word;">
                                                <td>${
                                                  req.body.shipping_fullName
                                                }</td>
                                            </tr>
                                            <tr style="word-break: break-word;">
                                                <td>${
                                                  req.body
                                                    .shipping_streetAddress
                                                }</td>
                                            </tr>
                                            <tr style="word-break: break-word;">
                                                <td>${
                                                  req.body.shipping_address_city
                                                }, ${
    req.body.shipping_address_state
  },
                                                    ${
                                                      req.body
                                                        .shipping_address_zip
                                                    }, ${
    req.body.shipping_address_country
  }</td>
                                            </tr>
                                            
                                            <tr style="word-break: break-all;">
                                                <td>${
                                                  req.body.shipping_phone
                                                }</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <hr style="height: 0; border: 0; border-top: #ccc 1px solid;">
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 25px;">
                    <h2
                        style="float: left; font-family: Lato, Arial, sans-serif; font-size: 19px; font-weight: bold; color: #3181DF; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 25px;">
                        PURCHASE ORDER DETAILS
                    </h2>
                    <table
                        style="width: 100%; border: 0; vertical-align: top; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ccc; background: #eee; padding: 10px 14px;">Image</th>
                                <th style="border: 1px solid #ccc; background: #eee; padding: 10px 14px;">Item</th>
                                <th
                                    style="border: 1px solid #ccc; background: #eee; padding: 10px 14px; text-align: right;">
                                    Quantity</th>
                                <th
                                    style="border: 1px solid #ccc; background: #eee; padding: 10px 14px; text-align: right;">
                                    Item Cost In USD</th>
                                <th
                                    style="border: 1px solid #ccc; background: #eee; padding: 10px 14px; text-align: right;">
                                    Line Cost In USD</th>
                            </tr>
                        </thead>
                        <tbody>

                            ${products}

                            <tr>
                            <td colspan="2"
                                style="border: 1px solid #ccc; border-right: 0; padding: 10px 14px; text-align: right;">
                                <strong>Total :</strong></td>
                            <td
                                style="border: 1px solid #ccc; border-left: 0; border-right: 0; padding: 10px 14px; text-align: right;">
                                <strong style="color: #3181DF">${utils.numberWithCommas(
                                  req.body.cartTotal.productQuantity
                                )}</strong>
                            </td>
                            <td
                                style="border: 1px solid #ccc; border-left: 0; border-right: 0; padding: 10px 14px;">
                                &nbsp;</td>
                            <td colspan="2"
                                style="border: 1px solid #ccc; border-left: 0; padding: 10px 14px; text-align: right;">
                                <strong style="color: #3181DF">$${utils.formatPrice(
                                  req.body.cartTotal.totalPrice
                                )}</strong>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <hr style="height: 0; border: 0; ">
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                To modify or cancel order please email lpcovid19@logisticsplus.net or call 855-843-7452
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                Thank you for your order. Our associates will contact you shortly.
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 45px; padding-right: 40px; padding-bottom: 20px;">
                    <hr style="height: 0; border: 0; ">
                </td>
            </tr>
            <tr>
                <td
                    style="text-align: center; padding-left: 45px; padding-right: 40px; padding-top: 25px; padding-bottom: 25px; border-top: #3081df 8px solid; font-size: 12px;">
                    <p>
                        Copyright &copy; 2020 Logistics Plus, Inc. All rights reserved. |
                        <a href="[#SiteRoot#]/Public/ToC.aspx">Terms And Conditions</a> | Powered by <a
                            href="http://www.logisticsplus.net" target="_blank">Logistics Plus</a>
                    </p>
                </td>
            </tr>

        </tbody>
    </table>
</body>

</html>
  `;
  
  const msg = {
    to: req.body.email,
    from: "lpcovid19@logisticsplus.net",
    subject: "Purchase Order with Logistics Plus",
    html: html
  };

  const msg2 = {
    to: "moustafa.elhadary96@gmail.com",
    from: "lpcovid19@logisticsplus.net",
    subject: "Purchase Order with Logistics Plus",
    html: html
  };

  sgMail.send(msg);
  sgMail.send(msg2);

  res.json(msg);
});
