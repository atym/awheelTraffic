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
 * Checkbox functionalities
 * City Limits and Road Network
 **************************************************/

function validate() {
  if (document.getElementById('setBoundary').checked) {
    alert("checked");
  } else {
    alert("You didn't check it! Let me check it for you.");
  }
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
