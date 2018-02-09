import React, { Component } from 'react';
import { Image } from 'react-native';
import { Container, Header, View, Content, Item, Input, Card, CardItem, Icon, Button, Text, Spinner, Left, Body, Right } from 'native-base';
import axios from 'axios';
import firebase from 'firebase';

class Login extends Component {

   state = {
     email: '',
     password: '',
     error: ''
   }

   submitForm() {
     const {email, password} = this.state
     this.setState({error: ''})
     var self = this
     firebase.auth().signInWithEmailAndPassword(email, password)
       .catch(() => {
         firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(() => {
            // Get a key for a new user
            var usersRef = firebase.database().ref('/').child('users')
            var myUser = usersRef.child(self.escapeEmailAddress(email))
            myUser.set({
              email: email
            })
          })
          .catch(() => {this.setState({error: 'Please verify your email and password are correct then try again.'})})//failed login
       })
   }

   escapeEmailAddress(email) {
    if (!email) return false

    // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
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
            <Button
              style={{height: 60, width: '100%', justifyContent: 'center', backgroundColor: '#fff'}}
              transparent
              onPress={() => {
                          this.submitForm()
                      }}>
              <Text uppercase={false} style={{fontSize: 30, paddingTop: 15, color: '#6db5ff'}}>Login</Text>
            </Button>
          </View>
        </Content>
      </Container>
    );
  }
}


export default Login
