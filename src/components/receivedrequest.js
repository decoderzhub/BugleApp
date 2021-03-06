import React, { Component } from 'react';
import { View, ScrollView, Alert, Text, Dimensions } from 'react-native';
import { Avatar, List, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect, populate } from 'react-redux-firebase';
import * as firebase from 'firebase';

const populates = [{
    child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
    { path: '/message_groups', queryParams: ['orderByChild=created_at'], populates},
    { path: '/profiles', queryParams: ['orderByChild=created_at'], populates}
])  
@connect(
   ({ firebase}) => ({
       auth: firebase.auth,  // auth passed as props.auth
       profile: firebase.profile, // profile passed as props.profile
       message_groups: populate(firebase, 'message_groups', populates), //all posts from fb db
       
   })
 )
class ReceivedRequestScreen extends Component{
   
    static navigationOptions = ({ navigation }) => ({
        title: 'Received Request',
    });

    state = {
        database: firebase.database(),
    }

 render(){
    let request = null;
    let r = this.props.profile.profile_stats.received_request
    if(this.props.navigation.state.params.received_request != 0){

    if(this.props.navigation.state.params.received_request > 0)
    {
        if(r !== undefined)
        {
            request  =  Object.values(r).map((name, i) => {
             console.log(name)
                 if(!name.user || !name.event_name){
                     return
                 }
                 if(name.photoURL){
                request = (    
                            <ListItem 
                                 containerStyle={{width: 300, borderRadius: 10, backgroundColor: '#ffa64e'}}
                                 roundAvatar
                                 avatar={{uri: name.photoURL ? name.photoURL : <Avatar
                                    rounded
                                    title={name.initials}
                                  />}}
                                 titleStyle={{textAlign: 'center', color: 'white'}}
                                 title={' Approve ' +name.user+' 🤝'}
                                 subtitleStyle={{textAlign: 'center', color: 'white'}}
                                 subtitle={'for ' + name.event_name}
                                 onPress={() => this._approveUser(name)}
                                 hideChevron
                                >
                        
                        </ListItem>
                        
                    
                    )
                }else{
                    
                    request = (    
                                <ListItem 
                                     containerStyle={{width: 300, borderRadius: 10, backgroundColor: '#ffa64e'}}
                                     roundAvatar
                                     avatar={<Avatar
                                        rounded
                                        title={name.initials}
                                      />}
                                     titleStyle={{textAlign: 'center', color: 'white'}}
                                     title={' Approve ' +name.user+' 🤝'}
                                     subtitleStyle={{textAlign: 'center', color: 'white'}}
                                     subtitle={'for ' + name.event_name}
                                     onPress={() => this._approveUser(name)}
                                     hideChevron
                                    >
                            
                            </ListItem>
                            
                        
                        )
                }

                    return(
                     <List key={i} containerStyle={{ alignItems: 'center',backgroundColor: '#c4e2ff'}}>
                       {request}
                     </List>
                     )
                    
           })

        }else{
            request = (
    
                <ListItem 
                containerStyle={{backgroundColor: '#ffa64e', borderRadius: 10}}
                titleStyle={{textAlign: 'center', color: 'white'}}
                title={'no request 😕'}
                hideChevron
                >
                    
                </ListItem>
              
               )
        }

    }else if(this.props.navigation.state.params.received_request < 1)
    {        
       
        

    }
    }else{

        request = (
    
            <ListItem 
            containerStyle={{backgroundColor: '#ffa64e', borderRadius: 10}}
            titleStyle={{textAlign: 'center', color: 'white'}}
            title={'no request 😕'}
            hideChevron
            >
                
            </ListItem>
        )

    }

   return(
    <View style={{backgroundColor:'#c4e2ff', flex: 1}}>
    <ScrollView>
        
        {request ? <View containerStyle={{borderRadius: 10, alignItems: 'center' }}>{request}</View> : 
        <Text style={{paddingTop: Dimensions.get('window').height*.25,
                      justifyContent: 'center',textAlign: 'center', 
                      fontStyle: 'italic', 
                      fontSize: 24}}>
                    🚫 Something went wrong ⁉️</Text>}

        
    </ScrollView>
  </View>
   )
 }


_approveUser(user) {
    console.log(user);
    Alert.alert(
        'Approve ' + user.user,
        'Are you sure you want to approve this person?',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Yes', onPress: () => this._sendApproval(user)},
        ],
        { cancelable: true }
      )

}
_removeSentRequest(user, key){
    //see if this already exist?
    if(this.state.database.ref('/profiles/'+ user.user_id +'/profile_stats/sent_request/'+key))
    {
        console.log('this sent_request does exist');
        this.props.firebase.remove('/profiles/'+ user.user_id +'/profile_stats/sent_request/'+key)
        .then((result) => {
            console.log(result);
        })
    }else{
        console.log('this sent_request doesn\'t exists');
    }
}
_removeReceivedRequest(key){
    //see if this already exist?
    if(this.state.database.ref('/profiles/'+ firebase.auth().currentUser.uid +'/profile_stats/received_request/'+key))
    {
        console.log('this received_request does exist');
        this.props.firebase.remove('/profiles/'+ firebase.auth().currentUser.uid +'/profile_stats/received_request/'+key)
        .then((result) => {
            console.log(result);
        })
    }else{
        console.log('this received_request doesn\'t exists');
    }
}

