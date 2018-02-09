import React, { Component } from 'react';
import { ScrollView, View, Image, KeyboardAvoidingView  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, Item, Card, CardItem, Input, Form, Separator , Icon,Picker, Content, Segment, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';

class AddResource extends Component {

   constructor(props) {
     super(props)
     this.state = {
         resourceTitle: '',
         resourceLink: '',
         resourceSummary:''
       }
   }

  insertResource() {
    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')
    var self = this
    if (this.state.resourceTitle == '' || this.state.resourceLink == '') {
      Toast.show({
        text: 'Make sure to provide a title and link before saving',
        position: 'bottom',
        type: 'danger'
      })
      return;
    }
    firebase.database().ref('/users/' + userEmail).once('value')
        .then(function(snapshot) {
               var resourceData = {
                resourceTitle: self.state.resourceTitle,
                link: self.state.resourceLink,
                resourceSummary: self.state.resourceSummary,
                datePosted: Date.now()
              };

              // Get a key for a new Post.
              var newResourceKey = firebase.database().ref().child('resources').push().key;

              // Write the new post's data simultaneously in the resources list and the user's resource list.
              var updates = {};
              updates['/resources/' + newResourceKey] = resourceData;
              updates['/user-resources/' + userEmail + '/' + newResourceKey] = resourceData;

              firebase.database().ref().update(updates)
                    .then(() => {
                        Toast.show({
                          text: 'Saved!',
                          position: 'bottom',
                          type: 'success'
                        })
                        self.props.navigation.navigate('Home')
                    })
                    .catch(() => {
                      Toast.show({
                        text: 'Something went wrong, please try again.',
                        position: 'bottom',
                        type: 'danger'
                      })
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
            <Body>
              <Text style={{color: 'white'}}>
                New Resource
              </Text>
            </Body>
            <Right>
              <Button
                style={{backgroundColor:'#ff5858'}}
                full
                title="Submit"
                onPress={() => {  this.insertResource()  }}>
                  <Text style={{color: '#fff'}}>Save</Text>
              </Button>
            </Right>
          </Header>
          <Content>
            <Separator bordered>
                <Text>Title</Text>
            </Separator>
            <Input
              placeholder=''
              returnKeyType="done"
              keyboardType="default"
              autoCorrect={false}
              value ={this.state.resourceTitle}
              onChangeText={resourceTitle=> this.setState({resourceTitle})}
              style={{backgroundColor: '#fff'}}
              />
              <Separator bordered>
                  <Text>Link</Text>
              </Separator>
              <Input
                placeholder=''
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.resourceLink}
                onChangeText={resourceLink=> this.setState({resourceLink})}
                style={{backgroundColor: '#fff'}}
                />
                <Separator bordered>
                    <Text>Short Description</Text>
                </Separator>
                <Input 
                  placeholder=''
                  returnKeyType="done"
                  keyboardType="default"
                  autoCorrect={false}
                  value ={this.state.resourceSummary}
                  onChangeText={resourceSummary=> this.setState({resourceSummary})}
                  style={{backgroundColor: '#fff', height: 100}}
                  />
          </Content>
    </View>
    );
  }
}


export default AddResource;
