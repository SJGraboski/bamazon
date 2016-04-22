/* Bamazon Executive (assignment p3)
 * =============================== */

// 1: Global vars and Dependencies
// ===============================
// Require mysql and prompt
const mysql = require('mysql');
const prompt = require('prompt');
require('console.table'); // displays an array of objects as a table in console

// establish a connection
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	pass: "",
	database: "bamazon"
})

// schema for initial prompt
var optionSchema = {
	properties : {
		option: {
			pattern: /^[12]/,
			message: 'Please enter 1 or 2.',
			required: true,
		}
	}
}

// schema for adding to department
var addSchema = {
	properties : {
		DepartmentName: {
			required: true
		},
		OverHeadCosts: {
			// matches an int, or a float with no more than 2 dec places
			pattern: /^[0-9]*(\.[0-9][0-9]?)?$/, 
			message: 'The overhead cost must be a number with no more than two decimal places',
			required: true
		}
	}
}


// 2: Functions
// ============

// Add to the department
function addDept() {
	// inform user
	console.log("Okay, what department would you like to add?")
	// initiate prompt
	prompt.get(addSchema, function(err, result) {
		if (err) throw (err);
		// query the insert of the prompted item
		con.query('INSERT INTO Departments ' +
								'VALUES ' + 
									'(null, "' + result.DepartmentName + '", ' + result.OverHeadCosts + ', 0);',
							function(err){
								if (err) throw err;
								// tell the user what we inserted
								console.log("Okay, we've added the " + result.DepartmentName + " department to the store.");
								// show it to them
								console.log(result)
							})
		// kill the connection and the progran
		con.end();
	})
	
}

// creates a temporary table, displays it
function displayTable() {
	console.log("Okay, here is a summary of every department");
	// start transaction so we can run multiple queries for creating and displaying the table
	con.beginTransaction(function(err) {
		if (err) throw err;

			// create duplicate table
			con.query('CREATE TEMPORARY TABLE IF NOT EXISTS tempD AS (SELECT * FROM Departments)', function(err) {
			  if (err) throw err;
			});

			// add TotalProfit column
			con.query('ALTER TABLE tempD ADD TotalProfit FLOAT', function(err) {
			 	if (err) throw err;
			});

			// set values in that colum to totalSales - overHeadCost
 			con.query('UPDATE tempD SET TotalProfit = TotalSales - OverHeadCosts;', function(err) {
			 	if (err) throw err;
			}); 

			// select all elements from new table
			con.query('SELECT * FROM tempD;', function(err, results) {
				if (err) throw err;
				// display the new table as a table
				console.table(results);
			});

		  // drop the table (should happen anyway at con.end, but this is a precautionary measure)
		  con.query('DROP TABLE tempD;', function(err) {
		  	if (err) throw err;
		  });

		  // commit the transaction
      con.commit(function(err) {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
				}
			});
		// end the connection
		con.end();
	})
	
}
// prompter
function theOptions(){
	// show options
	console.log(
		"Welcome back! What would you like to do?\n" +
		"1. View Product Sales By Department\n" +
		"2. Create a New Department"
		);
	// prompt for an option
	prompt.get(optionSchema, function(err, result){
		if (err) throw err;

		// switch case for the prompt
		switch (result.option) {
			
			// display the table
			case "1":
				displayTable();
				break;

			// add a department
			case "2":
				addDept();
				break;
		}
	})
}

// 3: Calls
// ========

// run the program
theOptions();