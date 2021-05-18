import React,{useState,useEffect,Component} from 'react'
import {Segment,Input,Button} from "semantic-ui-react";
import firebase,{db} from '../firebase'
import {useStateValue} from './StateProvider'
import FileModal from './fileModal'
import uuidv4 from 'uuid/dist/v4'
import ProgressBar from './ProgressBar'
import {actionType} from './Reducer'
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

var count=0;
function MessagesForm() {
	const [{user,currentChannel,isChannelPrivate,isMessageCountChange},dispatch] = useStateValue();
	const [input, setInput] = useState("")
	const [modal, setModal] = useState(false)
	const [uploadState, setUploadState] = useState('')
	const [uploadTask, setUploadTask] = useState(null)
	const [percentageUploaded, setPercentageUploaded] = useState(0)
	const [barPercent, setBarPercent] = useState(0)
  const typingRef=firebase.database().ref("typings")
  const [emojiPicker, setEmojiPicker] = useState(false)

    const openModal=()=>setModal(true)
    const closeModal=()=>setModal(false)
    
    const getPath=()=>{
    	return isChannelPrivate ? `chat/private/${currentChannel.id}`
    	              :`chat/public`
    }

    const handleTogglePicker = () => {
      setEmojiPicker(pre=>!pre);
    };

    const handleAddEmoji = emoji => {
      const oldMessage = input;
      const newMessage = colonToUnicode(` ${oldMessage} ${emoji.colons} `);
      setInput(newMessage);
    };

  const colonToUnicode = message => {
      return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
        x = x.replace(/:/g, "");
        let emoji = emojiIndex.emojis[x];
        if (typeof emoji !== "undefined") {
          let unicode = emoji.native;
          if (typeof unicode !== "undefined") {
            return unicode;
          }
        }
        x = ":" + x + ":";
        return x;
      });
    };

    const upload=(file,metadata)=>{
        const pathToUpload=currentChannel.id;
        const filePath=`${getPath()}/${uuidv4()}.jpg`
        setUploadState("Uploading")
        setUploadTask(firebase.storage().ref().child(filePath).put(file,metadata))
        count=0;
        setPercentageUploaded(0);
        setBarPercent(0);
    }

    const handleKeyDown=()=>{
      if (input.length) {
        typingRef
          .child(currentChannel.id)
          .child(user.uid)
          .set(user.displayName);
      } else {
        typingRef
          .child(currentChannel.id)
          .child(user.uid)
          .remove();
      }
    }

    const handleKeyDown2=(event)=>{
      if(event.keyCode===13) addInput();
    }

    const createMassage=(fileURL=null)=>{
    	const newMessage={
		  	time:firebase.firestore.FieldValue.serverTimestamp(),
		  	sendBy:{
		  		id:user.uid,
		  		name:user.displayName,
		  		avatar:user.photoURL
		  	}
		  };
        if(fileURL!==null){
        	count=1
        	newMessage["image"]=fileURL;
        }
        else{
        	newMessage["content"]=input;
        }
        dispatch({
               type:actionType.SET_MESSAGECHANNEL,
               isMessageCountChange:true
            })
        
        return newMessage;
    }

    const addImage=()=>{
    	const whichChannel=isChannelPrivate?"privateChannels":"channels";
    	uploadTask&&uploadTask.snapshot.ref
    	      .getDownloadURL()
	          .then(downloadURL=>{

	             count===0&&db.collection(whichChannel).doc(currentChannel.id)
	                .collection("messages").add(createMassage(downloadURL))
	                .then(()=>{setUploadState("");})
	                .catch((err)=>{console.log(err);});
	          })
	          .catch(err=>{console.log(err); setUploadState("error"); setUploadTask(null)});
              setPercentageUploaded(0)
              setUploadTask(null)
              
    }

    const howMuchUploaded=()=>{
         uploadTask&&uploadTask.on("state_changed",snap=>{
    		const percentageUploaded1=Math.round((snap.bytesTransferred/snap.totalBytes)*100)
    		setPercentageUploaded(percentageUploaded1)
    		setBarPercent(percentageUploaded1)
    	})
    }

    useEffect(() => {
    	howMuchUploaded()
    	
    }, [uploadTask])

   useEffect(() => {
     user&&currentChannel&&handleKeyDown()
   }, [input])

	const addInput=()=>{
		const whichChannel=isChannelPrivate?"privateChannels":"channels";
		if(input.length>0){
		db.collection(whichChannel).doc(currentChannel.id)
		  .collection("messages").add(createMassage()).then(()=>{
        typingRef
          .child(currentChannel.id)
          .child(user.uid)
          .remove();
		  	dispatch({
               type:actionType.SET_MESSAGECHANNEL,
               isMessageCountChange:true
            })
		  })
		  .catch(err=>console.log(err))
		}


		  setInput("");
	}
	
	
	return (
		<Segment className="message_form">
       {emojiPicker && (
          <Picker
            set="apple"
            onSelect={handleAddEmoji}
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
			<Input 
			  value={input}
              fluid
              name="message"
              style={{marginBottom:"0.7rem"}}
              placeholder="Write your Message"
              label={
                <Button
                  icon={emojiPicker ? "close" : "add"}
                  content={emojiPicker ? "Close" : null}
                  onClick={handleTogglePicker} 
                />}
              labelPosition="left"
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={handleKeyDown2}
			/>

			<Button.Group icon widths="2">
               <Button 
                 color="orange"
                 icon="edit"
                 content="Add Reply"
                 labelPosition="left"
                 onClick={addInput}
               />

               <Button 
                 color="teal"
                 icon="cloud upload"
                 content="Upload Media"
                 labelPosition="right"
                 onClick={openModal}
               />
               </Button.Group>
               <FileModal 
                  upload={upload}
                  modal={modal}
                  closeModal={closeModal}
               />
               <ProgressBar 
                  barPercent={barPercent}
                  uploadState={uploadState}
               />
			{percentageUploaded===100&&count===0?addImage():''}
		</Segment>
	)
}


export default MessagesForm