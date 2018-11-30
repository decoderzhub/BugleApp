
import React, { Component } from 'react';
import { ImageBackground } from 'react-native';
import * as firebase from 'firebase';
import {
    ListView, Text, Row, Image,
    View, Subtitle, Caption, Heading
} from '@shoutem/ui';
import moment from 'moment';

const Message = ({ msg }) => {
    if(firebase.auth().currentUser.displayName !== msg.author.name)
    {
        return(
            
                <Row style={{backgroundColor: '#c4ff89'}}>
                    <Image styleName="small-avatar top " style={{height: 50, width: 50, borderRadius: 25}}
                        source={{ uri: msg.author.avatar }} />
                    <View style={{backgroundColor: '#0080ff', borderTopRightRadius: 15, borderBottomRightRadius: 15, borderBottomLeftRadius: 25}} styleName="vertical">
                        <View styleName="horizontal space-between">
                            <Subtitle style={{marginLeft: 10, color: 'white'}}>{msg.author.name}</Subtitle>
                        </View>
                        <Text styleName="multiline" style={{marginLeft: 10, color: 'white'}}>{msg.text}</Text>
                    <Caption style={{ marginRight: 10, textAlign: 'right', color: 'white'}}>{moment(msg.time).from(Date.now())}</Caption>
                    </View> 
                </Row>
            )
        } else {
            
            return(
                <Row style={{backgroundColor: '#c4ff89'}}>
                    <View style={{marginRight: 10, backgroundColor: '#ff7f00', borderTopLeftRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 25}} styleName="vertical" >
                        <Text styleName="multiline" style={{marginRight: 10, textAlign: 'right', color: 'white'}}>{msg.text}</Text>
                        <Caption style={{ marginLeft: 10, textAlign: 'left', color: 'white'}}>{moment(msg.time).from(Date.now())}</Caption>
                    </View>
                    <Image style={{height: 50, width: 50, borderRadius: 25}}styleName="small-avatar top"
                        source={{ uri: msg.author.avatar }} >
                    </Image>
                </Row>
                )
        }
};

const MessageList = ({ messages, onLayout }) => (
    <ListView data={messages}
              autoHideHeader={true}
              renderRow={msg => <Message msg={msg} />}
              onLayout={onLayout}
              />
);

export default MessageList;
