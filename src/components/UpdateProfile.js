import React, { Component } from 'react';
import { Container, Header, View, Content, Item, Input, Card, CardItem, Toast, Icon, Button, Text, Spinner, Left, Body, Right } from 'native-base';
import axios from 'axios';
import firebase from 'firebase';

class UpdateProfile extends Component {

   state = {
     displayName: '',
     error: '',
     showToast: false,
   }

   submitForm() {
     const self = this
     this.setState({error: ''})
     cu = firebase.auth().currentUser;
     var userNodeRef = cu.email.toLowerCase().replace(/\./g, ',')

     cu.updateProfile({
        displayName: this.state.displayName,
      }).then(function() {
           firebase.database().ref('/users').child(userNodeRef).update({
              //UPDATE SO THESE ARE NOT OVERWRITTEN LATER
               email: cu.email,
               displayName: self.state.displayName,
               photo: '',
               lastSignInTimestamp: Date.now()
           }).then(()=> {
             Toast.show({
               text: 'Successfully Updated!',
               position: 'bottom',
               type: 'success'
             })
             self.props.navigation.navigate('Home', {displayName: self.state.displayName})
             self.props.handleDisplayNameUpdate(self.state.displayName)
           }).catch((error) => {
                console.error(error);
                Toast.show({
                  text: error,
                  position: 'bottom',
                  type: 'danger'
                })
            });
      }).catch(function(error) {
        Toast.show({
          text: error,
          position: 'bottom',
          type: 'danger'
        })
      });
   }

   render() {
    return (
      <Container>
        <Content>
          <Header style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
              <Text style={{fontFamily: 'Roboto'}}>Update Profile</Text>
          </Header>
          <Card>
            <CardItem style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 20}}>
                Please choose a username
              </Text>
              <Text note>(seen by everyone)</Text>
            </CardItem>
            <CardItem>
              <Text>Username:</Text>
              <Input style={{width: "100%"}}
                placeholder='johnsmith123'
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={false}
                value ={this.state.text}
                onChangeText={displayName=> this.setState({displayName})}
                />
            </CardItem>
            <CardItem>
              <Button
                transparent
                onPress={() => {
                            this.submitForm()
                        }}>
                <Text>Continue</Text>
              </Button>
            </CardItem>
            <CardItem>
                <Text style={{alignSelf:'center', color: 'red'}}>
                  {this.state.error}
                </Text>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}


export default UpdateProfile
