    function openTab(evt, tabName) {
        // Declare all variables
        var i, content, tablinks;

        // Get all elements with class="content" and hide them
        content = document.getElementsByClassName("content");
        for (i = 0; i < content.length; i++) {
            content[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }