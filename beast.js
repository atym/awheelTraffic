var activeMenu = false;

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

function validate() {
    if (document.getElementById('setBoundary').checked) {
        alert("checked");
    } else {
        alert("You didn't check it! Let me check it for you.");
    }
}

function closeTap(tablinks, evt, titleMenu, activeMenu) {
  var div1 = document.getElementById("boxContent");
  var event = evt;

  console.log(event);
  console.log(activeMenu);

    if (activeMenu == true) {
      console.log("Hello World");
      document.getElementById("boxContent").style.display = "none";
      activeMenu = false;
      console.log(activeMenu);

    }



  /*if (div1.style.display == 'block') {
      console.log(tablinks);
      console.log(titleMenu);
      console.log(evt);
  }*/

  /*else {
        document.getElementById("boxMenu").style.display = 'block';

}*/

}

function openMenu(evt, titleMenu, activeMenu) {
  var i, x, tablinks;
  x = document.getElementsByClassName("title");
  activeMenu = true;
  closeTap(tablinks, evt, titleMenu, activeMenu);
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
  /*tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
  }
  document.getElementsByClassName("tablink") - " w3-border-red";*/
  document.getElementById("boxContent").style.display = "none";
}

/*function closeMenu2() {
  var menu = document.getElementById("touchMenu");
  var menuContent = menu.innerHTML;
  console.log(menuContent);
  if (menuContent = "&#9776;") {
    document.getElementById("boxMenu").style.display = "none";
  } else {
    document.getElementById("boxMenu").style.display = "block";
  }
}*/

function showMenu() {
  var div1 = document.getElementById("boxMenu");
  var div2 = document.getElementById("boxContent");
  if (div1.style.display == 'none') {
    div1.style.display = 'block'
  } else {
    closeMenu();
    document.getElementById("boxMenu").style.display = 'none';

  }
}

function touchMenu() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  /*var z = document.getElementsByClassName("w3-third tablink w3-bottombar w3-hover-light-grey w3-padding");*/

  /*if (x <= 450) {

    /*for (i = 0; i < z.length; i++) {
      z[i].style.display = "none";
    }*/
  /*  console.log(z);
    /*document.getElementById("touchMenu").innerHTML = "&#9776;";
    document.getElementById("boxMenu").style.display = "none";
  }*/
}
