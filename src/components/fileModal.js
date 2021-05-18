import React,{useState} from 'react'
import {Modal,Button,Icon,Input} from 'semantic-ui-react'
import mime from 'mime-types'

function FileModal({modal,closeModal,upload}) {
	const [file, setFile] = useState(null)
	const [authorize, setAuthorize] = useState(["image/jpeg","image/png"])
    
    const addFile=(e)=>{
    	const newFile=e.target.files[0];
    	if(newFile){
    		setFile(newFile)
    		console.log("ok");
    	}
    }

    const sendFile=()=>{
    	if(file){
	       if(isAuthorize()){
	           const metadata={contentType:mime.lookup(file.name)}
	           upload(file,metadata)
	           closeModal()
	        }
        }
        setFile(null)
    }

    const isAuthorize=()=>authorize.includes(mime.lookup(file.name))

	return (
		<Modal basic open={modal} onclose={closeModal} >
          <Modal.Header>Select the File</Modal.Header>
          <Modal.Content>
             <Input 
               fluid
               label="File types: jpg, png"
               name='file'
               type="file"
               onChange={addFile}
             />
          </Modal.Content>
          <Modal.Actions>
             <Button onClick={sendFile} color="green" inverted>
               <Icon name="checkmark" />Send
             </Button>
             <Button onClick={closeModal} color="red" inverted>
               <Icon name="remove" />Cancel
             </Button>
          </Modal.Actions>
		</Modal>
	)
}

export default FileModal