import React, { Component } from 'react';
import { ScrollView, View, Image, KeyboardAvoidingView  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, Item, Card, CardItem, Input, Form, Icon,Picker, Content, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import TrekDay from './TrekDay.js';
import firebase from 'firebase';

class AddTrip extends Component {

   constructor(props) {
     super(props)
     this.state = {
          days: [{key: 1, stops: []}],
          showToast: false,
          trekName: ''
       }
   }

  constructItinerary() {
    var daysList = []
    this.state.days.map(day => {
      daysList.push(<TrekDay key={day.key} dayNumber={day.key} stops={day.stops} handleNewStop = {this.addStopToDay}/>)
    })
    return daysList
  }

  addDay() {
    var nextDay = this.state.days[this.state.days.length - 1]["key"] + 1
    var newDaysArr = this.state.days.concat({ "key": nextDay,
                                              stops: []
                                            });
    this.setState({ days: newDaysArr })
  }

  addStopToDay = (stopNum, stopInfo, dayNum) => {
    console.log(this.state.days)
    var newStopsArr =  this.state.days[dayNum - 1].stops.concat({ "key":  stopNum,
              "stopName": stopInfo
            });

    var newDaysArr = this.state.days
    newDaysArr[dayNum - 1]["stops"] = newStopsArr

    this.setState({ days: newDaysArr })
  }

  insertTrek() {
    if (this.state.trekName == '') {
      Toast.show({
        text: 'Make sure to name your trip before saving',
        position: 'bottom',
        type: 'danger'
      })
      return;
    }

    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')
    var self = this
    firebase.database().ref('/users/' + userEmail).once('value')
        .then(function(snapshot) {
              console.log(snapshot.val())
               var postData = {
                title: self.state.trekName,
                user: userEmail,
                displayName: snapshot.val().displayName,
                days: self.state.days,
                datePosted: Date.now()
              };
              console.log(postData)

              // Get a key for a new Post.
              var newPostKey = firebase.database().ref().child('treks').push().key;

              // Write the new post's data simultaneously in the posts list and the user's post list.
              var updates = {};
              updates['/treks/' + newPostKey] = postData;
              updates['/user-posts/' + userEmail + '/' + newPostKey] = postData;

              firebase.database().ref().update(updates).then(() => {
                    Toast.show({
                      text: 'Saved!',
                      position: 'bottom',
                      type: 'success'
                    })
                    self.props.navigation.navigate('Home')
              });
        })
  }

  render() {
    return (
      <View style={{height: '100%'}}>
          <Header style={{justifyContent: 'center', backgroundColor: '#6db5ff'}}>
            <Left>
              <Button
                transparent
                title="Submit"
                onPress={() => {  this.props.navigation.navigate('Home')  }}>
                  <Icon name="ios-arrow-back" style={{color: '#fff'}}/>
              </Button>
            </Left>
            <Right>
              <Button
                style={{backgroundColor:'#ff5858'}}
                full
                title="Submit"
                onPress={() => {  this.insertTrek()  }}>
                  <Text style={{color: '#fff'}}>Save</Text>
              </Button>
            </Right>
          </Header>
          <Content>
            <Input
              placeholder='Name your trip'
              returnKeyType="done"
              keyboardType="default"
              autoCorrect={false}
              value ={this.state.trekName}
              onChangeText={trekName=> this.setState({trekName})}
              style={{backgroundColor: '#fff'}}
              />
            {this.constructItinerary()}
          </Content>
          <KeyboardAvoidingView behavior='position'>
                <Button full
                        style={{width: '100%', backgroundColor:'#ff8142'}}
                        onPress={() => {  this.addDay() }}>
                  <Icon name="ios-add"></Icon>
                  <Text uppercase={false}  style={{color: 'white'}}>Add a day</Text>
                </Button>
         </KeyboardAvoidingView>
    </View>
    );
  }
}


export default AddTrip;
