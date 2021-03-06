import React, { Component } from 'react';
import { Text, View, Alert, ScrollView, Dimensions } from 'react-native';
import { Button, Avatar, List, ListItem } from 'react-native-elements';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';
import { firebaseConnect, populate } from 'react-redux-firebase'
import { Grid, Row, Col } from "react-native-easy-grid";
import { MapView, Permissions, Location } from 'expo';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

@firebaseConnect()
@connect(  
    ({ firebase }) => ({
        auth: firebase.auth,  // auth passed as props.auth
        profile: firebase.profile, // profile passed as props.profile   
        posts: populate(firebase, 'posts', populates), //all posts from fb db     
    })
  )
export default class PostDetailScreen extends Component {
    constructor(props){
        super(props);
        console.log(this.props.auth);
        console.log("CHECK HERE!!!!")
        console.log(this.props.navigation.state.params.post);
    }
    state = {
        database: firebase.database(),
        postInfo: this.props.navigation.state.params.post,
        postUserId: this.props.navigation.state.params.post.user_id,
        postEmail: this.props.navigation.state.params.post.user_id.email,
        postEventName: this.props.navigation.state.params.post.event_name,
        postId: [],
        imageName: this.props.navigation.state.params.post.photoURL,
        exists: false,
        request: this.props.navigation.state.params.post.user_id.profile_stats.received_request ?
        this.props.navigation.state.params.post.user_id.profile_stats.received_request : null ,
        region: {  // initial location of MapView and Marker
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0052720501213840976,  //zoom level
            longitudeDelta: 0.008883477549531449  //zoom level
        },
    }
    static navigationOptions = {
        title: 'Event Details'
    };

    //alert user to verify if want to delete event post
    _removeEvent() { //remove event
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'Yes', onPress: () => this._getSnapShot()},
            ],
            { cancelable: true }
          )
    }

   componentDidMount(){
    if(this.state.request){
        Object.values(this.state.request).map((request,i)  =>{
            if (request.event_name == this.state.postEventName && request.user_id == firebase.auth().currentUser.uid ){
                this.setState({exists: true})
            }
        })
    }
    console.log(this.props.navigation.state.params.post.user_id.profile_stats.received_request);
   }

   //get a snapshot and key of the posts that match the one selected
    _getSnapShot() {
            var ref = firebase.database().ref("/posts");
            var query = ref.orderByChild("created_at").equalTo(this.props.navigation.state.params.post.created_at);
            var self = this; //scope of the variable to be accessed outside of local function .foreach()
            var postId = [];
            query.once("value",function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
               // var postData = childSnapshot.val();
                postId.push(childSnapshot.key);
                self._removeEventFromDB(postId)
            });
        })
    }

    //removes the event post from the firebase db
    _removeEventFromDB(delKey) {
        this.props.firebase.remove('/posts/'+ delKey)
        //return back to timline screen
        .then((result) => {
            console.log(result);
        })
        this._updatePostCount();
       
    }

    //updates the count of post on firebase db
