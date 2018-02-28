import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ImageCompressor from '@xkeshi/image-compressor';
import { Races } from '/imports/api/races/races.js';
import { Tracker } from 'meteor/tracker';
import { Checkpoints } from '../../../../../api/checkpoints/checkpoints.js';

import './new.html';

AutoForm.hooks({
  newRaceForm: {
    beginSubmit() {
    },
    formToDoc(doc) {
      const docToInsert = doc;
      const today = new Date();
      docToInsert.createdAt = today;
      const checkpoints = $('input[type=checkbox]:checked');
      const checkpointsToInsert = [];
      if (checkpoints && checkpoints.length) {
        for (let i= 0; i < checkpoints.length; i += 1) {
          const idCheckpoint = checkpoints[i].getAttribute('id')
          const lapsInput = $(`#${idCheckpoint}_laps`);
          let laps = 1;
          if (lapsInput && lapsInput.length > 0) {
            laps = parseInt(lapsInput[0].value, 10);
          }
          const intermediateCheckpoint = {
            id: checkpoints[i].getAttribute('id'),
            name: checkpoints[i].getAttribute('data-name'),
            laps,
          };
          if (!docToInsert.checkpoints) {
            docToInsert.checkpoints = [];
          }
          checkpointsToInsert.push(intermediateCheckpoint);
        }
      }
      docToInsert.checkpoints = checkpointsToInsert;

      // Now the final checkpoint
      const finalCheckpoint = $('input[name=finalCheckpoint]:checked');
      if (finalCheckpoint && finalCheckpoint.length > 0) {
        docToInsert.finalCheckpoint = { id: finalCheckpoint[0].value, name: finalCheckpoint[0].getAttribute('data-name')};
      }
      console.log(docToInsert);
      return docToInsert;
    },
    onSubmit(insertDocum) {
      const doc = insertDocum;
      // Reference named YYYYMUNXXXX.
      Meteor.call('races.insert', doc, (err, result) => {
        if (err) {
          console.log(err);
          this.done(new Error('Race insertion failed'));
        }
        if (result && result.length > 0) {
          this.done(null, result);
        }
      });
      return false;
    },
    onSuccess(formType, result) {
      FlowRouter.go('races.dashboard', {}, { raceId: result });
      Materialize.toast('New race created', 4000);
    },
    onError(formType, error) {
      console.log(error);
    },
  },
});

function removePicture() {
  $('#picture-preview').addClass('placeholder');
  $('#picture-preview').html('<i class="material-icons">photo_camera</i>');
  $('#picture-preview').css('background-image', '');
  $('input[name="picture"]').val('');
  $('input#new-picture-input').val('');
}

Template.newRace.onCreated(function () {
  const template = Template.instance();
  Tracker.autorun(function () {
    template.subscribe('checkpoints.search');
  });
});

Template.newRace.helpers({
  checkpoints() {
    return Checkpoints.find();
  },
  racesCollection() {
    return Races;
  },
});

function getBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/* Returns a Blob compressed */
function compressImageIntoBlob(file) {
  return new Promise((resolve, reject) => {
    const options = {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.8,
      convertSize: 5000000,
    };

    const imageCompressor = new ImageCompressor();
    imageCompressor.compress(file, options)
      .then((result) => { resolve(result); })
      .catch((err) => {
        alert('Error during compression of picture');
        alert(err);
        reject(err);
      });
  });
}

Template.newRace.events({
  'change input[type="checkbox"]'(event) {
  },
  'change input#new-picture-input'(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file !== null) {
        compressImageIntoBlob(file)
          .then((result) => {
            getBase64(result).then((base64String) => {
              $('input[name="picture"]').val(base64String);
              $('#picture-preview').css('background-image', `url(${base64String})`);
              $('#picture-preview').removeClass('placeholder');
              $('#picture-preview').html('<a id="removeImage-button" class="btn-floating tiny red" title="Eliminar imagen"><i class="material-icons">delete_forever</i></a>');
              $('#removeImage-button').bind('click', (event) => {
                $('#modalConfirmDeletePicture').modal('open');
              });
            });
          });
      }
    }
  },
});
