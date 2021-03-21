Project DeepSpeech Quran
========================


.. image:: https://readthedocs.org/projects/deepspeech/badge/?version=latest
   :target: https://deepspeech.readthedocs.io/en/v0.7.4/
   :alt: Documentation


DeepSpeech is an open source Speech-To-Text engine, using a model trained by machine learning techniques based on `Baidu's Deep Speech research paper <https://arxiv.org/abs/1412.5567>`_. Project DeepSpeech uses Google's `TensorFlow <https://www.tensorflow.org/>`_ to make the implementation easier.

Documentation for installation, usage, and training models is available on `deepspeech.readthedocs.io <http://deepspeech.readthedocs.io/?badge=latest>`_.

For the Quran Workflow, dataset and model release, see the folder `data/quran <https://github.com/tarekeldeeb/DeepSpeech-Quran/tree/master/data/quran>`_

Reproducing with Google Colab
-----------------------------
Thanks to `Omar Asif <https://github.com/omerasif57>`_ , a nice `ipynb <https://colab.research.google.com/drive/1HO57B7ZA4-vn5bm-vL1zRnmuFV99g_n4?usp=sharing>`_ is shared on colab. Feel free to tune, reproduce our work and reshare. 

Results
=======
As the `workflow <https://github.com/tarekeldeeb/DeepSpeech-Quran/tree/master/data/quran#workflow>`_ clarifies, the engine is created in two steps:

* Step-1: Imam Only dataset : WER: 0.056551, CER: 0.039540, loss: 24.844383
* Step-2: Imam + Filtered Users dataset : WER: 0.099118, CER: 0.065586, loss: 39.312599

Quick User Demo
===============
.. image:: http://img.youtube.com/vi/RlfIkoV3hMg/0.jpg
   :target: http://www.youtube.com/watch?v=RlfIkoV3hMg
