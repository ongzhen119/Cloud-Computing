function toggle_btn(element, state) {
    if (!state) {
        element.prop("disabled", true);
        element.html(`<i class="fas fa-spinner fa-spin"></i>&nbsp;Adding...`);
    } else {
        element.prop("disabled", false);
        element.html(`<i class="fa-solid fa-plus"></i>&nbsp;Add`);
    }
}

function addEmp() {
    toggle_btn($("#addBtn"), false);

    let emp_id = $("input[name=emp_id]").val();
    let first_name = $("input[name=first_name]").val();
    let last_name = $("input[name=last_name]").val();
    let pri_skill = $("input[name=pri_skill]").val();
    let location = $("input[name=location]").val();

    if (typeof emp_id !== "string" || emp_id.trim() === "") {
        error_prompt("Employee ID cannot be empty");
        toggle_btn($("#addBtn"), true);
        return;
    }

    var form_data = new FormData();
    form_data.append("emp_id", emp_id);
    form_data.append("first_name", first_name);
    form_data.append("last_name", last_name);
    form_data.append("pri_skill", pri_skill);
    form_data.append("location", location);
    if ($("input[name=emp_image]")[0].files.length > 0) {
        form_data.append(
            "emp_image_file",
            $("input[name=emp_image]")[0].files[0]
        );
    }

    $.ajax({
        url: "/api/add",
        method: "POST",
        enctype: "multipart/form-data",
        processData: false,
        contentType: false,
        data: form_data,
        success: (data, textStatus, jqXHR) => {
            console.log(data);
            toggle_btn($("#addBtn"), true);
            if (data.status !== 0) {
                error_prompt("Duplicated Employee ID");
                return;
            }
            // success_prompt("Successfully added employee !");
            window.location.href = `/view?lastaction=add&empid=${emp_id}`;
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
            error_prompt(errorThrown);
            toggle_btn($("#addBtn"), true);
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