_updateReceivedRequestList(user) {
    var ref = firebase.database().ref("/profiles/"+firebase.auth().currentUser.uid+'/profile_stats');    
    var query = ref.child("received_request");
    var self = this; //scope of the variable to be accessed outside of local nested function
    var requestData = [];
    query.once("value",(snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var key = childSnapshot.key;
            var value = childSnapshot.val();
            requestData.push(value);
            console.log(requestData);
            Object.values(requestData).map((request) => {
                 if(request.event_name === user.event_name && request.user === user.user)
                 {
                     self._removeReceivedRequest(key);
                 }
            })
        });
    })
    this._addUsertoGroup(user);
}

_addUsertoGroup(user){
    var ref = firebase.database().ref("/message_groups");    
    var query = ref.orderByChild('created_at');
    var self = this;
    var requestData = [];
    query.once("value",(snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var key = childSnapshot.key;
            var value = childSnapshot.val();
            requestData.push(value);
            console.log(requestData);
            Object.values(requestData).map((request) => {
                console.log(request);
                let updates = {};
                let messageGroup = request.approved_users || []; 
                let createGroup = {name: user.user}
                messageGroup.push(createGroup);
                updates['/message_groups/' + user.group_key +'/approved_users'] = messageGroup;
                self.state.database.ref().update(updates);    
                updates = null;
                messageGroup = null;
                createGroup = null; 
            })
        });
    })
    Alert.alert(user.user + ' is Approved!');
}

_sendApproval(user){
    var ref = firebase.database().ref("/profiles/"+user.user_id+'/profile_stats');    
    var query = ref.child("sent_request");
    var self = this;
    var requestData = [];
    query.once("value",(snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var key = childSnapshot.key;
            var value = childSnapshot.val();
            requestData.push(value);
            console.log(requestData);
            Object.values(requestData).map((request) => {
                console.log(request);
                console.log(user);
            
                 if(request.event_name === user.event_name && request.created_by === firebase.auth().currentUser.displayName)
                 {
                     self._removeSentRequest(user, key);
                     this._updateReceivedRequestList(user)
                 }
            
            })
        });
    })
}

}


const MapStateToProps = (state) => {
    //console.log(state);
    return {
      auth: state.firebase.auth,  // auth passed as props.auth
      profile: state.firebase.profile // profile passed as props.profile
    }
  }

export default connect(MapStateToProps)(ReceivedRequestScreen);
