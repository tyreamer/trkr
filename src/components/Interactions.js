import React, { Component } from 'react';
import { TouchableOpacity, Alert, Share } from 'react-native';
import { Button, Icon, Content, Grid, Col, Text } from 'native-base';
import firebase from 'firebase';

class Interactions extends Component {

  constructor(props) {
    super(props)

    this.state = ({
      userLikesPost: null,
      totalLikes: 0
    })
  }

  componentWillMount() {
    var likeRef = firebase.database().ref().child('likes')
    var self = this
    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')

    likeRef.once('value', function(snapshot) {
      //Check if this post has any likes
      if (snapshot.hasChild(self.props.id)) {
        likeRef.child(self.props.id).once('value', function(snapshot) {

          if (snapshot.hasChild('total')) {
            var currTotal = snapshot.child('total').val()
            self.setState({totalLikes: currTotal})

            //Check if user already likes or dislikes post
            if (snapshot.hasChild(userEmail)) {
              //Set state based on if user likes or dislikes post
              self.setState({userLikesPost: snapshot.child(userEmail).val() == true})
            }
          }
        })
      }
    })
  }

  renderEditable() {

    if(this.props.user == firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')){
      return (
          <Button
            transparent
            style={{alignSelf: 'flex-end'}}
            onPress={() => {
            Alert.alert(
              'Delete Post',
              `Do you want to delete this post?`,
              [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => this.props.handleDelete(this.props.id) },
              ],
              { cancelable: true }
            )}}>
              <Icon name="ios-remove-circle-outline" style={{color:'red'}}/>
          </Button>
      );
    }
  }

  likePost(upvote) {
    var userEmail = firebase.auth().currentUser.email.toLowerCase().replace(/\./g, ',')
    var self = this
    var likeRef = firebase.database().ref().child('likes')

    likeRef.once('value', function(snapshot) {

      //Check if this post has any likes
      if (snapshot.hasChild(self.props.id)) {
        likeRef.child(self.props.id).once('value', function(snapshot2) {

          var currTotal = snapshot2.child('total').val()

          //Check if user already likes or dislikes post
          if (snapshot2.hasChild(userEmail)) {

            //Check if it is a like or dislike
            if (snapshot2.child(userEmail).val() == true)
            {
               if (upvote) {
                 //They currently like it (1) so we need to remove the record
                 likeRef.child(self.props.id).child(userEmail).remove();
                 likeRef.child(self.props.id).update({"total" : currTotal - 1});
                 self.updatePostData(currTotal - 1)
                 self.setState({userLikesPost: null, totalLikes: self.state.totalLikes - 1})
               }
               else {
                 //They currently like it (1) so we need to decrement total by 2
                 likeRef.child(self.props.id).update({"total" : currTotal - 2, [userEmail]: false});
                 self.updatePostData(currTotal - 2)
                 self.setState({userLikesPost: false, totalLikes: self.state.totalLikes - 2})
               }
            }
            else
            {
               if (upvote) {
                  //They currently dislike it (-1) so we need to update to like it (1)
                  likeRef.child(self.props.id).update({
                    "total" : currTotal + 2,
                    [userEmail]: true
                  });
                  self.updatePostData(currTotal + 2)
                  self.setState({userLikesPost: true, totalLikes: self.state.totalLikes + 2})
               }
               else {
                 //They currently dislike it (-1) so we need to update to remove it
                 likeRef.child(self.props.id).child(userEmail).remove();
                 likeRef.child(self.props.id).update({"total" : currTotal + 1});
                 self.updatePostData(currTotal + 1)
                 self.setState({userLikesPost: null, totalLikes: self.state.totalLikes + 1})
               }
            }
          }
          else {
            //No record of this user liking or disliking the post
            if (upvote) {
              var like = {
                "total" : currTotal + 1,
                [userEmail] : true
              };
              likeRef.child(self.props.id).update(like);
              self.updatePostData(currTotal + 1)
              self.setState({userLikesPost: true, totalLikes: self.state.totalLikes + 1})
            }
            else {
              var like = {
                "total" : currTotal - 1,
                [userEmail] : false
              };
              likeRef.child(self.props.id).update(like);
              self.updatePostData(currTotal - 1)
              self.setState({userLikesPost: false, totalLikes: self.state.totalLikes - 1})
            }
          }
        })
      }
      else {
        //No likes or dislikes on this post yet
        if (upvote) {
          likeRef.child(self.props.id).set({
             "total" : 1,
             [userEmail] : true
          })
          self.updatePostData(1)
        }
        else {
          likeRef.child(self.props.id).set({
             "total" : -1,
             [userEmail] : false
          })
          self.updatePostData(-1)
        }
        self.setState({userLikesPost: upvote, totalLikes: upvote ? 1 : -1})
      }
    })
    .catch((e)=>{
      console.log(e)
    })
  }



  updatePostData(likeCount) {
    var self = this

    //Update treks and user posts
    firebase.database().ref().child('/treks/' + self.props.id).once('value', function(snapshot) {
      //Update the post
      if(snapshot.hasChild('likes')) {
        snapshot.ref.update({'likes' : likeCount})
      }
      else {
        var likeRec = {};
        likeRec['likes'] = 1;
        snapshot.ref.update(likeRec)
      }
    })
    .then(() => {
      //Update user posts
      firebase.database().ref().child('user-posts').child(self.props.user).child(self.props.id).once('value', function(snapshot) {
        //Update the post
        if(snapshot.hasChild('likes')) {
          snapshot.ref.update({'likes' : likeCount})
        }
        else {
          var likeRec = {};
          likeRec['likes'] = 1;
          snapshot.ref.update(likeRec)
        }
      })
    });
  }

  renderInteractions() {
    var likes =  this.state.totalLikes
    return (
        <Grid style={{backgroundColor: '#fff'}}>
          <Col>
            <Button full transparent>
              <Text style={styles.textStyle}> {likes}</Text>
            </Button>
          </Col>
          <Col>
            <TouchableOpacity style={{flexDirection: 'row'}}>
              <Button full transparent style={{flexDirection: 'row', borderRadius: 20}} onPress={() => { this.likePost(false)}}>
                {this.state.userLikesPost == false ? <Icon name="ios-thumbs-down" style={[styles.iconStyle], {color: '#ff5858'}}></Icon> : <Icon name="ios-thumbs-down-outline" style={styles.iconStyle}></Icon>}
              </Button>
              <Button full transparent style={{flexDirection: 'row'}} onPress={() => { this.likePost(true)}}>
                {this.state.userLikesPost == true ? <Icon name="ios-thumbs-up" style={[styles.iconStyle], {color: '#b5ff6d'}}></Icon> : <Icon name="ios-thumbs-up-outline" style={styles.iconStyle}></Icon>}
              </Button>
            </TouchableOpacity>
          </Col>
          <Col>
            <TouchableOpacity>
              <Button
                full
                transparent
                style={{flexDirection: 'row', borderRadius: 20}}
                onPress={()=> {
                    Share.share({
                      message: this.props.summary.length > 0 ? this.props.summary + ' \n http://www.gettrekker.com': "Check out this trip on Trekker:" + ' http://www.gettrekker.com',
                      url: 'http://www.gettrekker.com',
                      title: this.props.title
                    }, {
                      // Android only:
                      dialogTitle: 'Share Trek ' + this.props.title,
                      tintColor: '#ff5858',
                    })
                  }
                 }>
                <Icon name="md-share-alt" style={styles.iconStyle}></Icon>
              </Button>
            </TouchableOpacity>
          </Col>
          {this.renderEditable()}
        </Grid>
  )}

  render() {
    return this.renderInteractions();
  }
}

const styles = {
   iconStyle: {
     color: '#a8a8a8',
     paddingLeft: 5,
     fontWeight: 'bold',
     fontSize: 20
   },
   textStyle: {
     color: '#a8a8a8',
     fontSize: 20,
     alignSelf: 'center',
     paddingTop: 2,
     paddingBottom: 2,
     marginTop: 5
   }
}

export default Interactions;
