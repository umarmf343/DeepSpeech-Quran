#!/usr/bin/env python
#https://gist.github.com/alsrgv/1a83c7953cb04676f6a0b3ec3917a18c

from __future__ import print_function

import os
import sys
import tensorflow as tf
from google.protobuf import text_format
from tensorflow.python.framework import graph_io

if len(sys.argv) < 2:
    print('Usage: %s <filename prefix>' % sys.argv[0])
    sys.exit(-1)

filename = sys.argv[1]
with open(filename + '.pbtxt', 'r') as f:
  graph_def = tf.GraphDef()
  file_content = f.read()
  text_format.Merge(file_content, graph_def)
  graph_io.write_graph(graph_def,
          os.path.dirname(filename),
          os.path.basename(filename) + '.pb',
          as_text=False)

print('Converted %s.pbtxt to %s.pb' % (filename, filename))

