import React from "react";

class MessageBox extends React.Component {
  constructor() {
    super();
    this.state = {
      closed: false,
      closing: false
    };
  }

  dismiss() {
    this.setState({ closing: true }, () => {
      setTimeout(() => {
        this.setState({ closed: true });
      }, 500);
    });
  }

  render() {
    if (!this.state.closed) {
      return (
        <div
          onClick={this.dismiss.bind(this)}
          className={`msg msg-${this.props.type} ${
            this.state.closing ? "closing" : ""
          }`}
        >
          {this.props.children}
        </div>
      );
    }
    return null;
  }
}

export default MessageBox;
