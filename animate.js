/**************************************************
 * WELCOME to Animate
 **************************************************/
/**************************************************
 * AUSTIN TRAFFIC INCIDENTS
 * by
 * Jason Bartling
 * Ian Kelly
 * Brandon Rose
 **************************************************/

 /**************************************************
  * SETTINGS WINDOW
  **************************************************/
  var settingsView = document.getElementById("settingsDiv");
  var settingsButton = document.getElementById("settingsButton");
  settingsView.style.display = "none";

  function toggleSettings() {
      settingsView.style.display = "block";
    /*if (settingsView.style.display == "block") {
      settingsView.style.display = "none";
    } else if (settingsView.style.display == "block"){
      settingsView.style.display = "block";
    }*/
  }

  function closeSettings() {
    settingsView.style.display = "none";
  }

  window.addEventListener("mouseup", function(event) {
    if (event.target != settingsView && event.target.parentNode != settingsView) {
      settingsView.style.display = "none";
    }
});


/**************************************************
 * Open and Close full screen overlay on logo click
 **************************************************/

function openOverlay() {
  document.getElementById("fullOverlay").style.width = "100%";
  document.getElementById("overlayTeam").style.display = "block";
  document.getElementById("overlayProject").style.display = "none";
}

function closeOverlay() {
  document.getElementById("fullOverlay").style.width = "0%";
}

/**************************************************
 * Switch between team info and project info
 **************************************************/

function teamOverlay() {
  document.getElementById("overlayTeam").style.display = "block";
  document.getElementById("overlayProject").style.display = "none";
}

function projectOverlay() {
  document.getElementById("overlayProject").style.display = "block";
  document.getElementById("overlayTeam").style.display = "none";
}

/**************************************************
 * Close boxContent on click, carot and menu
 **************************************************/

function closeMenu(evt, titleMenu) {

  var i, x, tablinks;
  x = document.getElementsByClassName("title");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById("boxContent").style.display = "none";
}

/**************************************************
 * Show boxContent when menu bar button clicked
 * Define button style (selected)
 **************************************************/

function openMenu(evt, titleMenu) {
  var i, x, y, n, m, tablinks, red;
  tablinks = document.getElementsByClassName("tablink");
  x = document.getElementsByClassName("title");
  y = document.getElementById("boxContent");
  z = "";
  red = evt.currentTarget.firstElementChild.className;
  n = red.includes("red");

  function open() {

    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }

    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
    }

    document.getElementById(titleMenu).style.display = "block";
    evt.currentTarget.firstElementChild.className += " w3-border-red";
    document.getElementById("boxContent").style.display = "block";
  }

  if (n == false) {
    open();

  } else if (n == true && y.style.display == "block") {
    closeMenu(evt, titleMenu);

  } else {
    open();
  }
}

/**************************************************
 * Activate dark mode
 **************************************************/
darkModeToggle = document.getElementById("darkMode");

function swapStyleSheet(sheet) {
  // when darkmode is enabled, do these things
  if (darkModeToggle.checked) {


    document.getElementById("pagestyle").setAttribute("href", sheet);

    document.getElementById("darkTheme").setAttribute("href", "https://js.arcgis.com/4.9/esri/themes/dark/main.css");

    document.getElementById("lightFooter").style.display = "none";
    document.getElementById("darkFooter").style.display = "block";
    localStorage.setItem("mode", "dark");

    // when darkmode is disabled, do these things
  } else {
    document.getElementById("pagestyle").setAttribute("href", "beauty.css");
    document.getElementById("darkTheme").setAttribute("href", "");

    document.getElementById("lightFooter").style.display = "block";
    document.getElementById("darkFooter").style.display = "none";

    localStorage.setItem("mode", "light");
  }
}

/**************************************************
 * Cookie to remember dark mode setting
 **************************************************/
/*function checkCookie() {
  var darkCookie = document.cookie;
  if (darkCookie == "dark") {
    document.getElementById("darkMode").checked = true;
    swapStyleSheet("black.css");
  }
}*/

/*document.cookie = "dark; expires=Tue, 31 Dec 2030 12:00:00 UTC; path=/;";*/

/*
document.cookie = "dark; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";*/

/**************************************************
 * HTML5 Web Storage for dark mode setting
 * This function checks the storage object created by
 * swapStyleSheet()
 **************************************************/

function checkCookie() {
  if (localStorage.getItem("mode") == "dark") {
    document.getElementById("darkMode").checked = true;
    swapStyleSheet("black.css");
  }
}

/**************************************************
 * Animate map refresh icon
 **************************************************/
function spinTimer() {
  setTimeout(function() {
    document.getElementById("legendSpinner").setAttribute("class", "fa fa-refresh fa-lg");
  }, 5000)
}

function spinLegend() {
  /*document.getElementById("legendSpinner").setAttribute("class", "fa fa-refresh fa-spin fa-lg");
  spinTimer();*/
  location.reload(false);
}

/**************************************************
 * CHECK DEVICE SCREEN SIZE
 **************************************************/

 function mobileTasks() {
     w = window,
     d = document,
     e = d.documentElement,
     g = d.getElementsByTagName('body')[0],
     x = w.innerWidth || e.clientWidth || g.clientWidth,
     y = w.innerHeight || e.clientHeight || g.clientHeight;

      if (x<= 450) {
      	function myFunction() {
    var txt;
    if (confirm("It looks like you're on a mobile device, would you prefer high definition of standard definition maps?")) {
        txt = "Hello";
    } else {
        txt = "World";
    }

}
        console.log("This looks like a mobile device!");
      }

}

function refreshPage() {
  location.reload(false);
}
