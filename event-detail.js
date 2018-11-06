import React, { Component } from 'react';
import { View, Alert, Dimensions, ScrollView } from 'react-native';
import { FormLabel, FormInput, Button, FormValidationMessage } from 'react-native-elements';
import { MapView, ImagePicker, Permissions, Location } from 'expo';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { firebaseConnect, populate } from 'react-redux-firebase';
import * as firebase from 'firebase';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

//decorators that connect firebase db and assigns props for class
@firebaseConnect([   // query for firebase db on connect
    { path: '/posts', queryParams: ['orderByChild=created_at', 'limitToLast=5'], populates}  
])
@connect(  
   ({ firebase}) => ({
       auth: firebase.auth,  // auth passed as props.auth
       profile: firebase.profile, // profile passed as props.profile
       posts: populate(firebase, 'posts', populates), //all posts from fb db
       
   })
 )
export default class EventDetailScreen extends Component {
    
        state = { 
            database: firebase.database(),
            photoAdded: false,  //photo not added button shows add photo
            name: 'name',  //name of the event
            nameValidation: true, //input validation for name
            address: null, //address of event
            addressValidation: true, //input validation for address
            eventDescription: 'event', //event description 
            eventValidation: true, //input validation for event description
            hasCameraPermission: null, // permission for camera usage
            hasLocationPermission: null, //permissions for location usage
            image: null,  //image uri path
            region: {  // initial location of MapView and Marker
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0052720501213840976,  //zoom level
                longitudeDelta: 0.008883477549531449  //zoom level
            },
        }
        

    //navigation not used maybe implement later
    static navigationOptions = ({ navigation }) => ({  
        title: 'Add Event Details'
    });

    async componentWillMount() {
        //ask permission for camera use
        const { camstatus } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)
        //set state for camera permissions
        this.setState({ hasCameraPermission: camstatus === 'granted' })
        //ask permission for location
        const { geostatus } = await Permissions.askAsync(Permissions.LOCATION)
        //set state for location permissions
        this.setState({ hasLocationPermission: geostatus === 'granted' })
      }

    componentDidMount() {
        //bind functions to navigation params
        this.props.navigation.setParams({ 
            showImagePicker: this._pickImage.bind(this),
            getCurrentPosition: this._getLocationAsync.bind(this)
        });
    }
    
    //pick image from library asynchronously
    _pickImage = async () => {      // picks image from device
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });

        //console.log('_pickImage: ' + result);
        
        if (!result.cancelled) {
            //set image ur
            this.setState({ image: result.uri });
            //set the photoAdded bool to change button text
            this.setState({ photoAdded: true});
        }
    }
    //updates the mapview location after user inputs postal address returns
    //lat/long and delta's for zoom
    async _updateMapView(address) {
        if(!address){
            this.setState({addressValidation: false});
            return;
        }
        //retrieves lat/long from postal address
        let location = await Location.geocodeAsync(address)
        console.log(JSON.stringify(location))
        if(location !== undefined){
            //assign lat/long and delta to object that will replace region state
            //because state is nested we have to create an object to update this.state.region parameters
            var region = {
                latitude: location[0].latitude,
                longitude: location[0].longitude,
                latitudeDelta: 0.0052720501213840976,
                longitudeDelta: 0.008883477549531449
            }
            //sets the region updates lat/long from postal code and renders map location
            this.setState({region});
        }
    }
      //show's coordinates of the region selected by user real-time
      onRegionChange(region) {  
        console.log(region);
      }
     //lastly get's location and posts to firebase db.
    _getLocationAsync = async () => {        
        //retrieves user's location
        let location = await Location.getCurrentPositionAsync({});  
        //gets postal location of lat/long and retrieves user's postal address
        let postal = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude, longitude: location.coords.longitude}) 
        //console.log("postal: " + JSON.stringify(postal)) 
        // post to firebase db with push
        this.props.firebase.push('/posts', { 
            user_id: this.props.auth.uid,  // user_uid
            event_name: this.state.name, //event name
            event_description: this.state.eventDescription, //event description
            address: this.state.address, //event address
            map_region: this.state.region, // event map region
            created_at: (new Date()).getTime(),  //date created
            image: this.state.image,  // image location
            location: `${postal[0].city}`+', '+`${postal[0].region}`,  //object city, state
        })
        .then(this._updatePostCount(this.state.name))
        .then(Alert.alert("Congratulations!,\n"+ this.props.profile.username +"\n"+"You just created the event " + this.state.name +"!"))
        .then(this.props.navigation.dispatch(StackActions.reset({
                index:0,
                actions: [NavigationActions.navigate({ routeName: 'Timeline'})]
        })));
    };

