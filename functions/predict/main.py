import re
import os
import base64
import time
import sys
import numpy as np
import uuid
import tensorflow as tf
from flask import request, jsonify
from google.cloud import storage

model = None
BUCKET = os.environ.get('GCS_BUCKET')
storage_client = storage.Client()

labels = {'paper': 0, 'rock': 1, 'scissors': 2}

MY_MODEL = 'checkpoint-model_tl_ep60_160x160.h5'
FILENAME_TEMPLATE = '{}.jpg'
PREDICT_IMAGE_WIDTH = 160
PREDICT_IMAGE_HEIGHT = 160

if not os.path.exists('/tmp/model'):
  os.makedirs('/tmp/model')

def load_model():
  global model
  if not os.path.exists('/tmp/model/' + MY_MODEL):
      download_blob(BUCKET, MY_MODEL, '/tmp/model/' + MY_MODEL)

  path = '/tmp/model/' + MY_MODEL

  model = tf.keras.models.load_model(path)

def download_blob(bucket_name, src_blob_name, dst_file_name):
  bucket = storage_client.get_bucket(bucket_name)
  blob = bucket.blob(src_blob_name)

  blob.download_to_filename(dst_file_name)

  print('Blob {} downloaded to {}.'.format(
    src_blob_name,
    dst_file_name))

def upload_blob(bucket_name, src_file, dst_file_name):
  """Upload a file to the bucket"""
  storage_client = storage.Client()
  bucket = storage_client.get_bucket(bucket_name)
  blob = bucket.blob('uploads/'+dst_file_name)

  blob.upload_from_string(src_file, content_type='image/jpg')

  print('File uploaded to uploads/{}.'.format(dst_file_name))

def preprocess_image(img_raw):
  predict_img_width = PREDICT_IMAGE_WIDTH
  predict_img_height = PREDICT_IMAGE_HEIGHT

  img_str = re.search(b"base64,(.*)", img_raw).group(1)
  img_decode = base64.decodebytes(img_str)

  image = tf.image.decode_jpeg(img_decode, channels=3)
  image = tf.image.resize(image, [predict_img_width, predict_img_height])
  image = (255 - image) / 255.0  # normalize to [0,1] range
  image = tf.reshape(image, (1, predict_img_width, predict_img_height, 3))

  return image, img_decode

def predict(request):  
  global model

  probabilites = ''
  label = ''

  # Set up CORS to allow requests from arbitrary origins.
  # See https://cloud.google.com/functions/docs/writing/http#handling_cors_requests
  # for more information.
  # For maxiumum security, set Access-Control-Allow-Origin to the domain
  # of your own.
  if request.method == 'OPTIONS':
    headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Max-Age': '3600'
    }
    return ('', 204, headers)

  headers = {
    'Access-Control-Allow-Origin': '*'
  }

  if model is None:
    load_model()

  if request.method == 'POST':

    data = request.get_json()

    # Preprocess the upload image
    img_raw = data['data-uri'].encode()
    image, img_decode = preprocess_image(img_raw)

    # Write the image to the server
    # created_on = time.time()
    # filename = os.path.join(current_app.config['UPLOAD_FOLDER'], str(created_on) + ".jpg")
    # with open(filename, 'wb') as f:
    #   f.write(img_decode)

    # upload file to storage
    id = uuid.uuid4().hex
    filename = FILENAME_TEMPLATE.format(id)
    upload_blob(BUCKET, img_decode, filename)

    # Predict the uploaded image
    probabilites = model.predict(image)
    label = np.argmax(probabilites, axis=1).tolist()
    # print('label:' + str(label[0]), file=sys.stdout)
    # print('probs:' + str(probabilites[0]), file=sys.stdout)

    # Map the labels to the 
    label = [(val, key) for val, key in labels.items() if key == label[0]]
    probs = probabilites[0].tolist()
    for val, key in labels.items():
      probs[key] = [val, probs[key]]

    # print(probs, file=sys.stdout)

  return (jsonify({'label': label, 'probs': probs}), 200, headers)