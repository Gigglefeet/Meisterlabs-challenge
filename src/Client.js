import React, { Component } from 'react';
import Persons from './utils/Persons';
import Server from './Server';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { TextField } from '@mui/material';

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
      openErrorSnackbar: false,
    };
  }

  handleOpenSnackbar(isCreate) {
    console.log(this.state);
    this.setState((state) => ({
      openSnackBar: true,
      isCreate,
    }));
  }

  handleCloseSnackbar() {
    this.setState((state) => ({
      openSnackBar: false,
    }));
  }

  handleOpenErrorSnackbar() {
    console.log(this.state);
    this.setState((state) => ({
      openErrorSnackbar: true,
    }));
  }

  handleCloseErrorSnackbar() {
    this.setState((state) => ({
      openErrorSnackbar: false,
    }));
  }
  // This function actually creates the person. With a minus id so it gets created on server.
  createPerson() {
    const person = {
      name: '',
      id: --id,
      modifyPerson: new Date().getTime(),
      sent: false,
    };

    // Person created instantly on the front-end (no request to server yet)
    // UI changes: new person on your screen
    this.setState((state) => ({
      persons: state.persons.add(person),
    }));

    this.savePerson(person);
  }
  // This handler function calls the create function.
  onClickCreatePerson = () => {
    this.createPerson();
  };

  onClickSaveName(person) {
    this.savePerson(person);
  }

  onChangeName(person, event) {
    const name = event.target.value;
    const modifyPerson = new Date().getTime();

    this.setState((state) => ({
      persons: state.persons.update({
        ...person,
        name,
        modifyPerson,
      }),
    }));
  }

  async savePerson(person) {
    const isCreate = person.id < 0;
    const modifyPerson = new Date().getTime();
    const method = isCreate && !person.sent ? 'post' : 'patch';
    await this.setState((state) => ({
      persons: state.persons.update({
        ...person,
        sent: true,
        modifyPerson,
      }),
    }));
    // Send request to server to save person
    // If the response is OK, we do nothing, because the person is already created on the front-end

    //If the response is not OK (ex. status: 400), we call this.onSaveFailure
    Server[method]({ ...person, modifyPerson })
      .then((personNew) => {
        this.onSaveSuccess(person, personNew, isCreate);
      })
      .catch((err) => {
        this.onSaveFailure(person, isCreate);
      });
  }
  onSaveFailure = (personOld, isCreate) => {
    // If onSaveFailure then the person is removed from front-end
    this.handleOpenErrorSnackbar();
    // this.setState((state) => ({
    //   persons: state.persons.revertChanges(personOld, isCreate),
    // }));
  };

  onSaveSuccess = (personOld, personNew, isCreate) => {
    this.handleOpenSnackbar(isCreate);
    if (!isCreate) return;
    this.setState((state) => ({
      // here I changed upsert to swap so I update not add the person.
      persons: state.persons.swap(personOld, personNew),
    }));
  };

  renderPersons() {
    return this.state.persons.get().map((person) => (
      <div key={person.id} className="challenge-person">
        <span className="challenge-person-id">{person.id}</span>
        <TextField
          id="outlined-basic"
          label="Name"
          variant="filled"
          value={person.name}
          className="challenge-person-name"
          onChange={(event) => this.onChangeName(person, event)}
        />
        <button
          className="glow-on-hover"
          type="button"
          onClick={() => this.onClickSaveName(person)}
        >
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
            {this.state.isCreate
              ? 'Created Empty Person'
              : 'Updated Person successfully'}
          </Alert>
        </Snackbar>
        <Snackbar
          open={this.state.openErrorSnackbar}
          autoHideDuration={6000}
          onClose={() => {
            this.handleCloseErrorSnackbar();
          }}
        >
          <Alert
            onClose={() => {
              this.handleCloseErrorSnackbar();
            }}
            severity="error"
          >
            Updating failed
          </Alert>
        </Snackbar>
      </div>
    ));
  }
  render() {
    return (
      <div className="challenge">
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
