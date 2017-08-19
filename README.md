# **domotics.js**

Domotics API developed in Nodejs using Hapi.js framework

Currently supported:
* Niko Home Control: Connects to the IP module and register all actions. Register itself to get all events.
Support Actions, Energy and Thermostats.
* Any other module that is able to push definition/update as described in the /logitem endpoints. For example a Pi with thermal sensor could send its information by using the API endpoint.


Offers the following endpoints:

  * /cmd (PUT): Send command to provider
  
  * /init (GET): Get list of all registered equipments
  
  * /logitem (POST): Create or update equipment
    
  * /event (websocket) publish events from registered components
   
  * /documentation: Swagger UI   
                   
  
  