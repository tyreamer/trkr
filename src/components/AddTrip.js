import React, { Component } from 'react';
import { ScrollView, StyleSheet, View, Animated, Platform, Image, KeyboardAvoidingView, TextInput, Alert  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, Item, Card, CardItem, Input, Form, Icon,Picker, Content, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import TrekDay from './TrekDay.js';
import firebase from 'firebase';

const Header_Maximum_Height = 300;
const Header_Minimum_Height = 50;

class AddTrip extends Component {

   constructor(props) {
     super(props)
     this.AnimatedHeaderValue = new Animated.Value(0);
     this.state = {
          days: [{key: 1, stops: []}],
          showToast: false,
          showSummary: false,
          trekName: '',
          trekTags: [],
          currentTag: '',
          budget: '0',
          summary: ''
       }

       this.removeDay = this.removeDay.bind(this);
   }

  constructItinerary() {
    var daysList = []
    this.state.days.map(day => {
      daysList.push(<TrekDay key={day.key} dayNumber={day.key} stops={day.stops} handleRemoveDay={this.removeDay} handleNewStop = {this.addStopToDay}/>)
    })
    return daysList
  }

  addDay() {
    var nextDay = this.state.days.length + 1
    var newDaysArr = this.state.days.concat({ "key": nextDay,
                                              stops: []
                                            });
    this.setState({ days: newDaysArr })
  }

  removeDay(dayNum) {
/*TODO FIX THIS (currently only deletes last)*/
    var oldDaysArr = this.state.days;
    var newDaysArr = this.state.days;
    for(var i = newDaysArr.length - 1; i >= 0; i--) {
        if(newDaysArr[i].key === dayNum) {
           newDaysArr.splice(i, 1);
           break;
        }
    }

    //fix all proceeding days
    for (var i=dayNum - 1; i<newDaysArr.length; i++) {
      newDaysArr[i].key = newDaysArr[i].key - 1;
    }
    this.setState({days: newDaysArr})
  }

  addStopToDay = (stopNum, stopInfo, dayNum) => {
    var newStopsArr =  this.state.days[dayNum - 1].stops.concat({key: this.state.days[dayNum - 1].stops.length, "stopName": stopInfo});

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
    if (this.state.days[0].stops.length == 0) {
      Toast.show({
        text: 'Add at least 1 stop to your trip before saving',
        position: 'bottom',
        type: 'danger'
      })
      return;
    }

    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')
    var self = this
    var tags = this.state.trekTags

    firebase.database().ref('/users/' + userEmail).once('value')
        .then(function(snapshot) {
               var postData = {
                title: self.state.trekName,
                user: userEmail,
                displayName: snapshot.val().displayName,
                days: self.state.days,
                datePosted: Date.now(),
                trekTags: tags,
                budget: self.state.budget,
                summary: self.state.summary
              };

              // Get a key for a new Post.
              var newPostKey = firebase.database().ref().child('treks').push().key;

              // Write the new post's data simultaneously in the posts list and the user's post list.
              var updates = {};
              updates['/treks/' + newPostKey] = postData;
              updates['/user-posts/' + userEmail + '/' + newPostKey] = postData;

              var tagRef = firebase.database().ref().child('tags')
              tagRef.once('value', function(snapshot) {
                  for (i = 0; i < tags.length; i++) {
                    var tag = tags[i].toLowerCase().trim()
                      if (snapshot.hasChild(tag)) {
                        var updatedTag = {};
                        updatedTag[newPostKey] = 'trek';
                        tagRef.child(tag).update(updatedTag);
                      }
                      else {
                        var newTag = tagRef.child(tag)
                        newTag.set({
                           [newPostKey] : 'trek'
                        })
                      }
                  }
                }
              );

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

  renderTagList() {
    if (this.state.trekTags.length > 0) {
      return (
        <List
          style={[styles.HeaderInputStyle, {marginTop: 0}]}
          dataArray={this.state.trekTags}
          horizontal={true}
          renderRow={(tag) =>
              <ListItem style={[styles.HeaderInputStyle,{paddingLeft: 0, paddingRight: 0, paddingTop: 0, borderBottomWidth: 0}]}>
                  <Button transparent onPress={()=>{this.removeTag({tag})}}>
                    <Text note uppercase={false}  style={{color: '#fff', paddingLeft: 1, paddingRight: 1}}>#{tag}</Text>
                  </Button>
              </ListItem>}>
        </List>);
    }
    else {
      return
    }
  }

  removeTag(t) {
    /*TODO FIX THIS (currently only able to remove last tag added)*/
    var index = this.state.trekTags.indexOf(t.tag);
    var newTags = this.state.trekTags;
    if (index > -1) {
      newTags.splice(index, 1);
      this.setState({trekTags: newTags})
    }
  }

  renderSummary() {
    if (this.state.showSummary) {
      return (<View><Button transparent full style={{width: '100%', backgroundColor: '#c9f4ff'}} onPress={() => {  this.setState({showSummary: false}) }}>
                <Text uppercase={false} note>save summary</Text>
              </Button>
              <TextInput
                multiline={true}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholder=''
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.summary}
                onChangeText={summary=> this.setState({summary})}
                style={{backgroundColor: '#fff', width: '100%', marginBottom: 10}}
              /></View>);
    }
    else {
      return (<Button full style={{width: '100%', backgroundColor: '#c9f4ff'}} onPress={() => {  this.setState({showSummary: true}) }}>
                <Text uppercase={false} note>{this.state.summary !== '' ? "edit summary" : "add a summary"}</Text>
              </Button>);
    }
  }

  render() {

    const AnimateHeaderHeight = this.AnimatedHeaderValue.interpolate({
            inputRange: [ 0, ( Header_Maximum_Height - Header_Minimum_Height ) ],
            outputRange: [ Header_Maximum_Height, Header_Minimum_Height ],
            extrapolate: 'clamp'
        });

    return (
       <View style = { styles.MainContainer }>
          <ScrollView
            scrollEventThrottle = { 16 }
            contentContainerStyle = {{ paddingTop: Header_Maximum_Height }}
            onScroll = { Animated.event([{ nativeEvent: { contentOffset: { y: this.AnimatedHeaderValue }}}])}>
          <Content style={{marginBottom: 60}} keyboardShouldPersistTaps="always" keyboardDismissMode='on-drag'>
            {this.renderSummary()}
            {this.constructItinerary()}
          </Content>
        </ScrollView>
         <Animated.View style = {[ styles.HeaderStyle, styles.HeaderInputStyle, { height: AnimateHeaderHeight }]}>
             <Header noShadow={true} style={{justifyContent: 'center', backgroundColor: '#6db5ff'}}>
               <Left>
                 <Button
                   transparent
                   title="Submit"
                   onPress={() => { Alert.alert(
                     '',
                     `Are you sure you want to go back and cancel your post?`,
                     [
                       {text: 'No, stay here.', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                       {text: 'Yes, remove this.', onPress: () => this.props.navigation.goBack()},
                     ],
                     { cancelable: true }
                   )   }}>
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
            <Card transparent style={[styles.HeaderInputStyle, {marginTop: -5, borderLeftWidth:0, borderTopWidth:0, borderBottomWidth:0, borderRightWidth: 0, width: '90%', alignSelf: 'center'}]}>
                <CardItem style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle]}>
                  <View style={styles.IconTextSameLine}>
                    <Button transparent style={styles.HeaderButtonStyle}>
                      <Icon name="ios-information-circle-outline" style={{color: '#fff'}}></Icon>
                    </Button>
                    <Input
                      placeholder='title'
                      placeholderTextColor= '#fff'
                      returnKeyType="done"
                      keyboardType="default"
                      autoCorrect={false}
                      value ={this.state.trekName}
                      onChangeText={trekName=> this.setState({trekName})}
                      style={[styles.HeaderInputStyle, {color: '#fff', textDecorationLine:'none'}]}
                      />
                  </View>
                </CardItem>
                <CardItem style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle]}>
                  <View style={styles.IconTextSameLine}>
                    <Button transparent style={styles.HeaderButtonStyle}>
                      <Icon name="logo-usd" style={{color: '#fff'}}/>
                    </Button>
                    <TextInput
                      keyboardType='numeric'
                      placeholder='0'
                      placeholderTextColor= '#fff'
                      returnKeyType="done"
                      autoCorrect={false}
                      value ={this.state.budget == '0' ? '' : this.state.budget}
                      onChangeText={budget => this.setState({budget: budget})}
                      style={[styles.HeaderInputStyle, {color: '#fff', textDecorationLine:'none', width: '100%'}]}
                      />
                  </View>
                </CardItem>
                <CardItem style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle]}>
                  <View style={styles.IconTextSameLine}>
                    <Button transparent style={styles.HeaderButtonStyle}>
                      <Icon name="ios-link" style={{color: '#fff'}}/>
                    </Button>
                    <Input
                      placeholder='add tags'
                      placeholderTextColor= '#fff'
                      returnKeyType="done"
                      keyboardType="default"
                      autoCorrect={false}
                      value ={this.state.currentTag}
                      onChangeText={currentTag => this.setState({currentTag: currentTag.replace(' ', '')})}
                      style={[styles.HeaderInputStyle, {color: '#fff', textDecorationLine:'none'}]}
                      />
                    <Button
                      style={styles.HeaderButtonStyle}
                      transparent
                      onPress= {() => {
                        var ct = this.state.trekTags;
                        ct.push(this.state.currentTag)
                        this.setState({trekTags: ct, currentTag: ''})
                      }}>
                      {this.state.currentTag != '' ? <Icon name="ios-add-outline" style={{fontWeight: 'bold', color: '#fff'}}/> : null}
                    </Button>
                  </View>
                </CardItem>
                {this.state.trekTags != [] ? this.renderTagList() : null}
            </Card>
         </Animated.View>

         <Button full
                 style={{width: '100%', backgroundColor:'#5b4fff', position: 'absolute', bottom: 0}}
                 onPress={() => {  this.addDay() }}>
           <Icon name="ios-add"></Icon>
           <Text uppercase={false}  style={{color: 'white'}}>Add a day</Text>
         </Button>
       </View>
    );
  }
}

const styles =  {
    MainContainer:
    {
        flex: 1,
        paddingTop: (Platform.OS == 'ios') ? 20 : 0
    },
    HeaderStyle:
    {
        position: 'absolute',
        left: 0,
        right: 0,
        top: (Platform.OS == 'ios') ? 20 : 0,
    },
    HeaderInputStyle:
    {
      backgroundColor: '#6db5ff',
      height: 60
    },
    HeaderCardItemStyle:
    {
      width: '100%',
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth:0,
      borderBottomWidth: .5,
      borderBottomColor: '#fff'
    },
    HeaderButtonStyle:
    {
      marginTop: 5,
      marginRight: 5
    },
    IconTextSameLine:
    {
      paddingLeft: 8,
      width: 100,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
}

export default AddTrip;