//updates the count of post on firebase db
_updatePostCount(eventName) {
    let updates = {};
    let posts = this.props.profile.posts || [];
    posts.push(eventName);
    updates['/profiles/' + this.props.auth.uid + '/posts'] = posts;
    this._getRef().update(updates);
}

//gets reference of firebase db
_getRef(){
    return firebase.database().ref();  //in firebase documentation
  }

render() {
    
    return (
        <ScrollView>
        <View>
            
            <FormLabel>Event Name</FormLabel>
            <FormInput
                textInputRef='eventField'
                ref='name'
                onChangeText={(value) => this.setState({ name: value})}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => { this.secondTextInput.focus(); }}
                returnKeyType='next'
                />

            <FormValidationMessage>
            {this.state.nameValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Event Description</FormLabel>    
            <FormInput 
            ref={(input) => { this.secondTextInput = input; }}
            multiline 
            onChangeText={(text) => this.setState({eventDescription: text})}
            value={this.state.text}
            onSubmitEditing={() => { this.thirdTextInput.focus(); }}
            />
            <FormValidationMessage>
            {this.state.eventValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Address</FormLabel>
            <FormInput
                textInputRef='addressField'
                ref={(input) => { this.thirdTextInput = input; }}
                onChangeText={(text) => this.setState({ address: text })}
                autoCapitalize='words'
                onSubmitEditing={()=> this._updateMapView(this.state.address).then(this.thirdTextInput.focus())}
                returnKeyType='send'
                />

            <FormValidationMessage>
            {this.state.addressValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <MapView
                style={{ height: 300, width: Dimensions.get('window').width, borderRadius: 25 }}
                region={this.state.region}
                onRegionChange={this.onRegionChange}
            >
                <MapView.Marker
                title={this.state.name}
                description={this.state.eventDescription}
                coordinate={{latitude: this.state.region.latitude, longitude: this.state.region.longitude}}
                />
            </MapView>

            <Button
                onPress={() => this._performPhotoOrPost()}
                title={this.state.photoAdded ? "Post Event" : "Add Photo"}
                style={{marginTop: 25}}
                backgroundColor='#79B345'
                />                       


        </View>
        </ScrollView>
    );
}
/*Allows user to upload photo for event or Post if user has already
uploaded a photo*/
_performPhotoOrPost() {
    if (this.state.photoAdded) {
        //do post if all fields are empty show validation error
        if(!this.state.name && !this.state.eventDescription && !this.state.address){
            this.setState({nameValidation: false})
            this.setState({eventValidation: false})
            this.setState({addressValidation: false})
            return;
        }else if(!this.state.name){
            //if event name is empty show validation error for only name
            this.setState({nameValidation: false})
            return;
        }else if(!this.state.eventDescription){
            //if description is empty show validation error for this only
            this.setState({eventValidation: false})
            return;
        }else if(!this.state.address){
            //if address is empty show validation error for this only
            this.setState({addressValidation: false})
            return;
        }
        //call async function getCurrentPosition() to get location 
        this.props.navigation.state.params.getCurrentPosition();
        
    } else {
        //do photo if photoAdded is false then allow user to pick image
        this.props.navigation.state.params.showImagePicker();
    }
}

}

