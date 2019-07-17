import "./App.css";
import "video.js/dist/video-js.css";
import React from 'react';
import logo from './logo.svg';
import videojs from "video.js";
import './App.css';
import get from "lodash/get"
import JSONPretty from 'react-json-pretty';
import JSONPrettyMon from 'react-json-pretty/dist/monikai';
import 'react-rangeslider/lib/index.css'

import Slider from 'react-rangeslider'
import {NETWORK_STATES} from "./constants/networkStates.js"
const defaultSource = "https://video-dev.github.io/streams/pts_shift/master.m3u8";

class VideoStats extends React.Component {

  state = {
    streamStats: {volume: 1},
    source: defaultSource,
    url: defaultSource,
    loading: false
  }

  componentDidMount() {
    this.startPlayer();
  }

  startPlayer() {
    this.disposePlayer();
    const {videoNode} = this.props;
    if (!videoNode) return;

    const videoJSOptions = {
      controls: true,
      autoplay: true,
      withCredentials: false,
      sources: [{
            src: this.state.source,
            type: 'application/x-mpegURL'
        }]
    }

    // instantiate Video.js
    this.player = videojs(videoNode, videoJSOptions, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
    this.player.playsinline(true);

    this.interval = setInterval(() => {
      const streamStats = get(this.player, "dash.stats")
      const formattedStreamStats = {}
      if (!streamStats) return;
      
      Object.keys(streamStats).map(key => {
        if (typeof streamStats[key] !== "object") {
          formattedStreamStats[key] = streamStats[key];
        } else {
          // console.table(key, streamStats[key])
        }
      })
      
      formattedStreamStats["Nework State"] = NETWORK_STATES[this.player.networkState()];


      formattedStreamStats["Current Source"] = streamStats.currentSource;

      formattedStreamStats["Volume"] = this.player.volume(); // can get or set volume with this method


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
    this.setState({loading: true})
    if (this.player) {
      this.player.dispose()
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    setTimeout(() => {
      this.setState({loading: false})
    }, 500)
  }

  handleInputChange = ({target}) => this.setState({url: target.value})

  handleButtonClick = () => {
    console.log("url: ", this.url)
    this.setState({
      source: this.state.url
    }, () => this.startPlayer())
  }

  render() {
    let data = <JSONPretty id="json-pretty" data={this.state.streamStats} theme={JSONPrettyMon}></JSONPretty>
    if (this.state.loading || !this.props.videoNode) {
      data = <div className="loading-container">
        <pre>Loading</pre>
      </div>
    }

    return (
      <div> 
          <label >
            Url: 
            <input value={this.state.url} onChange={this.handleInputChange} />
          </label>
          <button onClick={this.handleButtonClick}> Stream </button>
          {data}
      </div>
    )
  }
}


const SliderCom = () => {
  return (
    <Slider
    />
  )
}

class App extends React.Component {
  state = {
    videoNode: null
  }

  setRef = (videoNode) => {
    if (!this.setVideoNode) {
      this.setVideoNode = true;
      this.setState({videoNode})
    }
  }
  render() {
    return <div>
        <div data-vjs-player>
          <video autoPlay ref={this.setRef} className="video-js"></video>
        </div>
      {this.state.videoNode && <VideoStats videoNode={this.state.videoNode} />}
    </div>
  }
}

export default App

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
