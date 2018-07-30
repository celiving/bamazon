var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    

    user: "root",

    password: "",
    database: "Bamazon"
});

// test connection
connection.connect(function(error){
    if (error) throw error;
    console.log("connected to " + connection.threadId);
});

function start() {

    inquirer.prompt([
    {
        name: "productId",
        type: "input",
        message: "What is the ID for the product you would like to purchase? Enter a number 1 through 10."
    },
    {
        name: "howMany",
        type: "input",
        message: "How many units would you like to purchase?"
    }
    ]).then(function(answer){

        var itemId = parseInt(answer.productId);


        connection.query("SELECT item_id FROM products WHERE item_id =" + itemId, function(error, response){
            
            if (response.length == 0) {
                console.log("This item ID does not exist.");
                return;
            }
                    
            var quantity = answer.howMany;
            console.log("You want to purchase an item with the product ID " + itemId + " in the quantity of " + quantity + ".");

            var query = "SELECT * FROM products WHERE item_id = " + itemId;

        connection.query(query, function(error, response){
            
            var stockQuantity = response[0].stock_quantity;
            var item = response[0].product_name;
            var price = response[0].price;
            var totalSales = response[0].product_sales;
           

            if(stockQuantity > quantity) {
                var newQuantity = stockQuantity - quantity;
                var decrease = "UPDATE products SET stock_quantity =" + newQuantity + " WHERE item_id = " + itemId;

                connection.query(decrease, function(error, response){
                    
                    var total = (price * quantity).toFixed(2);
                    console.log("Great! You have purchased " + quantity + " " + item + ". The cost per unit of this item is " + price + ". Which brings your total to " + total + ".");

                    var productSales = parseFloat(totalSales) + parseFloat(total);

                    connection.query("UPDATE products SET product_sales = " + productSales + " WHERE item_id = " + itemId);

                    connection.end();
                });
                
            } else {
                console.log("There's  of not enough of that item to cover your order.");
                connection.end();
            }

        });
        })
    });
};

start();