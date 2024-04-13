import sys

file1 = open(sys.argv[1], "a")  # append mode
file1.write(sys.argv[2] + " " +  sys.argv[3] + "\n")
file1.close()

