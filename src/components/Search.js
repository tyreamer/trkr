import React, { Component } from 'react';
import { Container, Header, View, Content, Item, Input, SearchBar, Icon, Button, Text, Spinner, Left, Body, Right } from 'native-base';
import axios from 'axios';
import TrekDetail from './TrekDetail.js'
import firebase from 'firebase';

export default class Search extends Component {

   state = {
       apiIsFetchingData: false,
       apiCallFinished: true,
       filteredTreks:[],
       results:[],
       searchText:'',
       users:[]
   }

   componentWillMount() {
     this.setState({searchText:  this.props.navigation.state.params.searchText})
     this.searchSubmit(this.props.navigation.state.params.searchText)
   }

   searchSubmit(e) {
     let searchText = e
     if (e.nativeEvent != undefined) {
       searchText = e.nativeEvent.text;
     }

     var self = this;
     axios.get('http://demo1996132.mockable.io/trekker')
       .then(response => {
           var ft = self.filterResults(searchText, response.data.treks)
           this.setState({
             filteredTreks: ft,
             users: response.data.users
           })
         }
       )
   }

   filterResults(searchText, data) {
     let text = searchText.toLowerCase();

     return data.filter((d) => {

       //first check titles
       if (d.title.toLowerCase().search(text) !== -1) return true

       //check cities
       for (var i = 0, len = d.cities.length; i < len; i++) {
           if (d.cities[i].toLowerCase() == text) {
             return true
           }
         }

       //now check tags
       for (var i = 0, len = d.tags.length; i < len; i++) {
           if (d.tags[i].toLowerCase() == '#' + text) {
             return true
           }
         }
     });
   }

   generateResults() {
      console.log(this.state.searchText)
     if (this.state.searchText.charAt(0) == '#') {
       this.retrievePostsWithHashtag(this.state.searchText.substr(1));
     }
     else {
       this.createTrekList();
     }
   }

   retrievePostsWithHashtag(tag) {
     var posts = [];
     var self = this;
     var tips = []
     var treks = []
     var resources = []

     firebase.database().ref('/tags').child(tag).once('value')
           .then(function(snapshot) {
                 snapshot.forEach(function(child) {
                   console.log(child.val())
                   posts.push(child.val())
                   switch(child.val()) {
                     case 'tip': tips.push(child.key)
                        break;
                     case 'resource': resources.push(child.key)
                      break;
                     case 'trek': treks.push(child.key)
                      break;
                     default: break;
                   }
                 })
           })
           .then(() => self.setState({results: posts}) )
   }

   createTrekList() {
     var list = []
     this.state.filteredTreks.map(trek =>{
       var u = this.state.users.filter(v => v.id == trek.user);
       list.push(<TrekDetail key={trek.id} trekRecord={trek} user={u[0]} navigation = {this.props.navigation}/>)
     })
     return list
   }

   updateSearchText(e) {
        let searchText = e.nativeEvent.text;
        this.setState({searchText: searchText})
   }

  render() {
    return (
      <Container>
        <Content>
          <Header searchBar style={{backgroundColor: '#fff'}}>
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
              <Item style={{width: "100%"}}>
                <Input style={{width: "100%"}}
                  placeholder={this.state.searchText}
                  returnKeyType="done"
                  keyboardType="default"
                  autoCorrect={true}
                  onChange={this.searchSubmit.bind(this)}
                  />
              </Item>
            <Right>
              <Button
                transparent
                isLoading={this.state.apiIsFetchingData}
                onPress={() => {
                            this.searchSubmit()
                        }}>
                <Icon name="ios-search"></Icon>
              </Button>
            </Right>
          </Header>
          <View>
            {this.generateResults()}
          </View>
        </Content>
      </Container>
    );
  }
}
