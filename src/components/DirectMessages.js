import React,{useState,useEffect} from 'react'
import {Menu,Icon,Image} from 'semantic-ui-react'
import {useStateValue} from './StateProvider'
import firebase,{db} from '../firebase'
import {actionType} from './Reducer'


function DirectMessages() {
    const [users, setUsers] = useState([])
    const [{user,currentChannel,isChannelPrivate},dispatch] = useStateValue()
    const [activeChannel, setActiveChannel] = useState("")
    const connectedRef=firebase.database().ref(".info/connected")
    const presenceRef=firebase.database().ref("presence")

    const activeChannelFun=(channel)=>{
        setActiveChannel(channel)
    }

    const setChannel=(userData)=>{
      const channelId=user.uid<userData.id?`${user.uid}/${userData.id}/user`
                        :`${userData.id}/${user.uid}/user`;
      dispatch({
      type:actionType.SET_PRIVATECHANNEL,
        currentChannel:{
          id:channelId,
          data:{
            name:userData.name,
            avatar:userData.photoURL
          }
        }
     })
      activeChannelFun(userData.id)
   }

   const getChannel=(userData)=>{
       const channelId=user.uid<userData.id?`${user.uid}/${userData.id}/user`
                        :`${userData.id}/${user.uid}/user`;
       db.collection("privateChannels").doc(channelId)
         .set({
            name:userData.name,
            avatar:userData.photoURL
         }).then(()=>{
            return ""
         }).catch(err=>console.log(err))
         setChannel(userData)
   }

  const addListners=()=>{
    user&&db.collection("users").onSnapshot(sanpshot=>{
        let currentUser=[];
        sanpshot.docs.map(doc=>{
          if(doc.data().id!==user.uid){
            let newUser=doc.data();
            newUser["status"]="offline";
            currentUser.push(newUser);
          }
        })
        setUsers(currentUser);
      })
    user&&connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = presenceRef.child(user.uid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    })
  }

  const addPresence=()=>{

    user&&presenceRef.on("child_added", snap => {
      if (user.uid !== snap.key) {
        addStatusToUser(snap.key);
      }
    });

    user&&presenceRef.on("child_removed", snap => {
      if (user.uid !== snap.key) {
        addStatusToUser(snap.key, false);
      }
    });
  }

  const addStatusToUser = (userId, connected = true) => {
    const updatedUsers = users.reduce((acc, userData) => {
      if (userData.id === userId) {
        userData["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(userData);
    }, []);
    setUsers(updatedUsers);
  };

    useEffect(() => {
      addListners();

    }, [user])
    useEffect(() => {
      users.length>0&&addPresence()
    }, [users.length])

    useEffect(() => {
      !isChannelPrivate&&setActiveChannel("")
      users.length>0&&addPresence()
    }, [currentChannel])

	return (
		<div>
		<Menu.Menu style={{paddingBottom:"2rem"}}>
           <Menu.Item>
             <span>
               <Icon name="mail" />Direct Messages
             </span>{" "}
             ({users.length})      
             
           </Menu.Item>
           <div className={users.length>3?"user_channel":""} >
           {users.length>0&&users.map(userData=>(
              <Menu.Item
                key={userData.id}
                onClick={()=>getChannel(userData)}
                style={{opacity:0.7,fontStyle:"italic"}}
                active={userData.id===activeChannel}

              >
              <Image src={userData.photoURL} avatar />
              {userData.name}
              <Icon name="circle" color={userData.status==="online"?"green":"red"} />
              </Menu.Item>
            ))}
           </div>
      
		</Menu.Menu>

		
      </div>
	)
}

export default DirectMessages