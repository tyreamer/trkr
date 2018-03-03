import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import axios from 'axios';
import { Container, Header, Button, Card, CardItem, Input, Icon, Content, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

class Plan extends Component {
  state = {
    trekName: '',
  }

  render() {
    return (
        <Container>
            <Image source={require('../images/logo.png') }
                    resizeMode="contain"
                    style={{height: 150, width: 150, alignSelf: 'center'}}></Image>
          <Content>
            <Button
              iconRight
              full
                style={{height: 80, width: '100%', justifyContent: 'center', backgroundColor: '#ff5858', flexDirection: 'column'}}
              transparent
              onPress={() => {
                          this.props.navigation.navigate('AddTrip')
                      }}>

              <Icon name='ios-plane' style={{paddingLeft: 10,fontSize: 30, color: '#fff'}}></Icon>
              <Text style={{color: '#fff'}}>Plan a new trip</Text>
            </Button>
            <Button
              iconRight
              full
              style={{height: 80, width: '100%', justifyContent: 'center', backgroundColor: '#ff8142', flexDirection: 'column'}}
              transparent
              onPress={() => {
                          this.props.navigation.navigate('AddResource')
                      }}>
              <Icon name='ios-link' style={{paddingLeft: 10,fontSize: 30, color: '#fff'}}></Icon>
              <Text style={{color: '#fff'}}>Share a resource</Text>
            </Button>
            <Button
              iconRight
              full
              style={{height: 80, width: '100%', justifyContent: 'center', backgroundColor: '#5b4fff', flexDirection: 'column'}}
              transparent
              onPress={() => {
                          this.props.navigation.navigate('AddTip')
                      }}>
              <MaterialCommunityIcons name="lightbulb-outline" style={{alignSelf:'center', color: 'white'}} size={20}/>
              <Text style={{color: '#fff'}}>Share a tip</Text>
            </Button>
          </Content>
        </Container>

    );
  }
}


export default Plan;
