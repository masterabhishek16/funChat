import React,{useState,useEffect} from 'react'
import {Segment,Header,Input,Icon,Image} from "semantic-ui-react";
import {useStateValue} from './StateProvider'
import firebase,{db} from '../firebase'

function MessagesHeader({messages,getSearch}) {
	const [{user,currentChannel,isChannelPrivate},dispatch] = useStateValue();
	const [search, setSearch] = useState("")
	const [star, setStar] = useState(false)

	const countUniqueUsers=messageArray=>{
    	const usersArray=messageArray.reduce((acc,message)=>{
    		if(!acc.includes(message.sendBy.id)){
    			acc.push(message.sendBy.id);
    		}
    		return acc;
    	},[])
    	if(isChannelPrivate)  return "";
        else if(usersArray.length>1){
    	  return(`${usersArray.length} Users`);}
	    else {
	        return(`${usersArray.length} User`);
	    }
    }

    const changeIcon=()=>{
    	if(star===false){
    		db.collection("users").doc(user.uid)
    		  .collection("starChannels").doc(currentChannel.id)
    		  .set({
    		  	name:currentChannel.data.name,
        		details:currentChannel.data.details,
        		createdBy:{
        			name:currentChannel.data.createdBy.name,
        			avatar:currentChannel.data.createdBy.avatar
        		}
    		  }).then(()=>setStar(true))
    		    .catch((err)=>console.log(err))
    	}
    	else{
    		db.collection("users").doc(user.uid)
    		  .collection("starChannels").doc(currentChannel.id).delete()
    		  .then(()=>setStar(false))
    		  .catch((err)=>console.log(err))
    	}
    }

    useEffect(() => {
    	user&&db.collection("users").doc(user.uid)
          .collection("starChannels").doc(currentChannel.id).onSnapshot(snapshot=>{
          	 if(snapshot.data()!==undefined) setStar(true);
          	 else setStar(false);
          })
    }, [currentChannel])

    const handleSumbit=(e)=>{
    	e.preventDefault();
    	setSearch(e.target.value);
        getSearch(e.target.value)
    }
	return (
		<Segment clearing>
          <Header fluid="true" as="h2" floated="left" style={{marginBottom:0}}>
             <span>
                {isChannelPrivate?<Image src={currentChannel.data.avatar} avatar />:""}
                {currentChannel?currentChannel.data.name:"Channel"}
               {isChannelPrivate ? "" : 
                 <Icon onClick={changeIcon} 
                  name={star?"star":"star outline"} 
                  color={star?"yellow":"black"} />
               }
             </span>
             <Header.Subheader>{countUniqueUsers(messages)}</Header.Subheader>
          </Header>

          <Header floated="right">
             <Input 
               size="mini"
               icon="search"
               name="searchItem"
               placeholder="Search Messages"
               value={search}
               onChange={handleSumbit}
             />
          </Header>
		</Segment>
	)
}

export default MessagesHeader