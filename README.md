# TrafficSim
 Simulation of traffic control methods for intersections. Attempting to see if different methods of control can produce better results with the same traffic sets

Technologies Used: 
A HTML front end used to simulate cars driving on a road with intersections to change roads
JS files to support the creation of Roads, Cars, Intersections, and some managers to keep the simulation going and provide reports. 

External Libraries:
Pixijs 7x: https://pixijs.com/
	Graphical interface 
OSMtoGEOJson: https://github.com/tyrasd/osmtogeojson
	Converting OSM files to a readable format 
Open Street Maps: https://www.openstreetmap.org/
	A platform of actual street maps. Can be used to get real road data from nearby towns. 
jQuery: Google supported library 	

Code Architecture: 
Roads provide a designated start and end point. The curved roads are a series of points from start to end. They simulate a curve by having a series of straight lines between those curves. Cars drive on the roads. Roads can have multiple lanes. Lanes provide cars with the direction to move to keep moving forward. Each road has at least two lanes that operate in the opposite direction. 

Cars move along lanes. Cars have a designated start and end point. The end point does not have to be on the same road they start on. Cars have some speeds they want to go but will follow the max speed of the road. Cars can make some decisions about what direction they would like to travel in and it could be the wrong decisions. Each car will continue moving until they pass off the screen or find their end goal. A car keeps a log of how long each journey is. A car can only change lanes at an intersection. 

Intersections require at least two roads. They give every car passing within its bounds the chance to change lanes if required. Intersections support multiple types of control.
 
	Basic: Switches light based on a set amount of time. Currently half of the total interval time. 
	Greedy: Switches based on sensing cars within a current radius from the intersection. Different distances are supported. Will not switch to a different configuration if there are still cars at the current setting. 
	Rate: Updates the time to each configuration based on the previous rate of the roads. Can take up to date records as the day progresses to change the rate for each configuration. 

Intersections can support more modes. Intersections know what lanes are passing through the intersection. Intersections handle passing one car from their current road to the next road as they transition between the roads as needed to find their end goal. 

The car manager adds cars into the map till hitting the max cars at a time. It also keeps track of the total cars completing trips overall. Once it hits the max amount of trips completed, it stops producing more cars on the map. 

The iteration manager runs the simulation multiple times and changes out a different factor each time. Currently the manager changes the max amount of cars, the max amount of cars on screen at one time, and the type of intersections on the map.

The report manager takes the reports of each car and sums it based on the current settings of the iteration manager. These data points are summed up in the results folder. 

Future Developments: 

Additional modes of intersection controls can be added. Based on how the greedy control modes performed, it might be better to create a hybrid mode that combines greedy with rate control. 

There is currently a graphical bug where at intersections cars currently get the wrong initial offset when switching. It looks like the car is driving in the wrong lane. There is also another issue where cars that should stop merge with the car in front of them for the time being until they either complete their run or diverge at intersections. 

The Greedy mode of control still detects if cars are within its radius even if they are facing away from itself. Ideally it would only detect cars that need to enter the intersection for better results. 

Currently the real life data maps do not have intersections. The data present from OSM does not contain where the intersections would be. The current implementation tries to find where road lines cross to find intersections but with the complexity of real life data, that intersection model does not work well. That method of finding intersections will need to be updated to work with the real world data. 
