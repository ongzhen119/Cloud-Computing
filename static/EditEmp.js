$(function () {
    let emp_id = $("input[name=name]").val();
    console.log(`/api/get?empid=${emp_id}`);
    $.ajax({
        url: `/api/get?empid=${emp_id}`,
        success: (data, textStatus, jqXHR) => {
            console.log(data);
            $("input[name=first_name]").val(data.data.first_name);
            $("input[name=last_name]").val(data.data.last_name);
            $("input[name=contact_num]").val(data.data.contact_num);
            $("input[name=salary]").val(data.data.salary);
            $("select[name=office]").val(data.data.office);
            $("#loading_bar").css("display", "none");
            $("#edit_cont").css("display", "block");
            $("#output").prop("src", `https://emp-image-ongzhenchun.s3.amazonaws.com/${data.data.profile_pic}`)
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
            error_prompt(errorThrown)
            $("#loading_bar").css("display", "none");
            $("#edit_cont").css("display", "block");
        },
    });
});

var loadFile = function(event) {
    var output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
      URL.revokeObjectURL(output.src) // free memory
    }
  };

function toggle_edit_btn(element, state) {
    if (!state) {
        element.prop("disabled", true);
        element.html(`<i class="fas fa-spinner fa-spin"></i>&nbsp;Editing...`);
    } else {
        element.prop("disabled", false);
        element.html(`<i class="fa-solid fa-pencil"></i>&nbsp;Edit`);
    }
}

function editEmp() {
    toggle_edit_btn($("#editBtn"), false);
   
    let first_name = $("input[name=first_name]").val();
    let last_name = $("input[name=last_name]").val(); 
    let contact_num = $("input[name=contact_num]").val();
    let salary = $("input[name=salary]").val();
    let office = $("#office").val();

    var form_data = new FormData();
    form_data.append("first_name", first_name);
    form_data.append("last_name", last_name);
    form_data.append("contact_num", contact_num);
    form_data.append("salary", salary);
    form_data.append("office", office);
    if ($("input[name=emp_image]")[0].files.length > 0) {
        form_data.append(
            "emp_image_file",
            $("input[name=emp_image]")[0].files[0]
        );
    }

    console.log($("input[name=emp_image]")[0].files[0]);
    let emp_id = $("input[name=name]").val();
    $.ajax({
        url: `/api/edit/${emp_id}`,
        method: "PUT",
        enctype: "multipart/form-data",
        processData: false,
        contentType: false,
        data: form_data,
        success: (data, textStatus, jqXHR) => {
            console.log(data);
            toggle_edit_btn($("#editBtn"), true);
            if (data.status !== 0) {
                error_prompt("Something went wrong");
                console.log(data);
                return;
            }
            // success_prompt("Successfully edited employee !");
            window.location.href = `/view?lastaction=edit&empid=${emp_id}`;
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
            error_prompt(errorThrown);
            toggle_edit_btn($("#editBtn"), true);
        },
    });
}

function error_prompt(msg) {
    $("#msg_prompt").html(
        `<div class="alert alert-danger" role="alert">${msg}</div>`
    );
}

function success_prompt(msg) {
    $("#msg_prompt").html(
        `<div class="alert alert-success" role="alert">${msg}</div>`
    );
}
