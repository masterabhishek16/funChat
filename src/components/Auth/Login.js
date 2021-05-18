import React,{useState,useEffect} from "react";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase,{db} from '../../firebase';
import {useStateValue} from '../StateProvider';
import {actionType} from '../Reducer';

function Login(props){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [{user},dispatch]= useStateValue();


  const isInformatonValid=()=>{
  	 let errors1=[];
     let error;
      if(!email.length){
         error={message:"Please fill the Email field"}
    	setErrors(errors1.concat(error))
      	setLoading(false)
    	return false;
      }
      else if(!password.length){
      	error={message:"Please fill the Password field"}
      	setErrors(errors1.concat(error))
      	setLoading(false)
    	return false;
      }
      else return true;
  }
  
  const handleSubmit = e => {
    e.preventDefault();
    if(isInformatonValid()){
    	setLoading(false)
    	setErrors([])
	  	firebase
	  	       .auth()
	  	       .signInWithEmailAndPassword(email,password)
	  	       .then(signInUser=>{
	  	       	 setLoading(false)
                
	  	       })
	  	       .catch(err=>{
	  	       	 console.log(err)
	  	       	 setLoading(false)
	  	       	 setErrors(errors.concat(err))
	  	       })
    }
    
  }

  const displayError= errors=>errors.map((error,i)=><p key={i}>{error.message}</p>)

  const handleInputError=(errors,input)=>{
    return errors.some(error=>error.message.toLowerCase().includes(input.toLowerCase()))?
    "error":""
  }
  

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="vilet" />
            Login to FunChat
          </Header>
          <Form onSubmit={handleSubmit} size="large">
            <Segment stacked>

              <Form.Input
                fluid
                name="email"
                value={email}
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={(e)=>setEmail(e.target.value)}
                type="email"
                className={()=>handleInputError(errors,"email")}
              />

              <Form.Input
                fluid
                name="password"
                value={password}
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={(e)=>setPassword(e.target.value)}
                type="password"
                className={()=>handleInputError(errors,"password")}
              />

              <Button disable={loading} className={loading?"loading":""} color="violet" fluid size="large">
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length>0&&(
             <Message error>
               <h3>Error</h3>
               {displayError(errors)}
             </Message>
          )}
          <Message>
            Don't have a account? <Link to="/Register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
}

export default Login;
