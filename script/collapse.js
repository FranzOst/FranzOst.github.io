$(document).ready(function() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.parentElement.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "block2";
                this.innerHTML = '<i class="fa fa-fw fa-angle-down"></i>Show abstract';
            } else {
                content.style.display = "block";
                this.innerHTML = '<i class="fa fa-fw fa-angle-up"></i>Hide abstract';
            }
        });
    }
});
