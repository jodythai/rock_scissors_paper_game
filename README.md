# Rock, Scissors, Paper War: A.I. vs Human
### Duong B. Thai, Phuong T.M. Chu, Dung Nguyen & Hai Nguyen
This is the project that we finished after the 7th week of studying **Machine Learning** from scratch.

<p align="center">
  <img width="860" height="400" src="https://cdn.discordapp.com/attachments/602742593943502859/618141632448954388/Screen_Shot_2019-09-03_at_12.53.30_AM.png">
</p>

## INTRODUCTION
### 1. Rock - Scissors - Paper game
**Rock–paper–scissors** is a hand game usually played between two people, in which each player simultaneously forms one of three shapes with an outstretched hand. These shapes are "rock", "paper", and "scissors". In this project, we built a deep learning model which can recognize images of rock, paper and scissors hand form and built a game for human to play it with computer via the webcam.

### 2. Project goals
- Building a **deep neural network** to classify Rock, Scissors and Paper images.

- Making a **Web Flask application** so user can play Rock, Scissors, Paper with the computer via the webcam.

### 3. Project plan
|Task|Progress|
|:-----------------------------|:------------:|
|Data collection |✔|
|Data preprocessing |✔|
|Build Model|✔|
|Build Flask App|✔|
|Deployment to Google Cloud|✔|

## COLLECTING DATA
### 1. The Rock–paper–scissors Dataset
Our **Rock–paper–scissors** dataset includes 7958 images with labels:
- **paper**: 3029 images
- **rock**: 2954 images
- **scissors**: 2860 images

