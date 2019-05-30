FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN sudo apt-get install ssh
CMD ["/bin/bash", "start.sh"]
