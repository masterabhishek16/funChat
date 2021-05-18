import React,{useState,useEffect} from 'react'
import {Sidebar,Menu,Divider,Button,Modal,Icon,Label} from "semantic-ui-react";
import { SliderPicker } from "react-color";
import {useStateValue} from './StateProvider'
import firebase,{db} from '../firebase'

function ColorPanel({setColorBackground}) {
     const [modal, setModal] = useState(false);
     const [primary, setPrimary] = useState("");
     const [secondary, setSecondary] = useState("")
     const [{user,currentChannel,isChannelPrivate},dispatch] = useStateValue()
     const [colors, setColors] = useState([])

     const changePrimaryColor=(color)=>{
         setPrimary(color.hex);
     }
     const changeSecondaryColor=(color)=>{
         setSecondary(color.hex);
     }

     const setColor=(color)=>setColorBackground(color.data)

     const saveColor=()=>{
          if(primary&&secondary){
               user&&db.collection("users").doc(user.uid)
                       .collection("colors").add({
                          primary:primary,
                          secondary:secondary
                       }).then(()=>{console.log("Success");addColors()})
                       .catch(err=>console.log(err))
            closeModal();
            setPrimary("")
            setSecondary("")
          }
     }

     const displayColors=()=>(
          colors.length>0&&colors.map(color=>(
               <React.Fragment key={color.id}>
               <Divider />
               <div onClick={()=>setColor(color)} className="color_container">
                  <div className="color_square" style={{backgroundColor:color.data.secondary}} >
                     <div className="color_squid" style={{backgroundColor:color.data.primary}}></div>
                  </div>
               </div>
               </React.Fragment>
          ))
     )

     const addColors=()=>{
           db.collection("users").doc(user.uid)
             .collection("colors").onSnapshot(snapshot=>{
               setColors([]);
               setColors(snapshot.docs.map(doc=>{
                    return ({id:doc.id,data:doc.data()})
               }))
             })
     }

     useEffect(() => {
          user&&addColors();
     }, [currentChannel])
     
     const openModal=()=>setModal(true);
     const closeModal=()=>setModal(false);

	return (
		<Sidebar
          as={Menu}
          vertical
          visible
          width="very thin"
          inverted
          icon="labled"
		>
          <Divider />
          <Button icon="add" onClick={openModal} size="small" color="blue" />
          {displayColors()}
          <Modal basic open={modal} onClose={closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Label content="Primary Color" />
            <SliderPicker color={primary} onChange={changePrimaryColor} />
            <Label content="Secondary Color" />
            <SliderPicker color={secondary} onChange={changeSecondaryColor} />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={saveColor} color="green" inverted>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
		</Sidebar>
	)
}

export default ColorPanel