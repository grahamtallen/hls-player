import "./DarkPlayer.scss";
import React, { Component } from "react";
import { Pause } from "./Buttons"
import StatusPill from "./StatusPill.js";
import dayjs from "dayjs";
import AdvancedFormat from 'dayjs/plugin/advancedFormat' // load on demand
dayjs.extend(AdvancedFormat) // use plugin
const { location = {} } = window;
const { pathname = "/" } = location;

const streamName = pathname.slice(1, pathname.length)
let defaultSource = `http://127.0.0.1:8887/${streamName}/index.m3u8`;
const testing = true;
if (!testing) {
  defaultSource = `${window.location.origin}/hls/${streamName}.m3u8`;
}


const TopBar = (props) => {
	const { invisible } = props;
	return (
		<div className={`top centered ${invisible && "invisible"}`}>
			<div className="left datum-container centered">
				<span className="title">Duration</span>
				<span className="datum" id="time">00:00</span>
			</div>
			<div className="right datum-container centered">
				<span className="title">Status</span>
				<span className="datum"><StatusPill {...props} /></span>
			</div>
		</div>
	)
}

const Button = ({disabled = false}) => {
	return (
		<div className={`circle-container centered ${disabled && "disabled"}`}>
			<Pause width="15" height="19"/>
		</div>	
	)
}

const Info = () => {
	return (
		<div className='info-row centered'>
			<span className="date">{streamName}</span>
			<span className="text">{dayjs().format('MMMM DD, YYYY')}</span>
		</div> 
	)
}

class DarkPlayer extends Component {

	state = {
		disabled: true,
		loading: true,
		streamError: false
	}

	streamsTested = 0;

	componentDidMount() {
		startTime();
		this.testStream();
	}

	componentDidUpdate() {
		const { videoNode } = this.props;
		if (videoNode) {
			// this.testStream();
		}
	}



	testStream = () => {
	  const request = new Request(defaultSource);
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
	    const validStatus = response.status; 
	    console.log(validStatus) 
	    switch (validStatus) {
	      case 200: 
	        this.setState({
	        	disabled: false,
	        	loading: false
	        })
	        break;
	      case 404: 
	      	if (this.streamsTested < 20) {

	      		setTimeout(this.testStream, 2000)
	      		this.streamsTested++
	      	} else {
	      		this.setState({
		        	loading: false,
		        	streamError: true,
	        	})
	      	}

	        break;
	      default: 
	      	this.setState({
	        	loading: false,
	        	streamError: true,
	        })
	        console.warn("Unhandled response status: ", response.message);
	        const responseMessage = response.message;
	        
	        if (responseMessage === "Failed to fetch") {
	          console.warn("Failed to fetch, server is probably down")
	        }
	        break;
	    }
	}

	render() {
		const { disabled } = this.state;
		return (
			<div className={`dark-mode-container centered`}>
				<TopBar {...this.state} />
				<div className={`middle centered ${disabled && "disabled"}`}>
					<Info {...this.state}/>
					<Button {...this.state}/>
				</div>	
				<TopBar invisible  {...this.state}/>
			</div>
		)
	}
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('time').innerHTML =
  h + ":" + m + ":" + s;
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

class App extends Component {
	state = {
		videoNode: null
	}

	setRef = (videoNode) => {
		if (!this.setVideoNode) {
			console.log(videoNode)
		  this.setVideoNode = true;
		  this.setState({videoNode})
		}
	}

	render() {
		return (
			<div className="dark-mode-container centered">
				<DarkPlayer videoNode={this.state.videoNode} />
				<audio ref={this.setRef} className="video-js"></audio>
			</div>
		)
	}
}

export default App