
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactNative, {Button, Platform, Dimensions, Text as MyText } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { Screen } from '@shoutem/ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Messages from '../containers/Messages';
import Input from '../containers/Input';
import { sendMessage, groupLocation, removeMessages } from '../actions';
import { Font } from 'expo';
import { begin, setUserName, setUserAvatar} from '../actions';
import * as firebase from 'firebase';
import messages from '../reducers/messages';

const mapStateToProps = (state) => ({
    chatHeight: state.chatroom.meta.height,
    user: state.user,
    uiState: state
});

class ChatUI extends Component {
    
    _displayMessageGroup(){
        console.log(messages);
    
    }
    
    static navigationOptions = ({ navigation }) => ({
        title: 'Chat',
        headerLeft: <Button title="Back" onPress={() => navigation.goBack()}></Button>
    });

    state = {
        scrollViewHeight: 0,
        inputHeight: 0,
        fontLoaded: false,
    }
    componentWillUpdate(){

    }

    async componentDidMount() {
        await Font.loadAsync({
          'Rubik-Regular': require('@shoutem/ui/fonts/Rubik-Regular.ttf')
        });
        this.setState({ fontLoaded: true });
        this.scrollToBottom(true);
        groupLocation(this.props.navigation.state.params.group.group_key);
        this.props.dispatch(begin());
        this.props.dispatch(setUserName(firebase.auth().currentUser.displayName));
        this.props.dispatch(setUserAvatar(firebase.auth().currentUser.photoURL));
      }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    onScrollViewLayout = (event) => {
        const layout = event.nativeEvent.layout;
        //console.log(layout) //ios width 375 height 641
                            // android width 411 height 340 multiply by 2 to get actuall height add 10 for <Input> component
        this.setState({
            scrollViewHeight: Platform.OS === 'ios' ? layout.height : (Dimensions.get('window').height * .5) + 50 
        });
    }

    onInputLayout = (event) => {
        const layout = event.nativeEvent.layout;
        this.setState({
            inputHeight: layout.height
        });
    }

    scrollToBottom(animate = true) {
        const { scrollViewHeight, inputHeight } = this.state,
              { chatHeight } = this.props;

        const scrollTo = chatHeight - scrollViewHeight + inputHeight;

        if (scrollTo > 0) {
           this.refs.scroll.scrollToPosition(0, scrollTo, animate)
        }
    }

    _scrollToInput(reactRef) {
        this.refs.scroll.scrollToFocusedInput(ReactNative.findNodeHandle(reactRef));
    }


    sendMessage = (text) => {
        return sendMessage(text, this.props.user)
    }

    render() {
        return (
            <Screen>
                {/*
                    this.state.fontLoaded ? (
                <Title styleName="h-center" style={{paddingTop: 10}}>
                    Global Chatroom
                </Title>
                    ) : <MyText> loading... </MyText>
                 */
                }
                <KeyboardAwareScrollView ref="scroll"
                                         onLayout={this.onScrollViewLayout}>
                   {
                       this.state.fontLoaded ? (
                           
                           <Messages />
                           ) : <MyText> loading... </MyText>
                           
                    }
                    {
                        this.state.fontLoaded ? (

                            <Input onLayout={this.onInputLayout}
                                   onFocus={this._scrollToInput.bind(this)}
                                   submitAction={this.sendMessage}
                                   ref="input"
                                   placeholder="Say something cool ..." />
                        ) : <MyText> loading... </MyText>
                    }
                </KeyboardAwareScrollView>
                <Button 
                onPress={() => this._showResults()}
                style={{marginTop: 25}}
                backgroundColor='#ff0000'
                title={'Show Results'}/>
            </Screen>
        )
    }

    _showResults() {
        console.log(this.props.uiState)
        this.props.uiState.chatroom.messages.pop()
        console.log(this.props.uiState)
        console.log(this.props.dispatch(removeMessages(messages)));
    }
}

export default connect(mapStateToProps)(ChatUI);
