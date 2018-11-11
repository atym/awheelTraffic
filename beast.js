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

function closeMenu(evt, titleMenu) {
  var i, x, tablinks;
  x = document.getElementsByClassName("title");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
  }
  document.getElementsByClassName("tablink") - " w3-border-red";
  document.getElementById("boxContent").style.display = "none";
  document.getElementById("boxMenu").style.display = "none";
}

function showMenu() {
  document.getElementById("boxMenu").style.display = "block";
}

function touchMenu() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  if (x <= 450) {
    document.getElementById("touchMenu").innerHTML = "&#9776;";
    document.getElementById("boxMenu").style.display = "none";
  }
}
