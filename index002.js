import'dotenv/config'
import express, { Router } from 'express';
const router = Router();
const app = express()
import { createConnection } from "mysql2";

// Route to display the form
router.get('/form', (req, res) => {
    res.render('form'); // Assuming you're using a templating engine like EJS or Pug
});

// Route to handle form submission
// router.post('/submit', (req, res) => {
//     // Handle form submission here
//     console.log("Hello World");
// });


router.post('/submit', (req, res) => {
    const { userDetails } = req.body; // Extract form data
    // Insert data into your database
    // Example with MySQL:
    connection.query('INSERT INTO employees SET ? ', [userDetails], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data into database');
        } else {
            res.status(200).send('Data inserted successfully');
        }
    });
});


const connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
connection.connect()
// app.get('/', function (req, res) {
//     // res.send('Hello Geeks!')  
//     // instead of hello geeks, res.send index.html
//     const { FirstName, LastName, Department, JobTitle, StartDate, EndDate, Salary } = employee;
//     connection.query(`INSERT INTO ${process.env.DB_TABLE_NAME} SET ?`, { FirstName, LastName, Department, JobTitle, StartDate, EndDate, Salary }, err => {
//         if (err) throw err;
//         console.log('1 record inserted');
//         res.send('Employee added successfully');
        
//         // res.redirect('/listemployee'); // Redirect to list employees after adding
//     });
//   })

// Define SQL query to insert a new user
// const newUser = { FirstName: 'Jesiah', LastName: 'Tapia' }
// const insertQuery = 'INSERT INTO employees SET ?'

// // Execute the SQL query
// connection.query(insertQuery, newUser, (error, results) => {
//     if (error) {
//         console.error('Error adding user:', error)
//     } else {
//         console.log('New user added successfully:', results)
//     }
// })

// Close the connection
connection.end();


const host = process.env.DB_HOST;
const user = process.env.DB_USER;

console.log(host);
console.log(user);


app.listen(3000, () => {
    console.log(`Node.js server running at http://localhost:3000`);
    // console.log(`add user to database at http://localhost:3000/addemployee`);
  })

