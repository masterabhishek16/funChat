import React,{useState} from 'react'
import { Segment, Accordion, Header, Icon, Image,List } from "semantic-ui-react";
import {useStateValue} from './StateProvider'

function MetaPanel({userInfo}) {
    const [activeIndex,setActiveIndex] = useState("")
    const [{user,currentChannel,isChannelPrivate},dispatch] = useStateValue()

    const getActiveIndex=(event, titleProps)=>{
        const { index } = titleProps;
	    const newIndex = activeIndex === index ? -1 : index;
	    setActiveIndex(newIndex);
    }

    const check=(num)=>{
        if(num>1) return `${num} posts`;
        else return `${num} post`;
    }

    const displayUserInfo=()=>(
    	Object.entries(userInfo)
    	      .sort((a,b)=>b[1].count-a[1].count)
    	      .map(([key,val],i)=>{
    	      	 return(
                  <List.Item key={i}>
                     <Image avatar src={val.avatar} />
                     <List.Content>
                        <List.Header as="a">{key}</List.Header>
                        <List.Description>{check(val.count)}</List.Description>
                     </List.Content> 
                  </List.Item>
                  )
    	      })
    	      .slice(0,5)
    )
    //console.log(Object.entries(userInfo));

    if(isChannelPrivate) return null;

	return (
		<Segment loading={!currentChannel}>
        <Header as="h3" attached="top">
          About # {currentChannel&&currentChannel.data.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={getActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {currentChannel&&currentChannel.data.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={getActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>
               {userInfo&&displayUserInfo()}
            </List>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={getActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
             <Header as='h3'>
                <Image circular src={currentChannel&&currentChannel.data.createdBy.avatar} />
                {currentChannel&&currentChannel.data.createdBy.name}
             </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
	)
}

export default MetaPanel