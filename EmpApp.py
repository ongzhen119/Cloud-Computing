from stat import UF_APPEND
from flask import Flask, render_template, request, make_response
from pymysql import connections
import pymysql
import os
import boto3
from config import customhost, customuser, custompass, customdb, custombucket, customregion

app = Flask(__name__)

bucket = custombucket
region = customregion


@app.route("/api/gets3obj/<key>", methods=["GET"])
def apigets3obj(key):
    s3 = boto3.resource('s3')
    try:
        image = s3.Object(custombucket, key).get()["Body"].read()
    except Exception as e:
        return {"status": -1, "msg": str(e)}
    response = make_response(image)
    response.headers.set('Content-Type', 'image/png')
    response.headers.set(
        'Content-Disposition', 'attachment', filename='%s.png' % key)
    return response


@app.route("/api/get", methods=['GET'])
def apiget():
    with connections.Connection(
        host=customhost,
        port=3306,
        user=customuser,
        password=custompass,
        db=customdb
    ) as db_conn:
        emp_id = request.args.get('empid')
        print("hi")
        if emp_id is None:
            with db_conn.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT * FROM employee"
                cursor.execute(sql, (emp_id))
                result = cursor.fetchall()
                return {"data": result}
        else:
            with db_conn.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT * FROM employee WHERE `emp_id`=%s"
                cursor.execute(sql, (emp_id))
                result = cursor.fetchone()
                if result is None:
                    return {"data": []}
                else:
                    return {"data": result}


@app.route("/api/add", methods=["POST"])
def apiadd():
    with connections.Connection(
        host=customhost,
        port=3306,
        user=customuser,
        password=custompass,
        db=customdb
    ) as db_conn:
        # emp_id = request.form.get('emp_id')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        contact_num = request.form.get('contact_num')
        salary = request.form.get('salary')
        office = request.form.get('office')
        emp_image_file = request.files.get('emp_image_file')

        insert_sql = "INSERT INTO employee(first_name, last_name, salary, contact_num, office, profile_pic) VALUES (%s, %s, %s, %s, %s, null)"
        try:
            with db_conn.cursor() as cursor:
                cursor.execute(insert_sql, (first_name, last_name, contact_num, salary, office))
                # result = cursor.fetchone()
        
                result = db_conn.commit()
                
        except Exception as e:
            return {"status": -1, "error": str(e)}

        lastID_sql = "SELECT LAST_INSERT_ID();"
        try:
            with db_conn.cursor() as cursor:
                cursor.execute(lastID_sql)
                result = cursor.fetchone()
                emp_id = result[0]
               
        except Exception as e:
                return {"status": -1, "error": str(e)}


        if emp_image_file is not None:
            object_url = ""
            emp_image_file_name_in_s3 = "emp-id-" + str(emp_id) + "_image_file"
            s3 = boto3.resource('s3')
            try:
                s3.Bucket(custombucket).put_object(
                    Key=emp_image_file_name_in_s3, Body=emp_image_file)
                bucket_location = boto3.client(
                    's3').get_bucket_location(Bucket=custombucket)
                s3_location = (bucket_location['LocationConstraint'])

                if s3_location is None:
                    s3_location = ''
                else:
                    s3_location = '-' + s3_location

                object_url = "https://s3{0}.amazonaws.com/{1}/{2}".format(
                    s3_location,
                    custombucket,
                    emp_image_file_name_in_s3)

            except Exception as e:
                return {"status": -1, "error": str(e)}

            try:
                with db_conn.cursor() as cursor:
                    cursor.execute(
                        "UPDATE employee SET profile_pic = %s WHERE emp_id = %s", (emp_image_file_name_in_s3, emp_id))
                    db_conn.commit()
            except Exception as e:
                return {"status": -1, "error": str(e)}

        return {"status": 0}


@app.route("/api/edit/<emp_id>", methods=["PUT"])
def apiedit(emp_id):
    with connections.Connection(
        host=customhost,
        port=3306,
        user=customuser,
        password=custompass,
        db=customdb
    ) as db_conn:
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        contact_num = request.form.get('contact_num')
        salary = request.form.get('salary')
        office = request.form.get('office')
        emp_image_file = request.files.get('emp_image_file')

        update_sql = "UPDATE employee SET first_name=%s, last_name=%s, contact_num=%s, salary=%s, office=%s WHERE emp_id = %s"
        try:
            with db_conn.cursor() as cursor:
                cursor.execute(update_sql, (first_name,
                                            last_name, contact_num, salary, office, emp_id))
                db_conn.commit()
        except Exception as e:
            return {"status": -1, "error": str(e)}

        if emp_image_file is not None:
            emp_image_file_name_in_s3 = "emp-id-" + str(emp_id) + "_image_file"
            s3 = boto3.resource('s3')
            try:
                s3.Object(custombucket, emp_image_file_name_in_s3).delete()
                s3.Bucket(custombucket).put_object(
                    Key=emp_image_file_name_in_s3, Body=emp_image_file)

            except Exception as e:
                return {"status": -1, "error": str(e)}

        return {"status": 0}


@app.route("/api/delete/<empid>", methods=["DELETE"])
def apidelete(empid):
    with connections.Connection(
        host=customhost,
        port=3306,
        user=customuser,
        password=custompass,
        db=customdb
    ) as db_conn:
        delete_sql = "DELETE FROM employee WHERE emp_id = %s"
        try:
            with db_conn.cursor() as cursor:
                cursor.execute(delete_sql, (empid))
                db_conn.commit()

                # Delete image from S3
                emp_image_file_name_in_s3 = "emp-id-" + str(empid) + "_image_file"
                s3 = boto3.resource('s3')
                s3.Object(custombucket, emp_image_file_name_in_s3).delete()
        except Exception as e:
            return {"status": -1, "error": str(e)}
        return {"status": 0}


@app.route("/", methods=['GET'])
def home():
    return render_template('Home.html')


@app.route("/view", methods=['GET'])
def view():
    msg_html = ""

    lastaction = request.args.get("lastaction")
    empid = request.args.get("empid")
    if lastaction is not None and empid is not None:
        if lastaction == "delete":
            msg_html = f"""<div class="alert alert-success" role="alert">Successfully deleted employee ID {empid}</div>"""
        elif lastaction == "edit":
            msg_html = f"""<div class="alert alert-success" role="alert">Successfully edited employee ID {empid}</div>"""
        elif lastaction == "add":
            msg_html = f"""<div class="alert alert-success" role="alert">Successfully added employee ID {empid}</div>"""
    return render_template('ViewEmp.html', msg_prompt=msg_html)


@app.route("/add", methods=['GET'])
def add():
    return render_template('AddEmpForm.html')


@app.route("/edit/<emp_id>", methods=['GET'])
def edit(emp_id):
    return render_template('EditEmpForm.html', emp_id=emp_id)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
