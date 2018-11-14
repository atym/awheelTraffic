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
 * Show boxContent when menu bar button clicked
 * Define button style (selected)
 **************************************************/

function openMenu(evt, titleMenu) {
  var i, x, tablinks;
  x = document.getElementsByClassName("title");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
  }
  document.getElementById(titleMenu).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-border-red";
  document.getElementById("boxContent").style.display = "block";
}

/**************************************************
 * Close boxContent on carot click
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
 * Swap stylesheet for dark mode
 **************************************************/
darkModeToggle = document.getElementById("darkMode");

function swapStyleSheet(sheet) {
  // when darkmode is enabled, do these things
  if (darkModeToggle.checked) {
    document.getElementById("pagestyle").setAttribute("href", sheet);
    document.getElementById("darkTheme").setAttribute("href", "https://js.arcgis.com/4.9/esri/themes/dark/main.css");
    document.getElementById("infoLightButton").style.display = "none";
    document.getElementById("xinfoDarkButton").style.display = "block";
    document.getElementById("xinfoDarkIcon").style.display = "block";
    document.getElementById("lightFooter").style.display = "none";
    document.getElementById("darkFooter").style.display = "block";
    // when darkmode is disabled, do these things
  } else {
    document.getElementById("pagestyle").setAttribute("href", "beauty.css");
    document.getElementById("darkTheme").setAttribute("href", "");
    document.getElementById("infoLightButton").style.display = "block";
    document.getElementById("lightFooter").style.display = "block";
    document.getElementById("darkFooter").style.display = "none";
    document.getElementById("xinfoDarkIcon").style.display = "none";
  }
}
