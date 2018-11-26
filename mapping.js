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
    "esri/request",
    "dojo/dom",
    "dojo/on",
	"esri/core/promiseUtils",
	"esri/geometry/geometryEngine",
	"esri/Graphic",
	"esri/layers/GraphicsLayer"],


  /**************************************************
   * Create magic mapping function
   **************************************************/



  function(Map, Basemap, MapView, BasemapToggle, FeatureLayer, VectorTileLayer, TileLayer, Point, Legend, Home, ScaleBar, Search, BaseTileLayer, Locate,
		esriRequest, dom, on, promiseUtils, geometryEngine, Graphic, GraphicsLayer) {


    /**************************************************
     * VARIABLES
     **************************************************/


    var limits, roads, trafficFLayer, fields, pTemplate, trafficRenderer, trafficHeatRenderer, heatRenderToggle, map, view, legend, roadLayerToggle, cityLimitsLayerToggle, trafficRequestURL, baseToggle, lightRoads, darkRoads, vectorRoads, satelliteBase, satelliteReference, satellite, homeBtn, scaleBar, locateWidget, currentTraffic;
	var renderHeatStatus = false;

    /**************************************************
     * Create variables for vector layers
     * Combine layers into new basemap
     * Visibility is important for dark mode
     * Assign custom URL for basemapToggleButton
     **************************************************/

    lightRoads = new VectorTileLayer({
      url: "http://www.arcgis.com/sharing/rest/content/items/63c47b7177f946b49902c24129b87252/resources/styles/root.json?f=pjson",
      visible: true,
	  title: "lightRoads"
    });

    darkRoads = new VectorTileLayer({
      url: "https://www.arcgis.com/sharing/rest/content/items/86f556a2d1fd468181855a35e344567f/resources/styles/root.json?f=pjson",
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
	
	/******************************************************
	* Create circle around search result once complete 
	* Author:  JB
	* Helpful example:  https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=featurelayer-query
	******************************************************/
	locateWidget.on("select-result", function(event){
		
		var resultGeometry = event.result.feature.geometry;
		var resultsLayer = new GraphicsLayer();
		
		// Create geometry around the result point with a predefined radius 
		var pointBuffer = geometryEngine.geodesicBuffer(resultGeometry, 3, "miles");
		
		// Create graphic and symbol for the buffer 
		bufferGraphic = new Graphic({
			geometry: pointBuffer,
			symbol: {
				type: "simple-fill",
				outline:{
					width: 1.5,
					color: [255, 128, 0, 0.5]
				},
				style: "none"
			}
		});
		
        // Remove the previous trafficFLayer		
        map.remove(trafficFLayer);
		
		// Reset the matched incidents count to blank since we  are removing the layer
		dom.byId("numRecords").innerHTML = "";
		
		// Add the buffer to the view 
		view.graphics.add(bufferGraphic);
		
		console.log("Buffer successfully added.");
		
		// Limiting results since encountering some memory source errors with large result set 
		searchURL="https://data.austintexas.gov/resource/r3af-2r8x.json" +
        "?$$app_token=EoIlIKmVmkrwWkHNv5TsgP1CM&$limit=10000"
		
		getData(searchURL)
        .then(createGraphics)
		// Create layer from graphics without adding to map
        .then(function(graphics){
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
		.then(function(){
			var query = trafficFLayer.createQuery();
			query.geometry = pointBuffer;
			query.spatialRelationship = "intersects";
			
			return trafficFLayer.queryFeatures(query);
			
		})
		// Create graphics from spatial query result
		.then(function(results){
			//Remove any preexisting results
			resultsLayer.removeAll();
			
			//console.log("Features: "+results.features);
			
			var features = results.features.map(function (graphic){
				graphic.symbol = {
					type: "simple-marker",
					style: "diamond",
					size: 6.5,
					color: "darkorange"
				};
				
				return graphic;
			});
			
			resultsLayer.addMany(features);
			
			map.add(resultsLayer);
			
			return resultsLayer;
		})
        .then(createLegend)
        //Catch any of the errors that were created from the previous callback functions
        .catch(function(error) {
          console.log('One of the promises in the chain was rejected! Message: ', error);
        });
		
	});
	
	// Remove the buffer if the search is cleared 
	locateWidget.on("search-clear", function(event){
		view.graphics.remove(bufferGraphic);
	})

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

	trafficHeatRenderer = {
	  type: "heatmap",
	  colorStops: [
		{ ratio: 0, color: "rgba(255, 255, 255, 0)" },
		{ ratio: 0.2, color: "rgba(255, 255, 255, 1)" },
		{ ratio: 0.5, color: "rgba(255, 140, 0, 1)" },
		{ ratio: 0.8, color: "rgba(255, 140, 0, 1)" },
		{ ratio: 1, color: "rgba(255, 0, 0, 1)" }
	  ],
	  maxPixelIntensity: 25,
	  minPixelIntensity: 0
	};
	trafficHeatRenderer.visualVariables=([{
		opacity: 0.5
	}]);

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
    function runSearch() {

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

      console.log("Query params: " + queryDateString + " " + incidentTypes);

      //Remove the previous trafficFLayer before attempting to display the query results
      map.remove(trafficFLayer);
	  
	  // Remove any locate results that still exist
	  view.graphics.removeAll();
	  locateWidget.destroy();

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
		title: "trafficIncidents"
      });

	  if(renderHeatStatus){
		  trafficFLayer.renderer = trafficHeatRenderer;
		  trafficFLayer.opacity = 0.75;
	  }
	  else{
		  trafficFLayer.renderer = trafficRenderer;
		  trafficFLayer.opacity = 1;
	  };

      try {
        map.add(trafficFLayer);
      } catch (error) {
        return
      };
	  
	  view.extent = trafficFLayer.fullExtent; // **** Not working for some reason JB *****
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
    var roadTrafficStyle = "";
    var trafficVisible = false;

    darkModeToggle = document.getElementById("darkMode");
    cityLimitsLayerToggle = document.getElementById("cityLimitsLayer");
    currentTrafficToggle = document.getElementById("currentTraffic");
	heatRenderToggle = document.getElementById("toggleHeat");

  cityLimitsLayerToggle.checked = false;
  heatRenderToggle.checked = false;

    if (localStorage.getItem("mode") == "dark") {
      darkRoads.visible = true;
      lightRoads.visible = false;
      roadTrafficStyle = "dark";
      currentTrafficToggle.checked = false;
    }

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



    cityLimitsLayerToggle.addEventListener("change", function() {
      limits.visible = cityLimitsLayerToggle.checked;
    });

    /**************************************************
     * Current traffic conditions style for darkmode
     **************************************************/

    currentTrafficToggle.addEventListener("change", function() {
      if (lightTrafficTiles.visible == true || darkTrafficTiles.visible == true) {
        lightTrafficTiles.visible = false;
        darkTrafficTiles.visible = false;
        trafficVisible = false;
      } else if (roadTrafficStyle == "dark") {
        darkTrafficTiles.visible = true;
        lightTrafficTiles.visible = false;
        trafficVisible = true;
        roadTrafficStyle = "dark";
      } else {
        lightTrafficTiles.visible = true;
        darkTrafficTiles.visible = false;
        trafficVisible = true;
        roadTrafficStyle = "light";
      }
    });

	heatRenderToggle.addEventListener("change", function(){
	  renderHeatStatus = heatRenderToggle.checked;
	  if(renderHeatStatus){
		  trafficFLayer.renderer = trafficHeatRenderer;
		  trafficFLayer.opacity = 0.75;
	  }
	  else{
		  trafficFLayer.renderer = trafficRenderer;
		  trafficFLayer.opacity = 1;
	  };
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
	 
	/********************************************************
	* Limit incident type selection to only 5 options using jquery (After 5th option is chosen the next option is unselected)
	*
	* Author:  JB
	********************************************************/
	function limitSelection(){
          
		var last_valid_selection = null;
        
        $('#incidentTypes').change(function(event) {

			if ($(this).val().length > 5) {
				
				alert("You may only select 5 incident types at a time.");
				
				//Set current selectino to last valid selection 
				$(this).val(last_valid_selection);
            } 
			else {
				last_valid_selection = $(this).val();
            }
        });
	}
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
	  
	  // Limit selected incidents to 5 or fewer when options are clicked and selected 
	  on(dom.byId("incidentTypes"), "click", limitSelection);
	  	  
    });


  });
