import React, { Component } from 'react';
import { ScrollView, View, Image, KeyboardAvoidingView, TouchableOpacity, TextInput  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, Item, Label, Card, CardItem, Input, Form, Separator , Icon,Picker, Content, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';
import Autocomplete from 'react-native-autocomplete-input';

class AddResource extends Component {

   constructor(props) {
     super(props)
     this.state = {
         resourceTitle: '',
         resourceLink: '',
         resourceSummary:'',
         possibleLinks: []
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
                        self.props.navigation.goBack()
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

    var self = this
    var hideResults = false;

    if (this.state.resourceLink != '') {
      hideResults = true
    }

    return (
      <Container>
          <Header header style={{justifyContent: 'center', backgroundColor: '#6db5ff'}}>
            <Left>
              <Button
                transparent
                title="Submit"
                style={{width: 40}}
                onPress={() => {  this.props.navigation.goBack()  }}>
                  <Icon name="ios-arrow-back" style={{color: '#fff'}}/>
              </Button>
            </Left>
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
          <Content style={{backgroundColor: '#6db5ff'}}>
            <Form>
              <View style={{flex: 1, zIndex: 15}}>
                <Autocomplete
                  placeholder="link"
                  hideResults={hideResults}
                  style={{paddingLeft: 10, backgroundColor: '#fff'}}
                  listContainerStyle={{backgroundColor: '#fff', width: '100%', marginRight: 0, marginLeft:0}}
                  listStyle={{borderLeftWidth: 0, borderRightWidth: 0}}
                  data={this.state.possibleLinks}
                  defaultValue={this.state.resourceLink}
                  renderItem={link => (
                    <TouchableOpacity onPress={() => this.setState({ resourceLink: link })}>
                      <Text>{link}</Text>
                    </TouchableOpacity>
                  )}
                  onChangeText={async (text) => {
                      if (text && text.trim() != '') {
                          const response = await fetch(`http://suggestqueries.google.com/complete/search?client=chrome&q=${'http://' + text}`, {
                              method: `get`
                          });
                          const data = await response.json();
                          console.log(text)
                          self.setState({possibleLinks: data[1]})
                      } else {
                          hideResults = false
                          self.setState({possibleLinks: []})
                      }
                  }}
                  terms={['atlanta', 'atng', 'igloo']}
                />
              </View>
              <View>
                <Input
                  placeholder='title'
                  placeholderTextColor='#fff'
                  returnKeyType="done"
                  keyboardType="default"
                  autoCorrect={false}
                  value ={this.state.resourceTitle}
                  onChangeText={resourceTitle=> this.setState({resourceTitle})}
                  style={{backgroundColor: '#6db5ff', color:'#fff', fontWeight: "bold", paddingLeft: 10}}
                  />
                  <TextInput
                    multiline={true}
                    numberOfLines={5}
                    placeholder='description'
                    placeholderTextColor='#fff'
                    returnKeyType="done"
                    keyboardType="default"
                    autoCorrect={false}
                    value ={this.state.resourceSummary}
                    onChangeText={resourceSummary=> this.setState({resourceSummary})}
                    style={{backgroundColor: '#6db5ff', color:'#fff', paddingLeft: 10}}
                    />
              </View>
            </Form>
          </Content>
      </Container>
    );
  }
}


export default AddResource;
