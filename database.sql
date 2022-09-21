CREATE DATABASE employee;

use employee;

CREATE TABLE employee (
    emp_id VARCHAR(50) PRIMARY KEY NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    pri_skill VARCHAR(100),
    location VARCHAR(100),
    profile_pic VARCHAR(100)
);