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
import qs from "query-string";


const search = qs.parse(window.location.search);
const stream = search && search.stream;
let defaultSource = "http://127.0.0.1:8887/iPIELZ1wt/index.m3u8";

// if (stream) {
//   defaultSource = `http://178.79.160.41:8080/hls/${stream}.m3u8`;
// }

class VideoStats extends React.Component {

  state = {
    url: defaultSource,
    validPlaylist: false,
    loading: false,
    streamStats: {volume: 1},
  }

  componentDidMount() {
    this.testStream();
  }

  testStream = () => {
      if (this.testingStream) return;
      this.testingStream = true;
      const { url } = this.state;
      const request = new Request(url);
      try {
        fetch(request)
          .then(this.handlePlaylistResponse)
          .catch(this.handlePlaylistResponse)
      } catch (e) {
        console.warn("testStream", e);
        this.handlePlaylistResponse();
      }

  }

  handlePlaylistResponse = (response = {}) => {
    this.testingStream = false;
    const validStatus = response && response.status;  
    this.setState({playlistResponse: validStatus});
    switch (validStatus) {
      case 200: 
        this.startPlayer();
        break;
      case 404: 
        this.invalidPlaylist = true;
        this.setState({
          streamStats: {
            ["Trying to connect to stream"]: "True",
            ["Response Status"]: validStatus 
          }
        }, () => {
          setTimeout(this.testStream, 2000)
        })
        break;
      default: 
        this.disposePlayer();
        console.warn("Unhandled response status: ", response.message);
        const responseMessage = response.message;
        this.setState({
          streamStats: {
            ["Trying to connect to stream"]: "False",
            ["Response message"]: responseMessage,
          }
        })
        if (responseMessage === "Failed to fetch") {
          console.warn("Failed to fetch, server is probably down")
        }
        break;
    }
  }

  onRetryPlaylist = () => {
    console.log("Disposing player and waiting for a valid playlist")
    this.disposeInterval();
    this.disposePlayer();
    this.testStream();
  }


  setupPlayer(playerReady) {
    const {videoNode} = this.props;
    if (!videoNode) return;
    const videoJSOptions = {
      controls: false,
      autoplay: true,
      withCredentials: false,
      sources: []
    }
    // instantiate Video.js
    this.player = videojs(videoNode, videoJSOptions, playerReady);
    this.player.isAudio(true);
    // TODO look up the preload attribute
    this.player.playsinline(true);

  }

  loadSource(sourceUrl) {
    if (this.player) {
      try {
        this.player.src({
            src: sourceUrl,
            type: 'application/x-mpegURL'
        })
        this.player.tech().on('retryplaylist', this.onRetryPlaylist);
      } catch (e) {
        console.warn("Error setting source");
        this.disposePlayer();
        this.disposeInterval();
        this.testStream();
      }
    } else {
      console.warn("Call setupPlayer() before loading a source")
    }
  }

  startPlayer = () => {
    console.log("Starting player and stats logging")
    const {url} = this.state;
    const playerReady = () => {
      this.loadSource(url);
    }
    this.setupPlayer(playerReady);
    this.interval = setInterval(this.statsTick, 2000)
  }

  statsTick = () => { 
      const context = this;
      const streamStats = get(this.player, "hls.stats");
      if (!streamStats) return
      // check network 

      if (context.player && NETWORK_STATES[context.player.networkState()] === "NETWORK_NO_SOURCE") {
          clearInterval(context.interval);
          this.onRetryPlaylist();
          console.warn("network error detected during tick: NETWORK_NO_SOURCE")
          return;
      };

      const formattedStreamStats = {}
      
      Object.keys(streamStats).map(key => {
        if (typeof streamStats[key] !== "object") {
          formattedStreamStats[key] = streamStats[key];
        } else {
          // console.table(key, streamStats[key])
        }
      })
      
      formattedStreamStats["Current Source"] = streamStats.currentSource;
      formattedStreamStats["Volume"] = this.player.volume(); // can get or set volume with this method

      this.setState({
        streamStats: formattedStreamStats
      })
  }

  // destroy player on unmount
  componentWillUnmount() {
    this.disposePlayer();
    this.disposeInterval();
  }


  disposePlayer = () => {
    if (this.player) {
      this.player.dispose()
    }
    this.player = null;
  }

  disposeInterval = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  handleInputChange = ({target}) => this.setState({url: target.value})

  handleButtonClick = () => {
    this.setState({
      url: this.state.url
    }, () => this.startPlayer())
  }

  render() {
    const { streamStats, loading, playlistResponse } = this.state;
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
            <pre>Stream status {playlistResponse}</pre>
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
