const inquirer= require("inquirer");
const sql= require("mysql");
const cTable= require("console.table");
const choiceArr= ['View All Employees', 'View Employees By Department', 'Add Employee', 'Remove Employee','Update Employee Role'];
const roles= ['Software Engineer', 'Lead Engineer', 'Lawyer', 'Legal Team Lead', 'Salesperson', 'Sales Lead',];
const depts= ['Engineering', 'Legal', 'Sales'];


var connection= sql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "employeetrackerdb"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    open();
});

function open() {
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
    }
});
}

function viewAll() {
    let allEmployees = `SELECT employeetable.employeeID, employeetable.first_name, employeetable.last_name, roletable.title, departmenttable.name, roletable.salary
    FROM employeetable
    INNER JOIN roletable ON roletable.roleID = employeetable.role_ID
    INNER JOIN departmenttable ON roletable.dept_ID = departmenttable.deptID`;
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
    let byDept= `select employeetable.employeeID, employeetable.first_name, employeetable.last_name, roletable.title, roletable.salary
    from employeetable
    INNER JOIN roletable
    ON employeetable.role_ID= roletable.roleID
    WHERE roletable.dept_ID= ${x}`;
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
            name: 'firstName',
            message: "What is the Employees first name?"
          },
          {
            type: 'input',
            name: 'lastName',
            message: "What is the Employees last name?"
          },
          {
            type: 'list',
            name: 'role',
            message: "What is this employees role?",
            choices: roles
          },        
        ]).then(data => {
            let deptIndex;
            if (data.role === roles[0] || data.role === roles[1]) {
                deptIndex = 1;
            } else if (data.role === roles[2] || data.role === roles[3]) {
                deptIndex = 2;
            } else {
                deptIndex = 3;
            }
            addEmployee(data.role, deptIndex);
    });

function addEmployee(title, index) {
    let addEmp= `insert into roleTable (title, dept_ID) VALUES (?, ?)`;
        connection.query(addEmp, [title, index], function(err) {
            if (err) throw err;
            console.log('\n', "Employee Successfully added", '\n', '\n');
        });       
    }
}