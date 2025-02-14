import { List } from '@expo/ui/components/List';

import * as React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ListScreen() {
  return (

     <List style={{flex: 1}} listStyle="palin" data={[{text: "Hello!"},{text: "By!"}, {text: "What?"}]} renderItem={({item}) => <Text style={{alignSelf: "center"}}>{item.text}</Text>}/>
  
  );
}

ListScreen.navigationOptions = {
  title: 'List',
};