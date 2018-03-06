import React, { Component } from 'react';
import { TextInput } from 'react-native';
import { Container, Header, View, Content, Card, CardItem, Icon, Button, Text, Left, Body, Right, Spinner } from 'native-base';
import TrekDetail from './TrekDetail.js'
import TipDetail from './TipDetail.js'
import firebase from 'firebase';
import EvilIcons from 'react-native-vector-icons/EvilIcons'

export default class Search extends Component {

   state = {
       searchText:'',
       showSpinner: false
   }

   componentWillMount() {
    if (this.props.navigation.state.params.searchText != '') {
      this.setState({searchText:  this.props.navigation.state.params.searchText})
      this.searchSubmit(this.props.navigation.state.params.searchText)
    }
   }

   componentDidMount(){
     if (this.props.navigation.state.params.searchText == '' || this.props.navigation.state.params.searchText == undefined) {
       this.searchInput.focus();
     }
   }

   filterResults(type, searchText, data) {
     let text = searchText.toLowerCase();

     retVal = false;
     switch(type) {
        case "treks": retVal = this.filterForTreks(data, text)
          break;
        case "tips": retVal = this.filterForTips(data, text)
          break;
        case "resources": retVal = this.filterForResources(data, text)
          break;
        default: break;
     }
     return retVal;
   }

   filterForTips(data, text) {
     //first check titles
     if (data.tipTitle.toLowerCase().indexOf(text) !== -1) {
      return true
    }

    //now check tags
    if (typeof data.tipTags !== "undefined") {
       for (var i = 0, len = data.tipTags.length; i < len; i++) {
           if (data.tipTags[i].toLowerCase() == text.replace('#', '')) return true
        }
     }

     //check tip text
     if (data.tipText.toLowerCase().indexOf(text) !== -1) {
      return true
    }
   }

   filterForResources(data, text) {
     //first check titles
     if (data.resourceTitle.toLowerCase().indexOf(text) !== -1) {
      return true
    }
   }

   filterForTreks(data, text) {
     //first check titles
     if (data.title.toLowerCase().indexOf(text) !== -1) {
      return true
    }

     //check stops
     if (typeof data.days !== "undefined") {
      for (var i = 0, len = data.days.length; i < len; i++) {
         if(typeof data.days[i].stops !== "undefined") {
            for (var j = 0, len = data.days[i].stops.length; j < len; j++) {
                if (data.days[i].stops[j].stopName.toLowerCase().indexOf(text) !== -1)  return true
            }
          }
       }
     }

     //now check tags
     if (typeof data.trekTags !== "undefined") {
        for (var i = 0, len = data.trekTags.length; i < len; i++) {
            if (data.trekTags[i].toLowerCase() == text.replace('#', '')) return true
         }
      }
   }

   retrievePostsWithHashtag(tag) {
     this.setState({showSpinner: true})
      var filteredList = [];
      var self = this;

      Promise.resolve(firebase.database().ref('/tags').child(tag).once('value')
      .then(function(snapshot) {
        snapshot.forEach(function(child) {
          firebase.database().ref().child(child.val() + 's').once('value')
          .then(function(snapshot2) {
             if (snapshot2.hasChild(child.key)) {
               filteredList.push({type: child.val() + 's', id: snapshot2.child(child.key).key, details: snapshot2.child(child.key).val()})
             }
          })
        })
      }))
      .then(() => {
         filteredList.sort(this.sortFunction)
         //TODO figure out why this isn't being set at the correct time
         setTimeout(function(){ self.setState({filteredList: filteredList, showSpinner: false}) }, 1);
       })
   }

   searchSubmit(e) {
      let searchText = e
      var self = this
      if (searchText.nativeEvent != undefined) {
        searchText = e.nativeEvent.text;
        this.updateSearchText(searchText)
      }

      if (searchText.length > 1) {
        if (searchText.charAt(0) == '#' && searchText.length > 1) {
          this.retrievePostsWithHashtag(searchText.substr(1))
        }
        else {
          this.getMatches(searchText)
        }
      }
      else {
        this.setState({filteredList: []})
      }
    }

    getMatches(searchText) {
      this.setState({showSpinner: true})

      var self = this;
      var keys = [
        "/treks",
        "/resources",
        "/tips"
      ];
      var promises = keys.map(function(key) {
        return firebase.database().ref(key).once("value");
      });

      var filteredList = [];
      Promise.all(promises).then(function(snapshots) {
        snapshots.forEach(function(snapshot) {
          snapshot.forEach(function(child) {
            if (self.filterResults(snapshot.key, searchText, child.val())) {
              filteredList.push({type: snapshot.key, id: child.key, details: child.val()})
            }
          })
        });
      })
      .then(() => {
        filteredList.sort(this.sortFunction)
        self.setState({filteredList : filteredList, showSpinner: false})
      });
    }

    sortFunction(a, b) {
        if (a.details.datePosted === b.details.datePosted) {
            return 0;
        }
        else {
            return (a.details.datePosted < b.details.datePosted) ? 1 : -1;
        }
    }

   getResults() {
     var list = []
     if (this.state.filteredList != null) {
       this.state.filteredList.map(item =>{
         switch(item.type) {
           case "treks": list.push(<TrekDetail key={item.id} id= {item.id} trekRecord={item.details} navigation = {this.props.navigation} handleDeletedTrek = {this.removeItem}/>)
             break;
           case "resources": list.push(<Card style={{width: '100%'}} key={item.id}>
                       <CardItem button onPress={() => { Linking.openURL(item.details.link)}}>
                         <View style={{flexDirection: 'column', alignSelf: 'flex-start', width: '90%'}}>
                             <Text style={{fontWeight: "bold"}}>{item.details.resourceTitle}</Text>
                             <Text note>{item.details.resourceSummary}</Text>
                         </View>
                           <EvilIcons style={{color: 'gray',position:'absolute', right: 5}} size={25} name="external-link"/>
                       </CardItem>
                      </Card>)
             break;
           case "tips": list.push(<TipDetail key={item.id} id={item.id} tip={item.details} navigation ={this.props.navigation} handleDeletedTip={this.removeItem}/>)
             break;
           default:
             break;
         }
       })
     }
     return list
   }

   updateSearchText(text) {
        this.setState({searchText: text})
   }

  render() {

    return (
      <Container>
        <Content>
          <Header searchBar style={{backgroundColor: '#fff', paddingLeft: 0, paddingRight: 0}}>
            <Button
              transparent
              title="Submit"
              style={{width: 50, height: '100%'}}
              onPress={() => {this.props.navigation.goBack() }}>
                <Icon name="ios-arrow-back" style={{color: 'gray', paddingTop: 5, fontSize: 30}}/>
            </Button>
            <Body>
              <TextInput style={{width: "100%", height: 80, marginTop: 5}}
                ref={(input) => { this.searchInput = input; }}
                multiline={false}
                underlineColorAndroid = "transparent"
                value={this.state.searchText}
                placeholder={this.state.searchText}
                returnKeyType="done"
                keyboardType="default"
                autoCorrect={true}
                onChange={this.searchSubmit.bind(this)}
                />
            </Body>
            <Right>
              <Button
                transparent
                isLoading={this.state.showSpinner}>
                <Icon name="ios-search"></Icon>
              </Button>
            </Right>
          </Header>
          <View>
            {this.state.showSpinner ? <Spinner/> : null}
            {this.getResults()}
          </View>
        </Content>
      </Container>
    );
  }
}
