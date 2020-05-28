# Overview
All voice recognition applications targetting Quran are not showing the expected quality. To our knowledge, several solutions do exist, but are not reliable.
This work aims at making a reliable deepspeech model available for developers on several platforms for the sake of better Quran voice-recognition applications.

# Workflow
![deepspeech-quran-flow](https://user-images.githubusercontent.com/90985/83131080-98cdd980-a0df-11ea-8801-dd325739fd15.png)

This is a two-stage workflow. First, we start by training an 'Imam' model. This model is based on professional recordings from professional recitors. Such model is conservative and does not tolerate normal users background noises, pauses, hummings, ..etc.
The role of this unrealisting model is to evaluate user data sets only. With a defined acceptance threshold, user recording may be filered. With such dataset, a second model is trained.
Moreover, data augmentation techniques are applied at the second stage. The resultant model provides an acceptable and portable solution.

## Model output
The model can simply recognize Quran texts (with tashkeel), and may also output time tags for each word.
Several integration examples may be found in the parent [examples](https://github.com/mozilla/DeepSpeech-examples).
