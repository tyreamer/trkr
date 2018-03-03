import React , { Component } from 'react';
import { View, Image, ImageBackground } from 'react-native';
import { Container, Header, Button, Icon, Content, Grid, Col, Card, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Separator, Text } from 'native-base';
import Interactions from './Interactions';
1989
class ViewTrek extends Component {

  constructor(props) {
      super(props);
  }

  renderDays() {
    var days=[]
    var self = this

    for (var i=0; i < this.props.trekRecord.days.length; i++) {
      days.push(<Card>
                    <CardItem header>
                        <Text>Day {i + 1}</Text>
                    </CardItem>
                    {this.renderStops(this.props.trekRecord.days[i])}
                </Card>)
    }

    return days;
  }

  renderStops(day) {
    var stops=[]
    for (var i=0; i <day.stops.length; i++) {
        stops.push(<CardItem><Text style={{alignSelf:'center', fontSize:20}}>{day.stops[i].stopName}</Text></CardItem>)
    }
    return stops;
  }

render() {
  var trek = this.props.trekRecord;
  var img = trek.featuredImage != undefined ? img = trek.featuredImage : '';

  var date = new Date(trek.datePosted);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  date = (months[date.getMonth()]
          + ' ' + date.getDate()
          + ', ' +  date.getFullYear());

  var tags = trek.trekTags != undefined ? ('#' + trek.trekTags.join('{}' + ' #')).split('{}') : ''

  var trekSummary = trek.title;
  /*trekSummary += props.trekRecord.days.length > 1 ? " days" : " day"
  trekSummary += " in " + props.trekRecord.days[0].stops[0].stops;
  trekSummary += props.trekRecord.days[0].stops.length > 1 ? " and " : "";
  if (props.trekRecord.days.stops.length > 1 ) {
      trekSummary += props.trekRecord.days.stops.length > 2 ? props.trekRecord.days.stops.length + " other stops" : " and 1 other stop"
  }*/

    return (
      <Container>
          <Header header style={{justifyContent: 'center', backgroundColor: '#6db5ff'}}>
            <Left>
              <Button
                transparent
                title="Submit"
                style={{width: 40}}
                onPress={() => { this.props.navigation.goBack()  }}>
                  <Icon name="ios-arrow-back" style={{color: '#fff'}}/>
              </Button>
            </Left>
            <Right>
              <Button
                style={{backgroundColor:'#ff5858'}}
                full
                title="Submit"
                onPress={() => {   }}>
                  <Text style={{color: '#fff'}}>Save</Text>
              </Button>
            </Right>
          </Header>
          {this.renderDays()}
      </Container>
    )
  }
}

const styles =  {
  headerTextStyle :{
    fontSize:20,
    color: '#000',
    fontWeight: 'bold',
    alignSelf: 'center',
    paddingRight: 20
  },
  headerIconStyle: {
    color: 'rgba(0,0,0,.6)',
    fontSize: 30,
    alignSelf: 'center'
  },
  headerButtonStyle: {
    flexDirection: 'column'
  }
}

export default ViewTrek;
