FROM vanbujm/moonbase-balena:v0.1.0
RUN sudo apt-get install git
RUN sudo apt-get install ssh
RUN sudo apt-get install tar
RUN sudo apt-get install gzip
RUN sudo apt-get install ca-certificates
LABEL com.circleci.preserve-entrypoint=true
ENV QEMU_EXECVE=1
ENTRYPOINT ["/usr/bin/qemu-arm-static", "/bin/bash", "-c"]
