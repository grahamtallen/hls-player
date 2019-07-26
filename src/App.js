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
const defaultSource = "http://178.79.160.41:8080/hls/good-music.m3u8"

class VideoStats extends React.Component {

  state = {
    streamStats: {volume: 1},
    source: defaultSource,
    url: defaultSource,
    loading: false
  }

  setupPlayer() {
    const {videoNode} = this.props;
    if (!videoNode) return;
    const videoJSOptions = {
      controls: false,
      autoplay: true,
      withCredentials: false,
      sources: [{
            src: this.state.source,
            type: 'application/x-mpegURL'
        }]
    }
    // instantiate Video.js
    this.player = videojs(videoNode, videoJSOptions, this.onPlayerReady);
    this.player.isAudio(true);
    // TODO look up the preload attribute
    this.player.playsinline(true);
  }

  loadSource(sourceUrl) {
    this.player.src({
            src: this.sourceUrl,
            type: 'application/x-mpegURL'
        })
  }

  startPlayer() {
    this.disposePlayer();
    this.setupPlayer();

    const {source} = this.state
    this.loadSource(source)

    this.interval = setInterval(() => { 
      const streamStats = get(this.player, "dash.stats")

      if (!streamStats) return
      const formattedStreamStats = {}
      
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

  onPlayerReady() {
    this.setState({playerReady: true})
    console.log("Player ready")
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
    this.setState({
      source: this.state.url
    }, () => this.startPlayer())
  }

  render() {
    const { streamStats, playerReady, loading } = this.state;
    let data = <JSONPretty id="json-pretty" data={streamStats} theme={JSONPrettyMon}></JSONPretty>
    if (loading || !this.props.videoNode) {
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
          <div>
            <pre>Player {playerReady ? "Initializing" : "Ready"}</pre>
          </div>
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
          <audio autoPlay ref={this.setRef} className="video-js"></audio>
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
