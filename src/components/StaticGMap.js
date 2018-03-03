import React , { Component } from 'react';
import { View, Image} from 'react-native';
import axios from 'axios';

const StaticGMap = (props) => {

  var days = props.trekDays
  var totalStops = 0;
  var staticMapURL = 'https://maps.googleapis.com/maps/api/staticmap?'
  var markers = generateMarkers();
  var zoomLevel = totalStops === 1 ? "&zoom=9" : null;

  function generateMarkers() {
    //Marker logic
    var markers = '';
    var stopNum = 0;

    if (days !== undefined && days !== null) {
      for (var i=0; i < days.length; i++) {
        if (days[i].stops !== null && days[i].stops !== undefined) {
          for (var j=0; j<days[i].stops.length; j++) {
            totalStops++;
            stopNum++;
            var randomColor = getRandomColor()
            markers += "&markers=color:"+ randomColor +"%7Clabel:" + stopNum;
            markers +=  "%7C" + days[i].stops[j].stopName
          }
        }
      }
    }

    return markers
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '0x';

    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 15)];
    }

    return color;
  }

  const mapImage = {
    uri: `${staticMapURL}?center=`+ days[0].stops[0].stopName + zoomLevel + `&size=400x300`+ markers + `&key=AIzaSyAOMW7lrMuV3zSfeRroBstSu5tEbbtxdTQ`
  }

  return <Image source={mapImage} style={{ width: '100%', height: 200 }} />
}

export default StaticGMap;
