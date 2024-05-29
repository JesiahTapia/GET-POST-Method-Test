require('dotenv').config()

const express = require('express')
const app = express()
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const PORT = process.env.PORT || 3000

const connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME
})

connection.connect(err => {
   if (err) {
       console.error('Error connecting to MySQL:', err)
       return
   }
   console.log('Connected to MySQL')
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
   secret: 'secret_key',
   resave: false,
   saveUninitialized: true
}))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index002.html'))
})

app.post('/login', (req, res) => {
   const { username, password } = req.body

   connection.query('SELECT * FROM employees WHERE UserName = ?', [username], (err, results) => {
       if (err) {
           console.error(err)
           res.status(500).send('Error querying the database')
           return
       }

       if (results.length === 0) {
           console.log('No user found with username:', username)
           res.status(401).send('Invalid username or password')
           return
       }

       const user = results[0]
       if (user.Password !== password) {
           console.log('Incorrect password for user:', username)
           res.status(401).send('Invalid username or password')
           return
       }

       req.session.user = user
       res.redirect('/user-info')
   })
})

app.get('/user-info', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
        return
    }
    const user = req.session.user

    connection.query('SELECT EmployeeID, FirstName, LastName, Department, JobTitle, StartDate FROM employees', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err)
            res.status(500).send('Error fetching data from database')
            return
        }

        let tableHTML = `<h2>Employee Table</h2>
            <table border="2">
            <tr>
                <th>EmployeeID</th>
                <th>FirstName</th>
                <th>LastName</th>
                <th>Department</th>
                <th>JobTitle</th>
                <th>StartDate</th>
            </tr>`

        results.forEach(row => {
            tableHTML += `<tr>
                <td>${row.EmployeeID}</td>
                <td>${row.FirstName}</td>
                <td>${row.LastName}</td>
                <td>${row.Department}</td>
                <td>${row.JobTitle}</td>
                <td>${row.StartDate}</td>
            </tr>`
        })

        tableHTML += `</table>`

        const userInfoHTML = `
            <h2>User Info</h2>
            <p>Full Name: ${user.FirstName} ${user.LastName}</p>
            <p>Department: ${user.Department}</p>
            <p>Job Title: ${user.JobTitle}</p>
            <p>Annual Salary: ${user.Salary}</p>
            <a href="/logout">Logout</a>
            ${tableHTML}
        `
        res.send(userInfoHTML)
    })
})

app.post('/submit', (req, res) => {
   const { fname, lname, dept, salary, jobtitle, hireDate, uname, password } = req.body
   const userDetails = {
       FirstName: fname,
       LastName: lname,
       Department: dept,
       Salary: salary,
       JobTitle: jobtitle,
       StartDate: hireDate,
       UserName: uname,
       Password: password
   }

   connection.query('INSERT INTO employees SET ?', userDetails, (err, result) => {
       if (err) {
           console.error(err)
           res.status(500).send('Error inserting data into database')
       } else {
           res.status(200).send('Data inserted successfully')
       }
   })
})

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'index002.html'))
})

app.post('/forgot-password', (req, res) => {
    const { username, employeeId, jobTitle, newPassword } = req.body

    connection.query('SELECT * FROM employees WHERE UserName = ? AND EmployeeID = ? AND JobTitle = ?', [username, employeeId, jobTitle], (err, results) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error querying the database')
            return
        }

        if (results.length === 0) {
            res.status(401).send('Invalid credentials provided')
            return
        }

        const user = results[0]
        connection.query('UPDATE employees SET Password = ? WHERE UserName = ?', [newPassword, username], (err, result) => {
            if (err) {
                console.error(err)
                res.status(500).write('Error updating password')
                return
            }
            res.status(200).write('Password updated successfully')
        })
            })
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err)
            res.status(500).send('Error logging out')
            return
        }
        res.clearCookie('connect.sid')
        res.redirect('/')
    })
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
 }) // sets port for site