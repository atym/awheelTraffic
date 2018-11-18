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
    "esri/request",
    "dojo/dom",
	"dojo/on",
	"esri/core/promiseUtils"
  ],

  /**************************************************
   * Create magic mapping function
   **************************************************/

  function(Map, Basemap, MapView, BasemapToggle, FeatureLayer, VectorTileLayer, TileLayer, Point, Legend, Home, ScaleBar, 
		esriRequest, dom, on, promiseUtils) {

    /**************************************************
     * VARIABLES
     **************************************************/

    var limits, roads, trafficFLayer, fields, pTemplate, trafficRenderer, map, view, legend, roadLayerToggle, cityLimitsLayerToggle, trafficRequestURL, baseToggle, lightRoads, darkRoads, vectorRoads, satelliteBase, satelliteReference, satellite, homeBtn, scaleBar;
    var json, recordsReturned;
	
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

    /**************************************************
     * Create map and define basemap
     * Select layers to display on basemap
     **************************************************/

    map = new Map({
      basemap: vectorRoads,
      layers: [limits]
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

    /**************************************************
     * Load initial batch of traffic data from COA
     * JSON data over Socrata API
     **************************************************/

    trafficRequestURL = "https://data.austintexas.gov/resource/r3af-2r8x.json" +
      "?$where=traffic_report_status_date_time>'2018-11-13'" +
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
        size: 8,
        color: "#FF4000"
      },
      uniqueValueInfos: [{
        value: "ACTIVE",
        symbol: {
          type: "simple-marker",
          size: 8,
          color: "red"
        }
      }, {
        value: "ARCHIVED",
        symbol: {
          type: "simple-marker",
          size: 8,
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

      getData(trafficRequestURL)
        .then(createGraphics)
        .then(createLayer)
        .then(createLegend);
      
	  // Populate the select list with all of the possible incident types JB
      populateSearch();
	  
	  // Run the search once the submit button has been clicked JB
	  on(dom.byId("submitButton"), "click", runSearch);
    });

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
	*
	*  Function author:  JB
	*********************************************************/
	function runSearch(){
		
		//Get current date
		var now = new Date();
        
		//Use current date to get current time in milliseconds
		var today = now.getTime();
        
		var millisecondsInDay = 86400000;
        
		//Parameter for amount of days to subtract from current date
		var days = dom.byId("daysFromDate").value;
		//var incidentTypes = dom.byId("incidentTypes").value;
		
		var incidentTypes = [];
		var incidentTypesString = "(";
		
		// Get array of dom options properties for the select list 
		var options = dom.byId("incidentTypes").options;
		
		// Add all selected elements to the incidentTypes array
		for (var i=0; i < options.length; i++){
			opt = options[i];
			
			if (opt.selected){
				incidentTypes.push(opt.value);
			}
		}
		
		// Populate set of incidents with commas between them for the SQL statement
		for (var i=0; i < incidentTypes.length; i++){
			if (i < incidentTypes.length - 1){
				incidentTypesString += "'" + incidentTypes[i] + "'" + ",";
			}
			else {
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
		"?$where=traffic_report_status_date_time>"+"'"+queryDateString+"'"+
		" AND issue_reported IN "+ incidentTypesString +
		"&$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM";
		
		console.log("Query params: "+queryDateString+" "+incidentTypes);
		
		//Remove the previous trafficFLayer before attempting to display the query results 
		map.remove(trafficFLayer);
		
	    getData(searchURL)
        .then(createGraphics)
        .then(createLayer)
        .then(createLegend)
		//Catch any of the errors that were created from the previous callback functions 
		.catch(function(error){ 
			console.log('One of the promises in the chain was rejected! Message: ', error);
		});
		
		// Display the amount of results returned
		//recordsReturned = Object.keys(json).length;
		//dom.byId("numRecords").innerHTML = recordsReturned;
	}
    /**************************************************
     * Create graphics with returned json data
     **************************************************/

    function createGraphics(response) {
      // raw JSON data
      //var json = response.data;
	  json = response.data;
	  recordsReturned = Object.keys(json).length;
	 
	  dom.byId("numRecords").innerHTML = recordsReturned;

      // Create an array of Graphics from each JSON feature
	  // Check to see that the query returned results before trying to create the graphics object JB
	  if (recordsReturned > 0){
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
        renderer: trafficRenderer,
        objectIdField: "ObjectID",
        popupTemplate: pTemplate
      });

      try {map.add(trafficFLayer)} catch(error){return };
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
	 *
	 * Function author:  JB
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

          var option = document.createElement("option");
          option.text = json[i].issue_reported;
          option.value = json[i].issue_reported;
          incidentSelect.add(option);

        };

      });
    }
	
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

    /**************************************************
     * ADD and MODIFY map widgets
     **************************************************/

    view.ui.move("zoom", "bottom-right"); //Move Zoom
    view.ui.add(baseToggle, "bottom-right"); //Add Basemap toggle
    view.ui.add(homeBtn, "bottom-left"); // Add the home button
    view.ui.add(scaleBar, "top-right");



  });
