import React , { Component } from 'react';
import { View, Image, ImageBackground, TouchableOpacity, Toast, Alert } from 'react-native';
import { Container, Header, Button, Grid, Col, Content, Card, CardItem, Icon, Separator, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import Interactions from './Interactions';
import StaticGMap from './StaticGMap';
import Expand from 'react-native-simple-expand';
import firebase from 'firebase';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TagList from './TagList'

class TrekDetail extends Component  {

  constructor(props) {
      super(props)
      // this.deletePost=this.deletePost.bind(this);
  }

  componentWillMount() {
    this.setState({ record: this.props.id, tip: this.props.tip});
  }

  goToPost() {
    this.props.navigation.navigate('ViewTrek', {trekRecord: this.props.trekRecord, navigation: this.props.navigation})
  }

  deleteTip(key) {
    var updates = {};
    var self = this;

    //remove from posts
    var trekRef = firebase.database().ref().child('tips');
    trekRef.once('value', function(snapshot) {
        if (snapshot.hasChild(key)) {
          trekRef.child(key).remove();
        }
      });

    //remove from user tips
    var userPostRef = firebase.database().ref().child('user-tips').child(firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ','));
    userPostRef.once('value', function(snapshot) {
        if (snapshot.hasChild(key)) {
          userPostRef.child(key).remove();
        }
      });

    //remove post from tags
    var tagRef = firebase.database().ref().child('tags')
    tagRef.once('value', function(snapshot) {
      if (self.props.tip.tipTags !== null && self.props.tip.tipTags !== undefined) {
        for (i = 0; i < self.props.tip.tipTags.length; i++) {
          var tag = self.props.tip.tipTags[i].toLowerCase().trim()
          if (snapshot.hasChild(tag)) {
            tagRef.child(tag).child(key).remove();
          }
        }
      }
    });

    this.props.handleDeletedTip(key);
  }

  renderEditable() {
    if(this.props.tip.user == firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')){
      return (
          <TouchableOpacity style={{alignSelf:'flex-end'}} onPress={() => {
          Alert.alert(
            'Delete Tip',
            `Do you want to delete this tip?`,
            [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'Yes', onPress: () => this.deleteTip(this.props.id) },
            ],
            { cancelable: true }
          )}}>
              <Icon name="ios-remove-circle-outline" style={{color:'red'}}/>
          </TouchableOpacity>
      );
    }
  }

render() {
  var date = new Date(this.props.tip.datePosted);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  date = (date.getMonth()+ 1 + '/' + date.getDate() + '/' +  date.getFullYear());
  return (<Card style={{width: '100%'}}>
              <CardItem header>
                <Grid>
                  <Col size={8}>
                    <Text style={{fontWeight: 'bold'}}>{this.props.tip.tipTitle}</Text>
                  </Col>
                  <Col size={3} style={{flexDirection:'column'}}>
                    <Text note style={{alignSelf:'flex-end'}}
                      onPress={() => {  this.props.navigation.navigate('UserProfile', {user: this.props.tip.user, navigation: this.props.navigation}); }}>
                      {this.props.tip.displayName ? this.props.tip.displayName: ""}
                    </Text>
                    <Text note style={{alignSelf:'flex-end'}}>{date}</Text>
                  </Col>
                </Grid>
              </CardItem>
              <CardItem style={{flexDirection: 'column', alignItems:'flex-start', paddingTop: 0}}>
                <Text note>{this.props.tip.tipText}</Text>
                <TagList tags={this.props.tip.tipTags} navigation = {this.props.navigation}/>

                {this.renderEditable()}
              </CardItem>
            </Card>);
  }
}

export default TrekDetail;
