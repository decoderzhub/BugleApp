import React, { Component } from 'react';
import { Button, View, Text, Dimensions, ScrollView } from 'react-native';
import { Provider, connect } from 'react-redux';
import { List, ListItem } from 'react-native-elements';
import { firebaseConnect, populate } from 'react-redux-firebase';
import * as firebase from 'firebase';
import rootReducer from './src/reducers'

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import messages from './src/reducers/messages';

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        //loggerMiddleware
    )
);

const populates = [{
    child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
   { path: '/message_groups', queryParams: ['orderByChild=created_at', 'limitToLast=10'], populates},

])  
@connect(
   ({ firebase}) => ({
       auth: firebase.auth,  // auth passed as props.auth
       profile: firebase.profile, // profile passed as props.profile
       message_groups: populate(firebase, 'message_groups', populates), //all posts from fb db
   })
 )
class MessengerScreen extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: 'Messenger Groups',
    });


 render(){
        let groups = null;
        let approved = false;
        if (this.props.message_groups)
        {
        this._performClearList();
         //d = this._discoverGroups();
         //console.log("d = " + d);
            groups = Object.values(this.props.message_groups).map((group, i) =>{            
           // Object.values(this.state.groupInfo.approved_users).map((user, i) => {this.state.username = user.name})
           // console.log(this.state.username)
              item = Object.values(group.approved_users).map((user, i) => {
            //     console.log(user.name)
                if(user.name === firebase.auth().currentUser.displayName)
                        {     
                            approved = true;
                            g = ( 

                                <ListItem 
                                containerStyle={{backgroundColor: '#ffa64e', borderRadius: 15}}
                                titleStyle={{color: 'white'}}
                                title={group.group_name}
                                rightIcon={{name: 'chevron-right', color: 'white'}}
                                rightTitle='Enter Chat Room'
                                rightTitleStyle={{color: 'white'}}
                                onPress={() => this.props.navigation.navigate('ChatUI', {group})}
                                />
                                )
                                return(
                                <List key={i} containerStyle={{backgroundColor: '#c4e2ff'}}>
                                {g}
                                </List>
                                )
                        }
                        
                    })
                    return item
                })
     
                if(approved == false){
                    return(
                        <View style={{backgroundColor:'#c4e2ff', flex: 1}}>
                            <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                            You're not in any groups 😭
                            </Text>
                        </View>
                    );
                }
               
        }else{
            return(
                <View style={{backgroundColor:'#c4e2ff', flex: 1}}>
                    <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                    There are no groups 😱
                    </Text>
                </View>
            );
        }
      return(
          <View style={{backgroundColor:'#c4e2ff', flex: 1}}>
            <ScrollView>
                
                {groups ? <View containerStyle={{backgroundColor: '#c4e2ff'}}>{groups}</View> : 
                <Text style={{paddingTop: Dimensions.get('window').height*.25,
                              justifyContent: 'center',textAlign: 'center', 
                              fontStyle: 'italic', 
                              fontSize: 24}}>
                            🚫 Something went wrong ⁉️</Text>}

                
            </ScrollView>
          </View>
      )
    }
    //clears the message list
    async _performClearList() {
        // asnychronously get the length to remove the elements form the message list
        let count = await this.props.uiState.chatroom.messages.length;
        for (let index = 0; index <= count; index++) {
            this.props.uiState.chatroom.messages.pop();
        }
    }
}


const MapStateToProps = (state) => {
    //console.log(state);
    return {
      uiState: state,
      auth: state.firebase.auth,  // auth passed as props.auth
      profile: state.firebase.profile // profile passed as props.profile
    }
  }

export default connect(MapStateToProps)(MessengerScreen);
