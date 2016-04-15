#!/usr/bin/env python2.7
s = [item.rstrip('') for item in open('input.txt','r').readlines()]
text_file = open('user_out.txt', 'w')
for t in s:
	text_file.write(str(int(t)*2) + '\n')
text_file.close()

