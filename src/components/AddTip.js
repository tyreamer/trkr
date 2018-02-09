import React, { Component } from 'react';
import { ScrollView, View, Image, KeyboardAvoidingView  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, List, ListItem, Item, Card, CardItem, Input, Form, Separator , Icon,Picker, Content, Segment, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';

class AddTip extends Component {

   constructor(props) {
     super(props)
     this.state = {
         tipTitle: '',
         tipText: '',
         tipTags: [],
         currentTag: ''
       }
   }

  insertPost() {
    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')
    var self = this
    if (this.state.tipTitle == '' || this.state.tipText == '') {
      Toast.show({
        text: 'Make sure to provide a title and some text before saving',
        position: 'bottom',
        type: 'danger'
      })
      return;
    }
    firebase.database().ref('/users/' + userEmail).once('value')
        .then(function(snapshot) {
               var tipData = {
                tipTitle: self.state.tipTitle,
                tipText: self.state.tipText,
                tipTags: self.state.tipTags,
                datePosted: Date.now()
              };

              // Get a key for a new Post.
              var newTipKey = firebase.database().ref().child('tips').push().key;

              // Write the new post's data simultaneously in the resources list and the user's resource list.
              var updates = {};
              updates['/tips/' + newTipKey] = tipData;
              updates['/user-tips/' + userEmail + '/' + newTipKey] = tipData;

              var tagRef = firebase.database().ref().child('tags')

              tagRef.once('value', function(snapshot) {
                for (i = 0; i < self.state.tipTags.length; i++) {
                  var tag = self.state.tipTags[i].toLowerCase().trim()
                    if (snapshot.hasChild(tag)) {
                      var updatedTag = {};
                      updatedTag[newTipKey] = 'tip';
                      tagRef.update(updatedTag);
                    }
                    else {
                      var newTag = tagRef.child(tag)
                      newTag.set({
                         [newTipKey] : 'tip'
                      })
                    }
                }
              });


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
                New Tip
              </Text>
            </Body>
            <Right>
              <Button
                style={{backgroundColor:'#ff5858'}}
                full
                title="Submit"
                onPress={() => {  this.insertPost()  }}>
                  <Text style={{color: '#fff'}}>Save</Text>
              </Button>
            </Right>
          </Header>
          <Content>
            <Separator bordered>
                <Text>title</Text>
            </Separator>
            <Input
              placeholder=''
              returnKeyType="done"
              keyboardType="default"
              autoCorrect={false}
              value ={this.state.tipTitle}
              onChangeText={tipTitle=> this.setState({tipTitle})}
              style={{backgroundColor: '#fff'}}
              />
              <Separator bordered>
                  <Text>tip</Text>
              </Separator>
              <Input
                multiline={true}
                placeholder=''
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.tipText}
                onChangeText={tipText=> this.setState({tipText})}
                style={{backgroundColor: '#fff', height: 100}}
                />
                <Separator bordered>
                    <Text>tags</Text>
                </Separator>
                <Card>
                <CardItem style={{backgroundColor: '#f8f8f8'}}>
                  <List dataArray={this.state.tipTags} horizontal={true}
                      renderRow={(tag) =>
                          <ListItem style={{paddingLeft: 5, paddingRight: 5}}>
                              <Text note># {tag}</Text>
                          </ListItem>
                      }>
                  </List>
                </CardItem>
                  <CardItem>
                    <Input
                        placeholder=''
                        returnKeyType="done"
                        keyboardType="default"
                        autoCorrect={false}
                        value ={this.state.currentTag}
                        onChangeText={currentTag=> this.setState({currentTag})}
                        style={{backgroundColor: '#fff', width: '90%'}}
                        />
                      <Button
                        onPress= {() => {
                          var ct = this.state.tipTags;
                          ct.push(this.state.currentTag)
                          this.setState({tipTags: ct, currentTag: ''})
                        }}>
                        <Icon name="ios-add" />
                      </Button>
                    </CardItem>
                </Card>
          </Content>
    </View>
    );
  }
}


export default AddTip;