_updatePostCount() {
    firebase.database().ref('/profiles');
    if(Object.keys(this.props.profile.posts).length == 1)
    {
        this.props.firebase.remove('/profiles/'+ this.props.auth.uid +'profile_stats/posts/0') 
        .then((result) => console.log('post deleted '+ result));
        
    }else{
        this.props.firebase.remove('/profiles/'+ this.props.auth.uid +'profile_stats/posts/'+ (Object.keys(this.props.profile.posts).length - 1).toString()) 
        .then((result) => console.log('post deleted '+ result));

    }
    this._removeImage();
}
_avatarURL() {
     console.log(this.props.navigation.state.params.post.user_id.photoURL);
    if (!this.props.navigation.state.params.post.user_id.photoURL) {
      //return user initials as photo like slack
      return null;
    } else {
      return this.props.navigation.state.params.post.user_id.photoURL;
    }
  }

  

    //remove photo from firebase file storage
    _removeImage = async () => {
        const ref = firebase.storage().ref("images/"+ this.props.auth.uid + '/' + this.state.imageName);
        await ref.delete()
        .then(() => {
            this.props.navigation.dispatch(StackActions.reset({
                index:0,
                actions: [NavigationActions.navigate({ routeName: 'Timeline'})]
            }))
        })
        .catch((deleteError) => {
            console.log(deleteError);
        });
            }

    //alert user joined event
    _joinEvent() {
        if(this.state.request){
            Object.values(this.state.request).map((request,i)  =>{
                //console.log(request);
                //console.log(JSON.stringify(request) +'index = '+ i);
                if (request.event_name == this.state.postEventName && request.user_id == firebase.auth().currentUser.uid ){
                    Alert.alert("You have already sent a request!");
                    return this.setState({exists: true})
                }
            })

        }
        if(this.state.exists == false)
        {
            Alert.alert("Join Event?", this.props.profile.username +"\n"+"are you sure you want to join\n" + this.state.postEventName +"?",
                [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Continue', onPress: () => this._sendRequest(this.props.auth.uid)},
                ],
              { cancelable: true })
        }
    }
    
    //send request to creator of the post and to self...
    _sendRequest(uid) {
        let updates = {};
        let request = this.props.navigation.state.params.post.user_id.profile_stats.received_request || [];
        console.log(request);
        let myrequest = this.props.profile.profile_stats.sent_request || [];
        request.push({user_id: firebase.auth().currentUser.uid,
                        user: firebase.auth().currentUser.displayName,
                        photoURL: firebase.auth().currentUser.photoURL,
                        event_name: this.state.postEventName,
                        group_key: this.props.navigation.state.params.post.group_id,
                        initials: this.props.profile.initials
                    });
        let mr = {event_name: this.props.navigation.state.params.post.event_name, 
                    created_by: this.props.navigation.state.params.post.created_by,
                    photoURL: this.props.navigation.state.params.post.user_id.photoURL}
        myrequest.push(mr);
        updates['/profiles/' + this.props.navigation.state.params.post.id + '/profile_stats/received_request'] = request ;
        updates['/profiles/' + uid +'/profile_stats/sent_request'] = myrequest;
        this.state.database.ref().update(updates); 
        this.state.exists=true;
    }

    _alreadyJoinedButton() {
        return(
            <Button
                onPress={() => Alert.alert('Already Sent Request!!!')}
                backgroundColor={color="grey"}
                style={{marginTop: 8}}
                title={'Request Sent'} 
                /> 
            )          
    }

    _JoinOrDeleteButton() {
        return(
        <Button
            onPress={this.state.postEmail != this.props.profile.email ? () => this._joinEvent() : () => this._removeEvent()}
            backgroundColor={this.state.postEmail != this.props.profile.email ? color='green' : color="red"}
            style={{marginTop: 8}}
            title={this.state.postEmail != this.props.profile.email ? "Join" : "Delete"} 
            /> 
        )             
    }
    render() {
        console.log(this.props.auth.uid)
        let joinedButton = null;
        let displayAvatar = null;
        if (this._avatarURL()) {
        displayAvatar = (
          <Avatar
            xlarge
            rounded
            source={{ uri: this._avatarURL() }}
            containerStyle={{
              borderRadius: 25,
              marginTop: 5,
              marginVertical: 10
            }}
            //onPress={() => this.props.navigation.state.params.showImagePicker()}
          />
        );
      } else {
        displayAvatar = (
          <Avatar
            xlarge
            rounded
            title={this.props.profile.initials}
            containerStyle={{ marginTop: 5, marginVertical: 10 }}
            //onPress={() => this.props.navigation.state.params.showImagePicker()}
          />
        );
      }
        
        return(
            <ScrollView style={{ backgroundColor: "#ffbf00" }}>
            <Grid style={{ backgroundColor: "#ffbf00" }}>
          <Col style={{ alignItems: "center"}}>
          <Col  style={{ alignItems: "center"}}>
          <Text style={{ fontSize: 18, marginTop: 5 }}>{"Hosted By: "+this.props.navigation.state.params.post.created_by}</Text>
            {displayAvatar}
          </Col >
                <Text style={{ fontSize: 18, marginTop: 5, marginBottom: 10, }}>{this.props.navigation.state.params.post.event_name + " Location"}</Text>
                <MapView
                style={{ height: 300, width: Dimensions.get('window').width, borderRadius: 25 }}
                region={this.state.region}
                //onRegionChange={this.onRegionChange}
            >
                <MapView.Marker
                title={this.state.postEventName}
                description={this.props.navigation.state.params.post.event_description}
                coordinate={{latitude: this.props.navigation.state.params.post.map_region.latitude, longitude: this.props.navigation.state.params.post.map_region.longitude}}
                />
            </MapView>
            
            <Row>
              <Col>
                <List>
                <ListItem
                    // badge={{
                    //   value: "Test",
                    //   textStyle: { color: "#ffbf00" },
                    //   containerStyle: { marginRight: 55 }
                    // }}
                    title={"Location: " + this.state.postInfo.location}
                    titleStyle={{ textAlign: "left" }}
                    hideChevron
                  />
                <ListItem
                    // badge={{
                    //   value: "Test",
                    //   textStyle: { color: "#ffbf00" },
                    //   containerStyle: { marginRight: 55 }
                    // }}
                    title={"Address: " + this.state.postInfo.address}
                    titleStyle={{ textAlign: "left" }}
                    hideChevron
                  />
                  <ListItem
                    // badge={{
                    //   value: "Test",
                    //   textStyle: { color: "#ffbf00" },
                    //   containerStyle: { marginRight: 55 }
                    // }}
                    title={"Credit Hours: " + this.state.postInfo.credit_hours + " hours"}
                    titleStyle={{ textAlign: "left" }}
                    hideChevron
                  />
                  <ListItem
                    // badge={{
                    //   value: "Test",
                    //   textStyle: { color: "#ffbf00" },
                    //   containerStyle: { marginRight: 55 }
                    // }}
                    title={"Description"}
                    subtitle={this.state.postInfo.event_description}
                    titleStyle={{ textAlign: "center", height: 50 }}
                    hideChevron
                    subtitleNumberOfLines={10}
                    titleNumberOfLines={10}
                  />
                </List>
              </Col>
            </Row>
          </Col>
        </Grid>
                {/* <Text>
                Details' for {this.props.navigation.state.params.post.event_name}
                </Text> */}
                {this.state.exists ? this._alreadyJoinedButton() : this._JoinOrDeleteButton()} 

            </ScrollView>
        );
    }
}
