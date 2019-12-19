#!/usr/bin/env python

'''
    NAME    : Quran Tarteel Users Dataset
    URL     : Audio: https://www.tarteel.io/dataset
            : Text:  http://tanzil.net
    HOURS   : TBD
    TYPE    : Recitation - Arabic
    AUTHORS : Others
'''

import errno
import os
from os import path
import sys,glob
import tarfile
import fnmatch
import pandas as pd
import subprocess
import wget
import re
import zipfile
import sox
import argparse
import csv
from tempfile import NamedTemporaryFile
import shutil

def clean(word):
    # LC ALL & strip punctuation which are not required
    new = word.lower().replace('.', '')
    new = new.replace(',', '')
    new = new.replace(';', '')
    new = new.replace('"', '')
    new = new.replace('!', '')
    new = new.replace('?', '')
    new = new.replace(':', '')
    new = new.replace('-', '')
    return new

def _download_audio(location):
    # Download Ayat data for different recitors (Husary,Afasy,Sowaid, .. etc)
    datapath  = location
    target    = path.join(datapath, "quran_tusers")
    targetwav = path.join(target,'wav')
    if os.path.exists(targetwav) and len(os.listdir(targetwav)) >= (24900):
        print("Seems you have downloaded all wav files before .. skipping.")
        return
    elif not os.path.exists(targetwav):
        os.makedirs(targetwav)
    WEBFILE='https://d2sf46268wowyo.cloudfront.net/datasets/tarteel_v1.0.csv'
    LOCFILE='tusers.csv'
    TUSERS_CSV=path.join(target,LOCFILE)
    if not os.path.exists(TUSERS_CSV):
        wget.download(WEBFILE, TUSERS_CSV, bar=None)
    tfm=sox.Transformer()
    tfm.convert(samplerate=16000,n_channels=1,bitdepth=16)
    with open(TUSERS_CSV) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print(f'Column names are: {", ".join(row)}')
            else:
                lfile='%03d%03d_TUsers%d_64kbps.wav'%(int(row[0]),int(row[1]),line_count)
                link_file = path.join(target,lfile)
                wav16_file= path.join(targetwav,lfile)
                if not os.path.exists(link_file):
                    wget.download(row[2], link_file)
                    tfm.build(link_file, wav16_file)
            line_count += 1

def _eval_audio(location):
    datapath = location
    target = path.join(datapath, "quran_tusers")
    targetwav = path.join(target,'wav')
    
    tusers = path.join(target, "tusers_test.csv")
    tempfile = NamedTemporaryFile(delete=False, mode="w", newline="")
    
    with open(tusers, 'r') as csvFile, tempfile:
        reader = csv.reader(csvFile, delimiter=',', quotechar='"')
        writer = csv.writer(tempfile, delimiter=',', quotechar='"')
        for row in reader:
            wrow = row
            if wrow[9] == "FALSE":
                #TBD
                wrow[9] = "True" 
                wrow.append(0.765)
            writer.writerow(wrow)

    shutil.move(tempfile.name, tusers)

def _preprocess_data(location, amount):
    datapath = location
    target = path.join(datapath, "quran")
    targetwav = path.join(target,'wav')

    # Assume data is downloaded from Tanzil.net
    # Uthmani with pause marks and different tanween shapes
    # Text with aya numbers
   
    print("\nPreprocessing Complete")
    print("Building CSVs")

    #Build a Quran Dictionary (aya + 1000*sura)
    qurDict = {}
    
    # Lists to build CSV files
    train_list_wavs, train_list_trans, train_list_size = [], [], []
    test_list_wavs, test_list_trans, test_list_size = [], [], []
    dev_list_wavs, dev_list_trans, dev_list_size = [], [], []

    # Setting CSV Amount Threasholds
    amount_thr={
        '100p': 9999999,
        '70p':   799000,
        '30p':   260000,
        '5sec':  160000
    }
    with open(path.join(location, "quran/quran-uthmani.txt"), "r") as f:
        for line in f:
            tokens = line.strip().split('|')
            if(len(tokens) == 3):
                _su = int(tokens[0])
                _ay = int(tokens[1])
                if _ay==1 and _su>1 and _su!=9: #Remove extra Basmala
                    qurDict[str(_ay + _su*1000)] = tokens[2].split(' ',4)[4]
                else:
                    qurDict[str(_ay + _su*1000)] = tokens[2]
    for root, dirnames, filenames in os.walk(targetwav):
        for filename in fnmatch.filter(filenames, "*.wav"):
            full_wav = os.path.join(root, filename)
            wav_filesize = path.getsize(full_wav)
            if wav_filesize>amount_thr[amount]:
                continue
            sura_num = int(filename[:3])
            aya_num  = int(filename[3:6])
            trans = qurDict[str(aya_num + sura_num*1000)]
            if aya_num%10 > 1:
                train_list_wavs.append(full_wav)
                train_list_trans.append(trans)
                train_list_size.append(wav_filesize)
            elif aya_num%10 > 0:
                dev_list_wavs.append(full_wav)
                dev_list_trans.append(trans)
                dev_list_size.append(wav_filesize)
            else:
                test_list_wavs.append(full_wav)
                test_list_trans.append(trans)
                test_list_size.append(wav_filesize)

    a = {'wav_filename': train_list_wavs,
         'wav_filesize': train_list_size,
         'transcript': train_list_trans
         }
    b = {'wav_filename': dev_list_wavs,
         'wav_filesize': dev_list_size,
         'transcript': dev_list_trans
         }
    c = {'wav_filename': test_list_wavs,
         'wav_filesize': test_list_size,
         'transcript': test_list_trans
         }

    all = {'wav_filename': train_list_wavs + dev_list_wavs + test_list_wavs,
          'wav_filesize': train_list_size + dev_list_size + test_list_size,
          'transcript': train_list_trans + dev_list_trans + test_list_trans
          }

    df_all = pd.DataFrame(all, columns=['wav_filename', 'wav_filesize', 'transcript'], dtype=int)
    df_train = pd.DataFrame(a, columns=['wav_filename', 'wav_filesize', 'transcript'], dtype=int)
    df_dev = pd.DataFrame(b, columns=['wav_filename', 'wav_filesize', 'transcript'], dtype=int)
    df_test = pd.DataFrame(c, columns=['wav_filename', 'wav_filesize', 'transcript'], dtype=int)

    df_all.to_csv(target+"/quran_all.csv", sep=',', header=True, TUSERS_CSV=False)
    df_train.to_csv(target+"/quran_train.csv", sep=',', header=True, TUSERS_CSV=False)
    df_dev.to_csv(target+"/quran_dev.csv", sep=',', header=True, TUSERS_CSV=False)
    df_test.to_csv(target+"/quran_test.csv", sep=',', header=True, TUSERS_CSV=False)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("location", help="Directory to import to, usually 'data/'")
    args = parser.parse_args()
    _download_audio(args.location)
    _eval_audio(args.location)
    #_preprocess_data(args.location, args.csv_amount)
    print("Completed")
