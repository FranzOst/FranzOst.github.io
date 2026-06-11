document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".paper .collapsible").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", function () {
            var abstract = button.closest(".paper").querySelector(".abstract");
            if (!abstract) return;
            if (abstract.style.maxHeight) {
                abstract.style.maxHeight = null;
                button.innerHTML = '<i class="fa fa-fw fa-angle-down"></i>Show abstract';
                button.setAttribute("aria-expanded", "false");
            } else {
                abstract.style.maxHeight = abstract.scrollHeight + "px";
                button.innerHTML = '<i class="fa fa-fw fa-angle-up"></i>Hide abstract';
                button.setAttribute("aria-expanded", "true");
            }
        });
    });
});
