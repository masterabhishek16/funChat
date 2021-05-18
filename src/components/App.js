import React, { useState,useEffect } from "react";
import "./App.css";
import ColorPanel from './ColorPanel';
import SidePanel from './SidePanel';
import Messages from './Messages';
import MetaPanel from './MetaPanel';
import {Grid} from "semantic-ui-react";
import firebase from '../firebase'
import {useStateValue} from './StateProvider';
import {actionType} from './Reducer';

function App(props) {
     const [{user,currentChannel},dispatch]= useStateValue();
     const [userInfo, setUserInfo] = useState({})
     const [colorBackground, setColorBackground] = useState(null)

     const submitUserInfo=(userinfo)=>setUserInfo(userinfo)
     const submitColor=(color)=>setColorBackground(color)

    return (
    	<Grid columns="equal" className="app" 
    	      style={colorBackground?{background:colorBackground.primary}:{background:"#eee"}}>
           <ColorPanel key="ColorPanel" setColorBackground={setColorBackground} />
           <SidePanel key="SidePanel" colorBackground={colorBackground} />
           <Grid.Column key="1" style={{marginLeft:320}}>
             <Messages key="Messages" submitUserInfo={submitUserInfo} 
               currentChannel={currentChannel} user={user} />
           </Grid.Column>
           <Grid.Column key="2" width={4}>
             <MetaPanel key="MetaPanel" userInfo={userInfo} />
           </Grid.Column>
    	</Grid>
    )
}

export default App;
