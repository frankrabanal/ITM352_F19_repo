var express = require('express');//stating variables for standard server setup express, parser, etc.  borrowed from lab13
var myParser = require("body-parser");
var products = require('./static/products.json');

var app = express();

app.use(myParser.urlencoded({ extended: true }));

app.post('/process_purchase', function (req, res, next) {//code for setting up server 
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
    invoice_data = invoice(req.body);
    res.json(invoice_data);
    next();
});

app.use(express.static('./static'));//borrowed server code from Lab13 exercise

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port); });

function invoice(quantities) {//function for looping invoice quantities
    subtotal = 0;
    for (i = 0; i < products.length; i++) {
        a_qty = quantities[`quantity${i}`];
        if (a_qty > 0) {
            // add to subtotal
            subtotal += a_qty * products[i].price;
        }
    }
    // Equation for Invoice tax rate
    var tax_rate = 0.0575;
    var tax = tax_rate * subtotal;

    // Equation for Invoice shipping cost
    if (subtotal <= 50) {
        shipping = 2;
    }
    else if (subtotal <= 100) {
        shipping = 5;
    }
    else {
        shipping = 0.05 * subtotal; // 5% of subtotal
    }

    // Equation for Invoice Grand total calculation
    var total = subtotal + tax + shipping;

    return {//display invoice results
        "quantities": quantities,
        "total": total, 
        "subtotal": subtotal, 
        "tax_rate": tax_rate, 
        "tax": tax, 
        "shipping": shipping
        };
}