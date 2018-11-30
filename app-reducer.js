import { combineReducers } from 'redux';
import { firebaseReducer as firebase } from 'react-redux-firebase';
import chatroom from './src/reducers/chatroom';
import user from './src/reducers/user'

const appReducer = combineReducers({
   chatroom,
   user,
   firebase
})

export default appReducer;