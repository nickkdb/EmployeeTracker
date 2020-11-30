const inquirer= require("inquirer");
const sql= require("mysql");
const cTable= require("console.table");
const choiceArr= ['View Employees', 'View Departments', 'View Roles', 'Add Data', 'Remove Data', 'Update Data'];
const viewArr= ['View All Employees', 'View Employees By Department', 'View Employees By Role'];
const addArr= ['Add Employee', 'Add Role', 'Add Department'];
const removeArr= ['Remove Employee', 'Remove Role', 'Remove Department'];
const updateArr= ['Update an Employee', 'Update Role', 'Update Department'];
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
            selectType("add");
            break;
        case choiceArr[4]:
            selectType("remove");
            break;
        case choiceArr[5]:
            selectType("update");
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
                    selectDept("view by?");
                    break;
                case viewArr[2]:
                    selectRole("view by?");
                    break;
                
            }
        })
}

function viewAll(type) {
    if (type === "employees") {
        let allEmployees = `SELECT employees.id, employees.firstname, employees.lastname, roles.title, depts.department, roles.salary
        FROM employees
        LEFT JOIN roles ON roles.roleID = employees.role_ID
        LEFT JOIN depts ON roles.dept_ID = depts.deptID
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
        let viewRoles= `select roles.roleID, roles.title, roles.salary, depts.department from roles LEFT JOIN depts ON roles.dept_ID = depts.deptID order by roles.roleID`;
        connection.query(viewRoles, function(err, res) {
            if (err) throw err;
            console.table('\n', res);
            updateData();
        });
    }
}

function selectDept(type) {
    let listDepts= depts.map(obj => obj.dept);
    inquirer.prompt(
        {
            type: 'list',
            name: 'depts',
            message: `What department would you like to ${type}`,
            choices: listDepts
          }
    ).then(data => {
        let idToUse;
        for (let element of depts) {
            if (data.depts === element.dept) {
                idToUse= element.deptID;
            }
        }
        if (type === "view by?") {
            viewBy("dept", idToUse);
        } else if (type === "remove?") {
            removeDept(idToUse);
        }
    });
}

function selectRole(type) {
    let listRoles= roles.map(obj => obj.title);
    inquirer.prompt(
        {
            type: 'list',
            name: 'role',
            message: `What role would you like to ${type}`,
            choices: listRoles
        }
    ).then(data => {
        let roleToUse;
            for (let element of roles) {
                if (data.role === element.title) {
                    roleToUse= element.roleID;
                }
            }
            if (type === "view by?") {
                viewBy("role", roleToUse);  
            } else if (type === "remove") {
                removeRole(roleToUse);
            }
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

function selectType(type) {
    let fill;
    let fillArr;
    if (type === "add") {
        fill= "to";
        fillArr= addArr;
    } else if (type === "remove"){
        fill= "from";
        fillArr= removeArr;
    } else if (type === "update"){
        fill= "in";
        fillArr= updateArr;
    }
    inquirer.prompt(
        {
            type: 'list',
            name: 'type',
            message: `What would you like to ${type} ${fill} the system?`,
            choices: fillArr
        }
    ).then(data => {
        switch (data.type) {
            case addArr[0]:
                getEmployeeInfo();
                break;
            case addArr[1]:
                addRole();
                break;
            case addArr[2]:
                addDept();
                break;
            case removeArr[0]:
                chooseEmployee("remove");
                break;
            case removeArr[1]:
                selectRole("remove");
                break;
            case removeArr[2]:
                selectDept("remove?");
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

function addRole() {
    let listDepts= depts.map(obj => obj.dept);
    inquirer.prompt([
        {
            type: 'input',
            name: 'newRole',
            message: "Enter the name of the role you wish to add:"
          },
          {
            type: 'list',
            name: 'chooseDept',
            message: "Select the department for this role:",
            choices: listDepts
          },
          {
            type: 'number',
            name: 'salary',
            message: "Enter the salary of the role you wish to add:"
          }
        ]).then(data => {
            let idToAdd;
        for (let element of depts) {
            if (data.chooseDept === element.dept) {
                idToAdd= element.deptID;
            }
        }
            let newRole= `INSERT INTO roles (title, salary, dept_ID) VALUE ("${data.newRole}", ${data.salary}, ${idToAdd})`;
            connection.query(newRole, function (err) {
                if (err) throw err;
                console.log('\n', "Role succesfully added!");
                updateData();
            });
        });
}

function chooseEmployee(select) {
    let names= staff.map(obj => obj.first + " " + obj.last);
   inquirer.prompt(
       {
           type: 'list',
           name: 'selection',
           message: `Choose the employee you would like to ${select}:`,
           choices: names
         }
   ).then(data => {
       if (select === "remove") {
           let remove= data.selection;
           removeEmployee(remove);
       } else if (select === "update") {
           let update= data.selection;
           updateEmployee(update);
       }
   })
}

function removeEmployee(person) {
    let idToRemove;
    for (let element of staff) {
       let el= element.first + " " + element.last;
       if (el == person) {
           idToRemove= element.id;
       }
   }
   connection.query(`delete from employees where id= ${idToRemove}`, (err) => {
       if (err) throw err;
       console.table('\n', "Employee successfully removed from database");
       updateData();
   });
}

function removeRole(select) {
    connection.query(`update employees set role_ID= null where role_ID= ${select}`, (err) => {
        if (err) throw err;
    });
    connection.query(`delete from roles where roleID= ${select}`, (err) => {
        if (err) throw err;
        console.log('\n', "Role succesfully deleted from database");
        updateData();
    });
}

function removeDept(select) {
    connection.query(`update roles set dept_ID= null where dept_ID= ${select}`, (err) => {
        if (err) throw err;
    });
    connection.query(`delete from depts where deptID= ${select}`, (err) => {
        if (err) throw err;
        console.log('\n', "Department succesfully deleted from database");
        updateData();
    });
}

