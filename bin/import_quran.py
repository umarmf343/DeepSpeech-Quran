#!/usr/bin/env python

'''
    NAME    : Quran Dataset
    URL     : Audio: http://quran.ksu.edu.sa/ayat/?pg=patches 
            : Text:  http://tanzil.net
    HOURS   : TBD
    TYPE    : Recitation - Arabic
    AUTHORS : Husary and others
'''

import errno
import os
from os import path
import sys
import tarfile
import fnmatch
import pandas as pd
import subprocess
import wget
import re
import zipfile
 
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

def _download_audio(args):
    # Download Ayat data for Husary
    datapath = args
    target = path.join(datapath, "quran")
    if len(os.listdir(path.join(target,'wav'))) >= 6236:
        print("Seems you have downloaded all wav files before .. skipping.")
        return
    WEBFILE='http://quran.ksu.edu.sa/ayat/?pg=patches'
    WEBBASE=re.sub("\?.*$","",WEBFILE)
    RECITOR='Husary_64kbps'
    LOCFILE='index.html'
    INDEX=path.join(target,LOCFILE)
    LINKS='husary.links'
    wget.download(WEBFILE, INDEX)
    Ayt_links=[]
    searchLinks = re.compile("download/"+RECITOR+"/"+RECITOR+".*.ayt")
    for line in open(INDEX, 'r'):
        slink = re.search(searchLinks, line)
        if slink:
            Ayt_links.append(slink.group(0))
    os.remove(INDEX)
    for i in range(len(Ayt_links)):
        print("\nDownloading file {} of {}".format(i + 1, len(Ayt_links)))
        lfile = re.sub("^.*/","",Ayt_links[i])
        link_file= path.join(target,lfile)
        wget.download(WEBBASE+Ayt_links[i], link_file)
        with zipfile.ZipFile(link_file, "r") as zip_ref:
            zip_ref.extractall(target)
        os.remove(link_file)
    os.rename(target+'/audio/'+RECITOR, target+'/wav')
    os.remove(target+'/audio/')

def _preprocess_data(args):
    datapath = args
    target = path.join(datapath, "quran")

    # Assume data is downloaded from Tanzil.net # Uthmani with pause marks and different tanween shapes # Text with aya numbers

   

    print("Preprocessing Complete")
    print("Building CSVs")

    #Build a Quran Dictionary (aya + 1000*sura)
    qurDict = {}
    
    # Lists to build CSV files
    train_list_wavs, train_list_trans, train_list_size = [], [], []
    test_list_wavs, test_list_trans, test_list_size = [], [], []
    dev_list_wavs, dev_list_trans, dev_list_size = [], [], []

    with open(path.join(args, "quran/quran-uthmani.txt"), "r") as f:
        for line in f:
            tokens = line.strip().split('|')
            if(len(tokens) == 3):
                _su = int(tokens[0])
                _ay = int(tokens[1])
                if _ay==1 and _su>1 and _su!=9: #Remove extra Basmala 
                    qurDict[str(_ay + _su*1000)] = tokens[2].split(' ',4)[4]
                else:
                    qurDict[str(_ay + _su*1000)] = tokens[2]

    for root, dirnames, filenames in os.walk(target):
        for filename in fnmatch.filter(filenames, "*.wav"):
            full_wav = os.path.join(root, filename)
            wav_filesize = path.getsize(full_wav)
            if wav_filesize>192000: #<--(<=5sec) 102400(5 samples): #262144(70%): #1048576(30%):
                continue
            sura_num = int(filename[:-7])
            aya_num  = int(filename[3:-4])
            # need to remove _rif.wav (8chars) then add .TXT
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

    df_all.to_csv(target+"/quran_all.csv", sep=',', header=True, index=False)
    df_train.to_csv(target+"/quran_train.csv", sep=',', header=True, index=False)
    df_dev.to_csv(target+"/quran_dev.csv", sep=',', header=True, index=False)
    df_test.to_csv(target+"/quran_test.csv", sep=',', header=True, index=False)

if __name__ == "__main__":
    _download_audio(sys.argv[1])
    _preprocess_data(sys.argv[1])
    print("Completed")
