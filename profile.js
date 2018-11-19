import React, { Component } from 'react';
import { Button, Text, StyleSheet } from 'react-native';
import md5 from 'blueimp-md5';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { ImagePicker } from 'expo';
import * as firebase from 'firebase';

const styles = StyleSheet.create({
    statsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 40,
    },

    stats: {
        fontWeight: '700'
    }
});


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
  
 _getInitials(){
    if(firebase.auth().currentUser.displayName != null){ //does displayName exist if so then lets get first and last initial

      var name = firebase.auth().currentUser.displayName.split(' '); //split the first and last name where there is a space " "
      //console.log(name[0]);

      console.log("first name: " + name[0] + " last name: " + name[1])
      
      var fInitial = name[0].slice(0, 1); // get first initial of first name
      
      var lInitial = name[1].slice(0, 1); // get first initial of last name
      
      console.log("initials: " + fInitial+lInitial );
      
      this.state.initials=fInitial+lInitial;
      
      console.log(this.state.initials);

      return this.state.initials //returns the first and last initials
    
    }else{
      return this.state.initials; //returns the initials "??""
    }
  } 

//pick image from library asynchronously
_pickImage = async () => {      // picks image from device
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    //console.log('_pickImage: ' + result);
    
    if (!result.cancelled) {
        console.log(this.props.auth);
        console.log(this.props.profile);
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
     let follow = this.props.profile && this.props.profile.following ? Object.keys(this.props.profile.following).length : 0;
     let posts = this.props.profile.posts ? Object.keys(this.props.profile.posts).length : 0;
     let displayAvatar = null;
    
     if(this._avatarURL())
     {
         displayAvatar = (
            <Avatar
                large
                rounded
                source={{uri: this._avatarURL()}}
                containerStyle={{marginTop:35, width: 75, height: 75, marginVertical: 10}}
                onPress={() => this.props.navigation.state.params.showImagePicker()}
                />
         )
    }else{
        displayAvatar = (
            <Avatar
                large
                rounded
                title={this._getInitials()}
                containerStyle={{marginTop:35, width: 75, height: 75, marginVertical: 10}}
                onPress={() => this.props.navigation.state.params.showImagePicker()}
                />
         )
    }
     return(
        <Grid>
            <Col style={{alignItems: 'center'}}>
                {displayAvatar}
                <Text style={{fontSize: 18, marginBottom: 15}}>{name}</Text>
            <Row>
                <Col style={styles.statsContainer}><Text style={styles.stats}> {follow} Following</Text></Col>
                <Col style={styles.statsContainer}><Text style={styles.stats}> {posts} Posts</Text></Col>
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
