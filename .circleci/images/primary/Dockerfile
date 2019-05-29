FROM vanbujm/moonbase-balena:v0.1.0
RUN [ "cross-build-start" ]
RUN sudo apt-get install git
RUN sudo apt-get install ssh
RUN sudo apt-get install tar
RUN sudo apt-get install gzip
RUN sudo apt-get install ca-certificates
RUN sudo apt-get install file
RUN yarn global add codecov
LABEL com.circleci.preserve-entrypoint=true
ENV QEMU_EXECVE=1
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1
RUN [ "cross-build-end" ]
ENTRYPOINT ["/usr/bin/qemu-arm-static", "/bin/bash"]
