import React, { Component } from 'react';
import { Button, Text, StyleSheet } from 'react-native';
import md5 from 'blueimp-md5';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { Avatar, List, ListItem, Button as RNButton } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { ImagePicker } from 'expo';
import * as firebase from 'firebase';
import { StackActions, NavigationActions} from 'react-navigation';

  @firebaseConnect()
class ProfileScreen extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: 'Profile',
        headerRight: <Button title="Add Contacts" onPress={() => navigation.navigate('AddContacts')} />
    });

    state = {
        photoURL: null,
        database: firebase.database(),
        initials: null,
        invites: 0,
    }

componentDidMount() {
    //bind functions to navigation params
    this.props.navigation.setParams({ 
        showImagePicker: this._pickImage.bind(this)
    });
}


 _avatarURL() {
    // console.log(this.props.profile);
    if(!this.props.profile.photoURL){
    //return user initials as photo like slack
        return null;
    }else{
        return this.props.profile.photoURL;
    } 

 }


_performSignOut = () => {
    this.props.navigation.dispatch(StackActions.reset({
        index:0,
        actions: [NavigationActions.navigate({ routeName: 'Main'})]
    }));
        firebase.auth().signOut();
      
}
//pick image from library asynchronously
_pickImage = async () => {      // picks image from device
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    //console.log('_pickImage: ' + result);
    
    if (!result.cancelled) {
        //console.log(this.props.auth);
        //console.log(this.props.profile);
        this._uploadImage(result.uri, this.props.auth.displayName)
        .then(() => {
            console.log('Upload Success');
        })
        .catch((err) => {
            console.log(err);
        })
        .then();
        //set the photoAdded bool to change button text
    }
}

//upload photo selected to firebase file storage
_uploadImage = async (uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    var ref = firebase.storage().ref().child("images/"+ this.props.auth.uid + '/' + imageName);
    await ref.put(blob)
    firebase.storage().ref().child("images/"+ this.props.auth.uid + '/' + imageName).getDownloadURL()
    .then(url => {
        //set image uri
        this.setState({ photoURL: url});
        firebase.auth().currentUser.updateProfile({
            photoURL: url,
          }).then(function() {
            //console.log("Profile updated successfully!");
          }, function(error) {
            // An error happened.
            Alert.alert(error.message);
          });
          //add user to the database with initial parameters
          this.state.database.ref('profiles/' + firebase.auth().currentUser.uid).update({
           photoURL: url,
          })
    });
}


 render(){
     let name = this.props.profile ? this.props.profile.username : 'Anonymous';
     let follow = this.props.profile.profile_stats.following && this.props.profile.profile_stats.following ? Object.keys(this.props.profile.profile_stats.following).length : 0;
     let posts = this.props.profile.profile_stats.posts ? Object.keys(this.props.profile.profile_stats.posts).length : 0;
     let received_request = this.props.profile.profile_stats.received_request ? Object.keys(this.props.profile.profile_stats.received_request).length : 0;
     let sent_request = this.props.profile.profile_stats.sent_request ? Object.keys(this.props.profile.profile_stats.sent_request).length : 0;
     let displayAvatar = null;
    
     if(this._avatarURL())
     {
         displayAvatar = (
            <Avatar
                xlarge
                rounded
                source={{uri: this._avatarURL()}}
                containerStyle={{borderRadius: 25, marginTop:35, marginVertical: 10}}
                onPress={() => this.props.navigation.state.params.showImagePicker()}
                />
         )
    }else{
        displayAvatar = (
            <Avatar
                xlarge
                rounded
                title={this.props.profile.initials}
                containerStyle={{marginTop:35, marginVertical: 10}}
                onPress={() => this.props.navigation.state.params.showImagePicker()}
                />
         )
    }
     return(

        <Grid style={{backgroundColor: '#ffbf00'}}>
            <Col style={{alignItems: 'center'}}>
                {displayAvatar}
                <Text style={{fontSize: 18, marginTop: 5}}>{name}</Text>
            <Row>
                <Col>
                <List>
                <ListItem badge={{ value: follow, textStyle: { color: '#ffbf00' }, 
                          containerStyle: { marginRight: 55 } }}
                          title="You're Following"
                          titleStyle={{textAlign: 'center', marginLeft: 75}}
                          hideChevron
                          />
                <ListItem badge={{ value: posts, textStyle: { color: '#ffbf00' }, 
                          containerStyle: { marginRight: 55 } }}
                          title="Created Post"
                          titleStyle={{textAlign: 'center', marginLeft: 75}}
                          hideChevron
                          />
                <ListItem badge={{ value: received_request, textStyle: { color: '#ffbf00' }, 
                          containerStyle: { marginRight: 25} }}
                          title="Received Requests"
                          titleStyle={{textAlign: 'center', marginLeft: 80}}
                          onPress={() => this.props.navigation.navigate('ReceivedRequestScreen', {received_request})}
                          />
                <ListItem badge={{ value: sent_request, textStyle: { color: '#ffbf00' }, 
                          containerStyle: { marginRight: 25} }}
                          title="Sent Request"
                          titleStyle={{textAlign: 'center', marginLeft: 80}}
                          />
                <ListItem badge={{ value: 0, textStyle: { color: '#ffbf00' }, 
                          containerStyle: { marginRight: 25} }}
                          title="Received Credits"
                          titleStyle={{textAlign: 'center', marginLeft: 80}}
                          />
                </List>
                <RNButton 
                onPress={() => this._performSignOut()}
                style={{marginTop: 25}}
                backgroundColor='#ff0000'
                title='Sign Out'/>
                </Col>
            </Row>
            </Col>

        </Grid>
     );
    }
}

const MapStateToProps = (state) => {
    //console.log(state);
    return {
      auth: state.firebase.auth,  // auth passed as props.auth
      profile: state.firebase.profile // profile passed as props.profile
    }
  }

export default connect(MapStateToProps)(ProfileScreen);
