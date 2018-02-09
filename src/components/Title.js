import React from 'react';
import { Container, Header, Left, Body, Right, Button, Icon, Segment, Content, Text} from 'native-base';

const Title = (props) => {

  const { headerStyle, textStyle } = styles;
    return (
      <Header style={headerStyle}>
        <Left style={{ flex: 1}}></Left>
         <Body style={{ flex: 1,  justifyContent: 'center', alignItems: 'center' }}>
             <Text style={textStyle}>{props.text}</Text>
         </Body>
         <Right style={{ flex: 1}}>
           {/*
              <Button transparent>
                <Icon name="search" />
              </Button>
           */}
         </Right>
      </Header>
    );
};

const styles = {
  headerStyle: {
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '1%',
    paddingBottom: '1%',
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

export default Title;
