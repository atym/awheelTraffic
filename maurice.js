require([
    "esri/Map",
    "esri/views/MapView",
    /*require basemap gallery widget to load with page*/
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapToggle",
    "esri/layers/FeatureLayer",
    "dojo/parser",
    "dojo/domReady!"
  ],
  /*below are required to run*/
  function(Map, MapView, BasemapGallery, BasemapToggle, FeatureLayer) {

    var limits = new FeatureLayer({
      url: "https://services9.arcgis.com/E9UVIqvAicEqTOkL/arcgis/rest/services/acl2018/FeatureServer" /*url to the city boundary ArcGIS service*/

    });

    /*creates a new map variable and defines the basemap style and additional layers*/
    var map = new Map({
      basemap: "dark-gray",
      layers: [limits]
    });
    /*creates a new view and assigns it to div with specified ID, sets default parameters including where the map will be centered on load*/
    var view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 12,
      center: [-97.775462, 30.270076]
    });

    // Once the layer loads, set the view's extent to the layer's fullextent
    limits.when(function() {
      view.extent = limits.fullExtent;
    });

    var toggle = new BasemapToggle({
      titleVisible: true,
      view: view,
      nextBasemap: "hybrid",
    });
    view.ui.add(toggle, "bottom-right");

    /*creates a variable to store new BasemapGallery and defines which view to add it to*/
    /*var basemapGallery = new BasemapGallery({
    showArcGISBasemaps: true,
    map: map
    }, "basemapTab");
    basemapGallery.startup();
    /*adds a new ui element to our existing view and defines its position at the top right of the page*/
    /*view.ui.add(basemapToggle, {
      position: "top-left"
    });*/

    view.ui.move("zoom", "bottom-right"); //Move Zoom to top left

  });
