import React, { useState, useEffect } from 'react'
import './App.css'
import Videos from './Components/Videos'
import { Route } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

function App() {

  let video_ids = [];
  const history = useHistory();
  let redirect = "";
  const [videos, setVideos] = useState([]);

  function onClick() {
    let redirected = false;

    video_ids = [];

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      console.log(xhr.responseText + "hello");
      if (xhr.responseText.length > 20) {
        redirect = xhr.responseText;
      }
      if (xhr.responseText !== "works" && xhr.responseText.length < 20) {
        video_ids.push(xhr.responseText);
        console.log(video_ids);
        video_ids.forEach(video => setVideos(() => [video]));
      }

      if (redirect !== "" && !redirected) {
        history.push("/google");
      }
    });
    xhr.open("POST", "https://breedify.herokuapp.com");
    xhr.send();
  }

  return (
    <div id="border">
      <h1 id="font">Breedify</h1>
      <p>Click search for video from a random dog breed</p>
      <p id="smalltext">(Press search again after authentication. Youtube API only allows 100 searches a day. If you don't see a video, the Youtube API very likely has ran out of free credits.)</p>
      <button id="search" onClick={onClick}>Search</button>
      <h1> </h1>
      <Videos videos={videos} />
       <Route path='/google' component={() => {
        window.location.href = `${redirect}`;
        return null;
      }} >
      </Route>
    </div>
  )
}

export default App;
