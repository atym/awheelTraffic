function openNav() {
  document.getElementById("fullOverlay").style.width = "100%";
  document.getElementById("overlayTeam").style.display = "block";
  document.getElementById("overlayProject").style.display = "none";
}

function closeNav() {
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

require([
  "esri/Map",
  "esri/views/MapView",
/*require basemap gallery widget to load with page*/
  "esri/widgets/BasemapGallery"
],
/*below are required to run*/
function(Map, MapView, BasemapGallery){
/*creates a new map variable and defines the basemap style and additional layers*/
  var map = new Map({
    basemap: "dark-gray",
    });
/*creates a new view and assigns it to div with specified ID, sets default parameters including where the map will be centered on load*/
  var view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 12,
    center: [-97.775462, 30.270076]
    });
/*creates a variable to store new BasemapGallery and defines which view to add it to*/
  var basemapGallery = new BasemapGallery({
    view: view
  });
/*adds a new ui element to our existing view and defines its position at the top right of the page*/
  view.ui.add(basemapGallery, {
    position: "top-left"
  });

  view.ui.move("zoom", "bottom-left");		//Move Zoom to bottom left

});
