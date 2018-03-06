import React, { Component } from 'react';
import { ScrollView, View, Image, KeyboardAvoidingView, Platform, TextInput  } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Toast, List, ListItem, Item, Card, CardItem, Input, Form, Separator , Icon,Picker, Content, Segment, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';
import MaterialCommunityIcons from'react-native-vector-icons/MaterialCommunityIcons'

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
                user: userEmail,
                displayName: firebase.auth().currentUser.displayName ? firebase.auth().currentUser.displayName : 'guest',
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
                  var tag = self.state.tipTags[i].toLowerCase().trim().replace(/\s+/, "")
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

  renderTagList() {
    if (this.state.tipTags.length > 0) {
      return (
        <List
          style={[styles.HeaderInputStyle]}
          dataArray={this.state.tipTags}
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
    var index = this.state.tipTags.indexOf(t.tag);
    var newTags = this.state.tipTags;
    if (index > -1) {
      newTags.splice(index, 1);
      this.setState({tipTags: newTags})
    }
  }

  render() {
    return (
      <View style = { styles.MainContainer }>
          <Header noShadow={true} style={{justifyContent: 'center', backgroundColor: '#6db5ff'}}>
            <Left>
              <Button
                transparent
                title="Submit"
                style={{width: 50}}
                onPress={() => {  this.props.navigation.goBack()  }}>
                  <Icon name="ios-arrow-back" style={{color: '#fff'}}/>
              </Button>
            </Left>
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
            <View style={{height: '100%', justifyContent: 'center'}}>
              <Card transparent style={[styles.HeaderInputStyle, {height: '100%', borderLeftWidth:0, borderTopWidth:0, borderBottomWidth:0, borderRightWidth: 0}]}>
                  <CardItem style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle]}>
                    <View style={styles.IconTextSameLine}>
                      <Icon name="ios-information-circle-outline" style={{color: '#fff'}}></Icon>
                      <Input
                        placeholder='title'
                        placeholderTextColor= '#fff'
                        returnKeyType="done"
                        keyboardType="default"
                        autoCorrect={false}
                        value ={this.state.tipTitle}
                        onChangeText={tipTitle=> this.setState({tipTitle})}
                        style={[styles.HeaderInputStyle, {color: '#fff', textDecorationLine:'none'}]}
                        />
                    </View>
                  </CardItem>
                  <CardItem transparent style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle]}>
                    <View style={styles.IconTextSameLine}>
                      <Icon name="ios-link" style={{color: '#fff'}}/>
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
                          var ct = this.state.tipTags;
                          ct.push(this.state.currentTag)
                          this.setState({tipTags: ct, currentTag: ''})
                        }}>
                        {this.state.currentTag != '' ? <Icon name="ios-add-outline" style={{fontWeight: 'bold', color: '#fff'}}/> : null}
                      </Button>
                    </View>
                  </CardItem>
                  {this.state.tipTags != [] ? this.renderTagList() : null}
                  <CardItem transparent style={[styles.HeaderInputStyle, styles.HeaderCardItemStyle, {height: '100%'}]}>
                    <View style={[styles.IconTextSameLine]}>
                      <Button transparent style={styles.HeaderButtonStyle}>
                        <MaterialCommunityIcons name="lightbulb-outline" style={{color: '#fff'}} size={20}/>
                      </Button>
                      <TextInput
                        textAlignVertical={'top'}
                        multiline={true}
                        placeholder='tip'
                        placeholderTextColor= '#fff'
                        returnKeyType="done"
                        keyboardType="default"
                        autoCorrect={false}
                        value ={this.state.tipText}
                        onChangeText={tipText=> this.setState({tipText})}
                        style={[styles.HeaderInputStyle, {color: '#fff', textDecorationLine:'none', width: '100%', fontSize:15}]}
                      />
                    </View>
                  </CardItem>
              </Card>
            </View>
          </Content>
    </View>
    );
  }
}

const styles =  {
    MainContainer:
    {
        flex: 1,
        paddingTop: (Platform.OS == 'ios') ? 20 : 0,
        backgroundColor:"#6db5ff",
        height:'100%'
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
      height: 60,
      width: '100%',
      borderBottomWidth: 0
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

export default AddTip;
