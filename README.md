
Final project for XSAVI-780
=========================

This web page was submitted as a final project for Pratt XSAVI-780 in Dec 2014.  The public user facing page is here: http://jackielu.github.io/xsavi-final/


-------------------------

Thank you:  Chris Whong and Larry Buchanan for their awesome teaching and guidance!  

-------------------------




Future enhancements:
1) pop-up bar graph on click for specific paths/polygons/NTAs
2) zoom map on click
3) incorporating other geographies
4) smoothly animating the bar chart transitions




-------------------------
Original Project Proposal:

I propose to build an interactive project that uses both D3 and Leaflet that would allow users to  explore the NYC 2010 land cover dataset which has been summarized by different geographies.

I have layers that represent % tree, % grass etc etc that have been summarized by different citywide polygon datasets - for example, neighborhood, park, community district, etc. Each geographic area has 7 values - one for each land cover class in the data set.

I plan to build a web page that would allow the user to toggle between maps showing choropleths of the data for different geographic boundaries (so - many maps!).  There would be a corresponding D3 histogram that would show the distribution of the cover type data values, that would update as the layers shown the map changes. 

For example, if the user elects to see a choropleth that shows % tree cover by neighborhood, the graph would show a histogram of the # of neighborhoods that have % tree cover values in different bins.  Clicking on the bar corresponding to a particular bin would highlight the corresponding neighborhoods on the map.

Finally clicking on a particular feature on the map would show a graph of the % area of the polygon that each cover type comprises.

I will probably start by building out this web page for one summary geography - like neighborhoods - before adding different summaries (like parks) that the user can chose to view instead.
