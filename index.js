const inquirer= require("inquirer");
const sql= require("mysql");
const cTable= require("console.table");
const choiceArr= ['View Employees', 'View Departments', 'View Roles', 'Add Data', 'Remove Employee', 'Update Employee Role'];
const viewArr= ['View All Employees', 'View Employees By Department', 'View Employees By Role'];
const addArr= ['Add Employee', 'Add Role', 'Add Department'];
let staff, roles, depts;


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
    updateData();
});

function updateData() {
    staff= [];
    roles= [];
    depts= [];
    connection.query("SELECT id, firstname, lastname FROM employees", function(err, res) {
        if (err) throw err;
        for (element of res) {
            let obj= {
                id: element.id,
                first: element.firstname,
                last: element.lastname
            }
            staff.push(obj);
        }
    });
    connection.query("SELECT roleID, title, salary FROM roles", function(err, res) {
        if (err) throw err;
        for (element of res) {
            let obj= {
                roleID: element.roleID,
                title: element.title,
                salary: element.salary
            }
            roles.push(obj);
        }
    });
    connection.query("SELECT deptID, department FROM depts", function(err, res) {
        if (err) throw err;
        for (element of res) {
            let obj= {
                deptID: element.deptID,
                dept: element.department
            }
            depts.push(obj);
        }
        open();
    });
}

function open() {
    inquirer.prompt([
    {
        type: 'list',
        name: 'options',
        message: "What would you like to do?",
        choices: choiceArr
      }
    ]).then(data => {
    switch(data.options) {
        case choiceArr[0]:
            view();
            break;
        case choiceArr[1]:
            viewAll("depts");
            break;
        case choiceArr[2]:
            viewAll("roles");
            break;
        case choiceArr[3]:
            selectAddType();
            break;
        case choiceArr[4]:
            chooseEmployee("update");
            break;
    }
});
}

function view() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'view',
            message: "What would you like to view?",
            choices: viewArr
          }
        ]).then(data => {
            switch (data.view) {
                case viewArr[0]:
                    viewAll("employees");
                    break;
                case viewArr[1]:
                    selectDept();
                    break;
                case viewArr[2]:
                    selectRole();
                    break;
                
            }
        })
}

function viewAll(type) {
    if (type === "employees") {
        let allEmployees = `SELECT employees.id, employees.firstname, employees.lastname, roles.title, depts.department, roles.salary
        FROM employees
        INNER JOIN roles ON roles.roleID = employees.role_ID
        INNER JOIN depts ON roles.dept_ID = depts.deptID
        ORDER BY employees.id`;
        connection.query(allEmployees, function(err, res) {
            if (err) throw err;
            console.table('\n', res);
            updateData();
        });
    } else if (type === "depts") {
        connection.query("SELECT * from depts", function(err, res) {
            if (err) throw err;
            console.table('\n', res);
            updateData();
        });
    } else {
        let viewRoles= `select roles.roleID, roles.title, roles.salary, depts.department from roles INNER JOIN depts ON roles.dept_ID = depts.deptID order by roles.roleID`;
        connection.query(viewRoles, function(err, res) {
            if (err) throw err;
            console.table('\n', res);
            updateData();
        });
    }
}

function selectDept() {
    let listDepts= depts.map(obj => obj.dept);
    inquirer.prompt(
        {
            type: 'list',
            name: 'depts',
            message: "What department would you like to view?",
            choices: listDepts
          }
    ).then(data => {
        let idToView;
        for (let element of depts) {
            if (data.depts === element.dept) {
                idToView= element.deptID;
            }
        }
        viewBy("dept", idToView);
    });
}

function selectRole() {
    let listRoles= roles.map(obj => obj.title);
    inquirer.prompt(
        {
            type: 'list',
            name: 'role',
            message: "What role would you like to view by?",
            choices: listRoles
        }
    ).then(data => {
        let roleToView;
        for (let element of roles) {
            if (data.role === element.title) {
                roleToView= element.roleID;
            }
        }
        viewBy("role", roleToView);
    });
}

function viewBy(type, x) {
    if (type === "dept") {
        let byDept= `select employees.id, employees.firstname, employees.lastname, roles.title, roles.salary
        from employees
        INNER JOIN roles
        ON employees.role_ID= roles.roleID
        WHERE roles.dept_ID= ${x}`;
        connection.query(byDept, function(err, res) {
            if (err) throw err;
            console.table('\n', res);
            updateData();
        });
    } else if (type === "role") {
        let byRole= `select employees.id, employees.firstname, employees.lastname, roles.title, roles.salary, depts.department
    from employees
    INNER JOIN roles ON employees.role_ID= roles.roleID
    INNER JOIN depts ON roles.dept_ID= depts.deptID
    WHERE roles.roleID= ${x}`;
    connection.query(byRole, function(err, res) {
        if (err) throw err;
        console.table('\n', res);
        updateData();
    });
    }
}

function selectAddType() {
    inquirer.prompt(
        {
            type: 'list',
            name: 'addtype',
            message: "What would you like to add to the system?",
            choices: addArr
        }
    ).then(data => {
        if (data.addtype === addArr[0]) {
            getEmployeeInfo();
        } else if (data.addtype === addArr[1]) {
            addRole();
        } else {
            addDept();
        }
    });
}

function getEmployeeInfo() {
    let listRoles= roles.map(obj => obj.title);
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
            choices: listRoles
          },        
        ]).then(data => {
            let roleIndex;
                for (let element of roles){
                    if (data.role === element.title) {
                        roleIndex= element.roleID;
                    }
                } 
            addEmployee(data.first, data.last, roleIndex);
    });
}

function addEmployee(first, last, role) {
    let add = `INSERT into employees (firstname, lastname, role_ID) VALUES (?, ?, ?)`;
    connection.query(add, [first, last, role], function (err) {
        if (err) throw err;
        console.log('\n', "Employee Successfully added!");
        updateData();
    });
}

function addDept() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'newDept',
            message: "Enter the name of the department you wish to add:"
          }
        ]).then(data => {
            let newDept= `INSERT into depts (department) VALUE ("${data.newDept}")`;
            connection.query(newDept, function (err) {
                if (err) throw err;
                console.log('\n', "Department succesfully added!");
                updateData();
            });
        })
}
