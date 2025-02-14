import { List } from '@expo/ui/components/List';

import * as React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ListScreen() {
  return (
    <ScrollView>
     <List data={[{text: "hallo"},{text: "hallo"}]} renderItem={({item}) => <Text>{item}</Text>}/>
    </ScrollView>
  );
}

ListScreen.navigationOptions = {
  title: 'List',
};
