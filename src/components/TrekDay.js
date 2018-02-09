import React , { Component } from 'react';
import { View, Image, KeyboardAvoidingView  } from 'react-native';
import { Container, Header, Button, Icon, Content, Card, CardItem, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import TrekItem from './TrekItem.js';


class TrekDay extends Component {
  constructor(props) {
    super(props)

    this.state = {
         stops: [],
         showToast: false,
         day: props.dayNumber
      }
  }

  constructStops() {
    if (this.state.stops.length > 0) {
      return this.state.stops.map(stop => <TrekItem key={stop.key} stop={stop}/>);
    }
    return;
  }

  addStop(data, details) {
    var nextStop = this.state.stops.length > 0 ? this.state.stops[this.state.stops.length - 1]["day"] + 1 : 1;
    var newStopsArr = this.state.stops.concat({ "key":  nextStop,
              "description": data.description,
              "day" : this.state.day
            });

    this.setState({ stops: newStopsArr })
    this.props.handleNewStop(nextStop, data.description, this.state.day)
  }

  render() {
    return (
        <Card style={{flex: 0}}>
          <CardItem header>
            <Text>Day {this.state.day}</Text>
          </CardItem>
            {this.constructStops()}
          <CardItem>
            <GooglePlacesAutocomplete
              placeholder={"Add a stop for Day " +  `${this.state.day}`}
              minLength={2} // minimum length of text to search
              autoFocus={false}
              returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
              listViewDisplayed='auto'    // true/false/undefined
              fetchDetails={true}
              renderDescription={(row) => row.description} // custom description render
              onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                this.addStop(data, details)
                this.forceUpdate()
              }}
              getDefaultValue={() => {
                return ''; // text input default value
              }}
              query={{
                // available options: https://developers.google.com/places/web-service/autocomplete
                key: 'AIzaSyB1Cmpl5m7ObzVgXo7z6w3USYjywzq36oA',
                language: 'en', // language of the results
              }}
              currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
              nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
              GoogleReverseGeocodingQuery={{
                // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
              }}
              GooglePlacesSearchQuery={{
                // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                rankby: 'distance',
                types: 'food'
              }}

              styles={{
                 textInputContainer: {
                   backgroundColor: 'rgba(0,0,0,0)',
                   borderTopWidth: 0,
                   borderBottomWidth:0
                 },
                 textInput: {
                    zIndex: 20,
                    marginLeft: 0,
                    marginRight: 0,
                    height: 38,
                    color: '#5d5d5d',
                    fontSize: 16
                  },
                  listView: {
                    zIndex: 20,
                    backgroundColor: '#fff'
                  }
              }}

              filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

              debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
              /*renderRightButton={() => <Button transparent style={{justifyContent: 'center'}}><Icon name="ios-search"></Icon></Button>}*/
            />
          </CardItem>
      </Card>
  )
}
}

export default TrekDay;
