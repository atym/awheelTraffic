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
 * SETTINGS WINDOW ANIMATION
 **************************************************/

var settingsView = document.getElementById("settingsDiv");
var settingsButton = document.getElementById("settingsButton");
var settingsCover = document.getElementById("settingsCover");
var chart = document.getElementById("myChart");
settingsView.style.display = "none";

function toggleSettings() {
  settingsView.style.display = "block";
  settingsCover.style.display = "block";
}

function closeSettings() {
  settingsView.style.display = "none";
  settingsCover.style.display = "none";
}

window.addEventListener("mouseup", function(event) {
  if (event.target != settingsView && event.target.parentNode != settingsView) {
    settingsView.style.display = "none";
  }
});


var table = document.getElementById("table");
function toggleTable() {

  if (chart.style.display == "block" && table.style.display == "block") {
    table.style.display = "none";
  } else if (chart.style.display == "block") {
    table.style.display = "block";
  }
  else  {
    table.style.display = "none";
  }
}
/**************************************************
 * Open and Close full screen overlay on button click
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
  table.style.display = "none";
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

function openLegend() {

  if (chart.style.display == "block") {

  x = document.getElementsByClassName("title");
  tablinks = document.getElementsByClassName("tablink");
  document.getElementById("bufferResults").style.display = "block";

  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }

  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
  }

  document.getElementById("Legend").style.display = "block";
  document.getElementById("legendTab").firstElementChild.className += " w3-border-red";
  }
}

/**************************************************
 * Activate dark mode CSS
 * store item on device to remember dark mode preference
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
 * Refresh page on click
 * Do not use cache
 **************************************************/

function refreshPage() {
  location.reload(false);
}
