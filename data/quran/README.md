# Overview
All voice recognition applications targetting Quran are not showing the expected quality. To our knowledge, several solutions do exist, but are not reliable.
This work aims at making a reliable deepspeech model available for developers on several platforms for the sake of better Quran voice-recognition applications.

# Workflow
![deepspeech-quran-flow](https://user-images.githubusercontent.com/90985/83131080-98cdd980-a0df-11ea-8801-dd325739fd15.png)

This is a two-stage workflow. First, we start by training an 'Imam' model. This model is based on professional recordings from professional recitors. Such model is conservative and does not tolerate normal users background noises, pauses, hummings, ..etc.
The role of this unrealisting model is to evaluate user data sets only. With a defined acceptance threshold, user recording may be filered. With such dataset, a second model is trained.
Moreover, data augmentation techniques are applied at the second stage. The resultant model provides an acceptable and portable solution.

After each import step, the training should be launched using the `bin/run-quran.sh` and `bin/run-quran-tusers.sh`

## Model output
The model can simply recognize Quran texts (with tashkeel), and may also output time tags for each word.
Several integration examples may be found in the parent [examples](https://github.com/mozilla/DeepSpeech-examples).

# Tuning WorkFlow Parameters
Several prameters can be set/tuned that may affect the final model
## CSV Amount
This parameter exists for both importer scripts. It limits the length of the audio recordings. With long recordings (Ayas), the training epochs get too slow and require much of RAM. The default limit is set to accept the shortest 70% of the recordings.
## Eval Threshold
This parameter is needed to define the acceptance level for the tarteel users dataset. Based on version 1.0, the evaluation histogram looks like:

![hist_eval](https://user-images.githubusercontent.com/90985/83154322-481aa880-a100-11ea-882c-e38c6972c635.PNG)

Note that some outliers with negative evaluation are removed. According to manual listing to the below samples, the default threashold is set at 0.15. With this selection, out of 25K user recording, only 18420 are accepted.

| Imam Evaluation  | Sample User Recording |
| ------------- | ------------- |
| 0.9 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.90_104_8_200138152.wav)  |
| 0.8 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.80_15_40_3619386559.wav)  |
| 0.7 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.70_54_3_1843155457.wav)  |
| 0.6 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.60_35_19_2709284236.wav)  |
| 0.5 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.50_16_56_2551827829.wav)  |
| 0.4 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.40_20_17_1693007443.wav)  |
| 0.3 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.30_6_56_2270203246.wav)  |
| 0.2 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.20_11_82_1615274534.wav)  |
| 0.15 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.15_8_27_83843297.wav)  |
| 0.1 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.10_8_14_3524780292.wav)  |
| 0.05 | [sample](https://rawcdn.githack.com/tarekeldeeb/DeepSpeech-Quran/5c19fe62d0353e2b13e4ccdf45ca47244cb3e447/data/quran_tusers/samples/eval0.05_2_179_1044022222.wav)  |

