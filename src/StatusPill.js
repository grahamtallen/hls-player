import "./StatusPill.scss"
import React from "react";


export default ({disabled, loading, streamError}) => {
	let text = "live";
	let color = "#00E35B"
	if (loading) {
		color = "#ffeb3b";
		text = "loading";
	}
	if (streamError) {
		color = "red";
		text = "error";
	}
	return <div 
			className={`status-pill-container centered ${text}`} 
			style={{color, border: `1px solid ${color}`}}
		>
		{text.toUpperCase()}
	</div>

}