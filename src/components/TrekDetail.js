import React , { Component } from 'react';
import { View, Image, ImageBackground } from 'react-native';
import { Container, Header, Button, Icon, Content, Card, CardItem, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import Interactions from './Interactions';

const TrekDetail = (props) => {
  var img=''
  if (props.trekRecord.featuredImage != undefined) {
    img = props.trekRecord.featuredImage
  }

  var date = new Date(props.trekRecord.datePosted);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  date = (months[date.getMonth()]
          + ' ' + date.getDate()
          + ', ' +  date.getFullYear());

  var trekSummary = props.trekRecord.title;
  /*trekSummary += props.trekRecord.days.length > 1 ? " days" : " day"
  trekSummary += " in " + props.trekRecord.days[0].stops[0].stops;
  trekSummary += props.trekRecord.days[0].stops.length > 1 ? " and " : "";
  if (props.trekRecord.days.stops.length > 1 ) {
      trekSummary += props.trekRecord.days.stops.length > 2 ? props.trekRecord.days.stops.length + " other stops" : " and 1 other stop"
  }*/

  var tags =''
  if (props.trekRecord.tags != undefined) {
    props.trekRecord.tags.join(' ')
  }

  return (
      <View>
        <Card style={{flex: 0, shadowColor: 'transparent', shadowOpacity: 0,  shadowColor: 'transparent', shadowOffset: { height: 0, width: 0 }, elevation: 0}}>
          <CardItem style={{paddingLeft: 0, paddingRight:0, paddingBottom: 0, paddingTop: 0}}>
            <Body>
              <Button full transparent style={{position: 'absolute', right: 0, top: 0, zIndex: 18}}>
                <Icon name="ios-add-circle-outline" style={{fontSize: 20, paddingLeft: 5, color: 'white'}}></Icon>
              </Button>
              <View style={{paddingLeft: 5, paddingTop: 10}}>
                <Text style={{fontSize: 15}}> {props.trekRecord.title}</Text>
              {/*  <Text note style={{fontSize: 12}}> {trekSummary}</Text> */}
              </View>
              <Image source={{uri: img }} resizeMode="contain" style={{height: 250, width: '100%'}}/>
              <Text style={{fontSize: 8,paddingLeft: 5, color: 'blue'}}>{tags}</Text>
            </Body>
          </CardItem>
          {/*<CardItem style={{paddingTop: 0, paddingBottom: 0}}>
            <Left>
                <Interactions/>
            </Left>
          </CardItem>*/}
          <CardItem style={{flexDirection: 'column', paddingTop: 0}}>
                <Text style={{alignSelf:'flex-end', fontSize: 10, textDecorationLine:'underline'}}
                        onPress={() => {
                            props.navigation.navigate('UserProfile', {user: props.trekRecord.user, navigation: props.navigation })                        
                        }}>
                        {props.trekRecord.displayName}
                </Text>
                <Text  style={{alignSelf:'flex-end', fontSize: 10}} note>{date}</Text>
          </CardItem>
        </Card>
      </View>
  )
}

export default TrekDetail;
