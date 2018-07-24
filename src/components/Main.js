import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import classnames from "classnames";
import { Transition } from "react-transition-group";
import Tags from "react-tagging-input";
import "react-tagging-input/dist/styles.css";
export default class Main extends React.Component {
  constructor() {
    super();

    this.state = {
      opened: false,
      inTransition: false,
      transitionTime: 1000,
      fields: {},
      errors: {},
      phoneNumberString: "",
      message: "",
      receipientsValue: "",
      warningMessage: "",
      tags: [],
      validOnes: []
    };
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle() {
    const { opened, transitionTime } = this.state;
    this.setState({ opened: !opened, inTransition: true }, () => {
      const delay = opened ? transitionTime : 0;
      setTimeout(() => this.setState({ inTransition: false }), delay);
    });
    this.refs.AddRecipients.value = "";
    this.setState({ receipientsValue: "" });
  }

  handleRecipientValidation() {
    let fields = this.state.fields;
    let errors = {};
    let formIsValid = true;
    var tags = [];
    var validOnes = [];
    var valid = 0;
    var invalid = 0;
    var newString = "";

    //Recipients
    if (!fields["AddRecipients"]) {
      formIsValid = false;
      errors["AddRecipients"] = "Cannot be empty";
    }

    if (typeof fields["AddRecipients"] !== "undefined") {
      var arr = fields["AddRecipients"].split(" ");

      for (var i = arr.length - 1; i >= 0; i--) {
        //regex for autr. lian phone numbers
        /*valid numbers are- "0411 234 567";"(02) 3892 1111";"38921111". "0411234567"; */
        if (
          /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/.test(
            arr[i]
          )
        ) {
          if (!validOnes.includes(arr[i])) {
            validOnes.push(arr[i]);
            newString = newString + "   " + arr[i];
            valid++;
          }
        } else {
          invalid++;
        }
      }
      this.onTagAdded(validOnes);
      this.setState({ validOnes: validOnes });
      this.setState({ phoneNumberString: newString });

      errors["AddRecipients"] = "";

      if (invalid > 0) {
        errors["AddRecipients"] =
          valid +
          " Valid no.s are added and " +
          invalid +
          " Invalid Numbers ignored";
      } else {
        this.onToggle();
      }

      this.setState({ formIsValid: false });
    }
    this.setState({ errors: errors });
    return formIsValid;
  }

  onTagAdded(tag) {
    console.log(tag);
    this.setState({
      tags: tag
    });
  }

  contactRecipientSubmit(e) {
    e.preventDefault();

    if (this.handleRecipientValidation()) {
    } else {
      alert("Form has errors.");
    }
  }
  clearForm() {
    this.setState({ message: "" });
    this.setState({ fields: "" });
    this.setState({ tags: [] });
    this.refs.AddRecipients.value = "";
  }
  sendFormMessage() {
    var message = this.state.message;
    var recipients = this.state.validOnes;

    if (recipients.length == 0) {
      alert("no recipient added");
      return;
    }

    if (message.trim() == "") {
      alert("Blank Message cannot be sent");
      return;
    }

    return fetch(
      "https://private-amnesiac-55fcaa-frontenddevtest.apiary-proxy.com/message",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          recipients: recipients
        })
      }
    )
      .then(response => response.json())
      .then(response => {
        // var res = response.json();

        if (response.recipients.length > 0) {
          alert("Message sent successfully");
          this.clearForm();
        }
      })
      .catch(error => {
        alert("Message Sending Failed.");
        console.log(error);
      });
  }

  changeMessage(e) {
    this.setState({ message: e.target.value });
  }

  handleChange(field, e) {
    let fields = this.state.fields;
    fields[field] = e.target.value;
    this.setState({ fields });
  }
  render() {
    const { opened, inTransition } = this.state;
    const buttonLabel = opened ? "Cancel" : "Add Recipients";
    return (
      <div className="mainWrap">
        <section className="MainContainer">
          <div className={classnames("card", { opened, active: inTransition })}>
            Add Recipients
            <textarea
              ref="AddRecipients"
              id="popUpreceipients"
              name="message"
              className="materialize-textarea receipientText validate"
              onChange={this.handleChange.bind(this, "AddRecipients")}
            />
            <span style={{ color: "red" }}>
              {this.state.errors["AddRecipients"]}
            </span>
            <button
              className="AddRecpButton"
              id="AddRecpButton"
              onClick={this.contactRecipientSubmit.bind(this)}
            >
              Add Recipients
            </button>
          </div>
          <div className="Receipients content">
            <button
              className={classnames("btn", { pressed: opened })}
              onClick={this.onToggle}
            >
              {buttonLabel}
            </button>

            <label> Receipients</label>
            <div>
              <Tags
                tags={this.state.tags}
                id="receipients"
                name="message"
                className="materialize-textarea receipientText validate"
                value={this.state.phoneNumberString}
                placeholder=""
                onChange={this.onTagAdded.bind(this)}
                disabled
              />
            </div>
          </div>
          <div className="Message content">
            <label> Message</label>
            <textarea
              id="message"
              name="message"
              value={this.state.message}
              onChange={e => this.changeMessage(e)}
              className="materialize-textarea MessageText validate"
            />
          </div>
          <div className="Buttons content">
            <button
              className="sendButton"
              id="sendButton"
              onClick={() => this.sendFormMessage()}
            >
              Send Message{" "}
            </button>
            <button className="clearButton" id="clearButton">
              Clear
            </button>
          </div>
          <div className="clearFix" />
        </section>
      </div>
    );
  }
}
