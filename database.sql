CREATE DATABASE employee;

use employee;

CREATE TABLE employee (
    emp_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    salary INT,
    contact_num VARCHAR(15),
    office VARCHAR(100),     
    profile_pic VARCHAR(100)
);

INSERT INTO employee(first_name, last_name, salary, contact_num, office, profile_pic) VALUES ("ong", "zhenchun", "1234", "0123456", "penang", null)