import React from "react";
import { Link } from "react-router-dom";
export default class Header extends React.Component {
  render() {
    return (
      <header>
        <h1>Send Message</h1>
        <div className="clearFix" />
      </header>
    );
  }
}
