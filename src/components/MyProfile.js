import React, { Component } from 'react';
import { ScrollView, View, Image, ImageBackground, Linking } from 'react-native';
import axios from 'axios';
import TrekDetail from './TrekDetail.js'
import { Container, Header, Button, Icon,Grid, Col, Content, Card, Segment, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import firebase from 'firebase'

class MyProfile extends Component {
    constructor(props) {
        super(props);
    }

    state = {
      treks: [],
      resources: [],
      tips: [],
      currentView: ''
    }

    componentWillMount() {
      var self = this
      var email = self.props.user.email.toLowerCase().replace(/\./g, ',');

      var myTreks = [];
      firebase.database().ref('/user-posts').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myTreks.push(child.val())
                  })
            })
            .then(() => self.setState({treks: myTreks}) )

      var myResources = [];
      firebase.database().ref('/user-resources').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myResources.push(child.val())
                  })
            })
            .then(() => self.setState({resources: myResources}) )

      var myTips = [];
      firebase.database().ref('/user-tips').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myTips.push(child.val())
                  })
            })
            .then(() => self.setState({tips: myTips}) )
    }

    createTrekList() {
      var list = []
      var self = this

      if (this.state.treks != undefined) {
        this.state.treks.forEach(function(trek) {
          list.push(<TrekDetail key={trek.id} trekRecord={trek} navigation = {self.props.navigation}/>)
        })

        if (list.length === 0) {
          return (<Card style={{flexDirection: 'column', marginTop: 100, alignItems:'center', justifyContent:'center'}}>
                    <CardItem>
                      <Icon name="map" style={{fontSize: 60, width: 60}}/>
                    </CardItem>
                    <CardItem>
                      <Text style={{fontSize: 20}}>no plans yet!</Text>
                    </CardItem>
                  </Card>)
        }
        else {
          return list;
        }
      }
    }

    createResourceList() {
      var list = []
      var self = this
      console.log(this.state.resources)
      if (this.state.resources != undefined) {
        this.state.resources.forEach(function(resource) {
          var date = new Date(resource.datePosted);
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          date = (date.getMonth()+ 1 + '/' + date.getDate() + '/' +  date.getFullYear());
          list.push(<Card style={{width: '100%'}}>
                      <CardItem button onPress={() => { Linking.openURL(resource.link)}}>
                        <View style={{flexDirection: 'column', alignSelf: 'flex-start', width: '90%'}}>
                            <Text>{resource.resourceTitle}</Text>
                            <Text note>{resource.resourceSummary}</Text>
                        </View>
                          <Icon style={{color: '#5b4fff',position:'absolute', right: 5}} name="ios-arrow-forward"></Icon>
                      </CardItem>
                     </Card>)
        })

        if (list.length === 0) {
          return (<Card style={{flex: 0, shadowColor: 'transparent', shadowOpacity: 0,  shadowColor: 'transparent', shadowOffset: { height: 0, width: 0 }, elevation: 0}}>
                    <CardItem>
                      <Icon name="ios-link" style={{fontSize: 60, width: 60}}/>
                    </CardItem>
                    <CardItem>
                      <Text style={{fontSize: 20}}>no resources yet!</Text>
                    </CardItem>
                  </Card>)
        }
        else {
          return list;
        }
      }
    }

    createTipsList() {
      var list = []
      var self = this

      if (this.state.tips != undefined) {
        for (var i=this.state.tips.length -1; i >=0; i--) {
          list.push(<Card style={{width: '100%'}}>
                      <CardItem header>
                            <Text style={{alignSelf:'center', fontSize:20}}>{this.state.tips[i].tipTitle}</Text>
                      </CardItem>
                      <CardItem style={{flexDirection: 'column', alignItems:'flex-start'}}>
                        <Text note>{this.state.tips[i].tipText}</Text>
                        <List dataArray={this.state.tips[i].tipTags}
                            horizontal={true}
                            renderRow={(tag) =>
                                <ListItem style={{paddingRight: 2}}>
                                    <Button
                                      light
                                      style={{height: 20}}
                                      onPress={() => {
                                                self.props.navigation.navigate('Search', {searchText: '#' + tag})
                                              }}>
                                      <Text uppercase={false} note>#{tag}</Text>
                                    </Button>
                                </ListItem>
                            }>
                        </List>
                      </CardItem>
                     </Card>)
        }


        if (list.length === 0) {
          return (<Card style={{flexDirection: 'column', marginTop: 100, alignItems:'center', justifyContent:'center'}}>
                    <CardItem>
                      <Icon name="ios-book" style={{fontSize: 60, width: 60}}/>
                    </CardItem>
                    <CardItem>
                      <Text style={{fontSize: 20}}>no tips yet!</Text>
                    </CardItem>
                  </Card>)
        }
        else {
          return list;
        }
      }
    }

    generateContent() {
      var activeTab = this.state.currentView
      console.log(activeTab)
      switch (activeTab) {
        case 'resources':
          return (
            <View>
              <Segment>
               <Button first style={{height: 50}} onPress={() => this.setState({ currentView: "treks" })}>
                    <Text>Treks</Text>
               </Button>
               <Button active style={{height: 50}} onPress={() => this.setState({ currentView: "resources" })}>
                    <Text>Resources</Text>
               </Button>
               <Button last style={{height: 50}} onPress={() => this.setState({ currentView: "tips" })}>
                    <Text>Tips</Text>
              </Button>
            </Segment>
             <List>
               {this.createResourceList()}
             </List>
          </View>
        );
        case 'tips' :
          return (
            <View>
              <Segment>
               <Button first style={{height: 50}} onPress={() => this.setState({ currentView: "treks" })}>
                    <Text>Treks</Text>
               </Button>
               <Button style={{height: 50}} onPress={() => this.setState({ currentView: "resources" })}>
                    <Text>Resources</Text>
               </Button>
               <Button last active style={{height: 50}} onPress={() => this.setState({ currentView: "tips" })}>
                    <Text>Tips</Text>
              </Button>
            </Segment>
             <List>
               {this.createTipsList()}
             </List>
          </View>);
        default:
          return (
            <View>
              <Segment>
               <Button first active style={{height: 50}} onPress={() => this.setState({ currentView: "treks" })}>
                    <Text>Treks</Text>
               </Button>
               <Button style={{height: 50}} onPress={() => this.setState({ currentView: "resources" })}>
                    <Text>Resources</Text>
               </Button>
               <Button last style={{height: 50}} onPress={() => this.setState({ currentView: "tips" })}>
                    <Text>Tips</Text>
              </Button>
            </Segment>
             <List>
               {this.createTrekList()}
             </List>
          </View>);
      }
    }

  getUserCounts() {

  }

  renderProfilePicture(img) {
    if (img !== "") {
      return <Thumbnail source={{ uri: img  }}/>
    }
    else {
      return (<Button light style={{height: 120, width: 120, borderWidth: 2, borderRadius: 100, borderColor: '#6db5ff', alignSelf:'center', flexDirection: 'column'}}>
                <Icon name='ios-person' style={{marginTop:20, color: 'black', fontSize: 50, alignSelf:'center'}}/>
                <Text note style={{marginBottom:10}} uppercase={false}>upload photo</Text>
              </Button>);
    }
  }

  render() {
    var user = this.props.user;

    var img = '';
    if (user !== null){
      if (user.photo !==  null) {
        img =  user.photo
      }
    }
    console.log(this.state.currentView)
    return (
      <Container>
          <Content>
            <Header style={{backgroundColor: '#f8f8f8'}}>
              <Left>
                <Button
                  transparent
                  onPress={() => {
                            firebase.auth().signOut()
                          }}>
                    <Icon name="ios-log-out" style={{color: 'gray'}}/>
                </Button>
              </Left>
              <Body>
                <Text style={{paddingLeft: 10, paddingTop: 5, alignSelf: 'flex-end'}}> {user.displayName}</Text>
              </Body>
            </Header>
            <View style={{height: 200}}>
                <View style={{flex: 1, justifyContent:'center', alignItems: 'center', paddingLeft: 5, paddingTop: 15}}>
                    {this.renderProfilePicture(img)}
                </View>
            </View>
            <Grid style={{ backgroundColor: '#fff', height: 85 }}>
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
              {this.generateContent()}
          </Content>
      </Container>
    );
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


export default MyProfile;
