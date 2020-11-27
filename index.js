const inquirer= require("inquirer");
const sql= require("mysql");
const cTable= require("console.table");
const choiceArr= ['View All Employees', 'Select Employee'];


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
    if (data.options === choiceArr[0]) {
        viewAll();
        open();
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
        console.table('\n', res, '\n');
    });
}
