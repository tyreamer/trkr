import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import axios from 'axios';
import TrekDetail from './TrekDetail.js'
import { Container, Header, Button, Icon, Content, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase';

class TrekList extends Component {

  state = {
    treks: [],
    users: []
  }

  componentWillMount() {

    axios.get('http://demo1996132.mockable.io/trekker')
          .then(response =>
              this.setState({
                treks: response.data.treks,
                users: response.data.users
              })
          );
  }

  createTrekList() {
    var list = []
    this.state.treks.map(trek =>{
      var u = this.state.users.filter(v => v.id == trek.user);
      list.push(<TrekDetail key={trek.id} trekRecord={trek} user={u[0]} navigation = {this.props.navigation}/>)
    })
    return list
  }

  render() {
    return (
          <View>
            {this.createTrekList()}
          </View>
    );
  }
}


export default TrekList;
