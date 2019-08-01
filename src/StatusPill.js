import "./StatusPill.scss"
import React from "react";


export default ({text = "live", color = "#00E35B"}) => {

	return <div className="status-pill-container centered" style={{color, border: `1px solid ${color}`}}>
		{text.toUpperCase()}
	</div>

}