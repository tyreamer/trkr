import React, { Component } from 'react';
import { ScrollView, View, Image, ImageBackground } from 'react-native';
import axios from 'axios';
import TrekDetail from './TrekDetail.js'
import { Container, Header, Button, Icon,Grid, Col, Content, Card, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Text, Spinner } from 'native-base';
import firebase from 'firebase';

class Profile extends Component {
    constructor(props) {
        super(props);
    }

    state = {
      user: {
        displayName: '',
        photo: '',
        lastSignIn: '',
        email: ''
      },
      treks: []
    }

    getUserDetails () {
      var self = this
      var userInfo = {
        displayName: '',
        photo: '',
        lastSignIn: '',
        email: ''
      }

      firebase.database().ref('/users/' + this.props.user).once('value')
              .then(function(snapshot) {
                 userInfo.displayName = (snapshot.val() && snapshot.val().displayName) || 'guest';
                 userInfo.photo = (snapshot.val() && snapshot.val().photo || '');
                 userInfo.lastSignIn = (snapshot.val() && snapshot.val().lastSignInTimestamp || Date.now());
                 userInfo.email = (snapshot.val() && snapshot.val().email || '');
               })
               .then(() => self.setState({user: userInfo})  )
    }

    componentWillMount() {
      console.log('props for profile')
      console.log(this.props)
      this.getUserDetails()
    }

    getTreks() {
      var email = this.state.user.email.toLowerCase().replace(/\./g, ',');
      var treks = [];
      var self = this;

      firebase.database().ref('/user-posts').child(email).once('value')
          .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                        treks.push(child.val())
                      })
                    })
          .then(() => self.setState({treks: treks}))
    }

    createTrekList() {
      this.getTreks() 
      var list = []

      this.state.treks.map(trek => {
        list.push(<TrekDetail key={trek.id} trekRecord={trek} navigation = {this.props.navigation}/>)
      })

      return list;
    }

  render() {

    var user = this.state.user;

    var img = '';
    if (user !== null){
      if (user.photo !==  null) {
        img =  user.photo
      }
    }

    if (this.state.user.email !== '') {
          return (
            <Container>
                <Content>
                  <Header style={{backgroundColor: '#f8f8f8'}}>
                    <Left>
                      <Button
                        transparent
                        title="Submit"
                        onPress={() => {
                                  this.props.navigation.navigate('Home')
                                }}>
                          <Icon name="ios-arrow-back" style={{color: 'gray'}}/>
                      </Button>
                    </Left>
                    <Body>
                      <Text style={{paddingLeft: 10, paddingTop: 5, alignSelf: 'flex-end'}}> {this.state.user.displayName}</Text>
                    </Body>
                  </Header>
                  <Grid style={{ backgroundColor: '#fff', height: 85 }}>
                      <Col>
                        <View style={styles.iconTextSameLine, {paddingLeft: 5, paddingTop: 15}}>
                          <Thumbnail source={{ uri: img }} />
                        </View>
                      </Col>
                      <Col style={{paddingTop: 25}}>
                        <Button full transparent style={styles.headerButtonStyle}>
                          <Icon name="ios-link" style={styles.headerIconStyle}></Icon>
                          <Text style={styles.headerTextStyle}> 34</Text>
                        </Button>
                      </Col>
                      <Col style={{paddingTop: 25}}>
                        <Button full transparent style={styles.headerButtonStyle}>
                          <Icon name="ios-book" style={styles.headerIconStyle}> </Icon>
                          <Text style={styles.headerTextStyle}>173</Text>
                        </Button>
                      </Col>
                      <Col style={{paddingTop: 25}}>
                        <Button full transparent style={styles.headerButtonStyle}>
                          <Icon name="ios-plane" style={styles.headerIconStyle}></Icon>
                          <Text style={styles.headerTextStyle}>173</Text>
                        </Button>
                      </Col>
                      <Col style={{paddingTop: 25}}>
                        <Button full transparent style={styles.headerButtonStyle}>
                          <Icon name="md-people" style={styles.headerIconStyle}> </Icon>
                          <Text style={styles.headerTextStyle}>14K</Text>
                        </Button>
                      </Col>
                  </Grid>
                  <List>
                    {this.createTrekList()}
                  </List>
                </Content>
            </Container>
          );
    }
    else {
      //Still loading
      return <Spinner />
    }
  }
}

const styles =  {
  invisible: {backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)'},
  fullHeight: {height: '100%'},
  iconTextSameLine:{
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: 100
    },
  headerTextStyle :{
    fontSize:14,
    color: '#000',
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  headerIconStyle: {
    color: 'rgba(0,0,0,.6)',
    fontSize: 20,
    alignSelf: 'center'
  },
  headerButtonStyle: {
    flexDirection: 'column'
  }
}


export default Profile;
