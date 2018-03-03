import React, { Component } from 'react';
import { Image, Alert } from 'react-native';
import { Container, Header, View, Content, Item, Input, Card, CardItem, Icon, Button, Text, Spinner, Left, Body, Right } from 'native-base';
import axios from 'axios';
import firebase from 'firebase';

class Login extends Component {

   state = {
     email: '',
     password: '',
     error: '',
     showSpinner: false
   }

   submitForm() {
     const {email, password} = this.state
     this.setState({error: '', showSpinner: true})
     var self = this
     firebase.auth().signInWithEmailAndPassword(email, password)
       .catch((error) => {
         if (error.code === 'auth/wrong-password') {
           this.setState({error: 'Please verify your email and password are correct then try again.',
                          showSpinner: false,
                          password: ''})
         }
         else {
           self.triggerCreateAccount(email, password)
         }
       })
   }

   triggerCreateAccount(email, password) {
        Alert.alert(
          'Join',
          `We were not able to find your account, would you like to create one?`,
          [
            {text: 'No', onPress: () => this.setState({showSpinner: false, password: ''}), style: 'cancel'},
            {text: 'Yes', onPress: () => this.createAccount(email, password) },
          ],
          { cancelable: true }
        )
   }

   createAccount(email, password) {
      var self = this;

      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({error: '', showSpinner: false})
        // Get a key for a new user
        var usersRef = firebase.database().ref('/').child('users')
        var myUser = usersRef.child(self.escapeEmailAddress(email))
        myUser.set({
          email: email
        })
      })
   }

   escapeEmailAddress(email) {
    if (!email) return false

    // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
  }

  renderButton() {
    if (this.state.showSpinner) {
      return <Spinner />
    }
    else {
      return (<Button
        style={{height: 60, width: '100%', justifyContent: 'center', backgroundColor: '#fff'}}
        transparent
        onPress={() => {
                    this.submitForm()
                }}>
        <Text uppercase={false} style={{fontSize: 30, paddingTop: 15, color: '#6db5ff'}}>Login / Join</Text>
      </Button>);
    }
  }

   render() {
    return (
      <Container>
        <Content>
          <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column',  backgroundColor: '#ff8142'}}>
            <Image source={require('../images/logo.png') }
                    resizeMode="contain"
                    style={{height: 150, width: 150, alignSelf: 'center'}}></Image>
              <Text style={{color: '#fff', fontSize: 50}}>trekker</Text>
          </View>
          <View style={{justifyContent:'center', backgroundColor: '#fff'}}>
            <Text style={{alignSelf:'center', color: 'red'}}>
              {this.state.error}
            </Text>
          </View>
          <Card>
            <CardItem>
              <Text>Email:</Text>
              <Input style={{width: "100%"}}
                placeholder=''
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.text}
                onChangeText={email=> this.setState({email})}
                />
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <Text>Password:</Text>
              <Input style={{width: "100%"}}
                secureTextEntry
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.text}
                onChangeText={password=> this.setState({password})}
                />
            </CardItem>
          </Card>
          <View style={{justifyContent: 'flex-end'}}>
            {this.renderButton()}
          </View>
        </Content>
      </Container>
    );
  }
}


export default Login
