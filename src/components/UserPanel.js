import React,{useState,useEffect} from 'react';
import {Grid,Header,Icon,Dropdown,Image,Modal,Input,Button} from "semantic-ui-react";
import {useStateValue} from './StateProvider';
import firebase,{db} from '../firebase'
import AvatarEditor from "react-avatar-editor";

function UserPanel({colorBackground}) {
	const [{user,currentChannel},dispatch]= useStateValue();
  const [modal, setModal] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [croppedImage, setCroppedImage] = useState("")
  const [blob, setBlob] = useState(null)
  const [uploadedCroppedImage, setUploadedCroppedImage] = useState("")
  const connectedRef=firebase.database().ref(".info/connected")
  const presenceRef=firebase.database().ref("presence")
  const typingRef=firebase.database().ref("typings")
  let avatarEditor=null;
  const metadata={
    contentType:"image/jpeg"
  }
  
  const openModal=()=>setModal(true);
  const closeModal=()=>{
    setModal(false);
    setUploadedCroppedImage("");
    setCroppedImage("")
    setPreviewImage("")
  }

	const dropDownOption=()=>[
       {
       	key:"user",
       	text:<span>Signed in as <strong>{user?user.displayName:""}</strong> </span>,
       	disabled: true 
       },
       {
       	key:"avatar",
       	text:<span onClick={openModal}>Cnange Avatar</span>
       },
       {
        key:"signout",
        text:<span onClick={handleSignOut}>Sign Out</span>
       }
	]

  const uploadCroppedImage = () => {
    firebase.storage().ref()
      .child(`avatars/user/${user.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          setUploadedCroppedImage(downloadURL)
        });
      });
  };
  useEffect(() => {
    uploadedCroppedImage&&changeAvatar()
  },[uploadedCroppedImage])

  const changeAvatar = () => {
    user&&firebase.auth().currentUser
      .updateProfile({
        photoURL: uploadedCroppedImage
      })
      .then(() => {
        closeModal();
      })
      .catch(err => {
        console.error(err);
      });

    user&&db.collection("users").doc(user.uid)
      .update({ photoURL:uploadedCroppedImage })
      .then(() => {
        
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result);
      });
    }
  };

  const handleCropImage = () => {
    if (avatarEditor) {
      avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        setCroppedImage(imageUrl)
        setBlob(blob)
      });
    }
  };

    
    const handleSignOut=()=>{
         firebase
                 .auth()
                 .signOut()
                 .then(()=>{
                        presenceRef.child(user.uid).remove();
                        db.collection("channels").onSnapshot(snapshot=>{
                          snapshot.docs.map(doc=>{
                             typingRef
                                   .child(doc.id)
                                   .child(user.uid)
                                   .remove()
                          })
                        })
                 })
    }

	return (
		<Grid style={colorBackground?{background:colorBackground.secondary}:{background:"#4c3c4c"}}>
		  <Grid.Column>
             <Grid.Row style={{padding:"1.2rem", margin:0}}>
                <Header inverted as="h2" floated="left">
	              <Icon name="code"/>
	              <Header.Content>FunChat</Header.Content>
	            </Header>
             
             <Header as="h4" inverted style={{padding:"0.25rem"}}>
                <Dropdown
                  trigger={
                  	<span>
                  	   <Image src={user?user.photoURL:""} spaced="right" avatar />
                  	  {user?user.displayName:"User"}
                  	</span>
                  }
                  options={
                  	dropDownOption()
                  }
                />
             </Header>
             </Grid.Row>
             
             <Modal basic open={modal} onClose={closeModal} >
                  <Modal.Header>Change Your Avatar</Modal.Header>
                  <Modal.Content>
                     <Input 
                       onChange={handleChange}
                       fluid
                       label="New Avatar"
                       name='previewImage'
                       type="file"
                       
                     />
                     <Grid centered stackable >
                        <Grid.Row centered>
                           <Grid.Column className="ui center aligned grid">
                              {previewImage && (
                                <AvatarEditor
                                  ref={node => (avatarEditor=node)}
                                  image={previewImage}
                                  style={{marginLeft:"-800%"}}
                                  width={120}
                                  height={120}
                                  border={50}
                                  scale={1.2}
                                />
                              )}
                           </Grid.Column >
                           <Grid.Column>
                              {/*croppedImage && (
                                <img
                                  style={{ margin: "3.5em",width:"20em" }}
                                  //width={100}
                                  height={120}
                                  src={croppedImage}
                                />
                              )*/}
                           </Grid.Column>
                           {croppedImage && (
                                <img
                                  style={{ margin: "3.5em"}}
                                  width={100}
                                  height={120}
                                  src={croppedImage}
                                />
                              )}
                        </Grid.Row>
                     </Grid>
                  </Modal.Content>
                  <Modal.Actions>
                     {croppedImage&&<Button color="green" onClick={uploadCroppedImage} inverted>
                       <Icon name="save" />Change Avatar
                     </Button>}
                     <Button color="green" onClick={handleCropImage} inverted>
                       <Icon name="image" />Preview
                     </Button>
                     <Button onClick={closeModal} color="red" inverted>
                       <Icon name="remove" />Cancel
                     </Button>
                  </Modal.Actions>
            </Modal>

		  </Grid.Column>
           
		</Grid>
	)
}

export default UserPanel