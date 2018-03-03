import React , { Component } from 'react';
import { View, Image, KeyboardAvoidingView, Alert  } from 'react-native';
import { Container, Header, Button, Icon, Content, Card, CardItem, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import TrekItem from './TrekItem.js';


class TrekDay extends Component {
  constructor(props) {
    super(props)
    this.state = {
         stops: props.stops,
         showToast: false,
         day: props.dayNumber,
         stopTextValue: ''
      }
  }

  constructStops() {
    if (this.state.stops.length > 0) {
      return this.state.stops.map(stop => <TrekItem key={stop.key} stop={stop}/>);
    }
    return;
  }

  addStop(stopName) {
    if (stopName != ''){
      var nextStop = this.state.stops.length > 0 ? this.state.stops[this.state.stops.length - 1]["day"] + 1 : 1;
      var newStopsArr = this.state.stops.concat({ "key":  nextStop,
                "description": stopName,
                "day" : this.state.day
              });

      this.setState({ stops: newStopsArr, stopTextValue: '' })
      this.GooglePlacesRef.setAddressText("")
      this.forceUpdate()
      this.props.handleNewStop(nextStop, stopName, this.state.day)
    }
  }

  removeDay() {
    Alert.alert(
      'Confirm',
      `Are you sure you want to remove this day and all of it's stops?`,
      [
        {text: 'No, keep this day.', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes, remove this.', onPress: () => this.props.handleRemoveDay(this.state.day)},
      ],
      { cancelable: true }
    )
  }

  render() {
    var self=this;
    return (
        <Card style={{flex: 0}}>
          <CardItem header style={{backgroundColor: '#ff8142', width: '100%'}}>
            <Body>
              <Text style={{color: '#fff'}}>Day {this.state.day}</Text>
            </Body>
            <Right>
              <Button
                transparent
                style={{alignSelf: 'flex-end'}}
                onPress={() => {this.removeDay()}}>
                <Icon name="ios-remove-circle-outline" style={{fontSize: 25, color: '#fff'}} />
              </Button>
            </Right>
          </CardItem>
            {this.constructStops()}
          <CardItem style={{flexDirection: 'row'}} keyboardShouldPersistTaps="always" keyboardDismissMode='on-drag'>
            <GooglePlacesAutocomplete
              keyboardShouldPersistTaps="always"
              ref={(instance) => { this.GooglePlacesRef = instance }}
              placeholder={"Add a stop for Day " +  `${this.state.day}`}
              minLength={2} // minimum length of text to search
              onFocus = {() => {this.GooglePlacesRef.scrollIntoView({ behavior: "smooth" })}}
              autoFocus={false}
              returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
              listViewDisplayed='auto'    // true/false/undefined
              fetchDetails={true}
              renderDescription={(row) => row.description} // custom description render
              onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                this.addStop(data.description)
              }}
              textInputProps={{
                  onChangeText: (text) => {self.setState({stopTextValue: text})}
              }}
              getDefaultValue={() => {
                return self.setState.stopTextValue; // text input default value
              }}
              query={{
                // available options: https://developers.google.com/places/web-service/autocomplete
                key: 'AIzaSyB1Cmpl5m7ObzVgXo7z6w3USYjywzq36oA',
                language: 'en', // language of the results
              }}
              currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
              nearbyPlacesAPI='GooglePlacesSearchQuery' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
              GoogleReverseGeocodingQuery={{
                // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
              }}
              GooglePlacesSearchQuery={{
                // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                rankby: 'prominence'
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
            <Button
              transparent
              onPress={() => {
              this.addStop(this.state.stopTextValue)
            }}>
              <Icon name="ios-add"/>
            </Button>
          </CardItem>
      </Card>
  )
}
}

export default TrekDay;
