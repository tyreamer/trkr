import React, { Component } from 'react';
import { ScrollView, View, Image, ImageBackground, Linking,ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import TrekDetail from './TrekDetail.js'
import { Container, Header, Button, Icon,Grid, Col, Content, Card, Segment, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Text, Toast } from 'native-base';
import firebase from 'firebase'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'react-native-fetch-blob'
import TipDetail from './TipDetail.js'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri, currentPhoto, mime = 'application/octet-stream') => {
  var storage = firebase.storage()

  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      const sessionId = new Date().getTime()
      let uploadBlob = null
      const imageRef = storage.ref('images').child(`${sessionId}`)

      fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        //delete the users old photo
        storage.ref('images').child(currentPhoto).delete();
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

class MyProfile extends Component {
    constructor(props) {
        super(props);
        this.removeTrek = this.removeTrek.bind(this)
    }

    state = {
      treks: [],
      resources: [],
      tips: [],
      currentView: '',
      loadingNewPhoto: false
    }

    componentWillMount() {
      var self = this
      var email = self.props.user.email.toLowerCase().replace(/\./g, ',');

      this.setState({userPhoto: this.props.user.photo != null ? this.props.user.photo : '' })

      var myTreks = [];
      firebase.database().ref('/user-posts').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myTreks.unshift({id: child.key, details: child.val()})
                  })
            })
            .then(() => self.setState({treks: myTreks}) )
            .catch(() => console.log('no user posts'))
    }

    componentDidMount() {
      var self = this
      var email = self.props.user.email.toLowerCase().replace(/\./g, ',');

      var myResources = [];
      firebase.database().ref('/user-resources').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myResources.unshift(child.val())
                  })
            })
            .then(() => self.setState({resources: myResources}))
            .catch(() => console.log('no user resources'))

      var myTips = [];
      firebase.database().ref('/user-tips').child(email).once('value')
            .then(function(snapshot) {
                  snapshot.forEach(function(child) {
                    myTips.unshift(child.val())
                  })
            })
            .then(() => self.setState({tips: myTips}) )
            .catch(() => console.log('no user tips'))
    }

    _pickImage() {
     var currentPhoto = this.state.userPhoto.match(new RegExp('/images%2F' + "(.*)" + 'alt=media'))[1].replace(/\D/g,'');
     this.setState({ userPhoto: '' })
     var self = this
     ImagePicker.launchImageLibrary({}, response  => {
       this.setState({loadingNewPhoto: true})
       uploadImage(response.uri, currentPhoto)
         .then(url => self.updateProfileWithImage(url))
         .catch(error => console.log(error))
     })
   }

   removeTrek(key) {
     var $idx;
     for (var i = 0; i < this.state.treks.length; i++) {
         if (this.state.treks[i].id == key)
         {
             $idx = i;
             break;
         }
     }

     var newTrekList = this.state.treks;
     newTrekList.splice(i, 1);
     this.setState({treks: newTrekList})
   }

   updateProfileWithImage(imageURL) {
     const self = this
     this.setState({userPhoto: imageURL})
     cu = firebase.auth().currentUser;
     var userNodeRef = cu.email.toLowerCase().replace(/\./g, ',')

     cu.updateProfile({
       photoURL: imageURL
     }).catch((error) => {
          self.setState({ userPhoto: imageURL, loadingNewPhoto: false })
          console.error(error);
          Toast.show({
            text: error,
            position: 'bottom',
            type: 'danger'
          })
      });

     firebase.database().ref('/users').child(userNodeRef).update({
         photo: imageURL
     })
     .then(() =>{ self.setState({ userPhoto: imageURL, loadingNewPhoto: false })  })
     .catch((error) => {
          self.setState({ userPhoto: imageURL, loadingNewPhoto: false })
          console.error(error);
          Toast.show({
            text: error,
            position: 'bottom',
            type: 'danger'
          })
      });
   }

    createTrekList() {
      var list = []
      var self = this
      if (this.state.treks != undefined) {
        this.state.treks.forEach(function(trek) {
          list.push(<TrekDetail key={trek.id} id= {trek.id} trekRecord={trek.details} navigation = {self.props.navigation} handleDeletedTrek = {self.removeTrek} />)
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
      if (this.state.resources != undefined) {
        this.state.resources.forEach(function(resource) {
          var date = new Date(resource.datePosted);
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          date = (date.getMonth()+ 1 + '/' + date.getDate() + '/' +  date.getFullYear());

          list.push(<Card style={{width: '100%'}} key={resource.link + resource.datePosted}>
                      <CardItem button onPress={() => { Linking.openURL(resource.link)}}>
                        <View style={{flexDirection: 'column', alignSelf: 'flex-start', width: '90%'}}>
                            <Icon name="ios-link"/>
                            <Text style={{fontWeight: "bold"}}>{resource.resourceTitle}</Text>
                            <Text note>{resource.resourceSummary}</Text>
                        </View>
                          <Icon style={{color: 'gray',position:'absolute', right: 5}} name="ios-arrow-forward"></Icon>
                      </CardItem>
                     </Card>)
        })

        if (list.length === 0) {
          return (<Card style={{flexDirection: 'column', marginTop: 100, alignItems:'center', justifyContent:'center'}}>
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
          list.push(<TipDetail tip={this.state.tips[i]} navigation ={this.props.navigation}/>)
        }


        if (list.length === 0) {
          return (<Card style={{flexDirection: 'column', marginTop: 100, alignItems:'center', justifyContent:'center'}}>
                    <CardItem>
                      <MaterialCommunityIcons name="lightbulb-outline" style={{fontSize: 60, width: 60}}/>
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
      switch (activeTab) {
        case 'resources':
          return (
            <View>
              <Segment style={{backgroundColor: '#ff5858'}}>
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
              <Segment style={{backgroundColor: '#ff5858'}}>
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
              <Segment style={{backgroundColor: '#ff5858'}}>
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

  renderProfilePicture() {
    var result = '';

    if (this.state.userPhoto != null && this.state.userPhoto != '') {
      result = this.getPhotoElements(this.state.userPhoto);
    }
    else {
        result = (<Button
                  onPress={ () => this._pickImage() }
                  light
                  style={[styles.ThumbnailStyle, {borderWidth: 2, borderColor: '#6db5ff', alignSelf:'center', flexDirection: 'column'}]}>
                  <Icon name='ios-person' style={{marginTop:20, color: 'black', fontSize: 50, alignSelf:'center'}}/>
                  <Text note style={{marginBottom:10}} uppercase={false}>upload photo</Text>
                </Button>);
    }

    return result;
  }

  getPhotoElements() {
      return (<TouchableOpacity
              onPress={() => { Alert.alert(
                'Update',
                `Do you want to update this image?`,
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: 'Yes', onPress: () => this._pickImage() },
                ],
                { cancelable: true }
              )}}>
              <Thumbnail
                source={{ uri: this.state.userPhoto  }}
                style={styles.ThumbnailStyle}
              />
            </TouchableOpacity>);
  }


  render() {
    return (
      <Container>
          <Header style={{backgroundColor: '#fff'}}>
            <Left>
              <Button
                transparent
                onPress={() => {  firebase.auth().signOut() }}>
                  <Icon name="ios-log-out" style={{color: 'gray'}}/>
              </Button>
            </Left>
            <Body>
              <Text style={{paddingLeft: 10, paddingTop: 5, alignSelf: 'flex-end'}}> {this.props.user.displayName}</Text>
            </Body>
          </Header>
          <Content style={{backgroundColor: '#fff'}}>
            <Grid style={{height: 85 }}>
                <Col style={{paddingTop: 25}}>
                  <Button full transparent style={styles.headerButtonStyle}>
                    <Icon name="ios-link" style={styles.headerIconStyle}></Icon>
                    <Text style={styles.headerTextStyle}> {this.state.resources.length} </Text>
                  </Button>
                </Col>
                <Col style={{paddingTop: 25}}>
                  <Button full transparent style={styles.headerButtonStyle}>
                    <MaterialCommunityIcons name="lightbulb-outline" style={styles.headerIconStyle}> </MaterialCommunityIcons>
                    <Text style={styles.headerTextStyle}>{this.state.tips.length}</Text>
                  </Button>
                </Col>
                <Col style={{paddingTop: 25}}>
                  <Button full transparent style={styles.headerButtonStyle}>
                    <Icon name="ios-plane" style={styles.headerIconStyle}></Icon>
                    <Text style={styles.headerTextStyle}>{this.state.treks.length}</Text>
                  </Button>
                </Col>
                <Col style={{paddingTop: 25}}>
                  <Button full transparent style={styles.headerButtonStyle}>
                    <Icon name="md-people" style={styles.headerIconStyle}> </Icon>
                    <Text style={styles.headerTextStyle}>0</Text>
                  </Button>
                </Col>
            </Grid>
            <View style={{height: 150}}>
                <View style={{flex: 1, justifyContent:'center', alignItems: 'center', paddingLeft: 5}}>
                   {this.state.loadingNewPhoto ? <ActivityIndicator /> : this.renderProfilePicture()}
                </View>
            </View>
              {this.generateContent()}
          </Content>
      </Container>
    );
  }
}

const styles =  {
  invisible:
  {
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: 'rgba(0,0,0,0)'
  },
  fullHeight:
  {
    height: '100%'
  },
  headerTextStyle:
  {
    fontSize:14,
    color: '#000',
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  headerIconStyle:
  {
    color: 'rgba(0,0,0,.6)',
    fontSize: 20,
    alignSelf: 'center'
  },
  headerButtonStyle:
  {
    flexDirection: 'column'
  },
  ThumbnailStyle:
  {
    height: 120,
    width: 120,
    borderRadius: 100,
    zIndex: 20
  }
}


export default MyProfile;
