import React from 'react'

export default function Video({video}) {
   return (
      <div>
         <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video}`} title="YouTube video player" frameBorder="0" allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
      </div>
   )
}