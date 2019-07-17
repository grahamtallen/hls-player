import "./App.css";
import "video.js/dist/video-js.css";
import React from 'react';
import logo from './logo.svg';
import videojs from "video.js";
import './App.css';
import get from "lodash/get"
import JSONPretty from 'react-json-pretty';


export default class VideoPlayer extends React.Component {

  state = {
    streamStats: {}
  }

  componentDidMount() {
    const videoJSOptions = {
      controls: true,
      autoplay: true,
      sources: [{
            src: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
            type: 'application/x-mpegURL'
        }]
    }

    // instantiate Video.js
    this.player = videojs(this.videoNode, videoJSOptions, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
    setInterval(() => {
      console.log(get(this.player, "dash.stats"))
      this.setState({
        streamStats: get(this.player, "dash.stats")
      })
    }, 1000)
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div> 
        <div data-vjs-player>
          <video ref={ node => this.videoNode = node } className="video-js"></video>
        </div>
        <JSONPretty id="json-pretty" data={this.state.streamStats}></JSONPretty>

      </div>
    )
  }
}
