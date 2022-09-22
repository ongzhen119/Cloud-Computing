$(function () {
    let emp_id = $("input[name=emp_id]").val();
    console.log(`/api/get?empid=${emp_id}`);
    $.ajax({
        url: `/api/get?empid=${emp_id}`,
        success: (data, textStatus, jqXHR) => {
            console.log(data);
            $("input[name=first_name]").val(data.data.first_name);
            $("input[name=last_name]").val(data.data.last_name);
            $("input[name=pri_skill]").val(data.data.pri_skill);
            $("input[name=location]").val(data.data.location);
            $("#loading_bar").css("display", "none");
            $("#edit_cont").css("display", "block");
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
            error_prompt(errorThrown)
            $("#loading_bar").css("display", "none");
            $("#edit_cont").css("display", "block");
        },
    });
});

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

    let emp_id = $("input[name=emp_id]").val();
    let first_name = $("input[name=first_name]").val();
    let last_name = $("input[name=last_name]").val();
    let pri_skill = $("input[name=pri_skill]").val();
    let location = $("textarea[name=location]").val();

    var form_data = new FormData();
    form_data.append("emp_id", emp_id);
    form_data.append("first_name", first_name);
    form_data.append("last_name", last_name);
    form_data.append("pri_skill", pri_skill);
    form_data.append("location", location);
    if ($("input[name=emp_image]")[0].files.length > 0) {
        form_data.append(
            "profile_pic",
            $("input[name=emp_image]")[0].files[0]
        );
    }

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
