import React,{useState,useEffect,Component} from 'react'
import {Menu,Icon,Modal,Form,Input,Button,Label} from 'semantic-ui-react'
import firebase,{db} from '../firebase'
import {useStateValue} from './StateProvider'
import {actionType} from './Reducer'

function StarChannels({whichChannel,changeChannel}) {
    const [activeChannel, setActiveChannel] = useState("")
    const [starChannels, setStarChannels] = useState([])
    const [{user,currentChannel,isChannelPrivate},dispatch]=useStateValue()

    const activeChannelFun=(channel)=>{
        setActiveChannel(channel)
    }

    const setChannel=(channel)=>{
   	  dispatch({
     	type:actionType.SET_CHANNEL,
        currentChannel:channel
     })
   	  activeChannelFun(channel.id)
   	  changeChannel("starChannel")
   }

    useEffect(() => {
    	user&&db.collection("users").doc(user.uid)
          .collection("starChannels").onSnapshot(snapshot=>{
          	 setStarChannels([]);
          	 setStarChannels(snapshot.docs.map(doc=>{
                 return({id:doc.id,data:doc.data()})
          	 }))
          })
          if(whichChannel==="channel") setActiveChannel("");
          isChannelPrivate&&setActiveChannel("");
    }, [currentChannel])

    const displayChannels=()=>(
    	
    	starChannels.length>0&&starChannels.map(channel=>{
    		   return(
                <Menu.Item key={channel.id} name={channel.data.name} style={{opacity:0.7}}
                   onClick={()=>setChannel(channel)}
                   active={channel.id===activeChannel}
                >
                   #{channel.data.name}
                
                </Menu.Item>
                )
           	})
    )
    
	return (
		<Menu.Menu style={{paddingBottom:"2rem"}}>
           <Menu.Item>
             <span>
               <Icon name="star" />StarChannels
             </span>{" "}
             ({starChannels.length})      
             
           </Menu.Item>
           <div className={starChannels.length>3?"star_channel":""}>
           {displayChannels()}
           </div>
		</Menu.Menu>
	)
}

export default StarChannels