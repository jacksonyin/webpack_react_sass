import React, { Component } from "react";

import './App.scss';

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      value: ""
    };

    // this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event) => {
    const { value } = event.target;
    this.setState(() => {
      return {
        value
      };
    });
  }

  render() {
    return (
      <>
      <div className="text-container">Test React</div>
        <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
      </>
    );
  }
}
