import React , { Component } from 'react';
import { Button, List, Text} from 'native-base';

class TagList extends Component  {

render() {

  return (<List dataArray={this.props.tags}
              horizontal={true}
              renderRow={(tag) =>
                      <Button
                        transparent
                        style={{height: 20, paddingLeft: 0, marginBottom: 5, paddingBottom: 18, borderBottomWidth: 0, marginLeft: 0}}
                        onPress={() => {
                                  this.props.navigation.navigate('Search', {searchText: '#' + tag})
                                }}>
                        <Text uppercase={false} style={{paddingLeft: 0, paddingBottom: 10, alignSelf: 'flex-start', color: '#5b4fff'}} note>#{tag}</Text>
                      </Button>
              }>
          </List>);
  }
}

export default TagList;
