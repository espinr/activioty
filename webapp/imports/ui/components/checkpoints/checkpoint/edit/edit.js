import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ImageCompressor from '@xkeshi/image-compressor';
import { Checkpoints } from '/imports/api/checkpoints/checkpoints.js';

import './edit.html';


AutoForm.hooks({
  editCheckpointForm: {
    before: {
      update(doc) {
        return doc;
      },
    },
    formToDoc(doc) {
      return doc;
    },
    after: {
      update(error, result) {
        if (error) {
          if (error.reason) {
            alert(error.reason);
          }
        } else if (result) {
          FlowRouter.go('checkpoints.dashboard');
          Materialize.toast('The checkpoint was successfully updated', 4000);
        }
      },
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

function loadPicture(base64String) {
  $('input[name="picture"]').val(base64String);
  $('#picture-preview').css('background-image', `url(${base64String})`);
  $('#picture-preview').removeClass('placeholder');
  $('#picture-preview').html('<a id="removeImage-button" class="btn-floating tiny red" title="Eliminar imagen"><i class="material-icons">delete_forever</i></a>');
  $('#removeImage-button').bind('click', (event) => {
    $('#modalConfirmDeletePicture').modal('open');
  });
}

Template.editCheckpoint.onCreated(function () {
  this.state = new ReactiveDict();
  Meteor.subscribe('checkpoints.search');
  $(document).ready( () => {
    // Loads the image within the thumbnail
    const pictureBase64 = $('input[name="picture"]').val();
    if (pictureBase64 && pictureBase64.trim().length > 0) {
      loadPicture(pictureBase64);
    }
    $('.modal').modal({
      dismissible: true,
      opacity: 0.5,
      startingTop: '40%',
      ready(modal, trigger) {
        $('.modal-ok').bind('click', (event) => {
          removePicture();
          $('#modalConfirmDeletePicture').modal('close');
        });
      },
    });
  });
});

Template.editCheckpoint.helpers({
  checkpointsCollection() {
    return Checkpoints;
  },
  currentCheckpoint() {
    // Load the checkpoint specified on the param
    const checkpointId = FlowRouter.getParam('checkpointId');
    if (checkpointId && checkpointId.length > 0) {
      const currentCheckpoint = Checkpoints.findOne({ _id: checkpointId });
      return currentCheckpoint;
    }
    FlowRouter.go('checkpoints.dashboard');
    return null;
  },
});

Template.editCheckpoint.events({
  'change input#new-picture-input'(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file !== null) {
        compressImageIntoBlob(file)
          .then((result) => {
            getBase64(result).then(loadPicture);
          });
      }
    }
  },
});
