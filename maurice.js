require([
    "esri/Map",
    "esri/views/MapView",
    /*require basemap gallery widget to load with page*/
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapToggle",
    "esri/layers/FeatureLayer",
    "esri/geometry/Point",
    "esri/request"
  ],
  /*below are required to run*/
  function(Map, MapView, BasemapGallery, BasemapToggle, FeatureLayer, Point, esriRequest) {

    var limits = new FeatureLayer({
      url: "https://services9.arcgis.com/E9UVIqvAicEqTOkL/arcgis/rest/services/acl2018/FeatureServer" /*url to the city boundary ArcGIS service*/

    });
    var trafficFLayer;
    /**************************************************
     * Define the specification for each field to create
     * in the layer
     **************************************************/

    var fields = [{
      name: "ObjectID",
      alias: "ObjectID",
      type: "oid"
    }, {
      name: "address",
      alias: "address",
      type: "string"
    }, {
      name: "issueReported",
      alias: "issueReported",
      type: "string"
    }, {
      name: "latitude",
      alias: "latitude",
      type: "number"
    }, {
      name: "longitude",
      alias: "longitude",
      type: "number"
    }, {
      name: "status",
      alias: "status",
      type: "string"
    }, {
      name: "statusDateTime",
      alias: "statusDateTime",
      type: "string"
    }];

    /**************************************************
     * Define the popup for info about incidents
     **************************************************/
    var pTemplate = {
      title: "<strong>{issueReported}</strong>",
      content: "Location: {address}<br> Time: {statusDateTime}"
    };
    /**************************************************
     * Define the renderer for symbolizing incidents
     **************************************************/

    var trafficRenderer = {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 10,
        color: "#FF4000"
      }
    };

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

    //Once the layer loads, set the view's extent to the layer's fullextent
    limits.when(function() {
      view.extent = limits.fullExtent;
    });

    var toggle = new BasemapToggle({
      titleVisible: true,
      view: view,
      nextBasemap: "hybrid",
    });
    view.ui.add(toggle, "bottom-right");

    // Request the  data from data.austin when the view resolves
    // then send it to the createGraphics() method
    // when graphics are created, create the layer
    view.when(function() {

      getData()
        .then(createGraphics)
        .then(createLayer);
    });
    // Request the traffic incident data
    function getData() {

      var url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&traffic_report_status=ACTIVE";
      return esriRequest(url, {
        responseType: "json"
      });
    };

    /**************************************************
     * Create graphics with returned json data
     **************************************************/

    function createGraphics(response) {
      // raw JSON data
      var json = response.data;
      // Create an array of Graphics from each JSON feature
      return retFeatures = json.map(function(feature, i) {
        return {
          type: "point",
          geometry: new Point({
            x: json[i].longitude,
            y: json[i].latitude
          }),
          // select only the attributes you care about
          attributes: {
            ObjectID: i,
            address: json[i].address,
            issueReported: json[i].issue_reported,
            statusDateTime: json[i].traffic_report_status_date_time,
            status: json[i].traffic_report_status,
            latitude: json[i].latitude,
            longitutde: json[i].longitude
          }
        };
      });
    };

    /**************************************************
     * Create a FeatureLayer with the array of graphics
     **************************************************/

    function createLayer(graphics) {
      trafficFLayer = new FeatureLayer({
        source: graphics, // autocast as an array of esri/Graphic
        fields: fields,
        renderer: trafficRenderer,
        objectIdField: "ObjectID",
        popupTemplate: pTemplate
      });

      map.add(trafficFLayer);
      return trafficFLayer;
    }

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
