import "./App.css";
import "video.js/dist/video-js.css";
import React from 'react';
import logo from './logo.svg';
import videojs from "video.js";
import './App.css';
import get from "lodash/get"
import JSONPretty from 'react-json-pretty';
import JSONPrettyMon from 'react-json-pretty/dist/monikai';

const defaultSource = "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";

export default class VideoPlayer extends React.Component {

  state = {
    streamStats: {},
    source: defaultSource
  }

  componentDidMount() {
    this.startPlayer();
  }

  startPlayer() {
    this.disposePlayer();

    const videoJSOptions = {
      controls: true,
      autoplay: true,
      sources: [{
            src: this.state.source,
            type: 'application/x-mpegURL'
        }]
    }

    // instantiate Video.js
    this.player = videojs(this.videoNode, videoJSOptions, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
    this.interval = setInterval(() => {
      const streamStats = get(this.player, "dash.stats")
      const formattedStreamStats = {}
      Object.keys(streamStats).map(key => {
        if (typeof streamStats[key] !== "object") {
          formattedStreamStats[key] = streamStats[key];
        } else {
          console.log(`Additional ${key} Stats: `, streamStats[key])
        }
      })
      this.setState({
        streamStats: formattedStreamStats
      })
    }, 2000)
  }

  // destroy player on unmount
  componentWillUnmount() {
    this.disposePlayer();
  }

  disposePlayer = () => {
    if (this.player) {
      this.player.dispose()
    }
    if (this.interval) {
      this.interval();
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div> 
        <div data-vjs-player>
          <video autoPlay ref={ node => this.videoNode = node } className="video-js"></video>
        </div>
        <JSONPretty id="json-pretty" data={this.state.streamStats} theme={JSONPrettyMon}></JSONPretty>

      </div>
    )
  }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
