# BugleApp (Private Repository)
Non Profit Organization ( NPO ) social media App for volunteers and NPO's.  Allows NPO's and volunteers to create their own profile, events, post events to a timeline, and instant message members. 

## 1. Login using firebase
Users can login to their accounts using the login screen 
which will take them to the events timeline.

![bugleauthlow](https://user-images.githubusercontent.com/6371329/47967627-6ce69100-e02d-11e8-8d8e-5fc9e773abc8.gif)

***

## 2. Firebase Authentication accounts
Users accounts will be added to the firebase authentication console.  Admins can add, delete, and disable accounts from the firebase authentication console.

<img width="1017" alt="bugleapp authentication firebase console" src="https://user-images.githubusercontent.com/6371329/47968607-9e198e00-e03a-11e8-9c80-cf4783ff3535.png">

***

## 3. Adding a new event
Posting events is simple just touch add event and select an image to post a current event.
![bugleeventlow](https://user-images.githubusercontent.com/6371329/47968454-48dc7d00-e038-11e8-80e1-46b3636cf9e6.gif)![bugleaddeventlow](https://user-images.githubusercontent.com/6371329/48029578-8286b400-e11c-11e8-9950-c63d21ddc1ec.gif)

## UPDATE Add a new event
![buglecreateeventlow](https://user-images.githubusercontent.com/6371329/49267274-9c6b9c00-f427-11e8-9271-9194ff1d003b.gif)

***

## 4. Firebase database results in posting a new event
All posts are childs of the bugleapp db. 
Only the 5 most recent post are displayed.

<img width="900" alt="bugleapp database firebase console" src="https://user-images.githubusercontent.com/6371329/47968549-a3c2a400-e039-11e8-881a-49f3638afd5c.png">

***

## 5. Add contacts from profile screen
Users can add contacts which will increase the number of user's they are following.

![bugleprofileaddcontactlow](https://user-images.githubusercontent.com/6371329/47968686-5d6e4480-e03b-11e8-99cd-85f783e71463.gif)

***

## 6. Event Details
Users can open the events and see the details of the event

![buglepostdetailslow](https://user-images.githubusercontent.com/6371329/47968882-e25a5d80-e03d-11e8-8c87-f530d8a69398.gif)

***

## 7. Layout Updates and added Messenger Groups
Updated the layout view and added messenger groups tab to the middle bottom navigation tab.

<img src="https://user-images.githubusercontent.com/6371329/49266215-2fee9e00-f423-11e8-93e6-c21dcf48830e.gif" width="320" height="680"><img src="https://user-images.githubusercontent.com/6371329/49266786-7513cf80-f425-11e8-8494-9f9447ae1836.gif" width="320" height="680">

***

## 8. Group Messenger Chat
Users are added to group messengers after they are approved.

![bugleapproveuser](https://user-images.githubusercontent.com/6371329/49267575-3122c980-f429-11e8-9f12-55127e697039.gif)


## 9. Chat UI
The chat UI is buit so that you can talked to those approved in those groups.

![buglechatui](https://user-images.githubusercontent.com/6371329/49267806-23217880-f42a-11e8-8213-9bc1c73ebc29.gif)

## 10. Profile Stats
Profile Stats Change and update in real-time and profile picture will display initials for no profile pictures.

<img width="990" alt="bugleprofilescreen3x" src="https://user-images.githubusercontent.com/6371329/49268172-f4a49d00-f42b-11e8-856d-cbd142b109cc.png">


***

## 10. Post Details
Post details allows for the user to view the post details and join or delete if they are the event host.

<img src="https://user-images.githubusercontent.com/6371329/62904659-3b75c100-bd35-11e9-800e-de8b0f921e34.gif" width="320" height="680">

***

# Milestones 

## Things to do (short-range):

1. [X] Post counter increases when user adds post or events. 05-Nov-18

2. [X] Event-Details screen needs to display location, information of the event, and user subscribers. 04-Nov-18

3. [X] Upload images to file storage to be access from all users through the firebase db. 05-Nov-18

4. [X] Delete post, image, db content, and decrease post count. 15-Nov-18

5. [X] Marker on event location.  05-nov-18 

6. [X] Post Event Details need to populate on screen with supplied information. __projected__ (11-Aug-19)

7. [X] Event details needs start time field and hours of credit volunteers will receive. 20-Nov-18

8. [X] Display users uploaded photo or initials in avatar if photo is not present. 18-Nov-18

9. [X] Fix avatar rounded corner bug on Android devices. (containerSytle and/or parent view style)  20-Nov-18

10. [X] Show stats for users profile __(following, post, Rx requests, Tx request, credits)__ 25-Nov-18

11. [X] Develop messenger groups for created post 25-Nov-18

12. [X] Allow members to join the group and display group in messenger. 29-Nov-18

13. [ ] Develop screen component Received request, Sent request, and Received credits. __(Add to AppNavigator)__

14. [ ] Allow user to un-join events removing user from chat-group and updating database. __projected__ (18-Aug-19)


 
***

## Things to do  (long-range)
1. [ ] App splash screen

2. [X] Instant Messenger __Working on it..__ 🤯🤯🤯 29-Nov-18 __Complete__ 🎉🎉🎉

3. [ ] Instant Notifications

4. [ ] Google Auth Signin

5. [ ] Acoustic development

***

# Dev Comments

If there is anything that needs to be added to the todo list, please add or check off as they are completed.
