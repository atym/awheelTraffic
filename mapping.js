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
    "esri/widgets/Expand",
    "esri/widgets/BasemapToggle",
    "esri/layers/FeatureLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/TileLayer",
    "esri/geometry/Point",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/widgets/Search",
    "esri/widgets/Fullscreen",

    "esri/layers/BaseTileLayer",
    "esri/widgets/Locate",
    "esri/request",
    "dojo/dom",
    "dojo/on",
    "esri/core/promiseUtils",
    "esri/geometry/geometryEngine",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
  ],

  /**************************************************
   * Create magic mapping function
   **************************************************/

  function(Map, Basemap, MapView, Expand, BasemapToggle, FeatureLayer, VectorTileLayer,
    TileLayer, Point, Legend, Home, ScaleBar, Search, Fullscreen,
    BaseTileLayer, Locate, esriRequest, dom, on, promiseUtils, geometryEngine,
    Graphic, GraphicsLayer) {

    document.getElementById("activitySpinner").style.display = "block";
    /**************************************************
     * VARIABLES
     **************************************************/

    var limits, roads, trafficFLayer, fields, pTemplate, trafficRenderer,
      trafficHeatRenderer, renderToggle, map, view, legend, roadLayerToggle,
      cityLimitsLayerToggle, trafficRequestURL, baseToggle, lightRoads,
      darkRoads, vectorRoads, satelliteBase, satelliteReference, satellite,
      homeBtn, scaleBar, locateWidget, currentTraffic, uniqueValueRenderer,
      classRenderer, myChart;
    var renderHeatStatus = false;
    var fromSearch = false;
    var uniqueValuesColor = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854'];
    var resultsFL;
    var symbolSize = function() {
      if (getDevice() == "mobile") {
        return 18;
      } else {
        return 13;
      }
    }
    /***************************************
     * Object with predefined incident classes
     * will need to update if data changes
     ****************************************/

    var incidentClasses = [{
        class: "Crash",
        issueReported: [
          "AUTO/ PED",
          "BOAT ACCIDENT",
          "COLLISION",
          "COLLISION/PRIVATE PROPERTY",
          "COLLISION WITH INJURY",
          "COLLISN / FTSRA",
          "COLLISN/ LVNG SCN",
          "Crash Service",
          "Crash Urgent",
          "FLEET ACC/ INJURY",
          "TRAFFIC FATALITY"
        ]
      },
      {
        class: "Hazard",
        issueReported: [
          "Traffic Hazard",
          "Traffic Impediment",
          "TRFC HAZD/ DEBRIS",
          "HIGH WATER",
          "ICY ROADWAY"
        ]
      },
      {
        class: "Advisory",
        issueReported: [
          "BLOCKED DRIV/ HWY",
          "LOOSE LIVESTOCK",
          "N / HZRD TRFC VIOL",
          "VEHICLE FIRE",
          "zSTALLED VEHICLE"
        ]
      }
    ];
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
      alias: "Incident Reported",
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
      content: "Location: {address}<br> Date: {statusDateTime:calculateDate}<br> Time: {statusDateTime:calculateTime}"
    };

    /**************************************************
     * Create variables for vector layers
     * Combine layers into new basemap
     * Visibility is important for dark mode
     * Assign custom URL for basemapToggleButton
     **************************************************/

    lightRoads = new VectorTileLayer({
      url: "http://www.arcgis.com/sharing/rest/content/items/63c47b7177f946b49902c24129b87252/resources/styles/root.json",
      visible: true,
      title: "lightRoads"
    });

    darkRoads = new VectorTileLayer({
      url: "https://www.arcgis.com/sharing/rest/content/items/86f556a2d1fd468181855a35e344567f/resources/styles/root.json",
      visible: false,
      title: "darkRoads"
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
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      title: "satelliteBase"
    });

    satelliteReference = new VectorTileLayer({
      url: "http://www.arcgis.com/sharing/rest/content/items/30d6b8271e1849cd9c3042060001f425/resources/styles/root.json"
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

    /**************************************************
     * Create layer for traffic data
     **************************************************/

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

    /**************************************************
     * Create custom tile layer for live traffic conditions
     * Refreshes request with z,x,y for current view
     * Requires 2 IDs for request in URL
     **************************************************/

    var lightTrafficTiles = new TileLayer({
      urlTemplate: "https://1.traffic.maps.api.here.com/maptile/2.1/flowtile/newest/normal.day/[z]/[x]/[y]/256/png8?app_id=1ig2foSCCXslmH8Zh58J&app_code=tjpaSyhSoPkLD-eokE66VQ",
      visible: false,
      title: "lightTraffic",
      opacity: 0.5
    });

    var darkTrafficTiles = new TileLayer({
      urlTemplate: "https://1.traffic.maps.api.here.com/maptile/2.1/flowtile/newest/normal.night/[z]/[x]/[y]/256/png8?app_id=1ig2foSCCXslmH8Zh58J&app_code=tjpaSyhSoPkLD-eokE66VQ",
      visible: false,
      title: "darkTraffic",
      opacity: 0.5

    });

    /**************************************************
     * Create map and define basemap
     * Select layers to display on basemap
     **************************************************/

    map = new Map({
      basemap: vectorRoads,
      layers: [limits, lightTrafficTiles, darkTrafficTiles]
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
      nextBasemap: satellite,
      container: document.createElement("expandWidget")
    });

    /**************************************************
     * Create more widgets
     **************************************************/

    var btExpand = new Expand({
      expandIconClass: "esri-icon-collection",
      view: view,
      autoCollapse: true,
      content: baseToggle
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

    scaleBar = new ScaleBar({
      view: view,
      unit: "dual"
    });

    view.watch('updating', function(evt) {
      if (evt === true) {
        document.getElementById("activitySpinner").style.display = "block";
      } else {
        document.getElementById("activitySpinner").style.display = "none";
      }
    })

    var crashChart = 0;
    var hazardChart = 0;
    var advisoryChart = 0;

    /**************************************************
     * take results from intersection of buffer and
     *    most recent records to generate Chart
     * loop through attribute strings and Count
     *  each incident type occurance, aggregate by class
     **************************************************/

    function populateChart(results) {
      var resultsInfo = results.features;
      document.getElementById("esriLegend").style.display = "none";
      document.getElementById("myChart").style.display = "block";
      document.getElementById("bufferResults").style.display = "block";

      var autoPed = 0;
      var driveWay = 0;
      var boatAccident = 0;
      var collision = 0;
      var privateProperty = 0;
      var injuryCollision = 0;
      var ftsra = 0;
      var leaveScene = 0;
      var crashService = 0;
      var crashUrgent = 0;
      var fleetInjury = 0;
      var highWater = 0;
      var icyRoadway = 0;
      var looseLivestock = 0;
      var trafficViolation = 0;
      var trafficFatality = 0;
      var trafficHazard = 0;
      var trafficImpediment = 0;
      var trafficDebris = 0;
      var vehicleFire = 0;
      var stallVehicle = 0;

      for (var i = 0; i < results.features.length; i++) {
        var issuesChart = resultsInfo[i].attributes.issueReported;
        switch (issuesChart) {
          case "AUTO/ PED":
            autoPed += 1;
            break;

          case "BLOCKED DRIV/ HWY":
            driveWay += 1;
            break;

          case "BOAT ACCIDENT":
            boatAccident += 1;
            break;

          case "COLLISION":
            collision += 1;
            break;

          case "COLLISION/PRIVATE PROPERTY":
            privateProperty += 1;
            break;

          case "COLLISION WITH INJURY":
            injuryCollision += 1;
            break;

          case "COLLISN / FTSRA":
            ftsra += 1;
            break;

          case "COLLISN/ LVNG SCN":
            leaveScene += 1;
            break;

          case "Crash Service":
            crashService += 1;
            break;

          case "Crash Urgent":
            crashUrgent += 1;
            break;

          case "FLEET ACC/ INJURY":
            fleetInjury += 1;
            break;

          case "HIGH WATER":
            highWater += 1;
            break;

          case "ICY ROADWAY":
            icyRoadway += 1;
            break;

          case "LOOSE LIVESTOCK":
            looseLivestock += 1;
            break;

          case "N / HZRD TRFC VIOL":
            trafficViolation += 1;
            break;

          case "TRAFFIC FATALITY":
            trafficFatality += 1;
            break;

          case "Traffic Hazard":
            trafficHazard += 1;
            break;

          case "Traffic Impediment":
            trafficImpediment += 1;
            break;

          case "TRFC HAZD/ DEBRIS":
            trafficDebris += 1;
            break;

          case "VEHICLE FIRE":
            vehicleFire += 1;
            break;

          case "zSTALLED VEHICLE":
            stallVehicle += 1;
            break;

        }
      }

      crashChart = autoPed + boatAccident + collision + privateProperty + injuryCollision + ftsra + leaveScene + crashService + crashUrgent + fleetInjury + trafficFatality

      hazardChart = trafficHazard + trafficImpediment + trafficDebris + highWater + icyRoadway

      advisoryChart = driveWay + looseLivestock + trafficViolation + vehicleFire + stallVehicle

      dom.byId("totalAutoPed").innerHTML = autoPed;
      dom.byId("totalBlockDrive").innerHTML = driveWay;
      dom.byId("totalBoat").innerHTML = boatAccident;
      dom.byId("totalCollision").innerHTML = collision;
      dom.byId("totalPrivate").innerHTML = privateProperty;
      dom.byId("totalInjury").innerHTML = injuryCollision;
      dom.byId("totalFtsra").innerHTML = ftsra;
      dom.byId("totalLeave").innerHTML = leaveScene;
      dom.byId("totalService").innerHTML = crashService;
      dom.byId("totalUrgent").innerHTML = crashUrgent;
      dom.byId("totalFleet").innerHTML = fleetInjury;
      dom.byId("totalWater").innerHTML = highWater;
      dom.byId("totalIce").innerHTML = icyRoadway;
      dom.byId("totalLivestock").innerHTML = looseLivestock;
      dom.byId("totalNonHzrd").innerHTML = trafficViolation;
      dom.byId("totalFatal").innerHTML = trafficFatality;
      dom.byId("totalHazard").innerHTML = trafficHazard;
      dom.byId("totalImpediment").innerHTML = trafficImpediment;
      dom.byId("totalDebris").innerHTML = trafficDebris;
      dom.byId("totalFire").innerHTML = vehicleFire;
      dom.byId("totalStall").innerHTML = stallVehicle;


      /**************************************************
       * Create doughnut chart with Chart.js library
       **************************************************/

      var ctx = document.getElementById("myChart");
      if(!(typeof myChart === "undefined")){
        myChart.destroy();
      }

      myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ["Crash", "Hazard", "Advisory"],
          datasets: [{
            label: 'Incident Class',
            data: [crashChart, hazardChart, advisoryChart],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(54, 162, 235, 0.5)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 2
          }]
        },
      });

    }


    /******************************************************
     * Create circle around search result once complete
     * Author:  JB
     * Helpful example:  https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=featurelayer-query
     ******************************************************/

    locateWidget.on("select-result", function(event) {

      var resultGeometry = event.result.feature.geometry;

      resultsLayer = new GraphicsLayer();

      var bufferRadius = dom.byId("bufferRadius").value;
      dom.byId("totalTable").innerHTML = bufferRadius;
      var zoomLevel;

      // Base custom zoom level on bufferRadius parameter
      switch (bufferRadius) {
        case "1":
          zoomLevel = 13;
          break;
        case "4":
          zoomLevel = 11;
          break;
        default:
          zoomLevel = 12;
      }

      // Set new custom zoom level and zoom to it
      var newTarget = {
        geometry: resultGeometry,
        zoom: zoomLevel
      };

      view.goTo(newTarget);

      // Create geometry around the result point with a predefined radius
      var pointBuffer = geometryEngine.geodesicBuffer(resultGeometry, bufferRadius, "miles");

      bufferGraphic = new Graphic({
        geometry: pointBuffer,
        symbol: {
          type: "simple-fill",
          color: [140, 140, 222, 0.3],
          outline: {
            color: [0, 0, 0, 0.5],
            width: 2
          }
        }
      });

      // Add the buffer to the view
      view.graphics.add(bufferGraphic);

      // Create searchURL and limit to latest 10,000 incidents
      searchURL = "https://data.austintexas.gov/resource/r3af-2r8x.json" +
        "?$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&$limit=10000&$order=traffic_report_status_date_time DESC"

      getData(searchURL)
        .then(createGraphics)
        // Create layer from graphics without adding to map
        .then(function(graphics) {
          trafficFLayer = new FeatureLayer({
            source: graphics, // autocast as an array of esri/Graphic
            fields: fields,
            objectIdField: "ObjectID",
            popupTemplate: pTemplate,
            title: "trafficIncidents"
          });

          return trafficFLayer;
        })
        // Query feature traffic feature layer for incidents within the buffer
        .then(function() {
          var query = trafficFLayer.createQuery();
          query.geometry = pointBuffer;
          query.spatialRelationship = "intersects";

          return trafficFLayer.queryFeatures(query);

        })


        // Create graphics from spatial query result
        .then(function(results) {

          var resultsReturned = Object.keys(results.features).length;

          // send spatial query result to chart function
          populateChart(results);

          dom.byId("bufferResults").innerHTML = resultsReturned;
          dom.byId("totalLocate").innerHTML = resultsReturned;

          var features = results.features.map(function(graphic) {
            graphic.symbol = {
              type: "simple-marker",
              //style: "diamond",
              size: symbolSize(),
              color: "orange"
            };

            return graphic;
          });

		  // Create empty array for result graphics
		  graphicsArray=[];

		  // Loop through feature results to add each element to the graphicsArray
		  features.forEach(function(feature){
			  graphicsArray.push({
				  geometry: feature.geometry,
				  symbol: {type: "simple-marker"},
				  attributes: feature.attributes

			  });

		  });

		  // Create the results feature layer referencing the graphicsArray and fields for the dataset
		  resultsFL = new FeatureLayer({
			  source: graphicsArray,
			  fields: fields,
			  objectIdField: "ObjectID",
              popupTemplate: pTemplate,
			  title: "bufferResults",
			  renderer: classRenderer
		  });

		  map.add(resultsFL);

		  return resultsFL;

        })
        .then(createLegend)
        //Catch any of the errors that were created from the previous callback functions
        .catch(function(error) {
          console.log('One of the promises in the chain was rejected! Message: ', error);
        });

    });

    // Reset map when a new search starts
    locateWidget.on("search-start", function(event) {
      view.graphics.removeAll();
      map.remove(trafficFLayer);
      map.remove(resultsFL);
      dom.byId("bufferResults").innerHTML = "";

    });

    // Remove the buffer if the search is cleared
    locateWidget.on("search-clear", function(event) {
      view.graphics.removeAll();
      map.remove(trafficFLayer);
      map.remove(resultsFL);
      dom.byId("bufferResults").innerHTML = "";
      document.getElementById("myChart").style.display = "none";
      document.getElementById("table").style.display = "none";
      document.getElementById("esriLegend").style.display = "block";
    });

    /**************************************************
     * Custom functions to split field that contains
     *  combined date and time to display in popup
     * Date is converted to Month Day, Year
     * Time is converted to 12 hour format
     **************************************************/

    calculateDate = function(value, key, data) {
      var whole = data.statusDateTime;
      var res = whole.split("T");
      var pieces = res[0].split("-");
      var year = pieces[0];

      if (pieces[1] == 1) {
        var month = "January";
      } else if (pieces[1] == 2) {
        var month = "February";
      } else if (pieces[1] == 3) {
        var month = "March";
      } else if (pieces[1] == 4) {
        var month = "April";
      } else if (pieces[1] == 5) {
        var month = "May";
      } else if (pieces[1] == 6) {
        var month = "June";
      } else if (pieces[1] == 7) {
        var month = "July";
      } else if (pieces[1] == 8) {
        var month = "August";
      } else if (pieces[1] == 9) {
        var month = "September";
      } else if (pieces[1] == 10) {
        var month = "October";
      } else if (pieces[1] == 11) {
        var month = "November";
      } else if (pieces[1] == 12) {
        var month = "December";
      }

      if (pieces[2] < 10) {
        var single = pieces[2].split("0");
        var day = single[1];
      } else if (pieces[2] > 9) {
        var day = pieces[2];
      }
      var date = month + " " + day + ", " + year;
      return date;
    }

    calculateTime = function(value, key, data) {
      var whole = data.statusDateTime;
      var res = whole.split("T");
      var pieces = res[1].split(":");
      var minutes = pieces[1];

      if (pieces[0] > 12) {
        var hour = pieces[0] - 12;
        var mod = " P.M."
      } else if (pieces[0] == 12) {
        var hour = 12;
        var mod = " P.M."
      } else if (pieces[0] == 0) {
        var hour = 12;
        var mod = " A.M."
      } else if (pieces[0] == 11 || pieces[0] == 10) {
        var hour = pieces[0];
        var mod = " A.M."
      } else {
        var remove = pieces[0].split("0");
        var hour = remove[1];
        var mod = " A.M."
      }
      var time = hour + ":" + minutes + mod;
      return time;
    }

    /**************************************************
     * Define the renderers for symbolizing incidents
     **************************************************/

    classRenderer = {
      type: "unique-value",
      legendOptions: {
        title: "Incident Class"
      },
      valueExpression: 'var incidentClasses =' + JSON.stringify(incidentClasses) +
        ';var i = 0, j = 0;for (i in incidentClasses) {for ' +
        '(j in incidentClasses[i].issueReported) {if ' +
        '(incidentClasses[i].issueReported[j] == ' +
        '$feature.issueReported) {return ' +
        'incidentClasses[i].class;};};};',
      uniqueValueInfos: [{
          value: "Crash",
          symbol: {
            type: "simple-marker",
            size: symbolSize(),
            color: "red"
          }
        },
        {
          value: "Hazard",
          symbol: {
            type: "simple-marker",
            size: symbolSize(),
            color: "yellow"
          }
        },
        {
          value: "Advisory",
          symbol: {
            type: "simple-marker",
            size: symbolSize(),
            color: "#3389ff"
          }
        }
      ]
    };

    trafficRenderer = {
      type: "unique-value",
      field: "status", // autocasts as new SimpleRenderer()
      uniqueValueInfos: [{
        value: "ACTIVE",
        symbol: {
          type: "simple-marker",
          size: symbolSize(),
          color: "red"
        }
      }, {
        value: "ARCHIVED",
        symbol: {
          type: "simple-marker",
          size: symbolSize(),
          color: "yellow"
        }
      }]
    };

    trafficHeatRenderer = {
      type: "heatmap",
      colorStops: [{
          ratio: 0,
          color: "rgba(255, 255, 255, 0)"
        },
        {
          ratio: 0.2,
          color: "rgba(255, 255, 255, 1)"
        },
        {
          ratio: 0.5,
          color: "rgba(255, 140, 0, 1)"
        },
        {
          ratio: 0.8,
          color: "rgba(255, 140, 0, 1)"
        },
        {
          ratio: 1,
          color: "rgba(255, 0, 0, 1)"
        }
      ],
      maxPixelIntensity: 25,
      minPixelIntensity: 0
    };

    /**************************************************
     * Generate unique values renderer based on user
     * selected incident types
     ***************************************************/
    function generateUniqueRenderer() {
      uniqueValueRenderer = {
        type: "unique-value",
        field: "issueReported", // autocasts as new SimpleRenderer()
        uniqueValueInfos: []
      };

      var dataClasses = document.getElementById("incidentTypes").options;
      var usrSelected = [];
      for (var i = 0; i < dataClasses.length; i++) {
        if (dataClasses[i].selected) {
          usrSelected.push(dataClasses[i].value);
        }
      }
      for (var i = 0; i < usrSelected.length; i++) {
        uniqueValueRenderer.uniqueValueInfos.push({
          value: usrSelected[i],
          symbol: {
            type: "simple-marker",
            size: symbolSize(),
            color: uniqueValuesColor[i]
          }
        })
      };
      return (uniqueValueRenderer);
    };

    /**************************************************
     * Check width of device display and assign value
     *  to variable based on device type
     **************************************************/

    function getDevice() {

      w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;

      if (x <= 450) {
        return "mobile";
      } else {
        return "other";
      }
    }

    /**************************************************
     * Request traffic incident data
     **************************************************/

    function getData(jsonURL) {

      return esriRequest(jsonURL, {
        responseType: "json"
      });
    };

    /*********************************************************
     *  Add query parameters to JSON request and redisplay map
     *  Search tab in toolBox
     *  Function author:  JB
     *********************************************************/

    function runSearch() {
      document.getElementById("esriLegend").style.display = "block";
      document.getElementById("myChart").style.display = "none";
      document.getElementById("bufferResults").style.display = "none";
      document.getElementById("table").style.display = "none";

      view.popup.close();

      //Get current date
      var now = new Date();

      //Use current date to get current time in milliseconds
      var today = now.getTime();

      var millisecondsInDay = 86400000;

      //Parameter for amount of days to subtract from current date
      var days = dom.byId("daysFromDate").value;

      // Make sure a number has been entered for days to search by
      if (days > 0 == false) {

        alert("You must enter a number for the days to search by.");

        return;
      } else if (days > 365) {
        alert("Please enter a number that is 365 or less.");
        return;
      }
      //var incidentTypes = dom.byId("incidentTypes").value;

      var incidentTypes = [];
      var incidentTypesString = "(";

      // Get array of dom options properties for the select list
      var options = dom.byId("incidentTypes").options;

      // Make sure at least one incident type is selected
      if (options.selectedIndex == -1) {
        alert("You must select at least one incident type.");

        return;
      }

      // Add all selected elements to the incidentTypes array
      for (var i = 0; i < options.length; i++) {
        opt = options[i];

        if (opt.selected) {
          incidentTypes.push(opt.value);
        }
      }

      // Populate set of incidents with commas between them for the SQL statement
      for (var i = 0; i < incidentTypes.length; i++) {
        if (i < incidentTypes.length - 1) {
          incidentTypesString += "'" + incidentTypes[i] + "'" + ",";
        } else {
          incidentTypesString += "'" + incidentTypes[i] + "'";
        }
      }

      //Close set of incidents
      incidentTypesString += ")";

      //Multiply the number of days by milliseconds to get time in milliseconds to subtract from current time
      var timeoffset = days * millisecondsInDay;

      var queryTime = today - timeoffset;

      //Create new date object with adjusted date for query using time in milliseconds
      var queryDate = new Date(queryTime);

      //Get different date parts to form query date string
      var queryDateYYYY = queryDate.getFullYear();

      var queryDateMM = queryDate.getMonth() + 1;

      var queryDateDD = queryDate.getDate();

      var queryDateString = queryDateYYYY + "-" + queryDateMM + "-" + queryDateDD;

      /*var searchURL = "https://data.austintexas.gov/resource/r3af-2r8x.json" +
      "?$where=traffic_report_status_date_time>"+"'"+queryDateString+"'"+
      " AND issue_reported="+"'"+incidentTypes+"'"+
      "&$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM";*/

      var searchURL = "https://data.austintexas.gov/resource/r3af-2r8x.json" +
        "?$where=traffic_report_status_date_time>" + "'" + queryDateString + "'" +
        " AND issue_reported IN " + incidentTypesString +
        "&$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&$limit=100000";

      //Remove the previous trafficFLayer before attempting to display the query results
      map.remove(trafficFLayer);

      // Remove any locate results that still exist
      view.graphics.removeAll();
	  map.remove(resultsFL);
      locateWidget.clear();

      fromSearch = true;

      getData(searchURL)
        .then(createGraphics)
        .then(createLayer)
        .then(createLegend)
        //Catch any of the errors that were created from the previous callback functions
        .catch(function(error) {
          console.log('One of the promises in the chain was rejected! Message: ', error);
        });

    }
    /**************************************************
     * Create graphics with returned json data
     **************************************************/

    function createGraphics(response) {
      // raw JSON data
      var json = response.data;
      recordsReturned = Object.keys(json).length;

      // Display the amount of results returned
      dom.byId("numRecords").innerHTML = recordsReturned;

      // Create an array of Graphics from each JSON feature
      // Check to see that the query returned results before trying to create the graphics object JB
      if (recordsReturned > 0) {
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
      }
      // Reject the promise since no records were returned with the specified query JB
      else {
        return promiseUtils.reject(new Error("No records to display"));
      }
    };

    /**************************************************
     * Create a FeatureLayer with the array of graphics
     **************************************************/

    function createLayer(graphics) {
      trafficFLayer = new FeatureLayer({
        source: graphics, // autocast as an array of esri/Graphic
        fields: fields,
        objectIdField: "ObjectID",
        popupTemplate: pTemplate,
        title: "Traffic Incidents"
      });

      if (renderHeatStatus) {
        trafficFLayer.renderer = trafficHeatRenderer;
        trafficFLayer.opacity = 0.75;
      } else if (fromSearch) {
        trafficFLayer.renderer = generateUniqueRenderer();
      } else {
        trafficFLayer.renderer = classRenderer;
        trafficFLayer.opacity = 1;
      };

      try {
        map.add(trafficFLayer);

      } catch (error) {
        return
      };

      // Reset the mapview and extent according to trafficFLayer data JB
      trafficFLayer.when(function() {

        view.goTo({
          target: view.center,
          extent: trafficFLayer.extent,
          zoom: 10
        });
      });

      return trafficFLayer;
    }

    /**************************************************
     * Create legend in legend div of toolBox
     **************************************************/

    function createLegend(layer) {
      // if the legend already exists, then update it with the new layer
      if (legend) {
        legend.layerInfos = [{
          layer: layer
        }];
      } else {
        legend = new Legend({
          view: view,
          layerInfos: [{
            layer: layer
          }]
        }, "esriLegend");
      }
    }

    /*******************************************
     * Dynamically populate Search tab
     * with form elements for incident types
     *
     * Function author:  JB
     *******************************************/

    function populateSearch() {

      var html = "";
      var incidentSelect = document.getElementById("incidentTypes");

      var url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&$query=SELECT%20DISTINCT%20issue_reported";

      esriRequest(url, {
        responseType: "json"
      }).then(function(response) {
        var json = response.data;

        for (i in json) {

          var option = document.createElement("option");
          option.text = json[i].issue_reported;
          option.value = json[i].issue_reported;
          incidentSelect.add(option);

        };

      });
    }

    /********************************************************
     * Limit incident type selection to only 5 options using jquery (After 5th option is chosen the next option is unselected)
     *
     * Author:  JB
     ********************************************************/

    function limitSelection() {

      var last_valid_selection = null;

      $('#incidentTypes').change(function(event) {

        if ($(this).val().length > 5) {

          alert("You may only select 5 incident types at a time.");

          //Set current selectino to last valid selection
          $(this).val(last_valid_selection);
        } else {
          last_valid_selection = $(this).val();
        }
      });
    }

    function defaultView(){
      getData(trafficRequestURL)
        .then(createGraphics)
        .then(createLayer)
        .then(createLegend);
    }

    function resetView(){
      map.remove(trafficFLayer);
      map.remove(resultsFL);
      locateWidget.clear();
      if(!(typeof myChart === "undefined")){
        myChart.destroy();
      }
      view.graphics.removeAll();
      view.popup.close();
      searchToggleHeatmap.checked = false;
      fromSearch = false;
      renderHeatStatus = false;
      searchTogglePoints.checked = true;
      document.getElementById("esriLegend").style.display = "block";
      document.getElementById("table").style.display = "none";
      document.getElementById("tableClose").style.display = "none";
      defaultView();
    }

    /*****************************************************************
     * The visible property on the layer can be used to toggle the
     * layer's visibility in the view. When the visibility is turned off
     * the layer is still part of the map, which means you can access
     * its properties and perform analysis even though it isn't visible.
     *******************************************************************/

    /**************************************************
     * Define variables for toggles
     **************************************************/
    var roadTrafficStyle = "";
    var trafficVisible = false;

    darkModeToggle = document.getElementById("darkMode");
    cityLimitsLayerToggle = document.getElementById("cityLimitsLayer");
    currentTrafficToggle = document.getElementById("currentTraffic");
    renderToggle = document.getElementById("renderToggle");
    searchTogglePoints = document.getElementById("buttonPoints");
    searchToggleHeatmap = document.getElementById("buttonHeatmap");
    scaleBarToggle = document.getElementById("scaleBar");
    resetViewButton = document.getElementById("resetData");

    cityLimitsLayerToggle.checked = false;
    scaleBarToggle.checked = false;
    searchToggleHeatmap.checked = false;

    /**************************************************
     * Check local storage to determine user
     *  preference for light/dark mode
     **************************************************/

    if (localStorage.getItem("mode") == "dark") {
      darkRoads.visible = true;
      lightRoads.visible = false;
      roadTrafficStyle = "dark";
      currentTrafficToggle.checked = false;
    }

    if (localStorage.getItem("traffic") == "on" && localStorage.getItem("mode") == "light") {
      currentTrafficToggle.checked = true;
      lightTrafficTiles.visible = true;
      roadTrafficStyle = "light";
      trafficVisible = true;
    }

    if (localStorage.getItem("traffic") == "on" && localStorage.getItem("mode") == "dark") {
      currentTrafficToggle.checked = true;
      darkTrafficTiles.visible = true;
      roadTrafficStyle = "dark";
      trafficVisible = true;
    }

    if (localStorage.getItem("show") == "limits") {
      cityLimitsLayerToggle.checked = true;
      limits.visible = true;
    }

    if (localStorage.getItem("widget") == "scale") {
      scaleBarToggle.checked = true;
      view.ui.add(scaleBar, "manual");
    }

    /**************************************************
     * Function to run when dark mode toggle checked
     * This function styles map layers
     * 1 of 2
     * Other darkmode function is animate.js for CSS
     **************************************************/

    darkModeToggle.addEventListener("change", function() {
      if (darkModeToggle.checked && trafficVisible == false) {
        darkRoads.visible = true;
        lightRoads.visible = false;
        roadTrafficStyle = "dark";
        darkTrafficTiles.visible = false;
        lightTrafficTiles.visible = false;
      } else if (darkModeToggle.checked && trafficVisible == true) {
        lightRoads.visible = false;
        darkRoads.visible = true;
        roadTrafficStyle = "dark";
        lightTrafficTiles.visible = false;
        darkTrafficTiles.visible = true;
      } else if (darkRoads.visible == true && trafficVisible == false) {
        lightRoads.visible = true;
        darkRoads.visible = false;
        roadTrafficStyle = "light";
        lightTrafficTiles.visible = false;
        darkTrafficTiles.visible = false;
      } else {
        lightRoads.visible = true;
        darkRoads.visible = false;
        roadTrafficStyle = "light";
        lightTrafficTiles.visible = true;
        darkTrafficTiles.visible = false;
      }
    });

    /**************************************************
     * Toggle to show/hide city limits layer
     **************************************************/

    cityLimitsLayerToggle.addEventListener("change", function() {
      if (cityLimitsLayerToggle.checked) {
      limits.visible = true;
      localStorage.setItem("show", "limits");
    } else {
      limits.visible = false;
      localStorage.setItem("show", "nolimits");
    }
    });

    /**************************************************
     * Current traffic conditions style for darkmode
     **************************************************/

    currentTrafficToggle.addEventListener("change", function() {
      if (lightTrafficTiles.visible == true || darkTrafficTiles.visible == true) {
        lightTrafficTiles.visible = false;
        darkTrafficTiles.visible = false;
        trafficVisible = false;
        localStorage.setItem("traffic", "off");
      } else if (roadTrafficStyle == "dark") {
        darkTrafficTiles.visible = true;
        lightTrafficTiles.visible = false;
        trafficVisible = true;
        roadTrafficStyle = "dark";
        localStorage.setItem("traffic", "on");
      } else {
        lightTrafficTiles.visible = true;
        darkTrafficTiles.visible = false;
        trafficVisible = true;
        roadTrafficStyle = "light";
        localStorage.setItem("traffic", "on");
      }
    });

    /**************************************************
     * Heatmap generator for radio buttons
     **************************************************/

    renderToggle.addEventListener("change", function() {
      renderHeatStatus = searchToggleHeatmap.checked;
      if (renderHeatStatus) {
        trafficFLayer.renderer = trafficHeatRenderer;
        trafficFLayer.opacity = 0.75;
      } else if (fromSearch) {
        trafficFLayer.renderer = uniqueValueRenderer;
      } else {
        trafficFLayer.renderer = classRenderer;
        trafficFLayer.opacity = 1;
      };
    });


    resetViewButton.addEventListener("click", resetView);


    /**************************************************
     * ADD and MODIFY map widgets
     **************************************************/

    view.ui.move("zoom", "bottom-right"); //Move Zoom
    /*view.ui.add(baseToggle, "bottom-right"); //Add Basemap toggle*/
    view.ui.add(homeBtn, "bottom-right"); // Add the home button

    view.ui.add(new Fullscreen({
      view: view,
      element: entireApp
    }), "top-right");
    view.ui.add(btExpand, "bottom-right");
    view.ui.add(locateBtn, {
      position: "bottom-right"
    });

    scaleBarToggle.addEventListener("change", function() {
      if (scaleBarToggle.checked == true) {
        view.ui.add(scaleBar, "manual");
        localStorage.setItem("widget", "scale");
      } else if (scaleBarToggle.checked == false) {
        view.ui.remove(scaleBar, "manual")
        localStorage.setItem("widget", "noscale");
      }
    });


    /**************************************************
     * Request the  data from data.austin when the
     * view resolves then send it to the
     * createGraphics() method when graphics are created,
     * create the layer
     **************************************************/

    view.when(function() {

      defaultView();

      // Populate the select list with all of the possible incident types JB
      populateSearch();

      // Run the search once the submit button has been clicked JB
      on(dom.byId("submitButton"), "click", runSearch);

      // Limit selected incidents to 5 or fewer when options are clicked and selected
      on(dom.byId("incidentTypes"), "click", limitSelection);

      //on(dom.byId("resetData"), "click", resetView);


    });




  });
