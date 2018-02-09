import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { Container, Header, Button, Icon, Content, Grid, Col, Segment, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';

class Interactions extends Component {

  renderInteractions() {
    return (
      <Grid>
        <Col>
          <Button full transparent style={{flexDirection: 'row'}}>
            <Icon name="ios-heart" style={{paddingLeft: 5}}></Icon>
            <Text> 34</Text>
          </Button>
        </Col>
        <Col>
          <Button full transparent>
            <Icon name="md-chatbubbles" style={{paddingLeft: 5}}></Icon>
            <Text> 34</Text>
          </Button>
        </Col>
      </Grid>
  )}

  render() {
    return this.renderInteractions();
  }
}

const styles = {
}

export default Interactions;
