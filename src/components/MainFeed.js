import React, { Component } from 'react';
import { ScrollView, View, Image, Linking } from 'react-native';
import axios from 'axios';
import TrekDetail from './TrekDetail.js'
import { Container, Header, Button, Icon, Content, Segment, Card, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';
import TipDetail from './TipDetail.js'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

class MainFeed extends Component {

  constructor(props) {
    super(props)
    this.removeItem = this.removeItem.bind(this)
  }

  state = {
    feedList: []
  }

  componentWillMount() {
      var self = this

      var keys = [
        "/treks",
        "/resources",
        "/tips"
      ];
      var promises = keys.map(function(key) {
        return firebase.database().ref(key).once("value");
      });

      var masterList = [];
      Promise.all(promises).then(function(snapshots) {

        snapshots.forEach(function(snapshot) {
          //merge into one feed list
          snapshot.forEach(function(child) {
            masterList.unshift({type: snapshot.key, id: child.key, details: child.val()})
          })
        });
      })
      .then(() => {
        masterList.sort(this.sortFunction)
        self.setState({feedList : masterList})
      });

    /*  firebase.database().ref('/treks').once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    trekList.unshift({id: child.key, details: child.val()})
                  })
            })
            .then(() => self.setState({treks: trekList}))*/
  }

  sortFunction(a, b) {
      if (a.details.datePosted === b.details.datePosted) {
          return 0;
      }
      else {
          return (a.details.datePosted < b.details.datePosted) ? 1 : -1;
      }
  }

  removeItem(key) {
    var $idx;

    for (var i = 0; i < this.state.feedList.length; i++) {
        if (this.state.feedList[i].id == key)
        {
            $idx = i;
            break;
        }
    }

    var newFeedList = this.state.feedList;
    newFeedList.splice(i, 1);
    this.setState({feedList: newFeedList})
  }

  createFeed() {
    var list = []
    this.state.feedList.map(item =>{
      switch(item.type) {
        case "treks": list.push(<TrekDetail key={item.id} id= {item.id} trekRecord={item.details} navigation = {this.props.navigation} handleDeletedTrek = {this.removeItem}/>)
          break;

        case "resources": list.push(<Card style={{width: '100%'}} key={item.id}>
                    <CardItem button onPress={() => { Linking.openURL(item.details.link)}}>
                      <View style={{flexDirection: 'column', alignSelf: 'flex-start', width: '90%'}}>
                          <Text style={{fontWeight: "bold"}}>{item.details.resourceTitle}</Text>
                          <Text note>{item.details.resourceSummary}</Text>
                      </View>
                        <EvilIcons style={{color: 'gray',position:'absolute', right: 5}} size={25} name="external-link"/>
                    </CardItem>
                   </Card>)
          break;

        case "tips": list.push(<TipDetail key={item.id} id={item.id} tip={item.details} navigation ={this.props.navigation} handleDeletedTip={this.removeItem}/>)
          break;

        default:
          break;
      }
    })

    return list
  }

  render() {
    return (
          <View>
            {this.createFeed()}
          </View>
    );
  }
}


export default MainFeed;
