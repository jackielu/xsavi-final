
Final project in progress for XSAVI-780

=========================
12/11/2014

Color ramps applied to both histogram and to the choropleth

Able to assign corresponding "bin" attr (based on the style color) to both Path polys and Rects that represent the same range (as evidenced by alerts)

But how to upon click event on one of the rects in the histogram, select path polys with correspding "bin", and apply a new style?



=========================

12/4/2014

Added D3 histogram (that isn't working well)

Next steps: 
- add classes to the choropleth





=========================

12/2/2014  9 pm

Project updated to add data to map using D3 instead of Leaflet.  Next steps will be to:
1) clean up the code comments
2) pull and create the div button elements from the data
3) add interactivity

Prior leaflet based mapping code was saved into a file called script_leaflet.js




=========================

11/29 code, commited on 12/2/2014 8 pm - SHA bdf2dcfecd2b1537c8f86b5329c3b1668490827d

This is the first attempt at the landCover project using Leaflet to add polygons and styles to the map and the Skeleton boilerplate, with sidebar elements derived from the data that highlight polygons on the map with hover.  No D3 has been incorporated yet.