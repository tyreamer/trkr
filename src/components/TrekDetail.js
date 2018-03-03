import React , { Component } from 'react';
import { View, Image, ImageBackground, TouchableOpacity, Toast } from 'react-native';
import { Container, Header, Button, Icon, Grid, Col, Content, Card, CardItem, Separator, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import Interactions from './Interactions';
import StaticGMap from './StaticGMap';
import Expand from 'react-native-simple-expand';
import firebase from 'firebase';
import TagList from './TagList'

class TrekDetail extends Component  {

  constructor(props) {
      super(props)
       this.deletePost=this.deletePost.bind(this);
  }

  componentWillMount() {
    this.setState({  open: false, record: this.props.id, trek: this.props.trekRecord});
  }

  goToPost() {
    this.props.navigation.navigate('ViewTrek', {trekRecord: this.props.trekRecord, navigation: this.props.navigation})
  }

  formatNumber(num) {
    if (num >= 1000000000) {
       return  (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    }
    if (num >= 1000000) {
       return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
       return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return 0;
  }

  getActiveColor() {
    if (this.state.open) return '#6db5ff'
  }

  deletePost(key) {
    var updates = {};
    var self = this;

    //remove from posts
    var trekRef = firebase.database().ref().child('treks');
    trekRef.once('value', function(snapshot) {
        if (snapshot.hasChild(key)) {
          trekRef.child(key).remove();
        }
      });

    //remove from user posts
    var userPostRef = firebase.database().ref().child('user-posts').child(firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ','));
    userPostRef.once('value', function(snapshot) {
        if (snapshot.hasChild(key)) {
          userPostRef.child(key).remove();
        }
      });

    //remove post from tags
    var tagRef = firebase.database().ref().child('tags')
    tagRef.once('value', function(snapshot) {
      if (self.state.trek.trekTags !== null && self.state.trek.trekTags !== undefined) {
        for (i = 0; i < self.state.trek.trekTags.length; i++) {
          var tag = self.state.trek.trekTags[i].toLowerCase().trim()
          if (snapshot.hasChild(tag)) {
            tagRef.child(tag).child(key).remove();
          }
        }
      }
    });

    this.props.handleDeletedTrek(key);
  }

render() {
  var img=''
  if (this.props.trekRecord.featuredImage != undefined) {
    img = this.props.trekRecord.featuredImage
  }

  //date
  var date = new Date(this.props.trekRecord.datePosted);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  date = ((date.getMonth()+1)
          + '/' + date.getDate()
          + '/' +  date.getFullYear());

  //budget
  var budget = this.formatNumber(this.props.trekRecord.budget)

  //stops
  var totalStops = 0;
  if (this.props.trekRecord.days != undefined && this.props.trekRecord.days != null) {
    for (var i = 0; i< this.props.trekRecord.days.length; i++) {
        if (this.props.trekRecord.days[i].stops != undefined && this.props.trekRecord.days[i].stops != null) {
         totalStops = totalStops + this.props.trekRecord.days[i].stops.length
       }
    }
  }

  return (
        <Card>
          <CardItem header button style={styles.CardElevatedStyle} onPress= {() => this.goToPost() }>
            <Col size={7}>
              <Text style={{fontSize: 20, paddingLeft: 10}}>{this.props.trekRecord.title} </Text>
            </Col>
            <Col size={3} style={{paddingRight: 5}}>
                <Text style={{alignSelf:'flex-end', fontSize: 12, textDecorationLine:'underline'}}
                        onPress={() => {
                            this.props.navigation.navigate('UserProfile', {user: this.props.trekRecord.user, navigation: this.props.navigation })
                        }}>
                        {this.props.trekRecord.displayName}
                </Text>
                <Text  style={{alignSelf:'flex-end', fontSize: 10}} note>{date}</Text>
            </Col>
          </CardItem>
          <Expand value={this.state.open}>
            <Grid style={{backgroundColor: this.getActiveColor(), padding: 10}}>
              <Col size={4} style={styles.GridColStyle}>
                <Icon name="md-calendar" style={styles.CardIconStyle}></Icon>
                <Text style={styles.CardTextStyle}>{this.props.trekRecord.days.length}</Text>
              </Col>
              <Col size={4} style={styles.GridColStyle}>
                <Icon name="logo-usd" style={styles.CardIconStyle}></Icon>
                <Text style={styles.CardTextStyle}>{budget}</Text>
              </Col>
              <Col size={4} style={styles.GridColStyle}>
                <Icon name="ios-pin" style={styles.CardIconStyle}></Icon>
                <Text style={styles.CardTextStyle}>{totalStops}</Text>
              </Col>
            </Grid>
            {this.props.trekRecord.summary ? <CardItem style={[styles.CardElevatedStyle], {backgroundColor: '#f8f8f8'}}><Text note>{this.props.trekRecord.summary}</Text></CardItem>: null}
          </Expand>
          <TouchableOpacity onPress={() => this.setState({ open: !this.state.open })}>
            <CardItem cardBody style={{paddingLeft: 0, paddingRight:0, paddingBottom: 0, paddingTop: 0}}>
              <Body>
                {img === '' ? <StaticGMap trekDays={this.props.trekRecord.days} onPress= {() => this.goToPost() }/> : <Image source={{uri: img }} resizeMode="contain" style={{height: 250, width: '100%'}}/>}
              </Body>
            </CardItem>
          </TouchableOpacity>
          <Expand value={this.state.open}>
            <CardItem>
              <TagList tags={this.props.trekRecord.trekTags} navigation = {this.props.navigation}/>
            </CardItem>
          </Expand>
          <CardItem style={{paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, backgroundColor: this.getActiveColor() }}>
                <Interactions handleDelete={this.deletePost} id={this.props.id} user={this.props.trekRecord.user} summary={this.props.trekRecord.summary} title={this.props.trekRecord.title}/>
          </CardItem>
          <CardItem style={[{}, styles.CardElevatedStyle]}>
            <TouchableOpacity style={{width: '100%', alignItems: 'center'}} onPress={() => this.setState({ open: !this.state.open })}>
                 {this.state.open ? <Icon name="md-arrow-dropup"/>: <Icon name="md-arrow-dropdown"/>}
            </TouchableOpacity>
          </CardItem>
        </Card>
      )
  }
}

const styles= {
  CardElevatedStyle:
  {
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor:'#000',
    shadowOpacity:0.6,
    paddingLeft: 0,
    paddingRight:0
  },
  CardTextStyle:
  {
    fontSize: 25,
    color: '#fff',
    paddingLeft: 5
  },
  CardIconStyle:
  {
    color: '#fff',
    fontSize: 15,
  },
  GridColStyle:
  {
    flexDirection: 'row',
    alignItems: 'center'
  }
}

export default TrekDetail;
