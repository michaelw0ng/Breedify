import React from 'react'
import Video from './Video'

export default function Videos({videos}){
   // Renders a video component 
   return (
      videos.map(video => {
         return <Video key={video} video={video} />;
      })
   )
}