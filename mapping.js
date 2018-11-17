/**************************************************
 * WELCOME to Mapping
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
    "esri/Basemap",
    "esri/views/MapView",
    "esri/widgets/BasemapToggle",
    "esri/layers/FeatureLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/TileLayer",
    "esri/geometry/Point",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/widgets/Search",
    "esri/layers/BaseTileLayer",
    "esri/widgets/Locate",
    "esri/request"
  ],

  /**************************************************
   * Create magic mapping function
   **************************************************/

  function(Map, Basemap, MapView, BasemapToggle, FeatureLayer, VectorTileLayer, TileLayer, Point, Legend, Home, ScaleBar, Search, BaseTileLayer, Locate, esriRequest) {

    /**************************************************
     * VARIABLES
     **************************************************/

    var limits, roads, trafficFLayer, fields, pTemplate, trafficRenderer, map, view, legend, roadLayerToggle, cityLimitsLayerToggle, trafficRequestURL, baseToggle, lightRoads, darkRoads, vectorRoads, satelliteBase, satelliteReference, satellite, homeBtn, scaleBar, locateWidget, currentTraffic;

    /**************************************************
     * Create variables for vector layers
     * Combine layers into new basemap
     * Visibility is important for dark mode
     * Assign custom URL for basemapToggleButton
     **************************************************/

    lightRoads = new VectorTileLayer({
      url: "http://www.arcgis.com/sharing/rest/content/items/63c47b7177f946b49902c24129b87252/resources/styles/root.json?f=pjson",
      visible: true
    });

    darkRoads = new VectorTileLayer({
      url: "https://www.arcgis.com/sharing/rest/content/items/86f556a2d1fd468181855a35e344567f/resources/styles/root.json?f=pjson",
      visible: false
    });

    vectorRoads = new Basemap({
      baseLayers: [lightRoads, darkRoads],
      title: "Streets",
      id: "streets",
      thumbnailUrl: "./img/streets_day_map.jpg"
    });

    /**************************************************
     * Create variables for satellite base and Reference
     * New basemap with those layers combined
     * order of array determines stacking order
     * Assign custom URL for basemapToggleButton
     **************************************************/

    satelliteBase = new TileLayer({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    });

    satelliteReference = new VectorTileLayer({
      url: "http://www.arcgis.com/sharing/rest/content/items/30d6b8271e1849cd9c3042060001f425/resources/styles/root.json?f=pjson"
    });

    satellite = new Basemap({
      baseLayers: [satelliteBase, satelliteReference],
      title: "Satellite",
      id: "satellite",
      thumbnailUrl: "./img/imagery_hybrid.jpg"
    });

    /**************************************************
     * Create feature for city limits boundary
     * Hide this layer from view
     * CURRENTLY CONTROLLER OF DEFAULT EXTENT
     * DEMOTE ORDER WHEN EXTENT UPDATE COMPLETE
     **************************************************/

    limits = new FeatureLayer({
      url: "https://services9.arcgis.com/E9UVIqvAicEqTOkL/arcgis/rest/services/acl2018/FeatureServer",
      visible: false
    });

    // *******************************************************
     // Custom tile layer class code
     // Create a subclass of BaseTileLayer
     // *******************************************************

     var TileLayer = BaseTileLayer.createSubclass({
       properties: {
         urlTemplate: null

       },

       // generate the tile url for a given level, row and column
       getTileUrl: function(level, row, col) {
         return this.urlTemplate.replace("[z]", level).replace("[x]",
           col).replace("[y]", row);
       },

       // This method fetches tiles for the specified level and size.
       // Override this method to process the data returned from the server.
       fetchTile: function(level, row, col) {

         // call getTileUrl() method to construct the URL to tiles
         // for a given level, row and col provided by the LayerView
         var url = this.getTileUrl(level, row, col);

         // request for tiles based on the generated url
         return esriRequest(url, {
             responseType: "image"
           })
           .then(function(response) {
             // when esri request resolves successfully
             // get the image from the response
             var image = response.data;
             var width = this.tileInfo.size[0];
             var height = this.tileInfo.size[0];

             // create a canvas with 2D rendering context
             var canvas = document.createElement("canvas");
             var context = canvas.getContext("2d");
             canvas.width = width;
             canvas.height = height;



             // Draw the blended image onto the canvas.
             context.drawImage(image, 0, 0, width, height);

             return canvas;
           }.bind(this));
       }
     });

     // *******************************************************
     // Start of JavaScript application
     // *******************************************************

     // Create a new instance of the TintLayer and set its properties
     var currentTrafficTiles = new TileLayer({
       urlTemplate: "https://1.traffic.maps.api.here.com/maptile/2.1/flowtile/newest/normal.night/[z]/[x]/[y]/256/png8?app_id=1ig2foSCCXslmH8Zh58J&app_code=tjpaSyhSoPkLD-eokE66VQ",
      visible: false
     });

    /**************************************************
     * Create map and define basemap
     * Select layers to display on basemap
     **************************************************/

    map = new Map({
      basemap: vectorRoads,
      layers: [limits, currentTrafficTiles]
    });

    /**************************************************
     * Assign map to it's HTML container, load extent
     **************************************************/

    view = new MapView({
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

    baseToggle = new BasemapToggle({
      titleVisible: true,
      view: view,
      nextBasemap: satellite
    });

    homeBtn = new Home({
      view: view
    });

    locateWidget = new Search({
      view: view
    }, "esriLocate");

    var locateBtn = new Locate({
        view: view
      });

    /**************************************************
     * Load initial batch of traffic data from COA
     * JSON data over Socrata API
     **************************************************/

    trafficRequestURL = "https://data.austintexas.gov/resource/r3af-2r8x.json" +
      "?$where=traffic_report_status='ACTIVE'" +
      "&$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM" +
      "&$limit=3000";

    /**************************************************
     * Define the specification for each field to create
     * in the layer
     **************************************************/

    fields = [{
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

    pTemplate = {
      title: "<strong>{issueReported}</strong>",
      content: "Location: {address}<br> Time: {statusDateTime}"
    };

    /**************************************************
     * Define the renderer for symbolizing incidents
     **************************************************/

    trafficRenderer = {
      type: "unique-value",
      field: "status", // autocasts as new SimpleRenderer()
      defaultSymbol: {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        size: 10,
        color: "#FF4000"
      },
      uniqueValueInfos: [{
        value: "ACTIVE",
        symbol: {
          type: "simple-marker",
          size: 13,
          color: "red"
        }
      }, {
        value: "ARCHIVED",
        symbol: {
          type: "simple-marker",
          size: 10,
          color: "yellow"
        }
      }]
    };

    /**************************************************
     * Request the  data from data.austin when the
     * view resolves then send it to the
     * createGraphics() method when graphics are created,
     * create the layer
     **************************************************/

    view.when(function() {

      getData()
        .then(createGraphics)
        .then(createLayer)
        .then(createLegend);

      populateSearch();
    });

    /**************************************************
     * Request traffic incident data
     **************************************************/

    function getData() {

      return esriRequest(trafficRequestURL, {
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
      return json.map(function(feature, i) {
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

    function createLegend(layer) {
      // if the legend already exists, then update it with the new layer
      if (legend) {
        legend.layerInfos = [{
          layer: layer,
          title: "Status"
        }];
      } else {
        legend = new Legend({
          view: view,
          layerInfos: [{
            layer: layer,
            title: "Status"
          }]
        }, "esriLegend");
      }
    }

    /**********************************************************************
     * Dynamically populate Search tab with form elements for incident types
     **********************************************************************/
    function populateSearch() {

      var html = "";
      var incidentSelect = document.getElementById("incidentTypes");

      var url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&$query=SELECT%20DISTINCT%20issue_reported";

      esriRequest(url, {
        responseType: "json"
      }).then(function(response) {
        var json = response.data;

        for (i in json) {
          /*html += "<p>";
          html += json[i].issue_reported;
          html += "</p>";*/
          var option = document.createElement("option");
          option.text = json[i].issue_reported;
          option.value = json[i].issue_reported;
          incidentSelect.add(option);
          console.log(json[i].issue_reported);

        };

        //document.getElementById("incidentList").innerHTML = html;
      });
    }

    /**************************************************
     * Create custom tile layer for live traffic conditions
     * Refreshes request with z,x,y for current view
     * Requires 2 IDs for request in URL
     **************************************************/



     scaleBar = new ScaleBar({
     	view: view,
     	unit: "dual"

		});

    /*****************************************************************
     * The visible property on the layer can be used to toggle the
     * layer's visibility in the view. When the visibility is turned off
     * the layer is still part of the map, which means you can access
     * its properties and perform analysis even though it isn't visible.
     *******************************************************************/

    if (localStorage.getItem("mode") == "dark") {
      darkRoads.visible = true;
      lightRoads.visible = false;
    }

    darkModeToggle = document.getElementById("darkMode");
    cityLimitsLayerToggle = document.getElementById("cityLimitsLayer");
  currentTrafficToggle = document.getElementById("currentTraffic");
    darkModeToggle.addEventListener("change", function() {
      if (darkModeToggle.checked) {
        darkRoads.visible = true;
        lightRoads.visible = false;
      } else {
        lightRoads.visible = true;
        darkRoads.visible = false;
      }
    });
    cityLimitsLayerToggle.addEventListener("change", function() {
      limits.visible = cityLimitsLayerToggle.checked;
    });


        currentTrafficToggle.addEventListener("change", function() {
          currentTrafficTiles.visible = currentTrafficToggle.checked;
        });

    /**************************************************
     * ADD and MODIFY map widgets
     **************************************************/

    view.ui.move("zoom", "bottom-right"); //Move Zoom
    view.ui.add(baseToggle, "bottom-right"); //Add Basemap toggle
    view.ui.add(homeBtn, "bottom-left"); // Add the home button
    view.ui.add(scaleBar, "top-right");
    view.ui.add(locateBtn, {
        position: "bottom-left"
      });



  });
