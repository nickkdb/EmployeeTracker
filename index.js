const inquirer= require("inquirer");
const sql= require("mysql");
const cTable= require("console.table");
const choiceArr= ['View All Employees', 'View Employees By Department', 'Add Employee', 'Remove Employee','Update Employee Role'];
const roles= ['Software Engineer', 'Lead Engineer', 'Lawyer', 'Legal Team Lead', 'Salesperson', 'Sales Lead',];
const depts= ['Engineering', 'Legal', 'Sales'];
let staff;


var connection= sql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "employees_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    open();
});

function open() {
    staff= [];
    connection.query("SELECT id, firstname, lastname FROM employees", function(err, res) {
        if (err) throw err;
        for (let i= 0; i < res.length; i++) {
            let obj= {
                id: res[i].id,
                first: res[i].firstname,
                last: res[i].lastname
            }
            staff.push(obj);
        }
    });
    inquirer.prompt(
    {
        type: 'list',
        name: 'options',
        message: "What would you like to do?",
        choices: choiceArr
      }
).then(data => {
    switch(data.options) {
        case choiceArr[0]:
            viewAll();
            open();
            break;
        case choiceArr[1]:
            selectDept();
            break;
        case choiceArr[2]:
            getEmployeeInfo();
            break;
        case choiceArr[3]:
            removeEmployee();
            break;
    }
});
}

function viewAll() {
    let allEmployees = `SELECT employees.id, employees.firstname, employees.lastname, roles.title, depts.name, roles.salary
    FROM employees
    INNER JOIN roles ON roles.roleID = employees.role_ID
    INNER JOIN depts ON roles.dept_ID = depts.deptID
    ORDER BY employees.id`;
    connection.query(allEmployees, function(err, res) {
        if (err) throw err;
        console.table('\n', res, '\n', '\n');
    });
}

function selectDept() {
    inquirer.prompt(
        {
            type: 'list',
            name: 'depts',
            message: "What department would you like to view?",
            choices: depts
          }
    ).then(data => {
        let num;
        switch (data.depts) {
            case depts[0]:
                num= 1;
                viewByDept(num);
                break;
            case depts[1]:
                num= 2;
                viewByDept(num);
                break;
            case depts[2]:
                num= 3;
                viewByDept(num);
                break;
        }
    });
}

function viewByDept(x) {
    let byDept= `select employees.id, employees.firstname, employees.lastname, roles.title, roles.salary
    from employees
    INNER JOIN roles
    ON employees.role_ID= roles.roleID
    WHERE roles.dept_ID= ${x}`;
    connection.query(byDept, function(err, res) {
        if (err) throw err;
        console.table('\n', res, '\n', '\n');
    });
    open();
}

function getEmployeeInfo() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first',
            message: "What is the Employees first name?"
          },
          {
            type: 'input',
            name: 'last',
            message: "What is the Employees last name?"
          },
          {
            type: 'list',
            name: 'role',
            message: "What is this employees role?",
            choices: roles
          },        
        ]).then(data => {
            let roleIndex;
                for (let i = 0; i < roles.length; i++ ){
                    if (data.role === roles[i]) {
                        roleIndex = (i + 1);
                    }
                } 
                addEmployee(data.first, data.last, roleIndex);  
    });
}

function addEmployee(first, last, role) {
    let add = `INSERT into employees (firstname, lastname, role_ID) VALUES (?, ?, ?)`;
    connection.query(add, [first, last, role], (err) => {
        if (err) throw err;
        console.log('\n', "Employee Successfully added!", '\n', '\n');
    });
    open();
}

 function removeEmployee() {
     let names= staff.map(obj => obj.first + " " + obj.last);
    inquirer.prompt(
        {
            type: 'list',
            name: 'delete',
            message: "Which employee would you like to remove?",
            choices: names
          }
    ).then(data => {
        console.log(data.delete);
    })
 }
