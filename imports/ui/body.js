import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../api/tasks.js';

import './body.html';
import './task.js';

Session.set("sort_by", '');
Session.set('sort_value', 1);

const toggleSortValue = function(){
    let switch_sort_value = Session.equals("sort_value", "1")?"-1":"1";
    Session.set('sort_value', switch_sort_value  );
}

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});

Template.body.helpers({

  tasks(){
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks and sort accordingly
        let sortBy = Session.get("sort_by");
        let sortValue = Session.get("sort_value");
        if (sortBy == "priority"){
           return Tasks.find({}, {sort: {priority: sortValue}});
        } else if(sortBy == "text"){
            return Tasks.find({}, {sort: { text: sortValue}})
        } else if(sortBy == "completeByDate"){
          return Tasks.find({}, {sort: {completeByDate: sortValue}});
        }else{
          return Tasks.find({}, { sort: { createdAt: -1 } });
        }
  },
  incompleteCount(){
    return Tasks.find({checked: { $ne: true }}).count();
  },
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
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
    'click .sort-by-priority'(){
      Session.set('sort_by', "priority");
      toggleSortValue();
    },
    'click .sort-by-complete'(){
      Session.set('sort_by', "completeByDate");
      toggleSortValue();
    },
    'click .sort-by-task'(){
      Session.set('sort_by', "text");
      toggleSortValue();
    },
    'click .sort-by-clear'(){
      Session.set('sort_by', '');
    },
});
