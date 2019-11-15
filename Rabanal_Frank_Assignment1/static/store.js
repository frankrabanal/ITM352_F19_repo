// create a variable to store the products 'database' in
var products;

function isNonNegInt(q, return_errors = false) {//borrowed this function from Lab13 exercise
    errors = []; // code for if there are no errors
    if (q == '') q = 0; // a blank input is equivalent to 0
    if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // checking if string contains only number values
    else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // checking if input value is a non-negative integer
    else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // checking if positive integer
    return return_errors ? errors : (errors.length == 0);//borrowed idea from micro service template
}

function checkQuantityTextbox(theTextbox) {//borrowed this function from microservice template
    errs = isNonNegInt(theTextbox.value, true);
    if (errs.length == 0) errs = ['You want:'];//text comes out when clicking on form
    if (theTextbox.value.trim() == '') errs = ['Quantity'];
    document.getElementById(theTextbox.name + '_label').innerHTML = errs.join(", ");
}

function display_products() {//borrowed this function from microservice template
    for (i = 0; i < products.length; i++) {
        products_main_display.innerHTML +=
            `
            <section class="item">
                <h2>${products[i].brand}</h2>
                <p>$${products[i].price}</p>
                <div>
                <label id="quantity${i}_label"}">Quantity</label>
                <input type="text" placeholder="0" name="quantity${i}" 
                onkeyup="checkQuantityTextbox(this);">
                </div>
                <img src="${products[i].image}">
            </section>
        `;
    }
}

function display_invoice(invoice_data) {//borrowed this invoice function from microservice template
    // copy the hidden invoice into the main element
    products_main_display.innerHTML = invoice_div.innerHTML;

    for (i = 0; i < products.length; i++) {
        a_qty = invoice_data.quantities[`quantity${i}`];
        if (a_qty > 0) {
            // product row
            extended_price = a_qty * products[i].price;
            newRow = document.getElementById("invoice_table").insertRow(1);
            newRow.innerHTML = `
    <td width="43%">${products[i].brand}</td>
    <td align="center" width="11%">${a_qty}</td>
    <td width="13%">\$${products[i].price}</td>
    <td width="54%">\$${extended_price}</td>
  `;
        }
    }

    // invoice subtotal row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
    <td width="54%">\$${invoice_data.subtotal}</td>
    `;
    // invoice tax row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @${100 * invoice_data.tax_rate}%</span></td>
    <td width="54%">\$${invoice_data.tax.toFixed(2)}</td>
    `;
    // invoice shipping row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%">Shipping</span></td>
    <td width="54%">\$${invoice_data.shipping.toFixed(2)}</td>
    `;
    // invoice total row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
    <td width="54%"><strong>\$${invoice_data.total.toFixed(2)}</td>
    `;
    document.getElementById("display_footer").innerHTML = '<h1>Thank you for shopping with Demon Slayer Fan Store!!<h1>';
}

function process_purchase() {//function for when user submits form to server
    data = new URLSearchParams(new FormData(product_selection_form));
    fetch('/process_purchase', 
    {
        method: 'post',
        body: data
    }
    ).then(function (response) {//if numbers are positive value number integers, post data to server and create invoice
        if (response.ok) {
            response.json().then(function (invoice_data) {
                display_invoice(invoice_data);
            });
        } else {//if not a positive value number interger, do not go to invoice
            console.log('Network request for /process_form failed with response ' + response.status + ': ' + response.statusText);
        }
    });
    
}

var params = (new URL(document.location)).searchParams; // get the query string which has the form data

// when the window loads check if the form was submitted and process the invoice, otherwise display 
window.onload = function () {
        // use fetch to retrieve it, and report any errors that occur in the fetch operation
    // once the products have been successfully loaded and formatted as a JSON object
    // using response.json(), run the initialize() function
    fetch('products.json').then(function (response) {
        if (response.ok) {
            response.json().then(function (json) {
                products = json;
                display_products();
            });
        } else {
            console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
        }
    });
    
    // form was submitted so check that quantities are valid then redirect to invoice if ok.
    if (params.has('purchase_submit')) {//borrowed idea from microservice exercise
        has_errors = false; // assume quantities are valid from the start
        total_qty = 0; // need to check if something was selected so we will look if the total > 0
        for (i = 0; i < products.length; i++) {
            if (params.has(`quantity${i}`)) {
                a_qty = params.get(`quantity${i}`);
                // make textboxes sticky in case of invalid data
                product_selection_form[`quantity${i}`].value = a_qty;
                total_qty += a_qty;
                if (!isNonNegInt(a_qty)) {
                    has_errors = true; // if quantity value is invalid
                    checkQuantityTextbox(product_selection_form[`quantity${i}`]); // show where the error is
                }
            }
        }
        // Now respond to errors or redirect to invoice if all is ok
        if (has_errors) {
            alert("Please enter only valid quantities!");
        } else if (total_qty == 0) { // no quantity selections, just give a general alert
            alert("Please select some quantities!");
        } else { // all good to go!

            display_invoice();
        }
    }
}