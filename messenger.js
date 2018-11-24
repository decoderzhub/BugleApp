import React, { Component } from 'react';
import { Button } from 'react-native';
import { Provider, connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import * as firebase from 'firebase';
import ChatUI from './src/components/ChatUI';
import rootReducer from './src/reducers'
import { begin, startChatting} from './src/actions';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        //loggerMiddleware
    )
);

@firebaseConnect()
class MessengerScreen extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: 'Messenger',
    });

    state = {
        photoURL: null,
        database: firebase.database(),
        initials: null,
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

 render(){
    
     return(
        <Provider store={store}>
            <ChatUI/>
       </Provider>
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

export default connect(MapStateToProps)(MessengerScreen);
