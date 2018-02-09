import React , { Component } from 'react';
import { View, Image } from 'react-native';
import { Container, Header, Button, Icon, Content, Card, CardItem, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';

const TrekItem = (props) => {
  var location = props.stop.description
  //var notes = props.stop.notes

//  makeNotes() {
  //  notes.map(n => <Text note>{n}</Text>)
  //}

  return (
          <CardItem>
            <Left>
              <Body>
                <Text>{location}</Text>
              </Body>
            </Left>
          </CardItem>
  )
}

export default TrekItem;
