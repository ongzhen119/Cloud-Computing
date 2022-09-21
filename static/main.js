// Shorthand for $( document ).ready()
$(function () {
    let pathname = window.location.pathname;
    switch (pathname) {
        case "/":
            $("#homeNavItem").addClass("active");
            break;
        case "/view":
            $("#viewNavItem").addClass("active");
            break;
        case "/add":
            $("#addNavItem").addClass("active");
            break;
    }
});