# Austin Traffic Incidents
A project to map and visualize traffic incidents in Austin, TX

*Jason Bartling*

*Ian Kelly*

*Brandon Rose*


### Introduction
Austin is a bustling city with a diverse culinary experience, strong musical history, and plentiful outdoor opportunities in the hot sun and cool rivers. These factors help to draw new residents from other nearby cities and states to the growing metropolis. A report filed by the Texas Association of Realtors illustrates a comprehensive analysis of population change metrics in the state of Texas. They show that the city had a net gain of 16,890 new out-of-state residents in 2015 (Texas Association of Realtors 2017). This strong demand puts additional pressure on the existing city infrastructure. Austin’s lack of a city rail network directs much of the commuting traffic onto the Texas roadways with a large volume of vehicles required to transport the growing populous (*Figure 1*).
Traffic analysis is important for city officials to be able to make informed decisions about infrastructure. Two common methods of traffic analysis are travel demand modeling, estimating traffic based on housing units, and average daily traffic, an interpolation method to guess traffic at unknown locations (Bakiera et al. 2016). *Austin Traffic Incidents* proposes a third method for analysis by studying the spatial relationship of traffic incident types.
With the high number of vehicles on the road, drivers will need to be more cautious as the potential for being a victim of someone else’s error increases. One way to avoid traffic incidents is to research the areas of town that historically show a large amount of similar types of traffic events and bypass those more dangerous areas. *Austin Traffic Incidents* aims to become a tool that could be used by drivers in Austin to plan their daily commute to avoid areas that are more prone to traffic. The City of Austin provides their traffic incident data to the public for free, but it is difficult to discern meaningful patterns without performing a spatial analysis.

![Study Area](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure1.png)

![Incident Classes](https://github.com/atym/awheelTraffic/blob/master/img/readme/Table1.png)

### Application Design

![Data flow diagram](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure2.png)

Data for this web map was acquired from The City of Austin’s Open Data Portal. This portal provided an easy way to access a multitude of datasets provided by the City of Austin, Texas. For this project, the awheel team identified several potential datasets to implement and determined the Real-Time Traffic Incident Reports dataset would be used. This dataset aggregates traffic incident information from law enforcement agencies in Travis County, Texas that are reported via an RSS feed (Transportation and Mobility 2018). The data are near-real-time, pulling new incidents from the RSS feed every 5 minutes. The data portal also provided an API (Socrata Open Data) for querying the data, therefore enabling data used in this project to be updated near-real-time. The fields used were the date and time the incident occurred (Published Date), latitude, longitude, whether the incident is active (Status), and the type of incident reported. See *Figure 2* for data flow diagram.

![Final UI](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure3.png)

*Austin Traffic Incidents* is a web interface for displaying historic traffic incidents with multiple temporal scales, a query function to search by incident type, a geocoder to search by an address, and a heat map showing the areas of greatest concentration of incidents. On initial load the application displays active incidents grouped by predefined classes; Crash, Hazard, and Advisory (*Table 1*). These classes give a general idea of incident severity which helps give the user a quick summary of incident information for the city. The UI provides an area to access the specific functions of the application (*Figure 3*). First is the Legend tab; here a legend is provided which updates as the user interacts with the data (*Figure 4*). Second is the Search tab; here the user queries the data by indicating a date range of previous incidents as related to the access date, selects 5 incident types for visualizing, selects how to display the results, and finally executes by clicking submit (*Figure 5*). Lastly is the Locate tab; here the user selects a buffer radius and inputs an address (*Figure 6*), results are a buffer containing incidents within the user selected range symbolized by predefined classes. Users are also provided with an option to generate a chart or table for detailed information about the area specified.

![Tools](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure456.png)

### Discussion and Conclusions
The final deliverable for this project is an interactive map of recent traffic incidents, their severity, and proximate roads around Austin. With this project, our team hopes to educate travelers in the Austin area to the most dangerous roads in Austin that may be previously unknown to the public. A future improvement to apply to our application would be route navigation from one address to another that gives an indication of how dangerous a route is overall, and perhaps a suggestion of a safer alternative route. This is something we would have liked to include but was prohibited by time constraints. One contribution that we’re particularly proud of is our mobile visualization. It was designed to be more intuitive with the size and portability of a mobile device as driving factors. The City of Austin’s open data portal provides a lot of options for visualizing their datasets but may be too confusing for the average user. By keeping our application streamlined and having targeted audiences, it should provide for a better overall experience to daily commuters as well as city officials who are more interested in historic data.
One thing our team discovered while undertaking this project was an interesting spatial arrangement of the data aggregation for the traffic incident types. Most of the incident types in all capital case tend to occur outside the city limits (*Figure 7*), while those in normal (mixed) case occur inside the city limits (*Figure 8*). We believe this corresponds with different agencies reporting traffic incidents, and while there are some exceptions, this seems to hold true for most of the data over the study area.

![Collision Types](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure7.png)

![Crash Types](https://github.com/atym/awheelTraffic/blob/master/img/readme/Figure8.png)

### References
```Bakiera, A., R. Weaver, C. Hiner, and Y. Lu. 2016. Spatial analysis of traffic congestion and transit accessibility in Austin, Texas. https://digital.library.txstate.edu/bitstream/handle/10877/6323/BAKIERA-THESIS-2016.pdf?sequence=1 (last accessed 29 October 2018).```

```Texas Relocation Report. 2017. Texas Association of Realtors. https://www.texasrealestate.com/wp-content/uploads/2017TexasRelocationReport.pdf (last accessed 29 October 2018).```

```Transportation and Mobility. https://data.austintexas.gov/Transportation-and-Mobility/Real-Time-Traffic-Incident-Reports/dx9v-zd7x (last accessed 1 November 2018).```

### Appendix
Jason Bartling:
*	Data load queries, Search tool, Locate tool
*	Loading spinner implementation, Map reset and zoom

Ian Kelly:
*	HTML, CSS, and animation JS
*	Chart, Table, and Live traffic layer

Brandon Rose:
*	Initial data display, Data visualization, Legend
*	Class, Heatmap, and Incident type renderers
