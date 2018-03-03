import React from 'react';
import { TouchableHighlight, View, AppRegistry } from 'react-native';
import firebase from 'firebase';
import { Container, Header, Thumbnail, Left, Body, Button, Right, Toast, Item, Input,  Icon, Spinner, Content, Text, Root } from 'native-base';
import MainFeed from './src/components/MainFeed';
import Title from './src/components/Title';
import MyProfile from './src/components/MyProfile';
import Profile from './src/components/Profile';
import Search from './src/components/Search';
import Plan from './src/components/Plan';
import AddTrip from './src/components/AddTrip';
import AddResource from './src/components/AddResource';
import AddTip from './src/components/AddTip';
import Login from './src/components/Login';
import ViewTrek from './src/components/ViewTrek';
import UpdateProfile from './src/components/UpdateProfile'

import {  TabNavigator, StackNavigator } from 'react-navigation';

//disabling warnings on emulator
console.disableYellowBox = true;

class HomeScreen extends React.Component {
  constructor(props) {
     super(props);
     this.state = { searchText: '' };
   }

   handleKeyDown(e) {
      let searchText = e.nativeEvent.text;
      this.setState({searchText: searchText})

      if(e.nativeEvent.key == "Enter") {
          this.props.navigation.navigate('Search', {searchText: this.state.searchText})
          dismissKeyboard();
       }
   }

  render() {
      return (
        <Container>
          <Content style={{backgroundColor: '#fff'}}>
                <Button
                  transparent
                  full
                  style={{width:'100%'}}
                  onPress={() => {this.props.navigation.navigate('Search', {searchText: ''})}}
                  >
                    <Body>
                      <Text note uppercase={false} style={{paddingTop: 5, paddingLeft: 10, alignSelf: 'flex-start'}}>Search</Text>
                    </Body>
                    <Right>
                      <Icon style={{color: '#6db5ff', paddingRight: 10}} name="ios-search"></Icon>
                    </Right>
                  </Button>
            <MainFeed navigation = {this.props.navigation} />
          </Content>
        </Container>
      );
   }
}

class ProfileScreen extends React.Component {
  render() {
    var userID = this.props.navigation.state.params.user;
    var cu = firebase.auth().currentUser;
    if (userID == cu.email.toLowerCase().replace(/\./g, ',')) {
      //this is the user's profile
      //TODO FIX THIS to return user's profile
      return;
    }
    else {
      return (<Profile user={userID} navigation = {this.props.navigation}></Profile>);
    }
  }
}

class MyProfileScreen extends React.Component {
  render() {
    var user = this.props.screenProps.currentUser;
    return (
      <MyProfile user={user} navigation = {this.props.navigation}></MyProfile>
    );
  }
}

class AddTripScreen extends React.Component {
  render() {
    return (
      <AddTrip navigation = {this.props.navigation}></AddTrip>
    );
  }
}

class AddResourceScreen extends React.Component {
  render() {
    return (
      <AddResource navigation = {this.props.navigation}></AddResource>
    );
  }
}

class AddTipScreen extends React.Component {
  render() {
    return (
      <AddTip navigation = {this.props.navigation}></AddTip>
    );
  }
}

class ViewTrekScreen extends React.Component {
  render() {
    return (
      <ViewTrek trekRecord={this.props.navigation.state.params.trekRecord} navigation = {this.props.navigation}></ViewTrek>
    );
  }
}

class SearchScreen extends React.Component {
  render() {
    return <Search navigation = {this.props.navigation} />
  }
}

const MainScreenNavigator = TabNavigator(
  {
    Home: { screen: HomeScreen },
    Plan: { screen: Plan },
    Profile: { screen: MyProfileScreen},
  },
  {
   tabBarPosition: 'bottom',
   tabBarOptions: {
        renderIndicator: () => null,
        style: {backgroundColor: '#fff'},
        activeTintColor:'#4c4c4c',
        inactiveTintColor: '#7f7f7f'
    }
  }
);

class NavigatorWrappingScreen extends React.Component {

    state = {
      loggedIn: null,
      screenProps: {currentUser: {}}
    }

    componentWillMount() {
      //Check if we're initialized
      if (firebase.apps.length === 0) {
        firebase.initializeApp({
           apiKey: "AIzaSyD1USW-IVZkY5chC_L9ztOVmtKVyAgMVog",
           authDomain: "trekker-2018.firebaseapp.com",
           databaseURL: "https://trekker-2018.firebaseio.com",
           projectId: "trekker-2018",
           storageBucket: "trekker-2018.appspot.com",
           messagingSenderId: "539066344267"
        })
      }

        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            const self = this
            const cu = firebase.auth().currentUser;

            //Check if email is verified
             if (!cu.emailVerified) {
               cu.sendEmailVerification().then(() =>
                   Toast.show({
                     text: 'A verification email has been sent to '+ cu.email,
                     position: 'bottom',
                     type: 'info'
                   })
                );
             }

             var trekkerUser = {displayName: '',
                                photo: '',
                                lastSignIn: '',
                                email: ''}

             firebase.database().ref('/users/' + cu.email.toLowerCase().replace(/\./g, ',')).once('value')
                      .then(function(snapshot) {
                        trekkerUser.displayName = (snapshot.val() && snapshot.val().displayName) || 'guest';
                        trekkerUser.photo = (snapshot.val() && snapshot.val().photo || '');
                        trekkerUser.lastSignIn = (snapshot.val() && snapshot.val().lastSignInTimestamp || Date.now());
                        trekkerUser.email = (snapshot.val() && snapshot.val().email || '');
                      })
                      .then(() =>
                              self.setState({
                                loggedIn:true,
                                screenProps: { currentUser: trekkerUser}
                              })
                       )
          }
          else {
              this.setState({loggedIn:false});
          }
        })
    }

  updateDisplayName = (displayName) => {
    var currentUser = this.state.screenProps.currentUser;
    currentUser.displayName = displayName;

    this.setState({
      loggedIn:true,
      screenProps: { currentUser: currentUser}
    })
  }

  renderApp() {
    var self = this

    switch(this.state.loggedIn) {
      case true:
        //Make sure they have a display name set
        if (this.state.screenProps.currentUser.displayName != 'guest' && this.state.screenProps.currentUser.displayName != null) {
          return <MainScreenNavigator navigation={self.props.navigation} screenProps= { self.state.screenProps }/>
        }
        else {
          return <UpdateProfile navigation={self.props.navigation} handleDisplayNameUpdate = {self.updateDisplayName}/>
        }
        break;
      case false:
        return <Login />
        break;
      default:
        return <Spinner />
    }
  }

  render() {

    return (
      <View style={{flex: 1}}>
          {this.renderApp()}
      </View>
    );
  }
}
NavigatorWrappingScreen.router = MainScreenNavigator.router;

const TrekkerApp = StackNavigator({
    Home: { screen: NavigatorWrappingScreen },
    AddTrip: { screen: AddTripScreen },
    AddResource: {screen: AddResourceScreen},
    AddTip: {screen: AddTipScreen},
    ViewTrek: {screen: ViewTrekScreen},
    Search: { screen: SearchScreen },
    UserProfile: { screen: ProfileScreen },
  },
  { headerMode: 'null' }
);


export default class App extends React.Component {
  constructor(props) {
    super(props)
  }
  navigationHelper = () => {
    this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName, params })
  }

  render() {
    return <Root><TrekkerApp /></Root>;
  }
}

const styles = {
  viewStyle: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '2%',
    paddingBottom: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 3,
    position: 'relative'
  },
  textStyle: {
    fontSize: 20
  }
}

AppRegistry.registerComponent('albums', () => App);
