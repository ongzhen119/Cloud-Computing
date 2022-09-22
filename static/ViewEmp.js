$(function () {

    $.ajax({
        url: "/api/get",
        method: "GET",
        success: (data, textStatus, jqXHR) => {
            $("#emptable tbody").html("");
            if (data.data.length == 0) {
                $("#emptable tbody").html(
                    `<tr><td colspan="6"><div style="text-align: center">No data</div></td></tr>`
                );
            }

            // data.data.forEach((data, idx) => {
            //     $("#emptable tbody").append(`<tr>
            //                                 <td class="custom-text-wrap">${
            //                                     idx + 1
            //                                 }</td>
            //                                 <td class="custom-text-wrap">${
            //                                     data.emp_id
            //                                 }</td>
            //                                 <td class="custom-text-wrap">${
            //                                     data.first_name +
            //                                     " " +
            //                                     data.last_name
            //                                 }</td>
            //                                 <td class="custom-text-wrap">${
            //                                     data.contact_num
            //                                 }</td>
            //                                 <td class="custom-text-wrap">${
            //                                     data.office
            //                                 }</td>
            //                                 <td class="custom-text-wrap">${
            //                                     data.salary
            //                                 }</td>
            //                                 <td>
            //                                     <button id="${data.emp_id}"class="btn btn-primary" onclick="viewEmpDetails(event)"><i class="fa-solid fa-eye"></i></button>
            //                                     <a href="/edit/${
            //                                         data.emp_id
            //                                     }"><button class="btn btn-success"><i
            //                                                 class="fa-solid fa-pencil"></i></button></a>
            //                                     <button onclick="deleteOnClick(event)" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
            //                                 </td>
            //                             </tr>`);
            // });
            console.log(data.data)
            let counter = 1;
            $('#emptable').DataTable({
                data:data.data,
                columns:[
                    {
                        data: 'emp_id'                  
                    },
                    {
                        data: 'emp_id'
                    },
                    {
                        title: 'Employee Name',
                        data: 'first_name'
                   
                    },
                    {
                        data: 'contact_num'
                    },
                    {
                        data: 'office'
                    },
                    {
                        data: 'salary'
                    },{
                        data: null,
                        defaultContent:'' 
                    }

                ], 
                columnDefs:[
                    {
                        render: function(data, type, row){
                            
                            return data + " " + row['last_name'];
                        },
                        targets: 2
                    },
                    {
                        render: function(data, type, row){
                 
                            return counter++;
                        },
                        targets: 0
                    },
                    {
                        render: function(data, type, row){
                 
                            return `<div class="d-flex justify-content-evenly"><button class="btn btn-outline-info" onclick="viewEmpDetails(event)"><i class="fa-regular fa-address-card"></i></button><a href="/edit/${row['emp_id']}"><button class="btn btn-outline-primary"><i class="fa-solid fa-user-pen"></i></button></a><button id="data.emp_id" onclick="deleteOnClick(event)" class="btn btn-outline-danger"><i class="fa-solid fa-user-slash"></i></button></div>`;
                        },
                        targets: 6
                    }
                ]
            });
            
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
        },
    });

});



function deleteOnClick(evt) {
    let emp_id = $(evt.target).closest("tr").children()[1].innerHTML;
    console.log(emp_id);
    $("#empIdToDelete").val(emp_id);
    $("#deleteMsg").html(`Remove employee with ID "${emp_id}" ?`);
    $("#deleteModal").modal("show");
}

function deleteOperation() {
    // 1. Show loading on delete button
    // 2. Delete
    // 3. Close modal and refresh page
    let emp_id = $("#empIdToDelete").val();

    $("#deleteOptBtn").html(
        `<i class="fas fa-spinner fa-spin"></i>&nbsp;Deleting...`
    );
    $("#deleteOptBtn").prop("disabled", true);
    $.ajax({
        url: `/api/delete/${emp_id}`,
        method: "DELETE",
        success: (data, textStatus, jqXHR) => {
            if (data.status) {
                $("#deleteMsg").prepend(
                    `<div class="alert alert-danger" role="alert">Failed to delete employee.<br>${data.error}</div>`
                );
                $("#deleteOptBtn").html("Delete");
                $("#deleteOptBtn").prop("disabled", false);
                return;
            }
            window.location.href = "/view?lastaction=delete&empid=" + emp_id;
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error(errorThrown);
            $("#deleteMsg").prepend(
                `<div class="alert alert-danger" role="alert">Failed to delete employee. Please try again later</div>`
            );
            $("#deleteOptBtn").html("Delete");
            $("#deleteOptBtn").prop("disabled", false);
        },
    });
}

function viewEmpDetails(evt) {
    let emp_id = $(evt.target).closest("tr").children()[1].innerHTML;
    
    $("#detailsModal").modal("show");

    $("#detailsModalLoading").show();
    $("#detailsModalContent").hide();

    $.ajax({
        url: `/api/get?empid=${emp_id}`,
        method: "GET",
        success: (data, textStatus, jqXHR) => {
            console.log(data);

            const dashIfEmpty = (str) =>
                typeof str === "string" && str.trim() !== "" ? str : "-";

            let { first_name, last_name, office, salary, contact_num , profile_pic } =
                data.data;
            if (profile_pic) {
                $("#detailsEmpImg").prop("src", `https://emp-image-ongzhenchun.s3.amazonaws.com/${profile_pic}`);
            } else {
                $("#detailsEmpImg").prop("src", `/static/profile.png`);
            }
            $("#detailsEmpID").html("ID: "+ emp_id);
            $("#detailsEmpName").html(
                dashIfEmpty(`${first_name} ${last_name}`)
            );
            $("#detailsEmpContact").html(dashIfEmpty(`${contact_num}`));
            $("#detailsEmpOffice").html(dashIfEmpty(`${office}`));
            $("#detailsEmpSalary").html(dashIfEmpty(`RM ${salary}`));

            $("#detailsModalLoading").hide();
            $("#detailsModalContent").show();
        },
        error: (jqXHR, textStatus, errorThrown) => {
            $("#detailsModalLoading").hide();
            $("#detailsModalContent").html(
                "Something went wrong. Please try again later"
            );
            $("#detailsModalContent").show();
            console.error(errorThrown);
        },
    });
}
