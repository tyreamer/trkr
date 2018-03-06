import React , { Component } from 'react';
import { View, Image, ImageBackground } from 'react-native';
import { Container, Header, Button, Icon, Content, Grid, Col, Card, CardItem, List, ListItem, Left, Body, Right, Thumbnail, Separator, Text } from 'native-base';
import Interactions from './Interactions';
import TagList from './TagList'
import StaticGMap from './StaticGMap'


class ViewTrek extends Component {

  constructor(props) {
      super(props);
  }

  renderDays() {
    var days=[]
    var self = this

    for (var i=0; i < this.props.trekRecord.days.length; i++) {
      days.push(<Card transparent style={{marginTop: 0, marginBottom: 0}}>
                    <CardItem header style={[styles.CardElevatedStyle, {backgroundColor: '#ff8142'}]}>
                        <Text style={{color: '#fff'}}>Day {i + 1}</Text>
                    </CardItem>
                    {this.renderStops(this.props.trekRecord.days[i])}
                </Card>)
    }

    return days;
  }

  renderStops(day) {
    var stops=[]
    for (var i=0; i <day.stops.length; i++) {
        stops.push(<CardItem>
                    <Grid>
                      <Col size={2}>
                        <Icon name="ios-pin" style={{color: 'gray'}}/>
                      </Col>
                      <Col size={10} style={{justifyContent: 'center'}}>
                        <Text style={{fontSize:15}}>{day.stops[i].stopName}</Text>
                      </Col>
                    </Grid>
                  </CardItem>)
    }
    return stops;
  }

  formatNumber(num) {
    if (num >= 1000000000) {
       return  (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    }
    if (num >= 1000000) {
       return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
       return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return 0;
  }

render() {
  var trek = this.props.trekRecord;

  var budget = this.formatNumber(trek.budget)
  //stops
  var totalStops = 0;
  if (trek.days != undefined && trek.days != null) {
    for (var i = 0; i< trek.days.length; i++) {
        if (trek.days[i].stops != undefined && trek.days[i].stops != null) {
         totalStops = totalStops + trek.days[i].stops.length
       }
    }
  }

  var date = new Date(trek.datePosted);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  date = (months[date.getMonth()]
          + ' ' + date.getDate()
          + ', ' +  date.getFullYear());

  var tags = trek.trekTags != undefined ? ('#' + trek.trekTags.join('{}' + ' #')).split('{}') : ''

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
                  <Text style={{color: '#fff'}}>Save to my trip ideas</Text>
              </Button>
            </Right>
          </Header>
          <Content>
            <Card style={{marginTop: 0}}>
              <Grid style={{backgroundColor: '#6db5ff', padding: 10}}>
                <Col size={4} style={styles.GridColStyle}>
                  <Icon name="md-calendar" style={styles.CardIconStyle}></Icon>
                  <Text style={styles.CardTextStyle}>{trek.days.length}</Text>
                </Col>
                <Col size={4} style={styles.GridColStyle}>
                  <Icon name="logo-usd" style={styles.CardIconStyle}></Icon>
                  <Text style={styles.CardTextStyle}>{budget}</Text>
                </Col>
                <Col size={4} style={styles.GridColStyle}>
                  <Icon name="ios-pin" style={styles.CardIconStyle}></Icon>
                  <Text style={styles.CardTextStyle}>{totalStops}</Text>
                </Col>
              </Grid>
              <StaticGMap trekDays={this.props.trekRecord.days}/>
              <CardItem style={[styles.CardElevatedStyle, {backgroundColor: '#6db5ff'}]}>
                <Text style={{fontWeight:'bold', fontSize: 20, color:'#fff'}}>{trek.title}</Text>
              </CardItem>
              <CardItem style={[styles.CardElevatedStyle], {backgroundColor: '#f8f8f8', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Text style={{fontSize: 12, fontWeight: 'bold'}}> {trek.displayName} </Text>
                { trek.summary == null || trek.summary == "" ? null :   <Text note>{trek.summary}</Text>}
              </CardItem>
            </Card>
            {this.renderDays()}
            <Image source={{uri: trek.featuredImage}} style={{width:'100%', height: 200}}/>
          </Content>
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
  },
  CardElevatedStyle:
  {
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor:'#000',
    shadowOpacity:0.6,
    paddingRight:0
  },
  CardTextStyle:
  {
    fontSize: 25,
    color: '#fff',
    paddingLeft: 5
  },
  CardIconStyle:
  {
    color: '#fff',
    fontSize: 15,
  },
  GridColStyle:
  {
    flexDirection: 'row',
    alignItems: 'center',
  }
}

export default ViewTrek;
