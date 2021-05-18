import React,{useState} from 'react'
import {Menu} from "semantic-ui-react";
import UserPanel from './UserPanel'
import Channels from './Channels'
import DirectMessages from './DirectMessages'
import StarChannels from './StarChannels'

function SidePanel({colorBackground}) {
      const [whichChannel, setWhichChannel] = useState("channel")
      const changeChannel=(name)=> setWhichChannel(name)
	return (
		<Menu
          inverted
          style={colorBackground?{background:colorBackground.secondary,fontSize:"1.2rem"}
                  :{background:"#4c3c4c",fontSize:"1.2rem"}}
          size="large"
          vertical
          fixed="left"
		>
         <UserPanel key="UserPanel" colorBackground={colorBackground}  />
         <StarChannels key="StarChannels" whichChannel={whichChannel} changeChannel={changeChannel} />
         <Channels key="Channels" whichChannel={whichChannel} changeChannel={changeChannel} />
         <DirectMessages key="DirectMessages" />
		</Menu>
	)
}

export default SidePanel