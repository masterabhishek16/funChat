import React,{useEffect,useState,Component,useRef} from 'react'
import {Segment,Comment,Image,Modal,Button,Icon,Grid} from "semantic-ui-react";
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import firebase,{db} from '../firebase'
import {useStateValue} from './StateProvider'
import moment from 'moment'
import {actionType} from './Reducer'
import Typing from './Typing'
import Skeleton from './Skeleton'

function Messages({submitUserInfo}) {
	const [{user,currentChannel,isChannelPrivate,isMessageCountChange},dispatch] = useStateValue();
    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [image, setImage] = useState("")
    const [counter, setCounter] = useState(false)
    const mounted=useRef()
    let messagesEnd;
    const [typingUsers, setTypingUsers] = useState([])
    const typingRef=firebase.database().ref("typings")
    const connectedRef=firebase.database().ref(".info/connected")

    const isImage=(message)=>{
       return message.hasOwnProperty("image")&&!message.hasOwnProperty("content");  
    }
    const openModal=(newImage)=>{setModal(true); setImage(newImage);}
    const closeModal=()=>{setModal(false); setImage("");}

    const getSearch=(searchvalue)=>{
    	setSearch(searchvalue);
    }

    const dynamicSearch=()=>{
    	
    	return messages.filter(message=>
           message.sendBy.name.toLowerCase().includes(search.toLowerCase())
    	)
    }
    
    const displayMessages=()=>(
        messages.length>0&&dynamicSearch().map(message=>{
        	    
        	     const currentTime=moment(new Date(
                        message.time?.toDate()).toUTCString()).fromNow();
        	     return(
                 	<Comment key={message.time}>
                 		<Comment.Avatar src={message.sendBy.avatar} />
                 		<Comment.Content className={message.sendBy.id==user.uid?"message_self":""}>
                            <Comment.Author as="a">{message.sendBy.name}</Comment.Author>
                            <Comment.Metadata>{currentTime==="Invalid date"?"":currentTime}</Comment.Metadata>
                            
                            {isImage(message)?
                              <Image onClick={()=>openModal(message.image)} src={message.image} className="message_image" />
                              :<Comment.Text>{message.content}</Comment.Text>
                            }
                 		</Comment.Content>
                 		<Modal basic open={modal} onClose={closeModal}>
                 		   
                            <Modal.Content> <Image src={image} className="modal_image" /></Modal.Content>
                             <Modal.Actions>
                                 <Button onClick={closeModal} color="red" inverted>
					               <Icon name="remove" />Cancel
					             </Button>
                             </Modal.Actions>
                        </Modal>
                 	</Comment>
                 	)
                 })
             
    )

    const displayTypingUsers = users =>
	    users.length > 0 &&
	    users.map(userData => (
	      userData.channelId===currentChannel.id&&<div
	        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
	        key={userData.id}
	      >
	        <span className="user_typing">{userData.name} is typing</span> <Typing />
	      </div>
	    ));
    

    const addMessages=(channelId)=>{
        const whichChannel=isChannelPrivate?"privateChannels":"channels";
    	db.collection(whichChannel).doc(channelId)
    	  .collection("messages").orderBy("time","asc").onSnapshot(snapshot=>{
    	  	//let currentMessages=[]
    	  	 dispatch({
               type:actionType.SET_MESSAGECHANNEL,
               isMessageCountChange:true
           })
    	  })

    }

    const displayMessageSkeleton = loading =>
	    loading ? (
	      <React.Fragment>
	        {[...Array(10)].map((_, i) => (
	          <Skeleton key={i} />
	        ))}
	      </React.Fragment>
	    ) : null;

    const addTypingListeners = channelId => {
    	console.log(typingUsers);
	    let currentTypingUsers = [];
	    typingRef.child(channelId).on("child_added", snap => {
	      if (snap.key!==user.uid) {
	        currentTypingUsers=currentTypingUsers.concat({
	          id: snap.key,
	          channelId:channelId,
	          name: snap.val()
	        });
	        setTypingUsers([])
	        setTypingUsers(currentTypingUsers);
	      }
	    });

	    typingRef.child(channelId).on("child_removed", snap => {
	      const index = currentTypingUsers.findIndex(userData => userData.id === snap.key);
	      if (index !== -1) {
	        currentTypingUsers = currentTypingUsers.filter(userData => userData.id !== snap.key);
	        setTypingUsers(currentTypingUsers);
	      }
	    });

	    connectedRef.on("value", snap => {
	      if (snap.val() === true) {
	        typingRef
	          .child(channelId)
	          .child(user.uid)
	          .onDisconnect()
	          .remove(err => {
	            if (err !== null) {
	              console.error(err);
	            }
	          });
	      }
	    });

	  };

    const createMetaUser=(messagess)=>{
    	let usersArray=messagess.reduce((acc,message)=>{
    		if(message.sendBy.name in acc){
    			acc[message.sendBy.name].count+=1
    		}
    		else{
    			acc[message.sendBy.name]={
    				avatar:message.sendBy.avatar,
    				count:1
    			}
    		}
    		return acc;
    	},{});
    	submitUserInfo(usersArray);
    }
    
    useEffect(() => {
    	user&&currentChannel&&addTypingListeners(currentChannel.id)
    },[currentChannel])
   
    useEffect(() => {
    	currentChannel&&addMessages(currentChannel.id)
    	const whichChannel=isChannelPrivate?"privateChannels":"channels";
    	const unsubscribe=db.collection(whichChannel).doc(currentChannel?currentChannel.id:"ewewr")
    	  .collection("messages").orderBy("time","asc").onSnapshot(snapshot=>{
    	  	    dispatch({
	               type:actionType.SET_MESSAGECHANNEL,
	               isMessageCountChange:true
	           })
	    	  	setMessages(snapshot.docs.map(doc=>{ 
	    	  		 return(doc.data());
	    	  	  }
	    	  	))
	    	  	setMessagesLoading(false);
    	  })
    	  return()=>{
    	  	unsubscribe()
    	  }

    }, [currentChannel])

    useEffect(() => {
    	dispatch({
               type:actionType.SET_MESSAGECHANNEL,
               isMessageCountChange:true
           })
    	createMetaUser(messages);
    	messages.length>0&&setMessagesLoading(false); 
    	
    }, [messages])

    useEffect(() => {
    	if(!mounted.current){
    		mounted.current=true;
    	}
    	else{
           if(messagesEnd){
           	  messagesEnd.scrollIntoView({behavior:"smooth"})
           }
    	}
    })
	return (
		<React.Fragment>
           <MessagesHeader key={MessagesHeader} messages={messages} getSearch={getSearch} />
           <Segment>
              <Comment.Group className="messages">
                {displayMessageSkeleton(messagesLoading)}
                {displayMessages()}
                 {displayTypingUsers(typingUsers)}
                 <div ref={node=>(messagesEnd=node)}></div>
              </Comment.Group>
           </Segment>
           <MessagesForm key={MessagesForm} />
		</React.Fragment>
	)
}



export default Messages