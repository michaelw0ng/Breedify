import { useHistory } from 'react-router-dom'

export default function GoogleRedirect() {

   function Redirect(){
      const history = useHistory();
      history.push("/google");
   }
   return (
      <>
       {this.Redirect()}
      </>
   )
}