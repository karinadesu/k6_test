FROM debian:latest
RUN dd if=/dev/urandom of=./filetest status=progress bs=1G count=5 iflag=fullblock