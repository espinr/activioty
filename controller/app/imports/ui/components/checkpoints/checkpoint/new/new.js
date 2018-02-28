import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ImageCompressor from '@xkeshi/image-compressor';
import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';
import { Tracker } from 'meteor/tracker';

import './map/map.js';
import './new.html';

AutoForm.hooks({
  newCheckpointForm: {
    beginSubmit() {
    },
    formToDoc(doc) {
      const docToInsert = doc;
      const today = new Date();
      docToInsert.createdAt = today;
      return docToInsert;
    },
    onSubmit(insertDocum, updateDoc, currentDoc) {
      let doc = insertDocum;
      // Reference named YYYYMUNXXXX.
      Meteor.call('checkpoints.insert', doc, (err, result) => {
        if (err) {
          console.log(err);
          this.done(new Error('Checkpoint insertion failed'));
        }
        if (result && result.length > 0) {
          this.done(null, result);
        }
      });
      return false;
    },
    onSuccess(formType, result) {
      FlowRouter.go('checkpoints.dashboard', {}, { checkpointId: result });
      Materialize.toast('New checkpoint created', 4000);
    },
    onError(formType, error) {
      alert(error);
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

Template.newCheckpoint.onCreated(function () {
  Tracker.autorun(function () {
  });
  // Select 'installed' by default in the switch 
  $(document).ready( () => {
    $('input[type="checkbox"]').prop('checked', true);
    $('#col-dateRemoval').hide();
    $('.modal').modal({
      dismissible: true,
      opacity: 0.5,
      startingTop: '40%',
      ready(modal, trigger) {
        console.log(modal, trigger);
        $('.modal-ok').bind('click', (event) => {
          removePicture();
          $('#modalConfirmDeletePicture').modal('close');
        });
      },
    });
  });
});

Template.newCheckpoint.helpers({
  checkpointsCollection() {
    return Checkpoints;
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

Template.newCheckpoint.events({
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
