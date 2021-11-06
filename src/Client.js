import React, { Component } from 'react';
import Persons from './utils/Persons';
import Server from './Server';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

let id = 0;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default class Client extends Component {
  constructor() {
    super();

    this.state = {
      persons: new Persons(),
      openSnackBar: false,
    };
  }

  handleOpenSnackbar() {
    console.log(this.state);
    this.setState((state) => ({
      openSnackBar: true,
    }));
  }

  handleCloseSnackbar() {
    this.setState((state) => ({
      openSnackBar: false,
    }));
  }

  createPerson() {
    const person = {
      name: '',
      id: --id,
    };

    // Person created instantly on the front-end (no request to server yet)
    // UI changes: new person on your screen
    this.setState((state) => ({
      persons: state.persons.add(person),
    }));

    this.savePerson(person);
  }

  onClickCreatePerson = () => {
    this.createPerson();
  };

  onClickSaveName(person) {
    this.savePerson(person);
  }

  onChangeName(person, event) {
    const name = event.target.value;

    this.setState((state) => ({
      persons: state.persons.update({
        ...person,
        name,
      }),
    }));
  }

  savePerson(person) {
    const isCreate = person.id < 0;

    const method = isCreate ? 'post' : 'patch';

    // Send request to server to save person
    // If the response is OK, we do nothing, because the person is already created on the front-end

    //If the response is not OK (ex. status: 400), we call this.onSaveFailure
    Server[method](person)
      .then((personNew) => {
        this.onSaveSuccess(person, personNew, isCreate);
      })
      .catch((err) => {
        this.onSaveFailure(person, isCreate);
      });
  }

  onSaveFailure = (personOld, isCreate) => {
    // Remove the person from front-end
    this.setState((state) => ({
      persons: state.persons.revertChanges(personOld, isCreate),
    }));
  };

  onSaveSuccess = (personOld, personNew, isCreate) => {
    this.handleOpenSnackbar();
    if (!isCreate) return;
    this.setState((state) => ({
      persons: state.persons.swap(personOld, personNew),
    }));
  };

  renderPersons() {
    return this.state.persons.get().map((person) => (
      <div key={person.id} className="challenge-person">
        <span className="challenge-person-id">{person.id}</span>
        <input
          value={person.name}
          className="challenge-person-name"
          onChange={(event) => this.onChangeName(person, event)}
        />
        <button class="glow-on-hover" type="button">
          Save Name
        </button>
        <Snackbar
          open={this.state.openSnackBar}
          autoHideDuration={6000}
          onClose={() => {
            this.handleCloseSnackbar();
          }}
        >
          <Alert
            onClose={() => {
              this.handleCloseSnackbar();
            }}
            severity="success"
          >
            Your changes have been saved on the Server!
          </Alert>
        </Snackbar>
      </div>
    ));
  }

  render() {
    return (
      <div className="challenge">
        {/* <button
          className="challenge-create-person-button"
          onClick={this.onClickCreatePerson}
        >
          Create Person
        </button> */}
        <label className="rocker">
          <input onClick={this.onClickCreatePerson} type="checkbox" />{' '}
          <span className="switch-left">+1</span>
          <span className="switch-right">+1</span>
        </label>
        <div className="challenge-persons">{this.renderPersons()}</div>
      </div>
    );
  }
}
