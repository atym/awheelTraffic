###### FORMAT

-   [x] ~~this is a complete item~~ @ipk
-   [ ] this is an incomplete item

    *markdown cheatsheet on linkList*

## To-Do

#### legend

-   [ ] update with Jason's unique values for incident type, maybe classify
    -   [ ] crash, hazard, informational
-   [ ] update legend with optional layers
-   [ ] fit legend in div
    -   [ ] **special attention** to landscape mobile

#### search

-   [x] ~~need html buttons for user input~~ @jb
-   [x] ~~query js function~~ @jb
-   [x] ~~heatmap toggle, based on query results~~ @br
-   [ ] search based on times of day, show me accidents from Mondays at 5pm

#### locate

-   [x] ~~geocoder or search widget~~ @ipk
-   [x] ~~research output from locate to buffer~~ @jwb
-   [x] ~~mobile location finder~~ @jwb
-   [ ] user adjustable buffer distance/ 1 or 5
-   [x] ~~use buffer to only display points that intersect~~ @jwb
-   [ ] display graph with distribution of incident types within radius

#### style

-   [ ] revisit color of title bar
-   [ ] clean css and comment
-   [x] ~~create custom css for dark mode, update text and toolbox background on click, including dark mode zoom buttons from esri~~ @ipk

#### mobile

-   [ ] symbology scale with device size
-   [ ] research ios landscape status fix
-   [ ] retina display 192dpi
-   [x] ~~add ios splash screen for pwa~~ @ipk
-   [ ] add popup on mobile for detected screen size <450 with option for vector or raster (HD vs SD)(Wifi&LTE vs 3G&E)...option to remember user choice for next visit. only show message on mobile so not obtrusive to desktop experience, but provides better load times for those on a slower connection. dont use words vector and raster, too confusing. hd and sd are button with big text and the network connection is a subtitle.
-   [x] ~~fix size of search text box to accomodate default text value~~ @ipk

#### other

-   [x] ~~tooltips for toolbox~~ @ipk
-   [ ] add function in mapping that watches for vector tile layer failure and then reloads page if necessary
- [x] ~~fix time in popup to be more legible, unscramble~~ @ipk
- [ ] fix home button to use default extent
-   [x] ~~add refresh button to each toolbox window~~ @ipk
      - [ ] refresh should reload entire map, not html doc
-   [ ] dynamic default map extent based on screen
-   [ ] icons that load only for active incidents (initial display) based on three classes
-   [x] ~~aboutHelper~~ @ipk
    -   [x] ~~research logo mods for better         about identification, maybe re-position logo elements and add unicode tooltip~~
  - [x] ~~add footer for copyright info~~ @ipk

## Wish List

-   [x] ~~click menu open / click menu close~~ @ipk
-   [x] ~~different renderer for roads?~~ @ipk
-   [ ] contact traffic dataset owner for incident type desriptions
    -   [ ] this would also be helpful to understand the accuracy of reported time, does time represent when incident occurred or ended?
-   [ ] popup for add to home screen on ios and android
  - [ ] purchase domain name awheeltraffic.com
-   [ ] service worker for ios and android to cache api calls
  - [x] ~~cookie storage to remember dark/light mode toggle pwa~~ @ipk
-   [ ] double tap to zoom on mobile
    -   [ ] [Link](https://gis.stackexchange.com/questions/102380/double-tap-on-the-map-not-work-in-the-chrome-of-nexus-7)
-   [ ] Historical Traffic Fatalities



https://1.traffic.maps.api.here.com/maptile/2.1/flowtile/newest/normal.day/[z]/[x]/[y]/256/png8?app_id=1ig2foSCCXslmH8Zh58J&app_code=tjpaSyhSoPkLD-eokE66VQ
