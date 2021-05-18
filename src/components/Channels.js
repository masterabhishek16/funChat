import React,{useState,useEffect} from 'react'
import {Menu,Icon,Modal,Form,Input,Button,Label} from 'semantic-ui-react'
import firebase,{db} from '../firebase'
import {useStateValue} from './StateProvider'
import {actionType} from './Reducer'

let c=0;
function Channels({whichChannel,changeChannel}) {
    const [channels, setChannels] = useState([])
    const [modal, setModal] = useState(false)
    const [channelName, setChannelName] = useState("")
    const [channelDetails, setChannelDetails] = useState("")
    const [{user,currentChannel,isChannelPrivate,isMessageCountChange},dispatch] = useStateValue()
    const [firstLoad, setFirstLoad] = useState(true)
    const [activeChannel, setActiveChannel] = useState("")
    const [notifications, setNotifications] = useState([])
    const [preChannel, setPreChannel] = useState('')
    const typingRef=firebase.database().ref("typings")

    
    const openModal=()=>setModal(true);
    const closeModal=()=>{setModal(false); setChannelName(""); setChannelDetails("");}
    const addChannel=()=>{
        if(channelName.length&&channelDetails.length){
        	db.collection("channels").add({
        		name:channelName,
        		details:channelDetails,
        		createdBy:{
        			name:user.displayName,
        			avatar:user.photoURL
        		}
        	}).then(()=>{
        		
                let newChannels=[];
    	        db.collection("channels").onSnapshot(snapshot=>{
    	        	setChannels([])
		            setChannels(snapshot.docs.map(doc=>{
		               return({id:doc.id,data:doc.data()})
               
                }))
        })

        	}).catch(err=>console.log(err))
        }
        closeModal()
    
    }

    const activeChannelFun=(channel)=>{
        setActiveChannel(channel)
    }

    const firstLoadChannel=()=>{
    	if(firstLoad&&channels.length>0){
    		dispatch({
     	     type:actionType.SET_CHANNEL,
             currentChannel:channels[0]
           })
    		activeChannelFun(channels[0].id)
    		
    		setPreChannel(channels[0])
    		db.collection("channels").onSnapshot(snapshot=>{
            snapshot.docs.map(doc=>{
               addNotification(doc.id);
               
            })
           })
    	}
    	
    	if(channels.length>0)
    	  setFirstLoad(false);
    }


   const setChannel=(channel)=>{
   	  clearNotification(channel);
   	  clearNotification(currentChannel);
   	  setPreChannel(currentChannel);
   	  dispatch({
     	type:actionType.SET_CHANNEL,
        currentChannel:channel
     })
   	  activeChannelFun(channel.id)
   	  changeChannel("channel")
   }

   const clearNotification=(channel)=>{
   	  channel&&typingRef
   	         .child(channel.id)
   	         .child(user.uid)
   	         .remove()
   	  let index=notifications.findIndex(notification=>notification.id===channel.id);
   	  if(index!==-1){
   	  	const newNotifications=[...notifications];
        newNotifications[index].count=0;
        newNotifications[index].total=newNotifications[index].lastTotal;
        setNotifications(newNotifications);
   	  }
   }

   const getNotification=(channel)=>{
        let index=notifications.findIndex(notification=>notification.id===channel.id);
        if(index!==-1){
        		if(notifications[index].count!==0&&channel.id!=currentChannel.id){
        		return (<Label color='red'>{notifications[index].count}</Label> )}
        		else return ''
        }
        else{
        	return "";
        }
   }

   var addNotification=(channelId)=>{
   	  	 currentChannel&&db.collection("channels").doc(channelId)
   	  	   .collection("messages").onSnapshot(snapshot=>{
	   	    	
	   	    	let lastNotification=0;
	   	    	//const newNotifications=[...notifications]
	   	    	let index=notifications.findIndex(notification=>notification.id===channelId);
	   	        if(index!==-1){
	   	        	lastNotification=notifications[index].total
	   	        	if(channelId!==currentChannel.id){
		   	        	if(snapshot.docs.length-lastNotification>0){
		   	        		notifications[index].count=snapshot.docs.length-lastNotification;
		   	        	}
	   	            }
	   	            notifications[index].lastTotal=snapshot.docs.length;

	   	        }
	   	        else{
	   	        	notifications.push({
	   	        		id:channelId,
	   	        		total:snapshot.docs.length,
	   	        		lastTotal:snapshot.docs.length,
	   	        		count:0
	   	        	})
	   	        }
	   	    })
   	  	   dispatch({
               type:actionType.SET_MESSAGECHANNEL,
               isMessageCountChange:false
            })
	   	  setNotifications(notifications);
   }

    useEffect(() => {
    	
    	const unsubscribe=db.collection("channels").onSnapshot(snapshot=>{
    		setChannels([])
            setChannels(snapshot.docs.map(doc=>{
               addNotification(doc.id)
               return ({id:doc.id,data:doc.data()})
            }))
        })
    	return()=>{
            db.collection("channels").onSnapshot(snapshot=>{
            snapshot.docs.map(doc=>{
               addNotification(doc.id);
               
            })
           })
    		unsubscribe()
    	}
    }, [])

    useEffect(() => {
    	if(whichChannel!=='channel') {
    		setActiveChannel(""); 
    		clearNotification(preChannel);
    		setPreChannel("")
    	}
    	else if(isChannelPrivate) {
    		setActiveChannel("")
    		clearNotification(preChannel);
    		setPreChannel("")
    	}
    	else{
    		setPreChannel(currentChannel);
    	}
    	
    }, [currentChannel])
    
    
    
    useEffect(() => {
       
       db.collection("channels").onSnapshot(snapshot=>{
            snapshot.docs.map(doc=>{
               addNotification(doc.id);
               
            })
           })
     
    },[isMessageCountChange])

    const displayChannels=()=>(
    	
    	channels.length>0&&channels.map(channel=>{
    		   return(
                <Menu.Item key={channel.id} name={channel.data.name} style={{opacity:0.7}}
                   onClick={()=>setChannel(channel)}
                   active={channel.id===activeChannel}
                >
                   #{channel.data.name}
                   {getNotification(channel)}
                
                </Menu.Item>
                )
           	})
    )

	return (
		<div>
		<Menu.Menu style={{paddingBottom:"2rem"}}>
           <Menu.Item>
             <span>
               <Icon name="exchange" />Channels
             </span>{" "}
             ({channels.length})      
             <Icon onClick={openModal} name="add" />
             
           </Menu.Item>
           <div className={channels.length>4?"channel_overflow":""}>
           {displayChannels()}
           </div>
           {firstLoad&&firstLoadChannel()}
		</Menu.Menu>

		<Modal basic open={modal} onClose={closeModal}>
		   <Modal.Header>Add a Channel</Modal.Header>
		   <Modal.Content>
		      <Form>
                 <Form.Field>
		           <Input fluid type="text" label="Name of the Channel" value={channelName}
		              onChange={(e)=>setChannelName(e.target.value)} />
				 </Form.Field>
				 <Form.Field>
		           <Input fluid type="text" label="Detail of the Channel" value={channelDetails}
		              onChange={(e)=>setChannelDetails(e.target.value)} />
				 </Form.Field>

		      </Form>
		   </Modal.Content>
           
           <Modal.Actions>
              <Button color="green" inverted onClick={addChannel}><Icon name="checkmark"/>Add</Button>
              <Button color="red" inverted onClick={closeModal}><Icon name="remove"/>Cancel</Button>
           </Modal.Actions>

		</Modal>

      </div>
	)
}


export default Channels