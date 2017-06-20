import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../api/tasks.js';

import './body.html';
import './task.js';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
 Session.set('sort', -1);
});

Template.body.helpers({

  tasks(){
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: -1 } });
  },
  incompleteCount(){
    return Tasks.find({checked: { $ne: true }}).count();
  },
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    console.log(event);
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;
    const completeByDate = target.completeByDate.value;
    const priority = Number(target.priority.value);
    // Insert a task into the collection
    Meteor.call('tasks.insert', text, completeByDate, priority);

    // Clear form
    target.text.value = '';
    target.completeByDate.value = '';
    target.priority.value = 1;
  },
    'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});