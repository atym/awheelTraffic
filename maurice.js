/**************************************************
 * WELCOME to maurice.js
 **************************************************/
/**************************************************
 * AUSTIN TRAFFIC INCIDENTS
 * by
 * Jason Bartling
 * Ian Kelly
 * Brandon Rose
 **************************************************/

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapToggle",
    "esri/layers/FeatureLayer",
    "esri/geometry/Point",
    "esri/request"
  ],

  /**************************************************
   * Create magic mapping function
   **************************************************/

  function(Map, MapView, BasemapToggle, FeatureLayer, Point, esriRequest) {

    /**************************************************
     * VARIABLES
     **************************************************/

    var limits, roads, trafficFLayer, fields, pTemplate, trafficRenderer, map, view, json;

    /**************************************************
     * Create feature for city limits boundary
     **************************************************/

    var limits = new FeatureLayer({
      url: "https://services9.arcgis.com/E9UVIqvAicEqTOkL/arcgis/rest/services/acl2018/FeatureServer"
    });

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

    /**************************************************
     * Create map and define basemap
     **************************************************/

    var map = new Map({
      basemap: "dark-gray",
      layers: [limits]
    });

    /**************************************************
     * Assign map to it's HTML container, load extent
     **************************************************/

    var view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 12,
      center: [-97.775462, 30.270076]
    });

    /**************************************************
     * Once the limits layer loads, set the view's extent to the fullextent
     **************************************************/

    limits.when(function() {
      view.extent = limits.fullExtent;
    });

    /**************************************************
     * Create basemap toggle and style it
     **************************************************/

    var toggle = new BasemapToggle({
      titleVisible: true,
      view: view,
      nextBasemap: "hybrid",
    });
    view.ui.add(toggle, "bottom-right");

    /**************************************************
     * Request the  data from data.austin when the
     * view resolves then send it to the
     * createGraphics() method when graphics are created,
     * create the layer
     **************************************************/

    view.when(function() {

      getData()
        .then(createGraphics)
        .then(createLayer);
    });

    /**************************************************
     * Request traffic incident data
     **************************************************/

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

    /**************************************************
     * Modify page elements
     **************************************************/

    view.ui.move("zoom", "bottom-right"); //Move Zoom to top left


  });
