import React, { Component } from "react";
import {
  NavigationActions,
  StackActions,
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { Alert, AsyncStorage } from "react-native";
import { Icon } from "react-native-elements";

import * as firebase from "firebase";

import { firebaseConnect } from "react-redux-firebase";
import { connect } from "react-redux";

import AddContactsScreen from "./src/components/add-contacts";
import LoginScreen from "./src/components/login";
import TimelineScreen from "./src/components/timeline";
import PostDetailScreen from "./src/components/post-detail";
import ProfileScreen from "./src/components/profile";
import EventDetailScreen from "./src/components/event-detail";
import MessengerScreen from "./src/components/messenger";
import ChatUI from "./src/components/ChatUI";
import ReceivedRequestScreen from "./src/components/receivedrequest";
import { signedStatus } from "./src/actions";

const TimelineNavigator = createStackNavigator({
  Timeline: { screen: TimelineScreen },
  Post: { path: "posts/:post_id", screen: PostDetailScreen },
  EventDetails: { screen: EventDetailScreen, mode: "modal" }
});
TimelineNavigator.navigationOptions = {
  title: "Timeline",
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="image" />
};

const ProfileNavigator = createStackNavigator({
  Profile: { screen: ProfileScreen },
  AddContacts: { screen: AddContactsScreen },
  ReceivedRequestScreen: { screen: ReceivedRequestScreen }
});
ProfileNavigator.navigationOptions = {
  title: "Profile",
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="account-box" />
};

const MessengerNavigator = createStackNavigator({
  Messages: { screen: MessengerScreen },
  ChatUI: { path: "group/:group_id", screen: ChatUI }
});
MessengerNavigator.navigationOptions = {
  title: "Messenger",
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="message" />
};

export const MainNavigator = createBottomTabNavigator({
  Home: { screen: TimelineNavigator },
  Messenger: { screen: MessengerNavigator },
  Profile: { screen: ProfileNavigator }
});

@firebaseConnect()
@connect(({ firebase, user }) => ({
  auth: firebase.auth, // auth passed as props.auth
  profile: firebase.profile, // profile passed as props.profile
  user: user
}))
export class Main extends Component {
  constructor() {
    super();
    console.ignoredYellowBox = ["Setting a timer"];
  }
  state = { authComplete: false };

  async _setupAuthentication() {
    let credentials = await AsyncStorage.multiGet(["email", "password"]);
    if (credentials[0][1] == null && credentials[1][1] == null) {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Login" })]
        })
      );
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(credentials[0][1], credentials[1][1])
        .then(
          () => {
            this.setState({ authComplete: true });
          },
          error => {
            Alert.alert(error.message);
            this.props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "Login" })]
              })
            );
          }
        );
    }
  }

  componentDidMount() {
    console.log("auth_state.isEmpty: " + this.props.auth.isEmpty);
    console.log(this.props.user);
    if (this.props.auth.isEmpty) {
      this._setupAuthentication();
    } else {
      this.props.dispatch(signedStatus(true));
      this.setState({ authComplete: true });
    }
  }

  render() {
    return this.state.authComplete && this.props.user.signedStatus ? (
      <MainNavigator />
    ) : (
      <LoginScreen />
    );
  }
}

export const AppNavigator = createStackNavigator(
  {
    Main: { screen: Main },
    Login: { screen: LoginScreen }
  },
  { headerMode: "none" }
);

export default connect()(AppNavigator);
