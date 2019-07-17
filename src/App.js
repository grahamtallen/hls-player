import "./App.css";
import "video.js/dist/video-js.css";
import React from 'react';
import logo from './logo.svg';
import videojs from "video.js";
import './App.css';
import get from "lodash/get"
import JSONPretty from 'react-json-pretty';
import JSONPrettyMon from 'react-json-pretty/dist/monikai';

const defaultSource = "https://video-dev.github.io/streams/pts_shift/master.m3u8";

class VideoStats extends React.Component {

  state = {
    streamStats: {},
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
      sources: [{
            src: this.state.source,
            type: 'application/x-mpegURL'
        }]
    }

    // instantiate Video.js
    this.player = videojs(videoNode, videoJSOptions, function onPlayerReady() {
      console.log('onPlayerReady', this)
    });
    this.interval = setInterval(() => {
      const streamStats = get(this.player, "dash.stats")
      const formattedStreamStats = {}
      formattedStreamStats["Current Source"] = streamStats.currentSource;
      formattedStreamStats["Nework State"] = this.player.networkState();

      Object.keys(streamStats).map(key => {
        if (typeof streamStats[key] !== "object") {
          formattedStreamStats[key] = streamStats[key];
        } else {
          console.table(key, streamStats[key])
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
    this.setState({loading: true})
    if (this.player) {
      this.player.dispose()
    }
    if (this.interval) {
      // this.interval && this.interval();
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

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    if (this.state.loading || !this.props.videoNode) return (
      <div className="loading-container">
        <pre>Loading</pre>
      </div>
    )
    return (
      <div> 
          <label >
            Url: 
            <input value={this.state.url} onChange={this.handleInputChange} />
          </label>
          <button onClick={this.handleButtonClick}> Stream </button>

        <JSONPretty id="json-pretty" data={this.state.streamStats} theme={JSONPrettyMon}></JSONPretty>

      </div>
    )
  }
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