### 2. Data Collection process 
* We captured our own images (more than 5000 images) by taking photos with webcam (size 640x480).
* In addition, we found more images from the Internet , e.g [the Kaggle dataset](https://www.kaggle.com/alishmanandhar/rock-scissor-paper/).
    During the data cleanning process, some inappropriate images were removed from the dataset. For example:
    ![](https://i.imgur.com/NFErdIt.jpg)
    
## BUILDING MODEL
For this project, we used **pre-trained model [MobileNetV2](https://keras.io/applications/#mobilenetv2)** from keras. MobileNetV2 is **Convolutional Neural Networks (CNN) model** that was trained on a large dataset to solve a **similar problem to this project**, so it will help us to save lots of time on buiding low-level layers and focus on the application.

![](https://www.datascience.com/hs-fs/hubfs/CNN%202.png?width=650&name=CNN%202.png)

Walk through our Google Colab file step by step:

### 1. Load and preprocess images


We went through all images in the source data folder and do the following tasks:

1. Check if the image is PNG and convert to JPEG.
1. Check if the destination folder is existed or not, then create that folder.
1. If resize is enabled, all source images will be resized to the target size.
1. All images will be copied to the destination folder.

- Define a function to load and preprocess image from path:

```python
def preprocess_images(path_src, path_dest, resize=False, target_size=500, verbose=0):
  """
  This function will preprocess all images inside source folder and copy to destination folder
  Parameters:
  - path_src: the path of source folder.
  - path_dest: the path of destination folder.
  - resize: True or False. Set to True will resize all the images to the target_size
  - target_size: Integer. If resize is True, set the target_size will resize the image with the shorter dimension having the target_size.
  - verbose: print out the progress. 0 or 1.
  """
  
  all_images_for_resizing = [str(x) for x in path_src.glob('*/*') if x.parent.name in label_names and x.is_file()]

  for image_path in all_images_for_resizing:

    image = Image.open(image_path)

    # check if image is PNG
    if len(image.split()) > 3:
      #convert PNG to JPEG
      image = image.convert('RGB')

    # check destination folders
    if not path_dest.is_dir():
      # destination train folder is not existed, create one
      os.mkdir(path_dest)

    # get the file name
    image_splits = image_path.rsplit('/', 2)
    dest_folder = pathlib.Path(os.path.join(path_dest, image_splits[1]))

    # if destination label folder not existed, then create one
    if not dest_folder.is_dir():
      os.mkdir(dest_folder)

    # set destination file name
    dest_filename = pathlib.Path(os.path.join(image_path.rsplit('/', 2)[-2], image_path.rsplit('/', 2)[-1]))
    # set new destination
    dest_filename = pathlib.Path(os.path.join(path_dest, dest_filename))

    # image resizing process
    if resize and (image.width > target_size or image.height > target_size):
      # set the new dimensions
      if (image.width > image.height): # landscape image
        new_size = (int(target_size*(image.width/image.height)), target_size )

      else: # portrait image
         new_size = (target_size, int(target_size*(image.width/image.height)))

      output = image.resize(new_size)

      # save all resized file to new destination
      if not dest_filename.is_file():
        output.save(dest_filename)

    else: # now working on the rest images
      if not dest_filename.is_file():
        image.save(dest_filename)
    
    if verbose == 1:
      print(dest_filename)
      
      if resize:
        print('current size: ({}, {})'.format(image.width, image.height))
        print('new size:', new_size) 
```
Since our source images have relatively small sizes, so there is no needs to resize the source images.

In addition, we also augmented images:
```python
train_img_datagen = ImageDataGenerator(
                                        rescale=1./255,
                                        rotation_range=40,
                                        brightness_range = (1, 1.5),
                                        horizontal_flip=True,
                                        vertical_flip=True,
                                        fill_mode="nearest"
                                      )

train_generator = train_img_datagen.flow_from_dataframe(df_train,
                                                 x_col='paths',
                                                 y_col='labels',
                                                 batch_size=BATCH_SIZE,
                                                 shuffle=True,
                                                 class_mode='sparse',
                                                 target_size=(IMAGE_HEIGHT,IMAGE_WIDTH))
```

### 2. Building model

The CNN model contain **MobileNetV2, Pooling, fully-connected hidden layer and Output layer**.

- First we create **mobile_net** as an instance of **MobileNetV2**:

```python
mobile_net = tf.keras.applications.MobileNetV2(input_shape=(IMAGE_HEIGHT, IMAGE_WIDTH, 3), include_top=False)
mobile_net.trainable=False # this told the model not to train the mobile_net.
```

- Then we build CNN model:

```python
base_learning_rate = 0.0001

def create_model_tl():
  model = tf.keras.Sequential([
      mobile_net,
      tf.keras.layers.GlobalAveragePooling2D(),
      tf.keras.layers.Dense(len(label_names), activation = 'softmax')])
  
  model.compile(optimizer=tf.keras.optimizers.RMSprop(lr=base_learning_rate),
#   model.compile(optimizer=tf.keras.optimizers.Adam(),
                loss='sparse_categorical_crossentropy',
                metrics=["accuracy"])
  return model
```

### 3. Training model

Before training our **CNN model**, we need to implement batch to the training data so that the model will train faster.

```python
initial_epochs = 30
fine_tune_epochs = 30
BATCH_SIZE = 32

total_epochs = initial_epochs + fine_tune_epochs

history_tl = model_tl.fit_generator(
    train_generator,
    steps_per_epoch=total_train_images // BATCH_SIZE,
    epochs=total_epochs,
    validation_data=validation_generator,
    validation_steps=total_val_images // BATCH_SIZE,
    initial_epoch=initial_epochs,
    workers=5,
    use_multiprocessing=True,
    callbacks=callbacks
)
```

- After training, save the model for later use:
```python
#Save the entire model to a HDF5 file
model_tl.save(os.path.join(export_path, EXPORT_MODEL_NAME))
```

### 4. Model performance summary
![](https://i.imgur.com/dQLhmoN.png)

- Samples of model prediction results:

<p align="center">
  <img width="600" height="600" src="https://i.imgur.com/LrhTHtd.png">
</p>

We achieved a **CNN model** to classify Rock, Scissors and Paper images with high accuracy **94.88 %** for train set and **85.42 %** for test set at `Epoch 60`.

## BUILDING THE FLASK APP

You can find our game online https://rsp-game-251717.appspot.com/#

* How we create the web app and integrate the trained model
* Introduce the game engine


### How to run the Flask App locally
```
virtualenv env
source env/bin/activate

# For window
set FLASK_APP=app.py
set FLASK_ENV=development
export FLASK_DEBUG=1
flask run

# For Ubuntu
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
flask run
```
### Deploy the App to Google Cloud Platform

```
gcloud app deploy
```

## CONCLUSION
We successfully **built a deep neural network model** by implementing **Convolutional Neural Network (CNN)** to classify Rock, Scissors and Paper images with high accuracy **94.88 %** for train set and **85.42 %** for test set.

In addition, we also **built a Flask application** so user can play Rock, Scissors, Paper game with the computer [online](https://rsp-game-251717.appspot.com/#) via the webcam.
