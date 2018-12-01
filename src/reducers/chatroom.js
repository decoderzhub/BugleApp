
import { combineReducers } from 'redux';

import messages from './messages';

const initialState = {
    isFetching: false,
    lastFetched: null,
    finishedUploading: false,
    height: 0
}

const meta = (state = initialState, action) => {
    switch (action.type) {
        case 'START_FETCHING_MESSAGES':
            //console.log('fetching messages....')
            return Object.assign({}, state, {
                isFetching: true
            });
            case 'RECEIVED_MESSAGES':
            //console.log('Received Messages....')
            return Object.assign({}, state, {
                isFetching: false,
                lastFetched: action.receivedAt
            });
            case 'UPDATE_MESSAGES_HEIGHT':
            //console.log('Updating Messages Height....')
            return Object.assign({}, state, {
                height: action.height
            });
        default:
            return state
    }
}

const chatroom = combineReducers({
    messages,
    meta
});

export default chatroom;
