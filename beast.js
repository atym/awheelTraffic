function openOverlay() {
  document.getElementById("fullOverlay").style.width = "100%";
  document.getElementById("overlayTeam").style.display = "block";
  document.getElementById("overlayProject").style.display = "none";
}

function closeOverlay() {
  document.getElementById("fullOverlay").style.width = "0%";
}

function teamOverlay() {
  document.getElementById("overlayTeam").style.display = "block";
  document.getElementById("overlayProject").style.display = "none";
}

function projectOverlay() {
  document.getElementById("overlayProject").style.display = "block";
  document.getElementById("overlayTeam").style.display = "none";
}

/*function openMenu(titleMenu) {
  var i;
  var x = document.getElementsByClassName("title");
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";
  }
  document.getElementById(titleMenu).style.display = "block";
}*/

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

function closeMenu() {
  document.getElementById("boxContent").style.display = "none";
  document.getElementsByClassName("tablink").style.display = "none";
}
