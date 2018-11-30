import React, { Component } from 'react';
import { 
    ScrollView, 
    ImageBackground, 
    Text, 
    View, 
    TouchableHighlight, 
    Dimensions,
    Alert,
    Button
} from 'react-native';
import { Avatar, Icon, List, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect, populate } from 'react-redux-firebase';

const populates = [{
     child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
    { path: '/posts', queryParams: ['orderByChild=created_at', 'limitToLast=10'], populates}
])  
@connect(
    ({ firebase}) => ({
        auth: firebase.auth,  // auth passed as props.auth
        profile: firebase.profile, // profile passed as props.profile
        posts: populate(firebase, 'posts', populates), //all posts from fb db
        
    })
  )
export default class TimelineScreen extends Component {
    constructor(props) {
        super(props)
    }
    static navigationOptions = ({ navigation }) => ({
        title: 'Recent Events',
        headerRight: <Button
            title='Add Event'
            onPress={() => navigation.navigate('EventDetails')}/>
    });

    state = {
        initials: "n/a",
    }

    _getInitials(username){
       if(username != null){ //does displayName exist if so then lets get first and last initial
   
         var name = username.split(' '); //split the first and last name where there is a space " "
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

    _parseTime(time) {  //parse time for event
        let semi = ':';
        let space = ' ';
        let nTime = time.split(':')
        let hour = nTime[0];
        let min = nTime [1];
        if ( hour > 12){
            let tod = 'PM';
            hour = hour - 12;
            let parsedTime = hour+semi+min+space+tod;
            return parsedTime;

        }else{
            let tod = 'AM';
            let parsedTime = hour+semi+min+space+tod;
            return parsedTime;

        }        
    }

    _parsedDate(date) {  //parse date for events
        let comma = ', ';
        let space = ' ';
        let ndate = date.toString().split(' ');
        let dayName = ndate[0];
        let month = ndate[1];
        let dayNum = ndate[2];
        let year = ndate[3];
        let time = this._parseTime(ndate[4]);

        let timePosted = dayName+comma+
                         month+space+dayNum+comma+
                         year+space+time
        return timePosted;
    }

    componentWillReceiveProps(props) {
        const { posts } = this.props;
        if (props.posts !== posts) {
          console.log("received post!");
        }
      }

    render() {
        let posts = null;
        let displayAvatar = null;
        let listItem = null;
        //console.log(this.props.posts);
        if (this.props.posts){
            posts = Object.values(this.props.posts).sort((a,b) => b.created_at - a.created_at).map((post, i) => {
               let date = new Date(post.created_at);
               if(post.user_id.photoURL)
               {
                   displayAvatar = (
                    <Avatar
                    medium
                    rounded
                    source={{uri: post.user_id.photoURL}}
                    containerStyle={{borderRadius: 25,
                                     marginLeft: Dimensions.get('window').width-70}}
                    />                
                   )
                   listItem = (
                    <ListItem
                    containerStyle={{backgroundColor: '#ffa64e', borderRadius: 15}}
                    roundAvatar
                    avatar={{uri: post.user_id.photoURL}}
                    titleStyle={{color: 'white'}}
                    subtitleStyle={{color: 'white'}}
                    title={post.event_name}
                    subtitle={'By: ' + post.user_id.username}
                    rightIcon={{name: 'chevron-right', color: 'white'}}
                    rightTitle='view more details'
                    rightTitleStyle={{color: 'white'}}
                    onPress={() => this.props.navigation.navigate('Post', {post})}
                    >
                    </ListItem>
                   )
              }else{
                  displayAvatar = (
                    <Avatar
                    medium
                    rounded
                    title={this._getInitials(post.user_id.username)}
                    containerStyle={{width: 50, 
                                     height: 50, 
                                     position: "absolute", 
                                     marginTop:-5,
                                     marginLeft: Dimensions.get('window').width-60}}
                    />                
                   )
                   listItem = (
                    <ListItem
                    roundAvatar
                    avatar={<Avatar
                        rounded
                        title={this._getInitials(post.user_id.username)}
                      />}
                    title={post.event_name}
                    subtitle={'By: ' + post.user_id.username}
                    rightIcon={{name: 'chevron-right', color: 'orange'}}
                    rightTitle='view more details'
                    rightTitleStyle={{color: 'orange'}}
                    onPress={() => this.props.navigation.navigate('Post', {post})}
                    >
                    </ListItem>
                   )
              }
               //console.log(post);
                return (
                    <View 
                    key={i} 
                    style={{padding: 10, marginBottom: 25, borderRadius:25, backgroundColor: '#c4e2ff'}}
                    >
                        
                        
                        {/* post_id parameters to send to post-details */}
                            <ImageBackground 
                                source={{uri: post.image, isStatic: true}}
                                style={{height: 250, borderRadius: 25}} 
                                imageStyle={{ borderRadius: 25 }}
                                >
                                {displayAvatar} 
                            </ImageBackground>
                        
                        <List containerStyle={{borderRadius: 20}}>
                                
                                {listItem}
                            
                        </List>
                        
                        {/*
                        <Text style={{textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                        {post.event_name}
                        </Text>
                        <Text style={{paddingTop: 5, textAlign: 'center', fontStyle: 'italic'}}>
                        {'By: ~' + post.user_id.username + '~\n'}
                        {this._parsedDate(date) +'\n'}
                        {post.location ? post.location : 'Somewhere in the world'}
                        </Text>

                         */}
                    </View>
                )

            });
        }else{
            return(
            <View>

            <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                There are no events 😱
            </Text>

            </View>
            )
        }
        return( 
            <ScrollView style={{backgroundColor: '#ffbf00'}}>
                {posts}
            </ScrollView>
        );
    }

}
