
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactNative, { Text as MyText } from 'react-native';

import { Screen } from '@shoutem/ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Messages from '../containers/Messages';
import Input from '../containers/Input';
import { sendMessage, groupLocation } from '../actions';
import { Font } from 'expo';
import { begin, setUserName, setUserAvatar} from '../actions';
import * as firebase from 'firebase';

const mapStateToProps = (state) => ({
    chatHeight: state.chatroom.meta.height,
    user: state.user
});


class ChatUI extends Component {

    state = {
        scrollViewHeight: 0,
        inputHeight: 0,
        fontLoaded: false,

    }

    async componentDidMount() {
        await Font.loadAsync({
          'Rubik-Regular': require('@shoutem/ui/fonts/Rubik-Regular.ttf')
        });
        groupLocation(this.props.navigation.state.params.group.group_key)
        this.setState({ fontLoaded: true });
        this.scrollToBottom(false);
        this.props.dispatch(begin());
        this.props.dispatch(setUserName(firebase.auth().currentUser.displayName));
        this.props.dispatch(setUserAvatar(firebase.auth().currentUser.photoURL));
      }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    onScrollViewLayout = (event) => {
        const layout = event.nativeEvent.layout;

        this.setState({
            scrollViewHeight: layout.height
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
            </Screen>
        )
    }
}

export default connect(mapStateToProps)(ChatUI);
