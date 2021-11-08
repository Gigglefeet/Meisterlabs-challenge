export default class Persons {
  constructor(state = []) {
    this.state = state;
  }

  get() {
    return this.state;
  }

  indexOf(person) {
    return this.state.findIndex((entry) => entry.id === person.id);
  }

  has(person) {
    return this.indexOf(person) > -1;
  }

  update(person) {
    const state = this.state.map((entry) => {
      return entry.id === person.id && entry.modifyPerson < person.modifyPerson
        ? person
        : entry;
    });

    return new Persons(state);
  }

  add(person) {
    return new Persons([...this.state, person]);
  }

  upsert(person) {
    return this.has(person) ? this.update(person) : this.add(person);
  }

  swap(personOld, personNew) {
    const state = this.state.map((entry) => {
      return entry.id === personOld.id
        ? {
            ...personNew,
            name: entry.name,
          }
        : entry;
    });

    return new Persons(state);
  }

  remove(person) {
    const state = this.state.filter((entry) => entry.id !== person.id);
    return new Persons(state);
  }

  revertChanges(personOld, isCreate) {
    return !isCreate ? this.update(personOld) : this.remove(personOld);
  }
}
